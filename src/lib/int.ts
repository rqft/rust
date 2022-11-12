import { staticify } from '../tools';
import type { Iter } from './iter';
import { iter } from './iter';
import { panic } from './macros';
import type { Result } from './result';
import { Err, Ok } from './result';
import type { Str, StrLike } from './str';
import { str } from './str';
import { Ordering, PartialComparison } from './traits';
import { vec } from './vec';

// literally impossible to type this
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function baseInt(bits: bigint, signed = false) {
  const min = signed ? -(1n << (bits - 1n)) : 0;
  const max = (signed ? 1n << (bits - 1n) : 1n << bits) - 1n;

  return class Int extends PartialComparison<Int | bigint | number> {
    public static readonly MIN = this.new(min);
    public static readonly MAX = this.new(max);
    public static readonly BITS = bits;
    public readonly value: bigint;

    constructor(value: Int | bigint | number) {
      super();
      this.value = Int.of(value);
      if (this.value > max || this.value < min) {
        panic(`Value \`${value}\` does not fit into ${min}..=${max}`);
      }
    }

    public static new(value: Int | bigint | number): Int {
      return new this(value);
    }

    public static of(value: Int | bigint | number): bigint {
      if (value instanceof this) {
        if (value.value > max || value.value < min) {
          panic(`Value \`${value.value}\` does not fit into ${min}..=${max}`);
        }

        return value.value;
      }

      value = BigInt(value);
      if (value > max || value < min) {
        panic(`Value \`${value}\` does not fit into ${min}..=${max}`);
      }

      return value;
    }

    public eq(this: this, other: Int | bigint | number): boolean {
      return this.value === Int.of(other);
    }

    public cmp(this: this, other: Int | bigint | number): Ordering {
      if (this.eq(other)) {
        return Ordering.Equal;
      }

      if (this.value > Int.of(other)) {
        return Ordering.More;
      }

      return Ordering.Less;
    }

    public static fromStrRadix(
      string: StrLike,
      radix: Uint32Like
    ): Result<Int, Str> {
      string = str.of(string).toLowerCase();
      const radii = '0123456789abcdefghijklmnopqrstuvwxyz';
      if (string.includes(radii[Number(radix) + 1] || '~')) {
        return Err(str.new(`${string} is oob for radix ${radix.toString()}`));
      }

      return Ok(this.new(BigInt(string)));
    }

    private binary(): Iter<Uint8> {
      const v = vec.new<Uint8>();
      for (let i = bits; i > 0n; --i) {
        v.push(u8.new(this.value & (1n << (i - 1n))));
      }

      return iter.new(v).map((x) => x.unwrap());
    }

    public countOnes(): Uint32 {
      let i = 0n;

      for (const bit of this.binary()) {
        if (bit.eq(1)) {
          i++;
        }
      }

      return u32.new(i);
    }

    public countZeros(): Uint32 {
      let i = 0n;

      for (const bit of this.binary()) {
        if (bit.eq(0)) {
          i++;
        }
      }

      return u32.new(i);
    }

    public leadingZeros(): Uint32 {
      let i = 0n;

      for (const bit of this.binary()) {
        if (bit.eq(1)) {
          return u32.new(i);
        }

        i++;
      }

      return u32.new(i);
    }

    public trailingZeros(): Uint32 {
      let i = 0n;

      for (const bit of this.binary().reverse()) {
        if (bit.eq(1)) {
          return u32.new(i);
        }

        i++;
      }

      return u32.new(i);
    }

    public leadingOnes(): Uint32 {
      let i = 0n;

      for (const bit of this.binary()) {
        if (bit.eq(0)) {
          return u32.new(i);
        }

        i++;
      }

      return u32.new(i);
    }

    public trailingOnes(): Uint32 {
      let i = 0n;

      for (const bit of this.binary().reverse()) {
        if (bit.eq(0)) {
          return u32.new(i);
        }

        i++;
      }

      return u32.new(i);
    }

    public rotateLeft(n: Uint32Like): Int {
      n = u32.of(n);
      return Int.new((this.value << n));
    }
  };
}

export type Uint8Like = Uint8 | bigint | number;
export class Uint8 extends baseInt(8n, false) {}
export const u8 = staticify(Uint8);

export type Int8Like = Int8 | bigint | number;
export class Int8 extends baseInt(8n, true) {}
export const i8 = staticify(Int8);

export type Uint16Like = Uint16 | bigint | number;
export class Uint16 extends baseInt(16n, false) {}
export const u16 = staticify(Uint16);

export type Int16Like = Int16 | bigint | number;
export class Int16 extends baseInt(16n, true) {}
export const i16 = staticify(Int16);

export type Uint32Like = Uint32 | bigint | number;
export class Uint32 extends baseInt(32n, false) {}
export const u32 = staticify(Uint32);

export type Int32Like = Int32 | bigint | number;
export class Int32 extends baseInt(32n, true) {}
export const i32 = staticify(Int32);

export type Uint64Like = Uint64 | bigint | number;
export class Uint64 extends baseInt(64n, false) {}
export const u64 = staticify(Uint64);

export type Int64Like = Int64 | bigint | number;
export class Int64 extends baseInt(64n, true) {}
export const i64 = staticify(Int64);

export type Uint128Like = Uint128 | bigint | number;
export class Uint128 extends baseInt(128n, false) {}
export const u128 = staticify(Uint128);

export type Int128Like = Int128 | bigint | number;
export class Int128 extends baseInt(128n, true) {}
export const i128 = staticify(Int128);
