import { staticify } from '../../tools';
import { IteratorImpl } from '../iter/iterator';
import type { Io } from './str';
import { str } from './str';

// @ts-expect-error ts(2714)
class SplitTerminatorImpl extends IteratorImpl<str> {
  constructor(p: str, pattern: Io) {
    const v = p.alloc.split(str(pattern).alloc);

    if (v[v.length - 1] === '') {
      v.pop();
    }

    super(v.map((x) => str(x)));
  }

  public static new(str: str, pattern: Io): SplitTerminatorImpl {
    return new this(str, pattern);
  }
}

export type SplitTerminator = SplitTerminatorImpl;
export const SplitTerminator = staticify(SplitTerminatorImpl);
