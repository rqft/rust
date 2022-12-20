import { staticify } from '../../../tools';
import { IteratorImpl } from '../iter/iterator';
import { str } from './str';

// @ts-expect-error ts(2714)
class LinesImpl extends IteratorImpl<str> {
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

    super(p.alloc.split(/\n|\r/g).map((x) => str(x)));
  }

  public static new(str: str): LinesImpl {
    return new this(str);
  }
}

export type Lines = LinesImpl;
export const Lines = staticify(LinesImpl);
