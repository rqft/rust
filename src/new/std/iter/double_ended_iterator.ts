import { staticify } from '../../../tools';
import type { _ } from '../custom';
import type { FnMut } from '../ops';
import type { Option } from '../option';
import type { Result } from '../result';
import { IteratorImpl } from './iterator';

class DoubleEndedIteratorImpl<T> extends IteratorImpl<T> {
  constructor(iter: Iterable<T>) {
    super(iter);
  }

  public rev(): DoubleEndedIteratorImpl<T> {
    return new DoubleEndedIteratorImpl(Array.from(this).reverse());
  }

  public next_back(): Option<T> {
    return this.rev().next();
  }

  public advance_back_by(n: number): Result<_, number> {
    return this.rev().advance_by(n);
  }

  public nth_back(n: number): Option<T> {
    return this.rev().nth(n);
  }

  public rfold<B>(init: B, f: FnMut<[B, T], B>): B {
    return this.rev().fold(init, f);
  }

  public rfind(predicate: FnMut<[T], boolean>): Option<T> {
    return this.rev().find(predicate);
  }

  public rposition(predicate: FnMut<[T], boolean>): Option<number> {
    return this.rev().position(predicate);
  }

  public static new<T>(iter: Iterable<T>): DoubleEndedIteratorImpl<T> {
    return new this(iter);
  }
}

export type DoubleEndedIterator<T> = DoubleEndedIteratorImpl<T>;
export const DoubleEndedIterator = staticify(DoubleEndedIteratorImpl);
