import { staticify } from '../tools';
import type { Option } from './option';
import { None, Some } from './option';
import type { Result } from './result';
import { Err, Ok } from './result';
import { Ordering } from './traits';
class Iter<T> {
  constructor(private iterable: Iterable<T> = []) {
    this.iterator = this.iterable[Symbol.iterator]();
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

    return Some(value);
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
      z = value;
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
          yield value.unwrap();
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
          yield value.unwrap();
          yield f();
        }
      })()
    );
  }

  public map<U = T>(f: (value: Option<T>) => U): Iter<U> {
    const shield = this;
    return new Iter(
      (function* (): Generator<U, void, undefined> {
        for (const value of shield) {
          yield f(value);
        }
      })()
    );
  }

  public forEach(f: (value: Option<T>) => unknown): this {
    for (const value of this) {
      f(value);
    }

    // just for fun, ig?
    return this;
  }

  public filter(f: (value: Option<T>) => boolean): Iter<T> {
    const shield = this;
    return new Iter(
      (function* (): Generator<T, void, undefined> {
        for (const value of shield) {
          if (f(value)) {
            yield value.unwrap();
          }
        }
      })()
    );
  }

  public filterMap<U = T>(
    f: (value: Option<T>) => boolean,
    m: (value: Option<T>) => U
  ): Iter<U> {
    return this.filter(f).map(m);
  }

  public enumerate(): Iter<[number, T]> {
    const shield = this;
    return new Iter(
      (function* (): Generator<[number, T], void, undefined> {
        let i = 0;
        for (const value of shield) {
          yield [i++, value.unwrap()];
        }
      })()
    );
  }

  public peek(): Option<T> {
    return this.clone().next();
  }

  public skipWhile(f: (value: Option<T>) => boolean): Iter<T> {
    const shield = this;
    return new Iter(
      (function* (): Generator<T, void, undefined> {
        for (const value of shield) {
          if (f(value)) {
            continue;
          }
          yield value.unwrap();
        }
      })()
    );
  }

  public skip(n: number): Iter<T> {
    let i = 0;
    return this.skipWhile(() => i++ < n);
  }

  public takeWhile(f: (value: Option<T>) => boolean): Iter<T> {
    const shield = this;
    return new Iter(
      (function* (): Generator<T, void, undefined> {
        for (const value of shield) {
          if (!f(value)) {
            continue;
          }
          yield value.unwrap();
        }
      })()
    );
  }

  public take(n: number): Iter<T> {
    let i = 0;
    return this.takeWhile(() => i++ < n);
  }

  public mapWhile<U>(
    t: (value: Option<T>) => boolean,
    m: (value: Option<T>) => U
  ): Iter<U> {
    return this.takeWhile(t).map(m);
  }

  // skip: fuse

  public inspect(i: (value: Option<T>) => unknown): this {
    this.clone().forEach(i);
    return this;
  }

  public collect(): Array<Option<T>> {
    return Array.from(this);
  }

  public partition(p: (value: Option<T>) => boolean): {
    true: Iter<T>;
    false: Iter<T>;
  } {
    const out: { true: Array<T>; false: Array<T> } = { true: [], false: [] };

    for (const value of this) {
      if (p(value)) {
        out.true.push(value.unwrap());
      } else {
        out.false.push(value.unwrap());
      }
    }

    return { true: new Iter(out.true), false: new Iter(out.false) };
  }

  public fold<B>(init: B, f: (b: B, value: Option<T>) => B): B {
    for (const value of this) {
      init = f(init, value);
    }

    return init;
  }

  public reduce(f: (acc: Option<T>, value: Option<T>) => Option<T>): Option<T> {
    let out: Option<T> = None;

    for (const value of this) {
      out = f(out, value);
    }

    return out;
  }

  public all(f: (value: Option<T>) => boolean): boolean {
    for (const value of this) {
      if (!f(value)) {
        return false;
      }
    }

    return true;
  }

  public any(f: (value: Option<T>) => boolean): boolean {
    for (const value of this) {
      if (f(value)) {
        return true;
      }
    }

    return false;
  }

  public find(f: (value: Option<T>) => boolean): Option<T> {
    for (const value of this) {
      if (f(value)) {
        return value;
      }
    }

    return None;
  }

  public findMap<U>(
    m: (value: Option<T>) => U,
    f: (value: Option<U>) => boolean
  ): Option<U> {
    return this.map(m).find(f);
  }

  public position(f: (value: Option<T>) => boolean): Option<number> {
    let i = 0;
    for (const value of this) {
      if (f(value)) {
        return Some(i);
      }

      i++;
    }

    return None;
  }

  public maxBy(
    o: (value: Option<T>, against: Option<T>) => Ordering
  ): Option<T> {
    let max: Option<T> = None;

    for (const value of this) {
      const z = o(value, max);

      if (z === Ordering.More) {
        max = value;
      }
    }

    return max;
  }

  public max(): Option<T> {
    return this.maxBy((o, a) => o.unwrapWith(Number) - a.unwrapWith(Number));
  }

  public minBy(
    o: (value: Option<T>, against: Option<T>) => Ordering
  ): Option<T> {
    let min: Option<T> = None;

    for (const value of this) {
      const z = o(value, min);

      if (z === Ordering.Less) {
        min = value;
      }
    }

    return min;
  }

  public min(): Option<T> {
    return this.minBy((o, a) => o.unwrapWith(Number) - a.unwrapWith(Number));
  }

  public cycle(): Iter<T> {
    const shield = this;
    return new Iter(
      (function* (): Generator<T, void, undefined> {
        while (1 + 1) {
          for (const value of shield.clone()) {
            yield value.unwrap();
          }
        }
      })()
    );
  }

  public sumBy(n: (value: Option<T>) => number): Option<number> {
    return Some(this.map(n).fold(0, (b, v) => b + v.unwrap()));
  }

  public productBy(n: (value: Option<T>) => number): Option<number> {
    return Some(this.map(n).fold(0, (b, v) => b * v.unwrap()));
  }

  public sum(): Option<number> {
    return this.sumBy((x) => x.unwrapWith(Number));
  }

  public product(): Option<number> {
    return this.productBy((x) => x.unwrapWith(Number));
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

  public *[Symbol.iterator](): Generator<Option<T>, Option<never>, unknown> {
    while (1 + 1) {
      const id = this.iterator.next();

      if (id.done) {
        return None;
      }

      yield Some(id.value);
    }

    return None;
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
}

export const iter = staticify(Iter);
iter<1>();
