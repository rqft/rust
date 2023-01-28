import { staticify } from "../../tools";
import type { _ } from "../custom";
import { IntSizedImpl } from "./int_sized";

// @ts-expect-error ts(2714)
class I128 extends IntSizedImpl<I128> {
  constructor(value: _) {
    super(value, 128n, false);
  }

  public static new(value: _): i128 {
    return new this(value);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type i128 = I128;
export const i128 = staticify(I128);
