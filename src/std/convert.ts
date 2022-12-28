import { staticify } from '../tools';
import type { Deref, DerefMut } from './ops';

export type Infallible = never;
class RefImpl<Self, Output = Self> implements Deref<Output> {
  constructor(readonly self: Self, public value: Output) {}

  public static new<Self, Output>(
    self: Self,
    value: Output
  ): RefImpl<Self, Output> {
    return new this(self, value);
  }

  public deref(): Output {
    return Object.freeze(this.value);
  }
}

export type Ref<Self, T = Self> = RefImpl<Self, T>;
export const Ref = staticify(RefImpl);

class RefMutImpl<Self, Output = Self> implements DerefMut<Output> {
  constructor(readonly self: Self, public value: Output) {}

  public static new<Self, Output>(
    self: Self,
    value: Output
  ): RefMutImpl<Self, Output> {
    return new this(self, value);
  }

  public deref(): Output {
    return Object.freeze(this.value);
  }

  public deref_mut(): Output {
    return this.value;
  }
}

export type RefMut<Self, T = Self> = RefMutImpl<Self, T>;
export const RefMut = staticify(RefMutImpl);

export interface AsRef<Output> {
  as_ref(): Ref<this, Output>;
}

export interface AsMutRef<Output> {
  as_mut_ref(): Ref<this, Output>;
}

export interface From<T, Into> {
  from(value: T): Into;
}

export interface Into<T> {
  into<U>(f: (value: T) => U): U;
}

export interface Cast {
  /** @unsafe */
  cast<T>(): T;
}
