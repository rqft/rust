import { staticify } from "../../tools";
import type { _ } from "../custom";
import { IntSizedImpl } from "./int_sized";

// @ts-expect-error ts(2714)
class ISize extends IntSizedImpl<ISize> {
  constructor(value: _) {
    super(value, 64n, false);
  }

  public static new(value: _): isize {
    return new this(value);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type isize = ISize;
export const isize = staticify(ISize);
