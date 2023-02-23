import { staticify } from '../../tools';
import { DoubleEndedIterator } from '../iter/index';
import { IteratorImpl } from '../iter/iterator';
import type { int } from '../number/size';
import type { Io, str } from './str';

// @ts-expect-error ts(2714)
class RSplitNImpl extends IteratorImpl<str> {
  constructor(p: str, n: int, pattern: Io) {
    super(DoubleEndedIterator(p.splitn(n, pattern)).rev());
  }

  public static new(str: str, n: int, pattern: Io): RSplitNImpl {
    return new this(str, n, pattern);
  }
}

export type RSplitN = RSplitNImpl;
export const RSplitN = staticify(RSplitNImpl);
