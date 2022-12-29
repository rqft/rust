import { u16, u32, u8 } from '../../std/number';
import type { int } from '../../std/number/size';
import { Range } from '../../std/ops/range';
import type { Result } from '../../std/result';
import { Err, Ok } from '../../std/result';
import { tuple } from '../../std/tuple';
import { staticify } from '../../tools';
import { ComponentRangeError } from './error/component_range';

class TimeImpl {
  constructor(private h: u8, private m: u8, private s: u8, private n: u32) {}

  public static new(h: u8, m: u8, s: u8, n: u32): TimeImpl {
    return new this(h, m, s, n);
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public static __from_hms_nanos_unchecked(
    h: u8,
    m: u8,
    s: u8,
    n: u32
  ): TimeImpl {
    return new this(h, m, s, n);
  }

  public static from_hms(
    hour: int,
    minute: int,
    second: int
  ): Result<TimeImpl, ComponentRangeError> {
    hour = u8(hour);
    minute = u8(minute);
    second = u8(second);

    if (!Range<u8>(u8(0), u8(24)).contains(hour)) {
      return Err(new ComponentRangeError('hour', false));
    }

    if (!Range<u8>(u8(0), u8(60)).contains(minute)) {
      return Err(new ComponentRangeError('minute', false));
    }

    if (!Range<u8>(u8(0), u8(60)).contains(second)) {
      return Err(new ComponentRangeError('second', false));
    }

    return Ok(
      this.__from_hms_nanos_unchecked(
        hour.into(u8),
        minute.into(u8),
        second.into(u8),
        u32(0)
      )
    );
  }

  public static from_hms_milli(
    hour: int,
    minute: int,
    second: int,
    millisecond: int
  ): Result<TimeImpl, ComponentRangeError> {
    hour = u8(hour);
    minute = u8(minute);
    second = u8(second);
    millisecond = u16(millisecond);

    // do checks with hms, propagating
    const check = this.from_hms(hour, minute, second);
    if (check.is_err()) {
      return check;
    }

    if (!Range<u16>(u16(0), u16(1_000)).contains(second)) {
      return Err(new ComponentRangeError('millisecond', false));
    }

    return Ok(
      this.__from_hms_nanos_unchecked(
        hour.into(u8),
        minute.into(u8),
        second.into(u8),
        millisecond.into(u32).mul(1_000_000)
      )
    );
  }

  public static from_hms_micro(
    hour: int,
    minute: int,
    second: int,
    microsecond: int
  ): Result<TimeImpl, ComponentRangeError> {
    hour = u8(hour);
    minute = u8(minute);
    second = u8(second);
    microsecond = u32(microsecond);

    // do checks with hms, propagating
    const check = this.from_hms(hour, minute, second);
    if (check.is_err()) {
      return check;
    }

    if (!Range<u32>(u32(0), u32(1_000_000)).contains(second)) {
      return Err(new ComponentRangeError('microsecond', false));
    }

    return Ok(
      this.__from_hms_nanos_unchecked(
        hour.into(u8),
        minute.into(u8),
        second.into(u8),
        microsecond.into(u32).mul(1_000)
      )
    );
  }

  public static from_hms_nano(
    hour: int,
    minute: int,
    second: int,
    nanosecond: int
  ): Result<TimeImpl, ComponentRangeError> {
    hour = u8(hour);
    minute = u8(minute);
    second = u8(second);
    nanosecond = u32(nanosecond);

    // do checks with hms, propagating
    const check = this.from_hms(hour, minute, second);
    if (check.is_err()) {
      return check;
    }

    if (!Range<u32>(u32(0), u32(1_000_000_000)).contains(second)) {
      return Err(new ComponentRangeError('nanosecond', false));
    }

    return Ok(
      this.__from_hms_nanos_unchecked(
        hour.into(u8),
        minute.into(u8),
        second.into(u8),
        nanosecond.into(u32)
      )
    );
  }

  public as_hms(): tuple<[u8, u8, u8]> {
    return tuple([this.h, this.m, this.s]);
  }

  public as_hms_milli(): tuple<[u8, u8, u8, u16]> {
    return tuple([this.h, this.m, this.s, this.n.div(1_000_000).into(u16)]);
  }

  public as_hms_micro(): tuple<[u8, u8, u8, u32]> {
    return tuple([this.h, this.m, this.s, this.n.div(1_000)]);
  }

  public as_hms_nano(): tuple<[u8, u8, u8, u32]> {
    return tuple([this.h, this.m, this.s, this.n]);
  }

  public hour(): u8 {
    return this.h;
  }

  public minute(): u8 {
    return this.m;
  }

  public second(): u8 {
    return this.s;
  }

  public millisecond(): u16 {
    return this.n.div(1_000_000).into(u16);
  }

  public microsecond(): u32 {
    return this.n.div(1_000);
  }

  public nanosecond(): u32 {
    return this.n;
  }

  // safety: 0 is always a valid component.
  public static readonly midnight = this.from_hms_nano(0, 0, 0, 0).unwrap_unchecked();
}

export type Time = TimeImpl;
export const Time = staticify(TimeImpl);