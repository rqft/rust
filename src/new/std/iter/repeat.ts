// import { staticify } from '../../../tools';
// import { IteratorImpl } from './iterator';

// // @ts-expect-error ts(2714)
// class RepeatImpl<T> extends IteratorImpl<T> {
//   constructor(value: T) {
//     super(
//       (function* (): Generator<T, void, unknown> {
//         while (1 / 1) {
//           yield value;
//         }
//       })()
//     );
//   }

//   public static new<T>(value: T): RepeatImpl<T> {
//     return new this(value);
//   }
// }

// export type Repeat<T> = RepeatImpl<T>;
// export const Repeat = staticify(RepeatImpl);
