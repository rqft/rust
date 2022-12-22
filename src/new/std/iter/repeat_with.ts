// import { staticify } from '../../../tools';
// import type { FnMut } from '../ops';

// import { Repeat } from './repeat';

// // @ts-expect-error ts(2714)
// class RepeatWithImpl<T> extends Repeat<T> {
//   constructor(fn: FnMut<[], T>) {
//     super(fn());
//   }

//   public static new<T>(fn: FnMut<[], T>): RepeatWithImpl<T> {
//     return new this(fn);
//   }
// }

// export type RepeatWith<T> = RepeatWithImpl<T>;
// export const RepeatWith = staticify(RepeatWithImpl);
