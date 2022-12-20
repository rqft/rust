import { staticify } from '../../../tools';
import { Iterator, IteratorImpl } from '../iter/iterator';
import type { FnMut } from '../ops';
import type { slice } from './slice';

// @ts-expect-error ts(2714)
class SplitInclusiveImpl<T> extends IteratorImpl<IteratorImpl<T>> {
  constructor(v: slice<T>, f: FnMut<[T], boolean>) {
    super(
      (function* (): Generator<IteratorImpl<T>, void, unknown> {
        const out: Array<T> = [];

        for (const value of v) {
          out.push(value);
          if (f(value)) {
            yield Iterator(out);
          }
        }
      })()
    );
  }

  public static new<T>(
    ptr: slice<T>,
    f: FnMut<[T], boolean>
  ): SplitInclusive<T> {
    return new this(ptr, f);
  }
}

export type SplitInclusive<T> = SplitInclusiveImpl<T>;
export const SplitInclusive = staticify(SplitInclusiveImpl);
