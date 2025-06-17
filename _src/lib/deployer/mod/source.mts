import { Result } from "#lib/types";
import { Deployable } from "../deployer.mjs";
import ExtendedFS from "#util/ExtendedFS";
import processors from "./source/common.mjs";
import { Console, NewPromise } from "@fewu-swg/fewu-utils";
import { BasicContext as Context } from "@fewu-swg/abstract-types";
import { existsSync } from "fs";
import { cp } from "fs/promises";
import { basename, extname, join, relative } from "path";

export declare interface Processor {
    type: RegExp,
    processor: (ctx: Context, path: string) => Promise<void>;
};

class SourceDeployer implements Deployable {
    availableProcessors: Processor[] = [
        ...processors
    ];
    fallbackProcessor: Processor = {
        type: /\..*$/,
        processor: async (ctx, path) => {
            let target = join(ctx.PUBLIC_DIRECTORY, path), origin = join(ctx.THEME_DIRECTORY, 'source', path);
            await ExtendedFS.ensure(target);
            await cp(origin, target);
        }
    };
    #constructComplete: Promise<void> | undefined;
    constructor(ctx: Context) {
        let { promise, resolve } = NewPromise.withResolvers<void>();
        this.#constructComplete = promise;
        // **TODO** wait for newer implements
        // if (Array.isArray(ctx.config.external?.source_deployers)) {
        //     let externalSourceDeployers = ctx.config.external.source_deployers as string[];
        //     (async () => {
        //         await Promise.allSettled(externalSourceDeployers.map(v => (async (v) => {
        //             let module = await dynamicImport(v);
        //             let defaultExport = module.default;
        //             if (!defaultExport) {
        //                 Console.error(new ModuleNotFoundError(v));
        //             } else {
        //                 this.availableProcessors.push(defaultExport as Processor);
        //             }
        //         })(v)));
        //     })().then(resolve);
        // } else {
        //     resolve();
        // }
        resolve();
    }
    async #deploySingle(ctx: Context, file: string) {
        await this.#constructComplete;
        if (basename(file).startsWith('_')) {
            return;
        }
        let _extname = extname(file);
        let processor: Processor["processor"] = this.fallbackProcessor.processor;
        for (let _processor of this.availableProcessors) {
            if (_processor.type.test(_extname)) {
                processor = _processor.processor;
            }
        }
        await processor(ctx, file);
    }
    async deploy(ctx: Context): Promise<Result<string>> {
        let themeSourceDir = join(ctx.THEME_DIRECTORY, 'source');
        try {
            await ExtendedFS.ensure(ctx.PUBLIC_DIRECTORY);
            for (let file of await ExtendedFS.traverse(themeSourceDir)) {
                file = relative(themeSourceDir, file);
                await this.#deploySingle(ctx, file);
            }
            return {
                status: 'Ok',
                value: 'Finish'
            };
        } catch (e: any) {
            console.error(e);
            return {
                status: 'Err',
                value: e?.msg ?? 'Unknown error: '+e
            }
        }
    }
    async deployWatch(ctx: Context, path: string): Promise<any> {
        try {
            let _fullpath = join(ctx.THEME_DIRECTORY, path);
            if (!existsSync(_fullpath)) {
                return;
            }
            if (path.startsWith('source')) {
                let _path = relative('source', path);

                Console.log(`Reprocessing source file: ${path}`);

                await this.#deploySingle(ctx, _path);
            }
        } catch (e) {
            console.error(e);
        }
    }
}

export default SourceDeployer;