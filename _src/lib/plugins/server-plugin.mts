import Server from "./server-plugin/server.mjs";
import { Argv, Console } from "@fewu-swg/fewu-utils";
import type { BasicContext, Plugin } from "@fewu-swg/abstract-types";
import { join } from "node:path";
import { tmpdir } from "node:os";

let watchTasks: Record<string, { ctx: BasicContext, path: string, from: string }> = {};
let timer: NodeJS.Timeout;

function registerWatchTask(ctx: BasicContext, path: string, from: string) {
    watchTasks[join(from, path)] = {
        ctx, path, from
    };
    timer && clearInterval(timer);
    // debounce
    timer = setInterval(() => {
        for (let [_, { ctx, path, from }] of Object.entries(watchTasks)) {
            ctx.extend.Deployer.runWatch(ctx, path, from);
        }
        watchTasks = {};
    }, 500);
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
            _.PUBLIC_DIRECTORY = join(tmpdir(),'io.fewu-swg.fewu','live-server');
        }
    }

    assigner(ctx: BasicContext){
        if (Argv['-s'] || Argv['--server']) {
            const server = new Server();
            if (Argv['-S'] || Argv['--server']) {
                ctx.on('afterDeploy', async (_ctx) => {
                    server.create(_ctx).listen(parseInt(Argv['-S']?.[0] || Argv['--server']?.[0]) || 3000);
                    try {
                        await _ctx.extend.Theme.watch(_ctx, (_ctx: BasicContext, _: string, path: string, from: string) => {
                            // _ctx.Deployer.runWatch(_ctx, path, from);
                            registerWatchTask(_ctx, path, from);
                        });
                        await _ctx.extend.Source.watch(_ctx, (_ctx: BasicContext, _: string, path: string, from: string) => {
                            // _ctx.Deployer.runWatch(_ctx, path, from);
                            registerWatchTask(_ctx, path, from);
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