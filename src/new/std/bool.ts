/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { staticify } from '../../tools';
import type { And, Anybool, Not as not, Or, True, Xor } from '../../types';
import type { Clone } from './clone';
import type { PartialEq, PartialOrd } from './cmp';
import { Ordering } from './cmp';
import type { Default } from './default';
import type {
  BitAnd,
  BitAndAssign,
  BitOr,
  BitOrAssign,
  BitXor,
  BitXorAssign,
  FnOnce,
  Not
} from './ops';
import { None, Some } from './option';

class BoolImpl<T extends Anybool>
implements
    BitAnd<Anybool, BoolImpl<Anybool>>,
    BitAndAssign<Anybool, BoolImpl<Anybool>>,
    BitOr<Anybool, BoolImpl<Anybool>>,
    BitOrAssign<Anybool, BoolImpl<Anybool>>,
    BitXor<Anybool, BoolImpl<Anybool>>,
    BitXorAssign<Anybool, BoolImpl<Anybool>>,
    Clone<BoolImpl<T>>,
    Default<BoolImpl<false>>,
    Not<BoolImpl<not<T>>>,
    PartialOrd<Anybool, BoolImpl<Anybool>>,
    PartialEq<Anybool, BoolImpl<Anybool>>
{
  // ToBool<T>
  constructor(private value: T) {}

  public static new<T extends boolean>(value: T): BoolImpl<T> {
    return new this(value);
  }

  public static readonly true: BoolImpl<true> = new BoolImpl(true);
  public static readonly false: BoolImpl<false> = new BoolImpl(false);

  public as_primitive(): boolean {
    return !!this.value;
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public valueOf(): boolean {
    return !!this.value;
  }

  public then_some<U>(t: U): T extends True ? Some<U> : None {
    if (this.value) {
      return Some(t) as never;
    }

    return None as never;
  }

  public then<U>(f: FnOnce<[], U>): T extends True ? Some<U> : None {
    if (this.value) {
      return Some(f()) as never;
    }

    return None as never;
  }

  public bitand<U extends Anybool>(other: U): BoolImpl<And<T, U>> {
    return bool(this.value && other.valueOf()) as never;
  }

  public bitand_assign<U extends Anybool>(other: U): BoolImpl<And<T, U>> {
    this.value = this.bitand(other).value as never;

    return this as never;
  }

  public bitor<U extends Anybool>(other: U): BoolImpl<Or<T, U>> {
    return bool(this.value.valueOf() || other.valueOf()) as never;
  }

  public bitor_assign<U extends Anybool>(other: U): BoolImpl<Or<T, U>> {
    this.value = this.bitor(other).value as never;

    return this as never;
  }

  public bitxor<U extends Anybool>(other: U): BoolImpl<Xor<T, U>> {
    return bool(!!(+this.value ^ +other)) as never;
  }

  public bitxor_assign<U extends Anybool>(other: U): BoolImpl<Xor<T, U>> {
    this.value = this.bitxor(other).value as never;

    return this as never;
  }

  public not(): BoolImpl<not<T>> {
    return new BoolImpl(!this.value) as never;
  }

  public clone(): BoolImpl<T> {
    return new BoolImpl(this.value);
  }

  public default(): BoolImpl<false> {
    return BoolImpl.false;
  }

  public eq<U extends Anybool>(other: U): BoolImpl<Eq<T, U>> {
    return this.bitxor(other as never).not() as never;
  }

  public ne<U extends Anybool>(other: U): BoolImpl<Ne<T, U>> {
    return this.bitxor(other);
  }

  public partial_cmp(other: Anybool): Ordering {
    if (this.eq(other).valueOf()) {
      return Ordering.Equal;
    }

    if (this.eq(true).valueOf()) {
      return Ordering.Greater;
    }

    return Ordering.Less;
  }

  public ge<U extends Anybool>(other: U): BoolImpl<Ge<T, U>> {
    return new BoolImpl(this.partial_cmp(other).is_ge()) as never;
  }

  public gt<U extends Anybool>(other: U): BoolImpl<Gt<T, U>> {
    return new BoolImpl(this.partial_cmp(other).is_gt()) as never;
  }

  public le<U extends Anybool>(other: U): BoolImpl<Ge<T, U>> {
    return new BoolImpl(this.partial_cmp(other).is_le()) as never;
  }

  public lt<U extends Anybool>(other: U): BoolImpl<Gt<T, U>> {
    return new BoolImpl(this.partial_cmp(other).is_lt()) as never;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type bool<T extends Anybool = Anybool> = BoolImpl<T>;
export const bool = staticify(BoolImpl);

export type Eq<T extends Anybool, U extends Anybool> = not<Xor<T, U>>;
export type Ne<T extends Anybool, U extends Anybool> = Xor<T, U>;
export type Gt<T extends Anybool, U extends Anybool> = And<T, Ne<T, U>>;
export type Ge<T extends Anybool, U extends Anybool> = Or<Eq<T, U>, Gt<T, U>>;
export type Lt<T extends Anybool, U extends Anybool> = And<U, Ne<T, U>>;
export type Le<T extends Anybool, U extends Anybool> = Or<Eq<T, U>, Lt<T, U>>;
