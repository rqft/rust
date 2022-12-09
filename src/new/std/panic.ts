export namespace panic {
  export class Panic extends Error {
    constructor(public message: string) {
      super(message);
      this.name = 'Panic';
    }
  }
}
