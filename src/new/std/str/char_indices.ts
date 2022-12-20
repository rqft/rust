import { staticify } from '../../../tools';
import { char } from '../char';
import type { _ } from '../custom';
import { IteratorImpl } from '../iter/iterator';
import { usize } from '../number';
import type { str } from './str';

// @ts-expect-error ts(2714)
class CharIndicesImpl extends IteratorImpl<[usize, char<_>]> {
  constructor(str: str) {
    super(
      (function* (): Generator<[usize, char<_>], void, unknown> {
        let i = 0n;
        for (const c of str.alloc) {
          yield [usize(i++), char(c)];
        }
      })()
    );
  }

  public static new(str: str): CharIndicesImpl {
    return new this(str);
  }
}

export type CharIndices = CharIndicesImpl;
export const CharIndices = staticify(CharIndicesImpl);
