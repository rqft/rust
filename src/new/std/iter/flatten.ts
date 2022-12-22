// import { staticify } from '../../../tools';
// import type { _ } from '../custom';
// import { IteratorImpl } from './iterator';

// // @ts-expect-error ts(2714)
// class FlattenImpl<T> extends IteratorImpl<T extends Iterable<infer U> ? U : T> {
//   constructor(iter: Iterable<Iterable<T> | T>) {
//     super(
//       (function* (): Generator<_, void, unknown> {
//         for (const value of iter) {
//           if (
//             typeof value === 'object' &&
//             Symbol.iterator in (value as object)
//           ) {
//             for (const item of value as Iterable<_>) {
//               yield item;
//             }

//             continue;
//           }

//           yield value as _;
//         }
//       })()
//     );
//   }

//   public static new<T>(iter: Iterable<Iterable<T> | T>): FlattenImpl<T> {
//     return new this(iter);
//   }
// }

// export type Flatten<T> = FlattenImpl<T>;
// export const Flatten = staticify(FlattenImpl);
