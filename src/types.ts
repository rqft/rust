import type { ToBool } from './new/std/custom';

export type And<T extends Anybool, U extends Anybool> = [T, U] extends [
  True,
  True
]
  ? True
  : False;

export type Or<T extends Anybool, U extends Anybool> = T extends True
  ? T
  : U extends True
  ? U
  : False;

export type Xor<T extends Anybool, U extends Anybool> = T extends True
  ? U extends True
    ? False
    : True
  : U extends True
  ? True
  : False;

export type Not<T extends Anybool> = T extends True ? False : True;

export type Debool<T> = T extends ToBool<infer U> ? U : never;
export type Anybool = ToBool<boolean>;
export type True = ToBool<true>;
export type False = ToBool<false>;

export type StrToArray<
  T extends string,
  N extends Array<string> = []
> = T extends `${infer F}${infer R}` ? StrToArray<R, [...N, F]> : N;
