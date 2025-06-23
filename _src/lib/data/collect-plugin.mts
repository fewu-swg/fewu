import { PageContainer, Post } from "#lib/types";
import { Source, Theme } from "#lib/local/local";
import { BasicContext as Context, Plugin, Page } from "@fewu-swg/abstract-types";
import { Console } from "@fewu-swg/fewu-utils";

function post_sort(a: Page, b: Page): number {
    return a?.date?.isBefore(b.date)
        ? 1
        : a?.date?.isSame(b.date)
            ? (Number(a.properties?.order ?? 1) > Number(b.properties?.order ?? 1) ? 1 : -1)
            : -1;
}

function store(post: Post, keys: string[], targets: PageContainer[]) {
    for (let key of keys) {
        let found = false;
        for (let target of targets) {
            if (key === target.key) {
                target.values.push(post);
                found = true;
                break;
            }
        }
        if (!found) {
            targets.push({
                key,
                values: [post]
            });
        }
    }
    targets.forEach(v => {
        v.values.sort(post_sort);
    })
}

async function collectData(ctx: Context) {
    ctx.data.categories = [];
    ctx.data.posts = [];
    ctx.data.sources = {};
    ctx.data.tags = [];
    let posts = await Source.traverse(ctx, 'post', ctx.config.excluded_files);
    await Promise.all(posts.map(path => (async () => {
        let post = await Source.read(ctx, 'post', path);
        store(post, post.categories, ctx.data.categories);
        store(post, post.tags, ctx.data.tags);
        ctx.data.posts.push(post);
    })()));
    ctx.data.posts.sort(post_sort);
    ctx.data.posts.forEach((v, i, a) => {
        v.current = i;
        v.total = a.length;
        v.prev = a[i - 1];
        v.next = a[i + 1];
        ctx.data.sources[v.source] = v;
    });
    ctx.data.categories.sort((a, b) => a.key > b.key ? 1 : -1);
    ctx.data.tags.sort((a, b) => a.key > b.key ? 1 : -1);
    await Theme.executePlugins(ctx);
    await Theme.getI18n(ctx);
    Console.info({
        msg: `DATA SUMMARY`,
        color: `GREEN`
    });
    Console.info({
        msg: `Tags`,
        color: `MAGENTA`
    }, ctx.data.tags.map(v => v.key));
    Console.info({
        msg: `Categories`,
        color: `MAGENTA`
    }, ctx.data.categories.map(v => v.key));
}

export default class _core_collect_plugin implements Plugin {
    __fewu_plugin_id: string = 'builtin.core.collector';
    __fewu_is_plugin: boolean = true;
    __fewu_plugin_name: string = `Builtin<Core::Collector>`;
    exports = {
        renderers: [],
        parsers: [],
        deployers: []
    }
    constructor(_: Context) { }

    assigner(ctx: Context): void {
        // @ts-ignore
        ctx.on('$$Process', async (ctx) => {
            await collectData(ctx);
        });
    }
}