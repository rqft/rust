import { staticify } from '../../tools';
import { char } from '../char/index';
import type { _ } from '../custom';
import { IteratorImpl } from '../iter/iterator';
import type { str } from './str';

// @ts-expect-error ts(2714)
class CharsImpl extends IteratorImpl<char<_>> {
  constructor(str: str) {
    super(
      (function* (): Generator<char<_>, void, unknown> {
        for (const c of str.alloc) {
          yield char(c);
        }
      })()
    );
  }

  public static new(str: str): CharsImpl {
    return new this(str);
  }
}

export type Chars = CharsImpl;
export const Chars = staticify(CharsImpl);
