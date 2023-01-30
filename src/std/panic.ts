export class Panic extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'Panic';
  }
}
export function panic(message: string): never {
  throw new Panic(message);
}
