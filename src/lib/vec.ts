import { staticify } from '../tools';
import { format } from './macros';

import { None, Some, type Option } from './option';
import type { Copy, Debug, Default, Display, FnMap, FnOnce } from './traits';

export class Vec<T> implements Display, Debug, Copy, Default {
  private readonly alloc: Array<Option<T>> = [];
  public static new<T>(): Vec<T> {
    return new this<T>();
  }

  public clone(): Vec<T> {
    return Vec.from(this);
  }

  public default(): Vec<unknown> {
    return Vec.new();
  }

  public fmtDebug(): string {
    return format('vec![{}; {}]', [this.len(), this.capacity()]);
  }

  public fmt(): string {
    return format('vec[{}]', [
      this.alloc
        .filter((x) => x.isSome())
        .map((x) => x.unwrap())
        .map((x) => {
          if (typeof x === 'object' || typeof x === 'function') {
            if ('fmt' in (x as Display)) {
              return (x as Display).fmt();
            }
            throw new Error(`${x} does not impl trait \`Display\``);
          }

          return String(x);
        })
        .join(', '),
    ]);
  }

  *[Symbol.iterator](): Generator<T, void, unknown> {
    while (this.len() > 0) {
      yield this.pop().unwrap();
    }
  }

  public static withCapacity<T>(capacity: number): Vec<T> {
    const p = this.new<T>();
    let i = 0;
    while (i++ < capacity) {
      p.alloc[0] = None;
    }

    return p;
  }

  public capacity(): number {
    return this.alloc.length;
  }

  public reserve(max: number): this {
    while (this.capacity() < max) {
      this.alloc.push(None);
    }

    return this;
  }

  public len(): number {
    let c = 0;
    let i = 0;
    while (this.alloc[i++]?.isSome()) {
      c++;
    }

    return c;
  }

  public shrinkToFit(): this {
    while (this.hasTrail()) {
      delete this.alloc[this.capacity() - 1];
    }

    return this;
  }

  public shrinkTo(minCapacity: number): this {
    while (this.capacity() > minCapacity && this.hasTrail()) {
      delete this.alloc[this.capacity() - 1];
    }

    return this;
  }

  private hasTrail(): boolean {
    return this.alloc[this.capacity() - 1]?.isNone() ?? false;
  }

  private last(): Option<T> {
    return this.get(this.len() - 1);
  }

  public truncate(len: number): this {
    while (this.capacity() < len) {
      delete this.alloc[this.capacity() - 1];
    }

    return this;
  }

  private oob(index: number): never {
    throw `oob: ${index} does not fit in vec[${this.len()}; ${this.capacity()}]`;
  }

  public swapRemove(index: number): Option<T> {
    const value = this.alloc[index];
    if (value === None || value === undefined) {
      // oob: -1 does not fit in vec[3; 5]
      throw this.oob(index);
    }

    this.alloc[index] = this.last();
    this.alloc[this.len() - 1] = None;
    return value;
  }

  public insert(index: number, element: T): this {
    if (index > this.len()) {
      throw this.oob(index);
    }

    this.alloc.splice(index, 0, Some.new(element));
    return this;
  }

  public remove(index: number): Option<T> {
    if (index > this.len()) {
      throw this.oob(index);
    }

    return this.alloc.splice(index, 1)[0] || None;
  }

  public retain(f: FnMap<T, boolean>): this {
    let i = 0;
    while (i < this.len()) {
      if (!f(this.get(i).unwrap())) {
        this.remove(i);
      }

      i++;
    }

    return this;
  }

  public push(element: T): this {
    if (this.hasTrail()) {
      this.alloc[this.alloc.indexOf(None)] = Some.new(element);
    } else {
      this.alloc.push(Some.new(element));
    }

    return this;
  }

  public pop(): Option<T> {
    if (this.len() === 0) {
      return None;
    }

    const i = this.get(this.len() - 1);
    this.remove(this.len() - 1);

    return i;
  }

  public append(other: Vec<T>): this {
    while (other.len()) {
      this.push(other.pop().unwrap());
    }

    return this;
  }

  public drain([range_min, range_max]: [number, number]): Vec<unknown> {
    if (range_min > range_max) {
      throw 'starting point cannot be larger than the ending point';
    }

    if (range_min > this.len()) {
      throw 'ending point cannot be larger than this vec\'s length';
    }

    const n = Vec.withCapacity(range_max - range_min);

    for (let i = range_min; i <= range_max; i++) {
      n.push(this.remove(i));
    }

    return n;
  }

  public drainFilter(f: FnMap<T, boolean>): void {
    let i = 0;
    const n = Vec.new();
    while (i < this.len()) {
      if (f(this.get(i).unwrap())) {
        n.push(this.remove(i));
        continue;
      }

      i++;
    }
  }

  public clear(): this {
    while (this.last().isSome()) {
      this.alloc[this.len() - 1] = None;
    }

    return this;
  }

  public isEmpty(): boolean {
    return this.len() === 0;
  }

  public splitOff(at: number): Vec<unknown> {
    if (at > this.len()) {
      throw this.oob(at);
    }

    const p = Vec.withCapacity(this.len() - at);

    for (let i = at; i < this.len(); i++) {
      p.push(this.get(i).unwrap());
    }

    this.truncate(at - 1);
    return p;
  }

  public resizeWith(newLen: number, f: FnOnce<T>): this {
    if (newLen < this.len()) {
      return this.truncate(newLen);
    }

    while (this.len() < newLen) {
      this.push(f());
    }

    return this;
  }

  public resize(newLen: number, t: T): this {
    return this.resizeWith(newLen, () => t);
  }

  public extend(iter: Iterable<T>): this {
    for (const value of iter) {
      this.push(value);
    }

    return this;
  }

  public join(str: string): string {
    return this.alloc
      .filter((x) => x.isSome())
      .map((x) => x.unwrap())
      .join(str);
  }

  public contains(value: T): boolean {
    for (let i = 0; i < this.len(); i++) {
      if (this.get(i).unwrap() === value) {
        return true;
      }
    }

    return false;
  }

  public endsWith(...needle: Array<T>): boolean {
    if (this.len() === 0 || needle.length === 0) {
      return true;
    }

    for (let i = this.len() - needle.length; i < this.len(); i++) {
      const z = needle[i];
      if (z !== undefined && !this.get(i).contains(z)) {
        return false;
      }
    }

    return true;
  }

  public fill(value: T): this {
    for (let i = 0; i < this.capacity(); i++) {
      this.alloc[i] = Some.new(value);
    }

    return this;
  }

  public fillWith(f: FnOnce<T>): this {
    for (let i = 0; i < this.capacity(); i++) {
      this.alloc[i] = Some.new(f());
    }

    return this;
  }

  public first(): Option<T> {
    return this.get(0);
  }

  public get(index: number): Option<T> {
    return this.alloc[index] || None;
  }

  public static repeat<T>(slice: Array<T>, n: number): Vec<T> {
    return this.from<T>(Array<Array<T>>(n).fill(slice).flat());
  }

  public reverse(): this {
    const slice = this.alloc.slice(0, this.len()).reverse();

    this.alloc.splice(0, slice.length, ...slice);
    return this;
  }

  public rotateLeft(mid: number): this {
    const slice = this.alloc.slice(0, this.len());

    while (mid-- > 0) {
      slice.push(slice.shift() || None);
    }

    this.alloc.splice(0, slice.length, ...slice);

    return this;
  }

  public rotateRight(mid: number): this {
    const slice = this.alloc.slice(0, this.len());

    while (mid-- > 0) {
      slice.unshift(slice.pop() || None);
    }

    this.alloc.splice(0, slice.length, ...slice);

    return this;
  }

  public split(p: FnMap<T, boolean>): Vec<unknown> {
    const z = Vec.new();
    const current = Vec.new<T>();
    for (let i = 0; i < this.len(); i++) {
      const e = this.get(i);
      if (p(e.unwrap())) {
        current.push(e.unwrap());
        continue;
      }

      z.push(current);
      current.clear();
    }

    return z;
  }

  public splitAt(mid: number): [Vec<T>, Vec<T>] {
    const l = Vec.new<T>();
    const r = Vec.new<T>();
    for (let i = 0; i < this.len(); i++) {
      if (i < mid) {
        l.push(this.get(i).unwrap());
        continue;
      }

      r.push(this.get(i).unwrap());
    }

    return [l, r];
  }

  public splitFirst(): [Vec<T>, Vec<T>] {
    return this.splitAt(1);
  }

  public splitLast(): [Vec<T>, Vec<T>] {
    return this.splitAt(this.len() - 2);
  }

  public startsWith(...needle: Array<T>): boolean {
    if (this.len() === 0 || needle.length === 0) {
      return true;
    }

    for (let i = 0; i < needle.length; i++) {
      const z = needle[i];
      if (z !== undefined && !this.get(i).contains(z)) {
        return false;
      }
    }

    return true;
  }

  public stripPrefix(...prefix: Array<T>): this {
    if (this.startsWith(...prefix)) {
      for (let i = 0; i < prefix.length && this.len(); i++) {
        this.remove(0);
      }
    }

    return this;
  }

  public stripSuffix(...prefix: Array<T>): this {
    if (this.startsWith(...prefix)) {
      for (let i = 0; i < prefix.length && this.len(); i++) {
        this.pop();
      }
    }

    return this;
  }

  public swap(a: number, b: number): this {
    if (a > this.len()) {
      throw this.oob(a);
    }

    if (b > this.len()) {
      throw this.oob(b);
    }

    const t = this.get(a);
    this.alloc[a] = this.get(b);
    this.alloc[b] = t;

    return this;
  }

  public chunks(size: number): Vec<Vec<T>> {
    if (size === 0) {
      throw 'size must be > 0';
    }

    const p = Vec.new<Vec<T>>();
    for (let i = 0; i < this.len(); i += size) {
      const n = Vec.new<T>();
      for (let j = 0; j < size && j < this.len(); j++) {
        n.push(this.get(j + i).unwrap());
      }

      p.push(n);
    }

    return p;
  }

  public static from<T>(i: Iterable<T>): Vec<T> {
    const p = this.new<T>();
    for (const value of i) {
      p.push(value);
    }

    return p;
  }
}

export const vec = staticify(Vec);
