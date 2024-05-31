import { timer, setGlobalTimer } from "../src"

let _timeoutArray: NodeJS.Timeout[];
function waitAndDone(done: () => any) {
    _timeoutArray.push(setTimeout(() => done(), 100));
}

beforeEach(() => {
    setGlobalTimer("virtual");
    _timeoutArray = [];
});

afterEach(() => {
    timer.clearAll();
    _timeoutArray.forEach(clearTimeout);
});


test("overrided global timer will be clearedAll", (done) => {
    timer.setTimeout(() => {
        done(new Error("timeout is executed"));
    });
    timer.setInterval(() => {
        done(new Error("interval is executed"));
    });
    timer.setImmediate(() => {
        done(new Error("immediate is executed"));
    });
    setGlobalTimer("virtual");
    waitAndDone(done);
});

test("live timer will cause delays", (done) => {
    setGlobalTimer("live");
    const startTime = Date.now();
    timer.setTimeout(() => {
        expect(Date.now() - startTime > 80).toBe(true);
        expect(Date.now() - startTime < 120).toBe(true);
        done();
    }, 100);
});

test("change the global timer twice", (done) => {
    setGlobalTimer("live");
    setGlobalTimer("virtual");
    timer.setTimeout(() => {
        done();
    }, 10000);
});