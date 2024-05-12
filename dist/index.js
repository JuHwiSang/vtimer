"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VTimer = void 0;
const functional_red_black_tree_1 = __importDefault(require("functional-red-black-tree"));
let idNum = 1;
function uniqueId() {
    return idNum++;
}
class VTimer {
    constructor(startTime) {
        this.currentTime = startTime !== null && startTime !== void 0 ? startTime : Date.now();
        this.timeline = (0, functional_red_black_tree_1.default)();
        this.intervalLocationMap = {};
        this.immediateQueue = [];
    }
    now() {
        return this.currentTime;
    }
    onCallStackEmpty() {
        delete this.callStackEmptyImmediate;
        if (this.immediateQueue.length !== 0) {
            const nextExec = this.immediateQueue.shift();
            nextExec._callback();
            this.updateCallStackEmptyImmediate();
            return;
        }
        else {
            const nextExec = this.popNextExecutionOfTimeline();
            if (nextExec._interval) {
                const newExecInfo = Object.assign({}, nextExec, { _time: nextExec._time + nextExec._ms });
                this.reserveIntervalExecution(newExecInfo);
            }
            this.currentTime = nextExec._time;
            nextExec._callback();
            this.updateCallStackEmptyImmediate();
            return;
        }
    }
    popNextExecutionOfTimeline() {
        if (this.timeline.length === 0) {
            throw new Error("timeline is empty");
        }
        const execArray = this.timeline.get(this.timeline.keys[0]);
        if (execArray.length === 0) {
            throw new Error("execArray is empty");
        }
        const poped = execArray.shift();
        if (execArray.length === 0) {
            this.timeline = this.timeline.remove(this.timeline.keys[0]);
        }
        return poped;
    }
    updateCallStackEmptyImmediate() {
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
    reserveExecution(execInfo) {
        const execArray = this.timeline.get(execInfo._time);
        if (execArray) {
            execArray.push(execInfo);
        }
        else {
            this.timeline = this.timeline.insert(execInfo._time, [execInfo]);
        }
        this.updateCallStackEmptyImmediate();
    }
    cancelExecution(execInfo) {
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
    reserveIntervalExecution(execInfo) {
        this.reserveExecution(execInfo);
        this.intervalLocationMap[execInfo._id] = execInfo;
    }
    cancelIntervalExecution(execInfo) {
        this.cancelExecution(this.intervalLocationMap[execInfo._id]);
        delete this.intervalLocationMap[execInfo._id];
    }
    reserveImmediateExecution(execInfo) {
        this.immediateQueue.push(execInfo);
        this.updateCallStackEmptyImmediate();
    }
    cancelImmediateExecution(execInfo) {
        const execIndex = this.immediateQueue.findIndex((val) => val._id === execInfo._id);
        if (execIndex === -1) {
            throw new Error("given execution does not exist on immediate queue");
        }
        this.immediateQueue.splice(execIndex, 1);
        this.updateCallStackEmptyImmediate();
    }
    setTimeout(callback, ms, ...args) {
        ms = ms !== null && ms !== void 0 ? ms : 0;
        if (!(Number.isFinite(ms) && ms >= 0)) {
            throw new Error("ms must be finite number bigger than 0");
        }
        const execInfo = {
            _id: uniqueId(),
            _callback: () => callback(...args),
            _time: this.now() + Math.max(0, Math.trunc(ms)),
            _interval: false,
            _ms: ms
        };
        this.reserveExecution(execInfo);
        return execInfo;
    }
    clearTimeout(execInfo) {
        this.cancelExecution(execInfo);
    }
    setInterval(callback, ms, ...args) {
        ms = ms !== null && ms !== void 0 ? ms : 0;
        if (!(Number.isFinite(ms) && ms >= 0)) {
            throw new Error("ms must be finite number bigger than 0");
        }
        const execInfo = {
            _id: uniqueId(),
            _callback: () => callback(...args),
            _time: this.now() + Math.max(0, Math.trunc(ms)),
            _interval: true,
            _ms: ms,
        };
        this.reserveIntervalExecution(execInfo);
        return execInfo;
    }
    clearInterval(execInfo) {
        this.cancelIntervalExecution(execInfo);
    }
    setImmediate(callback, ...args) {
        const execInfo = {
            _id: uniqueId(),
            _callback: () => callback(...args),
        };
        this.reserveImmediateExecution(execInfo);
        return execInfo;
    }
    clearImmediate(execInfo) {
        this.cancelImmediateExecution(execInfo);
    }
    clearAll() {
        this.currentTime = Date.now();
        this.timeline = (0, functional_red_black_tree_1.default)();
        this.immediateQueue = [];
        clearImmediate(this.callStackEmptyImmediate);
        delete this.callStackEmptyImmediate;
    }
}
exports.VTimer = VTimer;
function createVTimer(startTime) {
    return new VTimer(startTime);
}
exports.default = createVTimer;
