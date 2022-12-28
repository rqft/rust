import { staticify } from '../../tools';
import type { _ } from '../custom';
import { IntSizedImpl } from './int_sized';

// @ts-expect-error ts(2714)
class I8 extends IntSizedImpl<I8> {
  constructor(value: _) {
    super(value, 8n, false);
  }

  public static new(value: _): i8 {
    return new this(value);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type i8 = I8;
export const i8 = staticify(I8);
