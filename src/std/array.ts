import { staticify } from '../tools';
import { Iterator } from './iter';
import type { int } from './number/size';
import { size } from './number/size';
import type { FnMut } from './ops';
import { slice } from './slice';

type Rw<T> = globalThis.Array<T>;

class ArrayImpl<T> {
  constructor(private alloc: Rw<T>) {}
  public static new<T>(value: Rw<T>): ArrayImpl<T> {
    return new this(value);
  }

  public static with_length<T>(value: T, len: int): ArrayImpl<T> {
    len = size(len);
    const o: globalThis.Array<T> = [];
    for (let i = 0; i < len.valueOf(); i++) {
      o.push(value);
    }

    return new this<T>(o);
  }

  public *[Symbol.iterator](): Generator<T, void, unknown> {
    for (const value of this.alloc) {
      yield value;
    }
  }

  public map<U>(f: FnMut<[T], U>): array<U> {
    return Array(this.alloc.map(f));
  }

  public zip<U>(rhs: Iterable<U>): ArrayImpl<[T, U]> {
    return Array(globalThis.Array.from(Iterator(this).zip(rhs)));
  }

  public as_slice(): slice<T> {
    return slice(this.alloc);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type array<T> = ArrayImpl<T>;
export const Array = staticify(ArrayImpl);
