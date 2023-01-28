/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { staticify } from "../tools";
import type { Clone } from "./clone";
import type { PartialEq, PartialOrd } from "./cmp";
import { Ordering } from "./cmp";
import type { Default } from "./default";
import type {
  BitAnd,
  BitAndAssign,
  BitOr,
  BitOrAssign,
  BitXor,
  BitXorAssign,
  FnOnce,
  Not,
} from "./ops";
import type { Option } from "./option";
import { None, Some } from "./option";

class BoolImpl
  implements
    BitAnd<boolean, BoolImpl>,
    BitAndAssign<boolean, BoolImpl>,
    BitOr<boolean, BoolImpl>,
    BitOrAssign<boolean, BoolImpl>,
    BitXor<boolean, BoolImpl>,
    BitXorAssign<boolean, BoolImpl>,
    Clone<BoolImpl>,
    Default<BoolImpl>,
    Not<BoolImpl>,
    PartialOrd<boolean, BoolImpl>,
    PartialEq<boolean, BoolImpl>
{
  protected value: boolean;
  // ToBool<T>
  constructor(value: Io) {
    this.value = value.valueOf();
  }

  public static new(value: boolean): BoolImpl {
    return new this(value);
  }

  public static readonly true: BoolImpl = new BoolImpl(true);
  public static readonly false: BoolImpl = new BoolImpl(false);

  public as_primitive(): boolean {
    return !!this.value;
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public valueOf(): boolean {
    return !!this.value;
  }

  public then_some<U>(t: U): Option<U> {
    if (this.value) {
      return Some(t) as never;
    }

    return None as never;
  }

  public then<U>(f: FnOnce<[], U>): Option<U> {
    if (this.value) {
      return Some(f()) as never;
    }

    return None as never;
  }

  public bitand(other: Io): BoolImpl {
    return bool(this.value && other.valueOf()) as never;
  }

  public bitand_assign(other: Io): BoolImpl {
    this.value = this.bitand(other).value as never;

    return this as never;
  }

  public bitor(other: Io): BoolImpl {
    return bool(this.value.valueOf() || other.valueOf()) as never;
  }

  public bitor_assign(other: Io): BoolImpl {
    this.value = this.bitor(other).value as never;

    return this as never;
  }

  public bitxor(other: Io): BoolImpl {
    return bool(!!(+this.value ^ +other)) as never;
  }

  public bitxor_assign(other: Io): BoolImpl {
    this.value = this.bitxor(other).value as never;

    return this as never;
  }

  public not(): BoolImpl {
    return new BoolImpl(!this.value) as never;
  }

  public clone(): BoolImpl {
    return new BoolImpl(this.value);
  }

  public default(): BoolImpl {
    return BoolImpl.false;
  }

  public eq(other: Io): BoolImpl {
    return this.bitxor(other).not();
  }

  public ne(other: Io): BoolImpl {
    return this.bitxor(other);
  }

  public partial_cmp(other: Io): Ordering {
    if (this.eq(other).valueOf()) {
      return Ordering.Equal;
    }

    if (this.eq(true).valueOf()) {
      return Ordering.Greater;
    }

    return Ordering.Less;
  }

  public ge(other: Io): BoolImpl {
    return new BoolImpl(this.partial_cmp(other).is_ge());
  }

  public gt(other: Io): BoolImpl {
    return new BoolImpl(this.partial_cmp(other).is_gt());
  }

  public le(other: Io): BoolImpl {
    return new BoolImpl(this.partial_cmp(other).is_le());
  }

  public lt(other: Io): BoolImpl {
    return new BoolImpl(this.partial_cmp(other).is_lt());
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type bool = BoolImpl;
export const bool = staticify(BoolImpl);

type Io = bool | boolean;
