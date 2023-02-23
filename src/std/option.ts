import { staticify } from '../tools';
import type { Clone } from './clone';
import type { PartialEq, PartialOrd } from './cmp';
import {
  Ordering,
  default_partial_eq,
  default_partial_ord,
  has_derivable_partial_eq,
  has_derivable_partial_ord,
} from './cmp';
import type { AsMutRef, AsRef } from './convert';
import { Ref, RefMut } from './convert';
import type { LogicalAnd, LogicalOr, LogicalXor, _ } from './custom';
import type { Debug } from './fmt';
import { compare_hash } from './hash';
import type { FnOnce } from './ops/index';

import { panic } from './panic';

class SomeImpl<T>
implements
    AsRef<T>,
    AsMutRef<T>,
    Clone<Option<T>>,
    PartialEq<Option<T>>,
    PartialOrd<Option<T>>,
    LogicalOr<Option<T>>,
    LogicalAnd<Option<T>>,
    LogicalXor<Option<T>>,
    Debug
{
  constructor(public value: T) {}

  public fmt_debug(this: T extends Debug ? SomeImpl<T> : never): string {
    return `Some(${this.value.fmt_debug()})`;
  }

  public static new<T>(value: T): SomeImpl<T> {
    return new this(value);
  }

  public clone(): Option<T> {
    return Some(this.value);
  }

  public some(): boolean {
    return this.is_some();
  }

  public none(): boolean {
    return this.is_none();
  }

  public is_some(): this is SomeImpl<T> {
    return true;
  }

  public is_some_and(f: FnOnce<[T], boolean>): boolean {
    return f(this.value);
  }

  public is_none(): this is NoneImpl<T> {
    return false;
  }

  public as_ref(): Ref<this, T> {
    return new Ref(this, this.value);
  }

  public as_mut_ref(): RefMut<this, T> {
    return new RefMut(this, this.value);
  }

  public expect(message: string): T {
    void message;
    return this.value;
  }

  public unwrap(): T {
    return this.value;
  }

  public unwrap_or(def: T): T {
    void def;
    return this.value;
  }

  public unwrap_or_else<F extends FnOnce<[], T>>(f: F): T {
    void f;
    return this.value;
  }

  public unwrap_or_default(): T {
    return this.value;
  }

  public unwrap_unchecked(): T {
    return this.value;
  }

  public map<U, F extends FnOnce<[T], U>>(f: F): Option<U> {
    return SomeImpl.new(f(this.value));
  }

  public inspect<F extends FnOnce<[T]>>(f: F): this {
    f(this.value);
    return this;
  }

  public map_or<U, F extends FnOnce<[T], U>>(def: U, f: F): U {
    void def;
    return this.map<U, F>(f).unwrap();
  }

  public map_or_else<U, D extends FnOnce<[], U>, F extends FnOnce<[T], U>>(
    def: D,
    f: F
  ): U {
    void def;
    return this.map<U, F>(f).unwrap();
  }

  // ok_or, ok_or_else

  // public as_deref(): Option<Ref<this, T>> {
  //   return SomeImpl.new(Ref.new<this, T>(this as never, this.value.deref()));
  // }

  // public as_deref_mut(): Option<RefMut<this, T>> {
  //   if (typeof this.value === 'object' && 'deref_mut' in (this.value as DerefMut<_>))
  //     return SomeImpl.new(
  //       RefMut.new<this, T>(this as never, this.value.deref_mut())
  //     );
  // }

  // iter, iter_mut

  public and<U>(optb: Option<U>): Option<U> {
    return optb;
  }

  public and_then<U, F extends FnOnce<[T], Option<U>>>(f: F): Option<U> {
    return f(this.value) as never;
  }

  public filter<P extends FnOnce<[T], boolean>>(predicate: P): Option<T> {
    if (!predicate(this.value)) {
      return None;
    }

    return this;
  }

  public or(optb: Option<T>): this {
    void optb;
    return this;
  }

  public or_else<F extends FnOnce<[], T>>(f: F): this {
    void f;
    return this;
  }

  public xor(optb: Option<T>): Option<T> {
    // [Some, Some]
    if (optb.is_some()) {
      return None;
    }

    // [Some, None]
    return this;
  }

  public insert(value: T): RefMut<this, T> {
    this.value = value;

    return RefMut.new(this, value);
  }

  public get_or_insert(value: T): RefMut<this, T> {
    void value;
    return RefMut.new(this, this.value);
  }

  public get_or_insert_default(): RefMut<this, T> {
    return RefMut.new(this as never, this.value);
  }

  public get_or_insert_with<F extends FnOnce<[], T>>(f: F): RefMut<this, T> {
    void f;
    return RefMut.new(this, this.value);
  }

  public take(): Option<T> {
    const old = this.clone();
    Object.assign(this, None);
    return old;
  }

  public replace(value: T): Option<T> {
    const old = this.clone();
    this.value = value;
    return old;
  }

  public contains<U extends T>(x: U): boolean {
    return compare_hash(this.value, x);
  }

  public zip<U>(other: Option<U>): Option<[T, U]> {
    if (other.is_none()) {
      return None;
    }

    return SomeImpl.new([this.value, other.value] as [T, U]);
  }

  public zip_with<U, F extends FnOnce<[T, U], R>, R>(
    other: Option<U>,
    f: F
  ): Option<R> {
    if (other.is_none()) {
      return None;
    }

    return SomeImpl.new(f(this.value, other.value));
  }

  // public unzip<Z, U>(): [Option<Z>, Option<U>] {
  //   return [SomeImpl.new(this.value[0]), SomeImpl.new(this.value[1])];
  // }

  // public copied<U>(): Option<U> {
  //   return SomeImpl.new(this.value.deref());
  // }

  // public copied_mut<U>(): Option<U> {
  //   return SomeImpl.new(this.value.deref_mut());
  // }

  // public transpose<P, E>(): Result<Option<P>, E> {
  //   if ('is_ok' in (this.value as Result<P, E>))
  //     if ((this.value as Result<P, E>).is_ok()) {
  //       // @ts-expect-error wtf is this error
  //       return Ok(Some(this.value.value));
  //     }

  //   return this.value as never;
  // }

  // public flatten(): T extends Option<infer U> ? Option<U> : never {
  //   return this.value as never;
  // }

  // partialeq

  public eq(other: Option<T>): boolean {
    if (other.is_none()) {
      return false;
    }

    if (has_derivable_partial_eq<T>(this.value)) {
      return this.value.eq(other.value);
    }

    panic(
      'Option<T> is not an impl of PartialEq because bound `T: PartialEq` is not satisfied'
    );
  }

  public ne(other: Option<T>): boolean {
    return default_partial_eq<Option<T>>(this).ne(other);
  }

  // partialord

  public partial_cmp(other: Option<T>): Ordering {
    if (other.is_none()) {
      return Ordering.Greater;
    }

    if (has_derivable_partial_ord<T>(this.value)) {
      return this.value.partial_cmp(other.value);
    }

    panic(
      'Option<T> is not an impl of PartialOrd because bound `T: PartialOrd` is not satisified'
    );
  }

  public ge(other: Option<T>): boolean {
    return default_partial_ord<Option<T>>(this).ge(other);
  }

  public gt(other: Option<T>): boolean {
    return default_partial_ord<Option<T>>(this).gt(other);
  }

  public le(other: Option<T>): boolean {
    return default_partial_ord<Option<T>>(this).le(other);
  }

  public lt(other: Option<T>): boolean {
    return default_partial_ord<Option<T>>(this).lt(other);
  }
}

class NoneImpl<T>
implements
    AsRef<T>,
    AsMutRef<T>,
    Clone<Option<T>>,
    PartialEq<Option<T>>,
    PartialOrd<Option<T>>,
    LogicalOr<Option<T>>,
    LogicalAnd<Option<T>>,
    LogicalXor<Option<T>>,
    Debug
{
  public value: T = undefined as never;
  public static new<T>(): NoneImpl<T> {
    return new this();
  }

  public fmt_debug(this: T extends Debug ? NoneImpl<T> : never): string {
    return 'None';
  }

  public some(): boolean {
    return this.is_some();
  }

  public none(): boolean {
    return this.is_none();
  }

  public clone(): Option<T> {
    return None;
  }

  public is_some(): this is SomeImpl<T> {
    return false;
  }

  public is_some_and(f: FnOnce<[T], boolean>): false {
    void f;
    return false;
  }

  public is_none(): this is NoneImpl<T> {
    return true;
  }

  public as_ref(): Ref<this, T> {
    return Ref.new(this, this.value);
  }

  public as_mut_ref(): RefMut<this, T> {
    return RefMut.new(this, this.value);
  }

  public expect(message: string): never {
    panic(message);
  }

  public unwrap(): never {
    this.expect('called unwrap() on None');
  }

  public unwrap_or(def: T): T {
    return def;
  }

  public unwrap_or_else<F extends FnOnce<[], T>>(f: F): T {
    return f();
  }

  public unwrap_or_default(): T {
    panic('unwrap_or_default not implemented');
  }

  public unwrap_unchecked(): T {
    return this.value as T;
  }

  public map<U, F extends FnOnce<[T], U>>(f: F): Option<U> {
    void f;
    return NoneImpl.new<U>();
  }

  public inspect<F extends FnOnce<[T]>>(f: F): void {
    void f;
  }

  public map_or<U, F extends FnOnce<[T], U>>(def: U, f: F): U {
    void f;
    return def;
  }

  public map_or_else<U, D extends FnOnce<[], U>, F extends FnOnce<[T], U>>(
    def: D,
    f: F
  ): U {
    void f;
    return def();
  }

  // ok_or, ok_or_else

  // public as_deref<U>(): Option<Readonly<U>> {
  //   return NoneImpl.new<Readonly<U>>();
  // }

  // public as_deref_mut<U>(): Option<U> {
  //   return NoneImpl.new<U>();
  // }

  // iter, iter_mut

  public and<U>(optb: Option<U>): Option<U> {
    void optb;
    return None;
  }

  public and_then<U, F extends FnOnce<[T], Option<U>>>(f: F): Option<U> {
    void f;
    return None;
  }

  public filter<P extends FnOnce<[T]>>(predicate: P): NoneImpl<T> {
    void predicate;
    return this;
  }

  public or(optb: Option<T>): Option<T> {
    return optb;
  }

  public or_else<F extends FnOnce<[], Option<T>>>(f: F): Option<T> {
    return f() as Option<T>;
  }

  public xor(optb: Option<T>): Option<T> {
    if (optb.is_none()) {
      return this;
    }

    return optb;
  }

  public insert(value: T): RefMut<this, T> {
    Object.assign(this, Some(value));
    return RefMut.new(this, value);
  }

  public get_or_insert(value: T): RefMut<this, T> {
    return this.insert(value);
  }

  public get_or_insert_default(): RefMut<T> {
    panic('get_or_insert_default not implemented for None');
  }

  public get_or_insert_with<F extends FnOnce<[], T>>(f: F): RefMut<this, T> {
    return this.insert(f());
  }

  public take(): this {
    return this;
  }

  public replace(value: T): Option<T> {
    Object.assign(this, Some(value));
    return this;
  }

  public contains<U extends T>(x: U): false {
    void x;
    return false;
  }

  public zip<U>(other: Option<U>): Option<[T, U]> {
    void other;
    return None;
  }

  public zip_with<U, F extends FnOnce<[T, U], R>, R>(
    other: Option<U>,
    f: F
  ): Option<R> {
    void other;
    void f;
    return None;
  }

  // public unzip<Z, U>(): [None<Z>, None<U>] {
  //   return [None, None];
  // }

  // public copied<U>(): Option<U> {
  //   return None;
  // }

  // public copied_mut<U>(): Option<U> {
  //   return None;
  // }

  // public transpose<P, E>(): Result<Option<P>, E> {
  //   return Ok(None);
  // }

  // public flatten(): T extends Option<infer U> ? Option<U> : never {
  //   return None as never;
  // }

  // partialeq

  public eq(other: Option<T>): boolean {
    return other.is_none();

    // panic(
    // 'Option<T> is not an impl of PartialEq because bound `T: PartialEq` is not satisfied'
    // );
  }

  public ne(other: Option<T>): boolean {
    return default_partial_eq<Option<T>>(this).ne(other);
  }

  // partialord

  public partial_cmp(other: Option<T>): Ordering {
    if (other.is_none()) {
      return Ordering.Equal;
    }

    return Ordering.Less;
  }

  public ge(other: Option<T>): boolean {
    return default_partial_ord<Option<T>>(this).ge(other);
  }

  public gt(other: Option<T>): boolean {
    return default_partial_ord<Option<T>>(this).gt(other);
  }

  public le(other: Option<T>): boolean {
    return default_partial_ord<Option<T>>(this).le(other);
  }

  public lt(other: Option<T>): boolean {
    return default_partial_ord<Option<T>>(this).lt(other);
  }
}

export type Option<T> = None<T> | Some<T>;
export const Option = {
  is_some<T>(value: Option<T>): boolean {
    return value.is_some();
  },
  is_none<T>(value: Option<T>): boolean {
    return value.is_none();
  },
  some<T>(T: T): SomeImpl<T> {
    return Some(T);
  },
  none<T>(T?: T): NoneImpl<T> {
    void T;
    return None;
  },
};

export const Some = staticify(SomeImpl);
export type Some<T> = SomeImpl<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type None<T = _> = NoneImpl<T>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const None: None<_> = new NoneImpl<_>();
