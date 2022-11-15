import type { StrLike } from './str';
import { str } from './str';
import type { Debug, Display } from './traits';

export function assert(value: unknown, content = `${value}`): asserts value {
  if (!value) {
    throw new Error('Assertion failed: ' + content);
  }
}

export function assertEq(
  value: unknown,
  other: unknown,
  content = `${value} == ${other}`
): void {
  if (value != other) {
    throw new Error('Assertion failed: ' + content);
  }
}

export function assertNe(
  value: unknown,
  other: unknown,
  content = `${value} != ${other}`
): void {
  if (value == other) {
    throw new Error('Assertion failed: ' + content);
  }
}

export function concat(...args: Array<unknown>): string {
  return args.join('');
}

export function format(content: string, argv: object = [] as never): string {
  if (!Array.isArray(argv)) {
    argv = Object.assign([], argv);
  }

  let idx = 0;
  return content
    .replace(/\{{2}|\}{2}/, (x) => (x == '{{' ? '\u{fffe}' : '\u{ffff}'))
    .replace(/\{(.*?)\}/g, (_, i) => {
      i ??= '';
      if (typeof i !== 'string') {
        return _;
      }

      const [, tag, modifier] = /^(.*?)(?::(.*?))$/.exec(i) || [];

      let name: unknown = tag;
      if ((tag || '') in argv) {
        name = argv[tag as never];
      } else if (tag === '' || i === '') {
        if (idx >= Object.keys(argv).filter((x) => !Number.isNaN(x)).length) {
          throw new Error('args already exhausted');
        }

        name = argv[idx++ as never];
      }

      if (name === undefined) {
        name = 'undefined';
      }

      if (typeof name === 'object' || typeof name === 'function') {
        if (modifier?.split(':').includes('?')) {
          if ('fmtDebug' in (name as Debug)) {
            name = (name as Debug).fmtDebug();
          } else {
            throw new Error(`${name} does not impl trait \`Debug\``);
          }
        } else if ('fmt' in (name as Display)) {
          name = (name as Display).fmt();
        }
      }

      let out = String(name);

      if (modifier === undefined) {
        return out;
      }

      for (const mod of modifier.split(':')) {
        // width
        width: {
          const [uexec, fill, type, amount] =
            /(.*)(<|>|\^)(.*)/.exec(mod) || [];

          if (uexec === undefined) {
            break width;
          }

          const width = Number.parseInt(
            (amount || '').endsWith('$')
              ? format(`{${amount}}`, argv)
              : amount || ''
          );

          switch (type) {
          case '<': {
            out = out.padStart(width, fill || ' ');
            break width;
          }

          case '>': {
            out = out.padEnd(width, fill || ' ');
            break width;
          }

          case '^': {
            out
              .padStart(
                out.length + Math.floor((width - out.length) / 2),
                ' '
              )
              .padEnd(width, ' ');
            break width;
          }

          default: {
            break width;
          }
          }
        }

        sign: {
          if (mod === '+') {
            const p = format('{out}', Object.assign([], { out }));
            if (p.startsWith('-')) {
              out = p;
              break sign;
            }
          }

          if (mod.startsWith('#')) {
            const m = mod.slice(1);
            out = '0' + m.toLowerCase() + format(`{out:${m}}`, { out });
            break sign;
          }
        }

        precision: if (mod.startsWith('.')) {
          const prec = mod.endsWith('$')
            ? format(`{${mod.slice(1)}}`, argv)
            : mod.slice(1);

          out = Number(out).toPrecision(Number.parseInt(prec));
          break precision;
        }

        spec: switch (mod) {
        case 'x': {
          out = Number(out).toString(16);
          break spec;
        }

        case 'X': {
          out = Number(out).toString(16).toUpperCase();
          break spec;
        }

        case 'o': {
          out = Number(out).toString(8);
          break spec;
        }

        case 'b': {
          out = Number(out).toString(2);
          break spec;
        }

        case 'e': {
          out = Number(out).toExponential();
          break spec;
        }
        }
      }

      return out;
    })
    .replace(/\u{fffe}|\u{ffff}/, (x) => (x === '\ufffe' ? '{' : '}'));
}

export let stderr: Array<string> = [];
export let stdout: Array<string> = [];

export function write(
  to: Array<string>,
  content: string,
  argv: object = []
): void {
  to.push(format(content, argv));
}

export function writeln(
  to: Array<string>,
  content: string,
  argv: object = []
): void {
  write(to, content, argv);
  write(to, '\n');
}

export function print(content: string, argv: object = []): void {
  write(stdout, content, argv);
  if (stdout[stdout.length - 1] === '\n') {
    console.log(stdout.join(''));
    stdout = [];
  }
}

export function println(content: string, argv: object = []): void {
  print(content, argv);
  print('\n');
}

export function eprint(content: string, argv: object = []): void {
  write(stderr, content, argv);
  if (stderr[stderr.length - 1] === '\n') {
    console.log(stdout.join(''));
    stderr = [];
  }
}

export function eprintln(content: string, argv: object = []): void {
  eprint(content, argv);
  eprint('\n');
}

export function matches(content: StrLike): boolean {
  return str.new(content).matches(content).count() > 0;
}

export function panic(content: string): never {
  throw new Error(content);
}

export function todo(content = 'todo'): never {
  panic(content);
}

export function unimplemented(content = 'unimplemented'): never {
  panic(content);
}

export function unreachable(content = 'unreachable'): never {
  panic(content);
}

export { vec } from './vec';

