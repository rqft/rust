import { staticify } from '../../../tools';
import { IteratorImpl } from '../iter/iterator';
import type { int } from '../number/size';
import type { slice } from './slice';

// @ts-expect-error ts(2714)
class RChunksExactImpl<T, N extends int> extends IteratorImpl<IteratorImpl<T>> {
  constructor(n: N, v: slice<T>) {
    super(v.reverse().chunks_exact(n));
  }

  public static new<T, N extends int>(n: N, ptr: slice<T>): RChunksExact<T, N> {
    return new this(n, ptr);
  }
}

export type RChunksExact<T, N extends int> = RChunksExactImpl<T, N>;
export const RChunksExact = staticify(RChunksExactImpl);
