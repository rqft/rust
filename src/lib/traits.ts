import type { Option } from './option';

export type FnOnce<T> = () => T;
export type FnConsume<T> = (T: T) => unknown;
export type FnMap<T, U> = (T: T) => U;

export namespace cmp {
  export interface PartialEq {
    eq(other: this): boolean;
    ne(other: this): boolean;
  }

  export enum Ordering {
    Less = -1,
    Equal = 0,
    Greater = 1,
  }

  export interface PartialOrd {
    partial_cmp(other: this): Option<Ordering>;
    lt(other: this): boolean;
    le(other: this): boolean;
    gt(other: this): boolean;
    ge(other: this): boolean;
  }

  export function max<T extends PartialOrd>(a: T, b: T): T {
    if (a.ge(b)) {
      return a;
    }
    return b;
  }

  export function min<T extends PartialOrd>(a: T, b: T): T {
    if (a.le(b)) {
      return a;
    }
    return b;
  }
}

export namespace iter {
  export function is<T>(value: unknown): value is Iterable<T> {
    return Symbol.iterator in (value as never);
  }

  export interface Partition<T> {
    true: T;
    false: T;
  }
}
