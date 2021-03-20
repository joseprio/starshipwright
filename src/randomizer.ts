export class Randomizer {
  seed: string; // "seed" is reserved and won't be mangled, but it will actually compress 2 bytes better
  c: number;
  s0: number;
  s1: number;
  s2: number;
  hrCache: { [key: string]: number } = {};

  constructor(p_seed: string) {
    let n = 0xefc8249d;
    function mash(data: string): number {
      for (let i = 0; i < data.length; i++) {
        n += data.charCodeAt(i);
        let h = 0.02519603282416938 * n;
        n = h >>> 0;
        h -= n;
        h *= n;
        n = h >>> 0;
        h -= n;
        n += h * 2 ** 32;
      }
      return (n >>> 0) * 2 ** -32;
    }

    this.seed = p_seed;
    this.c = 1;
    this.s0 = mash(' ');
    this.s1 = mash(' ');
    this.s2 = mash(' ');
    this.s0 -= mash(p_seed);
    if (this.s0 < 0) { this.s0 += 1; }
    this.s1 -= mash(p_seed);
    if (this.s1 < 0) { this.s1 += 1; }
    this.s2 -= mash(p_seed);
    if (this.s2 < 0) { this.s2 += 1; }
  }

  // Stream quick
  sq() {
    const t = 2091639 * this.s0 + this.c * 2 ** -32;
    this.s0 = this.s1;
    this.s1 = this.s2;
    return this.s2 = t - (this.c = t | 0);
  }

  // Hash quick - the important thing about this function is to be consistent
  hq(seed: string | number) {
    if (!this.hrCache[seed]) {
      this.hrCache[seed] = this.sq();
    }
    return this.hrCache[seed];
  }

  //Returns a raw unsigned 32-bit integer from the stream.
  sr() {
    return (this.sq() * 2 ** 32) | 0;
  }

  //Returns a raw unsigned 32-bit integer based on hashing this object's seed with the specified string
  hr(seed: string | number): number {
    return (this.hq(seed) * 2 ** 32) | 0;
  }

  //Returns a double between the specified minimum and maximum, from the stream.
  sd(min: number, max: number): number {
    return ((this.sq() + (this.sq() * 0x200000 | 0) * 1.1102230246251565e-16) *
        (max - min) +
      min
    );
  }

  //Returns a double between the specified minimum and maximum, by hashing this object's seed with the specified string.
  hd(min: number, max: number, seed: string | number): number {
    return ((this.hq(seed) + (this.hq(seed + "@") * 0x200000 | 0) * 1.1102230246251565e-16) *
        (max - min) +
      min
    );
  }

  //Returns an integer between the specified minimum and maximum, from the stream.
  si(min: number, max: number): number {
    return Math.floor(this.sd(min, max + 1));
  }

  //Returns a boolean with the specified chance of bein true (and false otherwise), from the stream
  sb(chance: number): boolean {
    return this.sd(0, 1) < chance;
  }

  //Returns an integer between the specified minimum and maximum, by hashing this object's seed with the specified string.
  hi(min: number, max: number, seed: string | number): number {
    return Math.floor(this.hd(min, max + 1, seed));
  }

  //Returns a boolean with the specified chance of being true (and false otherwise), by hashing this object's seed with the specified string.
  hb(chance: number, seed: string | number): boolean {
    return this.hd(0, 1, seed) < chance;
  }

  //Returns an integer with the specified chance of being -1 (and 1 otherwise), from the stream.
  ss(chance: number): number {
    return this.sb(chance) ? -1 : 1;
  }

  //Returns an integer {0,1,2,...}, starting from 0, with the specified chance of advancing to each successive integer, from the stream.
  sseq(chance: number, max: number): number {
    let rv = 0;
    while (this.sb(chance) && rv < max) {
      rv++;
    }
    return rv;
  }

  //Returns an integer {0,1,2,...}, starting from 0, with the specified chance of advancing to each successive integer, by hashing this object's seed with the specified string.
  hseq(chance: number, max: number, seed: string | number): number {
    let rv = 0;
    while (this.hb(chance, seed + "@" + rv) && rv < max) {
      rv++;
    }
    return rv;
  }

  //Returns an index of the array chances with the relative probability equal to that element of chances, based on a stream value.
  schoose(chances: Array<number>): number {
    let sum = 0;
    for (let i = 0; i < chances.length; i++) {
      sum += chances[i];
    }
    let which = this.sd(0, sum);
    for (let j = 0; j < chances.length; j++) {
      which -= chances[j];
      if (which < 0) {
        return j;
      }
    }
    // We know we already returned at this point, but it's slightly more size efficient
    return 0;
  }

  // Returns an index of the array chances with the relative probability equal to that element of chances, based on a hash value with the specified seed.
  hchoose(chances: Array<number>, seed: string | number): number {
    let sum = 0;
    for (let i = 0; i < chances.length; i++) {
      sum += chances[i];
    }
    let which = this.hd(0, sum, seed);
    for (let j = 0; j < chances.length; j++) {
      which -= chances[j];
      if (which < 0) {
        return j;
      }
    }
    // We know we already returned at this point, but it's slightly more size efficient
    return 0;
  }
}