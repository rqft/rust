import { staticify } from '../tools';
import { iter, Iter } from './iter';
import { format } from './macros';
import type { Option } from './option';
import { None, Some } from './option';
import type { Copy, Debug, Default, Display, FnMap, Stringify } from './traits';
import { tuple, Tuple } from './tuple';
import type { Vec } from './vec';
import { vec } from './vec';

export class HashMap<K, V>
implements Iterable<Tuple<[K, V]>>, Display, Copy, Debug, Default, Stringify
{
  private readonly alloc: Map<K, V> = new Map<K, V>();
  private cap = 0;

  public *[Symbol.iterator](): Generator<Tuple<[K, V]>, void, unknown> {
    for (const [key, value] of this.alloc) {
      yield tuple.new(key, value);
    }
  }

  public static new<K, V>(): HashMap<K, V> {
    return new this<K, V>();
  }

  public static withCapacity<K, V>(capacity: number): HashMap<K, V> {
    const mut = this.new<K, V>();

    mut.cap = capacity;
    return mut;
  }

  public static from<K, V>(iterable: Iterable<[K, V]>): HashMap<K, V> {
    const i = this.new<K, V>();

    for (const [key, value] of iterable) {
      i.insert(key, value);
    }

    return i;
  }

  public clone(): HashMap<K, V> {
    return HashMap.from<K, V>(this.alloc);
  }

  public default(): HashMap<unknown, unknown> {
    return HashMap.new<unknown, unknown>();
  }

  public fmt(): string {
    const entries: Array<[K, V]> = Array.from(this.alloc.entries());
    return `HashMap {\n${entries.map(
      ([k, v]) => `\t${format('{}', [k])} => ${format('{}', [v])}`
    )}\n}`;
  }

  public fmtDebug(): string {
    const entries: Array<[K, V]> = Array.from(this.alloc.entries());
    return `HashMap {\n${entries.map(
      ([k, v]) => `\t${format('{:?}', [k])} => ${format('{:?}', [v])}`
    )}\n}`;
  }

  public toString(): string {
    const entries: Array<[K, V]> = Array.from(this.alloc.entries());
    return `HashMap {\n${entries.map(([k, v]) => `\t${k} => ${v}`)}\n}`;
  }

  public insert(key: K, value: V): Option<V> {
    const existing = this.alloc.get(key);

    if (this.len() === this.capacity()) {
      this.cap++;
    }

    this.alloc.set(key, value);

    return None.ifEq(existing, undefined);
  }

  public len(): number {
    return this.alloc.size;
  }

  public capacity(): number {
    return this.cap;
  }

  public get(key: K): Option<V> {
    const value = this.alloc.get(key);

    return None.ifEq(value, undefined);
  }

  public keys(): Keys<K, V> {
    return iter.new(this.alloc.keys());
  }

  public intoKeys(): Keys<K, V> {
    const keys = this.keys();
    this.alloc.clear();
    return keys;
  }

  public values(): Values<K, V> {
    return iter.new(this.alloc.values());
  }

  public intoValues(): Values<K, V> {
    const values = this.values();
    this.alloc.clear();
    return values;
  }

  public iter(): Entries<K, V> {
    return iter.new(this.alloc.entries()).map((x) => tuple.new(...x));
  }

  public isEmpty(): boolean {
    return this.len() === 0;
  }

  public drain(): Entries<K, V> {
    const i = this.iter();
    this.alloc.clear();
    return i;
  }

  public drainFilter(f: FnMap<[K, V], boolean>): HashMap<K, V> {
    const to = HashMap.new<K, V>();

    for (const [key, value] of this.alloc) {
      if (f([key, value])) {
        to.insert(key, value);
        this.remove(key);
      }
    }

    return to;
  }

  public clear(): this {
    this.alloc.clear();
    return this;
  }

  public reserve(additional: number): this {
    if (this.capacity() >= this.len() + additional) {
      return this;
    }

    this.cap += additional;

    return this;
  }

  public shrinkToFit(): this {
    this.cap = this.len();
    return this;
  }

  public shrinkTo(max: number): this {
    this.cap = Math.max(this.len(), max);
    return this;
  }

  public entry(key: K): Option<Entry<K, V>> {
    const value = this.alloc.get(key);

    return None.ifEq(value, undefined).map((value) => tuple.new(key, value));
  }

  public getKeyValue(key: K): Option<[K, V]> {
    const value = this.alloc.get(key);
    return None.ifEq(value, undefined).map((value) => [key, value]);
  }

  public getMany(keys: Iterable<K>): Option<Iter<V>> {
    const v: Vec<V> = vec.new<V>();
    const seen: Set<K> = new Set<K>();
    for (const key of keys) {
      if (seen.has(key)) {
        return None;
      }

      const value = this.alloc.get(key);

      if (value === undefined) {
        return None;
      }

      v.push(value);
    }

    return Some(iter.new(v));
  }

  public containsKey(key: K): boolean {
    return this.alloc.has(key);
  }

  public remove(key: K): Option<V> {
    const existing = this.get(key);

    this.alloc.delete(key);

    return existing;
  }

  public removeEntry(key: K): Option<Entry<K, V>> {
    return this.remove(key).map((value) => tuple.new(key, value));
  }

  
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class Keys<K, _> extends Iter<K> {}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class Values<_, V> extends Iter<V> {}
export class Entries<K, V> extends Iter<Entry<K, V>> {}
export class Entry<K, V> extends Tuple<[K, V]> {}

export const hashmap = staticify(HashMap);
