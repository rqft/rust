import type { clone } from './clone';
import type { ops } from './ops';

export namespace cmp {
  export interface PartialEq<Self, Rhs = Self> {
    eq(this: Self, other: Rhs): boolean;
    ne(this: Self, other: Rhs): boolean;
  }

  export type Eq<Self> = PartialEq<Self>;

  export interface PartialOrd<Self, Rhs = Self> extends PartialEq<Self, Rhs> {
    partial_cmp(this: Self, other: Rhs): Ordering;
    lt(this: Self, other: Rhs): boolean;
    le(this: Self, other: Rhs): boolean;
    gt(this: Self, other: Rhs): boolean;
    ge(this: Self, other: Rhs): boolean;
  }

  export class Ordering implements clone.Clone<Ordering> {
    constructor(public value: Ordering.Item) {}
    public clone(): Ordering {
      return new Ordering(this.value);
    }

    public clone_from(source: this): this {
      return source;
    }

    public is_eq(): boolean {
      return this.value === 0;
    }

    public is_ne(): boolean {
      return !this.is_eq();
    }

    public is_lt(): boolean {
      return this.value === -1;
    }

    public is_gt(): boolean {
      return this.value === 1;
    }

    public is_le(): boolean {
      return this.is_eq() || this.is_lt();
    }

    public is_ge(): boolean {
      return this.is_eq() || this.is_gt();
    }

    public reverse(): Ordering {
      if (this.is_eq()) {
        return this;
      }

      if (this.is_lt()) {
        return Ordering.Greater;
      }

      return Ordering.Less;
    }

    public then(other: Ordering): Ordering {
      if (this.is_eq()) {
        return other;
      }

      return this;
    }

    public then_with<F extends ops.FnOnce<[], Ordering>>(f: F): Ordering {
      return this.then(f.call_once());
    }
  }
  export namespace Ordering {
    export type Item = -1 | 0 | 1;
    export const Less = new Ordering(-1);
    export const Equal = new Ordering(0);
    export const Greater = new Ordering(1);
  }

  export interface Ord<Self extends PartialOrd<unknown>>
    extends Eq<Self>,
      PartialOrd<Self> {
    cmp(other: Self): Ordering;
    max(other: Self): Self;
    min(other: Self): Self;
    clamp(min: Self, max: Self): Self;
  }

  export function max<T extends Ord<T>>(v1: T, v2: T): T {
    return v1.max(v2);
  }

  export function max_by<
    T extends Ord<T>,
    F extends ops.FnOnce<[T, T], Ordering>
  >(v1: T, v2: T, compare: F): T {
    const v = compare.call_once(v1, v2);

    if (v.is_gt()) {
      return v1;
    }

    return v2;
  }

  export function max_by_key<
    T extends Ord<T>,
    F extends ops.FnOnce<[T], K>,
    K extends Ord<K>
  >(v1: T, v2: T, f: F): T {
    const k1 = f.call_once(v1);
    const k2 = f.call_once(v2);

    if (k1.max(k2) === k1) {
      return v1;
    }

    return v2;
  }

  export function min<T extends Ord<T>>(v1: T, v2: T): T {
    return v1.min(v2);
  }

  export function min_by<
    T extends Ord<T>,
    F extends ops.FnOnce<[T, T], Ordering>
  >(v1: T, v2: T, compare: F): T {
    const v = compare.call_once(v1, v2);

    if (v.is_le()) {
      return v1;
    }

    return v2;
  }

  export function min_by_key<
    T extends Ord<T>,
    F extends ops.FnOnce<[T], K>,
    K extends Ord<K>
  >(v1: T, v2: T, f: F): T {
    const k1 = f.call_once(v1);
    const k2 = f.call_once(v2);

    if (k1.min(k2) === k1) {
      return v1;
    }

    return v2;
  }
}
