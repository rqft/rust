import { staticify } from "../../tools";
import { DoubleEndedIterator } from "../iter";
import { IteratorImpl } from "../iter/iterator";
import type { Io, str } from "./str";

// @ts-expect-error ts(2714)
class RSplitImpl extends IteratorImpl<str> {
  constructor(p: str, pattern: Io) {
    super(DoubleEndedIterator(p.split(pattern)).rev());
  }

  public static new(str: str, pattern: Io): RSplitImpl {
    return new this(str, pattern);
  }
}

export type RSplit = RSplitImpl;
export const RSplit = staticify(RSplitImpl);
