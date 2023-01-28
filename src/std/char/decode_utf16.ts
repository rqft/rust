import { staticify } from "../../tools";
import type { _ } from "../custom";
import { IteratorImpl } from "../iter/iterator";
import { u16 } from "../number";
import type { io } from "../number/int_sized";
import type { Result } from "../result";
import { Err, Ok } from "../result";
import { char } from "./char";
import { DecodeUtf16Error } from "./decode_utf16_error";

// @ts-expect-error ts(2714)
class DecodeUtf16Impl extends IteratorImpl<
  Result<char<_>, DecodeUtf16Error<_>>
> {
  constructor(iter: Iterable<io<u16>>) {
    super(
      (function* (): Generator<
        Result<char<_>, DecodeUtf16Error<_>>,
        void,
        unknown
      > {
        for (let u of iter) {
          u = u16(u);
          try {
            yield Ok(char(String.fromCodePoint(Number(u))));
          } catch {
            yield Err(DecodeUtf16Error(u));
          }
        }
      })()
    );
  }

  public static new(iter: Iterable<io<u16>>): DecodeUtf16Impl {
    return new this(iter);
  }
}

export type DecodeUtf16 = DecodeUtf16Impl;
export const DecodeUtf16 = staticify(DecodeUtf16Impl);
