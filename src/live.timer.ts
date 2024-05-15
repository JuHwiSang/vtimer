import createRBTree, { Tree } from "functional-red-black-tree";
import { ExecutionInfo, ImmediateExecutionInfo, Timer } from "./base";
import { uniqueId } from "./utils";

export interface LiveTimerOptions {
}

const defaultOptions: LiveTimerOptions = {
}

export class LiveTimer implements Timer {

    protected options: LiveTimerOptions
    
    protected timeoutTree: Tree<number, NodeJS.Timeout>
    protected intervalTree: Tree<number, NodeJS.Timeout>
    protected immediateTree: Tree<number, NodeJS.Immediate>

    constructor(options?: Partial<LiveTimerOptions>) {
        this.options = {...defaultOptions, ...options};
        this.timeoutTree = createRBTree();
        this.intervalTree = createRBTree();
        this.immediateTree = createRBTree();
    }

    now(): number {
        return Date.now();
    }


    protected addTimeoutOnTree(id: number, timeout: NodeJS.Timeout) {
        this.timeoutTree = this.timeoutTree.insert(id, timeout);
    }

    protected removeTimeoutFromTree(id: number) {
        this.timeoutTree = this.timeoutTree.remove(id);
    }

    protected addIntervalOnTree(id: number, interval: NodeJS.Timeout) {
        this.intervalTree = this.intervalTree.insert(id, interval);
    }

    protected removeIntervalFromTree(id: number) {
        this.intervalTree = this.intervalTree.remove(id);
    }
    
    protected addImmediateOnTree(id: number, immediate: NodeJS.Immediate) {
        this.immediateTree = this.immediateTree.insert(id, immediate);
    }

    protected removeImmediateFromTree(id: number) {
        this.immediateTree = this.immediateTree.remove(id);
    }


    setTimeout(callback: (args: void) => void, ms?: number | undefined): ExecutionInfo;
    setTimeout<T extends any[]>(callback: (...args: T) => any, ms?: number | undefined, ...args: T): ExecutionInfo;
    setTimeout<T extends any[]>(callback: (...args: T) => any, ms?: number | undefined, ...args: T): ExecutionInfo {
        ms = ms ?? 0;
        if (!(Number.isFinite(ms) && ms >= 0)) {
            throw new Error("ms must be finite number bigger than 0");
        }

        const id = uniqueId();
        const _callback = () => {
            this.clearTimeout(execInfo);
            callback(...args);
        };
        const timeout = setTimeout(_callback, ms);
        this.addTimeoutOnTree(id, timeout);

        const execInfo: ExecutionInfo = {
            _id: id,
            _callback: _callback,
            _ms: ms,
            _time: this.now() + ms,
            _interval: false,
        }
        return execInfo;
    }

    setInterval(callback: (args: void) => void, ms?: number | undefined): ExecutionInfo;
    setInterval<T extends any[]>(callback: (...args: T) => any, ms?: number | undefined, ...args: T): ExecutionInfo;
    setInterval<T extends any[]>(callback: (...args: T) => any, ms?: number | undefined, ...args: T): ExecutionInfo {
        ms = ms ?? 0;
        if (!(Number.isFinite(ms) && ms >= 0)) {
            throw new Error("ms must be finite number bigger than 0");
        }
        
        const id = uniqueId();
        const _callback = () => {
            callback(...args);
        };
        const interval = setInterval(_callback, ms);
        this.addIntervalOnTree(id, interval);

        const execInfo: ExecutionInfo = {
            _id: id,
            _callback: _callback,
            _ms: ms,
            _time: this.now() + ms,
            _interval: true,
        }
        return execInfo;
    }

    setImmediate(callback: (args: void) => void): ImmediateExecutionInfo;
    setImmediate<T extends any[]>(callback: (...args: T) => any, ...args: T): ImmediateExecutionInfo;
    setImmediate<T extends any[]>(callback: (...args: T) => any, ...args: T): ImmediateExecutionInfo {
        const id = uniqueId();
        const _callback = () => {
            this.clearImmediate(execInfo);
            callback(...args);
        };
        const immediate = setImmediate(_callback);
        this.addImmediateOnTree(id, immediate);

        const execInfo: ImmediateExecutionInfo = {
            _id: id,
            _callback: _callback,
        }
        return execInfo;
    }

    clearTimeout(execInfo: ExecutionInfo): void {
        clearTimeout(this.timeoutTree.get(execInfo._id) ?? undefined);
        this.removeTimeoutFromTree(execInfo._id);
    }

    clearInterval(execInfo: ExecutionInfo): void {
        clearInterval(this.intervalTree.get(execInfo._id) ?? undefined);
        this.removeIntervalFromTree(execInfo._id);
    }

    clearImmediate(execInfo: ImmediateExecutionInfo): void {
        clearImmediate(this.immediateTree.get(execInfo._id) ?? undefined);
        this.removeImmediateFromTree(execInfo._id);
    }

    clearAll(): void {
        this.timeoutTree.forEach((key, value) => clearTimeout(value));
        this.intervalTree.forEach((key, value) => clearInterval(value));
        this.immediateTree.forEach((key, value) => clearImmediate(value));
        this.timeoutTree = createRBTree();
        this.intervalTree = createRBTree();
        this.immediateTree = createRBTree();
    }
}