import { BasicContext, Plugin } from "@fewu-swg/abstract-types";
import { Console, dynamicImport, NodeModules } from "@fewu-swg/fewu-utils";

export class PluginResolver {
    ctx: BasicContext;
    constructor(ctx: BasicContext) {
        this.ctx = ctx;
    }

    async resolveAll(current_context: BasicContext = this.ctx) {
        let all_modules_list = await NodeModules.getAllModules();
        let all_plugins_list = this.filterModules(all_modules_list, current_context.config.plugins);
        let imported_plugins = (await Promise.all(
            all_plugins_list.map(async v => {
                let imported = (await dynamicImport<{ default: new (...args: any[]) => Plugin }>(v))!;
                return new imported.default(current_context);
            })
        )).filter(plugin => plugin.__fewu_is_plugin === true);
        current_context.plugins.push(...imported_plugins);
    }

    async loadPlugins(plugin_list: Plugin[], current_context: BasicContext = this.ctx) {
        let promises: Promise<void>[] = [];
        for (const plugin of plugin_list) {
            current_context.extend.append_renderers.push(...plugin.exports.renderers);
            current_context.extend.append_parsers.push(...plugin.exports.parsers);
            promises.push(Promise.resolve(plugin.assigner(current_context)));
            Console.log({
                color: 'CYAN',
                msg: 'Plugin loaded:'
            }, {
                color: 'LIGHTMAGENTA',
                msg: plugin.__fewu_plugin_name
            });
        }
        await Promise.all(promises);
    }

    filterModules(modules_list: string[], filter_list: string[]) {
        let parsed_filters = filter_list.map(v => {
            if (v.match(/^[A-z0-9\-]+$/)) {
                return function (name: string) {
                    return name === v;
                }
            }
            let regExp = new RegExp(v);
            return function (name: string) {
                return regExp.test(name)
            }
        });
        let filtered_modules_list: string[] = [];
        for (const module_name in modules_list) {
            if (parsed_filters.some(v => v(module_name))) {
                filtered_modules_list.push(module_name);
            }
        }
        return filtered_modules_list;
    }
}