import { staticify } from '../../../tools';
import { Ref, RefMut } from '../convert';
import type { Option } from '../option';
import { None, Some } from '../option';
import { IteratorImpl } from './iterator';

class PeekableImpl<T> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>) {
    super(iter);
  }

  public peek(): Option<Ref<this, T>> {
    const clone = Object.assign({}, this[Symbol.iterator]());
    const item = clone.next();

    if (item.done) {
      return None;
    }

    return Some(Ref(this, item.value));
  }

  public peek_mut(): Option<RefMut<this, T>> {
    const clone = Object.assign({}, this[Symbol.iterator]());
    const item = clone.next();

    if (item.done) {
      return None;
    }

    return Some(RefMut(this, item.value));
  }

  public static new<T>(iter: Iterable<T>): PeekableImpl<T> {
    return new this(iter);
  }
}

export type Peekable<T> = PeekableImpl<T>;
export const Peekable = staticify(PeekableImpl);
