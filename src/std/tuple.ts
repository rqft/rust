import { staticify } from '../tools';
import type { Into } from './convert';
import { size } from './number/size';

class TupleImpl<T extends Array<unknown>> implements Into<T> {
  constructor(private readonly alloc: T) {}

  public static new<T extends Array<unknown>>(alloc: T): TupleImpl<T> {
    return new this(alloc);
  }

  // only support raw
  public get<U extends number>(index: U): T[U] {
    return this.alloc[size(index).into(Number)];
  }

  public into<U>(f: (value: T) => U): U {
    return f(this.alloc);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type tuple<T extends Array<unknown>> = TupleImpl<T>;
export const tuple = staticify(TupleImpl);

class UnitImpl extends TupleImpl<[]> {
  constructor() {
    super([]);
  }

  public get<U extends number>(index: U): never {
    void index;
    return undefined as never;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type unit = UnitImpl;
export const unit = staticify(UnitImpl);
