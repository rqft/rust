import { staticify } from '../../../tools';
import { DoubleEndedIterator } from '../iter';
import { IteratorImpl } from '../iter/iterator';
import type { Matcher } from './pattern';
import type { str } from './str';

// @ts-expect-error ts(2714)
class RSplitImpl extends IteratorImpl<str> {
  constructor(p: str, pattern: Matcher) {
    super(DoubleEndedIterator(p.split(pattern)).rev());
  }

  public static new(str: str, pattern: Matcher): RSplitImpl {
    return new this(str, pattern);
  }
}

export type RSplit = RSplitImpl;
export const RSplit = staticify(RSplitImpl);
