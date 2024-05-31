let idNum = 1;
export function uniqueId() {
    return idNum++;
}

export function setPop<T>(set: Set<T>) : T | undefined {
    const val = set.values().next().value;
    set.delete(val);
    return val;
}

export class CallStackObserver {
    protected immediate?: NodeJS.Immediate
    public onCallStackEmpty?: () => any

    constructor() {}

    isOn() {
        return this.immediate !== undefined;
    }

    on() {
        if (this.immediate === undefined) {
            this.immediate = setImmediate(() => {
                if (this.onCallStackEmpty) {
                    this.off();
                    this.on();
                    this.onCallStackEmpty();
                }
            });
        }
    }

    off() {
        clearImmediate(this.immediate);
        delete this.immediate;
    }
}