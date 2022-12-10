import { staticify } from '../../tools';
import type { Clone } from './clone';
import type { PartialEq, PartialOrd } from './cmp';
import {
  default_partial_eq,
  default_partial_ord,
  has_derivable_partial_eq,
  has_derivable_partial_ord,
  Ordering
} from './cmp';
import type { AsMutRef, AsRef } from './convert';
import { Ref, RefMut } from './convert';
import type { LogicalAnd, LogicalOr, LogicalXor, _ } from './custom';
import type { Default } from './default';
import type { Deref, DerefMut, FnOnce } from './ops';

import { panic } from './panic';
import type { Result } from './result';
import { Ok } from './result';

class SomeImpl<T>
implements
    AsRef<T>,
    AsMutRef<T>,
    Clone<Option<T>>,
    PartialEq<Option<T>>,
    PartialOrd<Option<T>>,
    LogicalOr<Option<T>>,
    LogicalAnd<Option<T>>,
    LogicalXor<Option<T>>
{
  constructor(public value: T) {}

  public static new<T>(value: T): SomeImpl<T> {
    return new this(value);
  }

  public clone(this: Option<T>): Option<T> {
    return SomeImpl.new(this.value);
  }

  public is_some(): this is SomeImpl<T> {
    return true;
  }

  public is_some_and(f: FnOnce<[T], boolean>): boolean {
    return f.call_once(this.value);
  }

  public is_none(): false {
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

  public unwrap_or_default(
    this: T extends Default<unknown> ? SomeImpl<T> : never
  ): T {
    return this.value;
  }

  public unwrap_unchecked(): T {
    return this.value;
  }

  public map<U, F extends FnOnce<[T], U>>(f: F): SomeImpl<U> {
    return SomeImpl.new(f.call_once(this.value));
  }

  public inspect<F extends FnOnce<[T]>>(f: F): this {
    f.call_once(this.value);
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

  public as_deref(
    this: T extends Deref<T> ? SomeImpl<T> : never
  ): SomeImpl<Ref<this, T>> {
    return SomeImpl.new(Ref.new<this, T>(this as never, this.value.deref()));
  }

  public as_deref_mut(
    this: T extends DerefMut<T> ? SomeImpl<T> : never
  ): SomeImpl<RefMut<this, T>> {
    return SomeImpl.new(
      RefMut.new<this, T>(this as never, this.value.deref_mut())
    );
  }

  // iter, iter_mut

  public and<U>(optb: Option<U>): Option<U> {
    return optb;
  }

  public and_then<U, F extends FnOnce<[T], Option<U>>>(f: F): Option<U> {
    return f.call_once(this.value) as never;
  }

  public filter<P extends FnOnce<[T], boolean>>(predicate: P): Option<T> {
    if (!predicate.call_once(this.value)) {
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

  public get_or_insert_default(
    this: T extends Default<unknown> ? SomeImpl<T> : never
  ): RefMut<this, T> {
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

  public contains<U extends PartialEq<T>>(x: Ref<unknown, U>): boolean {
    return x.deref().eq(this.value);
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

    return SomeImpl.new(f.call_once(this.value, other.value));
  }

  public unzip<Z, U>(
    this: T extends [Z, U] ? SomeImpl<[Z, U]> : never
  ): [SomeImpl<Z>, SomeImpl<U>] {
    return [SomeImpl.new(this.value[0]), SomeImpl.new(this.value[1])];
  }

  public copied<U>(
    this: T extends Ref<infer Self, U> ? SomeImpl<Ref<Self, U>> : never
  ): SomeImpl<U> {
    return SomeImpl.new(this.value.deref());
  }

  public copied_mut<U>(
    this: T extends RefMut<infer Self, U> ? SomeImpl<RefMut<Self, U>> : never
  ): SomeImpl<U> {
    return SomeImpl.new(this.value.deref_mut());
  }

  public transpose<P, E>(
    this: T extends Result<P, E> ? Option<Result<P, E>> : never
  ): Result<Option<P>, E> {
    if (this.value.is_ok()) {
      // @ts-expect-error wtf is this error
      return Ok(Some(this.value.value));
    }

    return this.value;
  }

  public flatten(): T extends Option<infer U> ? Option<U> : never {
    return this.value as never;
  }

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
    LogicalXor<Option<T>>
{
  public value: T = undefined as never;
  public static new<T>(): NoneImpl<T> {
    return new this();
  }

  public clone(this: NoneImpl<T>): Option<T> {
    return None;
  }

  public is_some(): false {
    return false;
  }

  public is_some_and(f: FnOnce<[Ref<unknown, T>], boolean>): false {
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
    return f.call_once();
  }

  public unwrap_or_default(
    this: T extends Default<T> ? NoneImpl<T> : never
  ): T {
    panic('unwrap_or_default not implemented');
  }

  public unwrap_unchecked(): T {
    return this.value as T;
  }

  public map<U, F extends FnOnce<[T], U>>(f: F): Option<U> {
    void f;
    return NoneImpl.new<U>();
  }

  public inspect<F extends FnOnce<[Ref<unknown, T>]>>(f: F): void {
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
    return def.call_once();
  }

  // ok_or, ok_or_else

  public as_deref<U>(
    this: T extends Deref<U> ? NoneImpl<T> : never
  ): NoneImpl<Readonly<U>> {
    return NoneImpl.new<Readonly<U>>();
  }

  public as_deref_mut<U>(
    this: T extends DerefMut<U> ? NoneImpl<T> : never
  ): NoneImpl<U> {
    return NoneImpl.new<U>();
  }

  // iter, iter_mut

  public and<U>(optb: Option<U>): Option<U> {
    void optb;
    return None;
  }

  public and_then<U, F extends FnOnce<[T], Option<U>>>(f: F): Option<U> {
    void f;
    return None;
  }

  public filter<P extends FnOnce<[Ref<T>]>>(predicate: P): NoneImpl<T> {
    void predicate;
    return this;
  }

  public or(optb: Option<T>): Option<T> {
    return optb;
  }

  public or_else<F extends FnOnce<[], Option<T>>>(f: F): Option<T> {
    return f.call_once() as Option<T>;
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
    return this.insert(f.call_once());
  }

  public take(): this {
    return this;
  }

  public replace(value: T): Option<T> {
    Object.assign(this, Some(value));
    return this;
  }

  public contains<U extends PartialEq<T>>(x: Ref<unknown, U>): false {
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

  public unzip<Z, U>(
    this: T extends [Z, U] ? None<[Z, U]> : never
  ): [None<Z>, None<U>] {
    return [None, None];
  }

  public copied<U>(
    this: T extends Ref<infer Self, U> ? SomeImpl<Ref<Self, U>> : never
  ): None<U> {
    return None;
  }

  public copied_mut<U>(
    this: T extends RefMut<infer Self, U> ? SomeImpl<RefMut<Self, U>> : never
  ): None<U> {
    return None;
  }

  public transpose<P, E>(
    this: T extends Result<P, E> ? Option<Result<P, E>> : never
  ): Result<Option<P>, E> {
    // @ts-expect-error wtf
    return Ok(None);
  }

  public flatten(): T extends Option<infer U> ? Option<U> : never {
    return None as never;
  }

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

export const Some = staticify(SomeImpl);
export type Some<T> = SomeImpl<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type None<T = _> = NoneImpl<T>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const None = new NoneImpl<_>();
