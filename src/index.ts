import { Timer } from "./base";
import { LiveTimer, LiveTimerOptions } from "./live.timer";
import { VirtualTimer, VirtualTimerOptions } from "./virtual.timer";
import { WrapperTimer } from "./wrapper.timer";

export * from "./virtual.timer";
export * from "./live.timer";
export * from "./wrapper.timer";
export * from "./base";



export function createTimer(): VirtualTimer;
export function createTimer<T extends "virtual" | "live">(mode?: T, options?: Partial<T extends "virtual" ? VirtualTimerOptions : LiveTimerOptions>): T extends "virtual" ? VirtualTimer : LiveTimer;
export function createTimer(mode: "virtual" | "live" = "virtual", options?: Partial<VirtualTimerOptions | LiveTimerOptions>): VirtualTimer | LiveTimer {
    if (mode === "virtual") {
        return new VirtualTimer(options);
    } else {
        return new LiveTimer(options);
    }
}

// Global Timer
export const timer = new WrapperTimer();
export function setGlobalTimer(timer: Timer): void;
export function setGlobalTimer(mode: "virtual" | "live", options?: Partial<VirtualTimerOptions | LiveTimerOptions>): void;
export function setGlobalTimer(timerOrMode: Timer | "virtual" | "live", options?: Partial<VirtualTimerOptions | LiveTimerOptions>) : void {
    if (timerOrMode instanceof Object) {
        timer.setTimer(timerOrMode);
    } else {
        timer.setTimer(createTimer(timerOrMode, options));
    }
}