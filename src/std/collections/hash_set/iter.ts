import { staticify } from '../../../tools';
import { IteratorImpl } from '../../iter';
import type { HashSet } from './hash_set';

// @ts-expect-error ts(2714)
class IterImpl<T> extends IteratorImpl<T> {
  constructor(source: HashSet<T>) {
    super(
      (function* (): Generator<T> {
        for (const tuple of source.vec.clone()) {
          yield tuple;
        }
      })()
    );
  }

  public static new<T>(source: HashSet<T>): IterImpl<T> {
    return new this(source);
  }
}

export type Iter<T> = IterImpl<T>;
export const Iter = staticify(IterImpl);
