import { staticify } from '../tools';
import type { Option } from './option';
import { None, Some } from './option';
import type { Result } from './result';
import { Err, Ok } from './result';
import type { Copy, Default } from './traits';
export class Iter<T> implements Iterable<T>, Copy, Default {
  constructor(private iterable: Iterable<T> = []) {
    this.iterator = this.iterable[Symbol.iterator]();
  }

  public default(): Iter<never> {
    return Iter.new([]);
  }

  private iterator: Iterator<T, unknown, undefined>;
  private picker = 0;

  public static new<T>(iterable: Iterable<T> = []): Iter<T> {
    return new this(iterable);
  }

  public next(): Option<T> {
    this.picker++;
    const { value, done } = this.iterator.next();

    if (done) {
      return None;
    }

    return Some(value as T);
  }

  public count(): number {
    let i = 0;

    for (const _ of this) {
      void _;
      i++;
    }

    return i;
  }

  public last(): Option<T> {
    let z: Option<T> = None;

    for (const value of this) {
      z = Some(value);
    }

    return z;
  }

  public sizeHint(): [number, number] {
    return [this.picker, this.clone().count()];
  }

  public advanceBy(n: number): Result<typeof None, number> {
    for (let i = 0; i < n; i++) {
      if (this.next().isNone()) {
        return Err(n);
      }
    }

    return Ok(None);
  }

  public nth(n: number): Option<T> {
    let z: Option<T> = None;
    for (let i = 0; i < n; i++) {
      z = this.next();
    }

    return z;
  }

  public stepBy(n: number): Iter<T> {
    if (n === 0) {
      throw new Error('n must be greater than 0');
    }

    class StepBy<T> extends Iter<T> {
      constructor(iterable: Iterable<T>) {
        super(iterable);
      }

      public next(): Option<T> {
        let z: Option<T> = None;
        for (let i = 0; i < n; i++) {
          z = super.next();
        }

        return z;
      }
    }

    return new StepBy(this.iterable);
  }

  public chain<U>(iterable: Iterable<U>): Iter<T | U> {
    const shield = this;
    return new Iter(
      (function* (): Generator<T | U, void, undefined> {
        yield* shield.iterable;
        yield* iterable;
      })()
    );
  }

  public zip<U>(iterable: Iterable<U>): Iter<[T, U]> {
    const shield = this;
    const other = new Iter(iterable);
    return new Iter(
      (function* (): Generator<[T, U], void, undefined> {
        while (1 + 1) {
          const [z, t] = [shield.next(), other.next()];

          if (z.isNone() || t.isNone()) {
            break;
          }

          yield [z.unwrap(), t.unwrap()];
        }
      })()
    );
  }

  public intersperse<U>(separator: U): Iter<T | U> {
    const shield = this;
    return new Iter(
      (function* (): Generator<T | U, void, undefined> {
        for (const value of shield) {
          yield value;
          yield separator;
        }
      })()
    );
  }

  public intersperseWith(f: () => T): Iter<T> {
    const shield = this;
    return new Iter(
      (function* (): Generator<T, void, undefined> {
        for (const value of shield) {
          yield value;
          yield f();
        }
      })()
    );
  }

  public map<U = T>(f: (value: T) => U): Iter<U> {
    const shield = this;
    return new Iter(
      (function* (): Generator<U, void, undefined> {
        for (const value of shield) {
          yield f(value);
        }
      })()
    );
  }

  public forEach(f: (value: T) => unknown): this {
    for (const value of this) {
      f(value);
    }

    // just for fun, ig?
    return this;
  }

  public filter(f: (value: T) => boolean): Iter<T> {
    const shield = this;
    return new Iter(
      (function* (): Generator<T, void, undefined> {
        for (const value of shield) {
          if (f(value)) {
            yield value;
          }
        }
      })()
    );
  }

  public filterMap<U = T>(
    f: (value: T) => boolean,
    m: (value: T) => U
  ): Iter<U> {
    return this.filter(f).map(m);
  }

  public enumerate(): Iter<[number, T]> {
    const shield = this;
    return new Iter(
      (function* (): Generator<[number, T], void, undefined> {
        let i = 0;
        for (const value of shield) {
          yield [i++, value];
        }
      })()
    );
  }

  public peek(): Option<T> {
    return this.clone().next();
  }

  public skipWhile(f: (value: T) => boolean): Iter<T> {
    const shield = this;
    return new Iter(
      (function* (): Generator<T, void, undefined> {
        for (const value of shield) {
          if (f(value)) {
            continue;
          }
          yield value;
        }
      })()
    );
  }

  public skip(n: number): Iter<T> {
    let i = 0;
    return this.skipWhile(() => i++ < n);
  }

  public takeWhile(f: (value: T) => boolean): Iter<T> {
    const shield = this;
    return new Iter(
      (function* (): Generator<T, void, undefined> {
        for (const value of shield) {
          if (!f(value)) {
            continue;
          }
          yield value;
        }
      })()
    );
  }

  public take(n: number): Iter<T> {
    let i = 0;
    return this.takeWhile(() => i++ < n);
  }

  public mapWhile<U>(t: (value: T) => boolean, m: (value: T) => U): Iter<U> {
    return this.takeWhile(t).map(m);
  }

  // skip: fuse

  public inspect(i: (value: T) => unknown): this {
    this.clone().forEach(i);
    return this;
  }

  public collect(): Array<T> {
    return Array.from(this);
  }

  public partition(p: (value: T) => boolean): {
    true: Iter<T>;
    false: Iter<T>;
  } {
    const out: { true: Array<T>; false: Array<T> } = { true: [], false: [] };

    for (const value of this) {
      if (p(value)) {
        out.true.push(value);
      } else {
        out.false.push(value);
      }
    }

    return { true: new Iter(out.true), false: new Iter(out.false) };
  }

  public fold<B>(init: B, f: (b: B, value: T) => B): B {
    for (const value of this) {
      init = f(init, value);
    }

    return init;
  }

  public reduce(f: (acc: Option<T>, value: T) => T, start?: T): Option<T> {
    let out: Option<T> = start ? Some(start) : None;

    for (const value of this) {
      out = Some(f(out, value));
    }

    return out;
  }

  public all(f: (value: T) => boolean): boolean {
    for (const value of this) {
      if (!f(value)) {
        return false;
      }
    }

    return true;
  }

  public any(f: (value: T) => boolean): boolean {
    for (const value of this) {
      if (f(value)) {
        return true;
      }
    }

    return false;
  }

  public find(f: (value: T) => boolean): Option<T> {
    for (const value of this) {
      if (f(value)) {
        return Some(value);
      }
    }

    return None;
  }

  public findMap<U>(m: (value: T) => U, f: (value: U) => boolean): Option<U> {
    return this.map(m).find(f);
  }

  public position(f: (value: T) => boolean): Option<number> {
    let i = 0;
    for (const value of this) {
      if (f(value)) {
        return Some(i);
      }

      i++;
    }

    return None;
  }

  public cycle(): Iter<T> {
    const shield = this;
    return new Iter(
      (function* (): Generator<T, void, undefined> {
        while (1 + 1) {
          for (const value of shield.clone()) {
            yield value;
          }
        }
      })()
    );
  }

  public sumBy(n: (value: T) => number): Option<number> {
    return Some(this.map(n).fold(0, (b, v) => b + v));
  }

  public productBy(n: (value: T) => number): Option<number> {
    return Some(this.map(n).fold(0, (b, v) => b * v));
  }

  public sum(): Option<number> {
    return this.sumBy(Number);
  }

  public product(): Option<number> {
    return this.productBy(Number);
  }

  public reverse(): Iter<T> {
    const shield = this;
    return new Iter(
      (function* (): Generator<T, void, undefined> {
        yield* Array.from(shield.iterable)
          .map((x) => x)
          .reverse();
      })()
    );
  }

  public rev(): Iter<T> {
    const i = this.reverse();

    for (let z = 0; z < this.picker; z++) {
      i.next();
    }

    return i;
  }

  public *[Symbol.iterator](): Generator<T, void, unknown> {
    while (1 + 1) {
      const id = this.iterator.next();

      if (id.done) {
        return;
      }

      yield id.value;
    }
  }

  public clone(): Iter<T> {
    const shield = this;
    return new Iter(
      (function* (): Generator<T, void, undefined> {
        for (const value of shield.iterable) {
          yield value;
        }
      })()
    );
  }

  public static successors<T>(first: Option<T>, f: (T: T) => T) {}
}

export const iter = staticify(Iter);
