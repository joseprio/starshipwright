export class Randomizer {
  seed: string;
  stateArray: Array<number>;
  state: number;
  seedPosition: number = 0;
  arrayPosition: number = 0;
  hrCache: { [key: string]: number } = {};

  constructor(p_seed: string) {
    this.seed = p_seed;
    if (this.seed.length < 8) {
      this.seed = "padding_" + this.seed;
    }
    if (this.seed.length % 2 == 0) {
      this.seed = "1" + this.seed;
    }
    this.stateArray = [
      2972948403,
      3086140710,
      2071788248,
      3026137486,
      1411764137,
      2265725585,
      2923087685,
      1593177610,
    ];
    this.state = 3234042090;
    for (var i = this.seed.length - 1; i >= 0; i--) {
      var c = this.seed.charCodeAt(i);
      this.state =
        (((this.state << 5) + this.state) ^
          c ^
          (this.state << ((c % 13) + 1)) ^
          (this.state >> ((c % 17) + 1))) >>>
        0;
      this.stateArray[i % 8] ^=
        (((this.state >> 9) * ((this.state % 16384) + 3427)) ^ c) >>> 0;
    }
  }

  //Returns a raw unsigned 32-bit integer from the stream.
  sr() {
    var c = this.seed.charCodeAt(this.seedPosition);
    var lsa = this.stateArray[this.arrayPosition];
    this.state =
      (((this.state << 5) + this.state + lsa) ^
        c ^
        (this.state << ((c % 17) + 1)) ^
        (this.state >> ((c % 13) + 1))) >>>
      0;
    this.stateArray[this.arrayPosition] =
      ((lsa >> 3) ^
        (lsa << ((c % 19) + 1)) ^
        ((this.state % 134217728) * 3427)) >>>
      0;
    this.seedPosition = (this.seedPosition + 1) % this.seed.length;
    this.arrayPosition = (this.arrayPosition + 1) % 8;
    return this.state;
  }

  //Returns a raw unsigned 32-bit integer based on hashing this object's seed with the specified string.
  /*
  hr_original(seed?: string): number {
    let t = 1206170165;
    if (seed != null) {
      for (let x = seed.length - 1; x >= 0; x--) {
        const c = seed.charCodeAt(x);
        t = ((t << 5) + t) ^ c ^ (t << ((c % 13) + 1)) ^ (t >> ((c % 17) + 1));
      }
    }
    for (let y = this.seed.length - 1; y >= 0; y--) {
      const c = this.seed.charCodeAt(y);
      t = ((t << 5) + t) ^ c ^ (t << ((c % 13) + 1)) ^ (t >> ((c % 17) + 1));
    }
    return t >>> 0;
  }
  */

  //Returns a raw unsigned 32-bit integer based on hashing this object's seed with the specified string
  hr(seed?: string): number {
    const state = [1160605769, 1424711319, 876532818, 1419174464];
    let rv = 1206170165;
    if (seed == null) {
      seed = "?/?/?/";
      rv = 3379896793;
    }
    if (this.hrCache.hasOwnProperty(seed)) {
      return this.hrCache[seed];
    }
    for (var x = seed.length - 1; x >= 0; x--) {
      const c = seed.charCodeAt(x);
      let t = state[0] ^ c;
      t = (t ^ (t << 11)) >>> 0;
      t = (t ^ (t >> 8)) >>> 0;
      state[0] = state[1];
      state[1] = state[2];
      state[2] = state[3];
      state[3] = (state[3] ^ (state[3] >> 19) ^ t) >>> 0;
      rv = ((rv ^ (c << 24)) * 3427) ^ state[3];
    }
    for (var y = this.seed.length - 1; y >= 0; y--) {
      const c = this.seed.charCodeAt(y);
      let t = state[0] ^ c;
      t = (t ^ (t << 11)) >>> 0;
      t = (t ^ (t >> 8)) >>> 0;
      state[0] = state[1];
      state[1] = state[2];
      state[2] = state[3];
      state[3] = (state[3] ^ (state[3] >> 19) ^ t) >>> 0;
      rv = ((rv ^ (c << 24)) * 3427) ^ state[3];
    }
    this.hrCache[seed] = rv >>> 0;
    return this.hrCache[seed];
  }

  //Returns a double between the specified minimum and maximum, from the stream.
  sd(min: number, max: number): number {
    return (
      ((this.sr() * 4294967296 + this.sr()) / 18446744073709551616) *
        (max - min) +
      min
    );
  }

  //Returns a double between the specified minimum and maximum, by hashing this object's seed with the specified string.
  hd(min: number, max: number, seed: string): number {
    return (
      ((this.hr(seed) * 4294967296 + this.hr(seed + "@")) /
        18446744073709551616) *
        (max - min) +
      min
    );
  }

  //Returns an integer between the specified minimum and maximum, from the stream.
  si(min: number, max: number): number {
    return Math.floor(
      ((this.sr() * 4294967296 + this.sr()) / 18446744073709551616) *
        (max + 1 - min) +
        min
    );
  }

  //Returns an integer between the specified minimum and maximum, by hashing this object's seed with the specified string.
  hi(min: number, max: number, s: string): number {
    return Math.floor(
      ((this.hr(s) * 4294967296 + this.hr(s + "@")) / 18446744073709551616) *
        (max + 1 - min) +
        min
    );
  }

  //Returns a boolean with the specified chance of being true (and false otherwise), from the stream
  sb(chance: number): boolean {
    return (this.sr() * 4294967296 + this.sr()) / 18446744073709551616 < chance;
  }

  //Returns a boolean with the specified chance of being true (and false otherwise), by hashing this object's seed with the specified string.
  hb(chance: number, s: string): boolean {
    return (
      (this.hr(s) * 4294967296 + this.hr(s + "@")) / 18446744073709551616 <
      chance
    );
  }

  //Returns an integer with the specified chance of being -1 (and 1 otherwise), from the stream.
  ss(chance: number): number {
    return (this.sr() * 4294967296 + this.sr()) / 18446744073709551616 < chance
      ? -1
      : 1;
  }

  //Returns an integer with the specified chance of being -1 (and 1 otherwise), by hashing this object's seed with the specified string.
  /*
  hs(chance: number, seed: string): number {
    return (this.hr(seed) * 4294967296 +
      this.hr(seed + "@")) /
      18446744073709551616 <
      chance
      ? -1
      : 1;
  }
  */

  //Returns an integer {0,1,2,...}, starting from 0, with the specified chance of advancing to each successive integer, from the stream.
  sseq(chance: number, max: number): number {
    var rv = 0;
    while (
      (this.sr() * 4294967296 + this.sr()) / 18446744073709551616 < chance &&
      rv < max
    ) {
      rv++;
    }
    return rv;
  }

  //Returns an integer {0,1,2,...}, starting from 0, with the specified chance of advancing to each successive integer, by hashing this object's seed with the specified string.
  hseq(chance: number, max: number, seed: string): number {
    var rv = 0;
    while (
      (this.hr(seed + rv) * 4294967296 + this.hr(seed + "@" + rv)) /
        18446744073709551616 <
        chance &&
      rv < max
    ) {
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
    return 0;
  }

  //Returns an index of the array chances with the relative probability equal to that element of chances, based on a hash value with the specified seed.
  hchoose(chances: Array<number>, seed?: string): number {
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
    return 0;
  }
}
