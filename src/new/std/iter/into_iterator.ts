import type { Iterator } from './iterator';

export interface IntoIterator<T, I extends Iterator<T>> {
  into_iter(): I;
}
