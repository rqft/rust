import { staticify } from '../../../tools';
import { IteratorImpl } from '../iter/iterator';
import type { Matcher } from './pattern';
import { str } from './str';

// @ts-expect-error ts(2714)
class SplitInclusiveImpl extends IteratorImpl<str> {
  constructor(p: str, pattern: Matcher) {
    const n = str(pattern).alloc;
    super(
      p.alloc.split(n).map((x, i, p) => str(x + (i === p.length - 1 ? n : '')))
    );
  }

  public static new(str: str, pattern: Matcher): SplitInclusiveImpl {
    return new this(str, pattern);
  }
}

export type SplitInclusive = SplitInclusiveImpl;
export const SplitInclusive = staticify(SplitInclusiveImpl);
