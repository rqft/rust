import { staticify } from '../../tools';
// import type { bool } from '../bool';
import type { Ordering } from '../cmp';
import type { _ } from '../custom';
import type { Option } from '../option';
import { panic } from '../panic';
import { SizeImpl } from './size';

// @ts-expect-error ts(2714)
export class IntSizedImpl<T extends IntSizedImpl<_>> extends SizeImpl {
  public readonly umin: bigint;
  public readonly umax: bigint;

  public get bound(): [bigint, bigint] {
    return [this.umin, this.umax];
  }

  constructor(value: _, private bits: bigint, private unsigned: boolean) {
    super(value);
    if (unsigned) {
      this.umin = 0n;
      this.umax = (1n << bits) - 1n;
    } else {
      this.umin = -(1n << bits);
      this.umax = (1n << bits) - 1n;
    }

    const n = unsigned ? 'u' : 'i';

    if (this.valueOf() < this.umin || this.valueOf() > this.umax) {
      panic(
        `the literal \`${value}${n}${bits}\` does not fit into the type \`${n}${bits}\` whose range is \`${this.umin}..=${this.umax}\``
      );
    }
  }

  public static new<T extends IntSizedImpl<_>>(
    value: _,
    bits: bigint,
    unsigned: boolean
  ): IntSizedImpl<T> {
    return new this(value, bits, unsigned);
  }

  private fit(v: _): T {
    return new IntSizedImpl(v, this.bits, this.unsigned) as never;
  }

  public abs(): T {
    return this.fit(super.abs(this.umax));
  }

  public abs_diff(other: io<T>): T {
    return this.fit(super.abs_diff(other, this.umax));
  }

  public add(other: io<T>): T {
    return this.fit(super.add(other));
  }

  public add_assign(other: io<T>): T {
    return this.fit(super.add_assign(other));
  }

  public as_primitive(): bigint {
    return super.as_primitive();
  }

  public bitand(other: io<T>): T {
    return this.fit(super.bitand(other));
  }

  public bitand_assign(other: io<T>): T {
    return this.fit(super.bitand_assign(other));
  }

  public bitor(other: io<T>): T {
    return this.fit(super.bitor(other));
  }

  public bitor_assign(other: io<T>): T {
    return this.fit(super.bitor_assign(other));
  }

  public bitxor(other: io<T>): T {
    return this.fit(super.bitxor(other));
  }

  public bitxor_assign(other: io<T>): T {
    return this.fit(super.bitxor_assign(other));
  }

  public clamp(min: io<T>, max: io<T>): T {
    return this.fit(super.clamp(min, max));
  }

  public clone(): IntSizedImpl<T> {
    return new IntSizedImpl(this.value, this.bits, this.unsigned);
  }

  public count_ones(): T {
    return this.fit(super.count_ones(this.bits));
  }

  public count_zeros(): T {
    return this.fit(super.count_zeros(this.bits));
  }

  public div(other: io<T>): T {
    return this.fit(super.div(other));
  }

  public div_assign(other: io<T>): T {
    return this.fit(super.div_assign(other));
  }

  public eq(other: io<T>): boolean {
    return super.eq(other);
  }

  public ge(other: io<T>): boolean {
    return super.ge(other);
  }

  public gt(other: io<T>): boolean {
    return super.gt(other);
  }

  public le(other: io<T>): boolean {
    return super.le(other);
  }

  public lt(other: io<T>): boolean {
    return super.lt(other);
  }

  public leading_ones(): T {
    return this.fit(super.leading_ones(this.bits));
  }

  public leading_zeros(): T {
    return this.fit(super.leading_zeros(this.bits));
  }

  public trailing_ones(): T {
    return this.fit(super.trailing_ones(this.bits));
  }

  public trailing_zeros(): T {
    return this.fit(super.trailing_zeros(this.bits));
  }

  protected map(f: (x: bigint) => bigint): this {
    return super.map(f);
  }

  public max(other: T): T {
    return this.fit(super.max(other));
  }

  public min(other: T): T {
    return this.fit(super.max(other));
  }

  public mul(other: io<T>): T {
    return this.fit(super.mul(other));
  }

  public mul_assign(other: io<T>): T {
    return this.fit(super.mul_assign(other));
  }

  protected n_bit_mask(n: io<T>): T {
    return this.fit(super.n_bit_mask(n));
  }

  public ne(other: io<T>): boolean {
    return super.ne(other);
  }

  public neg(): T {
    return this.fit(super.neg());
  }

  public next_multiple_of(rhs: io<T>): T {
    return this.fit(super.next_multiple_of(rhs, [this.umin, this.umax]));
  }

  public not(): T {
    return this.fit(super.not());
  }

  public pow(exp: io<T>): T {
    return this.fit(super.pow(exp, this.bound));
  }

  public rem(other: io<T>): T {
    return this.fit(super.rem(other));
  }

  public rem_assign(other: io<T>): T {
    return this.fit(super.rem_assign(other));
  }

  public reverse_bits(): T {
    return this.fit(super.reverse_bits(this.bits));
  }

  public rotate_left(n?: io<T>): T {
    return this.fit(super.rotate_left(n, this.bits));
  }

  public rotate_right(n?: io<T>): T {
    return this.fit(super.rotate_right(n, this.bits));
  }

  protected saturate(value: T): T {
    return this.fit(super.saturate(value, this.bound));
  }

  public saturating_add(rhs: io<T>): T {
    return this.fit(super.saturating_add(rhs, this.bound));
  }

  public saturating_div(rhs: io<T>): T {
    return this.fit(super.saturating_add(rhs, this.bound));
  }

  public saturating_mul(rhs: io<T>): T {
    return this.fit(super.saturating_add(rhs, this.bound));
  }

  public saturating_neg(): T {
    return this.fit(super.saturating_neg(this.bound));
  }

  public saturating_op(
    rhs: io<T>,
    x: (self: bigint, rhs: bigint) => bigint
  ): T {
    return this.fit(super.saturating_op(rhs, x, this.bound));
  }

  public saturating_pow(rhs: io<T>): T {
    return this.fit(super.saturating_pow(rhs, this.bound));
  }

  public saturating_sub(rhs: io<T>): T {
    return this.fit(super.saturating_sub(rhs, this.bound));
  }

  public shl(other: io<T>): T {
    return this.fit(super.shl(other));
  }

  public shl_assign(other: io<T>): T {
    return this.fit(super.shl_assign(other));
  }

  public shr(other: io<T>): T {
    return this.fit(super.shr(other));
  }

  public shr_assign(other: io<T>): T {
    return this.fit(super.shr_assign(other));
  }

  public signum(): T {
    return this.fit(super.signum());
  }

  public sub(other: io<T>): T {
    return this.fit(super.sub(other));
  }

  public sub_assign(other: io<T>): T {
    return this.fit(super.sub_assign(other));
  }

  public swap_bytes(): T {
    return this.fit(super.swap_bytes(this.bits));
  }

  public unchecked_abs(): T {
    return super.unchecked_abs() as T;
  }

  public unchecked_add(rhs: io<T>): T {
    return super.unchecked_add(rhs) as T;
  }

  public unchecked_mul(rhs: io<T>): T {
    return super.unchecked_mul(rhs) as T;
  }

  public unchecked_neg(): T {
    return super.unchecked_neg() as T;
  }

  public unchecked_op(rhs: io<T>, x: (self: bigint, rhs: bigint) => bigint): T {
    return super.unchecked_op(rhs, x) as T;
  }

  public unchecked_pow(rhs: io<T>): T {
    return super.unchecked_pow(rhs) as T;
  }

  public unchecked_shl(rhs: io<T>): T {
    return super.unchecked_shl(rhs) as T;
  }

  public unchecked_shr(rhs: io<T>): T {
    return super.unchecked_shr(rhs) as T;
  }

  public unchecked_sub(rhs: io<T>): T {
    return super.unchecked_sub(rhs) as T;
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public valueOf(): bigint {
    return this.value;
  }

  protected wrapping(value: T): T {
    return this.fit(super.wrapping(value, this.bound));
  }

  public wrapping_abs(): T {
    return this.fit(super.wrapping_abs(this.bound));
  }

  public wrapping_add(rhs: io<T>): T {
    return this.fit(super.wrapping_add(rhs, this.bound));
  }

  public wrapping_div(rhs: io<T>): T {
    return this.fit(super.wrapping_div(rhs, this.bound));
  }

  public wrapping_mul(rhs: io<T>): T {
    return this.fit(super.wrapping_mul(rhs, this.bound));
  }

  public wrapping_neg(): T {
    return this.fit(super.wrapping_neg(this.bound));
  }

  protected wrapping_op(
    rhs: io<T>,
    x: (self: bigint, rhs: bigint) => bigint
  ): T {
    return this.fit(super.wrapping_op(rhs, x, this.bound));
  }

  public wrapping_pow(rhs: io<T>): T {
    return this.fit(super.wrapping_pow(rhs, this.bound));
  }

  public wrapping_rem(rhs: io<T>): T {
    return this.fit(super.wrapping_rem(rhs, this.bound));
  }

  public wrapping_sub(rhs: io<T>): T {
    return this.fit(super.wrapping_sub(rhs, this.bound));
  }

  protected checked(value: SizeImpl): Option<T> {
    return super.checked(value, this.bound).map((x) => this.fit(x));
  }

  public checked_abs(): Option<T> {
    return super.checked_abs().map((x) => this.fit(x));
  }

  public checked_add(rhs: io<T>): Option<T> {
    return super.checked_add(rhs).map((x) => this.fit(x));
  }

  public checked_div(rhs: io<T>): Option<T> {
    return super.checked_div(rhs).map((x) => this.fit(x));
  }

  public checked_mul(rhs: io<T>): Option<T> {
    return super.checked_mul(rhs).map((x) => this.fit(x));
  }

  public checked_neg(): Option<T> {
    return super.checked_neg().map((x) => this.fit(x));
  }

  public checked_next_multiple_of(rhs: io<T>): Option<T> {
    return super
      .checked_next_multiple_of(rhs, this.bound)
      .map((x) => this.fit(x));
  }

  protected checked_op(
    rhs: io<T>,
    x: (self: bigint, rhs: bigint) => bigint
  ): Option<T> {
    return super.checked_op(rhs, x, this.bound).map((x) => this.fit(x));
  }

  public checked_pow(rhs: io<T>): Option<T> {
    return super.checked_pow(rhs, this.bound).map((x) => this.fit(x));
  }

  public checked_rem(rhs: io<T>): Option<T> {
    return super.checked_rem(rhs, this.bound).map((x) => this.fit(x));
  }

  public checked_shl(rhs: io<T>): Option<T> {
    return super.checked_shl(rhs, this.bits).map((x) => this.fit(x));
  }

  public checked_shr(rhs: io<T>): Option<T> {
    return super.checked_shr(rhs, this.bits).map((x) => this.fit(x));
  }

  public checked_sub(rhs: io<T>): Option<T> {
    return super.checked_sub(rhs, this.bound).map((x) => this.fit(x));
  }

  public cmp(other: T): Ordering {
    return super.cmp(other);
  }

  public partial_cmp(other: io<T>): Ordering {
    return super.partial_cmp(other);
  }

  public is_negative(): boolean {
    return super.is_negative();
  }

  public is_positive(): boolean {
    return super.is_positive();
  }

  protected overflowing(value: T): [T, boolean] {
    const [p, b] = super.overflowing(value, this.bound);

    return [this.fit(p), b];
  }

  private fix_overflow(v: [SizeImpl, boolean]): [T, boolean] {
    return [this.fit(v[0]), v[1]];
  }

  public overflowing_abs(): [T, boolean] {
    return this.fix_overflow(super.overflowing_abs(this.bound));
  }

  public overflowing_add(rhs: io<T>): [T, boolean] {
    return this.fix_overflow(super.overflowing_add(rhs, this.bound));
  }

  public overflowing_div(rhs: io<T>): [T, boolean] {
    return this.fix_overflow(super.overflowing_add(rhs, this.bound));
  }

  public overflowing_mul(rhs: io<T>): [T, boolean] {
    return this.fix_overflow(super.overflowing_add(rhs, this.bound));
  }

  public overflowing_neg(): [T, boolean] {
    return this.fix_overflow(super.overflowing_neg(this.bound));
  }

  public overflowing_op(
    rhs: io<T>,
    x: (self: bigint, rhs: bigint) => bigint
  ): [T, boolean] {
    return this.fix_overflow(super.overflowing_op(rhs, x, this.bound));
  }

  public overflowing_pow(rhs: io<T>): [T, boolean] {
    return this.fix_overflow(super.overflowing_pow(rhs, this.bound));
  }

  public overflowing_rem(rhs: io<T>): [T, boolean] {
    return this.fix_overflow(super.overflowing_rem(rhs, this.bound));
  }

  public overflowing_sub(rhs: io<T>): [T, boolean] {
    return this.fix_overflow(super.overflowing_sub(rhs, this.bound));
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type int_sized<T extends IntSizedImpl<_>> = IntSizedImpl<T>;
export const int_sized = staticify(IntSizedImpl);

// eslint-disable-next-line @typescript-eslint/naming-convention
export type io<T extends IntSizedImpl<_>> = T | bigint | number;
