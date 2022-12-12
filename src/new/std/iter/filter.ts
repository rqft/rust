import { staticify } from '../../../tools';
import type { FnMut } from '../ops';
import { IteratorImpl } from './iterator';

// @ts-expect-error ts(2714)
class FilterImpl<T, P extends FnMut<[T], boolean>> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>, f: P) {
    const p = iter[Symbol.iterator]();
    super(
      (function* (): Generator<T, void, undefined> {
        const item = p.next();

        if (f(item.value)) {
          yield item.value;
        }
      })()
    );
  }

  public static new<T, P extends FnMut<[T], boolean>>(
    iter: Iterable<T>,
    f: P
  ): FilterImpl<T, P> {
    return new this(iter, f);
  }
}

export type Filter<T, P extends FnMut<[T], boolean>> = FilterImpl<T, P>;
export const Filter = staticify(FilterImpl);
