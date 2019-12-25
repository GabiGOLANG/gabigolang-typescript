export const not = a => !a;
export const equal = (a, b) => a === b;
export const or = (a, b) => a || b;
export const and = (a, b) => a && b;
export const lessThan = (a, b) => a < b;
export const greaterThan = (a, b) => a > b;
export const lessThanOrEqual = (a, b) => or(lessThan(a, b), equal(a, b));
export const greaterThanOrEqual = (a, b) => or(greaterThan(a, b), equal(a, b));
export const plus = (a, b) => a + b;
export const minus = (a, b) => a - b;
export const times = (a, b) => a * b;
export const divide = (a, b) => a / b;
export const mod = (a, b) => a % b;
export const negate = a => -a;
export const isTruthy = value => !!value;

export type Maybe<T> = T | null | undefined;
