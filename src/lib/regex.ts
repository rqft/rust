import { staticify } from '../tools';
import { Iter, iter } from './iter';
import type { Option } from './option';
import { None, Some } from './option';
import type { Range } from './range';
import { range } from './range';
import type { Str, StrLike } from './str';
import { str } from './str';
import type { Copy, Debug, Display, Stringify } from './traits';
export class RegexBuilder<T extends string, F extends string> implements Copy {
  private pattern: T;
  private flags: F;
  constructor(pattern: `/${T}/${F}`) {
    console.log('open builder', pattern);
    const endingSlash = pattern.lastIndexOf('/');
    this.pattern = pattern.slice(1, endingSlash) as T;
    this.flags = pattern.slice(endingSlash + 1) as F;
  }

  public clone(): RegexBuilder<T, F> {
    return new RegexBuilder<T, F>(`/${this.pattern}/${this.flags}`);
  }

  public build(): Regex<T, F> {
    return new Regex(this.pattern, this.flags);
  }

  private flag<K extends string, U extends boolean | undefined = undefined>(
    flag: K,
    value?: U
  ): SetBuilderFlag<T, F, U, K> {
    if (value) {
      if (this.flags.includes(flag)) {
        return this as never;
      }

      this.flags = (this.flags + flag) as never;
      return this as never;
    }

    const index = this.flags.indexOf(flag);

    if (index === -1) {
      return this as never;
    }

    this.flags = (this.flags.slice(0, index) +
      this.flags.slice(index + 1)) as never;

    return this as never;
  }

  public caseInsensitive<U extends boolean | undefined = undefined>(
    yes?: U
  ): SetBuilderFlag<T, F, U, 'i'> {
    return this.flag('i', yes);
  }

  public multiLine<U extends boolean | undefined = undefined>(
    yes?: U
  ): SetBuilderFlag<T, F, U, 'm'> {
    return this.flag('m', yes);
  }

  public dotMatchesNewLine<U extends boolean | undefined = undefined>(
    yes?: U
  ): SetBuilderFlag<T, F, U, 's'> {
    return this.flag('s', yes);
  }

  public swapGreed<U extends boolean | undefined = undefined>(
    yes?: U
  ): SetBuilderFlag<T, F, U, 'U'> {
    return this.flag('U', yes);
  }

  public ignoreWhitespace<U extends boolean | undefined = undefined>(
    yes?: U
  ): SetBuilderFlag<T, F, U, 'x'> {
    return this.flag('x', yes);
  }

  public unicode<U extends boolean | undefined = undefined>(
    yes?: U
  ): SetBuilderFlag<T, F, U, 'u'> {
    return this.flag('u', yes);
  }

  public static new<T extends string, F extends string>(
    pattern: `/${T}/${F}`
  ): RegexBuilder<T, F> {
    return new this<T, F>(pattern);
  }
}

type Includes<
  T extends string,
  U extends string
> = T extends `${string}${U}${string}` ? true : false;
type AddFlag<T extends string, F extends string> = Includes<T, F> extends true
  ? T
  : `${T}${F}`;
type RemoveFlag<
  T extends string,
  F extends string
> = T extends `${infer I}${F}${infer R}` ? `${I}${R}` : T;
type If<C extends boolean | undefined, T, E> = C extends true ? T : E;

type SetBuilderFlag<
  T extends string,
  Current extends string,
  Condition extends boolean | undefined,
  F extends string
> = Condition extends undefined
  ? Includes<Current, F>
  : RegexBuilder<T, If<Condition, AddFlag<Current, F>, RemoveFlag<Current, F>>>;

export class Regex<T extends string, F extends string>
implements Copy, Display, Debug, Stringify
{
  private readonly raw: RegExp;
  constructor(private pattern: T, private flags: F) {
    this.raw = new RegExp(pattern, flags);
  }

  public static new<T extends string, F extends string>(
    pattern: T,
    flags: F
  ): Regex<T, F> {
    return new this(pattern, flags);
  }

  public toString(): string {
    return this.asStr().toString();
  }

  public clone(): Regex<T, F> {
    return Regex.new(this.pattern, this.flags);
  }

  public fmt(): string {
    return str.of(this.asStr());
  }

  public fmtDebug(): string {
    return str.of(this.asStr());
  }

  public isMatch(text: StrLike): boolean {
    text = str.of(text);
    return this.raw.test(text);
  }

  public find(text: StrLike): Option<Match> {
    text = str.of(text);
    const [first] = text.match(this.raw) || [];
    if (first === undefined) {
      return None;
    }

    return Some(new Match(text, first));
  }

  public findIter(text: StrLike): Matches {
    text = str.of(text);
    const matches = text.match(this.raw) || [];
    return iter.new(
      (function* (): Generator<Match, void, unknown> {
        for (const value of matches) {
          yield new Match(text, value);
        }
      })()
    );
  }

  public captures(text: StrLike): Option<Captures> {
    text = str.of(text);
    const exec = this.raw.exec(text);

    if (exec === null) {
      return None;
    }

    return Some(new Captures(exec));
  }

  public capturesIter(text: string): Iter<Captures> {
    return this.findIter(text).map((x) => this.captures(x.asStr()).unwrap());
  }

  public split(text: StrLike): Iter<Str> {
    text = str.of(text);
    return iter.new(text.split(this.raw)).map((x) => str.new(x));
  }

  public splitn(text: StrLike, limit: number): Iter<Str> {
    text = str.of(text);
    return iter.new(text.split(this.raw, limit)).map((x) => str.new(x));
  }

  public replace(text: StrLike, rep: StrLike): Str {
    text = str.of(text);
    return str.new(text.replace(this.raw, str.of(rep)));
  }

  public replaceAll(text: StrLike, rep: StrLike): Str {
    text = str.of(text);
    return str.new(text.replaceAll(this.raw, str.of(rep)));
  }

  public replacen(text: StrLike, limit: number, rep: StrLike): Str {
    text = str.of(text);
    let i = 0;
    return str.new(
      text.replace(this.raw, (x) => {
        if (i++ > limit) {
          return x;
        }

        return str.of(rep);
      })
    );
  }

  public isMatchAt(text: StrLike, start: number): boolean {
    return this.isMatch(str.of(text).slice(start));
  }

  public findAt(text: StrLike, start: number): Option<Match> {
    const z = this.find(str.of(text).slice(start));
    return z.map((x) => ((x.input = str.of(text)), x));
  }

  public asStr(): Str {
    return str.new(`/${this.pattern}/${this.flags}`);
  }
}

export class Match implements Stringify {
  constructor(public input: string, private readonly matched: string) {}

  public start(): number {
    return this.input.indexOf(this.matched);
  }

  public end(): number {
    return this.matched.length + this.start();
  }

  public range(): Range {
    return range.new(this.start(), this.end());
  }

  public asStr(): Str {
    return str.new(this.matched);
  }

  public toString(): string {
    return str.of(this.asStr());
  }
}

export class Matches extends Iter<Match> {}

export class Captures {
  constructor(private alloc: RegExpExecArray) {}

  public get(index: number): Option<Match> {
    const value = this.alloc[index];
    if (value === undefined) {
      return None;
    }

    return Some(new Match(this.alloc.input, value));
  }

  public name(name: string): Option<Match> {
    if (this.alloc.groups === undefined) {
      return None;
    }

    const value = this.alloc.groups[name];
    if (value === undefined) {
      return None;
    }

    return Some(new Match(this.alloc.input, value));
  }

  public iter(): Iter<string> {
    return iter.new(this.alloc);
  }

  public len(): number {
    return this.alloc.length;
  }
}

export const regex = staticify(Regex);
export const regexBuilder = staticify(RegexBuilder);
