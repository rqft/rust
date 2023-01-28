import type { i32, u16, u32, u8 } from "../../std/number";
import type { tuple } from "../../std/tuple";
import { staticify } from "../../tools";
import { Date } from "./date";
import type { Month } from "./month";
import { Time } from "./time";
import type { Weekday } from "./weekday";

class PrimitiveDateTimeImpl {
  constructor(private readonly d: Date, private readonly t: Time) {}
  public static new(date: Date, time: Time): PrimitiveDateTimeImpl {
    return new this(date, time);
  }

  public static readonly min = new this(Date.min, Time.min);
  public static readonly max = new this(Date.max, Time.max);

  public date(): Date {
    return this.d;
  }
  public time(): Time {
    return this.t;
  }

  public year(): i32 {
    return this.d.year();
  }
  public month(): Month {
    return this.d.month();
  }
  public day(): u8 {
    return this.d.day();
  }
  public ordinal(): u16 {
    return this.d.ordinal();
  }
  public iso_week(): u8 {
    return this.d.iso_week();
  }
  public sunday_based_week(): u8 {
    return this.d.sunday_based_week();
  }
  public monday_based_week(): u8 {
    return this.d.monday_based_week();
  }
  public to_calendar_date(): tuple<[i32, Month, u8]> {
    return this.d.to_calendar_date();
  }
  public to_iso_week_date(): tuple<[i32, u8, Weekday]> {
    return this.d.to_iso_week_date();
  }
  public weekdate(): Weekday {
    return this.d.weekday();
  }
  public to_julian_day(): i32 {
    return this.d.to_julian_day();
  }

  public as_hms(): tuple<[u8, u8, u8]> {
    return this.t.as_hms();
  }
  public as_hms_milli(): tuple<[u8, u8, u8, u16]> {
    return this.t.as_hms_milli();
  }
  public as_hms_micro(): tuple<[u8, u8, u8, u32]> {
    return this.t.as_hms_micro();
  }
  public as_hms_nano(): tuple<[u8, u8, u8, u32]> {
    return this.t.as_hms_nano();
  }

  public hour(): u8 {
    return this.t.hour();
  }
  public minute(): u8 {
    return this.t.minute();
  }
  public second(): u8 {
    return this.t.second();
  }
  public millisecond(): u16 {
    return this.t.millisecond();
  }
  public microsecond(): u32 {
    return this.t.microsecond();
  }
  public nanosecond(): u32 {
    return this.t.nanosecond();
  }

  // assume_offset, assume_utc
}

export type PrimitiveDateTime = PrimitiveDateTimeImpl;
export const PrimitiveDateTime = staticify(PrimitiveDateTimeImpl);
