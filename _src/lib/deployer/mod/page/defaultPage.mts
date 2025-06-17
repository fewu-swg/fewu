import { Pagable } from "#lib/types";
import { join } from "path";
import { BasicContext as Context } from "@fewu-swg/abstract-types";

const defaultPages: Pagable[] = [
    {
        type: 'index',
        get(ctx: Context) {
            return [
                join(ctx.PUBLIC_DIRECTORY, 'index.html')
            ];
        }
    },
    {
        type: 'archive',
        get(ctx: Context) {
            let count = Math.ceil(ctx.data.posts.length / 10);
            let targets: string[] = [];
            while (count--) {
                targets.push(join(ctx.PUBLIC_DIRECTORY, 'archives', count.toString(), 'index.html'));
            }
            targets.reverse();
            return targets;
        }
    },
    {
        type: 'category',
        get(ctx: Context) {
            return [
                join(ctx.PUBLIC_DIRECTORY, 'categories', 'index.html')
            ]
        }
    },
    {
        type: 'tag',
        get(ctx: Context) {
            return [
                join(ctx.PUBLIC_DIRECTORY, 'tags', 'index.html')
            ]
        }
    },
    {
        type: 'category_detail',
        get(ctx: Context) {
            return [
                ...ctx.data.categories.map(v => {
                    let splitCount = Math.ceil(v.values.length / 10);
                    let current: string[] = [];
                    for (let i = 0; i < splitCount; i++) {
                        current.push(join(ctx.PUBLIC_DIRECTORY, 'categories', v.key, i.toString(), 'index.html'));
                    }
                    return current;
                })
            ].flat()
        }
    },
    {
        type: 'tag_detail',
        get(ctx: Context) {
            return [
                ...ctx.data.tags.map(v => {
                    let splitCount = Math.ceil(v.values.length / 10);
                    let current: string[] = [];
                    for (let i = 0; i < splitCount; i++) {
                        current.push(join(ctx.PUBLIC_DIRECTORY, 'tags', v.key, i.toString(), 'index.html'));
                    }
                    return current;
                })
            ].flat()
        }
    }
];

export default defaultPages;