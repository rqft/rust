import { staticify } from '../../tools';
import type { ops } from './ops';

export namespace convert {
  export type Infallible = never;
  export class Ref<Self, Output> implements ops.Deref<Output> {
    constructor(readonly self: Self, public value: Output) {}

    public static new<Self, Output>(
      self: Self,
      value: Output
    ): Ref<Self, Output> {
      return new this(self, value);
    }

    public deref(): Output {
      return Object.freeze(this.value);
    }
  }

  export const ref = staticify(Ref);

  export class RefMut<Self, Output> implements ops.DerefMut<Output> {
    constructor(readonly self: Self, public value: Output) {}

    public static new<Self, Output>(
      self: Self,
      value: Output
    ): RefMut<Self, Output> {
      return new this(self, value);
    }

    public deref(): Output {
      return Object.freeze(this.value);
    }

    public deref_mut(): Output {
      return this.value;
    }
  }

  export const ref_mut = staticify(RefMut);

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
    into(): T;
  }
}
