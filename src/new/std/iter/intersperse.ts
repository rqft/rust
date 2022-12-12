import { staticify } from '../../../tools';
import { IteratorImpl } from './iterator';

// @ts-expect-error ts(2714)
class IntersperseImpl<T> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>, separator: T) {
    const p = iter[Symbol.iterator]();
    super(
      (function* (): Generator<T, void, undefined> {
        const item = p.next();

        yield item.value;
        if (!item.done) {
          yield separator;
        }
      })()
    );
  }

  public static new<T>(iter: Iterable<T>, separator: T): IntersperseImpl<T> {
    return new this(iter, separator);
  }
}

export type Intersperse<T> = IntersperseImpl<T>;
export const Intersperse = staticify(IntersperseImpl);
