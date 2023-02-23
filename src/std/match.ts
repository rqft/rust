import { staticify } from '../tools';
import { compare_hash } from './hash';

class Match<T, U> {
  constructor(private val: T) {}

  public static new<T, U>(value: T): Match<T, U> {
    return new this(value);
  }

  private readonly arms: Array<[Arm<T>, Resolve<T, U>]> = [];

  public value(val: T, result: Resolve<T, U>): this {
    this.arms.push([val, result]);
    return this;
  }

  public union(val: Array<T>, result: Resolve<T, U>): this {
    this.arms.push([val, result]);
    return this;
  }

  public wildcard(result: Resolve<T, U>): this {
    this.arms.push([_, result]);
    return this;
  }

  public output(): U {
    for (const [arm, result] of this.arms) {
      const r =
        typeof result !== 'function'
          ? (): U => result as U
          : (result as (T: T) => U);

      if (compare_hash(this.val, arm)) {
        return r(this.val);
      }

      if (Array.isArray(arm)) {
        for (const value of arm) {
          if (compare_hash(this.val, value)) {
            return r(this.val);
          }
        }
      }

      if (arm === _) {
        return r(this.val);
      }
    }

    throw new Error(`missing match arm: ${this.val}`);
  }
}

//                    union    val  anything
export type Arm<T> = Array<T> | T | typeof _;
export type Resolve<T, U> = U | ((T: T) => U);

export const match = staticify(Match);
export const _ = Symbol('_');
