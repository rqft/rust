import { staticify } from '../../../tools';
import type { _ } from '../custom';
import { IntSizedImpl } from './int_sized';

// @ts-expect-error ts(2714)
class U32 extends IntSizedImpl<U32> {
  constructor(value: _) {
    super(value, 32n, true);
  }

  public static new(value: _): u32 {
    return new this(value);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type u32 = U32;
export const u32 = staticify(U32);
