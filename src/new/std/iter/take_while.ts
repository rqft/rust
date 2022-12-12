import { staticify } from '../../../tools';
import type { FnMut } from '../ops';
import type { Option } from '../option';
import { None } from '../option';
import { IteratorImpl } from './iterator';

// @ts-expect-error ts(2714)
class TakeWhileImpl<T, P extends FnMut<[T], boolean>> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>, private predicate: P) {
    super(iter);
  }

  private hit_false = false;

  public next(): Option<T> {
    if (this.hit_false) {
      return None;
    }

    const value = super.next();

    if (value.is_some_and(this.predicate)) {
      return value;
    }

    return None;
  }

  public static new<T, P extends FnMut<[T], boolean>>(
    iter: Iterable<T>,
    predicate: P
  ): TakeWhileImpl<T, P> {
    return new this(iter, predicate);
  }
}

export type TakeWhile<T, P extends FnMut<[T], boolean>> = TakeWhileImpl<T, P>;
export const TakeWhile = staticify(TakeWhileImpl);
