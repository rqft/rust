import { vec } from './lib/vec';

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

console.log(vec.from([1,2]).fmtDebug());
