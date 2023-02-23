import { staticify } from '../../../tools';
import { IteratorImpl } from '../../iter/index';
import type { HashMap } from './hash_map';

// @ts-expect-error ts(2714)
class KeysImpl<K, V> extends IteratorImpl<K> {
  constructor(source: HashMap<K, V>) {
    super(
      (function* (): Generator<K> {
        for (const [key] of source.vec.clone()) {
          yield key;
        }
      })()
    );
  }

  public static new<K, V>(source: HashMap<K, V>): KeysImpl<K, V> {
    return new this(source);
  }
}

export type Keys<K, V> = KeysImpl<K, V>;
export const Keys = staticify(KeysImpl);
