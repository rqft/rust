import { staticify } from '../../../tools';
import type { Option } from '../option';
import { IteratorImpl } from './iterator';

// @ts-expect-error ts(2417)
class StepByImpl<T, N extends number> extends IteratorImpl<T> {
  constructor(private readonly step: N, iter: Iterable<T>) {
    super(iter);
  }

  public next(): Option<T> {
    let c = super.next();

    for (let i = 1; i < this.step; i++) {
      c = super.next();
    }

    return c;
  }

  public static override new<T, N extends number>(
    step: N,
    iter: Iterable<T>
  ): StepByImpl<T, N> {
    return new this(step, iter);
  }
}

export type StepBy<T, N extends number> = StepByImpl<T, N>;
export const StepBy = staticify(StepByImpl);
