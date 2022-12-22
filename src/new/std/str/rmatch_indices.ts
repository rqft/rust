import { staticify } from '../../../tools';
import { DoubleEndedIterator } from '../iter';
import { IteratorImpl } from '../iter/iterator';
import type { usize } from '../number';
import type { Matcher } from './pattern';
import type { str } from './str';

// @ts-expect-error ts(2714)
class RMatchIndicesImpl extends IteratorImpl<[usize, str]> {
  constructor(p: str, pattern: Matcher) {
    super(DoubleEndedIterator(p.match_indices(pattern)).rev());
  }

  public static new(str: str, pattern: Matcher): RMatchIndicesImpl {
    return new this(str, pattern);
  }
}

export type RMatchIndices = RMatchIndicesImpl;
export const RMatchIndices = staticify(RMatchIndicesImpl);
