import { panic } from './macros';
import type { Option } from './option';
import { None, Some } from './option';
import type { Copy, Debug, Default } from './traits';
import { Ordering, PartialComparison } from './traits';
export class Duration
  extends PartialComparison<Duration>
  implements Copy, Debug, Default
{
  private readonly secs: bigint;
  private readonly nanos: bigint;
  constructor(secs: UsableInt, nanos: UsableInt) {
    super();
    nanos = BigInt(nanos);
    secs = BigInt(secs);

    // overflow
    if (nanos > Duration.NanosPerSec) {
      this.secs = nanos / Duration.NanosPerSec + secs;
      this.nanos = nanos % Duration.NanosPerSec;
    } else {
      this.secs = secs;
      this.nanos = nanos;
    }

    // real overflow
    if (this.secs > Duration.Max.secs || this.secs < 0n || this.nanos < 0n) {
      panic(
        'Duration is out of bounds: seconds should be within u64, nanos within 1 billion'
      );
    }
  }

  public clone(): Duration {
    return Duration.new(this.secs, this.nanos);
  }

  public cmp(other: Duration): Ordering {
    if (this.eq(other)) {
      return Ordering.Equal;
    }

    if (this.asNanos() < other.asNanos()) {
      return Ordering.Less;
    }

    return Ordering.More;
  }

  public eq(other: Duration): boolean {
    return this.asNanos() === other.asNanos();
  }

  public default(): Duration {
    return Duration.Zero;
  }

  public fmtDebug(): string {
    if (this.secs > 0n) {
      if (this.nanos > 0n) {
        return `${this.secs}s${this.nanos}n`;
      }

      return `${this.secs}s`;
    }

    return `${this.nanos}n`;
  }

  public static readonly NanosPerSec: bigint = 1_000_000_000n;

  public static new(secs: UsableInt, nanos: UsableInt): Duration {
    return new this(secs, nanos);
  }

  public static fromSecs(secs: UsableInt): Duration {
    return new this(secs, 0);
  }

  public static fromMillis(millis: UsableInt): Duration {
    return new this(0, BigInt(millis) * 1_000_000n);
  }

  public static fromMicros(micros: UsableInt): Duration {
    return new this(0, BigInt(micros) * 1_000n);
  }

  public static fromNanos(nanos: UsableInt): Duration {
    return new this(0, nanos);
  }

  public static readonly Second: Duration = this.fromSecs(1n);
  public static readonly Millisecond: Duration = this.fromMillis(1n);
  public static readonly Microsecond: Duration = this.fromMicros(1n);
  public static readonly Nanosecond: Duration = this.fromNanos(1n);
  public static readonly Max: Duration = this.new(
    (1n << 64n) - 1n,
    this.NanosPerSec - 1n
  );
  public static readonly Zero: Duration = this.fromNanos(0n);

  public isZero(): boolean {
    return this.secs === 0n && this.nanos === 0n;
  }

  public asSecs(): bigint {
    return this.secs;
  }

  public subsecMillis(): bigint {
    return this.nanos / 1_000_000n;
  }

  public subsecMicros(): bigint {
    return this.nanos / 1_000n;
  }

  public subsecNanos(): bigint {
    return this.nanos;
  }

  public asMillis(): bigint {
    return this.asSecs() * 1_000n + this.subsecMillis();
  }

  public asMicros(): bigint {
    return this.asSecs() * 1_000_000n + this.subsecMicros();
  }

  public asNanos(): bigint {
    return this.asSecs() * 1_000_000_000n + this.subsecNanos();
  }

  private checked(
    rhs: Duration,
    f: (selfNanos: bigint, otherNanos: bigint) => bigint
  ): Option<Duration> {
    try {
      return Some(Duration.fromNanos(f(this.asNanos(), rhs.asNanos())));
    } catch {
      return None;
    }
  }

  private saturated(
    rhs: Duration,
    f: (selfNanos: bigint, otherNanos: bigint) => bigint,
    saturator: Duration
  ): Duration {
    try {
      return Duration.fromNanos(f(this.asNanos(), rhs.asNanos()));
    } catch {
      return saturator;
    }
  }

  public checkedAdd(rhs: Duration): Option<Duration> {
    return this.checked(rhs, (s, o) => s + o);
  }

  public checkedSub(rhs: Duration): Option<Duration> {
    return this.checked(rhs, (s, o) => s - o);
  }

  public checkedMul(rhs: Duration): Option<Duration> {
    return this.checked(rhs, (s, o) => s * o);
  }

  public checkedDiv(rhs: Duration): Option<Duration> {
    if (rhs.asNanos() === 0n) {
      return None;
    }

    return this.checked(rhs, (s, o) => s / o);
  }

  public saturatingAdd(rhs: Duration): Duration {
    return this.saturated(rhs, (s, o) => s + o, Duration.Max);
  }

  public saturatingSub(rhs: Duration): Duration {
    return this.saturated(rhs, (s, o) => s + o, Duration.Zero);
  }

  public saturatingMul(rhs: Duration): Duration {
    return this.saturated(rhs, (s, o) => s + o, Duration.Max);
  }

  public saturatingDiv(rhs: Duration): Duration {
    if (rhs.asNanos() === 0n) {
      return Duration.Max;
    }

    return this.saturated(rhs, (s, o) => s + o, Duration.Zero);
  }

  public asSecsF64(): number {
    return Number(this.asSecs()) + Number(this.subsecNanos()) / 1_000_000_000;
  }
}

export type UsableInt = bigint | number;

export class Instant
  extends PartialComparison<Instant>
  implements Copy, Debug, Default
{
  private readonly time: Duration;
  constructor(at: UsableInt) {
    super();
    this.time = Duration.fromNanos(at);
  }

  public static new(at: UsableInt): Instant {
    return new this(at);
  }

  public static now(): Instant {
    return this.new(BigInt(Date.now()) * 1_000_000n);
  }

  public durationSince(earlier: Instant): Duration {
    return Duration.fromNanos(this.time.asNanos() - earlier.time.asNanos());
  }

  public checkedDurationSince(earlier: Instant): Option<Duration> {
    return this.time.checkedSub(earlier.time);
  }

  public saturatedDurationSince(earlier: Instant): Duration {
    return this.time.saturatingSub(earlier.time);
  }

  public elapsed(): Duration {
    return Instant.now().durationSince(this);
  }

  public checkedAdd(duration: Duration): Option<Instant> {
    return this.time.checkedAdd(duration).map((x) => Instant.new(x.asNanos()));
  }

  public checkedSub(duration: Duration): Option<Instant> {
    return this.time.checkedSub(duration).map((x) => Instant.new(x.asNanos()));
  }

  public clone(): Instant {
    return Instant.new(this.time.asNanos());
  }

  public cmp(other: Instant): Ordering {
    return this.time.cmp(other.time);
  }

  public eq(other: Instant): boolean {
    return this.time.eq(other.time);
  }

  public default(): Instant {
    return Instant.now();
  }

  public date(): Date {
    return new Date(Number(this.time.asMillis()));
  }

  public fmtDebug(): string {
    return this.date().toString();
  }
}
