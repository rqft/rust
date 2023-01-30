import { staticify } from '../../tools';
import { Iterator, IteratorImpl } from '../iter/iterator';
import type { int } from '../number/size';
import { size } from '../number/size';
import type { slice } from './slice';

// @ts-expect-error ts(2714)
class WindowsImpl<T, N extends int> extends IteratorImpl<IteratorImpl<T>> {
  constructor(n: N, v: slice<T>) {
    const p = Number(size(n));
    super(
      (function* (): Generator<IteratorImpl<T>, void, unknown> {
        if (p > v.ptr.length) {
          return;
        }

        for (let i = 0; i < v.ptr.length; i++) {
          const slice = v.get_slice(i, i + p);
          if (slice.is_some()) {
            yield Iterator(slice.unwrap());
          }
        }
      })()
    );
  }

  public static new<T, N extends int>(n: N, ptr: slice<T>): Windows<T, N> {
    return new this(n, ptr);
  }
}

export type Windows<T, N extends int> = WindowsImpl<T, N>;
export const Windows = staticify(WindowsImpl);
