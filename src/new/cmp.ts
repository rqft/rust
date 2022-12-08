export namespace cmp {
  export interface PartialEq<Self, Rhs = Self> {
    eq(this: Self, other: Rhs): boolean;
    ne(this: Self, other: Rhs): boolean;
  }

  export type Eq<Self> = PartialEq<Self>;

  export interface PartialOrd<Self, Rhs = Self> {
    partial_cmp(this: Self, other: Rhs): Ordering
  }

  export namespace Ordering {
    export enum OrderingValue {
        Less = -1,
        Equal = 0,
        More = 1,
    }
    export interface Ordering {
        value: Ordering,
        is_eq(): boolean,
        is_ne(): boolean
    }
    export class Less {}
  }
}
