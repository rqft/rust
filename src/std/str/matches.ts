import { staticify } from '../../tools';
import { IteratorImpl } from '../iter/iterator';
import type { Io } from './str';
import { str } from './str';

// @ts-expect-error ts(2714)
class MatchesImpl extends IteratorImpl<str> {
  constructor(p: str, pattern: Io) {
    super((p.alloc.match(str(pattern).alloc) || []).map((x) => str(x)));
  }

  public static new(str: str, pattern: Io): MatchesImpl {
    return new this(str, pattern);
  }
}

export type Matches = MatchesImpl;
export const Matches = staticify(MatchesImpl);
