import { staticify } from '../../tools';
// import { bool } from '../bool';
import type { Clone } from '../clone';
import type { Eq, Ord, PartialEq, PartialOrd } from '../cmp';
import { Ordering, default_partial_ord } from '../cmp';
import type { Cast, Into } from '../convert';
import type { _ } from '../custom';
import type {
  Binary,
  Debug,
  Display,
  LowerExp,
  LowerHex,
  Octal,
  Precision,
  Signed,
  UpperExp,
  UpperHex,
} from '../fmt';
import type {
  Add,
  AddAssign,
  Assign,
  BitAnd,
  BitAndAssign,
  BitOr,
  BitOrAssign,
  BitXor,
  BitXorAssign,
  Div,
  DivAssign,
  Mul,
  MulAssign,
  Neg,
  Not,
  Rem,
  RemAssign,
  Shl,
  ShlAssign,
  Shr,
  ShrAssign,
  Sub,
  SubAssign,
} from '../ops/index';
import type { Option } from '../option';
import { None, Some } from '../option';
import { panic } from '../panic';
import type { Result } from '../result';
import { Err, Ok } from '../result';
import { IntErrorKind } from './int_error_kind';
import { ParseIntError } from './parse_int_error';

export class SizeImpl
implements
    Add<int, size>,
    AddAssign<int, size>,
    Clone<size>,
    // Default<f64>,
    Div<int, size>,
    DivAssign<int, size>,
    Mul<int, size>,
    MulAssign<int, size>,
    Neg<size>,
    Rem<int, size>,
    RemAssign<int, size>,
    Sub<int, size>,
    SubAssign<int, size>,
    BitAnd<int, size>,
    BitAndAssign<int, size>,
    BitOr<int, size>,
    BitOrAssign<int, size>,
    BitXor<int, size>,
    BitXorAssign<int, size>,
    Not<size>,
    PartialEq<int>,
    PartialOrd<int>,
    Eq<size>,
    Ord<size>,
    Shl<int, size>,
    ShlAssign<int, size>,
    Shr<int, size>,
    ShrAssign<int, size>,
    Assign<int>,
    Into<bigint>,
    Cast,
    Binary,
    Debug,
    Display,
    LowerExp,
    LowerHex,
    Octal,
    Signed,
    UpperExp,
    UpperHex,
    Precision
{
  // From
  public value: bigint;
  constructor(value: _) {
    if (value instanceof SizeImpl) {
      value = value.value;
    }

    this.value = BigInt(value);
  }

  public assign(other: int): this {
    other = size(other);
    this.value = other.valueOf();
    return this;
  }

  public fmt_binary(): string {
    return this.value.toString(2);
  }

  public fmt_debug(): string {
    return this.value.toString();
  }

  public fmt_display(): string {
    return this.value.toLocaleString();
  }

  public fmt_lower_exp(): string {
    return this.into(Number).toExponential();
  }

  public fmt_lower_hex(): string {
    return this.value.toString(16);
  }

  public fmt_octal(): string {
    return this.value.toString(8);
  }

  public fmt_precision(precision: number): string {
    return this.into(Number).toPrecision(precision);
  }

  public fmt_signed(): '-' | '+' {
    return this.value >= 0 ? '+' : '-';
  }

  public fmt_upper_exp(): string {
    return this.fmt_lower_exp().toUpperCase();
  }

  public fmt_upper_hex(): string {
    return this.fmt_lower_hex().toUpperCase();
  }

  public cast<T>(): T {
    return this as never;
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

  public count_ones(lim: int = 32): size {
    lim = size(lim);

    let count = 0n;
    for (let i = 0n; i < lim.value; i++) {
      count += (this.value & (1n << i)) >> i;
    }

    return size(count);
  }

  public count_zeros(lim: int = 32): size {
    lim = size(lim);

    let count = 0n;
    for (let i = 0n; i < lim.value; i++) {
      if ((this.value & (1n << i)) === 0n) {
        count++;
      }
    }

    return size(count);
  }

  public leading_zeros(lim: int = 32): size {
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

  public trailing_zeros(lim: int = 32): size {
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

  public leading_ones(lim: int = 32): size {
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

  public trailing_ones(lim: int = 32): size {
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

  protected n_bit_mask(n: int): size {
    n = size(n);
    // let bits = 0n;

    // for (let i = 0n; i < n.value; i++) {
    //   bits |= 1n << i;
    // }

    // return size(bits);

    return size((1n << n.value) - 1n);
  }

  public rotate_left(n: int = 1, lim: int = 32): size {
    n = size(n);
    lim = size(lim);

    const raw = this.value & this.n_bit_mask(lim).value;

    return size((raw << n.value) | (raw >> (lim.value - n.value)));
  }

  public rotate_right(n: int = 1, lim: int = 32): size {
    n = size(n);
    lim = size(lim);

    const raw = this.value & this.n_bit_mask(lim).value;

    return size((raw >> n.value) | (raw << (lim.value - n.value)));
  }

  public swap_bytes(lim: int = 32): size {
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

  public reverse_bits(lim: int = 32): size {
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

  protected unchecked_op(
    rhs: int,
    x: (self: bigint, rhs: bigint) => bigint
  ): size {
    return size(x(this.value, size(rhs).value));
  }

  protected checked(
    value: size,
    [min, max]: Bound = [-(1n << 32n), (1n << 32n) - 1n]
  ): Option<size> {
    [min, max] = [size(min), size(max)];
    if (value.value < min.value || value.value > max.value) {
      return None;
    }

    return Some(value);
  }

  protected checked_op(
    rhs: int,
    x: (self: bigint, rhs: bigint) => bigint,
    lim?: Bound
  ): Option<size> {
    const value = this.unchecked_op(rhs, x);

    return this.checked(value, lim);
  }

  public unchecked_add(rhs: int): size {
    return this.unchecked_op(rhs, (self, rhs) => self + rhs);
  }

  public checked_add(rhs: int, lim?: Bound): Option<size> {
    return this.checked_op(rhs, (self, rhs) => self + rhs, lim);
  }

  public unchecked_sub(rhs: int): size {
    return this.unchecked_op(rhs, (self, rhs) => self - rhs);
  }

  public checked_sub(rhs: int, lim?: Bound): Option<size> {
    return this.checked_op(rhs, (self, rhs) => self - rhs, lim);
  }

  public unchecked_mul(rhs: int): size {
    return this.unchecked_op(rhs, (self, rhs) => self * rhs);
  }

  public checked_mul(rhs: int, lim?: Bound): Option<size> {
    return this.checked_op(rhs, (self, rhs) => self * rhs, lim);
  }

  public checked_div(rhs: int, lim?: Bound): Option<size> {
    rhs = size(rhs);
    if (rhs.value === 0n) {
      return None;
    }

    return this.checked_op(rhs, (self, rhs) => self / rhs, lim);
  }

  // checked_div_euclid

  public checked_rem(rhs: int, lim?: Bound): Option<size> {
    rhs = size(rhs);
    if (rhs.value === 0n) {
      return None;
    }

    return this.checked_op(rhs, (self, rhs) => self % rhs, lim);
  }

  // checked_rem_euclid

  protected unchecked_neg(): size {
    return this.unchecked_op(0n, (self) => -self);
  }

  public checked_neg(lim?: Bound): Option<size> {
    return this.checked(this.unchecked_neg(), lim);
  }

  public unchecked_shl(rhs: int): size {
    return this.unchecked_op(rhs, (self, rhs) => self << rhs);
  }

  public checked_shl(rhs: int, bits: int = 32): Option<size> {
    rhs = size(rhs);
    bits = size(bits);

    if (rhs.value >= bits.value) {
      return None;
    }

    return Some(
      size(this.n_bit_mask(bits).value & this.unchecked_shl(rhs.value).value)
    );
  }

  public unchecked_shr(rhs: int): size {
    return this.unchecked_op(rhs, (self, rhs) => self >> rhs);
  }

  public checked_shr(rhs: int, bits: int = 32): Option<size> {
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
    [min, max]: Bound = [-(1n << 32n), (1n << 32n) - 1n]
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

  public unchecked_pow(rhs: int): size {
    return this.unchecked_op(rhs, (self, rhs) => self ** rhs);
  }

  public checked_pow(rhs: int, lim?: Bound): Option<size> {
    return this.checked(this.unchecked_pow(rhs), lim);
  }

  protected saturate(
    value: size,
    [min, max]: Bound = [-(1n << 32n), (1n << 32n) - 1n]
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

  protected saturating_op(
    rhs: int,
    x: (self: bigint, rhs: bigint) => bigint,
    lim?: Bound
  ): size {
    return this.saturate(this.unchecked_op(rhs, x), lim);
  }

  public saturating_add(rhs: int, lim?: Bound): size {
    return this.saturate(this.unchecked_add(rhs), lim);
  }

  public saturating_sub(rhs: int, lim?: Bound): size {
    return this.saturate(this.unchecked_sub(rhs), lim);
  }

  public saturating_neg(lim?: Bound): size {
    return this.saturate(this.unchecked_neg(), lim);
  }

  public saturating_mul(rhs: int, lim?: Bound): size {
    return this.saturate(this.unchecked_mul(rhs), lim);
  }

  public saturating_div(rhs: int, lim?: Bound): size {
    return this.saturating_op(rhs, (self, rhs) => self / rhs, lim);
  }

  public saturating_pow(exp: int, lim?: Bound): size {
    return this.saturate(this.unchecked_pow(exp), lim);
  }

  protected wrapping(
    value: size,
    [min, max]: Bound = [-(1n << 32n), (1n << 32n) - 1n]
  ): size {
    let p = value.value;

    while (p > size(max).value) {
      p = size(min).value + (size(max).value - p);
    }

    while (p < size(min).value) {
      p = size(max).value - (size(min).value + p);
    }

    return size(p);
  }

  protected wrapping_op(
    rhs: int,
    x: (self: bigint, rhs: bigint) => bigint,
    lim?: Bound
  ): size {
    return this.wrapping(this.unchecked_op(rhs, x), lim);
  }

  public wrapping_add(rhs: int, lim?: Bound): size {
    return this.wrapping(this.unchecked_add(rhs), lim);
  }

  public wrapping_sub(rhs: int, lim?: Bound): size {
    return this.wrapping(this.unchecked_sub(rhs), lim);
  }

  public wrapping_mul(rhs: int, lim?: Bound): size {
    return this.wrapping(this.unchecked_mul(rhs), lim);
  }

  public wrapping_div(rhs: int, lim?: Bound): size {
    return this.wrapping_op(rhs, (x, rhs) => x / rhs, lim);
  }

  // wrapping_div_euclid

  public wrapping_rem(rhs: int, lim?: Bound): size {
    return this.wrapping_op(rhs, (x, rhs) => x % rhs, lim);
  }

  // wrapping_rem_euclid

  public wrapping_neg(lim?: Bound): size {
    return this.wrapping(this.unchecked_neg(), lim);
  }

  // wrapping_shl, wrapping_shr

  public wrapping_abs(lim?: Bound): size {
    return this.wrapping(this.unchecked_abs(), lim);
  }

  public wrapping_pow(rhs: int, lim?: Bound): size {
    return this.wrapping(this.unchecked_pow(rhs), lim);
  }

  protected overflowing(value: size, lim?: Bound): [size, boolean] {
    const wrapped = this.wrapping(value, lim);

    if (wrapped.value !== value.value) {
      return [wrapped, true];
    }

    return [value, false];
  }

  protected overflowing_op(
    rhs: int,
    x: (self: bigint, rhs: bigint) => bigint,
    lim?: Bound
  ): [size, boolean] {
    return this.overflowing(this.unchecked_op(rhs, x), lim);
  }

  public overflowing_add(rhs: int, lim?: Bound): [size, boolean] {
    return this.overflowing(this.unchecked_add(rhs), lim);
  }

  public overflowing_sub(rhs: int, lim?: Bound): [size, boolean] {
    return this.overflowing(this.unchecked_sub(rhs), lim);
  }

  public overflowing_mul(rhs: int, lim?: Bound): [size, boolean] {
    return this.overflowing(this.unchecked_mul(rhs), lim);
  }

  public overflowing_div(rhs: int, lim?: Bound): [size, boolean] {
    return this.overflowing_op(rhs, (self, rhs) => self / rhs, lim);
  }

  // overflowing_div_euclid

  public overflowing_rem(rhs: int, lim?: Bound): [size, boolean] {
    return this.overflowing_op(rhs, (self, rhs) => self % rhs, lim);
  }

  // overflowing_rem_euclid

  public overflowing_neg(lim?: Bound): [size, boolean] {
    return this.overflowing(this.unchecked_neg(), lim);
  }

  // overflowing_shl, overflowing_shr

  public overflowing_abs(lim?: Bound): [size, boolean] {
    return this.overflowing(this.unchecked_abs(), lim);
  }

  public overflowing_pow(exp: int, lim?: Bound): [size, boolean] {
    return this.overflowing(this.unchecked_pow(exp), lim);
  }

  // raw

  public pow(exp: int, lim?: Bound): size {
    return this.checked_pow(exp, lim).unwrap();
  }

  // div_euclid

  // rem_euclid, div_floor, div_ceil

  public next_multiple_of(rhs: int, lim?: Bound): size {
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

  public checked_next_multiple_of(rhs: int, lim?: Bound): Option<size> {
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

  // ilog, ilog2, ilog10, checked_ilog, checked_ilog2, checked_ilog10

  public abs(max: int = 1n << (31n - 1n)): size {
    if (this.value < 0n) {
      const abs = -this.value;

      if (abs > size(max).value) {
        panic('method `abs` overflowed past the maximum');
      }

      return size(abs);
    }

    return this;
  }

  public abs_diff(other: int, max?: int): size {
    return this.unchecked_sub(other).abs(max);
  }

  public signum(): size {
    if (this.value === 0n) {
      return this;
    }

    if (this.value < 0n) {
      return size(-1);
    }

    return size(1);
  }

  public is_positive(): boolean {
    return this.value > 0;
  }

  public is_negative(): boolean {
    return this.value < 0;
  }

  protected map(f: (x: bigint) => bigint): this {
    this.value = f(this.value);
    return this;
  }

  public into<T>(f: (x: bigint) => T): T {
    return f(this.value);
  }

  // std::ops

  public add(other: int): size {
    return size(this.valueOf() + size(other).valueOf());
  }

  public add_assign(other: int): size {
    return this.map(() => this.add(other).valueOf());
  }

  public clone(): size {
    return size(this);
  }

  public static default(): size {
    return size(0);
  }

  public div(other: int): size {
    return size(this.valueOf() / size(other).valueOf());
  }

  public div_assign(other: int): size {
    return this.map(() => this.div(other).valueOf());
  }

  public mul(other: int): size {
    return size(this.valueOf() * size(other).valueOf());
  }

  public mul_assign(other: int): size {
    return this.map(() => this.mul(other).valueOf());
  }

  public neg(): size {
    return this.map((x) => -x);
  }

  public rem(other: int): size {
    return size(this.valueOf() % size(other).valueOf());
  }

  public rem_assign(other: int): size {
    return this.map(() => this.rem(other).valueOf());
  }

  public sub(other: int): size {
    return size(this.valueOf() - size(other).valueOf());
  }

  public sub_assign(other: int): size {
    return this.map(() => this.sub(other).valueOf());
  }

  public bitand(other: int): SizeImpl {
    return size(this.valueOf() & size(other).valueOf());
  }

  public bitand_assign(other: int): SizeImpl {
    return this.map(() => this.bitand(other).valueOf());
  }

  public bitor(other: int): SizeImpl {
    return size(this.valueOf() | size(other).valueOf());
  }

  public bitor_assign(other: int): SizeImpl {
    return this.map(() => this.bitor(other).valueOf());
  }

  public bitxor(other: int): SizeImpl {
    return size(this.valueOf() ^ size(other).valueOf());
  }

  public bitxor_assign(other: int): SizeImpl {
    return this.map(() => this.bitxor(other).valueOf());
  }

  public shl(other: int): SizeImpl {
    return size(this.valueOf() << size(other).valueOf());
  }

  public shl_assign(other: int): SizeImpl {
    return this.map(() => this.shl(other).valueOf());
  }

  public shr(other: int): SizeImpl {
    return size(this.valueOf() >> size(other).valueOf());
  }

  public shr_assign(other: int): SizeImpl {
    return this.map(() => this.shr(other).valueOf());
  }

  public eq(other: int): boolean {
    return this.value === size(other).value;
  }

  public ne(other: int): boolean {
    return !this.eq(other);
  }

  public not(): size {
    return this.map((x) => ~x);
  }

  public partial_cmp(other: int): Ordering {
    other = size(other);

    if (this.eq(other)) {
      return Ordering.Equal;
    }

    if (this.value > other.value) {
      return Ordering.Greater;
    }

    return Ordering.Less;
  }

  public ge(other: int): boolean {
    return default_partial_ord<this, int>(this).ge(other);
  }

  public gt(other: int): boolean {
    return default_partial_ord<this, int>(this).gt(other);
  }

  public le(other: int): boolean {
    return default_partial_ord<this, int>(this).le(other);
  }

  public lt(other: int): boolean {
    return default_partial_ord<this, int>(this).gt(other);
  }

  public clamp(min: int, max: int): size {
    [min, max] = [size(min), size(max)];
    if (this.lt(min)) {
      return min;
    }

    if (this.gt(max)) {
      return max;
    }

    return this;
  }

  public cmp(other: size): Ordering {
    return this.partial_cmp(other);
  }

  public max(other: size): size {
    if (this.lt(other)) {
      return other;
    }
    return this;
  }

  public min(other: size): size {
    if (this.gt(other)) {
      return other;
    }
    return this;
  }
}

/**
 * any integer type.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export type size = SizeImpl;
export const size = staticify(SizeImpl);

// eslint-disable-next-line @typescript-eslint/naming-convention
export type int = size | bigint | number;
type Bound = [int, int];
