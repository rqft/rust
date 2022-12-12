import { staticify } from '../../../tools';
import type { FnMut } from '../ops';
import { IteratorImpl } from './iterator';

// @ts-expect-error ts(2714)
class FlatMapImpl<T, U> extends IteratorImpl<U> {
  constructor(iter: Iterable<T>, f: FnMut<[T], Iterable<U>>) {
    super(
      (function* (): Generator<U, void, unknown> {
        for (const item of iter) {
          for (const value of f(item)) {
            yield value;
          }
        }
      })()
    );
  }

  public static new<T, U>(
    iter: Iterable<T>,
    f: FnMut<[T], Iterable<U>>
  ): FlatMapImpl<T, U> {
    return new this(iter, f);
  }
}

export type FlatMap<T, U> = FlatMapImpl<T, U>;
export const FlatMap = staticify(FlatMapImpl);
