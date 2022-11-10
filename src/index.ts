export { iter } from './lib/iter';
export { None, Option, Some } from './lib/option';
export {
  range,
  rangeFrom,
  rangeFull,
  rangeInclusive,
  rangeTo,
  rangeToInclusive
} from './lib/range';
export { Err, Ok, result as Result } from './lib/result';
export * as traits from './lib/traits';

import { range } from './lib/range';

const p = [1, 2, 3, 4, 5, 6, 7];
//         -  -  -  x  x  x  -

console.log(range(0, 0));