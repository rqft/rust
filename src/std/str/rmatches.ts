import { staticify } from "../../tools";
import { DoubleEndedIterator } from "../iter";
import { IteratorImpl } from "../iter/iterator";
import type { Io, str } from "./str";

// @ts-expect-error ts(2714)
class RMatchesImpl extends IteratorImpl<str> {
  constructor(p: str, pattern: Io) {
    super(DoubleEndedIterator(p.matches(pattern)).rev());
  }

  public static new(str: str, pattern: Io): RMatchesImpl {
    return new this(str, pattern);
  }
}

export type RMatches = RMatchesImpl;
export const RMatches = staticify(RMatchesImpl);
