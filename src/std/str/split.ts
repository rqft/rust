import { staticify } from "../../tools";
import { IteratorImpl } from "../iter/iterator";
import type { Io } from "./str";
import { str } from "./str";

// @ts-expect-error ts(2714)
class SplitImpl extends IteratorImpl<str> {
  constructor(p: str, pattern: Io) {
    super(p.alloc.split(str(pattern).alloc).map((x) => str(x)));
  }

  public static new(str: str, pattern: Io): SplitImpl {
    return new this(str, pattern);
  }
}

export type Split = SplitImpl;
export const Split = staticify(SplitImpl);
