import { staticify } from '../../../tools';
import type { _ } from '../custom';
import { IntSizedImpl } from './int_sized';

// @ts-expect-error ts(2714)
class I32 extends IntSizedImpl<I32> {
  constructor(value: _) {
    super(value, 32n, false);
  }

  public static new(value: _): i32 {
    return new this(value);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type i32 = I32;
export const i32 = staticify(I32);
