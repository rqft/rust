import { staticify } from '../../../tools';
import { IteratorImpl } from '../../iter';
import type { HashSet } from './hash_set';

// @ts-expect-error ts(2714)
class DifferenceImpl<T> extends IteratorImpl<T> {
  constructor(source: HashSet<T>, target: HashSet<T>) {
    super(
      (function* (): Generator<T> {
        for (const tuple of source.vec.clone()) {
          if (target.contains(tuple)) {
            continue;
          }

          yield tuple;
        }
      })()
    );
  }

  public static new<T>(
    source: HashSet<T>,
    target: HashSet<T>
  ): DifferenceImpl<T> {
    return new this(source, target);
  }
}

export type Difference<T> = DifferenceImpl<T>;
export const Difference = staticify(DifferenceImpl);
