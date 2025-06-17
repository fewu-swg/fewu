import { url, version } from "#lib/fewu/fewu";
import { Plugin, BasicContext } from "@fewu-swg/abstract-types";
import { Console } from "@fewu-swg/fewu-utils";

export default class _log_plugin implements Plugin {
    __fewu_is_plugin = true;
    __fewu_plugin_name: string = 'Builtin<logger>';
    exports = {
        renderers: [],
        parsers: [],
    };
    constructor(_: BasicContext) {

    }
    assigner(_ctx: BasicContext) {
        _ctx.on('startup', () => {
            Console.log({
                color: 'LIGHTGREEN',
                effect: 'BOLD',
                msg: 'Starting up...'
            });
        });

        _ctx.on('afterStartup', () => {
            Console.log({
                color: 'LIGHTGREEN',
                effect: 'BOLD',
                msg: 'Initialization complete.'
            });
            Console.info({
                color: 'MAGENTA',
                effect: 'BOLD',
                msg: `Fewu, version ${version}, ${url}`
            });
        });

        _ctx.on('beforeProcess', () => {
            Console.log({
                color: 'LIGHTBLUE',
                effect: 'BOLD',
                msg: 'START '
            }, {
                color: 'LIGHTGREEN',
                effect: 'BOLD',
                msg: 'PROCESS'
            })
        });

        _ctx.on('afterProcess', () => {
            Console.log({
                color: 'LIGHTYELLOW',
                effect: 'BOLD',
                msg: 'FINISH'
            }, {
                color: 'LIGHTGREEN',
                effect: 'BOLD',
                msg: 'PROCESS'
            })
        });

        _ctx.on('beforeDeploy', () => {
            Console.log({
                color: 'LIGHTBLUE',
                effect: 'BOLD',
                msg: 'START '
            }, {
                color: 'LIGHTGREEN',
                effect: 'BOLD',
                msg: 'DEPLOY'
            })
        });

        _ctx.on('afterDeploy', () => {
            Console.log({
                color: 'LIGHTYELLOW',
                effect: 'BOLD',
                msg: 'FINISH'
            }, {
                color: 'LIGHTGREEN',
                effect: 'BOLD',
                msg: 'DEPLOY'
            })
        });

        _ctx.on('ready', (ctx) => {
            Console.log({
                color: 'LIGHTGREEN',
                effect: 'BOLD',
                msg: `Site is ready in ${ctx.PUBLIC_DIRECTORY}/.`
            });
        });

        _ctx.on('exit', () => {
            Console.log({
                color: 'LIGHTGREEN',
                effect: 'BOLD',
                msg: 'Exiting...'
            })
        });
    }
}