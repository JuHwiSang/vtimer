import { LiveTimer, createTimer } from "../../src"

let timer: LiveTimer;

let _timeoutArray: NodeJS.Timeout[];
function waitAndDone(done: () => any) {
    _timeoutArray.push(setTimeout(() => done(), 100));
}

beforeEach(() => {
    timer = createTimer("live");
    _timeoutArray = [];
});

afterEach(() => {
    timer.clearAll();
    _timeoutArray.forEach(clearTimeout);
});


test("simple timeout", (done) => {
    let step = 0;
    timer.setTimeout((a, b) => {
        expect(step).toBe(1);
        expect(a).toBe(1);
        expect(b).toBe(2);
        done();
    }, 10, 1, 2);
    expect(step).toBe(0);
    step++;
});

test("double timeout", (done) => {
    let count = 0;
    timer.setTimeout(() => {
        count++;
        if (count === 2) done();
    }, 10);
    timer.setTimeout(() => {
        count++;
        if (count === 2) done();
    }, 10);
});

test("one timeout, then remove", (done) => {
    const timeout = timer.setTimeout(() => {
        done(new Error("timeout is executed"));
    });
    timer.clearTimeout(timeout);
    waitAndDone(done);
});

test("double timeout, remove one", (done) => {
    timer.setTimeout(() => {
        waitAndDone(done);
    }, 10);

    const secondTimeout = timer.setTimeout(() => {
        done(new Error("second timeout is executed"));
    }, 10);
    timer.clearTimeout(secondTimeout);
});

test("double timeout, executed sequently", (done) => {
    let step = 0;
    timer.setTimeout(() => {
        expect(step).toBe(1);
        step++;
    }, 10);
    timer.setTimeout(() => {
        expect(step).toBe(2);
        done();
    }, 20);
    expect(step).toBe(0);
    step++;
});

test("double timeout, remove second from first", (done) => {
    timer.setTimeout(() => {
        timer.clearTimeout(secondTimeout);
        waitAndDone(done);
    }, 10);
    const secondTimeout = timer.setTimeout(() => {
        done(new Error("second timeout is executed"));
    }, 20);
});

test("await timeout", async () => {
    await new Promise((res) => timer.setTimeout(res, 10));
});

test("await timeout in timeout", (done) => {
    timer.setTimeout(async () => {
        await new Promise((res) => timer.setTimeout(res, 10));
        done();
    }, 10);
});

test("timeout in timeout", (done) => {
    timer.setTimeout(() => {
        timer.setTimeout(() => {
            done();
        }, 10);
    }, 10);
});



test("only finite ms>0", () => {
    expect(() => timer.setTimeout(() => {}, -1)).toThrow();
    expect(() => timer.setTimeout(() => {}, Infinity)).toThrow();
    expect(() => timer.setTimeout(() => {}, NaN)).toThrow();
    timer.setTimeout(() => {}, 0);
});

test("removed by clearAll", (done) => {
    timer.setTimeout(() => {
        done(new Error("timeout is executed"));
    }, 10);
    timer.clearAll();
    waitAndDone(done);
});