# Vtimer
> Virtual timer to help simulate time-sensitive programs.

It works like `setTimeout`, `setInterval` and `setImmediate`, but without delay.


# Example
```typescript
import createVTimer from "vtimer";

const timer = createVTimer();
timer.setTimeout(() => console.log('2'), 10000000);
console.log('1');

// Output
// 1
// 2
```

```typescript
import createVTimer from "vtimer";

const timer = createVTimer();

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
import createVTimer from "vtimer";

const timer = createVTimer();

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


# Documentation

### `VTimer`
- `setTimeout`
- `setInterval`
- `setImmediate`
- `clearTimeout`
- `clearInterval`
- `clearImmediate`
- `clearAll`



# Caution
Do not use `timer.setTimeout` with NodeJS `setTimeout`. Unexpected behavior may occur.