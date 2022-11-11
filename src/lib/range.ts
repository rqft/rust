import { staticify } from '../tools';
import { iter, type Iter } from './iter';
import { None, Some, type NoneImpl, type Option } from './option';

export class Range implements Iterable<number> {
  constructor(
    protected readonly open: number,
    protected readonly close: number
  ) {}

  public start(): Option<number> {
    return Some(this.open);
  }

  public end(): Option<number> {
    return Some(this.close);
  }

  public contains(value: number): boolean {
    return value >= this.start().unwrap() && value < this.end().unwrap();
  }

  public isEmpty(): boolean {
    return this.start().unwrap() <= this.end().unwrap();
  }

  public iter(): Iter<number> {
    return iter.new(this);
  }

  *[Symbol.iterator](): Generator<number, void, unknown> {
    for (let i = this.start().unwrap(); i < this.end().unwrap(); i++) {
      yield i;
    }
  }

  public *use<T>(iterable: Iterable<T>): Iterable<T> {
    let i = 0;
    for (const value of iterable) {
      if (i >= this.end().unwrap()) {
        break;
      }

      if (i < this.start().unwrap()) {
        i++;
        continue;
      }

      i++;
      yield value;
    }
  }

  public static new(open: number, close: number): Range {
    return new this(open, close);
  }

  public static of<T extends RangeString>(T: T): RangeFromIn<T> {
    if (T === '..') {
      return new RangeFull() as never;
    }

    const reg = {
      regular: /^(\d+)\.{2}(\d+)$/,
      inclusive: /^(\d+)\.{2}=(\d+)$/,
      to: /^\.{2}(\d+)$/,
      toInclusive: /^\.{2}=(\d+)$/,
      from: /^(\d+)\.{2}$/,
    };

    if (reg.regular.test(T)) {
      const [, open, close] = reg.regular.exec(T) || [];
      return new Range(Number(open), Number(close)) as never;
    }

    if (reg.inclusive.test(T)) {
      const [, open, close] = reg.inclusive.exec(T) || [];
      return new RangeInclusive(Number(open), Number(close)) as never;
    }

    if (reg.to.test(T)) {
      const [, close] = reg.to.exec(T) || [];
      return new RangeTo(Number(close)) as never;
    }

    if (reg.toInclusive.test(T)) {
      const [, close] = reg.toInclusive.exec(T) || [];
      return new RangeToInclusive(Number(close)) as never;
    }

    if (reg.from.test(T)) {
      const [, open] = reg.from.exec(T) || [];
      return new RangeFrom(Number(open)) as never;
    }

    throw `invalid range string '${T}'`;
  }
}

type RangeString =
  | '..'
  | `..=${number}`
  | `..${number}`
  | `${number}..`
  | `${number}..=${number}`
  | `${number}..${number}`;

type RangeFromIn<T extends RangeString> = T extends `${number}..${number}`
  ? Range
  : T extends `..${number}`
  ? RangeTo
  : T extends `${number}..`
  ? RangeFrom
  : T extends `${number}..=${number}`
  ? RangeInclusive
  : T extends `..=${number}`
  ? RangeToInclusive
  : T extends '..'
  ? RangeFull
  : never;

export class RangeFrom extends Range {
  constructor(open: number) {
    super(open, Infinity);
  }

  public end(): NoneImpl {
    return None;
  }

  public contains(value: number): boolean {
    return value >= this.start().unwrap();
  }

  public *use<T>(iterable: Iterable<T>): Iterable<T> {
    let i = 0;
    for (const value of iterable) {
      if (i++ < this.start().unwrap()) {
        continue;
      }

      yield value;
    }
  }

  public static new(open: number): RangeFrom {
    return new this(open);
  }
}

export class RangeFull extends Range {
  constructor() {
    super(-Infinity, Infinity);
  }

  public start(): NoneImpl {
    return None;
  }

  public end(): NoneImpl {
    return None;
  }

  public contains(value: number): boolean {
    void value;
    return true;
  }

  public isEmpty(): boolean {
    return false;
  }

  public *use<T>(iterable: Iterable<T>): Iterable<T> {
    for (const value of iterable) {
      yield value;
    }
  }

  // eslint-disable-next-line require-yield
  *[Symbol.iterator](): Generator<never, void, unknown> {
    throw 'impl `Iterator` not implemented for `RangeFull`';
  }

  public iter(): never {
    throw 'impl `Iterator` not implemented for `RangeFull`';
  }

  public static new(): RangeFull {
    return new this();
  }
}

export class RangeInclusive extends Range {
  *[Symbol.iterator](): Generator<number, void, unknown> {
    for (let i = this.start().unwrap(); i <= this.end().unwrap(); i++) {
      yield i;
    }
  }

  public *use<T>(iterable: Iterable<T>): Iterable<T> {
    let i = 0;
    for (const value of iterable) {
      if (i > this.end().unwrap()) {
        break;
      }

      if (i < this.start().unwrap()) {
        i++;
        continue;
      }

      i++;
      yield value;
    }
  }

  public contains(value: number): boolean {
    return value >= this.start().unwrap() && value <= this.end().unwrap();
  }

  public static new(open: number, close: number): RangeInclusive {
    return new this(open, close);
  }
}

export class RangeTo extends Range {
  constructor(close: number) {
    super(-Infinity, close);
  }

  public start(): NoneImpl {
    return None;
  }

  public contains(value: number): boolean {
    return value < this.end().unwrap();
  }

  public *use<T>(iterable: Iterable<T>): Iterable<T> {
    let i = 0;
    for (const value of iterable) {
      if (i++ >= this.end().unwrap()) {
        break;
      }

      yield value;
    }
  }

  public static new(open: number): RangeTo {
    return new this(open);
  }
}

export class RangeToInclusive extends Range {
  constructor(close: number) {
    super(-Infinity, close);
  }

  public start(): NoneImpl {
    return None;
  }

  public contains(value: number): boolean {
    return value <= this.end().unwrap();
  }

  public *use<T>(iterable: Iterable<T>): Iterable<T> {
    let i = 0;
    for (const value of iterable) {
      if (i++ > this.end().unwrap()) {
        break;
      }

      yield value;
    }
  }

  public static new(open: number): RangeToInclusive {
    return new this(open);
  }
}

export const range = staticify(Range);
export const rangeFrom = staticify(RangeFrom);
export const rangeFull = staticify(RangeFull);
export const rangeInclusive = staticify(RangeInclusive);
export const rangeTo = staticify(RangeTo);
export const rangeToInclusive = staticify(RangeToInclusive);
