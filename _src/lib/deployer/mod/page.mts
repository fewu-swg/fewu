import { Pagable, Result } from "#lib/types";
import Deployer, { Deployable } from "../deployer.mjs";
import defaultPages from "./page/defaultPage.mjs";
import { getHelpers } from "#lib/interface/helper";
import ExtendedFS from "#util/ExtendedFS";
import { Console } from "@fewu-swg/fewu-utils";
import { BasicContext as Context, Page } from "@fewu-swg/abstract-types";
import { existsSync } from "fs";
import { readdir } from "fs/promises";
import { basename, dirname, extname, join, relative } from "path";

class PageDeployer implements Deployable {
    deployer: Deployer;

    constructor(_ctx: Context) {
        this.deployer = _ctx.extend.Deployer;
    }

    async #deploySingle(ctx: Context, pagable: Pagable, path: string): Promise<Result<void>> {
        let targets = pagable.get(ctx);
        let tasks: Promise<Result<void>>[] = [];
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
            let task = (async (): Promise<Result<void>> => {
                const result = await ctx.extend.Renderer.renderFile(path, {
                    site: ctx.data,
                    page,
                    ctx,
                    ...getHelpers(ctx, page as Page)
                });
                try {
                    await ExtendedFS.ensure(target);
                    await this.deployer.writeFile(target, result);
                    Console.may.info({
                        msg: 'Deploy success',
                        color: 'LIGHTGREEN'
                    }, {
                        msg: target,
                        color: 'LIGHTGREY'
                    });
                    return {
                        status: 'Ok'
                    }
                } catch (e) {
                    console.error(e);
                    return {
                        status: 'Err'
                    }
                }
            })();
            tasks.push(task);
        }
        await Promise.all(tasks);
        return {
            status: 'Ok'
        };
    }

    async deploy(ctx: Context): Promise<Result<void>> {
        const layoutDir = join(ctx.THEME_DIRECTORY, 'layout');
        let files = (await readdir(layoutDir)).map(v => join(layoutDir, v));

        let tasks: Promise<Result<void>>[] = [];
        let validPages = [...defaultPages, ...ctx.extend.append_pages];
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
        for(let settledResult of settledResults){
            if(settledResult.status === 'rejected'){
                return {
                    status: 'Err'
                }
            }
        }
        return {
            status: 'Ok'
        }
    }

    async deployWatch(ctx: Context, path: string): Promise<any> {
        try {
            let _fullpath = join(ctx.THEME_DIRECTORY, path);
            if (!existsSync(_fullpath)) {
                return;
            }
            if (dirname(path) === 'layout') {
                let validPages = [...defaultPages, ...ctx.extend.append_pages];
                let filename = basename(path, extname(path));

                for (let pagable of validPages) {
                    if (pagable.type === filename) {
                        Console.log(`Rerendering page: ${filename}.`);
                        await this.#deploySingle(ctx, pagable, _fullpath);
                        break;
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

}

export default PageDeployer;