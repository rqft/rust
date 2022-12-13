import { staticify } from '../../../tools';
import { IteratorImpl } from './iterator';

class EmptyImpl<T> extends IteratorImpl<T> {
  constructor() {
    super();
  }

  public static new<T>(): EmptyImpl<T> {
    return new this();
  }
}

export type Empty<T> = EmptyImpl<T>;
export const Empty = staticify(EmptyImpl);
