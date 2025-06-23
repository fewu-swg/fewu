import { BasicContext, Config, Plugin, I18nProfiles, Deployer as DeployerInterface, Renderer as RendererInterface } from "@fewu-swg/abstract-types";
import { version } from "./fewu.mjs";
import defaultConfig, { mixConfig, readConfig } from "./config.mjs";
import { PluginResolver } from "./plugind.mjs";

import { Argv, Console } from "@fewu-swg/fewu-utils";
import AsyncEventEmitter from "#util/AsyncEmitter";

import { join } from "path";
import { existsSync } from "fs";
import DataStorage from "#lib/data/data";
import { Source, Theme } from "#lib/local/local";
import { ConfigNotFoundError } from "#lib/interface/error";
import _server_plugin from "#lib/plugins/server-plugin";
import _log_plugin from "#lib/plugins/log-plugin";
import _core_collect_plugin from "#lib/data/collect-plugin";
import { Renderer } from "#lib/renderer/renderer";
import { Deployer } from "#lib/deployer/deployer";

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

    public Deployer: DeployerInterface;
    public Renderer: RendererInterface;

    public initialized: Promise<unknown>;

    constructor(baseDirectory = process.cwd()) {
        // construct EventEmitter
        super();
        let async_tasks: Promise<unknown>[] = [];

        let configPaths = [...[Argv['-C']?.[0]].filter(Boolean), 'config.yaml', 'config.yml', '_config.yaml', '_config.yml', 'config.json'].map(v => join(baseDirectory, v));
        let CONFIG_PATH: string | undefined;
        for (let configPath of configPaths) {
            if (existsSync(configPath)) {
                CONFIG_PATH = configPath;
            }
        }
        if (!CONFIG_PATH) {
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
            append_deployers: [],
            helpers: {},
            Source,
            Theme,
        };
        this.i18ns = [];

        this.BASE_DIRECTORY = baseDirectory;
        this.PUBLIC_DIRECTORY = join(baseDirectory, CONFIG.public_dir);
        this.SOURCE_DIRECTORY = join(baseDirectory, CONFIG.source_dir);
        this.THEME_DIRECTORY = join(baseDirectory, 'themes', CONFIG.theme);
        this.CONFIG_PATH = CONFIG_PATH;

        this.Renderer = new Renderer(this);
        this.Deployer = new Deployer(this);

        const pluginResolver = new PluginResolver(this);

        // test if theme is in themes or node_modules (npm package)
        if (existsSync(join(baseDirectory, "node_modules", CONFIG.theme))) {
            this.THEME_DIRECTORY = join(baseDirectory, "node_modules", CONFIG.theme);
        }

        async_tasks.push((async _ => {
            await pluginResolver.resolveAll();
            Console.log(`External Plugins: ${this.plugins.map(v => v.__fewu_plugin_name)}`);
            await pluginResolver.loadPlugins([
                new _server_plugin(this),
                new _log_plugin(this),
                new _core_collect_plugin(this)
            ]);
            await pluginResolver.loadPlugins(this.plugins);
        })());



        this.initialized = Promise.all(async_tasks);
    }

}

export default Context;