import { staticify } from '../../tools';
import { Iterator, IteratorImpl } from '../iter/iterator';
import type { FnMut } from '../ops/index';
import type { slice } from './slice';

// @ts-expect-error ts(2714)
class SplitImpl<T> extends IteratorImpl<IteratorImpl<T>> {
  constructor(v: slice<T>, f: FnMut<[T], boolean>) {
    super(
      (function* (): Generator<IteratorImpl<T>, void, unknown> {
        const out: Array<T> = [];

        for (const value of v) {
          if (f(value)) {
            yield Iterator(out);
          }

          out.push(value);
        }
      })()
    );
  }

  public static new<T>(ptr: slice<T>, f: FnMut<[T], boolean>): Split<T> {
    return new this(ptr, f);
  }
}

export type Split<T> = SplitImpl<T>;
export const Split = staticify(SplitImpl);
