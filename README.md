# Vtimer
> Virtual timer to help simulate time-sensitive programs.

It works like `setTimeout`, `setInterval` and `setImmediate`, but without delay.

**This package was developed only for my other projects.**


# Example
```typescript
import { createTimer } from "@juhwisang/vtimer";

const timer = createTimer();
timer.setTimeout(() => console.log('2'), 10000000);
console.log('1');

// Output
// 1
// 2
```

```typescript
import { createTimer } from "@juhwisang/vtimer";

const timer = createTimer();

const interval = timer.setInterval(() => console.log('interval'), 10000);
timer.setTimeout(() => {
    timer.clearInterval(interval);
    console.log('5');
}, 30001);
console.log('1');

// Output
// 1
// interval
// interval
// interval
// 5
```

```typescript
import { createTimer } from "@juhwisang/vtimer";

const timer = createTimer();

timer.setTimeout(async () => {
    console.log('2');
    await new Promise((res) => timer.setTimeout(res, 20000));
    console.log('4');
}, 10000);

timer.setTimeout(() => {
    console.log('3');
}, 20000);

console.log('1');

// Output
// 1
// 2
// 3
// 4
```


Moderately fast.
```typescript
import { createTimer } from "@juhwisang/vtimer";

const timer = createTimer();

let count = 0;
const timeout = timer.setInterval(() => count++, 10000);

console.log('start');
timer.setTimeout(() => {
    console.log('count:', count);
    timer.clearInterval(timeout);
}, 10000*1000000 + 1);

// Output(delay: 2.5 sec)
// start
// count: 1000000
```


If you want to change virtual timer to live timer, just add `"live"` argument.

From
```typescript
import { createTimer } from "@juhwisang/vtimer";
const timer = createTimer(); // or createTimer("virtual")
```
to
```typescript
import { createTimer } from "@juhwisang/vtimer";
const timer = createTimer("live");
```


# Documentation

### `Timer`
- `now`
- `setTimeout`
- `setInterval`
- `setImmediate`
- `clearTimeout`
- `clearInterval`
- `clearImmediate`
- `clearAll`



# Caution
Do not use `timer.setTimeout` with NodeJS `setTimeout`. Unexpected behavior may occur.