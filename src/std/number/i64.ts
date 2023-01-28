import { staticify } from "../../tools";
import type { _ } from "../custom";
import { IntSizedImpl } from "./int_sized";

// @ts-expect-error ts(2714)
class I64 extends IntSizedImpl<I64> {
  constructor(value: _) {
    super(value, 64n, false);
  }

  public static new(value: _): i64 {
    return new this(value);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type i64 = I64;
export const i64 = staticify(I64);
