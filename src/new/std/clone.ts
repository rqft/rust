export namespace clone {
  export interface Clone<T> {
    clone(this: T): T;
  }
}
