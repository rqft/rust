import { staticify } from '../../../tools';
import { bool } from '../bool';
import type { Clone } from '../clone';
import type { Ord } from '../cmp';
import { default_partial_eq, default_partial_ord, Ordering } from '../cmp';
import type { _ } from '../custom';
// import type { Default } from '../default';
import type {
  Add,
  AddAssign,
  Div,
  DivAssign,
  Mul,
  MulAssign,
  Neg,
  Rem,
  RemAssign,
  Sub,
  SubAssign
} from '../ops';

class F64Impl
implements
    Ord<Num>,
    Add<Num, f64>,
    AddAssign<Num, f64>,
    Clone<f64>,
    // Default<f64>,
    Div<Num, f64>,
    DivAssign<Num, f64>,
    Mul<Num, f64>,
    MulAssign<Num, f64>,
    Neg<f64>,
    Rem<Num, f64>,
    RemAssign<Num, f64>,
    Sub<Num, f64>,
    SubAssign<Num, f64>
{
  private value: number;
  constructor(value: _) {
    this.value = Number(value);
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public valueOf(): number {
    return this.value;
  }

  public static new(value: _): F64Impl {
    return new this(value);
  }

  private map(f: (t: number) => number): this {
    this.value = f(this.value);
    return this;
  }

  public floor(): this {
    return this.map(Math.floor);
  }

  public ceil(): this {
    return this.map(Math.ceil);
  }

  public round(): this {
    return this.map(Math.round);
  }

  public trunc(): this {
    return this.map(Math.trunc);
  }

  public fract(): this {
    return this.map((x) => x - +this.trunc());
  }

  public abs(): this {
    return this.map(Math.abs);
  }

  public signum(): f64 {
    if (+this < 0) {
      return new f64(-1);
    }

    if (+this === 0) {
      return new f64(0);
    }

    return new f64(1);
  }

  public copysign(sign: Num): this {
    sign = f64(sign);

    if (this.signum() === sign.signum()) {
      return this;
    }

    this.value = -this.value;
    return this;
  }

  public mul_add(a: Num, b: Num): this {
    a = f64(a);
    b = f64(b);
    return this.map((x) => x * +(a as f64) + +(b as f64));
  }

  public div_euclid(rhs: Num): f64 {
    rhs = f64(rhs);

    const q = f64(+this / +rhs).trunc();

    if (+this % +rhs < 0) {
      if (+rhs > 0) {
        return q.map((x) => x - 1.0);
      }

      return q.map((x) => x + 1.0);
    }

    return q;
  }

  public rem_euclid(rhs: Num): f64 {
    rhs = f64(rhs);

    const r = this.value % rhs.value;

    if (r < 0.0) {
      return f64(r).map((x) => x + +(rhs as f64).abs());
    }

    return f64(r);
  }

  public powi(n: Num): this {
    n = f64(n).trunc();
    return this.powf(n);
  }

  public powf(n: Num): this {
    n = f64(n);
    return this.map((x) => Math.pow(x, +(n as f64)));
  }

  public sqrt(): this {
    if (this.value < 0) {
      return this.map(() => NaN);
    }

    return this.map(Math.sqrt);
  }

  public exp(): this {
    return this.map(Math.exp);
  }

  public exp2(): f64 {
    return f64(2).powf(this);
  }

  public ln(): f64 {
    return this.map(Math.log);
  }

  public log(base: Num): f64 {
    base = f64(base);

    return f64(+this.ln() / +base.ln());
  }

  public log2(): f64 {
    return this.log(2);
  }

  public log10(): f64 {
    return this.log(10);
  }

  public cbrt(): f64 {
    return this.powf(1 / 3);
  }

  public hypot(other: Num): this {
    other = f64(other);

    return this.map((x) => Math.hypot(x, +(other as f64)));
  }

  public sin(): this {
    return this.map(Math.sin);
  }
  public cos(): this {
    return this.map(Math.cos);
  }
  public tan(): this {
    return this.map(Math.tan);
  }

  public asin(): this {
    return this.map(Math.asin);
  }
  public acos(): this {
    return this.map(Math.acos);
  }
  public atan(): this {
    return this.map(Math.atan);
  }

  public atan2(other: Num): this {
    other = f64(other);
    return this.map((x) => Math.atan2(+(other as f64), x));
  }

  public sincos(): [f64, f64] {
    return [this.sin(), this.cos()];
  }

  public exp_m1(): this {
    return this.map(Math.expm1);
  }

  public ln1p(): this {
    return this.map(Math.log1p);
  }

  public sinh(): this {
    return this.map(Math.sinh);
  }
  public cosh(): this {
    return this.map(Math.cosh);
  }
  public tanh(): this {
    return this.map(Math.tanh);
  }

  public asinh(): this {
    return this.map(Math.asinh);
  }
  public acosh(): this {
    return this.map(Math.acosh);
  }
  public atanh(): this {
    return this.map(Math.atanh);
  }

  public static readonly radix: bigint = 2n;
  public static readonly mantissa_digits: bigint = 53n;
  public static readonly digits: bigint = 15n;
  public static readonly epsilon: f64 = new this(2.2204460492503131e-16);
  public static readonly min: f64 = new this(-1.7976931348623157e308);
  public static readonly min_positive: f64 = new this(2.2250738585072014e-308);
  public static readonly max: f64 = new this(1.7976931348623157e308);
  public static readonly min_exp: bigint = -1_021n;
  public static readonly max_exp: bigint = 1_024n;
  public static readonly min_10_exp: bigint = -307n;
  public static readonly max_10_exp: bigint = 308n;
  public static readonly nan: f64 = new this(NaN);
  public static readonly infinity: f64 = new this(Infinity);
  public static readonly neg_infinity: f64 = new this(-Infinity);

  public is_nan(): bool {
    return bool(+this != +this);
  }

  public is_infinity(): bool {
    return bool(+this === Infinity || +this === -Infinity);
  }

  public is_finite(): bool {
    return this.is_nan().bitor(this.is_infinity()).not();
  }

  // is_subnormal

  public is_normal(): bool {
    return this.is_finite().bitand(this.value !== 0);
  }

  // classify

  public is_sign_positive(): bool {
    return bool(this.value > 0);
  }

  public is_sign_negative(): bool {
    return bool(this.value < 0);
  }

  // next_up, next_down

  public recip(): this {
    return this.map((x) => 1 / x);
  }

  public to_degrees(): this {
    return this.map((x) => x * (180 / +consts.pi));
  }

  public to_radians(): this {
    return this.map((x) => x * (+consts.pi / 180));
  }

  public maximum(other: Num): f64 {
    other = f64(other);

    if (this.is_nan().bitor(other.is_nan()).valueOf()) {
      return F64Impl.nan;
    }

    return this.max(other);
  }

  public minimum(other: Num): f64 {
    other = f64(other);

    if (this.is_nan().bitor(other.is_nan()).valueOf()) {
      return F64Impl.nan;
    }

    return this.min(other);
  }

  public total_cmp(other: Num): Ordering {
    other = f64(other);

    if (this.is_sign_negative().as_primitive()) {
      // -NaN
      if (this.is_nan().as_primitive()) {
        if (other.is_sign_negative().bitand(this.is_nan()).as_primitive()) {
          return Ordering.Equal;
        }

        return Ordering.Less;
      }

      // -∞
      if (this.is_infinity().as_primitive()) {
        if (
          other.is_sign_negative().bitand(this.is_infinity()).as_primitive()
        ) {
          return Ordering.Equal;
        }

        return Ordering.Less;
      }

      // -x
      if (other.is_sign_negative().as_primitive()) {
        return this.cmp(other);
      }
    }

    // 0
    if (this.eq(0)) {
      if (other.eq(0)) {
        return Ordering.Equal;
      }

      // +0
      return Ordering.Less;
    }

    if (other.is_infinity().as_primitive()) {
      if (this.is_infinity().as_primitive()) {
        return Ordering.Equal;
      }

      return Ordering.Less;
    }

    if (other.is_nan().as_primitive()) {
      if (this.is_nan().as_primitive()) {
        return Ordering.Equal;
      }

      return Ordering.Less;
    }

    return this.partial_cmp(other);
  }

  // PartialEq

  public eq(other: Num): boolean {
    other = f64(other);
    return +this === +other;
  }

  public ne(other: Num): boolean {
    return default_partial_eq<this, Num>(this).ne(other);
  }

  // PartialOrd

  public partial_cmp(other: Num): Ordering {
    other = f64(other);

    if (this.eq(other)) {
      return Ordering.Equal;
    }

    if (+this > +other) {
      return Ordering.Greater;
    }

    return Ordering.Less;
  }

  public ge(other: Num): boolean {
    return default_partial_ord<this, Num>(this).ge(other);
  }

  public gt(other: Num): boolean {
    return default_partial_ord<this, Num>(this).gt(other);
  }

  public le(other: Num): boolean {
    return default_partial_ord<this, Num>(this).le(other);
  }

  public lt(other: Num): boolean {
    return default_partial_ord<this, Num>(this).lt(other);
  }

  // Ord

  public clamp(min: Num, max: Num): f64 {
    if (this.lt(min)) {
      return f64(min);
    }

    if (this.gt(max)) {
      return f64(max);
    }

    return this;
  }

  public cmp(other: Num): Ordering {
    return this.partial_cmp(other);
  }

  public max(other: Num): f64 {
    if (this.lt(other)) {
      return f64(other);
    }

    return this;
  }

  public min(other: Num): f64 {
    if (this.gt(other)) {
      return f64(other);
    }

    return this;
  }

  // std::ops

  public add(other: Num): f64 {
    return f64(+this + +f64(other));
  }

  public add_assign(other: Num): F64Impl {
    return this.map(() => +this.add(other));
  }

  public clone(): f64 {
    return f64(this);
  }

  public static default(): f64 {
    return f64(0);
  }

  public div(other: Num): f64 {
    return f64(+this / +f64(other));
  }

  public div_assign(other: Num): F64Impl {
    return this.map(() => +this.div(other));
  }

  public mul(other: Num): f64 {
    return f64(+this * +f64(other));
  }

  public mul_assign(other: Num): F64Impl {
    return this.map(() => +this.mul(other));
  }

  public neg(): F64Impl {
    return this.map((x) => -x);
  }

  public rem(other: Num): F64Impl {
    return f64(+this % +f64(other));
  }

  public rem_assign(other: Num): F64Impl {
    return this.map(() => +this.rem(other));
  }

  public sub(other: Num): f64 {
    return f64(+this - +f64(other));
  }

  public sub_assign(other: Num): F64Impl {
    return this.map(() => +this.sub(other));
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type f64 = F64Impl;
export const f64 = staticify(F64Impl);

export namespace consts {
  export const pi: f64 = f64(3.141592653589793);
  export const tau: f64 = f64(6.283185307179586);
  export const frac_pi_2: f64 = f64(1.570796326794896);
  export const frac_pi_3: f64 = f64(1.047197551196597);
  export const frac_pi_4: f64 = f64(0.7853981633974483);
  export const frac_pi_6: f64 = f64(0.523598775598298);
  export const frac_pi_8: f64 = f64(0.392699081698724);
  export const frac_1_pi: f64 = f64(0.3183098861837906);
  export const frac_2_pi: f64 = f64(0.6366197723675813);
  export const frac_2_sqrt_pi: f64 = f64(1.128379167095512);
  export const sqrt_2: f64 = f64(1.414213562373095);
  export const frac_1_sqrt_2: f64 = f64(0.7071067811865475);
  export const e: f64 = f64(2.71828182845904);
  export const log2_10: f64 = f64(3.321928094887362);
  export const log2_e: f64 = f64(1.442695040888963);
  export const log10_2: f64 = f64(0.3010299956639811);
  export const log10_e: f64 = f64(0.4342944819032518);
  export const ln_2: f64 = f64(0.6931471805599453);
  export const ln_10: f64 = f64(2.302585092994045);
}

type Num = f64 | bigint | number;
