import { staticify } from '../../../tools';
import { IteratorImpl } from '../iter/iterator';
import { u8 } from '../number';
import type { str } from './str';

// @ts-expect-error ts(2714)
class BytesImpl extends IteratorImpl<u8> {
  constructor(str: str) {
    super(
      (function* (): Generator<u8, void, unknown> {
        for (const c of str.as_bytes()) {
          yield u8(c);
        }
      })()
    );
  }

  public static new(str: str): BytesImpl {
    return new this(str);
  }
}

export type Bytes = BytesImpl;
export const Bytes = staticify(BytesImpl);
