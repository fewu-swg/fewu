// import Context from "#lib/fewu/context";
import { Post, Scaffold } from "#lib/types";
import { BasicContext as Context, FileBinding, UPath } from "@fewu-swg/abstract-types";
import { resolveContent } from "#lib/local/mod/post"

import ExtendedFS from "#util/ExtendedFS";

import { readFile, stat } from "fs/promises";
import { extname, join, relative, sep } from "path";;
import moment from "moment";
import { watch, WatchEventType } from "fs";
import { Console, Text } from "@fewu-swg/fewu-utils";

const ignoredFileTypes = [
    '.png', '.gif', '.webp', '.bmp', '.svg', /^\.pptx?$/, /^\.jpe?g?$/, /^\..*?ignore$/, /\.ignore\..*$/
];

function isIgnoredFileType(type: string) {
    for (let tester of ignoredFileTypes) {
        if (typeof tester === 'string') {
            if (type === tester)
                return true;
        }
        else if (tester.test(type)) {
            return true;
        }
    }
}

declare type SourceTypes = 'draft' | 'post' | 'scaffold';

export default class Source {

    static async traverse(ctx: Context, type: SourceTypes, excluded: string[]): Promise<string[]> {
        Console.log(`Reading ${type} with blacklist: [${excluded.join(',')}]`);
        const path = join(ctx.SOURCE_DIRECTORY, type + 's');
        let files = await ExtendedFS.traverse(path, {
            includeDirectory: false
        });
        files = files.filter(value => {
            let absoluteIncluded = excluded.includes(value);
            let relativeIncluded = excluded.includes(relative(ctx.SOURCE_DIRECTORY, value));
            let isIgnored = isIgnoredFileType(extname(value));
            return !absoluteIncluded && !relativeIncluded && !isIgnored;
        });
        return files;
    }

    static async read(ctx: Context, type: 'post' | 'draft', path: string): Promise<Post>;
    static async read(ctx: Context, type: 'scaffold', path: string): Promise<Scaffold>;

    static async read(ctx: Context, type: SourceTypes, path: string) {
        let content = (await readFile(path)).toString();
        if (type === 'post' || type === 'draft') {
            return this.#readPost(ctx, new UPath(path, sep), content);
        } else if (type === 'scaffold') {
            return {
                content
            };
        }
    }

    static async #readPost(ctx: Context, path: UPath, content: string): Promise<Post> {
        let fileStat = await stat(path.toString());
        let resolved = await resolveContent(content);
        let post: Partial<Post> = {};
        let categoryProp = resolved.properties.categories ?? resolved.properties.category;
        let tagProp = resolved.properties.tags ?? resolved.properties.tag;
        post.author = resolved.properties.author as string ?? ctx.config.author;
        post.categories = Array.isArray(categoryProp) ? categoryProp : String(categoryProp).split(" ").filter(v => v !== '');
        post.comments = resolved.properties.comments ? true : false;
        post.date = moment(resolved.properties.date);
        post.full_source = path.toString();
        post.language = resolved.properties.language as string ?? ctx.config.language;
        post.layout = resolved.properties.layout ?? ctx.config.default_layout;
        post.length = Text.countWords(content);
        post.license = resolved.properties.license as string ?? 'default';
        // post.more = resolved.postContent; // deprecated
        post.properties = resolved.properties;
        post.raw = resolved.postContent;
        post.raw_excerpt = resolved.postIntroduction;
        post.source = relative(ctx.SOURCE_DIRECTORY, path.toString()); // 源文件路径
        post.stat = fileStat;
        post.tags = Array.isArray(tagProp) ? tagProp : String(tagProp).split(" ").filter(v => v !== '');
        post.title = resolved.properties.title ?? "Untitled";
        post.relative_path = resolved.properties.permalink || post.source; // 网站路径
        post.updated = moment(fileStat.ctime);
        post.path = join(ctx.PUBLIC_DIRECTORY, resolved.properties.permalink || post.source); // 本地生成的路径
        // new experimental path api definition
        post.source_relative_path = new UPath(relative(ctx.SOURCE_DIRECTORY, path.toString()), sep);
        post.source_absolute_path = path;
        post.build_relative_path = resolved.properties.permalink ? new UPath(resolved.properties.permalink, 'url') : post.source_relative_path;
        post.build_absolute_path = new UPath(join(ctx.PUBLIC_DIRECTORY, post.build_relative_path.toString(sep)), sep);
        post.web_relative_path = resolved.properties.permalink ? new UPath(resolved.properties.permalink, 'url') : post.source_relative_path;
        post.web_absolute_path = new UPath(join(ctx.config.url, post.web_relative_path.toString('url')), 'url');

        post.build_relative_path.sep = sep;
        post.web_relative_path.sep = '/';
        // pre-render content
        let content_binding: FileBinding = {
            source: {
                path: path.toString(),
                content: resolved.postContent
            },
            target: {
                content
            }
        }
        let excerpt_binding: FileBinding = {
            source: {
                path: path.toString(),
                content: resolved.postIntroduction
            },
            target: {
                content
            }
        };
        let content_result = await ctx.Renderer.render(content_binding, { ctx });
        let excerpt_result = await ctx.Renderer.render(excerpt_binding, { ctx });
        if (content_result.status === 'Err') {
            throw content_result.value;
        }
        if (excerpt_result.status === 'Err') {
            throw excerpt_result.value;
        }
        post.content = content_binding.target.content;
        post.excerpt = excerpt_binding.target.content;
        return post as Post;
    }

    static async watch(ctx: Context, callback: (ctx: Context, type: WatchEventType, path: string, from: string) => void): Promise<void> {
        watch(ctx.SOURCE_DIRECTORY, { recursive: true }, (event, filename) => {
            callback(ctx, event, filename as string, ctx.SOURCE_DIRECTORY);
        });
        return;
    }
}