import { staticify } from "../../../tools";
import { IteratorImpl } from "../../iter";
import type { HashSet } from "./hash_set";

// @ts-expect-error ts(2714)
class IntoIterImpl<T> extends IteratorImpl<T> {
  constructor(source: HashSet<T>) {
    super(
      (function* (): Generator<T> {
        for (const tuple of source.vec) {
          yield tuple;
        }
      })()
    );
  }

  public static new<T>(source: HashSet<T>): IntoIterImpl<T> {
    return new this(source);
  }
}

export type IntoIter<T> = IntoIterImpl<T>;
export const IntoIter = staticify(IntoIterImpl);
