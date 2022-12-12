import { staticify } from '../../../tools';
import type { FnMut } from '../ops';
import { IteratorImpl } from './iterator';

// @ts-expect-error ts(2714)
class MapImpl<T, B> extends IteratorImpl<B> {
  constructor(iter: Iterable<T>, f: FnMut<[T], B>) {
    const p = iter[Symbol.iterator]();
    super(
      (function* (): Generator<B, void, undefined> {
        const item = p.next();

        yield f(item.value);
      })()
    );
  }

  public static new<T, B>(iter: Iterable<T>, f: FnMut<[T], B>): MapImpl<T, B> {
    return new this(iter, f);
  }
}

export type Map<T, B> = MapImpl<T, B>;
export const Map = staticify(MapImpl);
