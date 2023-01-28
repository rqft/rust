import { staticify } from "../../../tools";
import { compare_hash } from "../../hash";
import type { IntoIterator } from "../../iter";
import type { usize } from "../../number";
import type { io } from "../../number/int_sized";
import type { FnOnce } from "../../ops";
import type { Option } from "../../option";
import { None, Some } from "../../option";
import { Vec } from "../../vec";
import { Difference } from "./difference";
import { Intersection } from "./intersection";
import { IntoIter } from "./into_iter";
import { Iter } from "./iter";
import { SymmetricDifference } from "./symmetric_difference";
import { Union } from "./union";

class HashSetImpl<T> implements IntoIterator<T> {
  public vec: Vec<T> = Vec();

  public static new<T>(): HashSetImpl<T> {
    return new this<T>();
  }

  public static with_capacity<T>(capacity: io<usize>): HashSetImpl<T> {
    const raw = this.new<T>();
    raw.vec = Vec.with_capacity(capacity);
    return raw;
  }

  public iter(): Iter<T> {
    return Iter(this);
  }

  public len(): usize {
    return this.vec.len();
  }

  public is_empty(): boolean {
    return this.vec.is_empty();
  }

  // drain, drain_filter

  public retain(f: FnOnce<[T], boolean>): this {
    this.vec.retain(f);
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

  // public reserve_exact(additional: io<usize>): this {
  //   this.vec.reserve_exact(additional);
  //   return this;
  // }

  public shrink_to_fit(): this {
    this.vec.shrink_to_fit();
    return this;
  }

  public shrink_to(min_capacity: io<usize>): this {
    this.vec.shrink_to(min_capacity);
    return this;
  }

  // difference, symmetric_difference, intersection, union

  public difference(other: HashSet<T>): Difference<T> {
    return Difference(this, other);
  }

  public symmetric_difference(other: HashSet<T>): SymmetricDifference<T> {
    return SymmetricDifference(this, other);
  }

  public intersection(other: HashSet<T>): Intersection<T> {
    return Intersection(this, other);
  }

  public union(other: HashSet<T>): Union<T> {
    return Union(this, other);
  }

  public get(key: T): Option<T> {
    return this.vec
      .clone()
      .into_iter()
      .find((k) => compare_hash(key, k));
  }

  public contains(key: T): boolean {
    return this.get(key).is_some();
  }

  public get_or_insert(value: T): T {
    if (this.contains(value)) {
      return this.get(value).unwrap();
    }

    this.vec.push(value);
    return value;
  }

  public get_or_insert_with(value: T, f: FnOnce<[T], T>): T {
    if (this.contains(value)) {
      return this.get(value).unwrap();
    }

    const output = f(value);
    void this.get_or_insert(output); // drop instantly
    return output;
  }

  public is_disjoint(other: HashSet<T>): boolean {
    if (this.len().le(other.len())) {
      return this.iter().all((v) => !other.contains(v));
    } else {
      return other.iter().all((v) => !this.contains(v));
    }
  }

  public is_subset(other: HashSet<T>): boolean {
    if (this.len().le(other.len())) {
      return this.iter().all((v) => other.contains(v));
    } else {
      return false;
    }
  }

  public is_superset(other: HashSet<T>): boolean {
    return other.is_subset(this);
  }

  public insert(value: T): this {
    if (this.contains(value)) {
      return this;
    }

    this.vec.push(value);
    return this;
  }

  public replace(value: T): this {
    // do nothing, js literally can't compare these this way
    void value;
    return this;
  }

  public remove(T: T): this {
    this.vec.remove(this.vec.index_of(T));
    return this;
  }

  public take(T: T): Option<T> {
    if (this.contains(T)) {
      this.remove(T);
      return Some(T);
    }

    return None;
  }

  public into_iter(): IntoIter<T> {
    return IntoIter(this);
  }

  public static from_iter<T>(iter: Iterable<T>): HashSetImpl<T> {
    const raw = this.new<T>();

    for (const value of iter) {
      raw.insert(value);
    }

    return raw;
  }
}

export type HashSet<T> = HashSetImpl<T>;
export const HashSet = staticify(HashSetImpl);
