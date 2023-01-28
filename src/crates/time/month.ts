import type { PartialEq } from "../../std/cmp";
import { staticify } from "../../tools";

export type MonthValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

class MonthImpl implements PartialEq<MonthImpl> {
  constructor(private readonly raw: MonthValue) {}
  public static new(T: MonthImpl | MonthValue): MonthImpl {
    if (T instanceof this) {
      return T;
    }
    return new this(T);
  }

  public previous(): MonthImpl {
    return new MonthImpl((this.raw - 1) as never);
  }

  public next(): MonthImpl {
    return new MonthImpl((this.raw + 1) as never);
  }

  public inner(): MonthValue {
    return this.raw;
  }

  public static readonly january = new this(0);
  public static readonly february = new this(1);
  public static readonly march = new this(2);
  public static readonly april = new this(3);
  public static readonly may = new this(4);
  public static readonly june = new this(5);
  public static readonly july = new this(6);
  public static readonly august = new this(7);
  public static readonly september = new this(8);
  public static readonly october = new this(9);
  public static readonly november = new this(10);
  public static readonly december = new this(11);

  public eq(other: MonthImpl): boolean {
    return this.raw === other.raw;
  }

  public ne(other: MonthImpl): boolean {
    return !this.eq(other);
  }
}

export type Month = MonthImpl;
export const Month = staticify(MonthImpl);
