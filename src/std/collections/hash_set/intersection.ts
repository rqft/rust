import { staticify } from "../../../tools";
import { IteratorImpl } from "../../iter";
import type { HashSet } from "./hash_set";

// @ts-expect-error ts(2714)
class IntersectionImpl<T> extends IteratorImpl<T> {
  constructor(source: HashSet<T>, target: HashSet<T>) {
    super(
      (function* (): Generator<T> {
        for (const value of source.vec.clone()) {
          if (target.contains(value)) {
            yield value;
          }
        }
      })()
    );
  }

  public static new<T>(
    source: HashSet<T>,
    target: HashSet<T>
  ): IntersectionImpl<T> {
    return new this(source, target);
  }
}

export type Intersection<T> = IntersectionImpl<T>;
export const Intersection = staticify(IntersectionImpl);
