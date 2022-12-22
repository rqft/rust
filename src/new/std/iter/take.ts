// import { staticify } from '../../../tools';
// import { IteratorImpl } from './iterator';

// // @ts-expect-error ts(2714)
// class TakeImpl<T, N extends number> extends IteratorImpl<T> {
//   constructor(iter: Iterable<T>, n: N) {
//     let i = 0;
//     super(
//       (function* (): Generator<T, void, unknown> {
//         for (const item of iter) {
//           if (i++ <= n) {
//             yield item;
//           }

//           break;
//         }
//       })()
//     );
//   }

//   public static new<T, N extends number>(
//     iter: Iterable<T>,
//     n: N
//   ): TakeImpl<T, N> {
//     return new this(iter, n);
//   }
// }

// export type Take<T, N extends number> = TakeImpl<T, N>;
// export const Take = staticify(TakeImpl);
