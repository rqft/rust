import { staticify } from "../../tools";
import type { Add, AddAssign, Assign, Sub, SubAssign } from "../ops";
import type { Option } from "../option";
import { None, Some } from "../option";
import { Duration } from "./duration";

class InstantImpl
  implements
    Add<Duration, InstantImpl>,
    Sub<Duration, InstantImpl>,
    AddAssign<Duration, InstantImpl>,
    SubAssign<Duration, InstantImpl>,
    Assign<InstantImpl>
{
  private instant: number = Date.now();

  public static new(): InstantImpl {
    return new this();
  }

  public static now(): InstantImpl {
    return new this();
  }

  public static on(raw: number): InstantImpl {
    const v = this.new();
    v.instant = raw;
    return v;
  }

  public saturating_duration_since(earlier: InstantImpl): Duration {
    if (earlier.instant > this.instant) {
      return Duration.zero;
    }

    return Duration.from_millis(this.instant - earlier.instant);
  }

  public checked_duration_since(earlier: InstantImpl): Option<Duration> {
    if (earlier.instant > this.instant) {
      return None;
    }

    return Some(Duration.from_millis(this.instant - earlier.instant));
  }

  public duration_since(earlier: InstantImpl): Duration {
    return this.saturating_duration_since(earlier);
  }

  public elapsed(): Duration {
    return InstantImpl.now().duration_since(this);
  }

  public checked_add(duration: Duration): Option<InstantImpl> {
    const raw = duration.checked_add(Duration.from_millis(this.instant));

    if (raw.is_none()) {
      return None;
    }

    return Some(InstantImpl.on(raw.unwrap().as_millis().into(Number)));
  }

  public checked_sub(duration: Duration): Option<InstantImpl> {
    const raw = duration.checked_sub(Duration.from_millis(this.instant));

    if (raw.is_none()) {
      return None;
    }

    return Some(InstantImpl.on(raw.unwrap().as_millis().into(Number)));
  }

  public add(duration: Duration): InstantImpl {
    return this.checked_add(duration).expect(
      "overflow when adding duration to instant"
    );
  }

  public sub(duration: Duration): InstantImpl {
    return this.checked_sub(duration).expect(
      "overflow when adding duration to instant"
    );
  }

  public assign(other: InstantImpl): this {
    this.instant = other.instant;
    return this;
  }

  public add_assign(other: Duration): InstantImpl {
    return this.assign(this.add(other));
  }

  public sub_assign(other: Duration): InstantImpl {
    return this.assign(this.sub(other));
  }
}

export type Instant = InstantImpl;
export const Instant = staticify(InstantImpl);
