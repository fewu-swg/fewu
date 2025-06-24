import Server from "./server-plugin/server.mjs";
import { Argv, Console } from "@fewu-swg/fewu-utils";
import type { BasicContext, Plugin } from "@fewu-swg/abstract-types";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { watch } from "node:fs";

let timer: NodeJS.Timeout;

function registerWatchTask(ctx: BasicContext, { includeSource = false } = {}) {
    timer && clearInterval(timer);
    // debounce
    timer = setInterval(async () => {
        if (includeSource) {
            await ctx.emit('beforeProcess', ctx);

            await ctx.emit('$$Process', ctx);

            await ctx.emit('afterProcess', ctx);
        }

        await ctx.emit('beforeDeploy', ctx);

        await ctx.emit('$$Deploy', ctx);

        await ctx.emit('afterDeploy', ctx);
    }, 1500);
}

export default class _ServerPlugin implements Plugin {
    __fewu_plugin_id: string = 'builtin.extend.server';
    __fewu_is_plugin: boolean = true;
    __fewu_plugin_name = 'Builtin<Extend::Server>';

    exports = {
        parsers: [],
        renderers: [],
        deployers: []
    };

    constructor(_: BasicContext) {
        if (Argv['-s'] || Argv['--server']) {
            // @ts-ignore
            _.PUBLIC_DIRECTORY = join(tmpdir(), 'io.fewu-swg.fewu', 'live-server');
        }
    }

    assigner(ctx: BasicContext) {
        if (Argv['-s'] || Argv['--server']) {
            const server = new Server();
            if (Argv['-S'] || Argv['--server']) {
                ctx.on('ready', async (_ctx) => {
                    server.create(_ctx).listen(parseInt(Argv['-S']?.[0] || Argv['--server']?.[0]) || 3000);
                    try {
                        watch(ctx.SOURCE_DIRECTORY, { recursive: true }, (event) => {
                            registerWatchTask(ctx, { includeSource: true });
                        });
                        watch(ctx.THEME_DIRECTORY, { recursive: true }, (event) => {
                            registerWatchTask(ctx);
                        });
                    } catch (error) {
                        console.error(error);
                        Console.error(`Your current system does not support Node.js fs.watch (recursively) feature. Live-change will not work.`);
                    }
                });
            }
        }
    }
}