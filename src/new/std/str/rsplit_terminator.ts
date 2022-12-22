import { staticify } from '../../../tools';
import { DoubleEndedIterator } from '../iter';
import { IteratorImpl } from '../iter/iterator';
import type { Matcher } from './pattern';
import type { str } from './str';

// @ts-expect-error ts(2714)
class RSplitTerminatorImpl extends IteratorImpl<str> {
  constructor(p: str, pattern: Matcher) {
    super(DoubleEndedIterator(p.split_terminator(pattern)).rev());
  }

  public static new(str: str, pattern: Matcher): RSplitTerminatorImpl {
    return new this(str, pattern);
  }
}

export type RSplitTerminator = RSplitTerminatorImpl;
export const RSplitTerminator = staticify(RSplitTerminatorImpl);
