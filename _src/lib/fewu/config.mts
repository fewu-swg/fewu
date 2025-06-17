import { ConfigNotParsableError } from "#lib/interface/error";
import ObjectParser from "#lib/object-parser/object-parser";
import { Config } from "@fewu-swg/abstract-types";

const defaultConfig: Config = {
    title: 'Fewu',
    description: '',
    author: 'Meteor',
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    url: 'https://blog.example.org',
    root: '/',
    default_layout: 'default',
    source_dir: 'source',
    public_dir: 'public',
    theme: 'Blank',
    excluded_files: [] as string[],
    plugins: [
        'fewu-renderer-.*',
        'fewu-plugin-.*'
    ],
    plugin_configs: {}
}

export default defaultConfig;

export declare type partialConfigType = Partial<Config>;

export function mixConfig(defaultConfig: Config, userConfig: partialConfigType): Config {
    const mixedConfig: partialConfigType = {};
    Object.assign(mixedConfig, defaultConfig);
    Object.assign(mixedConfig, userConfig);

    return mixedConfig as Config;
};

export function readConfig(_baseDir = process.cwd(), configPath: string): partialConfigType {
    let obj: partialConfigType | null = {};

    obj = ObjectParser.parseFileSync(configPath);

    if (!obj) {
        throw new ConfigNotParsableError(configPath);
    }

    return obj;
}