import { staticify } from '../../tools';
import { IteratorImpl } from '../iter/iterator';
import { u16 } from '../number';
import type { Option } from '../option';
import { Some } from '../option';
import type { Chars } from './chars';

// @ts-expect-error ts(2714)
class EncodeUtf16Impl extends IteratorImpl<u16> {
  constructor(private chars: Chars, private extra: u16) {
    super();
  }

  public next(): Option<u16> {
    if (this.extra.ne(0)) {
      const tmp = this.extra;
      this.extra = u16(0);
      return Some(tmp);
    }

    let buf = [u16(0), u16(0)] as [u16, u16?];

    return this.chars.next().map((ch) => {
      buf = ch.encode_utf16() as [u16, u16?];
      if (buf.length === 2) {
        this.extra = buf[1] as u16;
      }

      return buf[0];
    });
  }

  public static new(chars: Chars, extra: u16): EncodeUtf16Impl {
    return new this(chars, extra);
  }
}

export type EncodeUtf16 = EncodeUtf16Impl;
export const EncodeUtf16 = staticify(EncodeUtf16Impl);
