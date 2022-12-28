import { staticify } from '../../../tools';
import { IteratorImpl } from '../../iter';
import type { HashSet } from './hash_set';

// @ts-expect-error ts(2714)
class SymmetricDifferenceImpl<T> extends IteratorImpl<T> {
  constructor(source: HashSet<T>, target: HashSet<T>) {
    super(source.difference(target).chain(target.difference(source)));
  }

  public static new<T>(
    source: HashSet<T>,
    target: HashSet<T>
  ): SymmetricDifferenceImpl<T> {
    return new this(source, target);
  }
}

export type SymmetricDifference<T> = SymmetricDifferenceImpl<T>;
export const SymmetricDifference = staticify(SymmetricDifferenceImpl);
