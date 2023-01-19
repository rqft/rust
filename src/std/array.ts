import { staticify } from '../tools';
import { Iterator } from './iter';
import { assert } from './macros';
import { usize } from './number';
import type { int } from './number/size';
import { size } from './number/size';
import type { FnMut } from './ops';
import { slice } from './slice';

type Rw<T> = globalThis.Array<T>;

class ArrayImpl<T> {
  private alloc: ReadonlyArray<T> = [];
  constructor(alloc: Rw<T>) {
    this.alloc = Object.freeze(alloc);
  }
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

  public map<U>(f: FnMut<[T], U>): Array<U> {
    return Array(this.alloc.map(f));
  }

  public zip<U>(rhs: Iterable<U>): ArrayImpl<[T, U]> {
    return Array(globalThis.Array.from(Iterator(this).zip(rhs)));
  }

  public as_slice(): slice<T> {
    return slice(this.alloc);
  }

  public get(index: int): T {
    index = Number(index);
    assert(index >= 0 && index < this.alloc.length);
    return this.alloc[index] as T;
  }

  public get_slice(start: int, end: int): ArrayImpl<T> {
    return new ArrayImpl(globalThis.Array.from(this.as_slice().get_slice(start, end).unwrap_unchecked()));
  }

  public len(): usize {
    return usize(this.alloc.length);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type Array<T> = ArrayImpl<T>;
export const Array = staticify(ArrayImpl);
