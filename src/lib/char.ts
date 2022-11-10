import type { Iter } from './iter';
import { iter } from './iter';
import type { Option } from './option';
import { None, Some } from './option';
import { range } from './range';
import type { Result } from './result';
import { Err, Ok } from './result';

export class Char {
  private readonly value: number;
  protected constructor(value: CharLike, safe = true) {
    if (typeof value === 'string') {
      if (value.length !== 1) {
        if (safe) {
          throw 'char can only hold 1 value';
        }
      }
    }

    value = Char.of(value);

    if (
      !range(0x00000, 0x10ffff).contains(value) ||
      range(0xd800, 0xdfff).contains(value)
    ) {
      if (safe) {
        throw `invalid char '\\u${value}'`;
      }
    }

    this.value = value;
  }

  public static new(value: CharLike): Char {
    return new this(value);
  }

  public static of(value: CharLike): number {
    if (typeof value === 'string') {
      return value.charCodeAt(0) || 0x0;
    }

    if (value instanceof this) {
      return value.value;
    }

    return value;
  }

  public static readonly Max = this.new('\u{10ffff}');
  public static readonly ReplacementCharacter = this.new('\u{FFFD}');

  public static decodeUtf16(
    iterable: Iterable<CharLike>
  ): Iter<Result<Char, number>> {
    const shield = this;
    return iter.new(
      (function* (): Generator<Result<Char, number>, void, unknown> {
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

  public static fromU32(i: number): Option<Char> {
    i |= 0;
    try {
      return Some(this.new(i));
    } catch {
      return None;
    }
  }

  public static fromU32Unchecked(i: number): Char {
    i |= 0;
    return new this(i, false);
  }

  public str(): string {
    return String.fromCodePoint(this.value);
  }

  public static fromDigit(num: number, radix: number): Option<Char> {
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

  public isDigit(radix: number): boolean {
    if (!range(2, 36).contains(radix)) {
      throw 'radix does not fit inside of range 2..=36';
    }

    const radii = '01234567890abcdefghijklmnopqrstuvwxyz'.slice(0, radix + 1);

    return radii.includes(this.str());
  }

  public toDigit(radix: number): number {
    if (!range(2, 36).contains(radix)) {
      throw 'radix does not fit inside of range 2..=36';
    }

    const radii = '01234567890abcdefghijklmnopqrstuvwxyz'.slice(0, radix + 1);

    return radii.indexOf(this.str());
  }

  public escapeUnicode(): string {
    return `\\u{${this.value}}`;
  }

  
}

type CharLike = Char | number | string;
