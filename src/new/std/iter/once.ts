// import { staticify } from '../../../tools';
// import { IteratorImpl } from './iterator';

// // @ts-expect-error ts(2714)
// class OnceImpl<T> extends IteratorImpl<T> {
//   constructor(value: T) {
//     super(
//       (function* (): Generator<T, void, unknown> {
//         yield value;
//       })()
//     );
//   }

//   public static new<T>(value: T): OnceImpl<T> {
//     return new this(value);
//   }
// }

// export type Once<T> = OnceImpl<T>;
// export const Once = staticify(OnceImpl);
