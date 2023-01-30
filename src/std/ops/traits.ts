import type { ArrayOf } from '../custom';

export interface Add<Rhs, Output = Rhs> {
  add(other: Rhs): Output;
}

export interface AddAssign<Rhs, Output = Rhs> {
  add_assign(other: Rhs): Output;
}

export interface BitAnd<Rhs, Output = Rhs> {
  bitand(other: Rhs): Output;
}

export interface BitAndAssign<Rhs, Output = Rhs> {
  bitand_assign(other: Rhs): Output;
}

export interface BitOr<Rhs, Output = Rhs> {
  bitor(other: Rhs): Output;
}

export interface BitOrAssign<Rhs, Output = Rhs> {
  bitor_assign(other: Rhs): Output;
}

export interface BitXor<Rhs, Output = Rhs> {
  bitxor(other: Rhs): Output;
}

export interface BitXorAssign<Rhs, Output = Rhs> {
  bitxor_assign(other: Rhs): Output;
}

export interface Deref<Target> {
  deref(): Target;
}

export interface DerefMut<Target> extends Deref<Target> {
  deref_mut(): Target;
}

export interface Div<Rhs, Output = Rhs> {
  div(other: Rhs): Output;
}

export interface DivAssign<Rhs, Output = Rhs> {
  div_assign(other: Rhs): Output;
}

export interface Drop {
  drop(): void;
}

export type Fn<Args, Output = void> = (...args: ArrayOf<Args>) => Output;
export type FnMut<Args, Output = void> = Fn<Args, Output>;
export type FnOnce<Args, Output = void> = Fn<Args, Output>;

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
  mul(other: Rhs): Output;
}

export interface MulAssign<Rhs, Output = Rhs> {
  mul_assign(other: Rhs): Output;
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
  rem(other: Rhs): Output;
}

export interface RemAssign<Rhs, Output = Rhs> {
  rem_assign(other: Rhs): Output;
}

export interface Shl<Rhs, Output = Rhs> {
  shl(other: Rhs): Output;
}

export interface ShlAssign<Rhs, Output = Rhs> {
  shl_assign(other: Rhs): Output;
}

export interface Shr<Rhs, Output = Rhs> {
  shr(other: Rhs): Output;
}

export interface ShrAssign<Rhs, Output = Rhs> {
  shr_assign(other: Rhs): Output;
}

export interface Sub<Rhs, Output = Rhs> {
  sub(other: Rhs): Output;
}

export interface SubAssign<Rhs, Output = Rhs> {
  sub_assign(other: Rhs): Output;
}

export interface Assign<Rhs> {
  assign(other: Rhs): this;
}

export interface Construct<Args extends Array<unknown>, Output> {
  new (...args: Args): Output;
}
