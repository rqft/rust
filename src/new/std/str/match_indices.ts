import { staticify } from '../../../tools';
import { IteratorImpl } from '../iter/iterator';
import { usize } from '../number';
import type { Matcher } from './pattern';
import type { str } from './str';
// @ts-expect-error ts(2714)
class MatchIndicesImpl extends IteratorImpl<[usize, str]> {
  constructor(p: str, pattern: Matcher) {
    let n = 0;
    super(
      p.matches(pattern).map((x) => [usize(p.alloc.indexOf(x.alloc, n++)), x])
    );
  }

  public static new(str: str, pattern: Matcher): MatchIndicesImpl {
    return new this(str, pattern);
  }
}

export type MatchIndices = MatchIndicesImpl;
export const MatchIndices = staticify(MatchIndicesImpl);
