import { staticify } from '../../../tools';
import { IteratorImpl } from './iterator';

class DoubleEndedIteratorImpl<T> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>) {
    super(iter);
  }

  public rev(): DoubleEndedIteratorImpl<T> {
    return new DoubleEndedIteratorImpl(Array.from(this).reverse());
  }

  public static new<T>(iter: Iterable<T>): DoubleEndedIteratorImpl<T> {
    return new this(iter);
  }
}

export type DoubleEndedIterator<T> = DoubleEndedIteratorImpl<T>;
export const DoubleEndedIterator = staticify(DoubleEndedIteratorImpl);
