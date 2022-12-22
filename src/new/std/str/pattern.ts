import { is_iter, staticify } from '../../../tools';
import { char } from '../char';
import type { _ } from '../custom';
import { str } from './str';

export type Matcher =
  | char<_>
  | Iterable<char<_> | string>
  | RegExp
  | str
  | string
  | ((char: char<_>) => boolean);
class PatternImpl {
  constructor(private matcher: Matcher) {}

  public static new(matcher: Matcher): Pattern {
    return new this(matcher);
  }

  public is_contained_in(haystack: string): boolean {
    if (this.matcher instanceof RegExp) {
      return this.matcher.test(haystack);
    }

    if (this.matcher instanceof str.static) {
      return haystack.includes(this.matcher.alloc);
    }

    if (typeof this.matcher === 'string') {
      return haystack.includes(this.matcher);
    }

    if (this.matcher instanceof char.static) {
      return haystack.includes(this.matcher.as_primitive());
    }

    if (is_iter<char<_> | string>(this.matcher)) {
      for (const value of this.matcher) {
        if (haystack.includes(value.toString())) {
          return true;
        }
      }

      return false;
    }

    for (const c of haystack) {
      if (this.matcher(char(c))) {
        return true;
      }
    }

    return false;
  }

  public is_prefix_of(haystack: string): boolean {
    if (this.matcher instanceof RegExp) {
      const [main] = haystack.match(haystack) || [];

      return main !== undefined && haystack.indexOf(main) === 0;
    }

    if (this.matcher instanceof str.static) {
      return haystack.startsWith(this.matcher.alloc);
    }

    if (typeof this.matcher === 'string') {
      return haystack.startsWith(this.matcher);
    }

    if (this.matcher instanceof char.static) {
      return haystack.startsWith(this.matcher.as_primitive());
    }

    if (is_iter<char<_> | string>(this.matcher)) {
      for (const value of this.matcher) {
        if (haystack.startsWith(value.toString())) {
          return true;
        }
      }

      return false;
    }

    for (const c of haystack) {
      // if any return false, give up
      if (this.matcher(char(c))) {
        if (haystack.startsWith(c)) {
          return false;
        }
      }
    }

    return false;
  }
}

export type Pattern = PatternImpl;
export const Pattern = staticify(PatternImpl);
