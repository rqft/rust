import { staticify } from '../../tools';
import { IteratorImpl } from '../iter/iterator';
import { str } from './str';

// @ts-expect-error ts(2714)
class SplitWhitespaceImpl extends IteratorImpl<str> {
  constructor(p: str) {
    // super(
    //   slice(
    //     p
    //       .as_bytes()
    //       .iter()
    //       .map((x) => char(x))
    //   )
    //     .split((x) => x.is_whitespace())
    //     .map((x) => str(x.flatten()))
    // );

    super(p.alloc.split(/\s/g).map((x) => str(x)));
  }

  public static new(str: str): SplitWhitespaceImpl {
    return new this(str);
  }
}

export type SplitWhitespace = SplitWhitespaceImpl;
export const SplitWhitespace = staticify(SplitWhitespaceImpl);
