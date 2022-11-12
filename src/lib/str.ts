import { staticify } from '../tools';
import type { Char } from './char';
import { char } from './char';
import type { Iter } from './iter';
import { iter } from './iter';
import type { Option } from './option';
import { None, Some } from './option';
import type { Range } from './range';
import { rangeFrom, rangeTo } from './range';
import type { Ordering } from './traits';
import { PartialComparison } from './traits';
import type { Vec } from './vec';
import { vec } from './vec';
export class Str extends PartialComparison<StrLike> {
  private slice: string;
  constructor(slice: StrLike) {
    super();
    this.slice = Str.of(slice);
  }

  public static new(slice: StrLike): Str {
    return new this(slice);
  }

  public static of(slice: StrLike): string {
    if (typeof slice === 'string') {
      return slice;
    }

    if (slice instanceof char.static) {
      return slice.str();
    }

    return iter.new(slice).collect().join('');
  }

  public len(): number {
    return this.slice.length;
  }

  public isEmpty(): boolean {
    return this.len() === 0;
  }

  public chars(): Iter<Char<string>> {
    return iter.new([...this.slice].map(char.new));
  }

  // isCharBondary, floorCharBoundary, ceilCharBoundary

  public asBytes(): Vec<number> {
    return vec.from(this.slice.split('').map((x) => x.codePointAt(0) || 0));
  }

  public get(range: Range): Option<Str> {
    if (
      range
        .start()
        .map((f) => f < 0)
        .unwrapOr(true)
    ) {
      return None;
    }

    if (
      range
        .end()
        .map((f) => f < 0)
        .unwrapOr(true)
    ) {
      return None;
    }

    return this.getUnchecked(range);
  }

  public getUnchecked(range: Range): Option<Str> {
    const start = range.start().unwrapOr(0);
    const end = range.end().unwrapOr<number>(this.len());
    return Some(Str.new(this.slice.slice(start, end)));
  }

  public splitAt(mid: number): [Str, Str] {
    return [this.get(rangeTo(mid)).unwrap(), this.get(rangeFrom(mid)).unwrap()];
  }

  public charIndices(): Iter<[number, Char<string>]> {
    let min = 0;
    return this.chars().map((x) => [
      (min = this.slice.indexOf(x.str(), min)),
      x,
    ]);
  }

  public bytes(): Iter<number> {
    return iter.new(this.asBytes()).map((x) => x.unwrap());
  }

  public splitWhitespace(): Iter<string> {
    return iter.new(this.slice.split(/\p{White_Space}/gu));
  }

  public splitAsciiWhitespace(): Iter<string> {
    return iter.new(this.slice.split(/(?:\n| |\t|\r)+/gu));
  }

  public lines(): Iter<string> {
    return iter.new(this.slice.split(/\r?\n/gu));
  }

  public encodeUtf16(): Iter<number> {
    const shield = this;
    return iter.new(
      (function* (): Generator<number, void, unknown> {
        for (const char of shield.chars()) {
          for (const u16 of char.encodeUtf16()) {
            yield u16.unwrap();
          }
        }
      })()
    );
  }

  public contains(str: StrLike): boolean {
    return this.slice.includes(Str.of(str));
  }

  public startsWith(str: StrLike): boolean {
    return this.slice.startsWith(Str.of(str));
  }

  public endsWith(str: StrLike): boolean {
    return this.slice.endsWith(Str.of(str));
  }

  public find(str: StrLike): Option<number> {
    const index = this.slice.indexOf(Str.of(str));
    if (index === -1) {
      return None;
    }

    return Some(index);
  }

  public rfind(str: StrLike): Option<number> {
    const index = this.slice.lastIndexOf(Str.of(str));
    if (index === -1) {
      return None;
    }

    return Some(index);
  }

  public split(str: StrLike): Iter<Str> {
    return iter.new(this.slice.split(Str.of(str)).reverse().map(Str.new));
  }

  public splitInclusive(str: StrLike): Iter<Str> {
    return iter.new(
      this.slice.split(Str.of(str)).map((x) => Str.new(x + Str.of(str)))
    );
  }

  public rsplit(str: StrLike): Iter<Str> {
    return iter.new(this.slice.split(Str.of(str)).reverse().map(Str.new));
  }

  public splitTerminator(str: StrLike): Iter<Str> {
    const v = vec.from(this.split(str).map((x) => x.slice));
    if (v.endsWith('')) {
      v.pop();
    }

    return iter.new(v).map((x) => Str.new(x.unwrap()));
  }

  public rsplitTerminator(str: StrLike): Iter<Str> {
    const v = vec.from(this.rsplit(str).map((x) => x.slice));
    if (v.endsWith('')) {
      v.pop();
    }

    return iter.new(v).map((x) => Str.new(x.unwrap()));
  }

  public splitn(n: number, str: StrLike): Iter<Str> {
    return iter.new(this.slice.split(Str.of(str), n).map(Str.new));
  }

  public rsplitn(n: number, str: StrLike): Iter<Str> {
    return iter.new(this.slice.split(Str.of(str), n).reverse().map(Str.new));
  }

  public splitOnce(delimiter: StrLike): Option<[Str, Str]> {
    const i = this.splitn(1, delimiter);

    if (i.clone().count() !== 2) {
      return None;
    }

    return Some([i.next().unwrap(), i.next().unwrap()] as [Str, Str]);
  }

  public rsplitOnce(delimiter: StrLike): Option<[Str, Str]> {
    const i = this.rsplitn(1, delimiter);

    if (i.clone().count() !== 2) {
      return None;
    }

    return Some([i.next().unwrap(), i.next().unwrap()] as [Str, Str]);
  }

  public matches(str: RegExp | StrLike): Iter<Str> {
    if (str instanceof RegExp) {
      return iter.new(this.slice.match(str) || []).map(Str.new);
    }

    return iter.new(this.slice.match(Str.of(str)) || []).map(Str.new);
  }

  public rmatches(str: RegExp | StrLike): Iter<Str> {
    return this.matches(str).reverse();
  }

  public matchIndices(str: RegExp | StrLike): Iter<[number, Str]> {
    let min = 0;
    return this.matches(str).map((x) => [
      (min = this.slice.indexOf(x.slice, min)),
      x,
    ]);
  }

  public rmatchIndices(str: RegExp | StrLike): Iter<[number, Str]> {
    return this.matchIndices(str).reverse();
  }

  public trim(): Str {
    return Str.new(this.slice.trim());
  }

  public trimStart(): Str {
    return Str.new(this.slice.trimStart());
  }

  public trimEnd(): Str {
    return Str.new(this.slice.trimEnd());
  }

  // trimMatches, trimStartMatches, trimEndMatches

  public stripPrefix(prefix: StrLike): Option<Str> {
    if (this.startsWith(prefix)) {
      return this.get(rangeFrom(Str.of(prefix).length));
    }

    return None;
  }

  public stripSuffix(prefix: StrLike): Option<Str> {
    if (this.endsWith(prefix)) {
      return this.get(rangeTo(this.len() - Str.of(prefix).length));
    }

    return None;
  }

  public isAscii(): boolean {
    return this.chars().all((c) => c.isAscii());
  }

  public equalsIgnoreAsciiCase(other: StrLike): boolean {
    return this.toAsciiLowercase() === Str.new(other).toAsciiLowercase();
  }

  public toAsciiLowercase(): Str {
    return Str.new(this.chars().map((c) => c.makeAsciiLowercase()));
  }

  public makeAsciiLowercase(): this {
    this.slice = this.toAsciiLowercase().slice;
    return this;
  }

  public toAsciiUppercase(): Str {
    return Str.new(this.chars().map((c) => c.makeAsciiUppercase()));
  }

  public makeAsciiUppercase(): this {
    this.slice = this.toAsciiUppercase().slice;
    return this;
  }

  public escapeDebug(): Iter<Char<string>> {
    const shield = this;
    return iter.new(
      (function* (): Generator<Char<string>, void, unknown> {
        for (const char of shield.chars()) {
          for (const value of char.escapeDebug()) {
            yield value;
          }
        }
      })()
    );
  }

  public escapeDefault(): Iter<Char<string>> {
    const shield = this;
    return iter.new(
      (function* (): Generator<Char<string>, void, unknown> {
        for (const char of shield.chars()) {
          for (const value of char.escapeDebug()) {
            yield value;
          }
        }
      })()
    );
  }

  public escapeUnicode(): Iter<Char<string>> {
    const shield = this;
    return iter.new(
      (function* (): Generator<Char<string>, void, unknown> {
        for (const char of shield.chars()) {
          for (const value of char.escapeUnicode()) {
            yield value;
          }
        }
      })()
    );
  }

  public replace(from: RegExp | StrLike, to: StrLike): Str {
    if (!(from instanceof RegExp)) {
      from = Str.of(from);
    }

    return Str.new(this.slice.replace(from, Str.of(to)));
  }

  public replacen(from: RegExp | StrLike, to: StrLike, count: number): Str {
    if (!(from instanceof RegExp)) {
      from = Str.of(from);
    }

    const i = 0;
    return Str.new(
      this.slice.replace(from, (v) => (i > count ? v : Str.of(to)))
    );
  }

  public toLowercase(): Str {
    return Str.new(this.slice.toLowerCase());
  }

  public toUppercase(): Str {
    return Str.new(this.slice.toUpperCase());
  }

  public repeat(amount: number): Str {
    return Str.new(this.slice.repeat(amount));
  }

  // trait PartialEq

  public eq(other: StrLike): boolean {
    return this.slice === Str.of(other);
  }

  public cmp(other: StrLike): Ordering {
    return this.slice.localeCompare(Str.of(other)) as Ordering;
  }
}

export type StrLike = Char<string> | Iterable<Char<string>> | string;
export const str = staticify(Str);
