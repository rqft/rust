import { size } from './new/std/number/size';

console.log(size(0x1234567890123456n).swap_bytes(64).valueOf().toString(16));
