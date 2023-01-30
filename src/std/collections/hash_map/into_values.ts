import { staticify } from '../../../tools';
import { IteratorImpl } from '../../iter';
import type { HashMap } from './hash_map';

// @ts-expect-error ts(2714)
class IntoValuesImpl<K, V> extends IteratorImpl<V> {
  constructor(source: HashMap<K, V>) {
    super(
      (function* (): Generator<V> {
        for (const [, value] of source.vec) {
          yield value;
        }
      })()
    );
  }

  public static new<K, V>(source: HashMap<K, V>): IntoValuesImpl<K, V> {
    return new this(source);
  }
}

export type IntoValues<K, V> = IntoValuesImpl<K, V>;
export const IntoValues = staticify(IntoValuesImpl);
