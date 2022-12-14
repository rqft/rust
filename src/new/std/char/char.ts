import { staticify } from '../../../tools';
import type { StrToArray } from '../../../types';
import { bool } from '../bool';
import type { _ } from '../custom';
import type { Option } from '../option';
import { None, Some } from '../option';
import { panic } from '../panic';
import { DecodeUtf16 } from './decode_utf16';

export const radii = '0123456789abcdefghijklmnopqrstuvwxyz' as const;
class CharImpl<T extends string> {
  constructor(private value: T) {
    const i = value.codePointAt(0) || 0;

    if (
      value.length !== 1 ||
      i > 0x10ffff ||
      i < 0 ||
      (i >= 0xd800 && i <= 0xdfff)
    ) {
      panic('Invalid character');
    }
  }

  public static readonly max: char<'\u{10ffff}'> = new this('\u{10ffff}');
  public static readonly replacement_char: char<'\u{fffd}'> = new this(
    '\u{fffd}'
  );

  public static new<T extends string>(value: T): CharImpl<T> {
    return new this(value);
  }

  public static decode_utf16(iter: Iterable<number>): DecodeUtf16 {
    return DecodeUtf16(iter);
  }

  public static from_u32(u32: number): Option<CharImpl<_>> {
    if (u32 < 0 || u32 > 2 ** 32) {
      panic('Invalid u32 value');
    }

    try {
      return Some(new this(String.fromCodePoint(u32)));
    } catch {
      return None;
    }
  }

  public static from_u32_unchecked(u32: number): CharImpl<_> {
    return new this(String.fromCodePoint(u32));
  }

  public static readonly radii = radii;

  public static from_digit<U extends RadiiIdx | 0 | 1>(
    u32: U,
    radix: RadiiIdx
    // @ts-expect-error ts(2344)
  ): Option<CharImpl<StrToArray<typeof radii>[U]>> {
    if (u32 < 0 || u32 > radix) {
      return None;
    }

    return Some(char(this.radii[u32] as typeof radii[U])) as never;
  }

  public is_digit(radix: RadiiIdx): bool<_> {
    const idx = CharImpl.radii.indexOf(this.value);

    return bool(idx > 0 && idx <= radix);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type char<T extends string> = CharImpl<T>;
export const char = staticify(CharImpl);

export type RadiiIdx =
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36;
