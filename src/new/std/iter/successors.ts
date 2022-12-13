import { staticify } from '../../../tools';
import { IteratorImpl } from './iterator';

// @ts-expect-error ts(2714)
class SuccessorsImpl<T> extends IteratorImpl<T> {
  constructor(first: Option<T>, value: T) {
    super(
      (function* (): Generator<T, void, unknown> {
        
      })()
    );
  }

  public static new<T>(value: T): SuccessorsImpl<T> {
    return new this(value);
  }
}

export type Successors<T> = SuccessorsImpl<T>;
export const Successors = staticify(SuccessorsImpl);
