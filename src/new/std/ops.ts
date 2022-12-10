import { staticify } from '../../tools';

export interface Add<Rhs, Output = Rhs> {
  add(this: Rhs, other: Rhs): Output;
}

export interface AddAssign<Rhs, Output = Rhs> {
  add_assign(this: Rhs, other: Rhs): Output;
}

export interface BitAnd<Rhs, Output = Rhs> {
  bitand(this: Rhs, other: Rhs): Output;
}

export interface BitAndAssign<Rhs, Output = Rhs> {
  bitand_assign(this: Rhs, other: Rhs): Output;
}

export interface BitOr<Rhs, Output = Rhs> {
  bitor(this: Rhs, other: Rhs): Output;
}

export interface BitOrAssign<Rhs, Output = Rhs> {
  bitor_assign(this: Rhs, other: Rhs): Output;
}

export interface Deref<Target> {
  deref(): Target;
}

export interface DerefMut<Target> extends Deref<Target> {
  deref_mut(): Target;
}

export interface Div<Rhs, Output = Rhs> {
  div(this: Rhs, other: Rhs): Output;
}

export interface DivAssign<Rhs, Output = Rhs> {
  div_assign(this: Rhs, other: Rhs): Output;
}

export interface Drop {
  drop(): void;
}

export class Fn<Args extends Array<unknown> = [], Output = void> {
  constructor(protected readonly fn: (...args: Args) => Output) {}

  public call(...args: Args): Readonly<Output> {
    return Object.freeze(this.fn(...args));
  }

  public static new<Args extends Array<unknown> = [], Output = void>(
    fn: (...args: Args) => Output
  ): Fn<Args, Output> {
    return new this(fn);
  }
}

export const fn = staticify(Fn);

export class FnMut<Args extends Array<unknown> = [], Output = void> extends Fn<
  Args,
  Output
> {
  public call_mut(...args: Args): Output {
    return this.fn(...args);
  }

  public static new<Args extends Array<unknown> = [], Output = void>(
    fn: (...args: Args) => Output
  ): FnMut<Args, Output> {
    return new this(fn);
  }
}

export const fn_mut = staticify(FnMut);

export class FnOnce<Args extends Array<unknown> = [], Output = void> extends Fn<
  Args,
  Output
> {
  protected called = false;
  call_once(...args: Args): Output {
    this.called = true;
    return this.fn(...args);
  }

  public static new<Args extends Array<unknown> = [], Output = void>(
    fn: (...args: Args) => Output
  ): FnOnce<Args, Output> {
    return new this(fn);
  }
}

export const fn_once = staticify(FnOnce);

export type Indexable<Idx, Output> = Idx extends PropertyKey
  ? Record<Idx, Output>
  : Record<never, never>;

export type Index<Idx, Output> = Indexable<Idx, Output> & {
  index(index: Idx): Output;
};

export type IndexMut<Idx, Output> = Index<Idx, Output> & {
  index_mut(index: Idx): Output;
};

export interface Mul<Rhs, Output = Rhs> {
  mul(this: Rhs, other: Rhs): Output;
}

export interface MulAssign<Rhs, Output = Rhs> {
  mul_assign(this: Rhs, other: Rhs): Output;
}

export interface Neg<Output> {
  neg(): Output;
}

export interface Not<Output> {
  not(): Output;
}

export interface RangeBounds<T> {
  start_bound(): Bound;
  end_bound(): Bound;

  contains(item: T): boolean;
}

export enum Bound {
  Included,
  Excluded,
  Unbounded,
}

export interface Rem<Rhs, Output = Rhs> {
  rem(this: Rhs, other: Rhs): Output;
}

export interface RemAssign<Rhs, Output = Rhs> {
  rem_assign(this: Rhs, other: Rhs): Output;
}

export interface Shl<Rhs, Output = Rhs> {
  shl(this: Rhs, other: Rhs): Output;
}

export interface ShlAssign<Rhs, Output = Rhs> {
  shl_assign(this: Rhs, other: Rhs): Output;
}

export interface Shr<Rhs, Output = Rhs> {
  shr(this: Rhs, other: Rhs): Output;
}

export interface ShrAssign<Rhs, Output = Rhs> {
  shr_assign(this: Rhs, other: Rhs): Output;
}

export interface Sub<Rhs, Output = Rhs> {
  sub(this: Rhs, other: Rhs): Output;
}

export interface SubAssign<Rhs, Output = Rhs> {
  sub_assign(this: Rhs, other: Rhs): Output;
}

export interface Construct<Args extends Array<unknown>, Output> {
  new (...args: Args): Output;
}
