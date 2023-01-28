import { staticify } from "../../tools";
import type { _ } from "../custom";
import { IntSizedImpl } from "./int_sized";

// @ts-expect-error ts(2714)
class I16 extends IntSizedImpl<I16> {
  constructor(value: _) {
    super(value, 16n, false);
  }

  public static new(value: _): i16 {
    return new this(value);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type i16 = I16;
export const i16 = staticify(I16);
