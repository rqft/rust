import { staticify } from '../tools';
import { format } from './macros';
import type { Range } from './range';
import type { Copy, Debug, Default, Display } from './traits';
import { Ordering, PartialComparison } from './traits';

export class Tuple<T extends ReadonlyArray<unknown>>
  extends PartialComparison<Iterable<T[number]>>
  implements Iterable<T[number]>, Debug, Display, Copy, Default
{
  private readonly alloc: T;
  constructor(...alloc: T) {
    super();

    this.alloc = alloc;
  }

  *[Symbol.iterator](): Generator<T[number], void, unknown> {
    for (const value of this.alloc) {
      yield value;
    }
  }

  public static new<T extends ReadonlyArray<unknown>>(...alloc: T): Tuple<T> {
    return new this(...alloc);
  }

  public clone(): Tuple<T> {
    return Tuple.new<T>(...this.alloc);
  }

  public default(): Tuple<[]> {
    return Tuple.new();
  }

  public fmtDebug(): string {
    return format('({})', [
      this.alloc
        .map((x) => {
          if (typeof x === 'object' || typeof x === 'function') {
            if ('fmt' in (x as Debug)) {
              return (x as Debug).fmtDebug();
            }
            throw new Error(`${x} does not impl trait \`Debug\``);
          }

          return String(x);
        })
        .join(', '),
    ]);
  }

  public fmt(): string {
    return format('({})', [
      this.alloc
        .map((x) => {
          if (typeof x === 'object' || typeof x === 'function') {
            if ('fmt' in (x as Display)) {
              return (x as Display).fmt();
            }
            throw new Error(`${x} does not impl trait \`Display\``);
          }

          return String(x);
        })
        .join(', '),
    ]);
  }

  public eq(this: this, other: Iterable<T[number]>): boolean {
    let i = 0;
    for (const value of other) {
      if (this.alloc[i] !== value) {
        return false;
      }

      i++;
    }

    return true;
  }

  public cmp(this: this, other: Iterable<T[number]>): Ordering {
    if (this.eq(other)) {
      return Ordering.Equal;
    }

    let i = 0;
    for (const value of other) {
      const cur = this.alloc[i++];

      // if it has a comparison checker
      if ('cmp' in (cur as PartialComparison<unknown>)) {
        const c = (cur as PartialComparison<unknown>).cmp(value);
        if (c === Ordering.Equal) {
          continue;
        }

        return c;
      }

      if (+(cur as never) > +value) {
        return Ordering.Less;
      }

      return Ordering.More;
    }

    return Ordering.Equal;
  }

  public index<U extends number & keyof T>(index: U): T[U] {
    return this.alloc[index];
  }

  public startBound(): number {
    return 0;
  }

  public endBound(): number {
    return this.alloc.length;
  }

  public contains(value: T[number]): boolean {
    return this.alloc.includes(value);
  }

  public get(range: Range): Tuple<ReadonlyArray<T[number]>> {
    return Tuple.new(Object.freeze(Array.from(range.use(this))));
  }
}

export const tuple = staticify(Tuple);
