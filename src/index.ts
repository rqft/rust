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

import { char } from './lib/char';

for (const c of char.new('\n').escapeUnicode().collect()) {
  process.stdout.write(c.str());
}