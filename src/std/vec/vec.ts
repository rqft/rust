import { staticify } from '../../tools';
import { Iterator } from '../iter';
import { usize } from '../number';
import type { io } from '../number/int_sized';
import type { FnOnce } from '../ops';
import type { Option } from '../option';
import { None, Some } from '../option';
import type { Result } from '../result';
import { Err, Ok } from '../result';
import { slice } from '../slice';
import { IntoIter } from './into_iter';

export class VecImpl<T> {
  public readonly alloc: Array<Option<T>> = [];

  public static new<T>(): VecImpl<T> {
    return new this<T>();
  }

  public static with_capacity<T>(capacity: io<usize>): VecImpl<T> {
    const owned = this.new<T>();
    return owned.reserve(capacity);
  }

  public *[Symbol.iterator](): Generator<T, void, unknown> {
    while (1 / 1) {
      const pop = this.pop();

      if (pop.is_none()) {
        break;
      }

      yield pop.unwrap();
    }
  }

  public capacity(): usize {
    return usize(this.alloc.length);
  }

  private capacity_extension(): this {
    const lock = this.capacity().valueOf();
    for (let i = 0n; i < lock; i++) {
      this.alloc.push(None);
    }

    return this;
  }

  public reserve(additional: io<usize>): this {
    while (this.capacity().lt(additional)) {
      this.capacity_extension();
    }

    return this;
  }

  public reserve_exact(additional: io<usize>): this {
    while (this.capacity().lt(additional)) {
      this.alloc.push(None);
    }

    return this;
  }

  private has_none_tail(): boolean {
    const last = this.alloc.pop();

    if (last === undefined) {
      return false;
    }

    // put it back .
    this.alloc.push(last);

    return last.is_none();
  }

  public shrink_to_fit(): this {
    while (this.has_none_tail()) {
      this.alloc.pop();
    }

    return this;
  }

  public shrink_to(to: io<usize>): this {
    while (this.capacity().gt(to) && this.has_none_tail()) {
      this.alloc.pop();
    }

    return this;
  }

  public len(): usize {
    let c = 0n;
    let i = 0;
    while (this.alloc[i++]?.is_some()) {
      c++;
    }
    return usize(c);
  }

  public truncate(len: io<usize>): this {
    while (this.len().gt(len)) {
      this.alloc[this.len().sub(1).into(Number)] = None;
    }

    return this;
  }

  public as_slice(): slice<T> {
    return slice(
      this.alloc.slice(0, this.len().into(Number)).map((x) => x.unwrap())
    );
  }

  public get(index: io<usize>): Option<T> {
    return this.alloc[usize(index).into(Number)] || None;
  }

  private last(): Option<T> {
    return this.get(this.len().sub(1));
  }

  private oob(index: io<usize>): never {
    throw `index ${index.valueOf()} does not fit in vec[${this.len()}; ${this.capacity()}]`;
  }

  public swap_remove(index: number): Option<T> {
    const value = this.alloc[index];
    if (value === None || value === undefined) {
      // oob: -1 does not fit in vec[3; 5]
      throw this.oob(index);
    }

    this.alloc[index] = this.last();
    this.alloc[this.len().sub(1).into(Number)] = None;
    return value;
  }

  public insert(index: io<usize>, element: T): this {
    if (this.len().le(index)) {
      throw this.oob(index);
    }

    this.alloc.splice(usize(index).into(Number), 0, Some(element));
    return this;
  }

  public remove(index: io<usize>): Option<T> {
    if (index > this.len()) {
      throw this.oob(index);
    }

    return this.alloc.splice(usize(index).into(Number), 1)[0] || None;
  }

  // dedup_by_key, dedup_by

  public retain(f: FnOnce<[T], boolean>): this {
    let i = 0n;
    while (this.len().gt(i)) {
      if (!f(this.get(i).unwrap())) {
        this.remove(i);
      }

      i++;
    }

    return this;
  }

  public push(element: T): this {
    if (this.has_none_tail()) {
      this.alloc[this.alloc.indexOf(None)] = Some.new(element);
    } else {
      // double capacity when you run out of space
      this.capacity_extension();
      this.push(element);
    }

    return this;
  }

  public push_within_capacity(element: T): Result<null, T> {
    if (this.len() >= this.capacity()) {
      return Err(element);
    }

    this.push(element);
    return Ok(null);
  }

  public pop(): Option<T> {
    if (this.len().eq(0)) {
      return None;
    }

    const i = this.get(this.len().sub(1));
    this.remove(this.len().sub(1));

    return i;
  }

  public append(other: Vec<T>): this {
    for (const value of other) {
      this.push(value);
    }

    return this;
  }

  public drain([range_min, range_max]: [io<usize>, io<usize>]): Vec<T> {
    if (usize(range_min).gt(range_max)) {
      throw 'starting point cannot be larger than the ending point';
    }

    if (range_min > this.len()) {
      throw 'ending point cannot be larger than this vec\'s length';
    }

    const n = Vec.with_capacity<T>(usize(range_max).sub(range_min));

    for (
      let i = usize(range_min).valueOf();
      i <= usize(range_max).valueOf();
      i++
    ) {
      n.push(this.remove(i).unwrap());
    }

    return n;
  }

  public clear(): this {
    this.drain([0, this.len()]);
    return this;
  }

  public is_empty(): boolean {
    return this.len().eq(0);
  }

  public split_off(at: io<usize>): Vec<T> {
    if (this.len().lt(at)) {
      throw this.oob(at);
    }

    const p = Vec.with_capacity<T>(this.len().sub(at));

    for (let i = usize(at).valueOf(); this.len().gt(i); i++) {
      p.push(this.get(i).unwrap());
    }

    this.truncate(usize(at).sub(1));
    return p;
  }

  public resize_with(new_len: io<usize>, f: FnOnce<[], T>): this {
    if (this.len().gt(new_len)) {
      return this.truncate(new_len);
    }

    while (this.len().lt(new_len)) {
      this.push(f());
    }

    return this;
  }

  public resize(newLen: io<usize>, t: T): this {
    return this.resize_with(newLen, () => t);
  }

  public extend(iter: Iterable<T>): this {
    for (const value of iter) {
      this.push(value);
    }

    return this;
  }

  public join(str: string): string {
    return this.alloc
      .filter((x) => x.is_some())
      .map((x) => x.unwrap())
      .join(str);
  }

  public into_iter(): IntoIter<T> {
    return IntoIter(this);
  }

  public iter(): Iterator<T> {
    return Iterator(
      this.alloc.filter((x) => x.is_some()).map((x) => x.unwrap_unchecked())
    );
  }

  public clone(): Vec<T> {
    const raw = this.alloc.filter((x) => x.is_some()).map((x) => x.unwrap());

    const into = Vec<T>();

    for (const value of raw) {
      into.push(value);
    }

    return into;
  }

  public static from_iter<T>(i: Iterable<T>): Vec<T> {
    const out = this.new<T>();
    for (const value of i) {
      out.push(value);
    }

    return out;
  }

  public index_of(value: T): usize {
    return usize(this.alloc.findIndex((x) => x.contains(value)));
  }
}

export type Vec<T> = VecImpl<T>;
export const Vec = staticify(VecImpl);
