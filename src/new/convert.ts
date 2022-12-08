export namespace convert {
  export type Infallible = never;
  export interface AsMut<T> {
    as_mut(): T;
  }

  export interface AsRef<T> {
    as_ref(): T;
  }

  export interface From<T, Into> {
    from(value: T): Into;
  }

  export interface Into<T> {
    into(): T;
  }
}
