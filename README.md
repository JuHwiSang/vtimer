# Vtimer
> Virtual timer to help simulate time-sensitive programs.

It works like `setTimeout`, `setInterval` and `setImmediate`, but without delay.


# Example
```typescript
import { createTimer } from "vtimer";

const timer = createTimer();
timer.setTimeout(() => console.log('2'), 10000000);
console.log('1');

// Output
// 1
// 2
```

```typescript
import { createTimer } from "vtimer";

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
import { createTimer } from "vtimer";

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


If you want to change virtual timer to live timer, just add `"live"` argument.

From
```typescript
import { createTimer } from "vtimer";
const timer = createTimer(); // or createTimer("virtual")
```
to
```typescript
import { createTimer } from "vtimer";
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