import { staticify } from "../../tools";
import { IteratorImpl } from "../iter/iterator";

import type { FnMut } from "../ops";
import type { slice } from "./slice";

// @ts-expect-error ts(2714)
class RSplitInclusiveImpl<T> extends IteratorImpl<IteratorImpl<T>> {
  constructor(v: slice<T>, f: FnMut<[T], boolean>) {
    super(v.reverse().split_inclusive(f));
  }

  public static new<T>(
    ptr: slice<T>,
    f: FnMut<[T], boolean>
  ): RSplitInclusive<T> {
    return new this(ptr, f);
  }
}

export type RSplitInclusive<T> = RSplitInclusiveImpl<T>;
export const RSplitInclusive = staticify(RSplitInclusiveImpl);
