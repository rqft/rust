import { staticify } from '../../../tools';
import { Iterator, IteratorImpl } from '../iter/iterator';
import type { int } from '../number/size';
import { size } from '../number/size';
import type { FnMut } from '../ops';
import type { slice } from './slice';

// @ts-expect-error ts(2714)
class SplitNImpl<T> extends IteratorImpl<IteratorImpl<T>> {
  constructor(v: slice<T>, n: int, f: FnMut<[T], boolean>) {
    super(
      (function* (): Generator<IteratorImpl<T>, void, unknown> {
        let x = 0n;
        const out: Array<T> = [];

        for (const value of v) {
          if (f(value) && size(n).gt(x++)) {
            yield Iterator(out);
          }

          out.push(value);
        }

        yield Iterator(out);
      })()
    );
  }

  public static new<T>(
    ptr: slice<T>,
    n: int,
    f: FnMut<[T], boolean>
  ): SplitN<T> {
    return new this(ptr, n, f);
  }
}

export type SplitN<T> = SplitNImpl<T>;
export const SplitN = staticify(SplitNImpl);
