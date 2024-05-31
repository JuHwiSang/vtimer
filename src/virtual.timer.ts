import createRBTree, { Tree } from "functional-red-black-tree";
import { ExecutionInfo, ImmediateExecutionInfo } from "./base";
import { CallStackObserver, setPop, uniqueId } from "./utils";



export interface VirtualTimerOptions {
    startTime: number
}


export class VirtualTimer {
    protected currentTime: number
    protected timeline: Tree<[number, number], ExecutionInfo>
    protected intervalLocationMap: Record<number, ExecutionInfo>
    protected immediateExecSet: Set<ImmediateExecutionInfo>

    protected callStackObserver: CallStackObserver

    constructor(options?: Partial<VirtualTimerOptions>) {
        this.currentTime = options?.startTime ?? Date.now();
        this.timeline = createRBTree();
        this.intervalLocationMap = {}
        this.immediateExecSet = new Set();

        this.callStackObserver = new CallStackObserver();
        this.callStackObserver.onCallStackEmpty = () => this.onCallStackEmpty();
    }

    now() {
        return this.currentTime;
    }

    protected onCallStackEmpty() {

        if (this.immediateExecSet.size !== 0) {
            const nextExec = setPop(this.immediateExecSet);
            if (nextExec === undefined) {
                throw new Error("size is not 0, but nextExec is undefined");
            }
            nextExec._callback();
            return;
        }
        else if (this.timeline.keys.length !== 0) {
            const key = this.timeline.keys[0];
            const nextExec = this.timeline.get(key)!;
            this.timeline = this.timeline.remove(key);
            if (nextExec._interval) {
                const newExecInfo = Object.assign({}, nextExec, {_time: nextExec._time + nextExec._ms});
                this.reserveIntervalExecution(newExecInfo);
            }
            this.currentTime = nextExec._time;
            nextExec._callback();
            return;
        } else {
            this.callStackObserver.off();
        }
    }

    protected reserveExecution(execInfo: ExecutionInfo) {
        this.timeline = this.timeline.insert([execInfo._time, execInfo._id], execInfo);
        this.callStackObserver.on();
    }

    protected cancelExecution(execInfo: ExecutionInfo) {
        this.timeline = this.timeline.remove([execInfo._time, execInfo._id]);
    }

    protected reserveIntervalExecution(execInfo: ExecutionInfo) {
        this.reserveExecution(execInfo);
        this.intervalLocationMap[execInfo._id] = execInfo;
    }

    protected cancelIntervalExecution(execInfo: ExecutionInfo) {
        this.cancelExecution(this.intervalLocationMap[execInfo._id]);
        delete this.intervalLocationMap[execInfo._id];
    }

    protected reserveImmediateExecution(execInfo: ImmediateExecutionInfo) {
        this.immediateExecSet.add(execInfo);
        this.callStackObserver.on();
    }

    protected cancelImmediateExecution(execInfo: ImmediateExecutionInfo) {
        this.immediateExecSet.delete(execInfo)
    }

    setTimeout(callback: (args: void) => void, ms?: number): ExecutionInfo;
    setTimeout<T extends any[]>(callback: (...args: T) => any, ms?: number, ...args: T): ExecutionInfo;
    setTimeout<T extends any[]>(callback: (...args: T) => any, ms?: number, ...args: T): ExecutionInfo {
        ms = ms ?? 0;
        if (!(Number.isFinite(ms) && ms >= 0)) {
            throw new Error("ms must be finite number bigger than 0");
        }

        const execInfo: ExecutionInfo = {
            _id: uniqueId(),
            _callback: () => callback(...args),
            _time: this.now() + Math.max(0, Math.trunc(ms)),
            _interval: false,
            _ms: ms
        }
        this.reserveExecution(execInfo);
        return execInfo;
    }

    clearTimeout(execInfo: ExecutionInfo) {
        try {
            this.cancelExecution(execInfo);
        } catch {}
    }

    setInterval(callback: (args: void) => void, ms?: number): ExecutionInfo;
    setInterval<T extends any[]>(callback: (...args: T) => any, ms?: number, ...args: T): ExecutionInfo;
    setInterval<T extends any[]>(callback: (...args: T) => any, ms?: number, ...args: T): ExecutionInfo {
        ms = ms ?? 0;
        if (!(Number.isFinite(ms) && ms >= 0)) {
            throw new Error("ms must be finite number bigger than 0");
        }

        const execInfo: ExecutionInfo = {
            _id: uniqueId(),
            _callback: () => callback(...args),
            _time: this.now() + Math.max(0, Math.trunc(ms)),
            _interval: true,
            _ms: ms,
        }
        this.reserveIntervalExecution(execInfo);
        return execInfo;
    }

    clearInterval(execInfo: ExecutionInfo) {
        try {
            this.cancelIntervalExecution(execInfo);
        } catch {}
    }

    setImmediate(callback: (args: void) => void): ImmediateExecutionInfo;
    setImmediate<T extends any[]>(callback: (...args: T) => any, ...args: T): ImmediateExecutionInfo;
    setImmediate<T extends any[]>(callback: (...args: T) => any, ...args: T): ImmediateExecutionInfo {
        const execInfo: ImmediateExecutionInfo = {
            _id: uniqueId(),
            _callback: () => callback(...args),
        }
        this.reserveImmediateExecution(execInfo);
        return execInfo;
    }

    clearImmediate(execInfo: ImmediateExecutionInfo) {
        try {
            this.cancelImmediateExecution(execInfo);
        } catch {}
    }

    clearAll() {
        this.currentTime = Date.now();
        this.timeline = createRBTree();
        this.immediateExecSet = new Set();
        this.callStackObserver.off();
    }
}