import { BasicContext, Result, __Deployer, Page, FileBinding, Deployer } from "@fewu-swg/abstract-types";
import { join, relative } from "node:path";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { getHelpers } from "#lib/interface/helper";
import ExtendedFS from "#util/ExtendedFS";

export default class PostDeployer implements __Deployer {
    __fewu__: string = 'deployer';
    type: RegExp;
    #ctx: BasicContext;

    constructor(ctx: BasicContext) {
        this.#ctx = ctx;
        this.type = new RegExp(`()\..*?$`);
    }

    async #deploySingle(ctx: BasicContext, post: Page): Promise<Result> {
        let reg = new RegExp(`post\.${post.layout}\..*?$`);
        let target_path = join(ctx.PUBLIC_DIRECTORY, post.source, 'index.html');
        let layout_dir = join(ctx.THEME_DIRECTORY, 'layout');
        let layout_file = (await readdir(layout_dir)).filter(v => v.match(reg))[0];
        let layout_path = join(layout_dir, layout_file);
        let layout_content = (await readFile(layout_path)).toString();
        let binding: FileBinding = {
            source: {
                path: layout_path,
                content: layout_content,
                stat: await stat(layout_path)
            },
            target: {
                path: target_path,
                content: ``
            }
        };
        await ctx.Deployer.emit('startTask', ctx, binding);
        await ctx.Deployer.emit('render', ctx, binding);
        let result = await ctx.Renderer.render(binding, {
            page: post,
            site: ctx.data,
            ctx,
            ...getHelpers(ctx, post)
        });
        await ctx.Deployer.emit('afterRender', ctx, binding);
        if (result.status === 'Err') {
            await ExtendedFS.ensure(target_path);
            await writeFile(target_path, `Error generating this page`);
            await ctx.Deployer.emit('finishTask', ctx, binding);
        }
        try {
            await ctx.Deployer.emit('deploy', ctx, binding);
            await ExtendedFS.ensure(binding.target.path!);
            await writeFile(binding.target.path!, binding.target.content);
            await ctx.Deployer.emit('afterDeploy', ctx, binding);
            await ctx.Deployer.emit('finishTask', ctx, binding);

            return {
                status: 'Ok',
                value: ``
            };
        } catch (e) {
            return {
                status: 'Err',
                value: e as Error
            }
        }
    }

    async assignTask(file_binding: FileBinding, provides: any): Promise<Result> {
        let path = relative(this.#ctx.SOURCE_DIRECTORY, file_binding.source.path!);
        if (path.startsWith('..')) {
            return {
                status: 'Err',
                value: new Error(`Invalid FileBinding input`)
            }
        }
        // let pagable = this.#pages.filter(v => v.type == typename);
        return {
            status: 'Err',
            value: Error(`Method not implemented.`)
        };
    }

    async deployAll(ctx: BasicContext): Promise<Result> {
        let tasks: Promise<Result>[] = [];
        for await (let [, post] of Object.entries(ctx.data.sources)) {
            tasks.push(this.#deploySingle(ctx, post));
        }
        let settledResults = await Promise.allSettled(tasks);
        for (let settledResult of settledResults) {
            if (settledResult.status === 'rejected') {
                return {
                    status: 'Err',
                    value: settledResult.reason
                }
            }
            if (settledResult.value.status === 'Err') {
                return settledResult.value
            }
        }
        return {
            status: 'Ok',
            value: ``
        };
    }
}
