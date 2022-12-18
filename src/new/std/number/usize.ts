import { staticify } from '../../../tools';
import type { _ } from '../custom';
import { IntSizedImpl } from './int_sized';

// @ts-expect-error ts(2714)
class USize extends IntSizedImpl<USize> {
  constructor(value: _) {
    super(value, 64n, true);
  }

  public static new(value: _): usize {
    return new this(value);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type usize = USize;
export const usize = staticify(USize);
