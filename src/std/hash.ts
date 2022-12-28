import type { PartialEq } from './cmp';
import type { _ } from './custom';

export interface Hash {
  hash(): bigint;
}

export function compare_hash(t: unknown, u: unknown): boolean {
  if ('hash' in (t as Hash) && 'hash' in (u as Hash)) {
    return (t as Hash).hash() === (u as Hash).hash();
  }

  if ('eq' in (t as PartialEq<_>)) {
    return (t as PartialEq<_>).eq(u);
  }

  return t === u;
}
