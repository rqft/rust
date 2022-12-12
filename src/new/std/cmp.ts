import type { Clone } from './clone';
import type { FnOnce } from './ops';
import { panic } from './panic';

export interface PartialEq<Rhs> {
  eq(other: Rhs): boolean;
  ne(other: Rhs): boolean;
}

export type Eq<Self> = PartialEq<Self>;

export interface PartialOrd<Rhs> extends PartialEq<Rhs> {
  partial_cmp(other: Rhs): Ordering;
  lt(other: Rhs): boolean;
  le(other: Rhs): boolean;
  gt(other: Rhs): boolean;
  ge(other: Rhs): boolean;
}

export class Ordering implements Clone<Ordering> {
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

  public then_with<F extends FnOnce<[], Ordering>>(f: F): Ordering {
    return this.then(f());
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

export function max_by<T extends Ord<T>, F extends FnOnce<[T, T], Ordering>>(
  v1: T,
  v2: T,
  compare: F
): T {
  const v = compare(v1, v2);

  if (v.is_gt()) {
    return v1;
  }

  return v2;
}

export function max_by_key<
  T extends Ord<T>,
  F extends FnOnce<[T], K>,
  K extends Ord<K>
>(v1: T, v2: T, f: F): T {
  const k1 = f(v1);
  const k2 = f(v2);

  if (k1.max(k2) === k1) {
    return v1;
  }

  return v2;
}

export function min<T extends Ord<T>>(v1: T, v2: T): T {
  return v1.min(v2);
}

export function min_by<T extends Ord<T>, F extends FnOnce<[T, T], Ordering>>(
  v1: T,
  v2: T,
  compare: F
): T {
  const v = compare(v1, v2);

  if (v.is_le()) {
    return v1;
  }

  return v2;
}

export function min_by_key<
  T extends Ord<T>,
  F extends FnOnce<[T], K>,
  K extends Ord<K>
>(v1: T, v2: T, f: F): T {
  const k1 = f(v1);
  const k2 = f(v2);

  if (k1.min(k2) === k1) {
    return v1;
  }

  return v2;
}

export function has_derivable_partial_eq<T, Rhs = T>(
  value: T
  // @ts-expect-error ts(2677)
): value is Pick<PartialEq<Rhs>, 'eq'> {
  return typeof value === 'object' && 'eq' in (value as object);
}

export function default_partial_eq<T, Rhs = T>(value: T): PartialEq<Rhs> {
  if (has_derivable_partial_eq<T, Rhs>(value)) {
    return {
      eq: value.eq,
      ne(other: Rhs): boolean {
        return !value.eq(other);
      },
    };
  }

  panic('PartialEq cannot be derived without eq method');
}

export function has_derivable_partial_ord<T, Rhs = T>(
  value: T
  // @ts-expect-error ts(2677)
): value is Pick<PartialOrd<Rhs>, 'eq' | 'partial_cmp'> {
  return (
    has_derivable_partial_eq<T, Rhs>(value) &&
    'partial_cmp' in (value as object)
  );
}

export function default_partial_ord<T, Rhs = T>(value: T): PartialOrd<Rhs> {
  if (has_derivable_partial_ord<T, Rhs>(value)) {
    return {
      eq: value.eq,
      partial_cmp: value.partial_cmp,

      lt(other): boolean {
        return value.partial_cmp(other).is_lt();
      },

      le(other): boolean {
        return value.partial_cmp(other).is_le();
      },

      gt(other): boolean {
        return value.partial_cmp(other).is_gt();
      },

      ge(other): boolean {
        return value.partial_cmp(other).is_ge();
      },

      ne(other): boolean {
        return !value.eq(other);
      },
    };
  }

  panic('PartialOrd cannot be derived without (eq, partial_cmp) methods');
}
