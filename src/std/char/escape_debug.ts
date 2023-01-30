import { staticify } from '../../tools';
import type { _ } from '../custom';
import { IteratorImpl } from '../iter/iterator';
import { char } from './char';

// @ts-expect-error ts(2714)
class EscapeDebugImpl<T extends string> extends IteratorImpl<char<_>> {
  constructor(value: char<T>) {
    const val = value.as_primitive();
    super(
      (function* (): Generator<char<_>, void, unknown> {
        switch (val) {
        case '\t':
          yield char('\\');
          yield char('t');
          break;

        case '\r':
          yield char('\\');
          yield char('r');
          break;

        case '\n':
          yield char('\\');
          yield char('n');
          break;

        case '\'':
          yield char('\\');
          yield char('\'');
          break;

        case '"':
          yield char('\\');
          yield char('"');
          break;

        case '\\':
          yield char('\\');
          yield char('\\');
          break;

        default:
          yield value;
          break;
        }
      })()
    );
  }

  public static new<T extends string>(value: char<T>): EscapeDebugImpl<T> {
    return new this(value);
  }
}

export type EscapeDebug<T extends string> = EscapeDebugImpl<T>;
export const EscapeDebug = staticify(EscapeDebugImpl);
