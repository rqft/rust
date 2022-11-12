import { staticify } from '../tools';
import type { Iter } from './iter';
import { iter } from './iter';
import type { Option } from './option';
import { None, Some } from './option';
import { range, rangeInclusive } from './range';
import type { Result } from './result';
import { Err, Ok } from './result';
import { Ordering, PartialComparison } from './traits';
import type { Vec } from './vec';
import { vec } from './vec';

export class Char<T extends string> extends PartialComparison<CharLike<T>> {
  // implements Debug
  private value: number;
  constructor(value: CharLike<T>, safe = true) {
    super();
    if (typeof value === 'string') {
      if ([...value].length !== 1) {
        if (safe) {
          throw new Error('char can only hold 1 value');
        }
      }
    }

    value = Char.of(value);

    if (
      !rangeInclusive(0x00000, 0x10ffff).contains(value) ||
      rangeInclusive(0xd800, 0xdfff).contains(value)
    ) {
      if (safe) {
        throw `invalid char '\\u${value.toString(16).padStart(4, '0')}'`;
      }
    }

    this.value = value;
  }

  public static new<T extends string>(value: CharLike<T>): Char<T> {
    return new Char(value);
  }

  public static of<T extends string>(value: CharLike<T>): number {
    if (typeof value === 'string') {
      return value.charCodeAt(0) || 0x0;
    }

    if (value instanceof this) {
      return value.value;
    }

    return value;
  }

  public static readonly Max = this.fromU32(0x10ffff);
  public static readonly ReplacementCharacter = this.fromU32(0xfffd);

  public static decodeUtf16<T extends string>(
    iterable: Iterable<CharLike<T>>
  ): Iter<Result<Char<T>, number>> {
    const shield = this;
    return iter.new(
      (function* (): Generator<Result<Char<T>, number>, void, unknown> {
        for (const value of iterable) {
          try {
            yield Ok(shield.new(value));
          } catch {
            yield Err(shield.of(value));
          }
        }
      })()
    );
  }

  public static fromU32(i: number): Option<Char<string>> {
    i |= 0;
    try {
      return Some(this.new(i));
    } catch {
      return None;
    }
  }

  public static fromU32Unchecked(i: number): Char<string> {
    i |= 0;
    return new this(i, false);
  }

  public str(): string {
    return String.fromCodePoint(this.value);
  }

  public static fromDigit<T extends string = string>(
    num: number,
    radix: number
  ): Option<Char<T>> {
    if (!range(2, 36).contains(radix)) {
      throw 'radix does not fit inside of range 2..=36';
    }

    const radii = '01234567890abcdefghijklmnopqrstuvwxyz'.slice(0, radix + 1);

    const char = radii.charAt(num);

    if (char === '') {
      return None;
    }

    return Some(this.new(char));
  }

  public isDigit(radix = 10): boolean {
    if (!range(2, 36).contains(radix)) {
      throw 'radix does not fit inside of range 2..=36';
    }

    const radii = '01234567890abcdefghijklmnopqrstuvwxyz'.slice(0, radix + 1);

    return radii.includes(this.str().toLowerCase());
  }

  public toDigit(radix = 10): number {
    if (!range(2, 36).contains(radix)) {
      throw 'radix does not fit inside of range 2..=36';
    }

    const radii = '01234567890abcdefghijklmnopqrstuvwxyz'.slice(0, radix + 1);

    return radii.indexOf(this.str());
  }

  public escapeUnicode(): Iter<Char<string>> {
    return iter.new(
      `\\u${this.value.toString(16).padStart(4, '0')}`.split('').map(Char.new)
    );
  }

  public escapeDebug(): Iter<Char<string>> {
    return iter.new(
      this.str()
        .replace(/.|\n/g, (z) => {
          return (
            {
              '\u0000': '\\0000',
              '\t': '\\t',
              '\r': '\\r',
              '\n': '\\n',
              '"': '\\"',
              '\'': '\\\'',
              '\\': '\\\\',
            }[z] || z
          );
        })
        .split('')
        .map((x) => Char.new(x))
    );
  }

  public escapeDefault(): Iter<Char<string>> {
    if (rangeInclusive(0x20, 0x7e).contains(this.value)) {
      return iter.new([this]);
    }

    const escape = this.escapeDebug();

    // idr if this needs to be cloned
    if (escape.clone().count() > 1) {
      return escape;
    }

    return this.escapeUnicode();
  }

  public lenUtf8(): number {
    return this.encodeUtf8().len();
  }

  public encodeUtf8(): Vec<number> {
    const v = vec.new<number>();

    for (let i = 0; i < this.str().length; i++) {
      const char = this.str().charCodeAt(i);

      if (char < 0x80) {
        v.push(char);
        continue;
      }

      if (char < 0x800) {
        v.push(0xc0 | (char >> 6));
        v.push(0x80 | (char & 0x3f));
        continue;
      }

      i++;
      const code =
        0x10000 + (((char & 0x3ff) << 10) | (this.str().charCodeAt(i) & 0x3ff));

      v.push(0xf0 | (code >> 18));
      v.push(0x80 | ((code >> 12) & 0x3f));
      v.push(0x80 | ((code >> 6) & 0x3f));
      v.push(0x80 | (code & 0x3f));
    }

    return v;
  }

  public lenUtf16(): number {
    return this.str().length;
  }

  private match(f: RegExp): boolean {
    return f.test(this.str());
  }

  public encodeUtf16(): Vec<number> {
    return vec.new<number>().push(this.value);
  }

  public isAlphabetic(): boolean {
    return this.match(/\p{L}/u);
  }

  public isLowercase(): boolean {
    return this.match(/\p{Ll}/u);
  }

  public isUppercase(): boolean {
    return this.match(/\p{Lu}/u);
  }

  public isWhitespace(): boolean {
    return this.match(/\s/u);
  }

  public isAlphanumeric(): boolean {
    return this.isAlphabetic() || this.isNumeric();
  }

  public isControl(): boolean {
    return this.match(/\p{Cc}/u);
  }

  public isNumeric(): boolean {
    return this.match(/\p{N}/u);
  }

  public toLowercase(): Char<Lowercase<T>> {
    return Char.new(
      iter.new(this.str().toLowerCase()).map(Char.new).collect().join('')
    );
  }

  public toUppercase(): Char<Uppercase<T>> {
    return Char.new(
      iter.new(this.str().toUpperCase()).map(Char.new).collect().join('')
    );
  }

  public isAscii(): boolean {
    return range(0, 256).contains(this.value);
  }

  public toAsciiUppercase(): Char<Uppercase<T>> {
    if (this.isAscii()) {
      return this.toUppercase();
    }

    return this as never;
  }

  public toAsciiLowercase(): Char<Lowercase<T>> {
    if (this.isAscii()) {
      return this.toLowercase();
    }

    return this.iter() as never;
  }

  public iter(): Iter<this> {
    return iter.new([this]);
  }

  public equalsIgnoreAsciiCase(other: CharLike<T>): boolean {
    return this.toAsciiLowercase().eq(Char.new(other).toAsciiLowercase());
  }

  public makeAsciiUppercase(): this {
    this.value = this.toAsciiUppercase().value;
    return this;
  }

  public makeAsciiLowercase(): this {
    this.value = this.toAsciiLowercase().value;
    return this;
  }

  public isAsciiAlphabetic(): boolean {
    return this.isAlphabetic() && this.isAscii();
  }

  public isAsciiUppercase(): boolean {
    return this.isAsciiAlphabetic() && this.isUppercase();
  }

  public isAsciiLowercase(): boolean {
    return this.isAsciiAlphabetic() && this.isLowercase();
  }

  public isAsciiAlphanumeric(): boolean {
    return this.isAsciiAlphabetic() || this.isAsciiDigit();
  }

  public isAsciiDigit(): boolean {
    return this.isDigit(10) && this.isAscii();
  }

  public isAsciiHexDigit(): boolean {
    return this.isDigit(16) && this.isAscii();
  }

  public isAsciiPunctuation(): boolean {
    return this.isAscii() && this.match(/\p{P}/u);
  }

  public isAsciiGraphic(): boolean {
    return rangeInclusive(0x21, 0x7e).contains(this.value);
  }

  public isAsciiWhitespace(): boolean {
    return this.isAscii() && this.isWhitespace();
  }

  public isAsciiControl(): boolean {
    return this.isAscii() && this.isControl();
  }

  public static default(): Char<'\u{0000}'> {
    return this.new(0);
  }

  // impl `Comparison`

  public eq(this: this, other: CharLike<T>): boolean {
    return this.value === Char.of(other);
  }

  public cmp(this: this, other: CharLike<T>): Ordering {
    if (this.eq(other)) {
      return Ordering.Equal;
    }

    if (this.value > Char.of(other)) {
      return Ordering.More;
    }

    return Ordering.Less;
  }
}

export type CharLike<T extends string> = Char<T> | T | number;

export const char = staticify(Char);
