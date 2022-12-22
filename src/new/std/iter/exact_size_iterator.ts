// import { staticify } from '../../../tools';
// import { IteratorImpl } from './iterator';

// // @ts-expect-error ts(2714)
// class ExactSizeIteratorImpl<T, N extends number> extends IteratorImpl<T> {
//   constructor(iter: Iterable<T>, private size: N) {
//     super(
//       (function* (): Generator<T, void, unknown> {
//         let i = 0;
//         for (const value of iter) {
//           if (i++ <= size) {
//             yield value;
//           }
//         }
//       })()
//     );
//   }

//   public len(): N {
//     return this.size;
//   }

//   public is_empty(): N extends 0 ? true : false {
//     return (this.size === 0) as never;
//   }

//   public static new<T, N extends number>(
//     iter: Iterable<T>,
//     size: N
//   ): ExactSizeIteratorImpl<T, N> {
//     return new this(iter, size);
//   }
// }

// export type ExactSizeIterator<T, N extends number> = ExactSizeIteratorImpl<
//   T,
//   N
// >;
// export const ExactSizeIterator = staticify(ExactSizeIteratorImpl);
