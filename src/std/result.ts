import { staticify } from '../tools';
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
import type { _ } from './custom';
import type { Fn, FnOnce } from './ops';
import type { Option } from './option';
import { None, Some } from './option';
import { panic } from './panic';

interface ResultImpl<T, E>
  extends AsMutRef<E | T>,
    AsRef<E | T>,
    PartialEq<Result<T, E>>,
    PartialOrd<Result<T, E>> {
  /** Returns true if the result is Ok. */
  is_ok(): boolean;
  /** Returns true if the result is Err. */
  is_err(): boolean;

  /** Returns true if the result is Ok and the value inside of it matches a predicate. */
  is_ok_and(f: FnOnce<[T], boolean>): boolean;
  /** Returns true if the result is Err and the value inside of it matches a predicate. */
  is_err_and(f: FnOnce<[E], boolean>): boolean;

  /** Converts from Result<T, E> to Option<T>. */
  ok(): Option<T>;
  /** Converts from Result<T, E> to Option<E>. */
  err(): Option<E>;

  /** Maps a Result<T, E> to Result<U, E> by applying a function to a contained Ok value, leaving an Err value untouched. */
  map<U>(f: FnOnce<[T], U>): Result<U, E>;
  /** Returns the provided default (if Err), or applies a function to the contained value (if Ok) */
  map_or<U>(other: U, f: FnOnce<[T], U>): U;
  /** Maps a Result<T, E> to U by applying fallback function default to a contained Err value, or function f to a contained Ok value. */
  map_or_else<U>(other: FnOnce<[E], U>, f: FnOnce<[T], U>): U;
  /** Maps a Result<T, E> to Result<T, F> by applying a function to a contained Err value, leaving an Ok value untouched. */
  map_err<F>(o: FnOnce<[E], F>): Result<T, F>;

  /** Calls the provided closure with a reference to the contained value (if Ok). */
  inspect(f: Fn<[T]>): Result<T, E>;
  /** Calls the provided closure with a reference to the contained error (if Err). */
  inspect_err(f: Fn<[E]>): Result<T, E>;

  /** Returns the contained Ok value, consuming the self value.
   * @panic If the value is an Err, with a panic message including the passed message, and the content of the Err.
   */
  expect(message: string): T;

  /** Returns the contained Ok value, consuming the self value.
   * @panic If the value is an Err, with a panic message including the passed message, and the content of the Err.
   */
  unwrap(): T;

  /** Returns the contained Err value, consuming the self value.
   * @panic If the value is an Ok, with a panic message including the passed message, and the content of the Ok.
   */
  expect_err(message: string): E;

  /** Returns the contained Err value, consuming the self value.
   * @panic If the value is an Ok, with a panic message including the passed message, and the content of the Ok.
   */
  unwrap_err(): E;

  /** Returns the contained Ok value, but never panics. */
  into_ok(): T;

  /** Returns the contained Err value, but never panics. */
  into_err(): E;

  /** Returns res if the result is Ok, otherwise returns the Err value of self. */
  and<U>(other: Result<U, E>): Result<U, E>;

  /** Calls op if the result is Ok, otherwise returns the Err value of self. */
  and_then<U>(f: FnOnce<[T], Result<U, E>>): Result<U, E>;

  /** Returns res if the result is Err, otherwise returns the Ok value of self. */
  or<F>(other: Result<T, F>): Result<T, F>;

  /** Calls op if the result is Err, otherwise returns the Ok value of self. */
  or_else<F>(f: FnOnce<[E], Result<T, F>>): Result<T, F>;

  /** Returns the contained Ok value or a provided default. */
  unwrap_or(other: T): T;

  /** Returns the contained Ok value or computes it from a closure. */
  unwrap_or_else(f: FnOnce<[E], T>): T;

  /** Returns the contained Ok value, consuming the self value, without checking that the value is not an Err.
   * @unsafe
   */
  unwrap_unchecked(): T;

  /** Returns the contained Err value, consuming the self value, without checking that the value is not an Ok.
   * @unsafe
   */
  unwrap_err_unchecked(): E;

  /** Returns true if the result is an Ok value containing the given value. */
  contains(value: T): boolean;

  /** Returns true if the result is an Err value containing the given value. */
  contains_err(error: E): boolean;
}

class OkImpl<T = void> implements ResultImpl<T, unknown> {
  constructor(private value: T = undefined as T) {}

  public as_ref(): Ref<this, unknown> {
    return Ref(this, this.value);
  }

  public as_mut_ref(): RefMut<this, unknown> {
    return RefMut(this, this.value);
  }

  public is_ok(): this is OkImpl<T> {
    return true;
  }

  public is_ok_and(f: FnOnce<[T], boolean>): boolean {
    return f(this.unwrap());
  }

  public is_err(): false {
    return false;
  }

  public is_err_and(f: FnOnce<[unknown], boolean>): false {
    void f;
    return false;
  }

  public ok(): Option<T> {
    return Some(this.unwrap());
  }

  public err(): None {
    return None;
  }

  public map<U>(f: FnOnce<[T], U>): OkImpl<U> {
    return Ok(f(this.unwrap()));
  }

  public map_or<U>(other: U, f: FnOnce<[T], U>): U {
    void other;
    return f(this.unwrap());
  }

  public map_or_else<U>(other: FnOnce<[unknown], U>, f: FnOnce<[T], U>): U {
    void other;
    return f(this.unwrap());
  }

  public map_err<F>(f: FnOnce<[unknown], F>): this {
    void f;
    return this;
  }

  public inspect(f: FnOnce<[T]>): this {
    f(this.unwrap());
    return this;
  }

  public inspect_err(f: FnOnce<[unknown]>): this {
    void f;
    return this;
  }

  public expect(message: string): T {
    void message;
    return this.unwrap();
  }

  public unwrap(): T {
    return this.value;
  }

  public expect_err(message: string): never {
    throw `${message}: ${this.unwrap()}`;
  }

  public unwrap_err(): never {
    return this.expect_err('Called unwrap_err() on Ok');
  }

  public into_ok(): T {
    return this.unwrap();
  }

  public into_err(): never {
    return undefined as never;
  }

  public and<U, E>(other: Result<U, E>): Result<U, E> {
    return other;
  }

  public and_then<U, E>(f: FnOnce<[T], Result<U, E>>): Result<U, E> {
    return f(this.unwrap());
  }

  public or<F>(other: Result<T, F>): Result<T, F> {
    void other;
    return this;
  }

  public or_else<F>(f: FnOnce<[unknown], Result<T, F>>): Result<T, F> {
    void f;
    return this;
  }

  public unwrap_or(other: T): T {
    void other;
    return this.unwrap();
  }

  public unwrap_or_else(f: FnOnce<[unknown], T>): T {
    void f;
    return this.unwrap();
  }

  public unwrap_unchecked(): T {
    return this.unwrap();
  }

  public unwrap_err_unchecked(): never {
    return undefined as never;
  }

  public contains(value: T): boolean {
    return this.unwrap() === value;
  }

  public contains_err(error: unknown): boolean {
    void error;
    return false;
  }

  public static new<T = void>(value: T = undefined as T): OkImpl<T> {
    return new this(value);
  }

  public eq(other: Result<T, unknown>): boolean {
    if (other.is_err()) {
      return false;
    }

    if (has_derivable_partial_eq<T>(this.value)) {
      return this.value.eq(other.unwrap());
    }

    panic(
      'Ok(T) is not an impl of PartialEq because bound `T: PartialEq` is not satisfied'
    );
  }

  public ne(other: Result<T, unknown>): boolean {
    return default_partial_eq<Result<T, unknown>>(this).ne(other);
  }

  public partial_cmp(other: Result<T, unknown>): Ordering {
    if (other.is_err()) {
      return Ordering.Greater;
    }

    if (has_derivable_partial_ord<T>(this.value)) {
      return this.value.partial_cmp(other.unwrap());
    }

    panic(
      'Ok(T) is not an impl of PartialOrd because bound `T: PartialOrd` is not satisified'
    );
  }

  public ge(other: Result<T, unknown>): boolean {
    return default_partial_ord<Result<T, unknown>>(this).ge(other);
  }

  public gt(other: Result<T, unknown>): boolean {
    return default_partial_ord<Result<T, unknown>>(this).gt(other);
  }

  public le(other: Result<T, unknown>): boolean {
    return default_partial_ord<Result<T, unknown>>(this).le(other);
  }

  public lt(other: Result<T, unknown>): boolean {
    return default_partial_ord<Result<T, unknown>>(this).lt(other);
  }
}

class ErrImpl<E = void> implements ResultImpl<unknown, E> {
  constructor(private value: E = undefined as E) {}

  public as_ref(): Ref<this, unknown> {
    return Ref(this, this.value);
  }

  public as_mut_ref(): RefMut<this, unknown> {
    return RefMut(this, this.value);
  }

  public is_ok(): false {
    return false;
  }

  public is_ok_and(f: FnOnce<[unknown], boolean>): false {
    void f;
    return false;
  }

  public is_err(): true {
    return true;
  }

  public is_err_and(f: FnOnce<[E], boolean>): boolean {
    return f(this.unwrap_err());
  }

  public ok(): Option<unknown> {
    return None;
  }

  public err(): Option<E> {
    return Some(this.unwrap_err());
  }

  public map<U>(f: FnOnce<[unknown], U>): this {
    void f;
    return this;
  }

  public map_or<U>(other: U, f: FnOnce<[unknown], U>): U {
    void f;
    return other;
  }

  public map_or_else<U>(other: FnOnce<[E], U>, f: FnOnce<[unknown], U>): U {
    void f;
    return other(this.unwrap_err());
  }

  public map_err<F>(f: FnOnce<[E], F>): ErrImpl<F> {
    return Err(f(this.unwrap_err()));
  }

  public inspect(f: FnOnce<[unknown]>): this {
    void f;
    return this;
  }

  public inspect_err(f: FnOnce<[E]>): this {
    f(this.unwrap_err());
    return this;
  }

  public expect(message: string): never {
    throw `${message}: ${this.unwrap_err()}`;
  }

  public unwrap(): never {
    return this.expect('Called unwrap() on Err');
  }

  public expect_err(message: string): E {
    void message;
    return this.unwrap_err();
  }

  public unwrap_err(): E {
    return this.value;
  }

  public into_ok(): never {
    return undefined as never;
  }

  public into_err(): E {
    return this.unwrap_err();
  }

  public and<U>(other: Result<U, E>): this {
    void other;
    return this;
  }

  public and_then<U>(f: FnOnce<[unknown], Result<U, E>>): this {
    void f;
    return this;
  }

  public or<T, F>(other: Result<T, F>): Result<T, F> {
    return other;
  }

  public or_else<T, F>(f: FnOnce<[E], Result<T, F>>): Result<T, F> {
    return f(this.unwrap_err());
  }

  public unwrap_or<T>(other: T): T {
    return other;
  }

  public unwrap_or_else<T>(f: FnOnce<[E], T>): T {
    return f(this.unwrap_err());
  }

  public unwrap_unchecked(): never {
    return undefined as never;
  }

  public unwrap_err_unchecked(): E {
    return this.unwrap_err();
  }

  public contains(value: never): false {
    void value;
    return false;
  }

  public contains_err(error: E): boolean {
    return this.unwrap_err() === error;
  }

  public static new<E = void>(value: E = undefined as E): ErrImpl<E> {
    return new this(value);
  }

  public eq(other: Result<unknown, E>): boolean {
    if (other.is_ok()) {
      return false;
    }

    if (has_derivable_partial_eq<E>(this.value)) {
      return this.value.eq(other.unwrap_err());
    }

    panic(
      'Err(E) is not an impl of PartialEq because bound `E: PartialEq` is not satisfied'
    );
  }

  public ne(other: Result<unknown, E>): boolean {
    return default_partial_eq<Result<unknown, E>>(this).ne(other);
  }

  public partial_cmp(other: Result<unknown, E>): Ordering {
    if (other.is_err()) {
      return Ordering.Greater;
    }

    if (has_derivable_partial_ord<E>(this.value)) {
      return this.value.partial_cmp(other.unwrap_err());
    }

    panic(
      'Ok(T) is not an impl of PartialOrd because bound `T: PartialOrd` is not satisified'
    );
  }

  public ge(other: Result<unknown, E>): boolean {
    return default_partial_ord<Result<unknown, E>>(this).ge(other);
  }

  public gt(other: Result<unknown, E>): boolean {
    return default_partial_ord<Result<unknown, E>>(this).gt(other);
  }

  public le(other: Result<unknown, E>): boolean {
    return default_partial_ord<Result<unknown, E>>(this).le(other);
  }

  public lt(other: Result<unknown, E>): boolean {
    return default_partial_ord<Result<unknown, E>>(this).lt(other);
  }
}

export type Result<T, E> = Err<E> | Ok<T>;

export type Ok<T> = OkImpl<T>;
export const Ok = staticify(OkImpl);

export type Err<E> = ErrImpl<E>;
export const Err = staticify(ErrImpl);

export function result_from<T, E>(f: () => T): Result<T, E> {
  try {
    return Ok(f());
  } catch (e) {
    return Err(e as _);
  }
}
