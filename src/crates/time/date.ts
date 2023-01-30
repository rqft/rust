import { assert_eq, debug_assert } from '../../std/macros';
import { i16, i32, i8, u16, u8 } from '../../std/number';
import type { int } from '../../std/number/size';
import { size } from '../../std/number/size';
import { Range } from '../../std/ops/range';
import type { Option } from '../../std/option';
import { None, Some } from '../../std/option';
import type { Result } from '../../std/result';
import { Err, Ok } from '../../std/result';
import { tuple } from '../../std/tuple';
import { staticify } from '../../tools';
import { ComponentRangeError } from './error/component_range';
import type { MonthValue } from './month';
import { Month } from './month';
import { PrimitiveDateTime } from './primitive_date_time';
import { Time } from './time';
import {
  days_in_year,
  days_in_year_month,
  is_leap_year,
  weeks_in_year,
} from './util';
import type { WeekdayType } from './weekday';
import { Weekday } from './weekday';

export const min_year = -9999;
export const max_year = 9999;
class DateImpl {
  constructor(private value: i32) {}

  public static new(value: i32): DateImpl {
    return new this(value);
  }

  public static readonly min = this.__from_ordinal_date_unchecked(
    i32(min_year),
    i32(1)
  );
  public static readonly max = this.__from_ordinal_date_unchecked(
    i32(max_year),
    days_in_year(i32(max_year))
  );

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public static __from_ordinal_date_unchecked(
    year: i32,
    ordinal: u16
  ): DateImpl {
    debug_assert(year.ge(min_year) && year.le(max_year));
    debug_assert(ordinal.ne(0) && ordinal.le(days_in_year(year)));

    return this.new(year.shl(9).bitor(ordinal.into(i32)));
  }

  public static from_calendar_date(
    year: int,
    month: Month | MonthValue,
    day: int
  ): Result<DateImpl, ComponentRangeError> {
    year = i32(year);
    month = Month(month);
    day = u8(day);

    const DAYS_CUMULATIVE_COMMON_LEAP: [Array<number>, Array<number>] = [
      [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
      [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335],
    ];

    if (!Range(size(min_year), size(max_year + 1)).contains(year)) {
      return Err(new ComponentRangeError('year', false));
    }

    if (
      !Range(size(1), days_in_year_month(year.into(i32), month)).contains(day)
    ) {
      return Err(new ComponentRangeError('day', true));
    }

    return Ok(
      this.__from_ordinal_date_unchecked(
        year.into(i32),
        day
          .into(u16)
          .add(
            DAYS_CUMULATIVE_COMMON_LEAP[is_leap_year(year.into(i32)) ? 1 : 0][
              month.inner()
            ] || 0
          )
      )
    );
  }

  public static from_ordinal_date(
    year: int,
    day: int
  ): Result<DateImpl, ComponentRangeError> {
    year = i32(year);
    day = u8(day);

    if (!Range(size(min_year), size(max_year + 1)).contains(year)) {
      return Err(new ComponentRangeError('year', false));
    }

    if (!Range(size(1), days_in_year(year.into(i32))).contains(day)) {
      return Err(new ComponentRangeError('day', true));
    }

    return Ok(
      this.__from_ordinal_date_unchecked(year.into(i32), day.into(u16))
    );
  }

  public static from_iso_week_date(
    year: int,
    week: int,
    weekday: Weekday | WeekdayType
  ): Result<DateImpl, ComponentRangeError> {
    year = i32(year);
    week = u8(week);
    weekday = Weekday(weekday);

    if (!Range(size(min_year), size(max_year + 1)).contains(year)) {
      return Err(new ComponentRangeError('year', false));
    }

    if (!Range(size(1), weeks_in_year(year.into(i32))).contains(week)) {
      return Err(new ComponentRangeError('week', true));
    }

    const adj_year = year.sub(1) as i32;
    const raw = i32(365)
      .mul(adj_year)
      .add(adj_year.div(4))
      .sub(adj_year.div(100))
      .add(adj_year.div(400));

    // -6 | 1 => 8,
    // -5 | 2 => 9,
    // -4 | 3 => 10,
    // -3 | 4 => 4,
    // -2 | 5 => 5,
    // -1 | 6 => 6,
    // _ => 7
    const jan_4 =
      {
        [-6]: 8,
        [1]: 8,
        [-5]: 9,
        [2]: 9,
        [-4]: 10,
        [3]: 10,
        [-3]: 4,
        [4]: 4,
        [-2]: 5,
        [5]: 5,
        [-1]: 6,
        [6]: 6,
      }[raw.rem(7).into(i8).into(Number)] || 7;

    const ordinal = week
      .into(i16)
      .mul(7)
      .add(weekday.number_from_monday().into(i16))
      .sub(jan_4);

    if (ordinal.le(0)) {
      return Ok(
        this.__from_ordinal_date_unchecked(
          year.sub(1).into(i32),
          ordinal.into(u16).wrapping_add(days_in_year(year.sub(1).into(i32)))
        )
      );
    } else if (ordinal.gt(days_in_year(year.into(i32)).into(i16))) {
      return Ok(
        this.__from_ordinal_date_unchecked(
          year.add(1).into(i32),
          ordinal.into(u16).sub(days_in_year(year.into(i32)))
        )
      );
    } else {
      return Ok(
        this.__from_ordinal_date_unchecked(year.into(i32), ordinal.into(u16))
      );
    }
  }

  // from_julian_day, from_julian_day_unchecked

  public year(): i32 {
    return this.value.shr(9);
  }

  public month(): Month {
    return this.month_day().get(0);
  }

  public day(): u8 {
    return this.month_day().get(1);
  }

  public month_day(): tuple<[Month, u8]> {
    const CUMULATIVE_DAYS_IN_MONTH_COMMON_LEAP: [Array<number>, Array<number>] =
      [
        [31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
        [31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335],
      ];

    const days =
      CUMULATIVE_DAYS_IN_MONTH_COMMON_LEAP[is_leap_year(this.year()) ? 1 : 0];
    const ordinal = this.ordinal();

    if (ordinal.gt(days[10] || 0)) {
      return tuple([Month.december, ordinal.sub(days[10] || 0).into(u8)]);
    } else if (ordinal.gt(days[9] || 0)) {
      return tuple([Month.november, ordinal.sub(days[9] || 0).into(u8)]);
    } else if (ordinal.gt(days[8] || 0)) {
      return tuple([Month.october, ordinal.sub(days[8] || 0).into(u8)]);
    } else if (ordinal.gt(days[7] || 0)) {
      return tuple([Month.september, ordinal.sub(days[7] || 0).into(u8)]);
    } else if (ordinal.gt(days[6] || 0)) {
      return tuple([Month.august, ordinal.sub(days[6] || 0).into(u8)]);
    } else if (ordinal.gt(days[5] || 0)) {
      return tuple([Month.july, ordinal.sub(days[5] || 0).into(u8)]);
    } else if (ordinal.gt(days[4] || 0)) {
      return tuple([Month.june, ordinal.sub(days[4] || 0).into(u8)]);
    } else if (ordinal.gt(days[3] || 0)) {
      return tuple([Month.may, ordinal.sub(days[3] || 0).into(u8)]);
    } else if (ordinal.gt(days[2] || 0)) {
      return tuple([Month.april, ordinal.sub(days[2] || 0).into(u8)]);
    } else if (ordinal.gt(days[1] || 0)) {
      return tuple([Month.march, ordinal.sub(days[1] || 0).into(u8)]);
    } else if (ordinal.gt(days[0] || 0)) {
      return tuple([Month.february, ordinal.sub(days[0] || 0).into(u8)]);
    } else {
      return tuple([Month.january, ordinal.into(u8)]);
    }
  }

  public ordinal(): u16 {
    return this.value.bitand(0x1ff).into(u16);
  }

  public iso_year_week(): tuple<[i32, u8]> {
    const [year, ordinal] = this.to_ordinal_date().as_primitive();

    const raw = ordinal
      .add(10)
      .sub(this.weekday().number_from_monday().into(u16))
      .div(7)
      .into(u8);

    if (raw.eq(0)) {
      return tuple([year.sub(1), weeks_in_year(year.sub(1))]);
    } else if (raw.eq(53) && weeks_in_year(year).eq(52)) {
      return tuple([year.add(1), u8(1)]);
    } else {
      return tuple([year, raw]);
    }
  }

  public iso_week(): u8 {
    return this.iso_year_week().get(1);
  }

  public to_calendar_date(): tuple<[i32, Month, u8]> {
    const [month, day] = this.month_day().as_primitive();

    return tuple([this.year(), month, day]);
  }

  public to_ordinal_date(): tuple<[i32, u16]> {
    return tuple([this.year(), this.ordinal()]);
  }

  public to_iso_week_date(): tuple<[i32, u8, Weekday]> {
    const [year, ordinal] = this.to_ordinal_date().as_primitive();
    const weekday = this.weekday();

    const raw = ordinal
      .add(10)
      .sub(this.weekday().number_from_monday().into(u16))
      .div(7)
      .into(u8);

    if (raw.eq(0)) {
      return tuple([year.sub(1), weeks_in_year(year.sub(1)), weekday]);
    } else if (raw.eq(53) && weeks_in_year(year).eq(52)) {
      return tuple([year.add(1), u8(1), weekday]);
    } else {
      return tuple([year, raw, weekday]);
    }
  }

  public sunday_based_week(): u8 {
    return this.ordinal()
      .into(u16)
      .sub(this.weekday().number_days_from_sunday().into(i16))
      .add(6)
      .div(7)
      .into(u8);
  }

  public monday_based_week(): u8 {
    return this.ordinal()
      .into(u16)
      .sub(this.weekday().number_days_from_monday().into(i16))
      .add(6)
      .div(7)
      .into(u8);
  }

  public weekday(): Weekday {
    const compare = this.to_julian_day().rem(7);

    return (
      {
        [-6]: Weekday.tuesday,
        [1]: Weekday.tuesday,
        [-5]: Weekday.wednesday,
        [2]: Weekday.wednesday,
        [-4]: Weekday.thursday,
        [3]: Weekday.thursday,
        [-3]: Weekday.friday,
        [4]: Weekday.friday,
        [-2]: Weekday.saturday,
        [5]: Weekday.saturday,
        [-1]: Weekday.sunday,
        [6]: Weekday.sunday,
      }[compare.into(Number)] ||
      (assert_eq(compare.into(Number), 0), Weekday.monday)
    );
  }

  public to_julian_day(): i32 {
    const year = this.year().sub(1);
    const ordinal = this.ordinal().into(i32);

    return ordinal
      .add(year.mul(365))
      .add(year.div(4))
      .sub(year.div(100))
      .add(year.div(400))
      .add(1_721_425);
  }

  public next_day(): Option<DateImpl> {
    if (
      this.ordinal().eq(366) ||
      (this.ordinal().eq(365) && !is_leap_year(this.year()))
    ) {
      if (this.value.eq(DateImpl.max.value)) {
        return None;
      } else {
        return Some(
          DateImpl.__from_ordinal_date_unchecked(this.year().add(1), i32(1))
        );
      }
    } else {
      return Some(new DateImpl(this.value.add(1)));
    }
  }

  public previous_day(): Option<DateImpl> {
    if (this.ordinal().ne(1)) {
      return Some(new DateImpl(this.value.sub(1)));
    } else if (this.value === DateImpl.min.value) {
      return None;
    } else {
      return Some(
        DateImpl.__from_ordinal_date_unchecked(
          this.year().sub(1),
          days_in_year(this.year().sub(1))
        )
      );
    }
  }

  // not doing checked/saturating/wrapping arithm, or replacement

  public midnight(): PrimitiveDateTime {
    return PrimitiveDateTime(this, Time.midnight);
  }

  public with_time(time: Time): PrimitiveDateTime {
    return PrimitiveDateTime(this, time);
  }

  public with_hms(
    h: int,
    m: int,
    s: int
  ): Result<PrimitiveDateTime, ComponentRangeError> {
    const raw = Time.from_hms(h, m, s);

    if (raw.is_err()) {
      return raw as Err<ComponentRangeError>;
    }
    return Ok(PrimitiveDateTime(this, raw.unwrap_unchecked()));
  }

  public with_hms_milli(
    h: int,
    m: int,
    s: int,
    milli: int
  ): Result<PrimitiveDateTime, ComponentRangeError> {
    const raw = Time.from_hms_milli(h, m, s, milli);

    if (raw.is_err()) {
      return raw as Err<ComponentRangeError>;
    }
    return Ok(PrimitiveDateTime(this, raw.unwrap_unchecked()));
  }

  public with_hms_micro(
    h: int,
    m: int,
    s: int,
    micro: int
  ): Result<PrimitiveDateTime, ComponentRangeError> {
    const raw = Time.from_hms_micro(h, m, s, micro);

    if (raw.is_err()) {
      return raw as Err<ComponentRangeError>;
    }
    return Ok(PrimitiveDateTime(this, raw.unwrap_unchecked()));
  }

  public with_hms_nano(
    h: int,
    m: int,
    s: int,
    nano: int
  ): Result<PrimitiveDateTime, ComponentRangeError> {
    const raw = Time.from_hms_nano(h, m, s, nano);

    if (raw.is_err()) {
      return raw as Err<ComponentRangeError>;
    }
    return Ok(PrimitiveDateTime(this, raw.unwrap_unchecked()));
  }
}

export type Date = DateImpl;
export const Date = staticify(DateImpl);
