import { staticify } from '../../../tools';
import { IteratorImpl } from '../../iter/index';
import type { HashMap } from './hash_map';

// @ts-expect-error ts(2714)
class ValuesImpl<K, V> extends IteratorImpl<V> {
  constructor(source: HashMap<K, V>) {
    super(
      (function* (): Generator<V> {
        for (const [, value] of source.vec.clone()) {
          yield value;
        }
      })()
    );
  }

  public static new<K, V>(source: HashMap<K, V>): ValuesImpl<K, V> {
    return new this(source);
  }
}

export type Values<K, V> = ValuesImpl<K, V>;
export const Values = staticify(ValuesImpl);
