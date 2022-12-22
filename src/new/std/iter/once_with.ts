// import { staticify } from '../../../tools';
// import type { FnMut } from '../ops';

// import { Once } from './once';

// // @ts-expect-error ts(2714)
// class OnceWithImpl<T> extends Once<T> {
//   constructor(fn: FnMut<[], T>) {
//     super(fn());
//   }

//   public static new<T>(fn: FnMut<[], T>): OnceWithImpl<T> {
//     return new this(fn);
//   }
// }

// export type OnceWith<T> = OnceWithImpl<T>;
// export const OnceWith = staticify(OnceWithImpl);
