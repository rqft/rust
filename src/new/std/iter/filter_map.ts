// import { staticify } from '../../../tools';
// import type { FnMut } from '../ops';
// import type { Option } from '../option';
// import { IteratorImpl } from './iterator';

// // @ts-expect-error ts(2714)
// class FilterMapImpl<T, B> extends IteratorImpl<B> {
//   constructor(iter: Iterable<T>, f: FnMut<[T], Option<B>>) {
//     const p = iter[Symbol.iterator]();
//     super(
//       (function* (): Generator<B, void, undefined> {
//         const item = p.next();
//         if (!item.done) {
//           const output = f(item.value);
//           if (output.is_some()) {
//             yield output.unwrap();
//           }
//         }
//       })()
//     );
//   }

//   public static new<T, B>(
//     iter: Iterable<T>,
//     f: FnMut<[T], Option<B>>
//   ): FilterMapImpl<T, B> {
//     return new this(iter, f);
//   }
// }

// export type FilterMap<T, B> = FilterMapImpl<T, B>;
// export const FilterMap = staticify(FilterMapImpl);
