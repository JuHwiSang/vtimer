import { LiveTimer, LiveTimerOptions } from "./live.timer";
import { VirtualTimer, VirtualTimerOptions } from "./virtual.timer";

export * from "./virtual.timer";
export * from "./live.timer";
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