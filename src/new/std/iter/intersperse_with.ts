import { staticify } from '../../../tools';
import type { FnMut } from '../ops';
import { IteratorImpl } from './iterator';

// @ts-expect-error ts(2714)
class IntersperseWithImpl<T, G extends FnMut<[], T>> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>, separator: G) {
    const p = iter[Symbol.iterator]();
    super(
      (function* (): Generator<T, void, undefined> {
        const item = p.next();

        yield item.value;
        if (!item.done) {
          yield separator();
        }
      })()
    );
  }

  public static new<T, G extends FnMut<[], T>>(
    iter: Iterable<T>,
    separator: G
  ): IntersperseWithImpl<T, G> {
    return new this(iter, separator);
  }
}

export type IntersperseWith<T, G extends FnMut<[], T>> = IntersperseWithImpl<
  T,
  G
>;
export const IntersperseWith = staticify(IntersperseWithImpl);
