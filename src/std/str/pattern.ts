import { is_iter, staticify } from "../../tools";
import { char } from "../char";
import type { _ } from "../custom";
import { usize } from "../number";
import type { Option } from "../option";
import { None, Some } from "../option";
import { str } from "./str";

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

    if (typeof this.matcher === "string") {
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

    if (typeof this.matcher === "string") {
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
      if (this.matcher(char(c))) {
        if (haystack.startsWith(c)) {
          return true;
        }
      }
    }

    return false;
  }

  public is_suffix_of(haystack: string): boolean {
    if (this.matcher instanceof RegExp) {
      const [main] = haystack.match(haystack) || [];

      return main !== undefined && haystack.endsWith(main);
    }

    if (this.matcher instanceof str.static) {
      return haystack.endsWith(this.matcher.alloc);
    }

    if (typeof this.matcher === "string") {
      return haystack.endsWith(this.matcher);
    }

    if (this.matcher instanceof char.static) {
      return haystack.endsWith(this.matcher.as_primitive());
    }

    if (is_iter<char<_> | string>(this.matcher)) {
      for (const value of this.matcher) {
        if (haystack.endsWith(value.toString())) {
          return true;
        }
      }

      return false;
    }

    for (const c of haystack) {
      if (this.matcher(char(c))) {
        if (haystack.endsWith(c)) {
          return true;
        }
      }
    }

    return false;
  }

  public strip_prefix_of(haystack: string): Option<string> {
    const match = this.is_prefix_of(haystack);

    if (!match) {
      return None;
    }

    if (this.matcher instanceof RegExp) {
      const [main] = haystack.match(haystack) || [];

      return Some(haystack.slice(main?.length || 0));
    }

    if (this.matcher instanceof str.static) {
      return Some(haystack.slice(this.matcher.alloc.length));
    }

    if (typeof this.matcher === "string") {
      return Some(haystack.slice(this.matcher.length));
    }

    if (this.matcher instanceof char.static) {
      return Some(haystack.slice(this.matcher.toString().length));
    }

    if (is_iter<char<_> | string>(this.matcher)) {
      for (const value of this.matcher) {
        if (haystack.startsWith(value.toString())) {
          return Some(haystack.slice(value.toString().length));
        }
      }

      return None;
    }

    for (const c of haystack) {
      if (this.matcher(char(c))) {
        if (haystack.startsWith(c.toString())) {
          return Some(haystack.slice(c.toString().length));
        }
      }
    }

    return None;
  }

  public strip_suffix_of(haystack: string): Option<string> {
    const match = this.is_suffix_of(haystack);

    if (!match) {
      return None;
    }

    if (this.matcher instanceof RegExp) {
      const [main] = haystack.match(haystack) || [];

      return Some(haystack.slice(0, main?.length || 0));
    }

    if (this.matcher instanceof str.static) {
      return Some(haystack.slice(0, this.matcher.alloc.length));
    }

    if (typeof this.matcher === "string") {
      return Some(haystack.slice(0, this.matcher.length));
    }

    if (this.matcher instanceof char.static) {
      return Some(haystack.slice(0, this.matcher.toString().length));
    }

    if (is_iter<char<_> | string>(this.matcher)) {
      for (const value of this.matcher) {
        if (haystack.startsWith(value.toString())) {
          return Some(haystack.slice(0, value.toString().length));
        }
      }

      return None;
    }

    for (const c of haystack) {
      if (this.matcher(char(c))) {
        if (haystack.startsWith(c.toString())) {
          return Some(haystack.slice(0, c.toString().length));
        }
      }
    }

    return None;
  }

  public find_in(haystack: string): Option<usize> {
    const match = this.is_contained_in(haystack);

    if (!match) {
      return None;
    }

    if (this.matcher instanceof RegExp) {
      const [main] = haystack.match(haystack) || [];

      return Some(usize(haystack.indexOf(main || "")));
    }

    if (this.matcher instanceof str.static) {
      return Some(usize(haystack.indexOf(this.matcher.alloc)));
    }

    if (typeof this.matcher === "string") {
      return Some(usize(haystack.indexOf(this.matcher)));
    }

    if (this.matcher instanceof char.static) {
      return Some(usize(haystack.indexOf(this.matcher.toString())));
    }

    if (is_iter<char<_> | string>(this.matcher)) {
      for (const value of this.matcher) {
        if (haystack.startsWith(value.toString())) {
          return Some(usize(haystack.indexOf(value.toString())));
        }
      }

      return None;
    }

    for (const c of haystack) {
      if (this.matcher(char(c))) {
        if (haystack.startsWith(c.toString())) {
          return Some(usize(haystack.indexOf(c.toString())));
        }
      }
    }

    return None;
  }

  public rfind_in(haystack: string): Option<usize> {
    const match = this.is_contained_in(haystack);

    if (!match) {
      return None;
    }

    if (this.matcher instanceof RegExp) {
      const [main] = haystack.match(haystack) || [];

      return Some(usize(haystack.lastIndexOf(main || "")));
    }

    if (this.matcher instanceof str.static) {
      return Some(usize(haystack.lastIndexOf(this.matcher.alloc)));
    }

    if (typeof this.matcher === "string") {
      return Some(usize(haystack.lastIndexOf(this.matcher)));
    }

    if (this.matcher instanceof char.static) {
      return Some(usize(haystack.lastIndexOf(this.matcher.toString())));
    }

    if (is_iter<char<_> | string>(this.matcher)) {
      for (const value of this.matcher) {
        if (haystack.startsWith(value.toString())) {
          return Some(usize(haystack.lastIndexOf(value.toString())));
        }
      }

      return None;
    }

    for (const c of haystack) {
      if (this.matcher(char(c))) {
        if (haystack.startsWith(c.toString())) {
          return Some(usize(haystack.lastIndexOf(c.toString())));
        }
      }
    }

    return None;
  }
}

export type Pattern = PatternImpl;
export const Pattern = staticify(PatternImpl);
