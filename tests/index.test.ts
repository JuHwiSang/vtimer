import { LiveTimer, VirtualTimer, createTimer } from "../src"

test("creating with no arguments will create VirtualTimer", () => {
    const timer = createTimer();
    expect(timer).toBeInstanceOf(VirtualTimer);
});

test("create virtual timer", () => {
    const timer = createTimer("virtual");
    expect(timer).toBeInstanceOf(VirtualTimer);
});

test("create virtual timer with options", () => {
    const timer = createTimer("virtual", {startTime: 0});
    expect(timer).toBeInstanceOf(VirtualTimer);
    expect(timer.now()).toBe(0);
});

test("create live timer", () => {
    const timer = createTimer("live");
    expect(timer).toBeInstanceOf(LiveTimer);
});