import { staticify } from "../../tools";
import type { _ } from "../custom";
import { IteratorImpl } from "../iter/iterator";
import type { char } from "./char";

// @ts-expect-error ts(2714)
class EscapeDefaultImpl<T extends string> extends IteratorImpl<char<_>> {
  constructor(value: char<T>) {
    const point = value.codepoint();
    super(
      (function* (): Generator<char<_>, void, unknown> {
        if (point >= 0x20 && point <= 0x7e) {
          yield* value.escape_debug();
        }

        yield* value.escape_unicode();
      })()
    );
  }

  public static new<T extends string>(value: char<T>): EscapeDefaultImpl<T> {
    return new this(value);
  }
}

export type EscapeDefault<T extends string> = EscapeDefaultImpl<T>;
export const EscapeDefault = staticify(EscapeDefaultImpl);
