// import { staticify } from '../../../tools';
// import type { Option } from '../option';
// import { None, Some } from '../option';
// import { Iterator, IteratorImpl } from './iterator';

// // @ts-expect-error ts(2417)
// class ZipImpl<T, U> extends IteratorImpl<[T, U]> {
//   private t: Iterator<T>;
//   private u: Iterator<U>;
//   constructor(T: Iterable<T>, U: Iterable<U>) {
//     super([]);
//     this.t = Iterator(T);
//     this.u = Iterator(U);
//   }

//   public next(): Option<[T, U]> {
//     const p = this.t.next();
//     const q = this.u.next();

//     if (p.is_none() || q.is_none()) {
//       return None;
//     }

//     return Some([p, q] as [T, U]);
//   }

//   public unzip(): [Iterator<T>, Iterator<U>] {
//     return [this.t, this.u];
//   }

//   public static new<T, U>(start: Iterable<T>, end: Iterable<U>): ZipImpl<T, U> {
//     return new this(start, end);
//   }
// }

// export type Zip<T, U> = ZipImpl<T, U>;
// export const Zip = staticify(ZipImpl);
