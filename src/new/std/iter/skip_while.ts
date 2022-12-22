// import { staticify } from '../../../tools';
// import type { FnMut } from '../ops';
// import type { Option } from '../option';
// import { None } from '../option';
// import { IteratorImpl } from './iterator';

// // @ts-expect-error ts(2714)
// class SkipWhileImpl<T, P extends FnMut<[T], boolean>> extends IteratorImpl<T> {
//   constructor(iter: Iterable<T>, private predicate: P) {
//     super(iter);
//   }

//   private hit_true = false;

//   public next(): Option<T> {
//     if (this.hit_true) {
//       return None;
//     }

//     let value = super.next();

//     while (value.is_some()) {
//       if (this.predicate(value.unwrap())) {
//         value = super.next();
//       }
//     }

//     return value;
//   }

//   public static new<T, P extends FnMut<[T], boolean>>(
//     iter: Iterable<T>,
//     predicate: P
//   ): SkipWhileImpl<T, P> {
//     return new this(iter, predicate);
//   }
// }

// export type SkipWhile<T, P extends FnMut<[T], boolean>> = SkipWhileImpl<T, P>;
// export const SkipWhile = staticify(SkipWhileImpl);
