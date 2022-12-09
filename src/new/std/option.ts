import { staticify } from '../../tools';
import type { clone } from './clone';
import type { cmp } from './cmp';
import { convert } from './convert';
import type { def } from './default';
import type { ops } from './ops';
import { panic } from './panic';

export namespace option {
  export class SomeImpl<T>
  implements convert.AsRef<T>, convert.AsMutRef<T>, clone.Clone<SomeImpl<T>>
  {
    constructor(private value: T) {}
    public static new<T>(value: T): SomeImpl<T> {
      return new this(value);
    }

    public clone(this: SomeImpl<T>): SomeImpl<T> {
      return SomeImpl.new(this.value);
    }

    public is_some(): this is SomeImpl<T> {
      return true;
    }

    public is_some_and(f: ops.FnOnce<[T], boolean>): boolean {
      return f.call_once(this.value);
    }

    public is_none(): this is NoneImpl<T> {
      return false;
    }

    public as_ref(): convert.Ref<this, T> {
      return new convert.Ref(this, this.value);
    }

    public as_mut_ref(): convert.RefMut<this, T> {
      return new convert.RefMut(this, this.value);
    }

    public expect(message: string): T {
      void message;
      return this.value;
    }

    public unwrap(): T {
      return this.value;
    }

    public unwrap_or(def: T): T {
      void def;
      return this.value;
    }

    public unwrap_or_else<F extends ops.FnOnce<[], T>>(f: F): T {
      void f;
      return this.value;
    }

    public unwrap_or_default(
      this: T extends def.Default<unknown> ? SomeImpl<T> : never
    ): T {
      return this.value;
    }

    public unwrap_unchecked(): T {
      return this.value;
    }

    public map<U, F extends ops.FnOnce<[T], U>>(f: F): SomeImpl<U> {
      return SomeImpl.new(f.call_once(this.value));
    }

    public inspect<F extends ops.FnOnce<[T]>>(f: F): this {
      f.call_once(this.value);
      return this;
    }

    public map_or<U, F extends ops.FnOnce<[T], U>>(def: U, f: F): U {
      void def;
      return this.map<U, F>(f).unwrap();
    }

    public map_or_else<
      U,
      D extends ops.FnOnce<[], U>,
      F extends ops.FnOnce<[T], U>
    >(def: D, f: F): U {
      void def;
      return this.map<U, F>(f).unwrap();
    }

    // ok_or, ok_or_else

    public as_deref(
      this: T extends ops.Deref<T> ? SomeImpl<T> : never
    ): SomeImpl<convert.Ref<this, T>> {
      return SomeImpl.new(
        convert.ref.new<this, T>(this as never, this.value.deref())
      );
    }

    public as_deref_mut(
      this: T extends ops.DerefMut<T> ? SomeImpl<T> : never
    ): SomeImpl<convert.RefMut<this, T>> {
      return SomeImpl.new(
        convert.ref_mut.new<this, T>(this as never, this.value.deref_mut())
      );
    }

    // iter, iter_mut

    public and<U>(optb: Option<U>): Option<U> {
      return optb;
    }

    public and_then<U, F extends ops.FnOnce<[T], Option<U>>>(f: F): Option<U> {
      return f.call_once(this.value) as never;
    }

    public filter<P extends ops.FnOnce<[T], boolean>>(predicate: P): Option<T> {
      if (!predicate.call_once(this.value)) {
        return None;
      }

      return this;
    }

    public or(optb: Option<T>): this {
      void optb;
      return this;
    }

    public or_else<F extends ops.FnOnce<[], T>>(f: F): this {
      void f;
      return this;
    }

    public xor(optb: Option<T>): Option<T> {
      // [Some, Some]
      if (optb.is_some()) {
        return None;
      }

      // [Some, None]
      return this;
    }

    public insert(value: T): convert.RefMut<this, T> {
      const old = convert.ref_mut.new(this, this.value);
      this.value = value;

      return old;
    }

    public get_or_insert(value: T): convert.RefMut<this, T> {
      void value;
      return convert.ref_mut.new(this, this.value);
    }

    public get_or_insert_default(
      this: T extends def.Default<unknown> ? SomeImpl<T> : never
    ): convert.RefMut<this, T> {
      return convert.ref_mut.new(this as never, this.value);
    }

    public get_or_insert_with<F extends ops.FnOnce<[], T>>(
      f: F
    ): convert.RefMut<this, T> {
      void f;
      return convert.ref_mut.new(this, this.value);
    }

    public take(): SomeImpl<T> {
      const old = this.clone();
      Object.assign(this, None);
      return old;
    }

    public replace(value: T): SomeImpl<T> {
      const old = this.clone();
      this.value = value;
      return old;
    }

    public contains<U extends cmp.PartialEq<U, T>>(
      x: convert.Ref<unknown, U>
    ): boolean {
      return x.deref().eq(this.value);
    }

    public zip<U>(other: Option<U>): Option<[T, U]> {
      if (other.is_none()) {
        return None;
      }

      return SomeImpl.new([this.value, other.value] as [T, U]);
    }

    public zip_with<U, F extends ops.FnOnce<[T, U], R>, R>(
      other: Option<U>,
      f: F
    ): Option<R> {
      if (other.is_none()) {
        return None;
      }

      return SomeImpl.new(f.call_once(this.value, other.value));
    }
  }

  export class NoneImpl<T> {
    private value: T = undefined as never;
    public static new<T>(): NoneImpl<T> {
      return new this();
    }

    public is_some(): this is SomeImpl<T> {
      return false;
    }

    public is_some_and(
      f: ops.FnOnce<[convert.Ref<unknown, T>], boolean>
    ): this is SomeImpl<T> {
      void f;
      return false;
    }

    public is_none(): this is NoneImpl<T> {
      return true;
    }

    public as_ref(): NoneImpl<T> {
      return this;
    }

    public as_mut(): NoneImpl<T> {
      return this;
    }

    public expect(message: string): never {
      throw new panic.Panic(message);
    }

    public unwrap(): never {
      this.expect('called unwrap() on None');
    }

    public unwrap_or(def: T): T {
      return def;
    }

    public unwrap_or_else<F extends ops.FnOnce<[], T>>(f: F): T {
      return f.call_once();
    }

    public unwrap_or_default(
      this: T extends def.Default<T> ? NoneImpl<T> : never
    ): T {
      throw new panic.Panic('unwrap_or_default not implemented');
    }

    public unwrap_unchecked(): T {
      return this.value;
    }

    public map<U, F extends ops.FnOnce<[T], U>>(f: F): Option<U> {
      void f;
      return NoneImpl.new<U>();
    }

    public inspect<F extends ops.FnOnce<[convert.Ref<unknown, T>]>>(
      f: F
    ): void {
      void f;
    }

    public map_or<U, F extends ops.FnOnce<[T], U>>(def: U, f: F): U {
      void f;
      return def;
    }

    public map_or_else<
      U,
      D extends ops.FnOnce<[], U>,
      F extends ops.FnOnce<[T], U>
    >(def: D, f: F): U {
      void f;
      return def.call_once();
    }

    // ok_or, ok_or_else

    public as_deref<U>(
      this: T extends ops.Deref<U> ? NoneImpl<T> : never
    ): NoneImpl<Readonly<U>> {
      return NoneImpl.new<Readonly<U>>();
    }

    public as_deref_mut<U>(
      this: T extends ops.DerefMut<U> ? NoneImpl<T> : never
    ): NoneImpl<U> {
      return NoneImpl.new<U>();
    }

    // iter, iter_mut

    public and<U>(optb: Option<U>): Option<U> {
      void optb;
      return None;
    }

    public and_then<U, F>() {}
  }

  export type Option<T> = NoneImpl<T> | SomeImpl<T>;
  export const Some = staticify(SomeImpl);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const None = new NoneImpl<any>();
}
