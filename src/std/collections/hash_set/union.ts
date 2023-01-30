import { staticify } from '../../../tools';
import type { _ } from '../../custom';
import { compare_hash } from '../../hash';
import { IteratorImpl } from '../../iter';
import type { HashSet } from './hash_set';

// @ts-expect-error ts(2714)
class UnionImpl<T> extends IteratorImpl<T> {
  constructor(source: HashSet<T>, target: HashSet<T>) {
    super(
      (function* (): Generator<T, _, _> {
        const visited: Array<T> = [];
        for (const value of source.vec.clone()) {
          if (!visited.find((x) => compare_hash(value, x))) {
            visited.push(value);
          }
        }

        for (const value of target.vec.clone()) {
          if (!visited.find((x) => compare_hash(value, x))) {
            visited.push(value);
          }
        }

        yield* visited;
      })()
    );
  }

  public static new<T>(source: HashSet<T>, target: HashSet<T>): UnionImpl<T> {
    return new this(source, target);
  }
}

export type Union<T> = UnionImpl<T>;
export const Union = staticify(UnionImpl);
