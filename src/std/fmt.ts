import type { _ } from './custom';
import { assert, panic } from './macros';
import type { Result } from './result';
import { Err, Ok } from './result';
import { unit } from './tuple';

export type R = Result<unit, Error>;

export interface Binary {
  fmt_binary(): string;
}

export interface Debug {
  fmt_debug(): string;
}

export interface DebugAlternate {
  fmt_debug_alternate(): string;
}

export interface Display {
  fmt_display(): string;
}

export interface LowerExp {
  fmt_lower_exp(): string;
}

export interface LowerHex {
  fmt_lower_hex(): string;
}

export interface Octal {
  fmt_octal(): string;
}

export interface Pointer {
  fmt_pointer(): string;
}

export interface UpperExp {
  fmt_upper_exp(): string;
}

export interface UpperHex {
  fmt_upper_hex(): string;
}

export interface Precision {
  fmt_precision(precision: number): string;
}

export interface Signed {
  fmt_signed(): '-' | '+';
}

export class Error {
  constructor(public message: string) {}
}

export enum Alignment {
  Left = '<',
  Right = '>',
  Center = '^',
  Unknown = '',
}

export class Formatter {
  private r_buf: string;
  private argv: Record<string, _> = {};
  private result: R = Ok(unit());
  constructor(buf: string) {
    this.r_buf = buf;
  }

  public with(argv: Record<string, _>): this {
    Object.assign(this.argv, argv);
    return this;
  }

  public write_fmt(str: string, ...args: Array<_>): R {
    let ctr = 0;
    const fmt_r =
      /\{{2}|\}{2}|\{(.*?)(?::(#)?((?:x|X|e|E|)(?:\?)|b|o|p)?(?:(.?)(\^|<|>)(\d+))?)?(?:\.(\d+))?(?:(\+|0\d+|-))?\}/g;
    try {
      return this.write(
        str.replace(
          fmt_r,
          (
            $,
            $tag: string,
            $alternate: string,
            $modifier: string | undefined,
            $align_char: string | undefined,
            $align_type: string | undefined,
            $align_count: string | undefined,
            $precision: string,
            $sign: string
          ) => {
            if ($ === '{{') {
              return '{';
            }
            if ($ === '}}') {
              return '}';
            }

            const alternate = $alternate === '#';
            let obj;

            if ($tag === '') {
              obj = args[ctr++];
            } else if (Number($tag) in args) {
              obj = args[Number($tag)]; // do not increment ctr
            } else if ($tag in this.argv) {
              obj = this.argv[$tag];
            }

            if (obj === undefined) {
              throw new Error('unknown format tag');
            }

            if (alternate && $modifier === '') {
              throw new Error('no implementation for `Alternate & Display`');
            }

            let out = '';

            if ($modifier === '' || $modifier === undefined) {
              try {
                assert_has<Display>(obj, ['fmt_display'], 'Display');
                out += obj.fmt_display();
              } catch {
                // default implementation for Display
                out += String(obj);
              }
            } else if ($modifier === '?') {
              if (alternate) {
                assert_has<DebugAlternate>(
                  obj,
                  ['fmt_debug_alternate'],
                  'DebugAlternate'
                );
                out += obj.fmt_debug_alternate();
              } else {
                assert_has<Debug>(obj, ['fmt_debug'], 'Debug');
                out += obj.fmt_debug();
              }
            } else if ($modifier === 'x' || $modifier === 'x?') {
              assert_has<LowerHex>(obj, ['fmt_lower_hex'], 'LowerHex');
              if (alternate) {
                out += '0x';
              }
              out += obj.fmt_lower_hex();
            } else if ($modifier === 'X' || $modifier === 'X?') {
              assert_has<UpperHex>(obj, ['fmt_upper_hex'], 'UpperHex');
              if (alternate) {
                out += '0x';
              }
              out += obj.fmt_upper_hex();
            } else if ($modifier === 'e' || $modifier === 'e?') {
              assert_has<LowerExp>(obj, ['fmt_lower_exp'], 'LowerExp');
              out += obj.fmt_lower_exp();
            } else if ($modifier === 'E' || $modifier === 'E?') {
              assert_has<UpperExp>(obj, ['fmt_upper_exp'], 'UpperExp');
              out += obj.fmt_upper_exp();
            } else if ($modifier === 'b') {
              assert_has<Binary>(obj, ['fmt_binary'], 'Binary');
              if (alternate) {
                out += '0b';
              }
              out += obj.fmt_binary();
            } else if ($modifier === 'o') {
              assert_has<Octal>(obj, ['fmt_octal'], 'Octal');
              if (alternate) {
                out += '0o';
              }
              out += obj.fmt_octal();
            } else if ($modifier === 'p') {
              assert_has<Pointer>(obj, ['fmt_pointer'], 'Pointer');
              out += obj.fmt_pointer();
            } else if (!Number.isNaN(Number($precision))) {
              assert_has<Precision>(obj, ['fmt_precision'], 'Precision');
              out += obj.fmt_precision(Number($precision));
            }

            if ($sign === '+') {
              assert_has<Signed>(obj, ['fmt_signed'], 'Signed');
              out = obj.fmt_signed() + out;
            }
            // else if ($sign.startsWith('0')) {
            //   assert_has<Signed>(obj, ['fmt_signed'], 'Signed');
            //   const sign = obj.fmt_signed();
            //   const count = Number($sign.slice(1));
            //   if (Number.isNaN(count)) { throw new Error('invalid signed width'); }
            //   while ((out.length + sign.length) < count) {
            //     out = '0' + out;
            //   }

            //   out = sign + out;
            // }

            if ($align_count !== undefined && $align_type !== undefined) {
              $align_char ||= ' ';
              const count = Number($align_count);

              if (Number.isNaN(count)) {
                throw new Error('invalid alignment count');
              }

              if ($align_type === Alignment.Left) {
                while (out.length < count) {
                  out += $align_char;
                }
              } else if ($align_type === Alignment.Center) {
                while (out.length < count) {
                  if (count - out.length === 1) {
                    // prefer append right?
                    out += $align_char;
                    break;
                  }

                  out = $align_char + out + $align_char;
                }
              } else if ($align_type === Alignment.Right) {
                while (out.length < count) {
                  out = $align_char + count;
                }
              }
            }

            return out;
          }
        )
      );
    } catch (e) {
      return (this.result = Err(e as Error));
    }
  }

  public write(str: string): R {
    this.r_buf += str;
    return Ok(unit());
  }

  public finish(): Result<string, Error> {
    if (this.result.is_err()) {
      return Err(this.result.unwrap_err());
    }
    return Ok(this.r_buf);
  }
}

function assert_has<T>(
  u: unknown,
  keys: Array<keyof T>,
  name: string
): asserts u is T {
  for (const key of keys) {
    assert(u, `\`${name}\` cannot be implemented for undefined`);
    assert(u[key as never], `object does not implement \`${name}\``);
  }
}

export class DebugList {
  private readonly parts: Array<Debug> = [];
  public entry(entry: Debug): this {
    this.parts.push(entry);
    return this;
  }

  public entries(entries: Iterable<Debug>): this {
    for (const entry of entries) {
      this.entry(entry);
    }

    return this;
  }

  public finish(): string {
    return `[${this.parts.map((x) => x.fmt_debug()).join(', ')}]`;
  }
}

export class DebugMap {
  private dangling?: Debug;
  private readonly parts: Map<Debug, Debug> = new Map();

  public key(key: Debug): this {
    this.dangling = key;
    return this;
  }

  public value(value: Debug): this {
    if (this.dangling === undefined) {
      panic('cannot add dangling values without key');
    }

    this.parts.set(this.dangling, value);
    return this;
  }

  public entry(key: Debug, value: Debug): this {
    if (this.dangling !== undefined) {
      panic(
        'cannot add entry with dangling key `' + this.dangling.fmt_debug() + '`'
      );
    }

    this.parts.set(key, value);
    return this;
  }

  public entries<K extends Debug, V extends Debug>(
    entries: Iterable<[K, V]>
  ): this {
    for (const [k, v] of entries) {
      this.entry(k, v);
    }

    return this;
  }

  public finish(): Result<string, Error> {
    if (this.dangling !== undefined) {
      return Err(new Error('cannot finish DebugMap with a dangling key'));
    }

    let out = '';

    out += '{';
    let had_before = false;
    for (const [k, v] of this.parts) {
      out += had_before ? ',' : '';
      out += k;
      out += v;
      had_before = true;
    }

    out += '}';
    return Ok(out);
  }
}

export class DebugSet {
  private readonly parts: Array<Debug> = [];
  public entry(entry: Debug): this {
    this.parts.push(entry);
    return this;
  }

  public entries(entries: Iterable<Debug>): this {
    for (const entry of entries) {
      this.entry(entry);
    }

    return this;
  }

  public finish(): string {
    return `{${this.parts.map((x) => x.fmt_debug()).join(', ')}}`;
  }
}

export class DebugStruct {
  private readonly fields: Record<string, Debug> = {};
  constructor(private readonly name: string) {}

  public field(name: string, value: Debug): this {
    this.fields[name] = value;
    return this;
  }

  public finish_non_exhaustive(): string {
    const set = new DebugSet()
      .entries(
        Object.entries(this.fields).map(([k, v]) => ({
          fmt_debug(): string {
            return `${k}: ${v.fmt_debug()}`;
          },
        }))
      )
      .entry({
        fmt_debug() {
          return '..';
        },
      })
      .finish();
    return `${this.name} ${set}`;
  }

  public finish(): string {
    const set = new DebugSet()
      .entries(
        Object.entries(this.fields).map(([k, v]) => ({
          fmt_debug(): string {
            return `${k}: ${v.fmt_debug()}`;
          },
        }))
      )
      .finish();
    return `${this.name} ${set}`;
  }
}

export class DebugTuple {
  constructor(private readonly name = '') {}

  private readonly fields: Array<Debug> = [];
  public field(value: Debug): this {
    this.fields.push(value);
    return this;
  }

  public finish(): string {
    return `${this.name}(${this.fields.map((x) => x.fmt_debug()).join(', ')})`;
  }
}
