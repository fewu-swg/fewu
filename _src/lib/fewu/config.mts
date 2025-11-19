import EXIT_CODES from "#lib/interface/exit-codes";
import ObjectParser from "#lib/object-parser/object-parser";
import { Config } from "@fewu-swg/abstract-types";
import { Console } from "@fewu-swg/fewu-utils";

const defaultConfig: Config = {
    title: 'Fewu',
    description: '',
    author: 'Meteor',
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    url: 'https://blog.example.org',
    root: '',
    default_layout: 'default',
    source_dir: 'source',
    public_dir: 'public',
    theme: '@fewu-swg/fewu-theme-next',
    excluded_files: [] as string[],
    plugins: [
        'fewu-renderer-.*',
        'fewu-plugin-.*',
        'fewu-deployer-.*'
    ],
    plugin_configs: {}
}

export default defaultConfig;

export declare type partialConfigType = Partial<Config>;

function inferDirectoryPath(url: URL | string): string {
    try {
        const parsedUrl = new URL(url);
        let path = parsedUrl.pathname;
        if (path === '' || path === '/') {
            return '/';
        }
        if (!path.endsWith('/')) {
            path += '/';
        }
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        return path;
    } catch (error) {
        console.error(error);
        process.exit(EXIT_CODES.CONFIG_URL_INFER_FAILED);
    }
}

export function mixConfig(defaultConfig: Config, userConfig: partialConfigType): Config {
    const mixedConfig: partialConfigType = {};
    Object.assign(mixedConfig, defaultConfig);
    Object.assign(mixedConfig, userConfig);

    if (!mixedConfig.root) {
        mixedConfig.root = inferDirectoryPath(mixedConfig.url!);
    }

    return mixedConfig as Config;
};

export function readConfig(_baseDir = process.cwd(), configPath: string): partialConfigType {
    let obj: partialConfigType | null = {};

    obj = ObjectParser.parseFileSync(configPath);

    if (!obj) {
        Console.error(`Cannot parse config!`);
        process.exit(EXIT_CODES.CONFIG_UNPARSABLE);
    }

    return obj;
}