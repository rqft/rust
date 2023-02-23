import { staticify } from '../../tools';
import { IteratorImpl } from '../iter/index';
import type { Vec } from './vec';

class IntoIterImpl<T> extends IteratorImpl<T> {
  constructor(value: Vec<T>) {
    super(value);
  }

  public static new<T>(vec: Vec<T>): IntoIterImpl<T> {
    return new this(vec);
  }
}

export type IntoIter<T> = IntoIterImpl<T>;
export const IntoIter = staticify(IntoIterImpl);
