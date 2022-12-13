import { staticify } from '../../../tools';
import { panic } from '../panic';
import { Iterator, IteratorImpl } from './iterator';

// @ts-expect-error ts(2714)
class ArrayChunksImpl<T, N extends number> extends IteratorImpl<
  IteratorImpl<T>
> {
  constructor(iter: Iterable<T>, size: N) {
    if (size <= 0) {
      panic('ArrayChunks<T, N> failed due to unmet bound: N > 0');
    }

    super(
      (function* (): Generator<Iterator<T>, void, unknown> {
        let o: Array<T> = [];
        for (const value of iter) {
          if (o.length > size) {
            yield Iterator(o);
            o = [];
          }

          o.push(value);
        }

        // remainder
        yield Iterator(o);
      })()
    );
  }

  public static override new<T, N extends number>(
    iter: Iterable<T>,
    size: N
  ): ArrayChunksImpl<T, N> {
    return new this(iter, size);
  }
}

export type ArrayChunks<T, N extends number> = ArrayChunksImpl<T, N>;
export const ArrayChunks = staticify(ArrayChunksImpl);
