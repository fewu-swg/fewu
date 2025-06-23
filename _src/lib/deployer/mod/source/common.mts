// import { join } from "path";
// import { Processor } from "../source.mjs";
// import { BasicContext as Context } from "@fewu-swg/abstract-types";
// import { compile } from "sass";
// import ExtendedFS from "#util/ExtendedFS";
// import { readFile, writeFile } from "fs/promises";

// class CssProcessor implements Processor {
//     type= /\.s?css$/;
//     async processor(ctx: Context, path: string){
//         let origin = join(ctx.THEME_DIRECTORY,'source',path), target = join(ctx.PUBLIC_DIRECTORY,path).replace(/\.sc?ss$/,'.css');
//         let result = compile(origin, {
//             style: 'compressed'
//         });
//         await ExtendedFS.ensure(target);
//         await writeFile(target,result.css);
//     }
// }

// class JsProcessor implements Processor {
//     type = /\.m?js$/;
//     async processor(ctx: Context, path: string){
//         let origin = join(ctx.THEME_DIRECTORY,'source',path), target = join(ctx.PUBLIC_DIRECTORY,path);
//         let result = await readFile(origin);
//         await ExtendedFS.ensure(target);
//         await writeFile(target,result);
//     }
// }

// const cssProcessor = new CssProcessor();
// const jsProcessor = new JsProcessor();

// const processors = [
//     cssProcessor,
//     jsProcessor,
// ]

// export default processors;