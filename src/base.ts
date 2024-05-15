export interface ImmediateExecutionInfo {
    _id: number
    _callback: () => any
}

export interface ExecutionInfo extends ImmediateExecutionInfo {
    _time: number
    _ms: number
    _interval: boolean
}

export interface Timer {
    now(): number

    setTimeout(callback: (args: void) => void, ms?: number): ExecutionInfo;
    setTimeout<T extends any[]>(callback: (...args: T) => any, ms?: number, ...args: T): ExecutionInfo;
    clearTimeout(execInfo: ExecutionInfo): void;

    setInterval(callback: (args: void) => void, ms?: number): ExecutionInfo;
    setInterval<T extends any[]>(callback: (...args: T) => any, ms?: number, ...args: T): ExecutionInfo;
    clearInterval(execInfo: ExecutionInfo): void;

    setImmediate(callback: (args: void) => void): ImmediateExecutionInfo;
    setImmediate<T extends any[]>(callback: (...args: T) => any, ...args: T): ImmediateExecutionInfo;
    clearImmediate(execInfo: ImmediateExecutionInfo): void;

    clearAll(): void;
}