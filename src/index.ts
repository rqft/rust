import { isize } from './new/std/number/isize';

console.log(isize(0x1234567890123456n).swap_bytes().as_primitive().toString(16));
