import { staticify } from '../../tools';
import type { u16 } from '../number/index';

class DecodeUtf16ErrorImpl<T extends u16> extends Error {
  constructor(private surrogate: T) {
    super(
      `Decoding UTF-16 string failed: unpaired surrogate \\u{${surrogate}}`
    );
  }

  public unpaired_surrogate(): T {
    return this.surrogate;
  }

  public static new<T extends u16>(surrogate: T): DecodeUtf16ErrorImpl<T> {
    return new this(surrogate);
  }
}

export type DecodeUtf16Error<T extends u16> = DecodeUtf16ErrorImpl<T>;
export const DecodeUtf16Error = staticify(DecodeUtf16ErrorImpl);
