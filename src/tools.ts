/* eslint-disable @typescript-eslint/no-explicit-any */

export type FnConstructor = (new (...args: Array<any>) => any) & {
  'new'(...args: Array<any>): any;
};
export type Fn = (...args: Array<any>) => any;

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
    [P in keyof InstanceType<T>]: InstanceType<T>[P] extends (
      ...args: infer U
    ) => unknown
      ? <Self extends InstanceType<T>>(
          self: Self,
          ...args: U
        ) => ReturnType<Self[P]>
      : (...args: ConstructorParameters<T>) => InstanceType<T>[P];
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
          return (self: InstanceType<T>, ...args: Array<any>) => {
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

    construct(target, argArray): any {
      return target.new(argArray);
    },
  }) as never;
}

export const UnicodeRegexCategories = {
  control: /\p{Cc}/u,
  format: /\p{Cf}/u,
  private_use: /\p{Co}/u,
  surrogate: /\p{Cs}/u,

  lowercase_letter: /\p{Ll}/u,
  modifier_letter: /\p{Lm}/u,
  titlecase_letter: /\p{Lt}/u,
  uppercase_letter: /\p{Lu}/u,
  cased_letter: /\p{LC}/u,
  letter: /\p{L}/u,

  spacing_mark: /\p{Mc}/u,
  enclosing_mark: /\p{Me}/u,
  nonspacing_mark: /\p{Mn}/u,
  mark: /\p{M}/u,

  decimal_number: /\p{Nd}/u,
  letter_number: /\p{Nl}/u,
  other_number: /\p{No}/u,
  number: /\p{N}/u,

  connector_punctuation: /\p{Pc}/u,
  dash_punctuation: /\p{Pd}/u,
  clone_punctuation: /\p{Pe}/u,
  final_punctuation: /\p{Pf}/u,
  initial_punctuation: /\p{Pi}/u,
  other_punctuation: /\p{Po}/u,
  punctuation: /\p{P}/u,

  currency_symbol: /\p{Sc}/u,
  modifier_symbol: /\p{Sk}/u,
  math_symbol: /\p{Sm}/u,
  other_symbol: /\p{So}/u,
  symbol: /\p{S}/u,

  line_separator: /\p{Zl}/u,
  paragraph_separator: /\p{Zp}/u,
  space_separator: /\p{Zs}/u,
  separator: /\p{Z}/u,
} as const;
export const radii = '0123456789abcdefghijklmnopqrstuvwxyz' as const;
