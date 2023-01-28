// import type { char } from './char';
// import type { _ } from './custom';
// import type { Result } from './result';
// import { Err, Ok } from './result';
// import type { str } from './str';
// import { unit } from './tuple';

// export type R = Result<unit, Error>;

// export interface Binary {
//   fmt_binary(formatter: Formatter): R;
// }

// export interface Debug {
//   fmt_debug(formatter: Formatter): R;
// }

// export interface Display {
//   fmt_display(formatter: Formatter): R;
// }

// export interface LowerExp {
//   fmt_lower_exp(formatter: Formatter): R;
// }

// export interface LowerHex {
//   fmt_lower_hex(formatter: Formatter): R;
// }

// export interface Octal {
//   fmt_octal(formatter: Formatter): R;
// }

// export interface Pointer {
//   fmt_pointer(formatter: Formatter): R;
// }

// export interface UpperExp {
//   fmt_upper_exp(formatter: Formatter): R;
// }

// export interface UpperHex {
//   fmt_upper_hex(formatter: Formatter): R;
// }

// export interface Write {
//   write_str(s: str): R;
//   write_char<T extends string>(c: char<T>): R;
// }

// export class Error {}

// export enum Alignment {
//   Left,
//   Right,
//   Center,
//   Unknown,
// }

// export class Formatter {
//   private r_buf: string;
//   private argv: Record<string, _> = {};
//   constructor(buf: string) {
//     this.r_buf = buf;
//   }

//   public with(argv: Record<string, _>): this {
//     Object.assign(this.argv, argv);
//     return this;
//   }

//   public write_fmt(str: string, ...args: Array<_>): R {
//     let out = '';
//     const ctr = 0;
//     for (let i = 0; i < str.length; i++) {
//       const char = str[i] || '';

//       if (char === '{') {
//         const next = str[i + 1];

//         if (next === undefined) {
//           return Err(new Error());
//         }

//         if (next === '{') {
//           out += next;
//           i++;
//           continue;
//         }

//         let full = '';
//         while (str[i++] !== '}') {
//           full += str[i];
//         }

//         const tag = full.replace(/(.*):.*/g, '$1');
//         const modifiers = full.replace(/.*:(.*)/g, '$1');
//       } else if (char === '}') {
//         const next = str[i + 1];

//         if (next === '}') {
//           out += next;
//           i++;
//           continue;
//         }

//         return new Err(new Error());
//       } else {
//         out += char;
//       }
//     }

//     return this.write(out);
//   }

//   public write(str: string): R {
//     this.r_buf += str;
//     return Ok(unit());
//   }

//   public finish(): string {
//     return this.r_buf;
//   }
// }
export const a = 1;