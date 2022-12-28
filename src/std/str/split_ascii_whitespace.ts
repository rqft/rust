import { staticify } from '../../tools';
import { IteratorImpl } from '../iter/iterator';
import { str } from './str';

// @ts-expect-error ts(2714)
class SplitAsciiWhitespaceImpl extends IteratorImpl<str> {
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

    // eslint-disable-next-line no-control-regex
    super(p.alloc.split(/ |\t|\r|\n|\x0c/gu).map((x) => str(x)));
  }

  public static new(str: str): SplitAsciiWhitespaceImpl {
    return new this(str);
  }
}

export type SplitAsciiWhitespace = SplitAsciiWhitespaceImpl;
export const SplitAsciiWhitespace = staticify(SplitAsciiWhitespaceImpl);
