import type { char } from './char';

export type Ascii =
  AsciiAlphabetic | AsciiControl | AsciiDigit | AsciiPunctuation | AsciiUnrenderables | AsciiWhitespace | ' ' | '¡' | '¿' | '·' | '­' | '"' | '«' | '»' | '§' | '¶' | '\\' | '´' | '¯' | '¨' | '¸' | '°' | '©' | '®' | '±' | '÷' | '×' | '¬' | '¦' | '¤' | '¢' | '£' | '¥' | '¹' | '½' | '¼' | '²' | '³' | '¾' | 'ª' | 'À' | 'Á' | 'Â' | 'Ã' | 'Ä' | 'Å' | 'à' | 'á' | 'â' | 'ã' | 'ä' | 'å' | 'Æ' | 'æ' | 'Ç' | 'ç' | 'Ð' | 'ð' | 'È' | 'É' | 'Ê' | 'Ë' | 'è' | 'é' | 'ê' | 'ë' | 'Ì' | 'Í' | 'Î' | 'Ï' | 'ì' | 'í' | 'î' | 'ï' | 'Ñ' | 'ñ' | 'º' | 'Ò' | 'Ó' | 'Ô' | 'Õ' | 'Ö' | 'Ø' | 'ò' | 'ó' | 'ô' | 'õ' | 'ö' | 'ø' | 'ß' | 'Ù' | 'Ú' | 'Û' | 'Ü' | 'ù' | 'ú' | 'û' | 'ü' | 'Ý' | 'ý' | 'ÿ' | 'Þ' | 'þ' | 'µ';
export type E = Extract<AsciiUnrenderables, AsciiControl>;
export type AsciiUnrenderables =
  | '\u008a'
  | '\u008b'
  | '\u008c'
  | '\u008d'
  | '\u008e'
  | '\u008f'
  | '\u009a'
  | '\u009b'
  | '\u009c'
  | '\u009d'
  | '\u009e'
  | '\u009f'
  | '\u0080'
  | '\u0081'
  | '\u0082'
  | '\u0083'
  | '\u0084'
  | '\u0085'
  | '\u0086'
  | '\u0087'
  | '\u0088'
  | '\u0089'
  | '\u0090'
  | '\u0091'
  | '\u0092'
  | '\u0093'
  | '\u0094'
  | '\u0095'
  | '\u0096'
  | '\u0097'
  | '\u0098'
  | '\u0099';
export type AsciiUppercase<
  T extends string,
  P extends string = ''
> = T extends `${infer F}${infer R}`
  ? F extends Ascii
    ? AsciiUppercase<R, `${P}${Uppercase<F>}`>
    : AsciiUppercase<R, `${P}${F}`>
  : P;

export type AsciiLowercase<
  T extends string,
  P extends string = ''
> = T extends `${infer F}${infer R}`
  ? F extends Ascii
    ? AsciiLowercase<R, `${P}${Lowercase<F>}`>
    : AsciiLowercase<R, `${P}${F}`>
  : P;

export type ToAsciiUppercase<T> = T extends char<infer U>
  ? char<AsciiUppercase<U>>
  : never;
export type ToAsciiLowercase<T> = T extends char<infer U>
  ? char<AsciiLowercase<U>>
  : never;

export type AsciiDigit =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9';
export type AsciiAlphabetic =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';
export type AsciiHexDigit = AsciiDigit | 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
export type AsciiPunctuation =
  '_' | '-' | ',' | ';' | ':' | '!' | '?' | '.' | '"' | '(' | ')' | '[' | ']' | '{' | '}' | '@' | '*' | '/' | '\'' | '\\' | '&' | '#' | '%' | '`' | '^' | '+' | '<' | '=' | '>' | '|' | '~' | '$';
export type AsciiGraphic = Exclude<Ascii, AsciiUnrenderables>;
export type AsciiWhitespace = ' ' | '\n' | '\t' | '\u000c' | '\u000d';
export type AsciiControl =
  | '\u0000'
  | '\u000a'
  | '\u000b'
  | '\u000c'
  | '\u000d'
  | '\u000e'
  | '\u000f'
  | '\u0001'
  | '\u001a'
  | '\u001b'
  | '\u001c'
  | '\u001d'
  | '\u001e'
  | '\u001f'
  | '\u0002'
  | '\u0003'
  | '\u0004'
  | '\u0005'
  | '\u0006'
  | '\u0007'
  | '\u007f'
  | '\u0008'
  | '\u0009'
  | '\u0010'
  | '\u0011'
  | '\u0012'
  | '\u0013'
  | '\u0014'
  | '\u0015'
  | '\u0016'
  | '\u0017'
  | '\u0018'
  | '\u0019';
