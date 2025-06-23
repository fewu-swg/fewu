import { extname } from "path";
import { Console, NewPromise } from "@fewu-swg/fewu-utils";
import { __Renderer, BasicContext, FileBinding, Result, ResultStatus } from '@fewu-swg/abstract-types';
import { Renderer as RendererInterface } from "@fewu-swg/abstract-types";
import AsyncEventEmitter from "#util/AsyncEmitter";

export class Renderer extends AsyncEventEmitter implements RendererInterface {
    availables: __Renderer[] = [];
    #ctx: BasicContext;
    #initialized: Promise<void>;
    #cache: Map<string, __Renderer> = new Map();

    constructor(ctx: BasicContext) {
        super();
        let { promise, resolve } = NewPromise.withResolvers<void>();
        this.#initialized = promise;
        this.#ctx = ctx;
        ctx.on('afterStartup', (_ctx: BasicContext) => {
            this.availables.push(..._ctx.extend.append_renderers);
            Console.info({
                msg: 'Available renderers:',
                color: 'GREEN'
            }, this.availables.map(v => v.toString()));
            resolve();
        });
    }

    async getSupported(type: string): Promise<(__Renderer | null)> {
        if (this.#cache.has(type)) {
            return this.#cache.get(type)!;
        }
        await this.#initialized;
        for (let renderer of this.availables) {
            if (renderer.type.test(type)) {
                this.#cache.set(type, renderer);
                return renderer;
            }
        }
        return null;
    }

    async render(file_binding: FileBinding, provides: any): Promise<Result> {
        await this.#initialized;
        let renderer = await this.getSupported(file_binding.source.type ?? extname(file_binding.source.path!));
        if (!renderer) {
            return {
                status: ResultStatus.Err,
                value: new Error(`Cannot find suitable renderer`)
            }
        }
        let result = await renderer.assignTask(file_binding, provides);
        return result;
    }

    async toRendered(file_binding: FileBinding, provides: any): Promise<Result<FileBinding>> {
        await this.#initialized;
        let cloned_binding = structuredClone(file_binding);
        let result = await this.render(cloned_binding, provides);
        if (result.status === ResultStatus.Err) {
            return ({
                status: ResultStatus.Err,
                value: result.value as Error
            });
        }
        return {
            status: ResultStatus.Ok,
            value: cloned_binding
        }
    }
}