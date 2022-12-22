// import { staticify } from '../../../tools';
// import type { Option } from '../option';
// import { None } from '../option';
// import { IteratorImpl } from './iterator';

// class FuseImpl<T> extends IteratorImpl<T> {
//   constructor(iter: Iterable<T>) {
//     super(iter);
//   }

//   private hit_none = false;

//   public next(): Option<T> {
//     if (this.hit_none) {
//       return None;
//     }

//     return super.next();
//   }

//   public static new<T>(iter: Iterable<T>): FuseImpl<T> {
//     return new this(iter);
//   }
// }

// export type Fuse<T> = FuseImpl<T>;
// export const Fuse = staticify(FuseImpl);
