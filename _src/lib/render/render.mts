import { extname, basename } from "path";
import { Result, Wrapper } from "#lib/types";
import { readFile } from "fs/promises";
import { Console, NewPromise, dynamicImport, NodeModules } from "@fewu-swg/fewu-utils";
import EventEmitter from "events";
import { AbstractRenderer, BasicContext as Context } from '@fewu-swg/abstract-types';

export declare interface Processor {
    type: RegExp;

    render(template: string, templatePath?: string, variables?: object): Promise<string>;

    renderFile(templatePath: string, variables?: object): Promise<string>;
}

interface _Renderer {
    on(event: 'beforeRender', fn: (wrapper: Wrapper<string>, ...args: any[]) => void): this;
    on(event: 'afterRender', fn: (wrapper: Wrapper<string>, ...args: any[]) => void): this;
}

class _Renderer extends EventEmitter {

    availableRenderers: AbstractRenderer[] = [
    ];

    #initialized = new Promise<void>(() => { });
    #initialized_old = new Promise<void>(() => { });

    constructor(ctx: Context) {
        super();
        let { promise, resolve } = NewPromise.withResolvers<void>();
        this.#initialized = promise;
        ctx.on('afterStartup', (_ctx: Context) => {
            this.availableRenderers.push(..._ctx.extend.append_renderers);
            resolve();
        });
        this.#init(ctx);
    }

    async #init(ctx: Context) {
        let { promise, resolve } = NewPromise.withResolvers<void>();
        this.#initialized_old = promise;
        let all_modules = await NodeModules.getAllModules();
        let renderer_modules_list = all_modules.filter(v => basename(v).startsWith('fewu-renderer'));
        let renderers = (await Promise.all(renderer_modules_list.map(async v => new ((await dynamicImport(v) as { renderer: any })?.renderer) as AbstractRenderer))); // idk why node does not allow import("@**/*"), or host-path is required?
        renderers = renderers.filter(v => v).filter(v => v.__fewu__ === 'renderer');
        this.availableRenderers.push(...renderers);

        Console.info({
            msg: 'Available renderers:',
            color: 'GREEN'
        }, this.availableRenderers.map(v => v.toString()));

        resolve();
    }

    isTypeSupported(type: string): Result<AbstractRenderer | null> {
        for (let render of this.availableRenderers) {
            if (render.type.test(type)) {
                return {
                    status: 'Ok',
                    value: render
                }
            }
        }
        return {
            status: 'Err',
            value: null
        }
    }

    async render(content: string, templatePath: string, variables?: object): Promise<string> {
        await this.#initialized;
        await this.#initialized_old;
        let ext = extname(templatePath), matchedRenderer: AbstractRenderer | undefined;
        for (let renderer of this.availableRenderers) {
            if (renderer.type.test(ext)) {
                matchedRenderer = renderer;
            }
        }
        if (!matchedRenderer) {
            Console.may.error(`Some content requires a renderer that has not been supported: ${templatePath} requires ${ext}.`);
            return content;
        } else {
            Console.may.info({ msg: `Render ${templatePath} using matcher: ${matchedRenderer.type}`, color: 'DARKGREY' });
        }

        let contentWrapper: Wrapper<string> = {
            value: content
        };

        let resultWrapper: Wrapper<string> = {
            value: ''
        };

        this.emit('beforeRender', contentWrapper);

        resultWrapper.value = await matchedRenderer.render(contentWrapper.value, templatePath, variables ?? {});

        this.emit('afterRender', resultWrapper);

        return resultWrapper.value;
    }

    async renderFile(templatePath: string, variables?: object): Promise<string> {
        await this.#initialized;
        await this.#initialized_old;
        let buffer = await readFile(templatePath);
        let content = buffer.toString();
        return this.render(content, templatePath, variables);
    }
}

export {
    _Renderer as RendererConstructor
}