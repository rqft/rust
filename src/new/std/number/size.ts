import { staticify } from '../../../tools';
import { bool } from '../bool';
import type { _ } from '../custom';
import type { Option } from '../option';
import { None, Some } from '../option';
import { panic } from '../panic';
import type { Result } from '../result';
import { Err, Ok } from '../result';
import { IntErrorKind } from './int_error_kind';
import { ParseIntError } from './parse_int_error';

class SizeImpl {
  private value: bigint;
  constructor(value: _) {
    this.value = BigInt(value);
  }

  public static new(value: _): SizeImpl {
    return new this(value);
  }

  public as_primitive(): bigint {
    return this.value;
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public valueOf(): bigint {
    return this.value;
  }

  public static from_str(src: string): Result<size, ParseIntError> {
    if (src.length === 0) {
      return Err(ParseIntError.new(IntErrorKind.Empty));
    }

    try {
      return Ok(new this(src));
    } catch {
      return Err(ParseIntError.new(IntErrorKind.InvalidDigit));
    }
  }

  public count_ones(lim: Num = 32): size {
    lim = size(lim);

    let count = 0n;
    for (let i = 0n; i < lim.value; i++) {
      count += (this.value & (1n << i)) >> i;
    }

    return size(count);
  }

  public count_zeros(lim: Num = 32): size {
    lim = size(lim);

    let count = 0n;
    for (let i = 0n; i < lim.value; i++) {
      if ((this.value & (1n << i)) === 0n) {
        count++;
      }
    }

    return size(count);
  }

  public leading_zeros(lim: Num = 32): size {
    lim = size(lim);

    let count = 0n;
    for (let i = lim.value - 1n; i >= 0n; i--) {
      if ((this.value & (1n << i)) !== 0n) {
        break;
      }
      count++;
    }

    return size(count);
  }

  public trailing_zeros(lim: Num = 32): size {
    lim = size(lim);

    let count = 0n;
    for (let i = 0n; i < lim.value; i++) {
      if ((this.value & (1n << i)) !== 0n) {
        break;
      }
      count++;
    }

    return size(count);
  }

  public leading_ones(lim: Num = 32): size {
    lim = size(lim);

    let count = 0n;
    for (let i = lim.value - 1n; i >= 0n; i--) {
      if ((this.value & (1n << i)) !== 1n) {
        break;
      }
      count++;
    }

    return size(count);
  }

  public trailing_ones(lim: Num = 32): size {
    lim = size(lim);

    let count = 0n;
    for (let i = 0n; i < lim.value; i++) {
      if ((this.value & (1n << i)) !== 1n) {
        break;
      }
      count++;
    }

    return size(count);
  }

  private n_bit_mask(n: Num): size {
    n = size(n);
    // let bits = 0n;

    // for (let i = 0n; i < n.value; i++) {
    //   bits |= 1n << i;
    // }

    // return size(bits);

    return size((1n << n.value) - 1n);
  }

  public rotate_left(n: Num = 1, lim: Num = 32): size {
    n = size(n);
    lim = size(lim);

    const raw = this.value & this.n_bit_mask(lim).value;

    return size((raw << n.value) | (raw >> (lim.value - n.value)));
  }

  public rotate_right(n: Num = 1, lim: Num = 32): size {
    n = size(n);
    lim = size(lim);

    const raw = this.value & this.n_bit_mask(lim).value;

    return size((raw >> n.value) | (raw << (lim.value - n.value)));
  }

  public swap_bytes(lim: Num = 32): size {
    lim = size(lim);

    let raw = this.value & this.n_bit_mask(lim).value;
    let bytes = [];
    const byte = this.n_bit_mask(8n).value;

    for (let i = 0n; i < lim.value; i += 8n) {
      bytes.push(raw & byte);
      raw >>= 8n;
    }

    let bits = 0n;

    bytes = bytes.reverse();

    for (let i = 0; i < bytes.length; i++) {
      bits |= (bytes[i] || 0n) << (8n * BigInt(i));
    }

    return size(bits);
  }

  public reverse_bits(lim: Num = 32): size {
    lim = size(lim);

    const raw = this.value & this.n_bit_mask(lim).value;
    let bits = 0n;

    for (let i = 0n; i < lim.value; i++) {
      if (raw & (1n << i)) {
        bits |= 1n << (lim.value - i);
      }
    }

    return size(bits);
  }

  // from_be, from_le, to_be, to_le

  private unchecked_op(
    rhs: Num,
    x: (self: bigint, rhs: bigint) => bigint
  ): size {
    return size(x(this.value, size(rhs).value));
  }

  private checked(
    value: size,
    [min, max]: [Num, Num] = [-(1n << 32n), (1n << 32n) - 1n]
  ): Option<size> {
    [min, max] = [size(min), size(max)];
    if (value.value < min.value || value.value > max.value) {
      return None;
    }

    return Some(value);
  }

  private checked_op(
    rhs: Num,
    x: (self: bigint, rhs: bigint) => bigint,
    lim?: [Num, Num]
  ): Option<size> {
    const value = this.unchecked_op(rhs, x);

    return this.checked(value, lim);
  }

  public unchecked_add(rhs: Num): size {
    return this.unchecked_op(rhs, (self, rhs) => self + rhs);
  }

  public checked_add(rhs: Num, lim?: [Num, Num]): Option<size> {
    return this.checked_op(rhs, (self, rhs) => self + rhs, lim);
  }

  public unchecked_sub(rhs: Num): size {
    return this.unchecked_op(rhs, (self, rhs) => self - rhs);
  }

  public checked_sub(rhs: Num, lim?: [Num, Num]): Option<size> {
    return this.checked_op(rhs, (self, rhs) => self - rhs, lim);
  }

  public unchecked_mul(rhs: Num): size {
    return this.unchecked_op(rhs, (self, rhs) => self * rhs);
  }

  public checked_mul(rhs: Num, lim?: [Num, Num]): Option<size> {
    return this.checked_op(rhs, (self, rhs) => self * rhs, lim);
  }

  public checked_div(rhs: Num, lim?: [Num, Num]): Option<size> {
    rhs = size(rhs);
    if (rhs.value === 0n) {
      return None;
    }

    return this.checked_op(rhs, (self, rhs) => self / rhs, lim);
  }

  // checked_div_euclid

  public checked_rem(rhs: Num, lim?: [Num, Num]): Option<size> {
    rhs = size(rhs);
    if (rhs.value === 0n) {
      return None;
    }

    return this.checked_op(rhs, (self, rhs) => self % rhs, lim);
  }

  // checked_rem_euclid

  private unchecked_neg(): size {
    return this.unchecked_op(0n, (self) => -self);
  }

  public checked_neg(lim?: [Num, Num]): Option<size> {
    return this.checked(this.unchecked_neg(), lim);
  }

  public unchecked_shl(rhs: Num): size {
    return this.unchecked_op(rhs, (self, rhs) => self << rhs);
  }

  public checked_shl(rhs: Num, bits: Num = 32): Option<size> {
    rhs = size(rhs);
    bits = size(bits);

    if (rhs.value >= bits.value) {
      return None;
    }

    return Some(
      size(this.n_bit_mask(bits).value & this.unchecked_shl(rhs.value).value)
    );
  }

  public unchecked_shr(rhs: Num): size {
    return this.unchecked_op(rhs, (self, rhs) => self >> rhs);
  }

  public checked_shr(rhs: Num, bits: Num = 32): Option<size> {
    rhs = size(rhs);
    bits = size(bits);

    if (rhs.value >= bits.value) {
      return None;
    }

    return Some(
      size(this.n_bit_mask(bits).value & this.unchecked_shr(rhs.value).value)
    );
  }

  public unchecked_abs(): size {
    if (this.value < 0n) {
      return size(-this.value);
    }
    return this;
  }

  public checked_abs(
    [min, max]: [Num, Num] = [-(1n << 32n), (1n << 32n) - 1n]
  ): Option<size> {
    min = size(min);
    max = size(max);

    if (this.value === min.value) {
      return None;
    }

    if (this.value < 0n) {
      return this.checked_neg([min, max]);
    }

    return Some(this);
  }

  public unchecked_pow(rhs: Num): size {
    return this.unchecked_op(rhs, (self, rhs) => self ** rhs);
  }

  public checked_pow(rhs: Num, bits: Num = 32): Option<size> {
    rhs = size(rhs);
    bits = size(bits);

    if (rhs.value >= bits.value) {
      return None;
    }

    return Some(
      size(this.n_bit_mask(bits).value & this.unchecked_pow(rhs.value).value)
    );
  }

  private saturate(
    value: size,
    [min, max]: [Num, Num] = [-(1n << 32n), (1n << 32n) - 1n]
  ): size {
    [min, max] = [size(min), size(max)];
    if (value.value < min.value) {
      return min;
    }

    if (value.value > max.value) {
      return min;
    }

    return value;
  }

  private saturating_op(
    rhs: Num,
    x: (self: bigint, rhs: bigint) => bigint,
    lim?: [Num, Num]
  ): size {
    return this.saturate(this.unchecked_op(rhs, x), lim);
  }

  public saturating_add(rhs: Num, lim?: [Num, Num]): size {
    return this.saturate(this.unchecked_add(rhs), lim);
  }

  public saturating_sub(rhs: Num, lim?: [Num, Num]): size {
    return this.saturate(this.unchecked_sub(rhs), lim);
  }

  public saturating_neg(lim?: [Num, Num]): size {
    return this.saturate(this.unchecked_neg(), lim);
  }

  public saturating_mul(rhs: Num, lim?: [Num, Num]): size {
    return this.saturate(this.unchecked_mul(rhs), lim);
  }

  public saturating_div(rhs: Num, lim?: [Num, Num]): size {
    return this.saturating_op(rhs, (self, rhs) => self / rhs, lim);
  }

  public saturating_pow(exp: Num, lim?: [Num, Num]): size {
    return this.saturate(this.unchecked_pow(exp), lim);
  }

  private wrapping(
    value: size,
    [min, max]: [Num, Num] = [-(1n << 32n), (1n << 32n) - 1n]
  ): size {
    let p = value.value;

    while (p > max) {
      p = size(min).value + (size(max).value - p);
    }

    while (p < min) {
      p = size(max).value - (size(min).value + p);
    }

    return size(p);
  }

  private wrapping_op(
    rhs: Num,
    x: (self: bigint, rhs: bigint) => bigint,
    lim?: [Num, Num]
  ): size {
    return this.wrapping(this.unchecked_op(rhs, x), lim);
  }

  public wrapping_add(rhs: Num, lim?: [Num, Num]): size {
    return this.wrapping(this.unchecked_add(rhs), lim);
  }

  public wrapping_sub(rhs: Num, lim?: [Num, Num]): size {
    return this.wrapping(this.unchecked_sub(rhs), lim);
  }

  public wrapping_mul(rhs: Num, lim?: [Num, Num]): size {
    return this.wrapping(this.unchecked_mul(rhs), lim);
  }

  public wrapping_div(rhs: Num, lim?: [Num, Num]): size {
    return this.wrapping_op(rhs, (x, rhs) => x / rhs, lim);
  }

  // wrapping_div_euclid

  public wrapping_rem(rhs: Num, lim?: [Num, Num]): size {
    return this.wrapping_op(rhs, (x, rhs) => x % rhs, lim);
  }

  // wrapping_rem_euclid

  public wrapping_neg(lim?: [Num, Num]): size {
    return this.wrapping(this.unchecked_neg(), lim);
  }

  // wrapping_shl, wrapping_shr

  public wrapping_abs(lim?: [Num, Num]): size {
    return this.wrapping(this.unchecked_abs(), lim);
  }

  public wrapping_pow(rhs: Num, lim?: [Num, Num]): size {
    return this.wrapping(this.unchecked_pow(rhs), lim);
  }

  private overflowing(value: size, lim?: [Num, Num]): [size, bool] {
    const wrapped = this.wrapping(value, lim);

    if (wrapped.value !== value.value) {
      return [wrapped, bool.true];
    }

    return [value, bool.false];
  }

  private overflowing_op(
    rhs: Num,
    x: (self: bigint, rhs: bigint) => bigint,
    lim?: [Num, Num]
  ): [size, bool] {
    return this.overflowing(this.unchecked_op(rhs, x), lim);
  }

  public overflowing_add(rhs: Num, lim?: [Num, Num]): [size, bool] {
    return this.overflowing(this.unchecked_add(rhs), lim);
  }

  public overflowing_sub(rhs: Num, lim?: [Num, Num]): [size, bool] {
    return this.overflowing(this.unchecked_sub(rhs), lim);
  }

  public overflowing_mul(rhs: Num, lim?: [Num, Num]): [size, bool] {
    return this.overflowing(this.unchecked_mul(rhs), lim);
  }

  public overflowing_div(rhs: Num, lim?: [Num, Num]): [size, bool] {
    return this.overflowing_op(rhs, (self, rhs) => self / rhs, lim);
  }

  // overflowing_div_euclid

  public overflowing_rem(rhs: Num, lim?: [Num, Num]): [size, bool] {
    return this.overflowing_op(rhs, (self, rhs) => self % rhs, lim);
  }

  // overflowing_rem_euclid

  public overflowing_neg(lim?: [Num, Num]): [size, bool] {
    return this.overflowing(this.unchecked_neg(), lim);
  }

  // overflowing_shl, overflowing_shr

  public overflowing_abs(lim?: [Num, Num]): [size, bool] {
    return this.overflowing(this.unchecked_abs(), lim);
  }

  public overflowing_pow(exp: Num, lim?: [Num, Num]): [size, bool] {
    return this.overflowing(this.unchecked_pow(exp), lim);
  }

  // raw

  public pow(exp: Num, lim?: Num): size {
    return this.checked_pow(exp, lim).unwrap();
  }

  // div_euclid

  // rem_euclid, div_floor, div_ceil

  public next_multiple_of(rhs: Num, lim?: [Num, Num]): size {
    rhs = size(rhs);

    if (rhs.value === 0n) {
      panic('parameter rhs in fn `next_multiple_of` cannot be 0');
    }

    for (let i = this.value; ; i++) {
      if (rhs.value % i === 0n) {
        return size(0n).wrapping(size(i), lim);
      }
    }
  }

  public checked_next_multiple_of(rhs: Num, lim?: [Num, Num]): Option<size> {
    rhs = size(rhs);

    if (rhs.value === 0n) {
      return None;
    }

    for (let i = this.value; ; i++) {
      if (rhs.value % i === 0n) {
        return size(0n).checked(size(i), lim);
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type size = SizeImpl;
export const size = staticify(SizeImpl);

type Num = size | bigint | number;
