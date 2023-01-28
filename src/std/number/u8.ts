import { staticify } from "../../tools";
import type { _ } from "../custom";
import { IntSizedImpl } from "./int_sized";

// @ts-expect-error ts(2714)
class U8 extends IntSizedImpl<U8> {
  constructor(value: _) {
    super(value, 8n, true);
  }

  public static new(value: _): u8 {
    return new this(value);
  }

  public is_utf8_char_boundary(): boolean {
    return this.lt(128) || this.ge(192);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type u8 = U8;
export const u8 = staticify(U8);
