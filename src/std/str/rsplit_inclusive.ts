import { staticify } from "../../tools";
import { DoubleEndedIterator } from "../iter";
import { IteratorImpl } from "../iter/iterator";
import type { Io, str } from "./str";

// @ts-expect-error ts(2714)
class RSplitInclusiveImpl extends IteratorImpl<str> {
  constructor(p: str, pattern: Io) {
    super(DoubleEndedIterator(p.split_inclusive(pattern)).rev());
  }

  public static new(str: str, pattern: Io): RSplitInclusiveImpl {
    return new this(str, pattern);
  }
}

export type RSplitInclusive = RSplitInclusiveImpl;
export const RSplitInclusive = staticify(RSplitInclusiveImpl);
