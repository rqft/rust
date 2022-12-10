export interface Clone<T> {
  clone(this: T): T;
}
