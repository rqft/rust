import { staticify } from '../../../tools';
import type { _ } from '../custom';
import { IntSizedImpl } from './int_sized';

// @ts-expect-error ts(2714)
class U64 extends IntSizedImpl<U64> {
  constructor(value: _) {
    super(value, 64n, true);
  }

  public static new(value: _): u64 {
    return new this(value);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type u64 = U64;
export const u64 = staticify(U64);
