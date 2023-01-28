import { u8 } from "../../std";
import { staticify } from "../../tools";

export type WeekdayType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

class WeekdayImpl {
  constructor(private readonly raw: WeekdayType) {}
  public static new(T: Weekday | WeekdayType): WeekdayImpl {
    if (T instanceof this) {
      return T;
    }
    return new this(T);
  }

  public previous(): WeekdayImpl {
    return new WeekdayImpl((this.raw - 1) as never);
  }

  public next(): WeekdayImpl {
    return new WeekdayImpl((this.raw + 1) as never);
  }

  public inner(): WeekdayType {
    return this.raw;
  }

  public number_from_monday(): u8 {
    return this.number_days_from_monday().add(1);
  }

  public number_from_sunday(): u8 {
    return this.number_days_from_sunday().add(1);
  }

  public number_days_from_monday(): u8 {
    return u8(this.inner());
  }

  public number_days_from_sunday(): u8 {
    if (this.inner() == 6) {
      return u8(0);
    }

    return this.number_from_monday();
  }

  public static readonly monday = new this(0);
  public static readonly tuesday = new this(1);
  public static readonly wednesday = new this(2);
  public static readonly thursday = new this(3);
  public static readonly friday = new this(4);
  public static readonly saturday = new this(5);
  public static readonly sunday = new this(6);
}

export type Weekday = WeekdayImpl;
export const Weekday = staticify(WeekdayImpl);
