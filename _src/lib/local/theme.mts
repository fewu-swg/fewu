import ObjectParser from "#lib/object-parser/object-parser";
import { BasicContext as Context } from "@fewu-swg/abstract-types";
import ExtendedFS from "#util/ExtendedFS";
import { existsSync, watch, WatchEventType } from "fs";
import { readdir } from "fs/promises";
import { basename, extname, join } from "path";
import { Console } from "@fewu-swg/fewu-utils";
import EXIT_CODES from "#lib/interface/exit-codes";

export default class Theme {

    static async executePlugins(ctx: Context): Promise<void> {
        let pluginDir = join(ctx.THEME_DIRECTORY, 'scripts');
        if (!existsSync(pluginDir)) {
            Console.may.info(`Theme does not provide any external scripts.`);
            return;
        }
        let scriptPaths = (await readdir(pluginDir)).map(v => join(pluginDir, v));
        if (scriptPaths.length === 0) {
            return;
        }
        Console.may.info(`Theme provides ${scriptPaths.length} external scripts.`);
        for (let scriptPath of scriptPaths) {
            try {
                if (await ExtendedFS.isDir(scriptPath)) {
                    continue;
                }
                Console.may.log(`Try to import external script from theme: ${scriptPath}`);
                let script = (await import('file://' + scriptPath)).default;
                if (typeof script === 'function') {
                    script(ctx);
                    Console.may.log(`Loaded theme script:`, scriptPath);
                } else {
                    Console.may.log(`Theme script ${scriptPath} does not export a default function. Ignoring.`);
                }
            } catch (error) {
                Console.error(`Unexpected error while loading theme script!`);
                console.error(error);
                process.exit(EXIT_CODES.THEME_SCRIPT_ERROR);
            }
        }
        return;
    }

    static async getI18n(ctx: Context): Promise<void> {
        let languageDir = join(ctx.THEME_DIRECTORY, 'languages');
        if (!existsSync(languageDir)) {
            return;
        }
        let i18nPaths = (await readdir(languageDir)).map(v => join(languageDir, v));
        for (let i18nPath of i18nPaths) {
            if (await ExtendedFS.isDir(i18nPath)) {
                continue;
            }
            let id = basename(i18nPath, extname(i18nPath));
            let result = await ObjectParser.parseFile(i18nPath);
            ctx.i18ns.push({
                id: id,
                value: result as Record<string, string>
            });
        }
    }

    static async watch(ctx: Context, callback: (ctx: Context, type: WatchEventType, path: string, from: string) => void): Promise<void> {
        watch(ctx.THEME_DIRECTORY, { recursive: true }, (event, filename) => {
            callback(ctx, event, filename as string, ctx.THEME_DIRECTORY);
        });
        return;
    }
}