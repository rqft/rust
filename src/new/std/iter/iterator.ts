import { staticify } from '../../../tools';
import { Ref, RefMut } from '../convert';
import type { _ } from '../custom';
import type { Add, FnMut, Mul } from '../ops';
import type { Option } from '../option';
import { None, Some } from '../option';
import { panic } from '../panic';
import type { Result } from '../result';
import { Err, Ok } from '../result';

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

// @ts-expect-error ts(2714)
class ArrayChunksImpl<T, N extends number> extends IteratorImpl<
  IteratorImpl<T>
> {
  constructor(iter: Iterable<T>, size: N) {
    if (size <= 0) {
      panic('ArrayChunks<T, N> failed due to unmet bound: N > 0');
    }

    super(
      (function* (): Generator<Iterator<T>, void, unknown> {
        let o: Array<T> = [];
        for (const value of iter) {
          if (o.length > size) {
            yield Iterator(o);
            o = [];
          }

          o.push(value);
        }

        // remainder
        yield Iterator(o);
      })()
    );
  }

  public static override new<T, N extends number>(
    iter: Iterable<T>,
    size: N
  ): ArrayChunksImpl<T, N> {
    return new this(iter, size);
  }
}

export type ArrayChunks<T, N extends number> = ArrayChunksImpl<T, N>;
export const ArrayChunks = staticify(ArrayChunksImpl);

// @ts-expect-error ts(2417)
class ChainImpl<T, U> extends IteratorImpl<T | U> {
  constructor(start: Iterable<T>, end: Iterable<U>) {
    super(
      (function* (): Generator<T | U, void> {
        for (const p of start) {
          yield p;
        }
        for (const p of end) {
          yield p;
        }
      })()
    );
  }

  public next(): Option<T | U> {
    return super.next();
  }

  public static new<T, U>(start: Iterable<T>, end: Iterable<U>): Chain<T, U> {
    return new this(start, end);
  }
}

export type Chain<T, U> = ChainImpl<T, U>;
export const Chain = staticify(ChainImpl);

class CycleImpl<T> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>) {
    super(
      (function* (): Generator<T, void, unknown> {
        while (1 / 1) {
          for (const value of Object.assign({}, iter)) {
            yield value;
          }
        }
      })()
    );
  }

  public static new<T>(iter: Iterable<T>): CycleImpl<T> {
    return new this(iter);
  }
}

export type Cycle<T> = CycleImpl<T>;
export const Cycle = staticify(CycleImpl);

class DoubleEndedIteratorImpl<T> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>) {
    super(iter);
  }

  public rev(): DoubleEndedIteratorImpl<T> {
    return new DoubleEndedIteratorImpl(Array.from(this).reverse());
  }

  public next_back(): Option<T> {
    return this.rev().next();
  }

  public advance_back_by(n: number): Result<_, number> {
    return this.rev().advance_by(n);
  }

  public nth_back(n: number): Option<T> {
    return this.rev().nth(n);
  }

  public rfold<B>(init: B, f: FnMut<[B, T], B>): B {
    return this.rev().fold(init, f);
  }

  public rfind(predicate: FnMut<[T], boolean>): Option<T> {
    return this.rev().find(predicate);
  }

  public rposition(predicate: FnMut<[T], boolean>): Option<number> {
    return this.rev().position(predicate);
  }

  public static new<T>(iter: Iterable<T>): DoubleEndedIteratorImpl<T> {
    return new this(iter);
  }
}

export type DoubleEndedIterator<T> = DoubleEndedIteratorImpl<T>;
export const DoubleEndedIterator = staticify(DoubleEndedIteratorImpl);

class EmptyImpl<T> extends IteratorImpl<T> {
  constructor() {
    super();
  }

  public static new<T>(): EmptyImpl<T> {
    return new this();
  }
}

export type Empty<T> = EmptyImpl<T>;
export const Empty = staticify(EmptyImpl);

// @ts-expect-error ts(2714)
class EnumerateImpl<T> extends IteratorImpl<[number, T]> {
  constructor(iter: Iterable<T>) {
    let i = 0;
    super(
      (function* (): Generator<[number, T], void, undefined> {
        for (const value of iter) {
          yield [i++, value];
        }
      })()
    );
  }

  public static new<T>(iter: Iterable<T>): EnumerateImpl<T> {
    return new this(iter);
  }
}

export type Enumerate<T> = EnumerateImpl<T>;
export const Enumerate = staticify(EnumerateImpl);

// @ts-expect-error ts(2714)
class ExactSizeIteratorImpl<T, N extends number> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>, private size: N) {
    super(
      (function* (): Generator<T, void, unknown> {
        let i = 0;
        for (const value of iter) {
          if (i++ <= size) {
            yield value;
          }
        }
      })()
    );
  }

  public len(): N {
    return this.size;
  }

  public is_empty(): N extends 0 ? true : false {
    return (this.size === 0) as never;
  }

  public static new<T, N extends number>(
    iter: Iterable<T>,
    size: N
  ): ExactSizeIteratorImpl<T, N> {
    return new this(iter, size);
  }
}

export type ExactSizeIterator<T, N extends number> = ExactSizeIteratorImpl<
  T,
  N
>;
export const ExactSizeIterator = staticify(ExactSizeIteratorImpl);

// @ts-expect-error ts(2714)
class FilterMapImpl<T, B> extends IteratorImpl<B> {
  constructor(iter: Iterable<T>, f: FnMut<[T], Option<B>>) {
    const p = iter[Symbol.iterator]();
    super(
      (function* (): Generator<B, void, undefined> {
        const item = p.next();
        if (!item.done) {
          const output = f(item.value);
          if (output.is_some()) {
            yield output.unwrap();
          }
        }
      })()
    );
  }

  public static new<T, B>(
    iter: Iterable<T>,
    f: FnMut<[T], Option<B>>
  ): FilterMapImpl<T, B> {
    return new this(iter, f);
  }
}

export type FilterMap<T, B> = FilterMapImpl<T, B>;
export const FilterMap = staticify(FilterMapImpl);

// @ts-expect-error ts(2714)
class FilterImpl<T, P extends FnMut<[T], boolean>> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>, f: P) {
    const p = iter[Symbol.iterator]();
    super(
      (function* (): Generator<T, void, undefined> {
        const item = p.next();

        if (f(item.value)) {
          yield item.value;
        }
      })()
    );
  }

  public static new<T, P extends FnMut<[T], boolean>>(
    iter: Iterable<T>,
    f: P
  ): FilterImpl<T, P> {
    return new this(iter, f);
  }
}

export type Filter<T, P extends FnMut<[T], boolean>> = FilterImpl<T, P>;
export const Filter = staticify(FilterImpl);

// @ts-expect-error ts(2714)
class FlatMapImpl<T, U> extends IteratorImpl<U> {
  constructor(iter: Iterable<T>, f: FnMut<[T], Iterable<U>>) {
    super(
      (function* (): Generator<U, void, unknown> {
        for (const item of iter) {
          for (const value of f(item)) {
            yield value;
          }
        }
      })()
    );
  }

  public static new<T, U>(
    iter: Iterable<T>,
    f: FnMut<[T], Iterable<U>>
  ): FlatMapImpl<T, U> {
    return new this(iter, f);
  }
}

export type FlatMap<T, U> = FlatMapImpl<T, U>;
export const FlatMap = staticify(FlatMapImpl);

// @ts-expect-error ts(2714)
class FlattenImpl<T> extends IteratorImpl<T extends Iterable<infer U> ? U : T> {
  constructor(iter: Iterable<Iterable<T> | T>) {
    super(
      (function* (): Generator<_, void, unknown> {
        for (const value of iter) {
          if (
            typeof value === 'object' &&
            Symbol.iterator in (value as object)
          ) {
            for (const item of value as Iterable<_>) {
              yield item;
            }

            continue;
          }

          yield value as _;
        }
      })()
    );
  }

  public static new<T>(iter: Iterable<Iterable<T> | T>): FlattenImpl<T> {
    return new this(iter);
  }
}

export type Flatten<T> = FlattenImpl<T>;
export const Flatten = staticify(FlattenImpl);

export function empty<T>(): Empty<T> {
  return Empty<T>();
}

export function from_fn<T>(F: FnMut<[], Option<T>>): FromFn<T> {
  return FromFn(F);
}

export function once<T>(T: T): Once<T> {
  return Once(T);
}

export function once_with<T>(F: FnMut<[], T>): OnceWith<T> {
  return OnceWith(F);
}

export function repeat<T>(T: T): Repeat<T> {
  return Repeat(T);
}

export function repeat_with<T>(F: FnMut<[], T>): RepeatWith<T> {
  return RepeatWith(F);
}

export function successors<T>(
  first: Option<T>,
  F: FnMut<[T], Option<T>>
): Successors<T> {
  return Successors(first, F);
}

export function zip<A, B>(A: Iterable<A>, B: Iterable<B>): Zip<A, B> {
  return Zip(A, B);
}

// @ts-expect-error ts(2714)
class FromFnImpl<T> extends IteratorImpl<T> {
  constructor(fn: FnMut<[], Option<T>>) {
    super(
      (function* (): Generator<T, void, unknown> {
        while (1 / 1) {
          const value = fn();

          if (value.is_none()) {
            break;
          }
          yield value.unwrap();
        }
      })()
    );
  }

  public static new<T>(fn: FnMut<[], Option<T>>): FromFnImpl<T> {
    return new this(fn);
  }
}

export type FromFn<T> = FromFnImpl<T>;
export const FromFn = staticify(FromFnImpl);

class FuseImpl<T> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>) {
    super(iter);
  }

  private hit_none = false;

  public next(): Option<T> {
    if (this.hit_none) {
      return None;
    }

    return super.next();
  }

  public static new<T>(iter: Iterable<T>): FuseImpl<T> {
    return new this(iter);
  }
}

export type Fuse<T> = FuseImpl<T>;
export const Fuse = staticify(FuseImpl);

// @ts-expect-error ts(2714)
class InspectImpl<T> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>, f: FnMut<[T]>) {
    super(
      (function* (): Generator<T, void, unknown> {
        for (const value of iter) {
          f(value);
          yield value;
        }
      })()
    );
  }

  public static new<T>(iter: Iterable<T>, f: FnMut<[T]>): InspectImpl<T> {
    return new this(iter, f);
  }
}

export type Inspect<T> = InspectImpl<T>;
export const Inspect = staticify(InspectImpl);

// @ts-expect-error ts(2714)
class IntersperseWithImpl<T, G extends FnMut<[], T>> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>, separator: G) {
    const p = iter[Symbol.iterator]();
    super(
      (function* (): Generator<T, void, undefined> {
        const item = p.next();

        yield item.value;
        if (!item.done) {
          yield separator();
        }
      })()
    );
  }

  public static new<T, G extends FnMut<[], T>>(
    iter: Iterable<T>,
    separator: G
  ): IntersperseWithImpl<T, G> {
    return new this(iter, separator);
  }
}

export type IntersperseWith<T, G extends FnMut<[], T>> = IntersperseWithImpl<
  T,
  G
>;
export const IntersperseWith = staticify(IntersperseWithImpl);

// @ts-expect-error ts(2714)
class IntersperseImpl<T> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>, separator: T) {
    const p = iter[Symbol.iterator]();
    super(
      (function* (): Generator<T, void, undefined> {
        const item = p.next();

        yield item.value;
        if (!item.done) {
          yield separator;
        }
      })()
    );
  }

  public static new<T>(iter: Iterable<T>, separator: T): IntersperseImpl<T> {
    return new this(iter, separator);
  }
}

export type Intersperse<T> = IntersperseImpl<T>;
export const Intersperse = staticify(IntersperseImpl);

export interface IntoIterator<T, I extends Iterator<T>> {
  into_iter(): I;
}

// @ts-expect-error ts(2714)
class MapWhileImpl<T, B> extends IteratorImpl<B> {
  constructor(iter: Iterable<T>, predicate: FnMut<[T], Option<B>>) {
    super(
      Iterator(iter)
        .map((p) => predicate(p))
        .take_while((x: Option<B>) => x.is_some())
        .map((x) => x.unwrap())
    );
  }

  public static new<T, B>(
    iter: Iterable<T>,
    predicate: FnMut<[T], Option<B>>
  ): MapWhileImpl<T, B> {
    return new this(iter, predicate);
  }
}

export type MapWhile<T, B> = MapWhileImpl<T, B>;
export const MapWhile = staticify(MapWhileImpl);

// @ts-expect-error ts(2714)
class MapImpl<T, B> extends IteratorImpl<B> {
  constructor(iter: Iterable<T>, f: FnMut<[T], B>) {
    const p = iter[Symbol.iterator]();
    super(
      (function* (): Generator<B, void, undefined> {
        const item = p.next();

        yield f(item.value);
      })()
    );
  }

  public static new<T, B>(iter: Iterable<T>, f: FnMut<[T], B>): MapImpl<T, B> {
    return new this(iter, f);
  }
}

export type Map<T, B> = MapImpl<T, B>;
export const Map = staticify(MapImpl);
// @ts-expect-error ts(2714)
class OnceImpl<T> extends IteratorImpl<T> {
  constructor(value: T) {
    super(
      (function* (): Generator<T, void, unknown> {
        yield value;
      })()
    );
  }

  public static new<T>(value: T): OnceImpl<T> {
    return new this(value);
  }
}

export type Once<T> = OnceImpl<T>;
export const Once = staticify(OnceImpl);

// @ts-expect-error ts(2714)
class OnceWithImpl<T> extends OnceImpl<T> {
  constructor(fn: FnMut<[], T>) {
    super(fn());
  }

  public static new<T>(fn: FnMut<[], T>): OnceWithImpl<T> {
    return new this(fn);
  }
}

export type OnceWith<T> = OnceWithImpl<T>;
export const OnceWith = staticify(OnceWithImpl);

class PeekableImpl<T> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>) {
    super(iter);
  }

  public peek(): Option<Ref<this, T>> {
    const clone = Object.assign({}, this[Symbol.iterator]());
    const item = clone.next();

    if (item.done) {
      return None;
    }

    return Some(Ref(this, item.value));
  }

  public peek_mut(): Option<RefMut<this, T>> {
    const clone = Object.assign({}, this[Symbol.iterator]());
    const item = clone.next();

    if (item.done) {
      return None;
    }

    return Some(RefMut(this, item.value));
  }

  public static new<T>(iter: Iterable<T>): PeekableImpl<T> {
    return new this(iter);
  }
}

export type Peekable<T> = PeekableImpl<T>;
export const Peekable = staticify(PeekableImpl);

// @ts-expect-error ts(2714)
class RepeatImpl<T> extends IteratorImpl<T> {
  constructor(value: T) {
    super(
      (function* (): Generator<T, void, unknown> {
        while (1 / 1) {
          yield value;
        }
      })()
    );
  }

  public static new<T>(value: T): RepeatImpl<T> {
    return new this(value);
  }
}

export type Repeat<T> = RepeatImpl<T>;
export const Repeat = staticify(RepeatImpl);
// @ts-expect-error ts(2714)
class RepeatWithImpl<T> extends RepeatImpl<T> {
  constructor(fn: FnMut<[], T>) {
    super(fn());
  }

  public static new<T>(fn: FnMut<[], T>): RepeatWithImpl<T> {
    return new this(fn);
  }
}

export type RepeatWith<T> = RepeatWithImpl<T>;
export const RepeatWith = staticify(RepeatWithImpl);

// @ts-expect-error ts(2714)
class ScanImpl<T, St, B> extends IteratorImpl<[St, B]> {
  private i: globalThis.Iterator<T>;
  constructor(
    iter: Iterable<T>,
    private state: St,
    private f: FnMut<[St, T], [St, Option<B>]>
  ) {
    super();
    this.i = iter[Symbol.iterator]();
  }

  public next(): Option<[St, B]> {
    const input = this.i.next();
    if (input.done) {
      return None;
    }

    const [state, output] = this.f(this.state, input.value);
    this.state = state;

    if (output.is_none()) {
      return None;
    }

    return Some([state, output.unwrap()]);
  }

  public static new<T, St, B>(
    iter: Iterable<T>,
    initial_state: St,
    f: FnMut<[St, T], [St, Option<B>]>
  ): ScanImpl<T, St, B> {
    return new this(iter, initial_state, f);
  }
}

export type Scan<T, St, B> = ScanImpl<T, St, B>;
export const Scan = staticify(ScanImpl);

// @ts-expect-error ts(2714)
class SkipWhileImpl<T, P extends FnMut<[T], boolean>> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>, private predicate: P) {
    super(iter);
  }

  private hit_true = false;

  public next(): Option<T> {
    if (this.hit_true) {
      return None;
    }

    let value = super.next();

    while (value.is_some()) {
      if (this.predicate(value.unwrap())) {
        value = super.next();
      }
    }

    return value;
  }

  public static new<T, P extends FnMut<[T], boolean>>(
    iter: Iterable<T>,
    predicate: P
  ): SkipWhileImpl<T, P> {
    return new this(iter, predicate);
  }
}

export type SkipWhile<T, P extends FnMut<[T], boolean>> = SkipWhileImpl<T, P>;
export const SkipWhile = staticify(SkipWhileImpl);

// @ts-expect-error ts(2714)
class SkipImpl<T, N extends number> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>, n: N) {
    let i = 0;
    super(
      (function* (): Generator<T, void, unknown> {
        for (const item of iter) {
          if (i++ >= n) {
            yield item;
          }
        }
      })()
    );
  }

  public static new<T, N extends number>(
    iter: Iterable<T>,
    n: N
  ): SkipImpl<T, N> {
    return new this(iter, n);
  }
}

export type Skip<T, N extends number> = SkipImpl<T, N>;
export const Skip = staticify(SkipImpl);

// @ts-expect-error ts(2417)
class StepByImpl<T, N extends number> extends IteratorImpl<T> {
  constructor(private readonly step: N, iter: Iterable<T>) {
    super(iter);
  }

  public next(): Option<T> {
    let c = super.next();

    for (let i = 1; i < this.step; i++) {
      c = super.next();
    }

    return c;
  }

  public static override new<T, N extends number>(
    step: N,
    iter: Iterable<T>
  ): StepByImpl<T, N> {
    return new this(step, iter);
  }
}

export type StepBy<T, N extends number> = StepByImpl<T, N>;
export const StepBy = staticify(StepByImpl);

// @ts-expect-error ts(2714)
class SuccessorsImpl<T> extends IteratorImpl<T> {
  constructor(first: Option<T>, fn: FnMut<[T], Option<T>>) {
    super(
      (function* (): Generator<T, void, unknown> {
        while (first.is_some()) {
          yield first.unwrap();
          first = fn(first.unwrap());
        }
      })()
    );
  }

  public static new<T>(
    first: Option<T>,
    fn: FnMut<[T], Option<T>>
  ): SuccessorsImpl<T> {
    return new this(first, fn);
  }
}

export type Successors<T> = SuccessorsImpl<T>;
export const Successors = staticify(SuccessorsImpl);

// @ts-expect-error ts(2714)
class TakeWhileImpl<T, P extends FnMut<[T], boolean>> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>, private predicate: P) {
    super(iter);
  }

  private hit_false = false;

  public next(): Option<T> {
    if (this.hit_false) {
      return None;
    }

    const value = super.next();

    if (value.is_some_and(this.predicate)) {
      return value;
    }

    return None;
  }

  public static new<T, P extends FnMut<[T], boolean>>(
    iter: Iterable<T>,
    predicate: P
  ): TakeWhileImpl<T, P> {
    return new this(iter, predicate);
  }
}

export type TakeWhile<T, P extends FnMut<[T], boolean>> = TakeWhileImpl<T, P>;
export const TakeWhile = staticify(TakeWhileImpl);

// @ts-expect-error ts(2714)
class TakeImpl<T, N extends number> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>, n: N) {
    let i = 0;
    super(
      (function* (): Generator<T, void, unknown> {
        for (const item of iter) {
          if (i++ <= n) {
            yield item;
          }

          break;
        }
      })()
    );
  }

  public static new<T, N extends number>(
    iter: Iterable<T>,
    n: N
  ): TakeImpl<T, N> {
    return new this(iter, n);
  }
}

export type Take<T, N extends number> = TakeImpl<T, N>;
export const Take = staticify(TakeImpl);

// @ts-expect-error ts(2417)
class ZipImpl<T, U> extends IteratorImpl<[T, U]> {
  private t: Iterator<T>;
  private u: Iterator<U>;
  constructor(T: Iterable<T>, U: Iterable<U>) {
    super([]);
    this.t = Iterator(T);
    this.u = Iterator(U);
  }

  public next(): Option<[T, U]> {
    const p = this.t.next();
    const q = this.u.next();

    if (p.is_none() || q.is_none()) {
      return None;
    }

    return Some([p, q] as [T, U]);
  }

  public unzip(): [Iterator<T>, Iterator<U>] {
    return [this.t, this.u];
  }

  public static new<T, U>(start: Iterable<T>, end: Iterable<U>): ZipImpl<T, U> {
    return new this(start, end);
  }
}

export type Zip<T, U> = ZipImpl<T, U>;
export const Zip = staticify(ZipImpl);
