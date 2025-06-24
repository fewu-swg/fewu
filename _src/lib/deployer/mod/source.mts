import { BasicContext, Result, __Deployer, FileBinding } from "@fewu-swg/abstract-types";
import { cp } from "node:fs/promises";
import ExtendedFS from "#util/ExtendedFS";

// this deployer handles the common files such as css, js, images, and all other files as a fallback deployer, copy file
export default class CommonSourceDeployer implements __Deployer {
    __fewu__: string = 'deployer';
    type: RegExp;
    #ctx: BasicContext;

    constructor(ctx: BasicContext) {
        this.#ctx = ctx;
        this.type = new RegExp(`()\..*?$`);
    }

    async assignTask(file_binding: FileBinding, provides: any): Promise<Result> {
        await ExtendedFS.ensure(file_binding.target.path!);
        await cp(file_binding.source.path!, file_binding.target.path!);
        return {
            status: 'Ok',
            value: ``
        };
    }

    async deployAll(ctx: BasicContext): Promise<Result> {
        return {
            status: 'Ok',
            value: ``
        };
    }
}
