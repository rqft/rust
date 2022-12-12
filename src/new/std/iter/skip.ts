import { staticify } from '../../../tools';
import { IteratorImpl } from './iterator';

// @ts-expect-error ts(2714)
class SkipImpl<T, N extends number> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>, n: N) {
    let i = 0;
    super(
      (function* (): Generator<T, void, unknown> {
        for (const item of iter) {
          if (i++ >= n) {
            yield item;
          }
        }
      })()
    );
  }

  public static new<T, N extends number>(
    iter: Iterable<T>,
    n: N
  ): SkipImpl<T, N> {
    return new this(iter, n);
  }
}

export type Skip<T, N extends number> = SkipImpl<T, N>;
export const Skip = staticify(SkipImpl);
