export type FnOnce<T> = () => T;
export type FnConsume<T> = (T: T) => T;
export type FnMap<T, U> = (T: T) => U;

export interface Comparison<T> {
  eq(this: this, other: T): boolean;
  ne(this: this, other: T): boolean;
  cmp(this: this, other: T): Ordering;
  gt(this: this, other: T): boolean;
  ge(this: this, other: T): boolean;
  lt(this: this, other: T): boolean;
  le(this: this, other: T): boolean;
}

export enum Ordering {
  Less = -1,
  Equal = 0,
  More = 1,
}
