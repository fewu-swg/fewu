import { Pagable } from "#lib/types";
import { __Deployer, BasicContext, FileBinding, Result, Deployer, Page } from "@fewu-swg/abstract-types";
import { basename, extname, join, relative } from "node:path";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import defaultPages from "./page/defaultPage.mjs";
import ExtendedFS from "#util/ExtendedFS";
import { getHelpers } from "#lib/interface/helper";
import { Console } from "@fewu-swg/fewu-utils";

export default class PageDeployer implements __Deployer {
    __fewu__: string = 'deployer';
    type: RegExp;
    #ctx: BasicContext;
    #pages: Pagable[] = [];

    constructor(ctx: BasicContext) {
        this.#ctx = ctx;
        this.#pages.push(...defaultPages, ...ctx.extend.append_pages);
        this.type = new RegExp(`(${this.#pages.map(v => `(${v.type})`).join('|')})\..*?$`);
    }

    async #deploySingle(ctx: BasicContext, pagable: Pagable, path: string): Promise<Result> {
        let targets = pagable.get(ctx);
        let tasks: Promise<Result>[] = [];
        for (let i = 0; i < targets.length; i++) {
            const target = targets[i];
            const page: Page = {
                language: ctx.config.language,
                current: i,
                total: targets.length,
                path: target,
                relative_path: relative(ctx.PUBLIC_DIRECTORY, target),
                source: path,
                full_source: path
            };
            let task = (async (): Promise<Result> => {
                let content = (await readFile(path)).toString();
                let file_binding: FileBinding = {
                    source: {
                        path,
                        content,
                        stat: await stat(path)
                    },
                    target: {
                        path: target,
                        content: ''
                    }
                };
                await ctx.Deployer.emit('startTask', ctx, file_binding);
                await ctx.Deployer.emit('render', ctx, file_binding);
                const result = await ctx.Renderer.render(file_binding, {
                    site: ctx.data,
                    page,
                    ctx,
                    ...getHelpers(ctx, page as Page)
                });
                await ctx.Deployer.emit('afterRender', ctx, file_binding);
                if (result.status === 'Err') {
                    await ExtendedFS.ensure(target);
                    await writeFile(target, `Error while generating this page!`);
                    await ctx.Deployer.emit('finishTask', ctx, file_binding);
                    return result;
                }
                try {
                    await ctx.Deployer.emit('deploy', ctx, file_binding);
                    await ExtendedFS.ensure(target);
                    await writeFile(target, file_binding.target.content);
                    await ctx.Deployer.emit('afterDeploy', ctx, file_binding);
                    await ctx.Deployer.emit('finishTask', ctx, file_binding);
                    Console.may.info({
                        msg: 'Deploy success',
                        color: 'LIGHTGREEN'
                    }, {
                        msg: target,
                        color: 'LIGHTGREY'
                    });
                    return {
                        status: 'Ok',
                        value: ``
                    }
                } catch (e) {
                    return {
                        status: 'Err',
                        value: e as Error
                    }
                }
            })();
            tasks.push(task);
        }
        await Promise.all(tasks);
        return {
            status: 'Ok',
            value: targets.join()
        };
    }

    async assignTask(file_binding: FileBinding, provides: any): Promise<Result> {
        let path = relative(this.#ctx.THEME_DIRECTORY, file_binding.source.path!);
        if (!this.type.test(path)) {
            return {
                status: 'Err',
                value: new Error(`Invalid FileBinding input`)
            }
        }
        let typename = this.type.exec(path)!.groups![0];
        let pagable = this.#pages.filter(v => v.type == typename);
        return {
            status: 'Err',
            value: Error(`Method not implemented.`)
        };
    }

    async deployAll(ctx: BasicContext): Promise<Result> {
        const layoutDir = join(ctx.THEME_DIRECTORY, 'layout');
        let files = (await readdir(layoutDir)).map(v => join(layoutDir, v));

        Console.log(`Deploying all pages`);

        let tasks: Promise<Result>[] = [];
        let validPages = this.#pages;
        for (const file of files) {
            let filename = basename(file, extname(file));
            if (!await ExtendedFS.isDir(file)) {
                for (let pagable of validPages) {
                    if (pagable.type === filename) {
                        let task = this.#deploySingle(ctx, pagable, file);
                        tasks.push(task);
                        break;
                    }
                }
            }
        }
        let settledResults = await Promise.allSettled(tasks);
        for (let settledResult of settledResults) {
            if (settledResult.status === 'rejected') {
                return {
                    status: 'Err',
                    value: Error(`Promise Error!`)
                }
            }
            if (settledResult.value.status === 'Err') {
                return settledResult.value;
            }
        }
        return {
            status: 'Ok',
            value: ``
        }
    }
}

// class PageDeployer implements Deployable {
//     deployer: Deployer;

//     constructor(_ctx: Context) {
//         this.deployer = _ctx.extend.Deployer;
//     }

//     async #deploySingle(ctx: Context, pagable: Pagable, path: string): Promise<Result<void>> {
//         let targets = pagable.get(ctx);
//         let tasks: Promise<Result<void>>[] = [];
//         for (let i = 0; i < targets.length; i++) {
//             const target = targets[i];
//             const page: Page = {
//                 language: ctx.config.language,
//                 current: i,
//                 total: targets.length,
//                 path: target,
//                 relative_path: relative(ctx.PUBLIC_DIRECTORY, target),
//                 source: path,
//                 full_source: path
//             };
//             let task = (async (): Promise<Result<void>> => {
//                 const result = await ctx.extend.Renderer.renderFile(path, {
//                     site: ctx.data,
//                     page,
//                     ctx,
//                     ...getHelpers(ctx, page as Page)
//                 });
//                 try {
//                     await ExtendedFS.ensure(target);
//                     await this.deployer.writeFile(target, result);
//                     Console.may.info({
//                         msg: 'Deploy success',
//                         color: 'LIGHTGREEN'
//                     }, {
//                         msg: target,
//                         color: 'LIGHTGREY'
//                     });
//                     return {
//                         status: 'Ok'
//                     }
//                 } catch (e) {
//                     console.error(e);
//                     return {
//                         status: 'Err'
//                     }
//                 }
//             })();
//             tasks.push(task);
//         }
//         await Promise.all(tasks);
//         return {
//             status: 'Ok'
//         };
//     }

//     async deploy(ctx: Context): Promise<Result<void>> {
//         const layoutDir = join(ctx.THEME_DIRECTORY, 'layout');
//         let files = (await readdir(layoutDir)).map(v => join(layoutDir, v));

//         let tasks: Promise<Result<void>>[] = [];
//         let validPages = [...defaultPages, ...ctx.extend.append_pages];
//         for (const file of files) {
//             let filename = basename(file, extname(file));
//             if (!await ExtendedFS.isDir(file)) {
//                 for (let pagable of validPages) {
//                     if (pagable.type === filename) {
//                         let task = this.#deploySingle(ctx, pagable, file);
//                         tasks.push(task);
//                         break;
//                     }
//                 }
//             }
//         }
//         let settledResults = await Promise.allSettled(tasks);
//         for (let settledResult of settledResults) {
//             if (settledResult.status === 'rejected') {
//                 return {
//                     status: 'Err'
//                 }
//             }
//         }
//         return {
//             status: 'Ok'
//         }
//     }

//     async deployWatch(ctx: Context, path: string): Promise<any> {
//         try {
//             let _fullpath = join(ctx.THEME_DIRECTORY, path);
//             if (!existsSync(_fullpath)) {
//                 return;
//             }
//             if (dirname(path) === 'layout') {
//                 let validPages = [...defaultPages, ...ctx.extend.append_pages];
//                 let filename = basename(path, extname(path));

//                 for (let pagable of validPages) {
//                     if (pagable.type === filename) {
//                         Console.log(`Rerendering page: ${filename}.`);
//                         await this.#deploySingle(ctx, pagable, _fullpath);
//                         break;
//                     }
//                 }
//             }
//         } catch (e) {
//             console.error(e);
//         }
//     }

// }

// export default PageDeployer;