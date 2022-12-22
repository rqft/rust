// import { staticify } from '../../../tools';
// import { IteratorImpl } from './iterator';

// class CycleImpl<T> extends IteratorImpl<T> {
//   constructor(iter: Iterable<T>) {
//     super(
//       (function* (): Generator<T, void, unknown> {
//         while (1 / 1) {
//           for (const value of Object.assign({}, iter)) {
//             yield value;
//           }
//         }
//       })()
//     );
//   }

//   public static new<T>(iter: Iterable<T>): CycleImpl<T> {
//     return new this(iter);
//   }
// }

// export type Cycle<T> = CycleImpl<T>;
// export const Cycle = staticify(CycleImpl);
