import { staticify } from '../../../tools';
import type { _ } from '../custom';
import type { Add, FnMut, Mul } from '../ops';
import type { Option } from '../option';
import { None, Some } from '../option';
import type { Result } from '../result';
import { Err, Ok } from '../result';
import { ArrayChunks } from './array_chunks';

import { Chain } from './chain';
import { Cycle } from './cycle';
import { Enumerate } from './enumerate';
import { Filter } from './filter';
import { FilterMap } from './filter_map';
import { Flatten } from './flatten';
import { FlatMap } from './flat_map';
import { Fuse } from './fuse';
import { Inspect } from './inspect';
import { Intersperse } from './intersperse';
import { IntersperseWith } from './intersperse_with';
import { Map } from './map';
import { MapWhile } from './map_while';
import { Peekable } from './peekable';
import { Scan } from './scan';
import { Skip } from './skip';
import { SkipWhile } from './skip_while';
import { StepBy } from './step_by';
import { Take } from './take';
import { TakeWhile } from './take_while';
import { Zip } from './zip';

export class IteratorImpl<T> implements Iterable<T> {
  constructor(iter: Iterable<T> = []) {
    this.dyn = iter[Symbol.iterator]();
  }

  *[Symbol.iterator](): Generator<T, void, unknown> {
    let p = this.next();
    while (p.is_some()) {
      yield p.unwrap();
      p = this.next();
    }
  }

  public static new<T>(iter: Iterable<T>): IteratorImpl<T> {
    return new this(iter);
  }

  private dyn: globalThis.Iterator<T, unknown, undefined>;
  private picker = 0;

  public next(): Option<T> {
    this.picker++;
    const { value, done } = this.dyn.next();

    if (done) {
      return None;
    }

    return Some(value as T);
  }

  public next_chunk<N extends number>(
    count: N
  ): Result<Array<T> & { length: N }, IteratorImpl<T>> {
    const chunk = [];
    for (let i = 0; i < count; i++) {
      const value = this.next();
      if (value.is_none()) {
        return Err(this as IteratorImpl<T>);
      }

      chunk.push(value.unwrap());
    }

    return Ok(chunk as never);
  }

  public size_hint(): [number, Option<number>] {
    return [this.picker, Some(this.count())];
  }

  public count(): number {
    let count = 0;
    while (this.next().is_some()) {
      count++;
    }

    return count;
  }

  public last(): Option<T> {
    let c: Option<T> = None;

    let p = this.next();
    while (p.is_some()) {
      c = p;
      p = this.next();
    }

    return c;
  }

  public advance_by(n: number): Result<void, number> {
    for (let i = 0; i < n; i++) {
      const v = this.next();

      if (v.is_none()) {
        return Err(i);
      }
    }

    return Ok<void>();
  }

  public nth(n: number): Option<T> {
    let c: Option<T> = None;
    for (let i = 0; i < n; i++) {
      c = this.next();
    }

    return c;
  }

  public step_by<N extends number>(step: N): StepBy<T, N> {
    return StepBy(step, this);
  }

  public chain<U>(iter: Iterable<U>): Chain<T, U> {
    return Chain(this, iter);
  }

  public zip<U>(iter: Iterable<U>): Zip<T, U> {
    return Zip(this, iter);
  }

  public intersperse(separator: T): Intersperse<T> {
    return Intersperse(this, separator);
  }

  public intersperse_with<G extends FnMut<[], T>>(
    separator: G
  ): IntersperseWith<T, G> {
    return IntersperseWith(this, separator);
  }

  public map<B>(f: FnMut<[T], B>): Map<T, B> {
    return Map(this, f);
  }

  public for_each<F extends FnMut<[T]>>(f: F): this {
    for (const value of this) {
      f(value);
    }

    return this;
  }

  public filter<P extends FnMut<[T], boolean>>(f: P): Filter<T, P> {
    return Filter(this, f);
  }

  public filter_map<B>(f: FnMut<[T], Option<B>>): FilterMap<T, B> {
    return FilterMap(this, f);
  }

  public enumerate(): Enumerate<T> {
    return Enumerate(this);
  }

  public peekable(): Peekable<T> {
    return Peekable(this);
  }

  public skip_while<P extends FnMut<[T], boolean>>(p: P): SkipWhile<T, P> {
    return SkipWhile(this, p);
  }

  public take_while<P extends FnMut<[T], boolean>>(p: P): TakeWhile<T, P> {
    return TakeWhile(this, p);
  }

  public map_while<B>(p: FnMut<[T], Option<B>>): MapWhile<T, B> {
    return MapWhile(this, p);
  }

  public skip<N extends number>(n: N): Skip<T, N> {
    return Skip(this, n);
  }

  public take<N extends number>(n: N): Take<T, N> {
    return Take(this, n);
  }

  public scan<St, B>(
    initial_state: St,
    f: FnMut<[St, T], [St, Option<B>]>
  ): Scan<T, St, B> {
    return Scan(this, initial_state, f);
  }

  public flat_map<U>(f: FnMut<[T], Iterable<U>>): FlatMap<T, U> {
    return FlatMap(this, f);
  }

  public flatten(): Flatten<T> {
    return Flatten(this);
  }

  public fuse(): Fuse<T> {
    return Fuse(this);
  }

  public inspect(f: FnMut<[T], void>): Inspect<T> {
    return Inspect(this, f);
  }

  // collect

  public collect_into<B extends FromIterator<T>>(into: B): B {
    return into.from_iter(this);
  }

  public fold<B>(init: B, f: FnMut<[B, T], B>): B {
    for (const value of this) {
      init = f(init, value);
    }
    return init;
  }

  public reduce(f: FnMut<[T, T], T>): Option<T> {
    const next = this.next();

    if (next.is_none()) {
      return None;
    }

    return Some(this.fold(next.unwrap(), f));
  }

  public all(f: FnMut<[T], boolean>): boolean {
    for (const value of this) {
      if (!f(value)) {
        return false;
      }
    }

    return true;
  }

  public any(f: FnMut<[T], boolean>): boolean {
    for (const value of this) {
      if (f(value)) {
        return true;
      }
    }

    return false;
  }

  public find(predicate: FnMut<[T], boolean>): Option<T> {
    for (const value of this) {
      if (predicate(value)) {
        return Some(value);
      }
    }

    return None;
  }

  public find_map<B>(f: FnMut<[T], Option<B>>): Option<B> {
    return this.filter_map(f).next();
  }

  public position(predicate: FnMut<[T], boolean>): Option<number> {
    let index = 0;
    for (const value of this) {
      if (predicate(value)) {
        return Some(index);
      }

      index++;
    }
    return None;
  }

  public cycle(): Cycle<T> {
    return Cycle(this);
  }

  public array_chunks<N extends number>(size: N): ArrayChunks<T, N> {
    return ArrayChunks(this, size);
  }

  public sum<U>(): T extends Add<U, T> ? Option<T> : None {
    return this.reduce((t, u) => {
      if ('add' in (t as Add<_, _>)) {
        return (t as Add<_, _>).add(u);
      }
    }) as never;
  }

  public product<U>(): T extends Mul<U, T> ? Option<T> : None {
    return this.reduce((t, u) => {
      if ('mul' in (t as Mul<_, _>)) {
        return (t as Mul<_, _>).mul(u);
      }
    }) as never;
  }
}

export type Iterator<T> = IteratorImpl<T>;
export const Iterator = staticify(IteratorImpl);

export interface FromIterator<T> {
  from_iter(iter: Iterable<T>): this;
}
