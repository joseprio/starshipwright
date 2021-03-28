export function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}
// Take a color and multiplies it with a factor. factor = 0 produces black.
export function scaleColorBy(color, factor) {
    return `rgba(${color.map((channel) => channel * factor * 100).join("%,")}%,1)`;
}
// Takes a triplet [H,S,V] and returns a triplet [R,G,B], representing the same color. All components are 0 - 1.
export function hsvToRgb(h, s, v) {
    const f = (n, k = (n + h * 6) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [f(5), f(3), f(1)];
}
// Converts a number between 0 and 1 to a number between [a, b)
export function numberBetween(target, a, b) {
    return target * (b - a) + a;
}
// Converts a number between 0 and 1 to an integer number between [a,b] (both included)
export function integerNumberBetween(target, a, b) {
    return Math.floor(numberBetween(target, a, b + 1));
}
export function sequenceAdvancer(generator, chance, max) {
    let rv = 0;
    while (generator() < chance && rv < max) {
        rv++;
    }
    return rv;
}
export function chancePicker(generator, chances) {
    let sum = 0;
    for (let i = 0; i < chances.length; i++) {
        sum += chances[i];
    }
    let which = generator() * sum;
    for (let i = 0; i < chances.length; i++) {
        which -= chances[i];
        if (which <= 0) {
            return i;
        }
    }
    // We know we already returned at this point
}
export function createNumberGenerator(seed) {
    const ints = new Uint32Array([
        Math.imul(seed, 0x85ebca6b),
        Math.imul(seed, 0xc2b2ae35),
    ]);
    return () => {
        const s0 = ints[0];
        const s1 = ints[1] ^ s0;
        ints[0] = ((s0 << 26) | (s0 >> 8)) ^ s1 ^ (s1 << 9);
        ints[1] = (s1 << 13) | (s1 >> 19);
        return (Math.imul(s0, 0x9e3779bb) >>> 0) / 0xffffffff;
    };
}
