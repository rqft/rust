import { staticify } from '../../tools';
import { Iterator } from '../iter/index';
import type { int, SizeImpl } from '../number/size';

class RangeImpl<T extends SizeImpl> {
  constructor(public readonly start: T, public readonly end: T) {}
  public static new<T extends SizeImpl>(start: T, end: T): RangeImpl<T> {
    return new this(start, end);
  }

  public is_empty(): boolean {
    return this.start.ge(this.end);
  }

  public contains(item: int): boolean {
    // start <= item < end

    return this.start.le(item) && this.end.gt(item);
  }

  public iter(): Iterator<T> {
    const { start, end } = this;
    return Iterator(
      (function* (): Generator<T, void, undefined> {
        for (let i = start.valueOf(); i < end.valueOf(); i++) {
          yield start.constructor(i);
        }
      })()
    );
  }

  public index<U>(slice: Iterable<U>): Iterator<U> {
    let i = 0n;
    const { start, end } = this;
    return Iterator(
      (function* (): Generator<U, void, undefined> {
        for (const value of slice) {
          if (i >= end.valueOf()) {
            break;
          }

          if (i < start.valueOf()) {
            continue;
          }

          i++;
          yield value;
        }
      })()
    );
  }
}

class RangeFromImpl<T extends SizeImpl> {
  constructor(public readonly start: T) {}
  public static new<T extends SizeImpl>(start: T): RangeFromImpl<T> {
    return new this(start);
  }

  public contains(item: int): boolean {
    // start <= item
    return this.start.le(item);
  }

  public iter(): Iterator<T> {
    const { start } = this;
    return Iterator(
      (function* (): Generator<T, void, undefined> {
        for (let i = start.valueOf(); ; i++) {
          yield start.constructor(i);
        }
      })()
    );
  }

  public index<U>(slice: Iterable<U>): Iterator<U> {
    let i = 0n;
    const { start } = this;
    return Iterator(
      (function* (): Generator<U, void, undefined> {
        for (const value of slice) {
          if (i < start.valueOf()) {
            continue;
          }

          i++;
          yield value;
        }
      })()
    );
  }
}

class RangeFullImpl {
  public static new(): RangeFullImpl {
    return new this();
  }

  public index<U>(slice: Iterable<U>): Iterator<U> {
    return Iterator(slice);
  }
}

class RangeInclusiveImpl<T extends SizeImpl> {
  constructor(public readonly start: T, public readonly end: T) {}
  public static new<T extends SizeImpl>(
    start: T,
    end: T
  ): RangeInclusiveImpl<T> {
    return new this(start, end);
  }

  public is_empty(): boolean {
    return this.start.ge(this.end);
  }

  public contains(item: int): boolean {
    // start <= item <= end

    return this.start.le(item) && this.end.ge(item);
  }

  public iter(): Iterator<T> {
    const { start, end } = this;
    return Iterator(
      (function* (): Generator<T, void, undefined> {
        for (let i = start.valueOf(); i <= end.valueOf(); i++) {
          yield start.constructor(i);
        }
      })()
    );
  }

  public index<U>(slice: Iterable<U>): Iterator<U> {
    let i = 0n;
    const { start, end } = this;
    return Iterator(
      (function* (): Generator<U, void, undefined> {
        for (const value of slice) {
          if (i > end.valueOf()) {
            break;
          }

          if (i < start.valueOf()) {
            continue;
          }

          i++;
          yield value;
        }
      })()
    );
  }
}

class RangeToImpl<T extends SizeImpl> {
  constructor(public readonly end: T) {}
  public static new<T extends SizeImpl>(end: T): RangeToImpl<T> {
    return new this(end);
  }

  public contains(item: int): boolean {
    // item < end
    return this.end.gt(item);
  }

  public index<U>(slice: Iterable<U>): Iterator<U> {
    let i = 0n;
    const { end } = this;
    return Iterator(
      (function* (): Generator<U, void, undefined> {
        for (const value of slice) {
          if (i >= end.valueOf()) {
            break;
          }

          i++;
          yield value;
        }
      })()
    );
  }
}

class RangeToInclusiveImpl<T extends SizeImpl> {
  constructor(public readonly end: T) {}
  public static new<T extends SizeImpl>(end: T): RangeToInclusiveImpl<T> {
    return new this(end);
  }

  public contains(item: int): boolean {
    // item <= end
    return this.end.ge(item);
  }

  public index<U>(slice: Iterable<U>): Iterator<U> {
    let i = 0n;
    const { end } = this;
    return Iterator(
      (function* (): Generator<U, void, undefined> {
        for (const value of slice) {
          if (i > end.valueOf()) {
            break;
          }

          i++;
          yield value;
        }
      })()
    );
  }
}

export type Range<T extends SizeImpl> = RangeImpl<T>;
export type RangeFrom<T extends SizeImpl> = RangeFromImpl<T>;
export type RangeFull = RangeFullImpl;
export type RangeInclusive<T extends SizeImpl> = RangeInclusiveImpl<T>;
export type RangeTo<T extends SizeImpl> = RangeToImpl<T>;
export type RangeToInclusive<T extends SizeImpl> = RangeToInclusiveImpl<T>;

export const Range = staticify(RangeImpl);
export const RangeFrom = staticify(RangeFromImpl);
export const RangeFull = staticify(RangeFullImpl);
export const RangeInclusive = staticify(RangeInclusiveImpl);
export const RangeTo = staticify(RangeToImpl);
export const RangeToInclusive = staticify(RangeToInclusiveImpl);
