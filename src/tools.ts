/* eslint-disable @typescript-eslint/no-explicit-any */

export type FnConstructor = (new (...args: Array<any>) => any) & {
  'new'(...args: Array<any>): any;
};
export type Fn = (...args: Array<any>) => any;
export type Proto<T> = T extends new (...args: Array<any>) => infer R
  ? R
  : never;

export type Get<T, P> = P extends keyof T
  ? T[P]
  : 'prototype' extends keyof T
  ? P extends keyof T['prototype']
    ? T['prototype'][P]
    : never
  : never;

export type AnyFunction = Fn | FnConstructor;
export type Staticify<T extends FnConstructor> = Get<T, 'new'> &
  T & {
    [P in keyof Proto<T>]: Proto<T>[P] extends (...args: infer U) => unknown
      ? <Self extends Proto<T>>(self: Self, ...args: U) => ReturnType<Self[P]>
      : (...args: ConstructorParameters<T>) => Proto<T>[P];
  } & { static: T };

export function staticify<T extends FnConstructor>(value: T): Staticify<T> {
  return new Proxy(value, {
    get(target, p): any {
      // literally 'static'
      if (p === 'static') {
        return target;
      }

      // static constants
      if (p in value) {
        return value[p as keyof typeof value];
      }

      if (p in value.prototype) {
        // methods, (&self, ...params) -> R
        if (typeof value.prototype[p] === 'function') {
          return (self: Proto<T>, ...args: Array<any>) => {
            return self[p](...args);
          };
        }

        // constants
        // this could possibly change based on instance parameters, so we follow the format of cls.method(params) -> value
        return (...args: Array<any>) => {
          return new value(...args)[p];
        };
      }
    },

    apply(target, thisArg, argArray): any {
      return new (target.bind(thisArg))(...argArray);
    },
  }) as never;
}

