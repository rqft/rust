import { staticify } from '../../../tools';
import { IteratorImpl } from '../iter/iterator';
import type { int } from '../number/size';

import type { FnMut } from '../ops';
import type { slice } from './slice';

// @ts-expect-error ts(2714)
class RSplitNImpl<T> extends IteratorImpl<IteratorImpl<T>> {
  constructor(v: slice<T>, n: int, f: FnMut<[T], boolean>) {
    super(v.reverse().splitn(n, f));
  }

  public static new<T>(
    ptr: slice<T>,
    n: int,
    f: FnMut<[T], boolean>
  ): RSplitN<T> {
    return new this(ptr, n, f);
  }
}

export type RSplitN<T> = RSplitNImpl<T>;
export const RSplitN = staticify(RSplitNImpl);
