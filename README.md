# Vtimer
> Virtual timer to help simulate time-sensitive programs.

It works like `setTimeout`, `setInterval` and `setImmediate`, but without delay.


# Example

simple example
```typescript
import { timer } from "@juhwisang/vtimer";

timer.setTimeout(() => console.log(2), 999999);
console.log(1);
// Output
// 1
// 2
```

complex example
```typescript
import { timer } from "@juhwisang/vtimer";

timer.setTimeout(async () => {
    console.log(2);
    await new Promise((res) => timer.setTimeout(res, 20000));
    console.log(4);
}, 10000);

timer.setTimeout(() => {
    console.log(3);
}, 20000);

console.log(1);

// Output
// 1
// 2
// 3
// 4
```

performance
```typescript
import { timer } from "@juhwisang/vtimer";

console.time('time');
let count = 0;

for(let i=0; i<100_000; i++) {
    timer.setImmediate(() => {
        count++;
        if (count >= 100_000) {
            console.log(2);
            console.timeEnd('time');
        }
    });
}

console.log(1);

// Output
// 1
// 2
// time: 1.882s
```

create virtual timer
```typescript
import { createTimer } from "vtimer";

const timer = createTimer("virtual");

console.time("time");
timer.setTimeout(() => {
    console.log(2);
    console.timeEnd("time");
}, 1000);

console.log(1);

// Output
// 1
// 2
// time: 5.237ms
```

create live timer
```typescript
import { createTimer } from "vtimer";

const timer = createTimer("live");

console.time("time");
timer.setTimeout(() => {
    console.log(2);
    console.timeEnd("time");
}, 1000);

console.log(1);

// Output
// 1
// 2
// time: 1.011s
```

If you want to change virtual global timer to live global timer, just add:

```typescript
import { setGlobalTimer } from "@juhwisang/vtimer";
setGlobalTimer("live");
```
or
```typescript
import { setGlobalTimer, createTimer } from "@juhwisang/vtimer";
setGlobalTimer(createTimer("live"));
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