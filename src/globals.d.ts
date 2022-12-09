import type { ops } from './std/ops';
export namespace globalThis {
  export interface Number
    extends ops.Add<number>,
      ops.AddAssign<number>,
      ops.BitAnd<number>,
      ops.BitAndAssign<number>,
      ops.BitOr<number>,
      ops.BitOrAssign<number>,
      ops.Construct<[number], number>,
      ops.Deref<number>,
      ops.DerefMut<number>,
      ops.Div<number>,
      ops.DivAssign<number>,
      ops.Drop,
      ops.Mul<number>,
      ops.MulAssign<number>,
      ops.Neg<number>,
      ops.Not<number>,
      ops.Rem<number>,
      ops.RemAssign<number>,
      ops.Shl<number>,
      ops.ShlAssign<number>,
      ops.Shr<number>,
      ops.ShrAssign<number>,
      ops.Sub<number>,
      ops.SubAssign<number> {}
}

export { };

