import { staticify } from '../../../tools';
import { IteratorImpl } from './iterator';

class FlattenImpl<T> extends IteratorImpl<T> {
  constructor(iter: Iterable<Iterable<T> | T>) {
    super(
      (function* (): Generator<T, void, unknown> {
        for (const value of iter) {
          if (
            typeof value === 'object' &&
            Symbol.iterator in (value as object)
          ) {
            for (const item of value as Iterable<T>) {
              yield item;
            }

            continue;
          }

          yield value as T;
        }
      })()
    );
  }

  public static new<T>(iter: Iterable<Iterable<T> | T>): FlattenImpl<T> {
    return new this(iter);
  }
}

export type Flatten<T> = FlattenImpl<T>;
export const Flatten = staticify(FlattenImpl);
