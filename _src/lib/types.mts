import { Stats } from "node:fs";
import { Moment } from "moment";
import Context from "./fewu/context.mjs";
import { __Parser, __Renderer, Config } from "@fewu-swg/abstract-types";

export { Config };

export declare interface Page {
    id?: string;  // non-standard API
    title?: string;
    author?: string;
    language: string;
    date?: Moment;
    updated?: Moment;
    length?: number;
    excerpt?: string;
    more?: string; // to be deprecated. Use item.excerpt
    properties?: { [key: string]: string }; // non-standard API

    layout?: string;
    comments?: boolean;
    content?: string;

    prev?: Page;
    next?: Page;

    current: number;
    total: number;

    raw?: string;
    raw_excerpt?: string; // non-standard API
    source: string;
    full_source: string;
    path: string;
    relative_path: string;
    stat?: Stats;  // non-standard API
}

export declare interface Post extends Page {
    date: Moment;
    license: string;
    tags: string[];
    categories: string[];
    properties: { [key: string]: string }; // non-standard API
};

export declare interface Scaffold {
    content: string;
};

export declare interface PageContainer {
    key: string;
    values: Page[];
}

export declare interface Pagable {
    type: string;
    get(ctx: Context): string[];
};

export declare interface AppPlugin {
    append_pages: Pagable[];
    append_renderers: __Renderer[];
    append_parsers: __Parser[];
    helpers: Record<string, Function>;
}

export declare interface I18nUsable {
    id: string;
    value: Record<string,string>
}

export declare interface Wrapper<T> {
    value: T
}

export declare type ResultStatus = 'Ok' | 'Err';

export declare interface Result<T> {
    status: ResultStatus,
    value?: T
}

export {
    Context
};