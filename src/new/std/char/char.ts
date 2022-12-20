import { radii, staticify } from '../../../tools';
import type { IndexOf, RadiiIdx, StrToArray } from '../../../types';
import type { int } from '../number/size';
import { size, SizeImpl } from '../number/size';
// import { boolean } from '../bool';
import type { Ord } from '../cmp';
import { default_partial_ord, Ordering } from '../cmp';
import type { _ } from '../custom';
import type { Option } from '../option';
import { None, Some } from '../option';
import { panic } from '../panic';
import { DecodeUtf16 } from './decode_utf16';
import { EscapeDebug } from './escape_debug';
import { EscapeDefault } from './escape_default';
import { EscapeUnicode } from './escape_unicode';
import type { ToAsciiLowercase, ToAsciiUppercase } from './types';

class CharImpl<T extends string> implements Ord<char<_>> {
  public value: T;
  constructor(value: int | T) {
    if (typeof value === 'number' || typeof value === 'bigint') {
      value = size(value);
    }

    if (value instanceof SizeImpl) {
      value = String.fromCodePoint(value.into(Number)) as T;
    }

    const i = value.codePointAt(0) || 0;

    if (
      value.length !== 1 ||
      i > 0x10ffff ||
      i < 0 ||
      (i >= 0xd800 && i <= 0xdfff)
    ) {
      panic('Invalid character');
    }

    this.value = value;
  }

  public static readonly max: char<'\u{10ffff}'> = new this('\u{10ffff}');
  public static readonly replacement_char: char<'\u{fffd}'> = new this(
    '\u{fffd}'
  );

  public static new<T extends string>(value: int | T): CharImpl<T> {
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

  public static from_digit<U extends RadiiIdx | 0 | 1>(
    u32: U,
    radix: RadiiIdx
    // @ts-expect-error ts(2344)
  ): Option<CharImpl<StrToArray<typeof radii>[U]>> {
    if (u32 < 0 || u32 > radix) {
      return None;
    }

    return Some(char(radii[u32] as typeof radii[U])) as never;
  }

  // ord

  public clamp(min: char<_>, max: char<_>): char<_> {
    if (this.codepoint() < min.codepoint()) {
      return min;
    }

    if (this.codepoint() > max.codepoint()) {
      return max;
    }

    return this;
  }

  public eq<U extends string>(other: char<U>): T extends U ? true : false {
    return (this.codepoint() === other.codepoint()) as never;
  }

  public ne<U extends string>(other: char<U>): T extends U ? false : true {
    return !this.eq(other) as never;
  }

  public partial_cmp<U extends string>(other: char<U>): Ordering {
    if (this.eq(other)) {
      return Ordering.Equal;
    }

    if (this.codepoint() > other.codepoint()) {
      return Ordering.Greater;
    }

    return Ordering.Less;
  }

  public cmp(other: char<_>): Ordering {
    return this.partial_cmp(other);
  }

  public ge(other: char<_>): boolean {
    return default_partial_ord<char<_>>(this).ge(other);
  }

  public gt(other: char<_>): boolean {
    return default_partial_ord<char<_>>(this).gt(other);
  }

  public le(other: char<_>): boolean {
    return default_partial_ord<char<_>>(this).le(other);
  }

  public lt(other: char<_>): boolean {
    return default_partial_ord<char<_>>(this).lt(other);
  }

  public max<U extends string>(other: char<U>): char<T> | char<U> {
    if (this.ge(other)) {
      return this;
    }

    return other;
  }

  public min<U extends string>(other: char<U>): char<T> | char<U> {
    if (this.le(other)) {
      return this;
    }

    return other;
  }

  public is_digit(radix: RadiiIdx): boolean {
    const idx = radii.indexOf(this.value.toLowerCase());

    return idx > 0 && idx <= radix;
  }

  public to_digit(
    radix: RadiiIdx
  ): Option<IndexOf<StrToArray<typeof radii>, Lowercase<T>>> {
    if (this.is_digit(radix)) {
      return Some(radii.indexOf(this.value.toLowerCase())) as never;
    }

    return None;
  }

  public codepoint(): number {
    return this.value.codePointAt(0) || CharImpl.replacement_char.codepoint();
  }

  public as_primitive(): T {
    return this.value;
  }

  public escape_unicode(): EscapeUnicode<T> {
    return EscapeUnicode(this);
  }

  public escape_debug(): EscapeDebug<T> {
    return EscapeDebug(this);
  }

  public escape_default(): EscapeDefault<T> {
    return EscapeDefault(this);
  }

  public len_utf8(): number {
    return this.encode_utf8().length;
  }

  public len_utf16(): number {
    return this.value.length;
  }

  public encode_utf8(): Array<number> {
    const code = this.codepoint();

    if (code < 0x80) {
      return [code];
    }

    if (code < 0x800) {
      return [0xc0 | (code >> 6), 0x80 | (code & 0x3f)];
    }

    if (code < 0xd800 || code >= 0xe000) {
      return [
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      ];
    }

    const p =
      0x10000 + (((code & 0x3ff) << 10) | (this.value.charCodeAt(1) & 0x3ff));

    return [
      0xf0 | (p << 18),
      0x80 | ((p >> 12) & 0x3f),
      0x80 | ((code >> 6) & 0x3f),
      0x80 | (code & 0x3f),
    ];
  }

  public encode_utf16(): Array<number> {
    return this.value
      .split('')
      .map((x) => x.codePointAt(0) || CharImpl.replacement_char.codepoint());
  }

  private is_category(...cats: Array<string>): boolean {
    let p = false;

    for (const value of cats) {
      p = p || new RegExp(`\\p{${value}}`, 'u').test(this.value);
    }

    return p;
  }

  public is_alphabetic(): boolean {
    return this.is_category('Alphabetic');
  }

  public is_lowercase(): boolean {
    return this.is_category('Lowercase') as never;
  }

  public is_uppercase(): boolean {
    return this.is_category('Uppercase') as never;
  }

  public is_whitespace(): boolean {
    return /\s/u.test(this.value);
  }

  public is_alphanumeric(): boolean {
    return this.is_alphabetic() || this.is_numeric();
  }

  public is_control(): boolean {
    return this.is_category('Cc');
  }

  public is_numeric(): boolean {
    return this.is_category('Nd', 'Nl', 'No');
  }

  public to_lowercase(): CharImpl<Lowercase<T>> {
    return new CharImpl(this.value.toLowerCase() as Lowercase<T>);
  }

  public to_uppercase(): CharImpl<Uppercase<T>> {
    return new CharImpl(this.value.toUpperCase() as Uppercase<T>);
  }

  public is_ascii(): boolean {
    return (this.codepoint() < 0xff) as never;
  }

  public to_ascii_uppercase(): ToAsciiUppercase<this> {
    if (this.is_ascii().valueOf()) {
      return this.to_uppercase() as never;
    }

    return this as never;
  }

  public to_ascii_lowercase(): ToAsciiLowercase<this> {
    if (this.is_ascii().valueOf()) {
      return this.to_lowercase() as never;
    }

    return this as never;
  }

  public eq_ignore_ascii_case<U extends string>(other: char<U>): boolean {
    return this.to_ascii_lowercase().eq(other.to_ascii_lowercase());
  }

  public make_ascii_uppercase(): ToAsciiUppercase<this> {
    this.value = this.to_ascii_uppercase().value as never;
    return this as never;
  }

  public make_ascii_lowercase(): ToAsciiLowercase<this> {
    this.value = this.to_ascii_lowercase().value as never;
    return this as never;
  }

  public is_ascii_alphabetic(): boolean {
    return this.is_ascii() && (this.is_alphabetic() as never);
  }

  public is_ascii_uppercase(): boolean {
    return this.is_ascii() && (this.is_uppercase() as never);
  }

  public is_ascii_lowercase(): boolean {
    return this.is_ascii() && (this.is_lowercase() as never);
  }

  public is_ascii_digit(): boolean {
    return this.is_ascii() && (this.is_numeric() as never);
  }

  public is_ascii_alphanumeric(): boolean {
    return (this.is_ascii_alphabetic().valueOf() ||
      this.is_ascii_digit().valueOf()) as never;
  }

  public is_ascii_hexdigit(): boolean {
    return this.is_ascii_digit() || (/[a-f]/i.test(this.value) as never);
  }

  public is_ascii_punctuation(): boolean {
    return this.is_ascii() && (this.is_category('Punctuation') as never);
  }

  public is_ascii_graphic(): boolean {
    return (this.is_ascii().valueOf() &&
      this.clamp(char('!'), char('~')).eq(this)) as never;
  }

  public is_ascii_whitespace(): boolean {
    return this.is_ascii() && (this.is_whitespace() as never);
  }

  public is_ascii_control(): boolean {
    return this.is_ascii() && (this.is_control() as never);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type char<T extends string> = CharImpl<T>;
export const char = staticify(CharImpl);
