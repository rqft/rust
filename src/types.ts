import type { ToBool } from './std/custom';

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
  : T extends False
  ? T
  : Anybool;

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
export type IndexOf<
  T extends Array<unknown>,
  U,
  C extends Array<unknown> = []
> = U extends T[number]
  ? T extends [infer F, ...infer R]
    ? [U] extends [F]
      ? C['length']
      : C extends [...infer R1]
      ? IndexOf<R, U, [...R1, 1]>
      : C
    : C
  : -1;

export type Extends<T, U> = T extends U ? true : false;
export type RadiiIdx =
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36;
