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


test("simple interval", async () => {
    let count = 0;
    const interval = timer.setInterval((a, b) => {
        expect(a).toBe(1);
        expect(b).toBe(2);
        count++;
    }, 100, 1, 2);
    timer.setTimeout(() => timer.clearInterval(interval), 350);
    
    await new Promise((res) => timer.setTimeout(res, 400));
    expect(count).toBe(3);
});

test("one inteval, then remove", (done) => {
    const interval = timer.setInterval(() => {
        done(new Error("interval is executed"));
    });
    timer.clearInterval(interval);
    waitAndDone(done);
});


test("only finite ms>0", () => {
    expect(() => timer.setInterval(() => {}, -1)).toThrow();
    expect(() => timer.setInterval(() => {}, Infinity)).toThrow();
    expect(() => timer.setInterval(() => {}, NaN)).toThrow();
    timer.setInterval(() => {}, 0);
});

test("removed by clearAll", (done) => {
    timer.setInterval(() => {
        done(new Error("interval is executed"));
    }, 10);
    timer.clearAll();
    waitAndDone(done);
});