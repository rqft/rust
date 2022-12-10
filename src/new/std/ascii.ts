export interface AsciiExt<Owned> {
  is_ascii(): boolean;
  to_ascii_uppercase(): Owned;
  to_ascii_lowercase(): Owned;
  eq_ignore_ascii_case(this: this, self: this): boolean;
  make_ascii_uppercase(): this;
  make_ascii_lowercase(): this;
}
