/// <reference types="node" />
import { Tree } from "functional-red-black-tree";
export interface ImmediateExecutionInfo {
    _id: number;
    _callback: () => any;
}
export interface ExecutionInfo extends ImmediateExecutionInfo {
    _time: number;
    _ms: number;
    _interval: boolean;
}
export declare class VTimer {
    protected currentTime: number;
    protected timeline: Tree<number, ExecutionInfo[]>;
    protected intervalLocationMap: Record<number, ExecutionInfo>;
    protected immediateQueue: ImmediateExecutionInfo[];
    protected callStackEmptyImmediate?: NodeJS.Immediate;
    constructor(startTime?: number);
    now(): number;
    protected onCallStackEmpty(): void;
    protected popNextExecutionOfTimeline(): ExecutionInfo;
    protected updateCallStackEmptyImmediate(): void;
    protected reserveExecution(execInfo: ExecutionInfo): void;
    protected cancelExecution(execInfo: ExecutionInfo): void;
    protected reserveIntervalExecution(execInfo: ExecutionInfo): void;
    protected cancelIntervalExecution(execInfo: ExecutionInfo): void;
    protected reserveImmediateExecution(execInfo: ImmediateExecutionInfo): void;
    protected cancelImmediateExecution(execInfo: ImmediateExecutionInfo): void;
    setTimeout(callback: (args: void) => void, ms?: number): ExecutionInfo;
    setTimeout<T extends any[]>(callback: (...args: T) => any, ms?: number, ...args: T): ExecutionInfo;
    clearTimeout(execInfo: ExecutionInfo): void;
    setInterval(callback: (args: void) => void, ms?: number): ExecutionInfo;
    setInterval<T extends any[]>(callback: (...args: T) => any, ms?: number, ...args: T): ExecutionInfo;
    clearInterval(execInfo: ExecutionInfo): void;
    setImmediate(callback: (args: void) => void): ExecutionInfo;
    setImmediate<T extends any[]>(callback: (...args: T) => any, ...args: T): ExecutionInfo;
    clearImmediate(execInfo: ImmediateExecutionInfo): void;
    clearAll(): void;
}
export default function createVTimer(startTime?: number): VTimer;
