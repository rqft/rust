// import { staticify } from '../../../tools';
// import type { FnMut } from '../ops';
// import type { Option } from '../option';
// import { Iterator, IteratorImpl } from './iterator';

// // @ts-expect-error ts(2714)
// class MapWhileImpl<T, B> extends IteratorImpl<B> {
//   constructor(iter: Iterable<T>, predicate: FnMut<[T], Option<B>>) {
//     super(
//       Iterator(iter)
//         .map((p) => predicate(p))
//         .take_while((x: Option<B>) => x.is_some())
//         .map((x) => x.unwrap())
//     );
//   }

//   public static new<T, B>(
//     iter: Iterable<T>,
//     predicate: FnMut<[T], Option<B>>
//   ): MapWhileImpl<T, B> {
//     return new this(iter, predicate);
//   }
// }

// export type MapWhile<T, B> = MapWhileImpl<T, B>;
// export const MapWhile = staticify(MapWhileImpl);
