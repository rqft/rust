import { iter_len, staticify } from "../../tools";
import type { Eq, PartialEq, PartialOrd } from "../cmp";
import {
  default_partial_eq,
  default_partial_ord,
  is_cmp,
  is_eq,
  Ordering,
} from "../cmp";

// import { bool } from '../bool';
import { Iterator } from "../iter";
import type { u8 } from "../number";
import { usize } from "../number";
import type { io } from "../number/int_sized";
import type { int } from "../number/size";
import { size } from "../number/size";
import type { FnMut } from "../ops";
import type { Option } from "../option";
import { None, Some } from "../option";
import { panic } from "../panic";
import { Chunks } from "./chunks";
import { ChunksExact } from "./chunks_exact";
import { RChunks } from "./rchunks";
import { RChunksExact } from "./rchunks_exact";
import { RSplit } from "./rsplit";
import { RSplitN } from "./rsplitn";
import { RSplitInclusive } from "./rsplit_inclusive";
import { Split } from "./split";
import { SplitN } from "./splitn";
import { SplitInclusive } from "./split_inclusive";
import { Windows } from "./windows";

class SliceImpl<T>
  // Default<SliceImpl<T>>
  implements PartialEq<Iterable<T>>, Eq<Iterable<T>>, PartialOrd<Iterable<T>>
{
  public ptr: Array<T>;
  constructor(slice: Iterable<T>) {
    this.ptr = Array.from(slice);
  }

  public static default<T>(): SliceImpl<T> {
    return new this([] as Array<T>);
  }

  public static new<T>(slice: Iterable<T>): slice<T> {
    return new this(slice);
  }

  public len(): usize {
    return usize(this.ptr.length);
  }

  public is_empty(): boolean {
    return this.len().eq(0);
  }

  public first(): Option<T> {
    if (this.is_empty()) {
      return None;
    }

    return Some(this.ptr[0] as never);
  }

  public split_first(): Option<[T, SliceImpl<T>]> {
    if (this.is_empty()) {
      return None;
    }

    const first = this.ptr[0] as never;
    const rest = slice(this.ptr.slice(1));

    return Some([first, rest]);
  }

  public last(): Option<T> {
    if (this.is_empty()) {
      return None;
    }

    return Some(this.ptr[this.ptr.length - 1] as never);
  }

  public split_last(): Option<[T, SliceImpl<T>]> {
    if (this.is_empty()) {
      return None;
    }

    const last = this.ptr[this.ptr.length - 1] as never;
    const rest = slice(this.ptr.slice(0, this.ptr.length - 1));

    return Some([last, rest]);
  }

  public get(index: int): Option<T> {
    index = Number(size(index).as_primitive());

    if (index < 0 || index > this.ptr.length) {
      return None;
    }

    return Some(this.get_unchecked(index));
  }

  public get_unchecked(index: int): T {
    return this.ptr[Number(size(index).as_primitive())] as never;
  }

  public get_slice(start: int, end: int): Option<SliceImpl<T>> {
    [start, end] = [Number(size(start)), Number(size(end))];

    if (start < 0 || end > this.ptr.length) {
      return None;
    }

    return Some(slice(this.get_slice_unchecked(start, end)));
  }

  public get_slice_unchecked(start: int, end: int): SliceImpl<T> {
    return slice(this.ptr.slice(Number(size(start)), Number(size(end))));
  }

  public swap(a: int, b: int): this {
    [a, b] = [Number(size(a)), Number(size(b))];

    if (a < 0 || a > this.ptr.length || b < 0 || b > this.ptr.length) {
      panic("tried to swap with out-of-bounds indices");
    }

    return this.swap_unchecked(a, b);
  }

  public swap_unchecked(a: int, b: int): this {
    [a, b] = [Number(size(a)), Number(size(b))];

    [this.ptr[a], this.ptr[b]] = [this.ptr[b] as never, this.ptr[a] as never];

    return this;
  }

  public reverse(): this {
    this.ptr.reverse();
    return this;
  }

  public *[Symbol.iterator](): Generator<T, void, unknown> {
    for (const value of this.ptr) {
      yield value;
    }
  }

  public iter(): Iterator<T> {
    return Iterator(this);
  }

  public windows<N extends int>(n: N): Windows<T, N> {
    return Windows(n, this);
  }

  public chunks<N extends int>(n: N): Chunks<T, N> {
    return Chunks(n, this);
  }

  public chunks_exact<N extends int>(n: N): ChunksExact<T, N> {
    return ChunksExact(n, this);
  }

  public rchunks<N extends int>(n: N): RChunks<T, N> {
    return RChunks(n, this);
  }

  public rchunks_exact<N extends int>(n: N): RChunksExact<T, N> {
    return RChunksExact(n, this);
  }

  public split_at(n: int): [SliceImpl<T>, SliceImpl<T>] {
    if (size(n).gt(this.len())) {
      panic("cannot split outside of slice");
    }

    return [
      this.get_slice(0, n).unwrap(),
      this.get_slice(n, this.len()).unwrap(),
    ];
  }

  public split_at_unchecked(n: int): [SliceImpl<T>, SliceImpl<T>] {
    return [
      this.get_slice_unchecked(0, n),
      this.get_slice_unchecked(n, this.len()),
    ];
  }

  public split(p: FnMut<[T], boolean>): Split<T> {
    return Split(this, p);
  }

  public split_inclusive(p: FnMut<[T], boolean>): SplitInclusive<T> {
    return SplitInclusive(this, p);
  }

  public rsplit(p: FnMut<[T], boolean>): RSplit<T> {
    return RSplit(this, p);
  }

  public rsplit_inclusive(p: FnMut<[T], boolean>): RSplitInclusive<T> {
    return RSplitInclusive(this, p);
  }

  public splitn(n: int, f: FnMut<[T], boolean>): SplitN<T> {
    return SplitN(this, n, f);
  }

  public rsplitn(n: int, f: FnMut<[T], boolean>): RSplitN<T> {
    return RSplitN(this, n, f);
  }

  public contains(x: T): boolean {
    if (this.is_empty()) {
      return false;
    }

    if (typeof x === "object" && "eq" in (x as PartialEq<T>)) {
      try {
        return (
          this.ptr.findIndex((value) => (value as PartialEq<T>).eq(x)) !== -1
        );
      } catch {
        void 0;
      }
    }

    return this.ptr.includes(x);
  }

  public starts_with(needle: Iterable<T>): boolean {
    if (this.is_empty()) {
      return false;
    }

    let i = 0;
    for (const value of needle) {
      const compare = this.ptr[i++] as T;

      if (is_eq(value)) {
        if (value.ne(compare)) {
          return false;
        }
      }

      if (value !== compare) {
        return false;
      }
    }

    return true;
  }

  public ends_with(needle: Iterable<T>): boolean {
    if (this.is_empty()) {
      return false;
    }

    let i = Number(this.len().as_primitive());
    for (const value of needle) {
      const compare = this.ptr[--i] as T;

      if (is_eq(value)) {
        if (value.ne(compare)) {
          return false;
        }
      }

      if (value !== compare) {
        return false;
      }
    }

    return true;
  }

  public strip_prefix(prefix: Iterable<T>): Option<SliceImpl<T>> {
    const l = iter_len(prefix);

    if (l === 0) {
      return Some(this);
    }

    if (this.starts_with(prefix)) {
      return this.get_slice(0, iter_len(prefix));
    }

    return None;
  }

  public strip_suffix(suffix: Iterable<T>): Option<SliceImpl<T>> {
    const l = iter_len(suffix);

    if (l === 0) {
      return Some(this);
    }

    if (this.ends_with(suffix)) {
      return this.get_slice(iter_len(suffix), Infinity);
    }

    return None;
  }

  // binary_search, binary_search_by, binary_search_by_key

  public sort(): this {
    this.ptr.sort();
    return this;
  }

  public sort_by(compare: FnMut<[T, T], Ordering>): this {
    this.ptr.sort((a, b) => compare(a, b).value);
    return this;
  }

  // to_vec, into_vec, repeat

  public concat(i: Iterable<T>): this {
    for (const value of i) {
      this.ptr.push(value);
    }

    return this;
  }

  public rotate_left(mid: io<u8>): this {
    if (this.len().lt(mid)) {
      panic("Cannot rotate outside of pointer bounds");
    }

    if (this.len().eq(mid)) {
      return this;
    }

    this.ptr = this.get_slice(mid, this.len())
      .unwrap()
      .concat(this.get_slice(0, mid).unwrap()).ptr;

    return this;
  }

  public rotate_right(mid: io<u8>): this {
    if (this.len().lt(mid)) {
      panic("Cannot rotate outside of pointer bounds");
    }

    if (this.len().eq(mid)) {
      return this;
    }

    this.ptr = this.get_slice(0, mid)
      .unwrap()
      .concat(this.get_slice(mid, this.len()).unwrap()).ptr;

    return this;
  }

  public fill(value: T): this {
    this.ptr.fill(value, 0, Number(this.len().as_primitive()));
    return this;
  }

  public fill_with(f: FnMut<[], T>): this {
    let i = 0;

    while (i++ < Number(this.len().as_primitive())) {
      this.ptr[i] = f();
    }

    return this;
  }

  // join

  public eq(other: Iterable<T>): boolean {
    return (
      iter_len(other) === Number(this.len().as_primitive()) &&
      this.starts_with(other)
    );
  }

  public ne(other: Iterable<T>): boolean {
    return default_partial_eq<SliceImpl<T>, Iterable<T>>(this).ne(other);
  }

  public partial_cmp(other: Iterable<T>): Ordering {
    if (this.eq(other)) {
      return Ordering.Equal;
    }

    let i = 0;
    for (const value of other) {
      const self = this.ptr[i++];

      if (value === self) {
        continue;
      }

      if (is_cmp(value)) {
        return value.partial_cmp(self as T).reverse();
      }
    }

    // give up?
    return Ordering.Less;
  }

  public lt(other: Iterable<T>): boolean {
    return default_partial_ord<slice<T>, Iterable<T>>(this).lt(other);
  }

  public le(other: Iterable<T>): boolean {
    return default_partial_ord<slice<T>, Iterable<T>>(this).le(other);
  }

  public gt(other: Iterable<T>): boolean {
    return default_partial_ord<slice<T>, Iterable<T>>(this).gt(other);
  }

  public ge(other: Iterable<T>): boolean {
    return default_partial_ord<slice<T>, Iterable<T>>(this).lt(other);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type slice<T> = SliceImpl<T>;
export const slice = staticify(SliceImpl);
