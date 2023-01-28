export namespace std {
  export async function awaited<T>(value: T): Promise<Awaited<T>> {
    if (typeof value === "object" && value instanceof Promise) {
      return value.then(awaited) as Awaited<T>;
    }

    return value as Awaited<T>;
  }

  export function partial<T>(value: T): Partial<T> {
    return value;
  }

  export function required<T>(
    keys: Array<keyof T> | keyof T,
    value: T
  ): Required<T> {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    for (const key of keys) {
      if (
        !(key in (value as object)) ||
        (value[key] as unknown) === undefined
      ) {
        throw new Error(
          "Type 'T' does not match the predicate for 'Required<T>': missing key " +
            String(key)
        );
      }
    }

    return value as Required<T>;
  }

  export function readonly<T>(value: T): Readonly<T> {
    return Object.freeze(value);
  }

  export function record<K extends PropertyKey, V>(
    keys: Array<K> | K,
    value: V
  ): Record<K, V> {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    const p = {} as Record<K, V>;

    for (const key of keys) {
      p[key] = value;
    }

    return p;
  }

  export function pick<T, K extends keyof T>(
    value: T,
    keys: Array<K> | K
  ): Pick<T, K> {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    const o = {} as Pick<T, K>;

    for (const key of keys) {
      o[key] = value[key];
    }

    return o;
  }

  export function omit<T, K extends keyof T>(
    value: T,
    keys: Array<K> | K
  ): Omit<T, K> {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    const o = {} as Omit<T, K>;

    for (const key in value) {
      if (!keys.includes(key as never as K)) {
        o[key as never] = value[key] as never;
      }
    }

    return o;
  }

  export function exclude<U, E>(
    union: Array<U> | U,
    members: Array<E> | E
  ): Array<Exclude<U, E>> {
    if (!Array.isArray(union)) {
      union = [union];
    }

    if (!Array.isArray(members)) {
      members = [members];
    }

    const i = [] as Array<Exclude<U, E>>;

    for (const value of union) {
      if (!members.includes(value as never as E)) {
        i.push(value as never);
      }
    }

    return i;
  }

  export function extract<U, E>(
    union: Array<U> | U,
    members: Array<E> | E
  ): Array<Extract<U, E>> {
    if (!Array.isArray(union)) {
      union = [union];
    }

    if (!Array.isArray(members)) {
      members = [members];
    }

    const i = [] as Array<Extract<U, E>>;

    for (const value of union) {
      if (members.includes(value as never as E)) {
        i.push(value as never);
      }
    }

    return i;
  }

  export function non_nullable<T>(value: T): NonNullable<T> {
    if (value === undefined || value === null) {
      throw new Error(
        "Type 'T' does not match the predicate for 'NonNullable<T>'"
      );
    }

    return value;
  }

  export function instance_type<
    T extends abstract new (...args: Array<unknown>) => unknown
  >(value: T): InstanceType<T> {
    return value.prototype;
  }

  export function this_parameter_type<T>(value: T): ThisParameterType<T> {
    function get_this_parameter(this: unknown): ThisParameterType<T> {
      return this as ThisParameterType<T>;
    }

    if (typeof value === "function") {
      return get_this_parameter.apply(value);
    }

    return undefined as ThisParameterType<T>;
  }

  export function omit_this_parameter<T>(value: T): OmitThisParameter<T> {
    if (typeof value === "function") {
      return value.bind(globalThis);
    }

    return undefined as OmitThisParameter<T>;
  }

  export function uppercase<T extends string>(value: T): Uppercase<T> {
    return value.toUpperCase() as never;
  }

  export function lowercase<T extends string>(value: T): Lowercase<T> {
    return value.toLowerCase() as never;
  }

  export function capitalize<T extends string>(value: T): Capitalize<T> {
    return (value.charAt(0).toUpperCase() + value.slice(1)) as never;
  }

  export function uncapitalize<T extends string>(value: T): Uncapitalize<T> {
    return (value.charAt(0).toLowerCase() + value.slice(1)) as never;
  }

  // other

  export function readonly_array<T extends Array<unknown>>(
    value: T
  ): ReadonlyArray<T> {
    return Object.freeze(value) as ReadonlyArray<T>;
  }
}
