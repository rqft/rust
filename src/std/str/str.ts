import { staticify } from "../../tools";
import { char } from "../char";
import { min } from "../cmp";
import type { _ } from "../custom";
import { DoubleEndedIterator } from "../iter";
import { u16, u8, usize } from "../number";
import type { int } from "../number/size";
import { size } from "../number/size";
import type { Option } from "../option";
import { None, Some } from "../option";
import { panic } from "../panic";
import { slice } from "../slice";
import { Bytes } from "./bytes";
import { Chars } from "./chars";
import { CharIndices } from "./char_indices";
import { EncodeUtf16 } from "./encode_utf16";
import { Lines } from "./lines";
import { Matches } from "./matches";
import { MatchIndices } from "./match_indices";
import type { Matcher } from "./pattern";
import { Pattern } from "./pattern";
import { RMatches } from "./rmatches";
import { RMatchIndices } from "./rmatch_indices";
import { RSplit } from "./rsplit";
import { RSplitN } from "./rsplitn";
import { RSplitInclusive } from "./rsplit_inclusive";
import { RSplitTerminator } from "./rsplit_terminator";
import { Split } from "./split";
import { SplitN } from "./splitn";
import { SplitAsciiWhitespace } from "./split_ascii_whitespace";
import { SplitInclusive } from "./split_inclusive";
import { SplitTerminator } from "./split_terminator";
import { SplitWhitespace } from "./split_whitespace";

class StrImpl {
  public alloc: string;
  constructor(value: Io) {
    if (value instanceof u8.static) {
      value = char(String.fromCodePoint(Number(value.as_primitive())));
    }

    if (value instanceof char.static) {
      value = value.value;
    }

    if (Symbol.iterator in (value as Iterable<char<_>> | Iterable<u8>)) {
      value = String.fromCodePoint(
        ...[...(value as Iterable<char<_>> | Iterable<u8>)].map((x) =>
          x instanceof u8.static ? Number(x.as_primitive()) : x.as_primitive()
        )
      );
    }

    if (value instanceof StrImpl) {
      value = value.alloc;
    }

    this.alloc = value as string;
  }

  public clone(): str {
    return str(this.alloc);
  }

  public static new(value: Io): StrImpl {
    return new this(value);
  }

  public len(): usize {
    return usize(this.alloc.length);
  }

  public is_empty(): boolean {
    return this.len().eq(0);
  }

  public as_bytes(): slice<u8> {
    const shield = this;
    return slice(
      (function* (): Generator<u8> {
        for (let i = 0; i < shield.alloc.length; i++) {
          yield u8(shield.alloc.codePointAt(i));
        }
      })()
    );
  }

  public is_char_boundary(index: int): boolean {
    index = Number(size(index).as_primitive());

    if (index === 0) {
      return true;
    }

    const option = this.as_bytes().get(index);

    if (option.is_none()) {
      return this.len().eq(index);
    }

    return option.unwrap().is_utf8_char_boundary();
  }

  public floor_char_boundary(index: int): usize {
    index = size(index);
    if (index.ge(this.len())) {
      return this.len();
    }

    const lower_bound = index.saturating_sub(3);
    const new_index = DoubleEndedIterator(
      this.as_bytes().get_slice_unchecked(lower_bound, index.add(1))
    ).rposition((b) => b.is_utf8_char_boundary());

    return usize(lower_bound.add(new_index.unwrap_unchecked()));
  }

  public ceil_char_boundary(index: int): usize {
    index = size(index);

    if (index.gt(this.len())) {
      panic("Cannot check char boundary of out-of-bounds indices");
    }

    const upper_bound = min(index.add(4), this.len());

    return this.as_bytes()
      .get_slice_unchecked(index, upper_bound)
      .iter()
      .position((b) => b.is_utf8_char_boundary())
      .map_or(upper_bound, (pos) => (index as size).add(pos))
      .into(u8);
  }

  public get(index: int): Option<u8> {
    return this.as_bytes().get(index);
  }

  public get_unchecked(index: int): u8 {
    return this.as_bytes().get_unchecked(index);
  }

  public slice(start: int, end: int): Option<str> {
    const slice = this.as_bytes().get_slice(start, end);
    return slice.map((x) => str(x));
  }

  public slice_unchecked(start: int, end: int): str {
    const slice = this.as_bytes().get_slice_unchecked(start, end);
    return str(slice);
  }

  public split_at(mid: int): [str, str] {
    return [
      this.slice_unchecked(0, mid),
      this.slice_unchecked(mid, this.len()),
    ];
  }

  public chars(): Chars {
    return Chars(this);
  }

  public char_indices(): CharIndices {
    return CharIndices(this);
  }

  public bytes(): Bytes {
    return Bytes(this);
  }

  public split_whitespace(): SplitWhitespace {
    return SplitWhitespace(this);
  }

  public split_ascii_whitespace(): SplitAsciiWhitespace {
    return SplitAsciiWhitespace(this);
  }

  public lines(): Lines {
    return Lines(this);
  }

  public encode_utf16(): EncodeUtf16 {
    return EncodeUtf16(this.chars(), u16(0));
  }

  public contains(pattern: Matcher): boolean {
    return Pattern(pattern).is_suffix_of(this.alloc);
  }

  public starts_with(pattern: Matcher): boolean {
    return Pattern(pattern).is_prefix_of(this.alloc);
  }

  public ends_with(pattern: Matcher): boolean {
    return Pattern(pattern).is_suffix_of(this.alloc);
  }

  public find(pattern: Matcher): Option<usize> {
    return Pattern(pattern).find_in(this.alloc);
  }

  public rfind(pattern: Matcher): Option<usize> {
    return Pattern(pattern).rfind_in(this.alloc);
  }

  public split(pattern: Io): Split {
    return Split(this, pattern);
  }

  public split_inclusive(pattern: Io): SplitInclusive {
    return SplitInclusive(this, pattern);
  }

  public rsplit(pattern: Io): RSplit {
    return RSplit(this, pattern);
  }

  public rsplit_inclusive(pattern: Io): RSplitInclusive {
    return RSplitInclusive(this, pattern);
  }

  public split_terminator(pattern: Io): SplitTerminator {
    return SplitTerminator(this, pattern);
  }

  public rsplit_terminator(pattern: Io): RSplitTerminator {
    return RSplitTerminator(this, pattern);
  }

  public splitn(n: int, pattern: Io): SplitN {
    return SplitN(this, n, pattern);
  }

  public rsplitn(n: int, pattern: Io): RSplitN {
    return RSplitN(this, n, pattern);
  }

  public split_once(delimiter: Io): Option<[str, str]> {
    delimiter = str(delimiter);

    const iof = this.find(delimiter);

    if (iof.is_none()) {
      return None;
    }

    return Some(this.split_at(iof.unwrap()));
  }

  public rsplit_once(delimiter: Io): Option<[str, str]> {
    delimiter = str(delimiter);

    const iof = this.rfind(delimiter);

    if (iof.is_none()) {
      return None;
    }

    return Some(this.split_at(iof.unwrap()));
  }

  public matches(pattern: Io): Matches {
    return Matches(this, pattern);
  }

  public rmatches(pattern: Io): RMatches {
    return RMatches(this, pattern);
  }

  public match_indices(pattern: Io): MatchIndices {
    return MatchIndices(this, pattern);
  }

  public rmatch_indices(pattern: Io): RMatchIndices {
    return RMatchIndices(this, pattern);
  }

  public trim(): str {
    return str(this.alloc.trim());
  }

  public trim_start(): str {
    return str(this.alloc.trimStart());
  }

  public trim_end(): str {
    return str(this.alloc.trimEnd());
  }

  public strip_prefix(pattern: Matcher): str {
    const opt = Pattern(pattern).strip_prefix_of(this.alloc);

    if (opt.is_none()) {
      return this;
    }

    return str(opt.unwrap());
  }

  public strip_suffix(pattern: Matcher): str {
    const opt = Pattern(pattern).strip_suffix_of(this.alloc);

    if (opt.is_none()) {
      return this;
    }

    return str(opt.unwrap());
  }

  public trim_start_matches(pattern: Matcher): str {
    let self = str(this);
    while (self.starts_with(pattern)) {
      self = self.strip_prefix(pattern);
    }

    return self;
  }

  public trim_end_matches(pattern: Matcher): str {
    let self = str(this);
    while (self.ends_with(pattern)) {
      self = self.strip_suffix(pattern);
    }

    return self;
  }

  public trim_matches(pattern: Matcher): str {
    return this.trim_start_matches(pattern).trim_end_matches(pattern);
  }

  public parse<T>(x: (s: string) => T): T {
    return x(this.alloc);
  }

  public is_ascii(): boolean {
    return this.chars().all((x) => x.is_ascii());
  }

  public eq_ignore_ascii_case(other: Io): boolean {
    return this.chars()
      .zip(str(other).chars())
      .all(([a, b]) => a.eq_ignore_ascii_case(b));
  }

  public make_ascii_uppercase(): this {
    this.alloc = str(this.chars().map((x) => x.make_ascii_uppercase())).alloc;
    return this;
  }

  public make_ascii_lowercase(): this {
    this.alloc = str(this.chars().map((x) => x.make_ascii_lowercase())).alloc;
    return this;
  }

  public escape_debug(): this {
    this.alloc = str(
      this.chars()
        .map((x) => x.escape_debug())
        .flatten()
    ).alloc;
    return this;
  }

  public escape_default(): this {
    this.alloc = str(
      this.chars()
        .map((x) => x.escape_default())
        .flatten()
    ).alloc;
    return this;
  }

  public escape_unicode(): this {
    this.alloc = str(
      this.chars()
        .map((x) => x.escape_unicode())
        .flatten()
    ).alloc;
    return this;
  }

  public replace(from: Io, to: Io): str {
    return str(this.alloc.replace(str(from).alloc, str(to).alloc));
  }

  public replacen(pattern: Io, to: Io, count: int): str {
    let i = 0n;
    return str(
      this.alloc.replace(str(pattern).alloc, (g) => {
        if (size(count).lt(i++)) {
          return g;
        }
        return str(to).alloc;
      })
    );
  }

  public to_lowercase(): str {
    return str(this.alloc.toLowerCase());
  }

  public to_uppercase(): str {
    return str(this.alloc.toUpperCase());
  }

  public repeat(n: int): str {
    return str(this.alloc.repeat(size(n).into(Number)));
  }

  public to_ascii_uppercase(): str {
    return this.clone().make_ascii_uppercase();
  }

  public to_ascii_lowercase(): str {
    return this.clone().make_ascii_lowercase();
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type str = StrImpl;
export const str = staticify(StrImpl);

export type Io = char<_> | Iterable<char<_>> | Iterable<u8> | str | u8 | string;
