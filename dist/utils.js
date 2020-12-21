export function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}
function colorChannelToHex(n) {
    return Math.floor(clamp(n, 0, 1) * 255)
        .toString(16)
        .padStart(2, "0");
}
function colorToHex(color) {
    return ("#" +
        colorChannelToHex(color[0]) +
        colorChannelToHex(color[1]) +
        colorChannelToHex(color[2]));
}
// Take a color and multiplies it with a factor. factor = 0 produces black.
export function scaleColorBy(color, factor) {
    return colorToHex([color[0] * factor, color[1] * factor, color[2] * factor]);
}
// Takes a triplet [H,S,V] and returns a triplet [R,G,B], representing the same color. All components are 0 - 1.
export function hsvToRgb(h, s, v) {
    const f = (n, k = (n + h * 6) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [f(5), f(3), f(1)];
}
