import type { Anybool } from '../../types';

export interface LogicalOr<Rhs> {
  or(other: Rhs): Rhs | this;
}

export interface LogicalAnd<Rhs> {
  and(other: Rhs): Rhs | this;
}

export interface LogicalXor<Rhs> {
  xor(other: Rhs): Rhs | this;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention
export type _ = any;

export type ArrayOf<T> = T extends Array<_> ? T : [T];

export interface ToBool<T extends Anybool = boolean> {
  valueOf(): T;
}
