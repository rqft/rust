import { staticify } from '../../../tools';
import type { _ } from '../custom';
import { IteratorImpl } from '../iter/iterator';
import { panic } from '../panic';
import type { Result } from '../result';
import { Err, Ok } from '../result';
import { char } from './char';
import { DecodeUtf16Error } from './decode_utf16_error';

// @ts-expect-error ts(2714)
class DecodeUtf16Impl extends IteratorImpl<
  Result<char<_>, DecodeUtf16Error<_>>
> {
  constructor(iter: Iterable<number>) {
    super(
      (function* (): Generator<
        Result<char<_>, DecodeUtf16Error<_>>,
        void,
        unknown
        > {
        for (const u32 of iter) {
          if (u32 < 0 || u32 > 2 ** 32) {
            panic('Invalid u32 value');
          }

          try {
            yield Ok(char(String.fromCodePoint(u32)));
          } catch {
            yield Err(DecodeUtf16Error(u32));
          }
        }
      })()
    );
  }

  public static new(iter: Iterable<number>): DecodeUtf16Impl {
    return new this(iter);
  }
}

export type DecodeUtf16 = DecodeUtf16Impl;
export const DecodeUtf16 = staticify(DecodeUtf16Impl);
