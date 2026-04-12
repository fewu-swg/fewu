import { Parser as __Parser, Renderer as __Renderer, BasicContext, Config, Page, Post, PageContainer, Result, ResultStatus } from "@fewu-swg/abstract-types";

export { Config, Page, Post, PageContainer, Result, ResultStatus };

export declare interface Scaffold {
    content: string;
};

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