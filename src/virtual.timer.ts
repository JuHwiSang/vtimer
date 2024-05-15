import createRBTree, { Tree } from "functional-red-black-tree";
import { ExecutionInfo, ImmediateExecutionInfo } from "./base";
import { uniqueId } from "./utils";




export interface VirtualTimerOptions {
    startTime: number
}

export class VirtualTimer {
    protected currentTime: number
    protected timeline: Tree<number, ExecutionInfo[]>
    protected intervalLocationMap: Record<number, ExecutionInfo>
    protected immediateQueue: ImmediateExecutionInfo[]

    protected callStackEmptyImmediate?: NodeJS.Immediate

    constructor(options?: Partial<VirtualTimerOptions>) {
        this.currentTime = options?.startTime ?? Date.now();
        this.timeline = createRBTree();
        this.intervalLocationMap = {}
        this.immediateQueue = [];
    }

    now() {
        return this.currentTime;
    }

    protected onCallStackEmpty() {
        delete this.callStackEmptyImmediate;

        if (this.immediateQueue.length !== 0) {
            const nextExec = this.immediateQueue.shift()!;
            nextExec._callback();
            this.updateCallStackEmptyImmediate();
            return;
        }
        else {
            const nextExec = this.popNextExecutionOfTimeline();
            if (nextExec._interval) {
                const newExecInfo = Object.assign({}, nextExec, {_time: nextExec._time + nextExec._ms});
                this.reserveIntervalExecution(newExecInfo);
            }
            this.currentTime = nextExec._time;
            nextExec._callback();
            this.updateCallStackEmptyImmediate();
            return;
        }
    }

    protected popNextExecutionOfTimeline() {
        if (this.timeline.length === 0) {
            throw new Error("timeline is empty");
        }

        const execArray = this.timeline.get(this.timeline.keys[0])!;
        if (execArray.length === 0) {
            throw new Error("execArray is empty");
        }

        const poped = execArray.shift()!;
        if (execArray.length === 0) {
            this.timeline = this.timeline.remove(this.timeline.keys[0]);
        }

        return poped;
    }

    protected updateCallStackEmptyImmediate() {
        if (this.timeline.length + this.immediateQueue.length === 0) {
            clearImmediate(this.callStackEmptyImmediate);
            delete this.callStackEmptyImmediate;
            return;
        }

        if (this.callStackEmptyImmediate === undefined && (this.timeline.length + this.immediateQueue.length !== 0)) {
            this.callStackEmptyImmediate = setImmediate(this.onCallStackEmpty.bind(this));
            return;
        }
    }

    protected reserveExecution(execInfo: ExecutionInfo) {
        const execArray = this.timeline.get(execInfo._time);
        if (execArray) {
            execArray.push(execInfo);
        }
        else {
            this.timeline = this.timeline.insert(execInfo._time, [execInfo]);
        }
        
        this.updateCallStackEmptyImmediate();
    }

    protected cancelExecution(execInfo: ExecutionInfo) {
        const execArray = this.timeline.get(execInfo._time);
        if (!execArray) {
            throw new Error(`no execution is reserved on time '${execInfo._time}'`);
        }

        const execIndex = execArray.findIndex((val) => val._id === execInfo._id);
        if (execIndex === -1) {
            throw new Error(`given execution is not reserved on time '${execInfo._time}'`);
        }

        execArray.splice(execIndex, 1);
        if (execArray.length === 0) {
            this.timeline = this.timeline.remove(execInfo._time);
        }

        this.updateCallStackEmptyImmediate();
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
        this.immediateQueue.push(execInfo);
        this.updateCallStackEmptyImmediate();
    }

    protected cancelImmediateExecution(execInfo: ImmediateExecutionInfo) {
        const execIndex = this.immediateQueue.findIndex((val) => val._id === execInfo._id);
        if (execIndex === -1) {
            throw new Error("given execution does not exist on immediate queue");
        }

        this.immediateQueue.splice(execIndex, 1);
        this.updateCallStackEmptyImmediate();
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
        this.immediateQueue = [];
        clearImmediate(this.callStackEmptyImmediate);
        delete this.callStackEmptyImmediate;
    }
}