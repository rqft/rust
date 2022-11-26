import { staticify } from '../tools';
import { format } from './macros';

import { None, Some, type Option } from './option';
import type { Copy, Debug, Display, FnConsume, FnMap } from './traits';
export interface ResultImpl<T, E> extends Debug, Display, Copy {
  /** Returns true if the result is Ok. */
  isOk(): boolean;
  /** Returns true if the result is Err. */
  isErr(): boolean;

  /** Returns true if the result is Ok and the value inside of it matches a predicate. */
  isOkAnd(f: FnMap<T, boolean>): boolean;
  /** Returns true if the result is Err and the value inside of it matches a predicate. */
  isErrAnd(f: FnMap<E, boolean>): boolean;

  /** Converts from Result<T, E> to Option<T>. */
  ok(): Option<T>;
  /** Converts from Result<T, E> to Option<E>. */
  err(): Option<E>;

  /** Maps a Result<T, E> to Result<U, E> by applying a function to a contained Ok value, leaving an Err value untouched. */
  map<U>(f: FnMap<T, U>): Result<U, E>;
  /** Returns the provided default (if Err), or applies a function to the contained value (if Ok) */
  mapOr<U>(other: U, f: FnMap<T, U>): U;
  /** Maps a Result<T, E> to U by applying fallback function default to a contained Err value, or function f to a contained Ok value. */
  mapOrElse<U>(other: FnMap<E, U>, f: FnMap<T, U>): U;
  /** Maps a Result<T, E> to Result<T, F> by applying a function to a contained Err value, leaving an Ok value untouched. */
  mapErr<F>(o: FnMap<E, F>): Result<T, F>;

  /** Calls the provided closure with a reference to the contained value (if Ok). */
  inspect(f: FnConsume<T>): Result<T, E>;
  /** Calls the provided closure with a reference to the contained error (if Err). */
  inspectErr(f: FnConsume<E>): Result<T, E>;

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
  expectErr(message: string): E;

  /** Returns the contained Err value, consuming the self value.
   * @panic If the value is an Ok, with a panic message including the passed message, and the content of the Ok.
   */
  unwrapErr(): E;

  /** Returns the contained Ok value, but never panics. */
  intoOk(): T;

  /** Returns the contained Err value, but never panics. */
  intoErr(): E;

  /** Returns res if the result is Ok, otherwise returns the Err value of self. */
  and<U>(other: Result<U, E>): Result<U, E>;

  /** Calls op if the result is Ok, otherwise returns the Err value of self. */
  andThen<U>(f: FnMap<T, Result<U, E>>): Result<U, E>;

  /** Returns res if the result is Err, otherwise returns the Ok value of self. */
  or<F>(other: Result<T, F>): Result<T, F>;

  /** Calls op if the result is Err, otherwise returns the Ok value of self. */
  orElse<F>(f: FnMap<E, Result<T, F>>): Result<T, F>;

  /** Returns the contained Ok value or a provided default. */
  unwrapOr(other: T): T;

  /** Returns the contained Ok value or computes it from a closure. */
  unwrapOrElse(f: FnMap<E, T>): T;

  /** Returns the contained Ok value, consuming the self value, without checking that the value is not an Err.
   * @unsafe
   */
  unwrapUnchecked(): T;

  /** Returns the contained Err value, consuming the self value, without checking that the value is not an Ok.
   * @unsafe
   */
  unwrapErrUnchecked(): E;

  /** Returns true if the result is an Ok value containing the given value. */
  contains(value: T): boolean;

  /** Returns true if the result is an Err value containing the given value. */
  containsErr(error: E): boolean;
}

export class OkImpl<T> implements ResultImpl<T, never> {
  constructor(private value: T) {}

  public clone(): OkImpl<T> {
    return OkImpl.new(this.value);
  }

  public fmtDebug(): string {
    return format('Ok({:?})', [this.value]);
  }

  public fmt(): string {
    return format('Ok({})', [this.value]);
  }

  public isOk(): true {
    return true;
  }

  public isOkAnd(f: FnMap<T, boolean>): boolean {
    return f(this.unwrap());
  }

  public isErr(): false {
    return false;
  }

  public isErrAnd(f: FnMap<never, boolean>): false {
    void f;
    return false;
  }

  public ok(): Option<T> {
    return Some(this.unwrap());
  }

  public err(): Option<never> {
    return None;
  }

  public map<U>(f: FnMap<T, U>): OkImpl<U> {
    return Ok(f(this.unwrap()));
  }

  public mapOr<U>(other: U, f: FnMap<T, U>): U {
    void other;
    return f(this.unwrap());
  }

  public mapOrElse<U>(other: FnMap<never, U>, f: FnMap<T, U>): U {
    void other;
    return f(this.unwrap());
  }

  public mapErr<F>(f: FnMap<never, F>): this {
    void f;
    return this;
  }

  public inspect(f: FnConsume<T>): this {
    f(this.unwrap());
    return this;
  }

  public inspectErr(f: FnConsume<never>): this {
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

  public expectErr(message: string): never {
    throw `${message}: ${this.unwrap()}`;
  }

  public unwrapErr(): never {
    return this.expectErr('Called unwrap_err() on Ok');
  }

  public intoOk(): T {
    return this.unwrap();
  }

  public intoErr(): never {
    return undefined as never;
  }

  public and<U, E>(other: Result<U, E>): Result<U, E> {
    return other;
  }

  public andThen<U, E>(f: FnMap<T, Result<U, E>>): Result<U, E> {
    return f(this.unwrap());
  }

  public or<F>(other: Result<T, F>): Result<T, never> {
    void other;
    return this;
  }

  public orElse<F>(f: FnMap<never, F>): Result<T, never> {
    void f;
    return this;
  }

  public unwrapOr(other: T): T {
    void other;
    return this.unwrap();
  }

  public unwrapOrElse(f: FnMap<never, T>): T {
    void f;
    return this.unwrap();
  }

  public unwrapUnchecked(): T {
    return this.unwrap();
  }

  public unwrapErrUnchecked(): never {
    return undefined as never;
  }

  public contains(value: T): boolean {
    return this.unwrap() === value;
  }

  public containsErr(error: never): boolean {
    void error;
    return false;
  }

  public static new<T>(value: T): OkImpl<T> {
    return new this(value);
  }
}

export class ErrImpl<E> implements ResultImpl<never, E> {
  constructor(private value: E) {}

  public clone(): ErrImpl<E> {
    return ErrImpl.new(this.value);
  }

  public fmtDebug(): string {
    return format('Ok({:?})', [this.value]);
  }

  public fmt(): string {
    return format('Ok({})', [this.value]);
  }

  public isOk(): false {
    return false;
  }

  public isOkAnd(f: FnMap<never, boolean>): false {
    void f;
    return false;
  }

  public isErr(): true {
    return true;
  }

  public isErrAnd(f: FnMap<E, boolean>): boolean {
    return f(this.unwrapErr());
  }

  public ok(): Option<never> {
    return None;
  }

  public err(): Option<E> {
    return Some(this.unwrapErr());
  }

  public map<U>(f: FnMap<never, U>): this {
    void f;
    return this;
  }

  public mapOr<U>(other: U, f: FnMap<never, U>): U {
    void f;
    return other;
  }

  public mapOrElse<U>(other: FnMap<E, U>, f: FnMap<never, U>): U {
    void f;
    return other(this.unwrapErr());
  }

  public mapErr<F>(f: FnMap<E, F>): ErrImpl<F> {
    return Err(f(this.unwrapErr()));
  }

  public inspect(f: FnConsume<never>): this {
    void f;
    return this;
  }

  public inspectErr(f: FnConsume<E>): this {
    f(this.unwrapErr());
    return this;
  }

  public expect(message: string): never {
    throw `${message}: ${this.unwrapErr()}`;
  }

  public unwrap(): never {
    return this.expect('Called unwrap() on Err');
  }

  public expectErr(message: string): E {
    void message;
    return this.unwrapErr();
  }

  public unwrapErr(): E {
    return this.value;
  }

  public intoOk(): never {
    return undefined as never;
  }

  public intoErr(): E {
    return this.unwrapErr();
  }

  public and<U>(other: Result<U, E>): this {
    void other;
    return this;
  }

  public andThen<U>(f: FnMap<never, Result<U, E>>): this {
    void f;
    return this;
  }

  public or<T, F>(other: Result<T, F>): Result<T, F> {
    return other;
  }

  public orElse<T, F>(f: FnMap<E, Result<T, F>>): Result<T, F> {
    return f(this.unwrapErr());
  }

  public unwrapOr<T>(other: T): T {
    return other;
  }

  public unwrapOrElse<T>(f: FnMap<E, T>): T {
    return f(this.unwrapErr());
  }

  public unwrapUnchecked(): never {
    return undefined as never;
  }

  public unwrapErrUnchecked(): E {
    return this.unwrapErr();
  }

  public contains(value: never): false {
    void value;
    return false;
  }

  public containsErr(error: E): boolean {
    return this.unwrapErr() === error;
  }

  public static new<E>(value: E): ErrImpl<E> {
    return new this(value);
  }
}

export type Result<T, E> = ErrImpl<E> | OkImpl<T>;



export const Ok = staticify(OkImpl);
export const Err = staticify(ErrImpl);
