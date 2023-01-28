import { staticify } from "../../tools";
import type { _ } from "../custom";
import { IntSizedImpl } from "./int_sized";

// @ts-expect-error ts(2714)
class U16 extends IntSizedImpl<U16> {
  constructor(value: _) {
    super(value, 16n, true);
  }

  public static new(value: _): u16 {
    return new this(value);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type u16 = U16;
export const u16 = staticify(U16);
