export namespace ops {
  export interface Add<Rhs, Output> {
    add(this: Rhs, other: Rhs): Output;
  }

  export interface AddAssign<Rhs, Output> {
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

  export interface Fn<Args extends Array<unknown>, Output> {
    call(...args: Args): Output;
  }

  export interface FnMut<Args extends Array<unknown>, Output> {
    call_mut(...args: Args): Output;
  }

  export interface FnOnce<Args extends Array<unknown>, Output> {
    call_once(...args: Args): Output;
  }

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
}
