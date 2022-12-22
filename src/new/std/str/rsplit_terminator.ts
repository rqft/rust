import { staticify } from '../../../tools';
import { DoubleEndedIterator } from '../iter';
import { IteratorImpl } from '../iter/iterator';
import type { Io, str } from './str';

// @ts-expect-error ts(2714)
class RSplitTerminatorImpl extends IteratorImpl<str> {
  constructor(p: str, pattern: Io) {
    super(DoubleEndedIterator(p.split_terminator(pattern)).rev());
  }

  public static new(str: str, pattern: Io): RSplitTerminatorImpl {
    return new this(str, pattern);
  }
}

export type RSplitTerminator = RSplitTerminatorImpl;
export const RSplitTerminator = staticify(RSplitTerminatorImpl);
