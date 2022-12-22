// import { staticify } from '../../../tools';
// import { IteratorImpl } from './iterator';

// // @ts-expect-error ts(2714)
// class EnumerateImpl<T> extends IteratorImpl<[number, T]> {
//   constructor(iter: Iterable<T>) {
//     let i = 0;
//     super(
//       (function* (): Generator<[number, T], void, undefined> {
//         for (const value of iter) {
//           yield [i++, value];
//         }
//       })()
//     );
//   }

//   public static new<T>(iter: Iterable<T>): EnumerateImpl<T> {
//     return new this(iter);
//   }
// }

// export type Enumerate<T> = EnumerateImpl<T>;
// export const Enumerate = staticify(EnumerateImpl);
