export interface Default<T> {
  default(this: T): T;
}

export function get_default<U>(type: Default<U>): U {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (type as any).default();
}
