import { staticify } from "../../../tools";
import { IteratorImpl } from "../../iter";
import type { HashMap } from "./hash_map";

// @ts-expect-error ts(2714)
class IntoIterImpl<K, V> extends IteratorImpl<[K, V]> {
  constructor(source: HashMap<K, V>) {
    super(
      (function* (): Generator<[K, V]> {
        for (const tuple of source.vec) {
          yield tuple;
        }
      })()
    );
  }

  public static new<K, V>(source: HashMap<K, V>): IntoIterImpl<K, V> {
    return new this(source);
  }
}

export type IntoIter<K, V> = IntoIterImpl<K, V>;
export const IntoIter = staticify(IntoIterImpl);
