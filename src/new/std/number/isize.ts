import { staticify } from '../../../tools';
import type { Result } from '../result';
import { Err, Ok, result_from } from '../result';
import { IntErrorKind } from './error_kind';
import { ParseIntError } from './parseint_error';

class ISizeImpl {
  private value: bigint;
  constructor(value: Int) {
    this.value = BigInt(value);
  }

  public as_primitive(): bigint {
    return this.value;
  }

  public static new(value: Int): ISizeImpl {
    return new this(value);
  }

  public static readonly min: ISizeImpl = new this(-9_223_372_036_854_775_808n);
  public static readonly max: ISizeImpl = new this(9_223_372_036_854_775_807n);
  public static readonly bits: ISizeImpl = new this(64);

  public static from_str(src: string): Result<ISizeImpl, ParseIntError> {
    if (src.length === 0) {
      return Err(ParseIntError(IntErrorKind.Empty));
    }

    const value = result_from<bigint, Error>(() => BigInt(src));

    if (value.is_err()) {
      return Err(ParseIntError.new(IntErrorKind.InvalidDigit));
    }

    const u = value.unwrap();

    if (u < ISizeImpl.min.value) {
      return Err(ParseIntError.new(IntErrorKind.NegOverflow));
    }

    if (u > ISizeImpl.max.value) {
      return Err(ParseIntError.new(IntErrorKind.PosOverflow));
    }

    return Ok(new this(u));
  }

  private binary_string(): string {
    if (this.value < 0n) {
      return BigInt(
        '0b' +
          ((-this.value)
            .toString(2)
            .padStart(64, '0')
            .split('')
            .map((x) => (x === '0' ? '1' : '0'))
            .join('') +
            1n)
      )
        .toString(2)
        .padStart(63, '0');
    }

    return this.value.toString(2).padStart(64, '0');
  }

  public count_ones(): ISizeImpl {
    return new ISizeImpl(
      this.binary_string()
        .split('')
        .reduce((p, v) => p + (v === '0' ? 0 : 1), 0)
    );
  }

  public count_zeroes(): ISizeImpl {
    return new ISizeImpl(
      this.binary_string()
        .split('')
        .reduce((p, v) => p + (v === '0' ? 1 : 0), 0)
    );
  }

  public leading_zeroes(): ISizeImpl {
    return new ISizeImpl(this.binary_string().replace(/(^0+).+/, '$1').length);
  }

  public trailing_zeroes(): ISizeImpl {
    return new ISizeImpl(this.binary_string().replace(/.+(0+$)/, '$1').length);
  }

  public leading_ones(): ISizeImpl {
    return new ISizeImpl(this.binary_string().replace(/(^1+).+/, '$1').length);
  }

  public trailing_ones(): ISizeImpl {
    return new ISizeImpl(this.binary_string().replace(/.+(1+$)/, '$1').length);
  }

  public rotate_left(d: Int): this {
    d = BigInt(d);
    this.value = (this.value << d) | (this.value >> (ISizeImpl.bits.value - d));
    return this;
  }

  public rotate_right(d: Int): this {
    d = BigInt(d);
    this.value = (this.value >> d) | (this.value << (ISizeImpl.bits.value - d));
    return this;
  }

  public swap_bytes(): this {
    this.value = BigInt(
      this.binary_string()
        .match(/(?:0|1){8}/g)
        ?.reverse()
        .join('') || ''
    );

    return this;
  }
}

type Int = bigint | number;

export type isize = ISizeImpl;
export const isize = staticify(ISizeImpl);
