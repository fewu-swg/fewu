import { Moment } from "moment";
import Context from "./fewu/context.mjs";
import { __Parser, __Renderer, BasicContext, Config, Page } from "@fewu-swg/abstract-types";

export { Config, Page };

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
    get(ctx: BasicContext): string[];
};

export declare interface AppPlugin {
    append_pages: Pagable[];
    append_renderers: __Renderer[];
    append_parsers: __Parser[];
    helpers: Record<string, Function>;
}

export declare interface Wrapper<T> {
    value: T
}

export declare type ResultStatus = 'Ok' | 'Err';

export declare interface Result<T> {
    status: ResultStatus,
    value?: T
}