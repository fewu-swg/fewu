import { EOL } from "os";
import { parse } from "yaml";
import ObjectParser from "#lib/object-parser/object-parser";

declare type markerReturnType = [Record<string, string>, number];

const languageMarkerProcess: Record<string, (content: string) => Promise<markerReturnType>> = {
    '---': async function (content) {
        let [config, i] = configString(content.replace('---' + EOL, ''), '---', 1);
        let obj = await ObjectParser.parse(config, {
            type: 'yaml',
            path: 'unknown://config.yaml'
        }) ?? {};
        return [obj, i] as markerReturnType;
    },
    '"': async function (content) {
        let [config, i] = configString(content, ';;;');
        let obj = ObjectParser.parseSync('{' + config + '}', {
            type: 'json',
            path: 'unknown://config.json'
        }) ?? {};
        return [obj ?? {}, i] as markerReturnType;
    }
};

function configString(content: string, end: string, i = 0): [string, number] {
    let lines = content.split(EOL);
    let stackedConfigLines: string[] = [];
    for (let line of lines) {
        i++;
        if (line.trim() === end) {
            break;
        } else {
            stackedConfigLines.push(line);
        }
    }
    let rawConfig = stackedConfigLines.join(EOL);
    return [rawConfig, i];
}

export async function resolve(content: string): Promise<[Record<string, string>, number]> {
    let marker: (content: string) => Promise<markerReturnType> = function (content) {
        throw new Error(`Cannot find a valid parser for front matter.`);
    };
    for (let matcher in languageMarkerProcess) {
        if (content.startsWith(matcher)) {
            marker = languageMarkerProcess[matcher];
        }
    }
    return await marker(content);
}