import { staticify } from '../../../tools';
import type { Debug } from '../../fmt';
import { DebugMap } from '../../fmt';
import { compare_hash } from '../../hash';
import { usize } from '../../number/index';
import type { io } from '../../number/int_sized';
import type { FnMut } from '../../ops/index';
import type { Option } from '../../option';
import { None, Some } from '../../option';
import { Vec } from '../../vec/vec';
import { IntoIter } from './into_iter';
import { IntoKeys } from './into_keys';
import { IntoValues } from './into_values';
import { Iter } from './iter';
import { Keys } from './keys';
import { Values } from './values';

class HashMapImpl<K, V> implements Debug {
  public vec: Vec<[K, V]> = Vec();

  public fmt_debug(
    this: K extends Debug
      ? V extends Debug
        ? HashMapImpl<K, V>
        : never
      : never
  ): string {
    const map = new DebugMap();

    for (const [k, v] of this.vec.clone()) {
      map.entry(k, v);
    }

    return map.finish().unwrap();
  }

  public static new<K, V>(): HashMapImpl<K, V> {
    return new this();
  }

  public static with_capacity<K, V>(capacity: io<usize>): HashMapImpl<K, V> {
    const raw = this.new<K, V>();
    raw.vec = Vec.with_capacity(capacity);
    return raw;
  }

  public capacity(): usize {
    return this.vec.capacity();
  }

  public keys(): Keys<K, V> {
    return Keys(this);
  }

  public into_keys(): IntoKeys<K, V> {
    return IntoKeys(this);
  }

  public values(): Values<K, V> {
    return Values(this);
  }

  public into_values(): IntoValues<K, V> {
    return IntoValues(this);
  }

  public iter(): Iter<K, V> {
    return Iter(this);
  }

  public into_iter(): IntoIter<K, V> {
    return IntoIter(this);
  }

  public len(): usize {
    return this.vec.len();
  }

  public is_empty(): boolean {
    return this.vec.is_empty();
  }

  public drain(): IntoIter<K, V> {
    return this.into_iter();
  }

  // drain_filter

  public retain(f: FnMut<[K, V], boolean>): this {
    this.vec.retain((x) => f(...x));
    return this;
  }

  public clear(): this {
    this.vec.clear();
    return this;
  }

  // comparison

  public reserve(additional: io<usize>): this {
    this.vec.reserve(additional);
    return this;
  }

  public shrink_to_fit(): this {
    this.vec.shrink_to_fit();
    return this;
  }

  public shrink_to(min_capacity: io<usize>): this {
    this.vec.shrink_to(min_capacity);
    return this;
  }

  public entry(key: K): Option<[K, V]> {
    return this.vec
      .clone()
      .into_iter()
      .find(([k]) => compare_hash(key, k));
  }

  private entry_index(key: K): Option<usize> {
    const raw = this.entry(key);
    if (raw.is_some()) {
      return Some(usize(this.vec.alloc.indexOf(raw)));
    }

    return None;
  }

  public get(k: K): Option<V> {
    return this.entry(k).map(([, v]) => v);
  }

  public get_key_value(k: K): Option<[K, V]> {
    return this.entry(k);
  }

  public get_many(keys: Iterable<K>): Option<Vec<V>> {
    const out: Array<V> = [];
    const seen: Array<K> = [];
    for (const key of keys) {
      seen.push(key);

      const value = this.get(key);

      if (value.is_none()) {
        return None;
      }
      out.push(value.unwrap());
    }

    return Some(Vec.from_iter(out));
  }

  public contains_key(k: K): boolean {
    return this.entry(k).is_some();
  }

  public insert(k: K, v: V): Option<V> {
    const old = this.get(k);
    if (old.is_some()) {
      this.vec.remove(this.entry_index(k).unwrap());
      this.vec.push([k, v]);
      return old;
    }

    return None;
  }

  public remove(k: K): Option<V> {
    const old = this.get(k);
    if (old.is_some()) {
      this.vec.remove(this.entry_index(k).unwrap());
      return old;
    }

    return None;
  }

  public remove_entry(k: K): Option<[K, V]> {
    return this.remove(k).map((v) => [k, v]);
  }

  public static from_iter<K, V>(i: Iterable<[K, V]>): HashMapImpl<K, V> {
    const self = this.new<K, V>();

    for (const [key, value] of i) {
      self.insert(key, value);
    }

    return self;
  }
}

export type HashMap<K, V> = HashMapImpl<K, V>;
export const HashMap = staticify(HashMapImpl);
