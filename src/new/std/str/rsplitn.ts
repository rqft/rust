import { staticify } from '../../../tools';
import { DoubleEndedIterator } from '../iter';
import { IteratorImpl } from '../iter/iterator';
import type { int } from '../number/size';
import type { Matcher } from './pattern';
import type { str } from './str';

// @ts-expect-error ts(2714)
class RSplitNImpl extends IteratorImpl<str> {
  constructor(p: str, n: int, pattern: Matcher) {
    super(DoubleEndedIterator(p.splitn(n, pattern)).rev());
  }

  public static new(str: str, n: int, pattern: Matcher): RSplitNImpl {
    return new this(str, n, pattern);
  }
}

export type RSplitN = RSplitNImpl;
export const RSplitN = staticify(RSplitNImpl);
