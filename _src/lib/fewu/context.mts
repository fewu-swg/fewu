import { BasicContext, Config, Plugin, I18nProfiles } from "@fewu-swg/abstract-types";
import { version } from "./fewu.mjs";
import defaultConfig, { mixConfig, readConfig } from "./config.mjs";
import { PluginResolver } from "./plugind.mjs";

import { Argv, Console } from "@fewu-swg/fewu-utils";
import AsyncEventEmitter from "#util/AsyncEmitter";

import { join } from "path";
import { existsSync } from "fs";
import DataStorage from "#lib/data/data";
import { RendererConstructor } from "#lib/render/render";
import { DeployerConstructor } from "#lib/deployer/deployer";
import { Source, Theme } from "#lib/local/local";
import { ConfigNotFoundError } from "#lib/interface/error";
import _server_plugin from "#lib/plugins/server-plugin";
import _log_plugin from "#lib/plugins/log-plugin";
import _core_collect_plugin from "#lib/data/collect-plugin";

class Context extends AsyncEventEmitter implements BasicContext {

    public readonly VERSION: string;
    public readonly config: Config;
    public readonly env: typeof process.env;
    public readonly data: DataStorage;
    public extend: Record<string, any>;
    public plugins: Plugin[] = [];
    public i18ns: I18nProfiles[];
    // public locals = { Source, Theme };

    public readonly BASE_DIRECTORY: string;
    public PUBLIC_DIRECTORY: string;
    public SOURCE_DIRECTORY: string;
    public readonly THEME_DIRECTORY: string;
    public readonly CONFIG_PATH: string;

    public readonly Deployer;
    public readonly Renderer;

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
            helpers: {},
            Source,
            Theme,
            Deployer: new DeployerConstructor(this),
            Renderer: new RendererConstructor(this)
        };
        this.i18ns = [];

        this.BASE_DIRECTORY = baseDirectory;
        this.PUBLIC_DIRECTORY = join(baseDirectory, CONFIG.public_dir);
        this.SOURCE_DIRECTORY = join(baseDirectory, CONFIG.source_dir);
        this.THEME_DIRECTORY = join(baseDirectory, 'themes', CONFIG.theme);
        this.CONFIG_PATH = CONFIG_PATH;

        const pluginResolver = new PluginResolver(this);
        pluginResolver.resolveAll();

        // test if theme is in themes or node_modules (npm package)
        if(existsSync(join(baseDirectory,"node_modules",CONFIG.theme))) {
            this.THEME_DIRECTORY = join(baseDirectory,"node_modules",CONFIG.theme);
        }

        this.Deployer = new DeployerConstructor(this);
        this.Renderer = new RendererConstructor(this);

        pluginResolver.loadPlugins([
            new _server_plugin(this),
            new _log_plugin(this),
            new _core_collect_plugin(this)
        ]);
    }

}

export default Context;