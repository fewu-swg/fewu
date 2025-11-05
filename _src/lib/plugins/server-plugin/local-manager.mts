import { BasicContext as Context } from '@fewu-swg/abstract-types';
import { watch, readFile, writeFile, stat } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import { Console } from '@fewu-swg/fewu-utils';
import * as YAML from 'yaml';

/**
 * 生成16字符的随机字符串（A-z0-9）
 * @param length 字符串长度，默认16
 * @param seed 可选的种子字符串，用于确定随机数生成
 * @returns 生成的随机字符串
 */
function generateRandomString(length: number = 16, seed: string = ''): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charsLength = chars.length;
    let seedValue = 0;

    // 确保length是正数
    length = Math.max(1, Math.floor(length));

    if (seed) {
        // 使用简单哈希将种子转为数值
        for (let i = 0; i < seed.length; i++) {
            seedValue = (seedValue * 31 + seed.charCodeAt(i)) & 0xffffffff;
        }
    }

    // 线性同余生成器，基于种子生成随机数
    let state = seedValue || Math.floor(Math.random() * 0x100000000);
    const nextRandom = () => {
        state = (1664525 * state + 1013904223) & 0xffffffff;
        return state / 0x100000000;
    };

    // 确保生成固定长度的字符串
    for (let i = 0; i < length; i++) {
        // 确保随机数在有效范围内，防止越界
        const randomIndex = Math.floor(nextRandom() * charsLength);
        result += chars.charAt(Math.min(randomIndex, charsLength - 1));
    }

    // 最后验证长度，确保结果正确
    if (result.length !== length) {
        // 如果长度不足，用额外的随机字符填充
        while (result.length < length) {
            result += chars.charAt(Math.floor(Math.random() * charsLength));
        }
        // 如果长度过长，截断到所需长度
        result = result.substring(0, length);
    }

    return result;
}

/**
 * 检查文件是否已经包含FrontMatter
 */
async function hasFrontMatter(filePath: string): Promise<boolean> {
    try {
        const content = await readFile(filePath, 'utf8');
        // 简单检查文件开头是否包含---
        return content.trim().startsWith('---');
    } catch (error) {
        Console.error(`Error reading file ${filePath}:`, error as Error);
        return false;
    }
}

/**
   * 为文件添加FrontMatter
   */
async function addFrontMatterToFile(filePath: string, localManager: LocalManager): Promise<void> {
    try {
        // 检查文件是否已经包含FrontMatter
        if (await hasFrontMatter(filePath)) {
            Console.log(`File ${filePath} already has FrontMatter, skipping.`);
            return;
        }

        // 生成唯一的永久链接
        const randomString = localManager.generateUniqueRandomString(16, filePath + Date.now());
        const permalink = `/article/${randomString}/`;

        // 获取当前日期和时间作为创建时间，使用完整的ISO格式
        const now = new Date();
        const dateString = now.toISOString(); // 完整ISO格式: YYYY-MM-DDTHH:mm:ss.sssZ

        // 读取原始文件内容
        const originalContent = await readFile(filePath, 'utf8');

        // 生成FrontMatter
        const frontMatter = {
            date: dateString,
            permalink: permalink,
            title: 'Untitled',
            tags: [],
            category: []
        };

        // 将FrontMatter转换为YAML格式
        const yamlContent = YAML.stringify(frontMatter);

        // 组合新内容
        const newContent = `---\n${yamlContent}---\n\n${originalContent}`;

        // 写回文件
        await writeFile(filePath, newContent, 'utf8');

        // 更新映射
        const normalizedPath = normalize(filePath);
        localManager.existingPermalinks.set(permalink, normalizedPath);
        localManager.filePathToPermalink.set(normalizedPath, permalink);

        Console.log(`Added FrontMatter to ${filePath} with permalink: ${permalink}`);
    } catch (error) {
        Console.error(`Error adding FrontMatter to ${filePath}:`, error as Error);
    }
}

/**
 * 本地文件管理器，监听post_dir目录下的文件创建
 */
export default class LocalManager {
    private ctx: Context;
    private watcher?: Promise<void>;
    private watchedFiles: Set<string> = new Set();
    existingPermalinks: Map<string, string> = new Map(); // 存储已存在的permalink，key为permalink，value为文件路径
    filePathToPermalink: Map<string, string> = new Map(); // 存储文件路径到permalink的映射，便于更新

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    /**
     * 启动文件监听
     */
    start(): void {
        // 从配置中获取post_dir，如果不存在则默认为source目录下的_posts
        const postDir = join(
            this.ctx.SOURCE_DIRECTORY,
            this.ctx.config.post_dir || 'posts'
        );

        // 初始化已存在的permalink
        this.initializeExistingPermalinks();

        Console.log(`Starting to watch post directory: ${postDir}`);
        Console.log(`Loaded ${this.existingPermalinks.size} existing permalinks`);

        // 启动文件监听
        this.watcher = this.watchDirectory(postDir);
    }

    /**
     * 初始化已存在的permalink
     */
    private initializeExistingPermalinks(): void {
        try {
            // 清空现有的映射
            this.existingPermalinks.clear();
            this.filePathToPermalink.clear();

            // 检查ctx.data.sources是否存在
            if (!this.ctx.data || !this.ctx.data.sources) {
                Console.warn('No ctx.data.sources found, skipping permalink initialization');
                return;
            }

            // 遍历所有sources
            const sources = this.ctx.data.sources;
            for (const [key, post] of Object.entries(sources)) {
                // 检查post和其properties是否存在
                if (post && post.properties && post.properties.permalink) {
                    const permalink = post.properties.permalink;
                    // 获取文件路径（如果存在）
                    const filePath = post.filepath || key;

                    // 标准化文件路径
                    const normalizedPath = normalize(filePath);

                    // 添加到映射中
                    this.existingPermalinks.set(permalink, normalizedPath);
                    this.filePathToPermalink.set(normalizedPath, permalink);
                }
            }
        } catch (error) {
            Console.error('Error initializing permalinks:', error as Error);
        }
    }

    /**
     * 生成唯一的随机字符串，确保不与现有permalink冲突
     */
    generateUniqueRandomString(length: number = 16, seed: string = ''): string {
        let attempts = 0;
        const maxAttempts = 100; // 防止无限循环

        while (attempts < maxAttempts) {
            const randomString = generateRandomString(length, seed + attempts);
            const permalink = `/article/${randomString}/`;

            // 检查是否已存在
            if (!this.existingPermalinks.has(permalink)) {
                return randomString;
            }

            attempts++;
            // 如果连续失败，增加seed的随机性
            seed += Date.now();
        }

        // 如果达到最大尝试次数，使用时间戳生成一个保证唯一的值
        Console.warn(`Failed to generate unique string after ${maxAttempts} attempts, using timestamp fallback`);
        return Date.now().toString(36) + Math.random().toString(36).substr(2, length - 10);
    }

    /**
     * 监听目录变化
     */
    private async watchDirectory(directory: string): Promise<void> {
        try {
            // 使用watch API监听目录变化
            const watcher = watch(directory, { recursive: true });

            // 处理文件变化事件
            for await (const event of watcher) {
                const filePath = join(directory, event.filename!);
                const normalizedPath = normalize(filePath);

                if (event.eventType === 'rename') {
                    try {
                        // 检查文件是否存在且是文件（不是目录）
                        const stats = await stat(filePath);
                        if (stats.isFile()) {
                            // 检查是否是新文件
                            if (!this.watchedFiles.has(normalizedPath)) {
                                // 确保文件完全写入后再处理
                                setTimeout(() => {
                                    this.handleNewFile(filePath);
                                }, 100);

                                // 将文件添加到已处理集合中
                                this.watchedFiles.add(normalizedPath);
                            } else {
                                // 可能是文件移动，重新处理
                                setTimeout(() => {
                                    this.handleFileMoved(filePath);
                                }, 100);
                            }
                        }
                    } catch (error) {
                        // 文件可能被删除，处理删除事件
                        this.handleFileDeleted(normalizedPath);
                    }
                } else if (event.eventType === 'change') {
                    // 处理文件修改事件
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

    /**
     * 处理文件修改事件
     */
    private async handleFileModified(filePath: string): Promise<void> {
        try {
            const normalizedPath = normalize(filePath);

            // 检查文件是否包含FrontMatter
            if (await hasFrontMatter(filePath)) {
                // 读取文件内容
                const content = await readFile(filePath, 'utf8');

                // 尝试解析FrontMatter
                const frontMatterMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
                if (frontMatterMatch && frontMatterMatch[1]) {
                    try {
                        const frontMatter = YAML.parse(frontMatterMatch[1]);

                        // 如果有permalink字段
                        if (frontMatter.permalink) {
                            const newPermalink = frontMatter.permalink;
                            const oldPermalink = this.filePathToPermalink.get(normalizedPath);

                            // 如果permalink发生变化
                            if (oldPermalink && oldPermalink !== newPermalink) {
                                // 更新映射
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

    /**
     * 处理文件移动事件
     */
    private async handleFileMoved(filePath: string): Promise<void> {
        try {
            const normalizedPath = normalize(filePath);

            // 检查文件是否包含FrontMatter
            if (await hasFrontMatter(filePath)) {
                // 读取文件内容
                const content = await readFile(filePath, 'utf8');

                // 尝试解析FrontMatter
                const frontMatterMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
                if (frontMatterMatch && frontMatterMatch[1]) {
                    try {
                        const frontMatter = YAML.parse(frontMatterMatch[1]);

                        // 如果有permalink字段
                        if (frontMatter.permalink) {
                            const permalink = frontMatter.permalink;

                            // 更新映射
                            // 首先检查是否有旧路径映射
                            for (const [path, perm] of this.filePathToPermalink.entries()) {
                                if (perm === permalink) {
                                    // 删除旧路径映射
                                    this.existingPermalinks.delete(perm);
                                    this.filePathToPermalink.delete(path);
                                    break;
                                }
                            }

                            // 添加新路径映射
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

    /**
     * 处理文件删除事件
     */
    private handleFileDeleted(filePath: string): Promise<void> {
        try {
            // 从已处理集合中移除
            this.watchedFiles.delete(filePath);

            // 检查是否有对应的permalink
            const permalink = this.filePathToPermalink.get(filePath);
            if (permalink) {
                // 从映射中移除
                this.existingPermalinks.delete(permalink);
                this.filePathToPermalink.delete(filePath);

                Console.log(`Removed permalink ${permalink} for deleted file ${filePath}`);
            }
        } catch (error) {
            Console.error(`Error handling deleted file ${filePath}:`, error as Error);
        }
        return Promise.resolve();
    }

    /**
     * 处理新创建的文件
     */
    private async handleNewFile(filePath: string): Promise<void> {
        try {
            // 检查文件是否存在
            await stat(filePath);

            // 检查文件扩展名，只处理常见的文本文件
            const ext = filePath.split('.').pop()?.toLowerCase();
            if (['md', 'markdown', 'txt'].includes(ext || '')) {
                Console.log(`New file detected: ${filePath}`);
                await addFrontMatterToFile(filePath, this);
            }
        } catch (error) {
            Console.error(`Error handling new file ${filePath}:`, error as Error);
        }
    }

    /**
     * 获取所有已存在的permalink（用于外部访问）
     */
    getPermalinks(): Map<string, string> {
        return new Map(this.existingPermalinks);
    }

    /**
     * 停止文件监听
     */
    stop(): void {
        // 如果watcher存在，可以取消它
        this.watchedFiles.clear();
        Console.log('Local manager stopped');
    }
}