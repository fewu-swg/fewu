import { BasicContext as Context } from '@fewu-swg/abstract-types';
import { watch, readFile, writeFile, stat } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import { Console } from '@fewu-swg/fewu-utils';
import * as YAML from 'yaml';

/**
 * @param length length of random string
 * @param seed 
 * @returns {string}
 */
function generateRandomString(length: number = 16, seed: string = ''): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charsLength = chars.length;
    let seedValue = 0;

    length = Math.max(1, Math.floor(length));

    if (seed) {
        for (let i = 0; i < seed.length; i++) {
            seedValue = (seedValue * 31 + seed.charCodeAt(i)) & 0xffffffff;
        }
    }

    let state = seedValue || Math.floor(Math.random() * 0x100000000);
    const nextRandom = () => {
        state = (1664525 * state + 1013904223) & 0xffffffff;
        return state / 0x100000000;
    };

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(nextRandom() * charsLength);
        result += chars.charAt(Math.min(randomIndex, charsLength - 1));
    }

    if (result.length !== length) {
        while (result.length < length) {
            result += chars.charAt(Math.floor(Math.random() * charsLength));
        }
        result = result.substring(0, length);
    }

    return result;
}

async function hasFrontMatter(filePath: string): Promise<boolean> {
    try {
        const content = await readFile(filePath, 'utf8');
        return content.trim().startsWith('---');
    } catch (error) {
        Console.error(`Error reading file ${filePath}:`, error as Error);
        return false;
    }
}

async function addFrontMatterToFile(filePath: string, localManager: LocalManager): Promise<void> {
    try {
        if (await hasFrontMatter(filePath)) {
            Console.log(`File ${filePath} already has FrontMatter, skipping.`);
            return;
        }

        const randomString = localManager.generateUniqueRandomString(16, filePath + Date.now());
        const permalink = `/article/${randomString}/`;

        const now = new Date();
        const dateString = now.toISOString(); // YYYY-MM-DDTHH:mm:ss.sssZ

        const originalContent = await readFile(filePath, 'utf8');

        const frontMatter = {
            date: dateString,
            permalink: permalink,
            title: 'Untitled',
            tags: [],
            category: []
        };

        const yamlContent = YAML.stringify(frontMatter);

        const newContent = `---\n${yamlContent}---\n\n${originalContent}`;

        await writeFile(filePath, newContent, 'utf8');

        const normalizedPath = normalize(filePath);
        localManager.existingPermalinks.set(permalink, normalizedPath);
        localManager.filePathToPermalink.set(normalizedPath, permalink);

        Console.log(`Added FrontMatter to ${filePath} with permalink: ${permalink}`);
    } catch (error) {
        Console.error(`Error adding FrontMatter to ${filePath}:`, error as Error);
    }
}

export default class LocalManager {
    private ctx: Context;
    private watcher?: Promise<void>;
    private watchedFiles: Set<string> = new Set();
    existingPermalinks: Map<string, string> = new Map();
    filePathToPermalink: Map<string, string> = new Map();

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    start(): void {
        const postDir = join(
            this.ctx.SOURCE_DIRECTORY,
            this.ctx.config.post_dir || 'posts'
        );

        this.initializeExistingPermalinks();

        Console.log(`Starting to watch post directory: ${postDir}`);
        Console.log(`Loaded ${this.existingPermalinks.size} existing permalinks`);

        this.watcher = this.watchDirectory(postDir);
    }

    private initializeExistingPermalinks(): void {
        try {
            this.existingPermalinks.clear();
            this.filePathToPermalink.clear();

            if (!this.ctx.data || !this.ctx.data.sources) {
                Console.warn('No ctx.data.sources found, skipping permalink initialization');
                return;
            }

            const sources = this.ctx.data.sources;
            for (const [key, post] of Object.entries(sources)) {
                if (post && post.properties && post.properties.permalink) {
                    const permalink = post.properties.permalink;
                    const filePath = post.source_absolute_path.toString() || key;

                    const normalizedPath = normalize(filePath);

                    this.existingPermalinks.set(permalink, normalizedPath);
                    this.filePathToPermalink.set(normalizedPath, permalink);
                }
            }
        } catch (error) {
            Console.error('Error initializing permalinks:', error as Error);
        }
    }

    generateUniqueRandomString(length: number = 16, seed: string = ''): string {
        let attempts = 0;
        const maxAttempts = 100;

        while (attempts < maxAttempts) {
            const randomString = generateRandomString(length, seed + attempts);
            const permalink = `/article/${randomString}/`;

            if (!this.existingPermalinks.has(permalink)) {
                return randomString;
            }

            attempts++;
            seed += Date.now();
        }

        Console.warn(`Failed to generate unique string after ${maxAttempts} attempts, using timestamp fallback`);
        return Date.now().toString(36) + Math.random().toString(36).slice(2, -10);
    }

    private async watchDirectory(directory: string): Promise<void> {
        try {
            const watcher = watch(directory, { recursive: true });

            for await (const event of watcher) {
                const filePath = join(directory, event.filename!);
                const normalizedPath = normalize(filePath);

                if (event.eventType === 'rename') {
                    try {
                        const stats = await stat(filePath);
                        if (stats.isFile()) {
                            if (!this.watchedFiles.has(normalizedPath)) {
                                setTimeout(() => {
                                    this.handleNewFile(filePath);
                                }, 100);

                                this.watchedFiles.add(normalizedPath);
                            } else {
                                setTimeout(() => {
                                    this.handleFileMoved(filePath);
                                }, 100);
                            }
                        }
                    } catch (error) {
                        this.handleFileDeleted(normalizedPath);
                    }
                } else if (event.eventType === 'change') {
                    if (this.watchedFiles.has(normalizedPath)) {
                        setTimeout(() => {
                            this.handleFileModified(filePath);
                        }, 100);
                    }
                }
            }
        } catch (error) {
            Console.error(`Error watching directory ${directory}:`, error as Error);
        }
    }

    private async handleFileModified(filePath: string): Promise<void> {
        try {
            const normalizedPath = normalize(filePath);

            if (await hasFrontMatter(filePath)) {
                const content = await readFile(filePath, 'utf8');

                const frontMatterMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
                if (frontMatterMatch && frontMatterMatch[1]) {
                    try {
                        const frontMatter = YAML.parse(frontMatterMatch[1]);

                        if (frontMatter.permalink) {
                            const newPermalink = frontMatter.permalink;
                            const oldPermalink = this.filePathToPermalink.get(normalizedPath);

                            if (oldPermalink && oldPermalink !== newPermalink) {
                                this.existingPermalinks.delete(oldPermalink);
                                this.existingPermalinks.set(newPermalink, normalizedPath);
                                this.filePathToPermalink.set(normalizedPath, newPermalink);

                                Console.log(`Updated permalink for ${filePath}: ${oldPermalink} -> ${newPermalink}`);
                            }
                        }
                    } catch (parseError) {
                        Console.error(`Error parsing FrontMatter in ${filePath}:`, parseError as Error);
                    }
                }
            }
        } catch (error) {
            Console.error(`Error handling modified file ${filePath}:`, error as Error);
        }
    }

    private async handleFileMoved(filePath: string): Promise<void> {
        try {
            const normalizedPath = normalize(filePath);

            if (await hasFrontMatter(filePath)) {
                const content = await readFile(filePath, 'utf8');

                const frontMatterMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
                if (frontMatterMatch && frontMatterMatch[1]) {
                    try {
                        const frontMatter = YAML.parse(frontMatterMatch[1]);

                        if (frontMatter.permalink) {
                            const permalink = frontMatter.permalink;

                            checkWhetherOldPermalinkExists: for (const [path, perm] of this.filePathToPermalink.entries()) {
                                if (perm === permalink) {
                                    this.existingPermalinks.delete(perm);
                                    this.filePathToPermalink.delete(path);
                                    break;
                                }
                            }

                            this.existingPermalinks.set(permalink, normalizedPath);
                            this.filePathToPermalink.set(normalizedPath, permalink);

                            Console.log(`Updated file path for permalink ${permalink}: ${normalizedPath}`);
                        }
                    } catch (parseError) {
                        Console.error(`Error parsing FrontMatter in moved file ${filePath}:`, parseError as Error);
                    }
                }
            }
        } catch (error) {
            Console.error(`Error handling moved file ${filePath}:`, error as Error);
        }
    }

    private handleFileDeleted(filePath: string): Promise<void> {
        try {
            this.watchedFiles.delete(filePath);

            const permalink = this.filePathToPermalink.get(filePath);
            if (permalink) {
                this.existingPermalinks.delete(permalink);
                this.filePathToPermalink.delete(filePath);

                Console.log(`Removed permalink ${permalink} for deleted file ${filePath}`);
            }
        } catch (error) {
            Console.error(`Error handling deleted file ${filePath}:`, error as Error);
        }
        return Promise.resolve();
    }

    private async handleNewFile(filePath: string): Promise<void> {
        try {
            await stat(filePath);

            const ext = filePath.split('.').pop()?.toLowerCase();
            if (['md', 'markdown', 'txt'].includes(ext || '')) {
                Console.log(`New file detected: ${filePath}`);
                await addFrontMatterToFile(filePath, this);
            }
        } catch (error) {
            Console.error(`Error handling new file ${filePath}:`, error as Error);
        }
    }

    getPermalinks(): Map<string, string> {
        return new Map(this.existingPermalinks);
    }

    stop(): void {
        this.watchedFiles.clear();
        Console.log('Local manager stopped');
    }
}