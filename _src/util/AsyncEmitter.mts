import { EventListener, AsyncEventEmitter as AsyncEventEmitterInterface } from "@fewu-swg/abstract-types";

class AsyncEventEmitter implements AsyncEventEmitterInterface {
    private _events: Map<string, EventListener[]> = new Map();
    private _maxListeners: number = 10;

    on(eventName: string, listener: EventListener): this {
        return this.addListener(eventName, listener);
    }

    addListener(eventName: string, listener: EventListener): this {
        if (!this._events.has(eventName)) {
            this._events.set(eventName, []);
        }

        const listeners = this._events.get(eventName)!;
        listeners.push(listener);

        // 检查监听器数量是否超过最大值
        if (listeners.length > this._maxListeners) {
            console.warn(
                `警告: 事件 '${eventName}' 有 ${listeners.length} 个监听器，超过了最大值 ${this._maxListeners}。` +
                '这可能表示存在内存泄漏。使用 emitter.setMaxListeners() 可以增加限制。'
            );
        }

        return this;
    }

    once(eventName: string, listener: EventListener): this {
        const wrapper: EventListener = async (...args) => {
            this.off(eventName, wrapper);
            await listener(...args);
        };
        this.on(eventName, wrapper);
        return this;
    }

    off(eventName: string, listener: EventListener): this {
        return this.removeListener(eventName, listener);
    }

    removeListener(eventName: string, listener: EventListener): this {
        const listeners = this._events.get(eventName);
        if (!listeners) return this;

        const index = listeners.indexOf(listener);
        if (index !== -1) listeners.splice(index, 1);

        if (listeners.length === 0) this._events.delete(eventName);
        return this;
    }

    removeAllListeners(eventName?: string): this {
        if (eventName) {
            this._events.delete(eventName);
        } else {
            this._events.clear();
        }
        return this;
    }

    listeners(eventName: string): EventListener[] {
        return this._events.get(eventName)?.slice() || [];
    }

    rawListeners(eventName: string): EventListener[] {
        return this._events.get(eventName) || [];
    }

    listenerCount(eventName: string): number {
        return this._events.get(eventName)?.length || 0;
    }

    prependListener(eventName: string, listener: EventListener): this {
        if (!this._events.has(eventName)) {
            this._events.set(eventName, []);
        }

        const listeners = this._events.get(eventName)!;
        listeners.unshift(listener);

        if (listeners.length > this._maxListeners) {
            console.warn(
                `警告: 事件 '${eventName}' 有 ${listeners.length} 个监听器，超过了最大值 ${this._maxListeners}。`
            );
        }

        return this;
    }

    prependOnceListener(eventName: string, listener: EventListener): this {
        const wrapper: EventListener = async (...args) => {
            this.removeListener(eventName, wrapper);
            await listener(...args);
        };

        this.prependListener(eventName, wrapper);
        return this;
    }

    eventNames(): string[] {
        return Array.from(this._events.keys());
    }

    setMaxListeners(n: number): this {
        this._maxListeners = n;
        return this;
    }

    getMaxListeners(): number {
        return this._maxListeners;
    }

    async emit(eventName: string, ...args: any[]): Promise<void> {
        const listeners = this.listeners(eventName);
        const promises = listeners.map(listener => {
            try {
                return listener(...args);
            } catch (err) {
                return Promise.reject(err);
            }
        });

        await Promise.allSettled(promises);
    }
}

export default AsyncEventEmitter;