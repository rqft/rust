import { staticify } from '../../tools';
import { IteratorImpl } from '../iter/iterator';
import type { int } from '../number/size';
import type { slice } from './slice';

// @ts-expect-error ts(2714)
class RChunksImpl<T, N extends int> extends IteratorImpl<IteratorImpl<T>> {
  constructor(n: N, v: slice<T>) {
    super(v.reverse().chunks(n));
  }

  public static new<T, N extends int>(n: N, ptr: slice<T>): RChunks<T, N> {
    return new this(n, ptr);
  }
}

export type RChunks<T, N extends int> = RChunksImpl<T, N>;
export const RChunks = staticify(RChunksImpl);
