import { staticify } from '../../tools';
import { DoubleEndedIterator } from '../iter/index';
import { IteratorImpl } from '../iter/iterator';
import type { usize } from '../number/index';
import type { Io, str } from './str';

// @ts-expect-error ts(2714)
class RMatchIndicesImpl extends IteratorImpl<[usize, str]> {
  constructor(p: str, pattern: Io) {
    super(DoubleEndedIterator(p.match_indices(pattern)).rev());
  }

  public static new(str: str, pattern: Io): RMatchIndicesImpl {
    return new this(str, pattern);
  }
}

export type RMatchIndices = RMatchIndicesImpl;
export const RMatchIndices = staticify(RMatchIndicesImpl);
