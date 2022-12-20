import { staticify } from '../../../tools';
import { char } from '../char';
import { min } from '../cmp';
import type { _ } from '../custom';
import { DoubleEndedIterator } from '../iter';
import { u8, usize } from '../number';
import type { int } from '../number/size';
import { size } from '../number/size';
import type { Option } from '../option';

import { panic } from '../panic';
import { slice } from '../slice';
import { Bytes } from './bytes';
import { Chars } from './chars';
import { CharIndices } from './char_indices';
import { Lines } from './lines';
import { SplitAsciiWhitespace } from './split_ascii_whitespace';
import { SplitWhitespace } from './split_whitespace';

class StrImpl {
  public readonly alloc: string;
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
      panic('Cannot check char boundary of out-of-bounds indices');
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

  
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type str = StrImpl;
export const str = staticify(StrImpl);

export type Io = char<_> | Iterable<char<_>> | Iterable<u8> | str | u8 | string;
