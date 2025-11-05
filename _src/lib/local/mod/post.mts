import { detectNewlineGraceful } from 'detect-newline';
import { resolve } from "./frontMatter.mjs";

let regExps = {
    MATCH_H1: /\n# /,
    MATCH_IMAGE: /\!\[([^\]]*?)\]\(([^\n]+?)\)/g,
    MATCH_MORE: /< *! *-- *more *-- *>/,
};

export async function resolveContent(content: string) {
    let postContent = '';
    let postIntroduction = '';
    let [postProp, i] = await resolve(content)
    let properties: Record<string, string> = {
        title: "Untitled",
        date: '1970-1-1',
        category: " ",
        tags: " ",
        license: 'CC BY-NC-SA 4.0',
        ...postProp
    };
    let referencedImages = [];
    // 检测文件的换行符
    const newline = detectNewlineGraceful(content) || '\n';
    const lines = content.split(newline);

    let moreIndex = -1; 
    
    for(let line of lines) {
        if(!regExps.MATCH_MORE.exec(line)){
            moreIndex++;
        } else {
            break;
        }
    }

    if (moreIndex === -1 || moreIndex == lines.length+1) {
        /* No introduction provided */
        postContent = lines.slice(i).join(newline);
    } else {
        postContent = lines.slice(moreIndex).join(newline);
    }

    postIntroduction = lines.slice(i, (moreIndex !== -1) ? moreIndex : 5).join(newline).replace(/\#*/g, '');

    referencedImages = [...postContent.matchAll(regExps.MATCH_IMAGE)].map(v => v[2]);

    return {
        properties,
        postContent,
        postIntroduction,
        referencedImages
    };
}