import { staticify } from '../../../tools';
import type { FnMut } from '../ops';
import type { Option } from '../option';
import { None, Some } from '../option';
import { IteratorImpl } from './iterator';

// @ts-expect-error ts(2714)
class ScanImpl<T, St, B> extends IteratorImpl<[St, B]> {
  private i: globalThis.Iterator<T>;
  constructor(
    iter: Iterable<T>,
    private state: St,
    private f: FnMut<[St, T], [St, Option<B>]>
  ) {
    super();
    this.i = iter[Symbol.iterator]();
  }

  public next(): Option<[St, B]> {
    const input = this.i.next();
    if (input.done) {
      return None;
    }

    const [state, output] = this.f(this.state, input.value);
    this.state = state;

    if (output.is_none()) {
      return None;
    }

    return Some([state, output.unwrap()]);
  }

  public static new<T, St, B>(
    iter: Iterable<T>,
    initial_state: St,
    f: FnMut<[St, T], [St, Option<B>]>
  ): ScanImpl<T, St, B> {
    return new this(iter, initial_state, f);
  }
}

export type Scan<T, St, B> = ScanImpl<T, St, B>;
export const Scan = staticify(ScanImpl);
