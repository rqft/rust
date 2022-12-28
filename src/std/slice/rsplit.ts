import { staticify } from '../../tools';
import { IteratorImpl } from '../iter/iterator';

import type { FnMut } from '../ops';
import type { slice } from './slice';

// @ts-expect-error ts(2714)
class RSplitImpl<T> extends IteratorImpl<IteratorImpl<T>> {
  constructor(v: slice<T>, f: FnMut<[T], boolean>) {
    super(v.reverse().split(f));
  }

  public static new<T>(ptr: slice<T>, f: FnMut<[T], boolean>): RSplit<T> {
    return new this(ptr, f);
  }
}

export type RSplit<T> = RSplitImpl<T>;
export const RSplit = staticify(RSplitImpl);
