// import { staticify } from '../../../tools';
// import type { FnMut } from '../ops';
// import { IteratorImpl } from './iterator';

// // @ts-expect-error ts(2714)
// class InspectImpl<T> extends IteratorImpl<T> {
//   constructor(iter: Iterable<T>, f: FnMut<[T]>) {
//     super(
//       (function* (): Generator<T, void, unknown> {
//         for (const value of iter) {
//           f(value);
//           yield value;
//         }
//       })()
//     );
//   }

//   public static new<T>(iter: Iterable<T>, f: FnMut<[T]>): InspectImpl<T> {
//     return new this(iter, f);
//   }
// }

// export type Inspect<T> = InspectImpl<T>;
// export const Inspect = staticify(InspectImpl);
