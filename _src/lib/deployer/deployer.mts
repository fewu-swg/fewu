import { Console, NewPromise } from "@fewu-swg/fewu-utils";
import { BasicContext, Result, Deployer as DeployerInterface, __Deployer, FileBinding } from "@fewu-swg/abstract-types";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import AsyncEventEmitter from "#util/AsyncEmitter";
import PageDeployer from "./mod/page.mjs";
import PostDeployer from "./mod/post.mjs";
import CommonSourceDeployer from "./mod/source.mjs";
import { statSync } from "node:fs";


export class Deployer extends AsyncEventEmitter implements DeployerInterface {
    availables: __Deployer[] = [];
    fallback: __Deployer;
    #builtins: __Deployer[] = [];
    #ctx: BasicContext;
    #initialized: Promise<void>;

    constructor(ctx: BasicContext) {
        super();
        let { promise, resolve } = NewPromise.withResolvers<void>();
        this.#initialized = promise;
        this.#ctx = ctx;
        this.fallback = new CommonSourceDeployer(ctx);
        ctx.on('afterStartup', (_ctx: BasicContext) => {
            this.#builtins.push(...[
                new PageDeployer(ctx),
                new PostDeployer(ctx)
            ]);
            this.availables.push(..._ctx.extend.append_deployers);
            Console.info({
                msg: 'Available deployers:',
                color: 'GREEN'
            }, this.availables.map(v => v.toString()));
            resolve();
        });
        // @ts-ignore
        ctx.on(`$$Deploy`, async (_ctx: BasicContext) => {
            await this.deployAll(_ctx);
        });
    }

    async getSupported(type: string): Promise<(__Deployer | null)> {
        await this.#initialized;
        for (let renderer of this.availables) {
            if (renderer.type.test(type)) {
                return renderer;
            }
        }
        return null;
    }

    async deploy(file_binding: FileBinding, provides: any): Promise<Result> {
        await this.#initialized;
        let deployer = await this.getSupported(file_binding.source.path!);
        if (!deployer) {
            return {
                status: 'Err',
                value: new Error(`Cannot find suitable renderer`)
            }
        }
        let result = await deployer.assignTask(file_binding, provides);
        return result;
    }

    async deployAll(ctx: BasicContext) {
        Console.log(`Delivering deploy tasks...`);
        let source_dir = join(ctx.THEME_DIRECTORY, `source`)
        let source_files = (await readdir(source_dir, {recursive: true})).filter(v => !(statSync(join(source_dir,v)).isDirectory()));
        let taskStatus = await Promise.allSettled([
            ...this.#builtins.map(v => v.deployAll(ctx)),
            ...source_files.map<Promise<Result>>(path => (async () => {
                let deployer: __Deployer | undefined;
                for (let _deployer of this.availables) {
                    if (_deployer.type.test(path)) {
                        deployer = _deployer;
                        break;
                    }
                }
                if (!deployer) {
                    deployer = this.fallback;
                    Console.log(`Use fallback deployer for ${path}`);
                }

                let binding: FileBinding = {
                    source: {
                        path: join(ctx.THEME_DIRECTORY, `source`, path),
                        content: ``
                    },
                    target: {
                        path: join(ctx.PUBLIC_DIRECTORY, path),
                        content: ``
                    }
                };

                let result = await deployer.assignTask(binding, { ctx });

                return result;
            })())
        ]);
        taskStatus.forEach(v => {
            if (v.status === "rejected") {
                Console.warn(`Received rejected promise while deploying.`, v.reason);
                throw new Error(`Promise rejected!`);
            }
            if (v.value.status === 'Err') {
                Console.log(`Received error while deploying.`, v.value.value.toString());
                throw new Error(`Error! ${v.value.value.toString()}`);
            }
        })
        Console.log(`All deploy tasks are completed.`);
    }
}