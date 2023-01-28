import { staticify } from "../../tools";
import type { IntErrorKind } from "./int_error_kind";

class ParseIntErrorImpl extends Error {
  constructor(private k: IntErrorKind) {
    super(`Parsing integer failed: ${k}`);
  }

  public kind(): IntErrorKind {
    return this.k;
  }

  public static new(k: IntErrorKind): ParseIntErrorImpl {
    return new this(k);
  }
}

export type ParseIntError = ParseIntErrorImpl;
export const ParseIntError = staticify(ParseIntErrorImpl);
