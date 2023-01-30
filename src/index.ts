import { Formatter } from './std/fmt';

// export * as use from './crates';
export * from './std';

const z = new Formatter('');

z.with({ a: 1 }).write_fmt('{1}{:-^5}{}{a}', 1, '|');

console.log(z.finish().unwrap());
