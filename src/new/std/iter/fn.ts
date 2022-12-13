import type { FnMut } from '../ops';
import type { Option } from '../option';
import { Empty } from './empty';
import { FromFn } from './from_fn';
import { Once } from './once';
import { OnceWith } from './once_with';
import { Repeat } from './repeat';
import { RepeatWith } from './repeat_with';

export function empty<T>(): Empty<T> {
  return Empty<T>();
}

export function from_fn<T>(F: FnMut<[], Option<T>>): FromFn<T> {
  return FromFn(F);
}

export function once<T>(T: T): Once<T> {
  return Once(T);
}

export function once_with<T>(F: FnMut<[], T>): OnceWith<T> {
  return OnceWith(F);
}

export function repeat<T>(T: T): Repeat<T> {
  return Repeat(T);
}

export function repeat_with<T>(F: FnMut<[], T>): RepeatWith<T> {
  return RepeatWith(F);
}
