import { VirtualTimer, createTimer } from "../../src"

let timer: VirtualTimer;

let _timeoutArray: NodeJS.Timeout[];
function waitAndDone(done: () => any) {
    _timeoutArray.push(setTimeout(() => done(), 100));
}

beforeEach(() => {
    timer = createTimer();
    _timeoutArray = [];
});

afterEach(() => {
    timer.clearAll();
    _timeoutArray.forEach(clearTimeout);
});


test("simple immediate", (done) => {
    timer.setImmediate((a, b) => {
        expect(a).toBe(1);
        expect(b).toBe(2);

        done();
    }, 1, 2);
});

test("one immediate, then remove", (done) => {
    const immediate = timer.setImmediate(() => {
        done(new Error("immediate is executed"));
    });
    timer.clearImmediate(immediate);
    waitAndDone(done);
});

test("await immediate", async() => {
    await new Promise((res) => timer.setImmediate(res));
});

test("immediate is faster than timeout", (done) => {
    timer.setTimeout(() => {
        timer.clearAll();
        done(new Error("timeout is executed faster"));
    }, 0);
    timer.setImmediate(() => {
        timer.clearAll();
        done();
    });
});

test("immediate is faster than interval", (done) => {
    timer.setInterval(() => {
        timer.clearAll();
        done(new Error("interval is executed faster"));
    }, 0);
    timer.setImmediate(() => {
        timer.clearAll();
        done();
    });
});

// test("immediate faster than timeout which run right away", (done) => {
//     let step = 0;
//     timer.setTimeout(() => {
//         expect(step).toBe(0);
//         step++;

//         timer.setImmediate(() => {
//             expect(step).toBe(1);
//             done();
//         });
//     }, 1);
//     timer.setTimeout(() => {
//         done(new Error("second timeout is executed"));
//     }, 2);
// });


test("removed by clearAll", (done) => {
    timer.setImmediate(() => {
        done(new Error("immediate is executed"));
    });
    timer.clearAll();
    waitAndDone(done);
});