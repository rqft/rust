import { Panic } from "../../../std/panic";

export class ComponentRangeError extends Panic {
  constructor(private uname: string, private condition: boolean) {
    super(`component \`${uname}\` was not in range`);
  }

  public get_name(): string {
    return this.uname;
  }

  public conditional(): boolean {
    return this.condition;
  }
}
