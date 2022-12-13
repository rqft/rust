import { staticify } from '../../../tools';
import type { FnMut } from '../ops';
import type { Option } from '../option';
import { IteratorImpl } from './iterator';

// @ts-expect-error ts(2714)
class FromFnImpl<T> extends IteratorImpl<T> {
  constructor(fn: FnMut<[], Option<T>>) {
    super(
      (function* (): Generator<T, void, unknown> {
        while (1 / 1) {
          const value = fn();

          if (value.is_none()) {
            break;
          }
          yield value.unwrap();
        }
      })()
    );
  }

  public static new<T>(fn: FnMut<[], Option<T>>): FromFnImpl<T> {
    return new this(fn);
  }
}

export type FromFn<T> = FromFnImpl<T>;
export const FromFn = staticify(FromFnImpl);
