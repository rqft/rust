export type FnOnce<T> = () => T;
export type FnConsume<T> = (T: T) => T;
export type FnMap<T, U> = (T: T) => U;

export interface Eq<T> {
  eq(this: this, other: T): boolean;
  ne(this: this, other: T): boolean;
}

export interface Comparison<T> extends Eq<T> {
  cmp(this: this, other: T): Ordering;
  gt(this: this, other: T): boolean;
  ge(this: this, other: T): boolean;
  lt(this: this, other: T): boolean;
  le(this: this, other: T): boolean;
}

export abstract class PartialComparison<T> implements Comparison<T> {
  public abstract eq(this: this, other: T): boolean;
  public abstract cmp(this: this, other: T): Ordering;

  public ne(this: this, other: T): boolean {
    return !this.eq(other);
  }

  public lt(this: this, other: T): boolean {
    return this.cmp(other) === Ordering.Less;
  }

  public gt(this: this, other: T): boolean {
    return this.cmp(other) === Ordering.More;
  }

  public le(this: this, other: T): boolean {
    return !this.gt(other);
  }

  public ge(this: this, other: T): boolean {
    return !this.lt(other);
  }
}

export enum Ordering {
  Less = -1,
  Equal = 0,
  More = 1,
}

export interface Display {
  fmt(): string;
}

export interface Debug {
  fmtDebug(): string;
}

export interface Copy {
  clone(): unknown;
}

export interface Default {
  default(): unknown;
}

export interface Stringify {
  toString(): string;
}
