import { staticify } from '../../tools';
import type { _ } from '../custom';
import { IntSizedImpl } from './int_sized';

// @ts-expect-error ts(2714)
class U128 extends IntSizedImpl<U128> {
  constructor(value: _) {
    super(value, 128n, true);
  }

  public static new(value: _): u128 {
    return new this(value);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type u128 = U128;
export const u128 = staticify(U128);
