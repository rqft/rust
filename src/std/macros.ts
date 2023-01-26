import type { PartialEq } from './cmp';
import type { usize } from './number';
import type { Option } from './option';
import { None, Some } from './option';
import { panic } from './panic';
import { Vec } from './vec';

export function assert(x: unknown, message?: string): asserts x {
  if (!x) {
    panic(`assertion failed: ${message || `${x} is not truthy`}`);
  }
}

export function assert_eq(
  x: unknown,
  y: unknown,
  message?: string
): asserts x is typeof y {
  const wrap_ne = 'ne' in (x as PartialEq<unknown>) && typeof (x as PartialEq<unknown>).ne === 'function';
  if (
    (wrap_ne && (x as PartialEq<unknown>).ne(y)) ||
    x != y
  ) {
    console.log(x, y);
    panic(`assertion failed: ${message || `${x} == ${y}`}`);
  }
}

export function assert_ne(x: unknown, y: unknown, message?: string): void {
  if (
    ('eq' in (x as PartialEq<unknown>) &&
      typeof (x as PartialEq<unknown>).eq === 'function' &&
      (x as PartialEq<unknown>).eq(y)) ||
    x == y
  ) {
    panic(`assertion failed: ${message || `${x} != ${y}`}`);
  }
}

export function is_node(): boolean {
  if (typeof process === 'object') {
    if (typeof process.versions === 'object') {
      if (typeof process.versions.node !== 'undefined') {
        return true;
      }
    }
  }

  return false;
}

export function cfg(
  flag: keyof NodeJS.Process['config']['variables']
): boolean {
  assert(is_node());

  return !!process.config.variables[flag];
}

export function column(): usize {
  unimplemented('column');
}

export function compile_error(msg: unknown): void {
  void msg;
  unimplemented('compile_error');
}

export function concat(...values: Array<unknown>): string {
  return values.join('');
}

export function dbg(value: unknown): void {
  console.debug(value);
}

export function debug_assert(x: unknown, message?: string): asserts x {
  if (!x) {
    panic(`debug assertion failed: ${message || `${x} is not truthy`}`);
  }
}

export function debug_assert_eq(
  x: unknown,
  y: unknown,
  message?: string
): asserts x is typeof y {
  if (x != y) {
    panic(`debug assertion failed: ${message || `${x} == ${y}`}`);
  }
}

export function debug_assert_ne(
  x: unknown,
  y: unknown,
  message?: string
): void {
  if (x == y) {
    panic(`debug assertion failed: ${message || `${x} != ${y}`}`);
  }
}

export function env(variable: string, message?: string): string {
  assert(is_node(), message);

  const value = process.env[variable];

  assert(value, message);

  return value;
}

export function eprint(msg: string): void {
  assert(is_node());

  process.stderr.write(msg);
}

export function eprintln(msg: string): void {
  assert(is_node());

  process.stderr.write(msg + '\n');
}

export function file(): string {
  unimplemented('file');
}

export function format(literal: string, ...argv: Array<unknown>): string {
  void literal, argv;
  unimplemented('format');
}

export function format_args(literal: string, ...argv: Array<unknown>): string {
  void literal, argv;
  unimplemented('format_args');
}

export function include<T>(path: string): T {
  assert(is_node());

  return require(path);
}

export type X86Feature =
  | 'abm'
  | 'adx'
  | 'aes'
  | 'avx'
  | 'avx2'
  | 'avx512bf16'
  | 'avx512bitalg'
  | 'avx512bw'
  | 'avx512cd'
  | 'avx512dq'
  | 'avx512er'
  | 'avx512f'
  | 'avx512gfni'
  | 'avx512ifma'
  | 'avx512pf'
  | 'avx512vaes'
  | 'avx512vbmi'
  | 'avx512vbmi2'
  | 'avx512vl'
  | 'avx512vnni'
  | 'avx512vp2intersect'
  | 'avx512vpclmulqdq'
  | 'avx512vpopcntdq'
  | 'bmi1'
  | 'bmi2'
  | 'cmpxchg16b'
  | 'f16c'
  | 'fma'
  | 'fxsr'
  | 'lzcnt'
  | 'mmx'
  | 'pclmulqdq'
  | 'popcnt'
  | 'rdrand'
  | 'rdseed'
  | 'rtm'
  | 'sha'
  | 'sse'
  | 'sse2'
  | 'sse3'
  | 'sse4.1'
  | 'sse4.2'
  | 'sse4a'
  | 'ssse3'
  | 'tbm'
  | 'tsc'
  | 'xsave'
  | 'xsavec'
  | 'xsaveopt'
  | 'xsaves';
export function is_x86_feature_detected(feature: X86Feature): boolean {
  unimplemented(`is_x86_feature_detected(${feature})`);
}

export function line(): usize {
  unimplemented();
}

export function module_path(): string {
  assert(is_node());

  return process.cwd();
}

export function option_env(variable: string, message?: string): Option<string> {
  assert(is_node(), message);

  const value = process.env[variable];

  if (value === undefined) {
    return None;
  }

  return Some(value);
}

export { panic } from './panic';

export function print(msg: string): void {
  assert(is_node());

  process.stdout.write(msg);
}

export function println(msg: string): void {
  assert(is_node());

  process.stdout.write(msg + '\n');
}

export function stringify(x: unknown): string {
  return String(x);
}

export function todo(message = 'todo'): never {
  throw new Error('todo: ' + message);
}

export function unimplemented(message = 'unimplemented'): never {
  throw new Error('unimplemented: ' + message);
}

export function unreachable(message = 'unreachable'): never {
  throw new Error('unreachable: ' + message);
}

export function vec<T>(...argv: Array<T>): Vec<T> {
  return Vec.from_iter(argv);
}
