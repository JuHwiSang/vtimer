import createVTimer, { VTimer } from "../src"

let timer: VTimer;

let _timeoutArray: NodeJS.Timeout[];
function waitAndDone(done: () => any) {
    _timeoutArray.push(setTimeout(() => done(), 100));
}

beforeEach(() => {
    timer = createVTimer(0);
    _timeoutArray = [];
});

afterEach(() => {
    timer.clearAll();
    _timeoutArray.forEach(clearTimeout);
});


test("simple timeout", (done) => {
    let step = 0;
    timer.setTimeout((a, b) => {
        expect(timer.now()).toBe(10000);
        expect(step).toBe(1);
        expect(a).toBe(1);
        expect(b).toBe(2);
        done();
    }, 10000, 1, 2);
    expect(step).toBe(0);
    step++;
});

test("double timeout", (done) => {
    let count = 0;
    timer.setTimeout(() => {
        count++;
        if (count === 2) done();
    }, 10000);
    timer.setTimeout(() => {
        count++;
        if (count === 2) done();
    }, 10000);
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
    }, 10000);

    const secondTimeout = timer.setTimeout(() => {
        done(new Error("second timeout is executed"));
    }, 10000);
    timer.clearTimeout(secondTimeout);
});

test("double timeout, executed sequently", (done) => {
    let step = 0;
    timer.setTimeout(() => {
        expect(timer.now()).toBe(10000);
        expect(step).toBe(1);
        step++;
    }, 10000);
    timer.setTimeout(() => {
        expect(timer.now()).toBe(20000);
        expect(step).toBe(2);
        done();
    }, 20000);
    expect(step).toBe(0);
    step++;
});

test("double timeout, remove second from first", (done) => {
    timer.setTimeout(() => {
        timer.clearTimeout(secondTimeout);
        waitAndDone(done);
    }, 10000);
    const secondTimeout = timer.setTimeout(() => {
        done(new Error("second timeout is executed"));
    }, 20000);
});

test("await timeout", async () => {
    await new Promise((res) => timer.setTimeout(res, 10000));
    expect(timer.now()).toBe(10000);
});

test("await timeout in timeout", (done) => {
    timer.setTimeout(async () => {
        await new Promise((res) => timer.setTimeout(res, 10000));
        expect(timer.now()).toBe(20000);
        done();
    }, 10000);
});

test("timeout in timeout", (done) => {
    timer.setTimeout(() => {
        timer.setTimeout(() => {
            expect(timer.now()).toBe(20000);
            done();
        }, 10000);
    }, 10000);
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
    }, 10000);
    timer.clearAll();
    waitAndDone(done);
});