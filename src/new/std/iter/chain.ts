// import { staticify } from '../../../tools';
// import type { Option } from '../option';
// import { IteratorImpl } from './iterator';

// // @ts-expect-error ts(2417)
// class ChainImpl<T, U> extends IteratorImpl<T | U> {
//   constructor(start: Iterable<T>, end: Iterable<U>) {
//     super(
//       (function* (): Generator<T | U, void> {
//         for (const p of start) {
//           yield p;
//         }
//         for (const p of end) {
//           yield p;
//         }
//       })()
//     );
//   }

//   public next(): Option<T | U> {
//     return super.next();
//   }

//   public static new<T, U>(start: Iterable<T>, end: Iterable<U>): Chain<T, U> {
//     return new this(start, end);
//   }
// }

// export type Chain<T, U> = ChainImpl<T, U>;
// export const Chain = staticify(ChainImpl);
