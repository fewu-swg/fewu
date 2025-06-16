import { BasicContext, Config, Plugin } from "@fewu-swg/abstract-types";
import { AppPlugin, I18nUsable } from "../types.mjs";
import { version } from "./fewu.mjs";
import defaultConfig, { mixConfig, readConfig } from "./config.mjs";

import Argv from "#util/Argv";
import Console from "#util/Console";

import { join } from "path";
import { EventEmitter } from "events";
import { existsSync } from "fs";
import { tmpdir } from "os";
import DataStorage from "#lib/data/data";
import { RendererConstructor } from "#lib/render/render";
import ObjectParser from "#lib/object-parser/object-parser";
import { DeployerConstructor } from "#lib/deployer/deployer";
import { Source, Theme } from "#lib/local/local";
import { ConfigNotFoundError } from "#lib/interface/error";
import registerServer from "#lib/server/server-plugin";
import { PluginResolver } from "./plugind.mjs";

interface Context {
    on(event: 'startup', listenter: (ctx: Context, ...args: any[]) => any): this;
    on(event: 'afterStartup', listenter: (ctx: Context, ...args: any[]) => any): this;
    on(event: 'beforeProcess', listenter: (ctx: Context, ...args: any[]) => any): this;
    on(event: 'afterProcess', listenter: (ctx: Context, ...args: any[]) => any): this;
    on(event: 'beforeGenerate', listenter: (ctx: Context, ...args: any[]) => any): this;
    on(event: 'afterGenerate', listenter: (ctx: Context, ...args: any[]) => any): this;
    on(event: 'beforeDeploy', listenter: (ctx: Context, ...args: any[]) => any): this;
    on(event: 'afterDeploy', listenter: (ctx: Context, ...args: any[]) => any): this;
    on(event: 'ready', listenter: (ctx: Context, ...args: any[]) => any): this;
    on(event: 'exit', listenter: (ctx: Context, ...args: any[]) => any): this;
}

class Context extends EventEmitter implements BasicContext {

    public readonly VERSION: string;
    public readonly config: Config;
    public readonly env: typeof process.env;
    public readonly data: DataStorage;
    public extend: AppPlugin;
    public plugins: Plugin[] = [];
    public i18ns: I18nUsable[];
    public locals = { Source, Theme };

    public readonly BASE_DIRECTORY: string;
    public readonly PUBLIC_DIRECTORY: string;
    public readonly SOURCE_DIRECTORY: string;
    public readonly THEME_DIRECTORY: string;
    public readonly CONFIG_PATH: string;

    public readonly Deployer;
    public readonly Renderer;
    public readonly ObjectParser;

    constructor(baseDirectory = process.cwd()) {
        // construct EventEmitter
        super();

        let configPaths = [...[Argv['-C']?.[0]].filter(Boolean), 'config.yaml', 'config.yml', '_config.yaml', '_config.yml', 'config.json'].map(v => join(baseDirectory, v));
        let CONFIG_PATH: string | undefined;
        for(let configPath of configPaths){
            if(existsSync(configPath)){
                CONFIG_PATH = configPath;
            }
        }
        if(!CONFIG_PATH){
            throw new ConfigNotFoundError(configPaths);
        }
        Console.log(`Using config: ${CONFIG_PATH}`);

        // const configuration
        const CONFIG = mixConfig(defaultConfig, readConfig(baseDirectory, CONFIG_PATH));

        this.VERSION = version;
        this.config = { ...CONFIG };
        this.env = process.env;
        this.data = new DataStorage();
        this.extend = {
            append_pages: [],
            append_parsers: [],
            append_renderers: [],
            helpers: {}
        };
        this.i18ns = [];

        this.BASE_DIRECTORY = baseDirectory;
        this.PUBLIC_DIRECTORY = join(baseDirectory, CONFIG.public_dir);
        this.SOURCE_DIRECTORY = join(baseDirectory, CONFIG.source_dir);
        this.THEME_DIRECTORY = join(baseDirectory, 'themes', CONFIG.theme);
        this.CONFIG_PATH = CONFIG_PATH;

        // test if theme is in themes or node_modules (npm package)
        if(existsSync(join(baseDirectory,"node_modules",CONFIG.theme))) {
            this.THEME_DIRECTORY = join(baseDirectory,"node_modules",CONFIG.theme);
        }

        if (Argv['-S'] || Argv['--server']) {
            this.PUBLIC_DIRECTORY = join(tmpdir(),'io.fewu-swg.fewu','live-server');
        }

        this.Deployer = new DeployerConstructor(this);
        this.Renderer = new RendererConstructor(this);
        this.ObjectParser = ObjectParser;

        registerServer(this);

        const pluginResolver = new PluginResolver(this);
    }

}

export default Context;