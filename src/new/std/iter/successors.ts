import { staticify } from '../../../tools';
import type { FnMut } from '../ops';
import type { Option } from '../option';
import { IteratorImpl } from './iterator';

// @ts-expect-error ts(2714)
class SuccessorsImpl<T> extends IteratorImpl<T> {
  constructor(first: Option<T>, fn: FnMut<[T], Option<T>>) {
    super(
      (function* (): Generator<T, void, unknown> {
        while (first.is_some()) {
          yield first.unwrap();
          first = fn(first.unwrap());
        }
      })()
    );
  }

  public static new<T>(
    first: Option<T>,
    fn: FnMut<[T], Option<T>>
  ): SuccessorsImpl<T> {
    return new this(first, fn);
  }
}

export type Successors<T> = SuccessorsImpl<T>;
export const Successors = staticify(SuccessorsImpl);
