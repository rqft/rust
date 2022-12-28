import { staticify } from '../../tools';
import { IteratorImpl } from '../iter/iterator';
import type { int } from '../number/size';
import { size } from '../number/size';
import type { Io } from './str';
import { str } from './str';

// @ts-expect-error ts(2714)
class SplitNImpl extends IteratorImpl<str> {
  constructor(v: str, n: int, pattern: Io) {
    super(
      (function* (): Generator<str, void, unknown> {
        let i = 0n;
        const o = [];
        for (const part of v.split(pattern)) {
          if (size(n).ge(i++)) {
            yield part;
          }

          o.push(part.alloc);
        }

        if (o.length) {
          yield str(o.join(str(pattern).alloc));
        }
      })()
    );
  }

  public static new(ptr: str, n: int, pattern: Io): SplitN {
    return new this(ptr, n, pattern);
  }
}

export type SplitN = SplitNImpl;
export const SplitN = staticify(SplitNImpl);
