// import type { Option } from '../../lib';
// import { Some } from '../../lib';
// import { None } from '../../lib';
// import { staticify } from '../../tools';

// class IteratorImpl<T> {
//   constructor(private iter: Iterable<T>) {}

//   public static new<T>(iter: Iterable<T>): IteratorImpl<T> {
//     return new this(iter);
//   }

//   private get dyn(): globalThis.Iterator<T> {
//     return this.iter[Symbol.iterator]();
//   }

//   public next(): Option<T> {
//     const i = this.dyn.next();
//     if (i.value === undefined && i.done) {
//       return None;
//     }

//     return Some(i.value);
//   }

//   public next
// }

// export type Iterator<T> = IteratorImpl<T>;
// export const Iterator = staticify(IteratorImpl);
