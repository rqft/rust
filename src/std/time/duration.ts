import { staticify } from '../../tools';
import type { Clone } from '../clone';
import type { Debug } from '../fmt';
import { f64, u128, u32, u64 } from '../number/index';
import type { int } from '../number/size';
import type {
  Add,
  AddAssign,
  Assign,
  Div,
  DivAssign,
  Mul,
  MulAssign,
  Sub,
  SubAssign,
} from '../ops/index';
import type { Option } from '../option';
import { None, Some } from '../option';
import { panic } from '../panic';

class DurationImpl
implements
    Add<Duration>,
    AddAssign<Duration>,
    Sub<Duration>,
    SubAssign<Duration>,
    Mul<int, Duration>,
    MulAssign<int, Duration>,
    Div<int, Duration>,
    DivAssign<int, Duration>,
    Clone<Duration>,
    Assign<Duration>,
    Debug
{
  private readonly secs: u64;
  private readonly nanos: u32;
  private static readonly nanos_per_sec: u32 = u32(1_000_000_000);
  private static readonly nanos_per_milli: u32 = u32(1_000_000);
  private static readonly nanos_per_micro: u32 = u32(1_000);
  private static readonly millis_per_sec: u64 = u64(1_000);
  private static readonly micros_per_sec: u64 = u64(1_000_000);
  public static readonly max: Duration = new this(
    (1n << 63n) - 1n,
    this.nanos_per_sec
  );
  public static readonly zero: Duration = new this(0, 0);

  public static readonly second: Duration = DurationImpl.from_secs(1);
  public static readonly millisecond: Duration = DurationImpl.from_millis(1);
  public static readonly microsecond: Duration = DurationImpl.from_micros(1);
  public static readonly nanosecond: Duration = DurationImpl.from_nanos(1);
  constructor(secs: int, nanos: int) {
    this.secs = u64(secs);
    this.nanos = u32(nanos);

    if (this.nanos.gt(1_000_000_000n)) {
      this.secs.add_assign(this.nanos.div(1_000_000_000n));
      this.nanos.rem_assign(1_000_000_000n);
    }

    if (this.secs.gt((1n << 63n) - 1n)) {
      panic('overflowed past u64 bound');
    }
  }

  public fmt_debug(): string {
    return (
      this.as_secs().fmt_debug() + 's' + this.subsec_nanos().fmt_debug() + 'ns'
    );
  }

  public static new(secs: int, nanos: int): DurationImpl {
    return new this(secs, nanos);
  }

  public static from_secs(secs: int): DurationImpl {
    return new this(secs, 0);
  }

  public static from_millis(millis: int): DurationImpl {
    millis = u64(millis);
    return new this(
      millis.div(this.millis_per_sec),
      millis.rem(this.millis_per_sec).into(u32).mul(this.nanos_per_milli)
    );
  }

  public static from_micros(micros: int): DurationImpl {
    micros = u64(micros);
    return new this(
      micros.div(this.micros_per_sec),
      micros.rem(this.micros_per_sec).into(u32).mul(this.nanos_per_micro)
    );
  }

  public static from_nanos(nanos: int): DurationImpl {
    nanos = u64(nanos);
    return new this(
      nanos.div(this.nanos_per_sec),
      nanos.rem(this.nanos_per_sec).into(u32)
    );
  }

  //

  public is_zero(): boolean {
    return this.secs.eq(0) && this.nanos.eq(0);
  }

  public as_secs(): u64 {
    return this.secs;
  }

  public subsec_millis(): u32 {
    return this.nanos.div(DurationImpl.nanos_per_milli);
  }

  public subsec_micros(): u32 {
    return this.nanos.div(DurationImpl.nanos_per_micro);
  }

  public subsec_nanos(): u32 {
    return this.nanos;
  }

  public as_millis(): u128 {
    return this.secs
      .into(u128)
      .mul(DurationImpl.millis_per_sec)
      .add(this.nanos.div(DurationImpl.nanos_per_milli))
      .into(u128);
  }

  public as_micros(): u128 {
    return this.secs
      .into(u128)
      .mul(DurationImpl.micros_per_sec)
      .add(this.nanos.div(DurationImpl.nanos_per_micro))
      .into(u128);
  }

  public as_nanos(): u128 {
    return this.secs
      .into(u128)
      .mul(DurationImpl.nanos_per_sec)
      .add(this.nanos)
      .into(u128);
  }

  public checked_add(rhs: Duration): Option<Duration> {
    const secs_option = this.secs.checked_add(rhs.secs);

    if (secs_option.is_some()) {
      let secs = secs_option.unwrap();
      const nanos = this.nanos.add(rhs.nanos);
      if (nanos.ge(DurationImpl.nanos_per_sec)) {
        nanos.sub_assign(DurationImpl.nanos_per_sec);
        const new_secs = secs.checked_add(1);
        if (new_secs.is_some()) {
          secs = new_secs.unwrap();
        } else {
          return None;
        }
      }

      return Some(Duration(secs, nanos));
    } else {
      return None;
    }
  }

  public saturating_add(rhs: Duration): Duration {
    const value = this.checked_add(rhs);
    if (value.is_some()) {
      return value.unwrap();
    }

    return DurationImpl.max;
  }

  public checked_sub(rhs: Duration): Option<Duration> {
    const secs_option = this.secs.checked_sub(rhs.secs);

    if (secs_option.is_some()) {
      let secs = secs_option.unwrap();
      const sub_secs = secs.checked_sub(1);
      if (sub_secs.is_some()) {
        secs = sub_secs.unwrap();
        const nanos = this.nanos.add(DurationImpl.nanos_per_sec).sub(rhs.nanos);
        return Some(Duration(secs, nanos));
      }
    }

    return None;
  }

  public saturating_sub(rhs: Duration): Duration {
    const value = this.checked_sub(rhs);
    if (value.is_some()) {
      return value.unwrap();
    }

    return DurationImpl.zero;
  }

  public checked_mul(rhs: int): Option<DurationImpl> {
    const total_nanos = this.nanos.into(u64).mul(u64(rhs));
    const extra_secs = total_nanos.div(DurationImpl.nanos_per_sec.into(u64));
    const nanos = total_nanos
      .rem(DurationImpl.nanos_per_sec.into(u64))
      .into(u32);

    const opt = this.secs.checked_mul(u64(rhs));

    if (opt.is_some()) {
      const raw = opt.unwrap();

      if (raw.checked_add(extra_secs).is_some()) {
        return Some(Duration(raw, nanos));
      }
    }

    return None;
  }

  public saturating_mul(rhs: int): DurationImpl {
    const value = this.checked_mul(rhs);

    if (value.is_some()) {
      return value.unwrap();
    }

    return DurationImpl.max;
  }

  public checked_div(rhs: int): Option<Duration> {
    if (u32(rhs).ne(0)) {
      rhs = u64(rhs);
      const secs = this.secs.div(rhs.into(u64));
      const carry = this.secs.sub(secs).mul(rhs.into(u64));
      const extra_nanos = carry
        .mul(DurationImpl.nanos_per_sec.into(u64))
        .div(rhs.into(u64));
      const nanos = this.nanos.div(rhs.into(u32)).add(extra_nanos.into(u32));

      return Some(DurationImpl.new(secs, nanos));
    } else {
      return None;
    }
  }

  public as_secs_f64(): f64 {
    return this.secs
      .into(f64)
      .add(this.nanos.into(f64).div(DurationImpl.nanos_per_sec.into(f64)));
  }

  // as_secs_f32, from_secs_f64, from_secs_f32, mul_f64, mul_f32, div_f64, div_f32, div_duration_f64, div_duration_f32

  public assign(other: DurationImpl): this {
    this.secs.assign(other.secs);
    this.nanos.assign(other.nanos);
    return this;
  }

  public add(other: DurationImpl): DurationImpl {
    return this.checked_add(other).expect('overflow when adding durations');
  }

  public add_assign(other: DurationImpl): DurationImpl {
    return this.assign(this.add(other));
  }

  public sub(other: DurationImpl): DurationImpl {
    return this.checked_sub(other).expect(
      'overflow when subtracting durations'
    );
  }

  public sub_assign(other: DurationImpl): DurationImpl {
    return this.assign(this.sub(other));
  }

  public clone(): DurationImpl {
    return DurationImpl.new(this.secs, this.nanos);
  }

  public div(other: int): DurationImpl {
    return this.checked_div(other).expect(
      'overflow when dividing duration by scalar'
    );
  }

  public div_assign(other: int): DurationImpl {
    return this.assign(this.div(other));
  }

  public mul(other: int): DurationImpl {
    return this.checked_mul(other).expect(
      'overflow when multiplying duration by scalar'
    );
  }

  public mul_assign(other: int): DurationImpl {
    return this.assign(this.mul(other));
  }
}

export type Duration = DurationImpl;
export const Duration = staticify(DurationImpl);
