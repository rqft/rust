import { staticify } from '../../../tools';
import { bool } from '../bool';
import type { _ } from '../custom';

class F64Impl {
  private value: number;
  constructor(value: _) {
    this.value = Number(value);
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
    return this.map((x) => x - this.trunc().value);
  }

  public abs(): this {
    return this.map(Math.abs);
  }

  public signum(): f64 {
    if (this.value < 0) {
      return new F64Impl(-1);
    }

    if (this.value === 0) {
      return new F64Impl(0);
    }

    return new F64Impl(1);
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
    return this.map((x) => x * (a as f64).value + (b as f64).value);
  }

  public div_euclid(rhs: Num): f64 {
    rhs = f64(rhs);

    const q = f64(this.value / rhs.value).trunc();

    if (this.value % rhs.value < 0) {
      if (rhs.value > 0) {
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
      return f64(r).map((x) => x + (rhs as f64).abs().value);
    }

    return f64(r);
  }

  public powi(n: Num): this {
    n = f64(n).trunc();
    return this.powf(n);
  }

  public powf(n: Num): this {
    n = f64(n);
    return this.map((x) => Math.pow(x, (n as f64).value));
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

    return f64(this.ln().value / base.ln().value);
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

    return this.map((x) => Math.hypot(x, (other as f64).value));
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
    return this.map((x) => Math.atan2((other as f64).value, x));
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
    return bool(this.value != this.value);
  }

  public is_infinity(): bool {
    return bool(this.value === Infinity || this.value === -Infinity);
  }

  public is_finite(): bool {
    return this.is_nan().bitor(this.is_infinity()).not();
  }

  // is_subnormal

  public is_normal() {
    return this.is_finite().bitand(!this.is_zero())
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type f64 = F64Impl;
export const f64 = staticify(F64Impl);

type Num = f64 | bigint | number;
