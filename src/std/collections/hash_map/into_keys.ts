import { staticify } from "../../../tools";
import { IteratorImpl } from "../../iter";
import type { HashMap } from "./hash_map";

// @ts-expect-error ts(2714)
class IntoKeysImpl<K, V> extends IteratorImpl<K> {
  constructor(source: HashMap<K, V>) {
    super(
      (function* (): Generator<K> {
        for (const [key] of source.vec) {
          yield key;
        }
      })()
    );
  }

  public static new<K, V>(source: HashMap<K, V>): IntoKeysImpl<K, V> {
    return new this(source);
  }
}

export type IntoKeys<K, V> = IntoKeysImpl<K, V>;
export const IntoKeys = staticify(IntoKeysImpl);
