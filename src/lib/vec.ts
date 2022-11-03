import type { Option } from './option';
import { None, Some } from './option';
import type { FnMap, FnOnce } from './traits';

export class Vec<T> {
  private readonly alloc: Array<Option<T>> = [];
  constructor() {}
  public static new<T>() {
    return new this<T>();
  }

  *[Symbol.iterator]() {
    while (this.len() > 0) {
      this.pop();
    }
  }

  public static withCapacity<T>(capacity: number) {
    const p = this.new<T>();
    let i = 0;
    while (i++ < capacity) {
      p.alloc[0] = None;
    }

    return p;
  }

  public capacity() {
    return this.alloc.length;
  }

  public reserve(max: number) {
    while (this.capacity() < max) {
      this.alloc.push(None);
    }

    return this;
  }

  public len() {
    let c = 0;
    let i = 0;
    while (this.alloc[i++]?.isSome()) {
      c++;
    }

    return c;
  }

  public shrinkToFit() {
    while (this.hasTrail()) {
      delete this.alloc[this.capacity() - 1];
    }

    return this;
  }

  public shrinkTo(minCapacity: number) {
    while (this.capacity() > minCapacity && this.hasTrail()) {
      delete this.alloc[this.capacity() - 1];
    }

    return this;
  }

  private hasTrail() {
    return this.alloc[this.capacity() - 1]?.isNone() ?? true;
  }

  private last() {
    return this.get(this.len() - 1);
  }

  public truncate(len: number) {
    while (this.capacity() < len) {
      delete this.alloc[this.capacity() - 1];
    }

    return this;
  }

  private oob(index: number): never {
    throw `oob: ${index} does not fit in vec[${this.len()}; ${this.capacity()}]`;
  }

  public swapRemove(index: number) {
    const value = this.alloc[index];
    if (value === None || value === undefined) {
      // oob: -1 does not fit in vec[3; 5]
      throw this.oob(index);
    }

    this.alloc[index] = this.last();
    this.alloc[this.len() - 1] = None;
    return value;
  }

  public insert(index: number, element: T) {
    if (index > this.len()) {
      throw this.oob(index);
    }

    this.alloc.splice(index, 0, Some(element));
    return this;
  }

  public remove(index: number) {
    if (index > this.len()) {
      throw this.oob(index);
    }

    return this.alloc.splice(index, 1)[0] || None;
  }

  public retain(f: FnMap<T, boolean>) {
    let i = 0;
    while (i < this.len()) {
      if (!f(this.get(i).unwrap())) {
        this.remove(i);
      }

      i++;
    }

    return this;
  }

  public push(element: T) {
    if (this.hasTrail()) {
      this.alloc[this.alloc.indexOf(None)] = Some(element);
    } else {
      this.alloc.push(Some(element));
    }

    return this;
  }

  public pop() {
    if (this.len() === 0) {
      return None;
    }

    const i = this.alloc[this.len() - 1];
    this.remove(this.len() - 1);

    return i;
  }

  public append(other: Vec<T>) {
    while (other.len()) {
      this.push((other.pop() || None).unwrap());
    }

    return this;
  }

  public drain([range_min, range_max]: [number, number]) {
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

  public drainFilter(f: FnMap<T, boolean>) {
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

  public clear() {
    while (this.last()) {
      this.alloc[this.len() - 1] = None;
    }

    return this;
  }

  public isEmpty() {
    return this.len() === 0;
  }

  public splitOff(at: number) {
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

  public resizeWith(newLen: number, f: FnOnce<T>) {
    if (newLen < this.len()) {
      return this.truncate(newLen);
    }

    while (this.len() < newLen) {
      this.push(f());
    }

    return this;
  }

  public resize(newLen: number, t: T) {
    return this.resizeWith(newLen, () => t);
  }

  public extend(iter: Iterable<T>) {
    for (const value of iter) {
      this.push(value);
    }

    return this;
  }

  public join(str: string) {
    return this.alloc
      .filter((x) => x.isSome())
      .map((x) => x.unwrap())
      .join(str);
  }

  public contains(value: T) {
    for (let i = 0; i < this.len(); i++) {
      if (this.get(i).unwrap() === value) {
        return true;
      }
    }

    return false;
  }

  public endsWith(...needle: Array<T>) {
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

  public fill(value: T) {
    for (let i = 0; i < this.capacity(); i++) {
      this.alloc[i] = Some(value);
    }

    return this;
  }

  public fillWith(f: FnOnce<T>) {
    for (let i = 0; i < this.capacity(); i++) {
      this.alloc[i] = Some(f());
    }

    return this;
  }

  public first() {
    return this.get(0);
  }

  public get(index: number) {
    return this.alloc[index] || None;
  }

  public static repeat<T>(slice: Array<T>, n: number) {
    return this.from(Array(n).fill(slice).flat());
  }

  public reverse() {
    const slice = this.alloc.slice(0, this.len()).reverse();

    this.alloc.splice(0, slice.length, ...slice);
    return this;
  }

  public rotateLeft(mid: number) {
    const slice = this.alloc.slice(0, this.len());

    while (mid-- > 0) {
      slice.push(slice.shift() || None);
    }

    this.alloc.splice(0, slice.length, ...slice);

    return this;
  }

  public rotateRight(mid: number) {
    const slice = this.alloc.slice(0, this.len());

    while (mid-- > 0) {
      slice.unshift(slice.pop() || None);
    }

    this.alloc.splice(0, slice.length, ...slice);

    return this;
  }

  public split(p: FnMap<T, boolean>) {
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

  public splitFirst() {
    return this.splitAt(1);
  }

  public splitLast() {
    return this.splitAt(this.len() - 2);
  }

  public startsWith(...needle: Array<T>) {
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

  public stripPrefix(...prefix: Array<T>) {
    if (this.startsWith(...prefix)) {
      for (let i = 0; i < prefix.length && this.len(); i++) {
        this.remove(0);
      }
    }

    return this;
  }

  public stripSuffix(...prefix: Array<T>) {
    if (this.startsWith(...prefix)) {
      for (let i = 0; i < prefix.length && this.len(); i++) {
        this.pop();
      }
    }

    return this;
  }

  public swap(a: number, b: number) {
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

  public chunks(size: number) {
    if (size === 0) {
      throw 'size must be > 0';
    }

    const p = Vec.new();
    for (let i = 0; i < this.len(); i += size) {
      const n = Vec.new();
      for (let j = 0; j < size && j < this.len(); j++) {
        n.push(this.get(j + i));
      }
    }
  }

  public static from<T>(i: Iterable<T>) {
    const p = this.new();
    for (const value of i) {
      p.push(value);
    }

    return p;
  }
}
