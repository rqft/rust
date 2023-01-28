import { staticify } from "../../../tools";
import { IteratorImpl } from "../../iter";
import type { HashMap } from "./hash_map";

// @ts-expect-error ts(2714)
class IterImpl<K, V> extends IteratorImpl<[K, V]> {
  constructor(source: HashMap<K, V>) {
    super(
      (function* (): Generator<[K, V]> {
        for (const tuple of source.vec.clone()) {
          yield tuple;
        }
      })()
    );
  }

  public static new<K, V>(source: HashMap<K, V>): IterImpl<K, V> {
    return new this(source);
  }
}

export type Iter<K, V> = IterImpl<K, V>;
export const Iter = staticify(IterImpl);
