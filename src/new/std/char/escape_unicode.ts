import { staticify } from '../../../tools';
import type { _ } from '../custom';
import { IteratorImpl } from '../iter/iterator';
import { char } from './char';

// @ts-expect-error ts(2714)
class EscapeUnicodeImpl<T extends string> extends IteratorImpl<char<_>> {
  constructor(value: char<T>) {
    const codepoint = value.codepoint().toString().padStart(4);
    super(
      (function* (): Generator<char<_>, void, unknown> {
        yield char('\\');
        yield char('u');
        yield char('{');

        for (const digit of codepoint) {
          yield char(digit);
        }
        yield char('}');
      })()
    );
  }

  public static new<T extends string>(value: char<T>): EscapeUnicodeImpl<T> {
    return new this(value);
  }
}

export type EscapeUnicode<T extends string> = EscapeUnicodeImpl<T>;
export const EscapeUnicode = staticify(EscapeUnicodeImpl);
