import type { bool } from './new/std/bool';
import type {
  Add,
  AddAssign,
  BitAnd,
  BitAndAssign,
  BitOr,
  BitOrAssign,
  Deref,
  DerefMut,
  Div,
  DivAssign,
  Drop,
  Mul,
  MulAssign,
  Neg,
  Not,
  Rem,
  RemAssign,
  Shl,
  ShlAssign,
  Shr,
  ShrAssign,
  Sub,
  SubAssign
} from './new/std/ops';
declare global {
  export interface Number
    extends Add<number>,
      AddAssign<number>,
      BitAnd<number>,
      BitAndAssign<number>,
      BitOr<number>,
      BitOrAssign<number>,
      Deref<number>,
      DerefMut<number>,
      Div<number>,
      DivAssign<number>,
      Drop,
      Mul<number>,
      MulAssign<number>,
      Neg<number>,
      Not<number>,
      Rem<number>,
      RemAssign<number>,
      Shl<number>,
      ShlAssign<number>,
      Shr<number>,
      ShrAssign<number>,
      Sub<number>,
      SubAssign<number> {}

  export type Boolean = bool<boolean>;
}

export { };

