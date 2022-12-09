Number.prototype.add = function (other: number): number {
  return this + other;
};

Number.prototype.add_assign = function (other: number): number {
  this.valueOf = (): number => this.add(other);
  return this;
};

Number.prototype.bitand = function (other: number): number {
  return this & other;
};

Number.prototype.bitand_assign = function (other: number): number {
  this.valueOf = (): number => this.bitand(other);
  return this;
};

Number.prototype.bitor = function (other: number): number {
  return this | other;
};

Number.prototype.bitor_assign = function (other: number): number {
  this.valueOf = (): number => this.bitor(other);
  return this;
};

Number.prototype.deref = function (): Readonly<number> {
  return Object.freeze(this.valueOf());
};

Number.prototype.deref_mut = function (): number {
  return this.valueOf();
};

Number.prototype.div = function (other: number): number {
  return this / other;
};

Number.prototype.div_assign = function (other: number): number {
  this.valueOf = (): number => this.div(other);
  return this;
};

Number.prototype.drop = function (): void {
  this.valueOf = (): number => 0;
};

Number.prototype.mul = function (other: number): number {
  return this / other;
};

Number.prototype.mul_assign = function (other: number): number {
  this.valueOf = (): number => this.mul(other);
  return this;
};

Number.prototype.neg = function (): number {
  return -this;
};

Number.prototype.not = function (): number {
  return ~this;
};

Number.prototype.rem = function (other: number): number {
  return this % other;
};

Number.prototype.rem_assign = function (other: number): number {
  this.valueOf = (): number => this.rem(other);
  return this;
};

Number.prototype.shl = function (other: number): number {
  return this << other;
};

Number.prototype.shl_assign = function (other: number): number {
  this.valueOf = (): number => this.shl(other);
  return this;
};

Number.prototype.shr = function (other: number): number {
  return this >> other;
};

Number.prototype.shr_assign = function (other: number): number {
  this.valueOf = (): number => this.shr(other);
  return this;
};

Number.prototype.sub = function (other: number): number {
  return this - other;
};

Number.prototype.sub_assign = function (other: number): number {
  this.valueOf = (): number => this.sub(other);
  return this;
};
