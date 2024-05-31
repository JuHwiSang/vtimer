import { createTimer } from ".";
import { ExecutionInfo, ImmediateExecutionInfo, Timer } from "./base";

export class WrapperTimer implements Timer {
    constructor(private _timer: Timer = createTimer()) {}

    setTimer(_timer: Timer): void {
        this._timer.clearAll();
        this._timer = _timer;
    }

    now(): number {
        return this._timer.now();
    }

    setTimeout(callback: (args: void) => void, ms?: number): ExecutionInfo;
    setTimeout<T extends any[]>(callback: (...args: T) => any, ms?: number, ...args: T): ExecutionInfo;
    setTimeout<T extends any[]>(callback: (...args: T) => any, ms?: number, ...args: T): ExecutionInfo {
        return this._timer.setTimeout(callback, ms, ...args);
    }

    setInterval(callback: (args: void) => void, ms?: number): ExecutionInfo;
    setInterval<T extends any[]>(callback: (...args: T) => any, ms?: number, ...args: T): ExecutionInfo;
    setInterval<T extends any[]>(callback: (...args: T) => any, ms?: number, ...args: T): ExecutionInfo {
        return this._timer.setInterval(callback, ms, ...args);
    }

    setImmediate(callback: (args: void) => void): ImmediateExecutionInfo;
    setImmediate<T extends any[]>(callback: (...args: T) => any, ...args: T): ImmediateExecutionInfo;
    setImmediate<T extends any[]>(callback: (...args: T) => any, ...args: T): ImmediateExecutionInfo {
        return this._timer.setImmediate(callback, ...args);
    }

    clearTimeout(execInfo: ExecutionInfo): void {
        return this._timer.clearTimeout(execInfo);
    }

    clearInterval(execInfo: ExecutionInfo): void {
        return this._timer.clearInterval(execInfo);
    }

    clearImmediate(execInfo: ImmediateExecutionInfo): void {
        return this._timer.clearImmediate(execInfo);
    }

    clearAll(): void {
        return this._timer.clearAll();
    }
}