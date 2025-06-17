import { PageContainer } from "#lib/types";
import { BasicContext as Context, Page } from "@fewu-swg/abstract-types";
import moment from "moment";
import { EOL } from "os";
import { join } from "path";

declare interface _PageContainer extends PageContainer{
    current: number;
    total: number;
}

declare interface Helpers {
    __(text: string): string;
    url_for(path: string): string;
    full_url_for(path: string): string;
    css(param0: string | object | string[] | object[]): string;
    js(param0: string | object | string[] | object[]): string;
    _container_of(type: string, current: number): _PageContainer;
    _dir_of(type: string): string;
    moment: typeof moment;
    [key: string]: Function;
}

export function getHelpers(ctx: Context, page: Page): Helpers {
    let category: _PageContainer[] = [];
    let tag: _PageContainer[] = [];
    ctx.data.categories.map(v => {
        let splitCount = Math.ceil(v.values.length / 10);
        for (let i = 0; i < splitCount; i++) {
            category.push({
                ...v,
                current: i,
                total: splitCount
            });
        }
        return category;
    });
    ctx.data.tags.map(v => {
        let splitCount = Math.ceil(v.values.length / 10);
        for (let i = 0; i < splitCount; i++) {
            tag.push({
                ...v,
                current: i,
                total: splitCount
            });
        }
        return tag;
    });
    let currentI18n: Record<string, string> = {};
    let fallbackI18n: Record<string, string> = {};
    let current_i18n_match = false;
    for (let i18nUsable of ctx.i18ns) {
        if (i18nUsable.id === page.language) {
            currentI18n = i18nUsable.value;
            current_i18n_match = true;
            break;
        } else if (i18nUsable.id === 'default' || i18nUsable.id === 'fallback') {
            fallbackI18n = i18nUsable.value;
        }
    }
    if(!current_i18n_match) {
        let [page_wide_id] = page.language.split("-");
        for(let i18nUsable of ctx.i18ns){
            let [i18n_wide_id] = i18nUsable.id.split("-");
            if(i18n_wide_id === page_wide_id){
                currentI18n = i18nUsable.value;
                break;
            }
        }
    }
    return {
        __(key) {
            let result = '';
            if (/[0-9]/.test(key)) {
                let replaceList: string[] = [];
                for (let item of (/[0-9]+/g).exec(key) ?? []) {
                    key = key.replace(item, '{NUMBER}');
                    replaceList.push(item);
                }
                result = currentI18n[key] ?? fallbackI18n[key] ?? key;
                for (let item of replaceList) {
                    result = result.replace('{NUMBER}', item);
                }
            }
            else {
                result = currentI18n[key] ?? fallbackI18n[key] ?? key;
            }
            return result;
        },
        url_for(path) {
            if (path.startsWith('/')) {
                return join(path);
            }
            return join(ctx.config.root, path);
        },
        full_url_for(path) {
            return join(ctx.config.url, path)
        },
        _container_of(type, _current) {
            if (type === 'category' || type === 'categories') {
                return category[_current];
            } else if (type === 'tag' || type === 'tags') {
                return tag[_current];
            } else {
                throw new Error('Invalid type passed to helper: _container_of');
            }
        },
        _dir_of(type) {
            let cwd = process.cwd();
            switch (type) {
                case 'public':
                    return ctx.PUBLIC_DIRECTORY;
                case 'source':
                    return ctx.SOURCE_DIRECTORY;
                case 'cwd':
                    return cwd;
                default:
                    return '';
            }
        },
        css(param0) {
            if (Array.isArray(param0)) {
                return param0.map(v => this.css(v)).join(EOL);
            }
            if (typeof param0 === 'string') {
                return `<link rel='stylesheet' href=${param0}>`;
            }
            else {
                return `<link${Object.entries(param0).map(([k, v]) => ` ${k}=${v}`).join()}>`;
            }
        },
        js(param0) {
            if (Array.isArray(param0)) {
                return param0.map(v => this.js(v)).join(EOL);
            }
            if (typeof param0 === 'string') {
                return `<script src=${param0}></script>`;
            }
            else {
                return `<script${Object.entries(param0).map(([k, v]) => ` ${k}=${v}`).join()}></script>`;
            }
        },
        moment,
        ...ctx.extend.helpers
    }
}