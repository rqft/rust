import type { FnConsume, FnMap, FnOnce } from './traits';
interface OptionImpl<T> {
  /** Returns `true` if the option is a `Some` value. */
  isSome(): boolean;
  /** @nightly Returns true if the option is a Some and the value inside of it matches a predicate. */
  isSomeAnd(p: FnMap<T, boolean>): boolean;
  /** Returns true if the option is a None value. */
  isNone(): boolean;

  /** Returns the contained `Some` value, consuming the self value.
   * @panic If the value is a `None` with a custom panic message provided by msg.
   */
  expect(message: string): T;

  /** Returns the contained Some value, consuming the self value.
   * @panic If the self value equals `None`.
   */
  unwrap(): T;
  /** Returns the contained `Some` value or a provided default. */
  unwrapOr(other: T): T;
  /** Returns the contained `Some` value or computes it from a closure. */
  unwrapOrElse(f: FnOnce<T>): T;
  /** Returns the contained `Some` value, consuming the self value, without checking that the value is not `None`. */
  unwrapUnchecked(): T;
  /** Returns the `Some` value mapping it */
  unwrapWith<U>(f: FnMap<T, U>): U;

  /** Maps an `Option<T>` to `Option<U>` by applying a function to a contained value. */
  map<U>(f: FnMap<T, U>): Option<U>;
  /** Returns the provided default result (if none), or applies a function to the contained value (if any). */
  mapOr<U>(other: U, f: FnMap<T, U>): U;
  /** Computes a default function result (if none), or applies a different function to the contained value (if any). */
  mapOrElse<U>(other: FnOnce<U>, f: FnMap<T, U>): U;

  // ok_or, ok_or_else, iter

  /** Returns `None` if the option is `None`, otherwise returns `other`. */
  and<U>(other: Option<U>): Option<U>;
  /** Returns `None` if the option is `None`, otherwise calls `f` with the wrapped value and returns the result. */
  andThen<U>(f: FnMap<T, Option<U>>): Option<U>;

  filter(p: FnMap<T, boolean>): Option<T>;

  /** Returns the option if it contains a value, otherwise returns optb. */
  or(other: Option<T>): Option<T>;
  /** Returns the option if it contains a value, otherwise calls f and returns the result. */
  orElse(f: FnOnce<Option<T>>): Option<T>;

  /** Returns Some if exactly one of self, optb is Some, otherwise returns None. */
  xor(other: Option<T>): Option<T>;

  /** Inserts value into the option, then returns a mutable reference to it. */
  insert(value: T): T;

  /** Inserts value into the option if it is None, then returns a mutable reference to the contained value. */
  getOrInsert(value: T): T;

  /** Inserts a value computed from `f` into the option if it is `None`, then returns a mutable reference to the contained value. */
  getOrInsertWith(f: FnOnce<T>): T;

  // /** Takes the value out of the option, leaving a None in its place. */
  // take(): this;

  /** Replaces the actual value in the option by the value given in parameter, returning the old value if present, leaving a Some in its place without deinitializing either one. */
  replace(value: T): Option<T>;

  /** Returns true if the option is a Some value containing the given value. */
  contains(value: T): boolean;

  /** Zips `self` with another `Option`. */
  zip<U>(other: Option<U>): Option<[T, U]>;

  /** Zips self and another Option with function f. */
  zipWith<U, R>(other: Option<U>, f: (T: T, U: U) => R): Option<R>;

  inspect(f: FnConsume<T>): this;
}

class SomeImpl<T> implements OptionImpl<T> {
  constructor(private value: T) {}

  public isSome(): true {
    return true;
  }

  public isSomeAnd(p: FnMap<T, boolean>): boolean {
    return p(this.unwrap());
  }

  public isNone(): false {
    return false;
  }

  public expect(message: string): T {
    void message;
    return this.unwrap();
  }

  public unwrap(): T {
    return this.value;
  }

  public unwrapOr(other: T): T {
    void other;
    return this.unwrap();
  }

  public unwrapOrElse(f: FnOnce<T>): T {
    void f;
    return this.unwrap();
  }

  public unwrapUnchecked(): T {
    return this.value;
  }

  public unwrapWith<U>(f: FnMap<T, U>): U {
    return this.map(f).unwrap();
  }

  public map<U>(f: FnMap<T, U>): SomeImpl<U> {
    return new SomeImpl(f(this.unwrap()));
  }

  public mapOr<U>(other: U, f: FnMap<T, U>): U {
    void other;
    return f(this.unwrap());
  }

  public mapOrElse<U>(d: FnOnce<U>, f: FnMap<T, U>): U {
    void d;
    return f(this.unwrap());
  }

  public and<U>(other: Option<U>): Option<U> {
    // dont need to check, self will always be true
    return other;
  }

  public andThen<U>(f: FnMap<T, Option<U>>): Option<U> {
    return f(this.unwrap());
  }

  public filter(p: FnMap<T, boolean>): Option<T> {
    const value = p(this.unwrap());

    if (value) {
      return this;
    }
    return None;
  }

  public or(other: Option<T>): this {
    void other;
    return this;
  }

  public orElse(other: FnOnce<Option<T>>): this {
    void other;
    return this;
  }

  public xor(other: Option<T>): NoneImpl | this {
    if (other.isNone()) {
      return this;
    }

    return None;
  }

  public insert(value: T): T {
    const temp = this.unwrap();
    this.value = value;
    return temp;
  }

  public getOrInsert(value: T): T {
    void value;
    return this.unwrap();
  }

  public getOrInsertWith(f: FnOnce<T>): T {
    void f;
    return this.unwrap();
  }

  public replace(value: T): SomeImpl<T> {
    const temp = this.unwrap();
    this.value = value;
    return Some(temp);
  }

  public contains(value: T): boolean {
    return this.unwrap() === value;
  }

  public zip<U>(other: Option<U>): Option<[T, U]> {
    if (other.isNone()) {
      return None;
    }
    return Some([this.unwrap(), other.unwrap()] as [T, U]);
  }

  public zipWith<U, R>(other: Option<U>, f: (T: T, U: U) => R): Option<R> {
    if (other.isNone()) {
      return None;
    }

    return Some(f(this.unwrap(), other.unwrap()));
  }

  public inspect(f: FnConsume<T>): this {
    f(this.unwrap());
    return this;
  }
}

class NoneImpl implements OptionImpl<never> {
  constructor() {
    void 0;
  }

  public isSome(): false {
    return false;
  }

  public isSomeAnd(p: FnMap<never, boolean>): false {
    void p;
    return false;
  }

  public isNone(): true {
    return true;
  }

  public expect(message: string): never {
    throw message;
  }

  public unwrap(): never {
    throw 'called `unwrap()` on `None`';
  }

  public unwrapOr<T>(other: T): T {
    return other;
  }

  public unwrapOrElse<T>(f: FnOnce<T>): T {
    return f();
  }

  public unwrapUnchecked(): never {
    return undefined as never;
  }

  public unwrapWith<U>(f: FnMap<never, U>): never {
    return this.map(f).unwrap();
  }

  public map<U>(f: FnMap<never, U>): NoneImpl {
    void f;
    return None;
  }

  public mapOr<U>(other: U, f: FnMap<never, U>): U {
    void f;
    return other;
  }

  public mapOrElse<U>(other: FnOnce<U>, f: FnMap<never, U>): U {
    void f;
    return other();
  }

  public and<U>(other: Option<U>): this {
    void other;
    return this;
  }

  public andThen<U>(f: FnMap<never, Option<U>>): this {
    void f;
    return this;
  }

  public filter(p: FnMap<never, boolean>): this {
    void p;
    return this;
  }

  public or<T>(other: Option<T>): Option<T> {
    return other;
  }

  public orElse<T>(f: FnOnce<Option<T>>): Option<T> {
    return f();
  }

  public xor<T>(other: Option<T>): Option<T> {
    if (other.isNone()) {
      return None;
    }

    return other;
  }

  public insert<T>(value: T): T {
    Object.assign(this, {}, Some(value));
    return value;
  }

  public getOrInsert<T>(value: T): T {
    return this.insert(value);
  }

  public getOrInsertWith<T>(f: FnOnce<T>): T {
    return this.insert(f());
  }

  public replace<T>(value: T): T {
    return this.insert(value);
  }

  public contains<T>(value: T): false {
    void value;
    return false;
  }

  public zip<T>(other: Option<T>): this {
    void other;
    return this;
  }

  public zipWith<T, R>(
    other: Option<T>,
    f: (self: never, other: T) => R
  ): this {
    void other;
    void f;
    return this;
  }

  public inspect(f: FnConsume<never>): this {
    void f;
    return this;
  }
}

export type Option<T> = NoneImpl | SomeImpl<T>;

export function Some<T>(value: T): SomeImpl<T> {
  return new SomeImpl(value);
}

export const None = new NoneImpl();
