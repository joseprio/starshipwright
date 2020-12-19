export function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}
function colorChannelToHex(n) {
    return Math.floor(clamp(n, 0, 1) * 255).toString(16).padStart(2, "0");
}
function colorToHex(color) {
    return "#" +
        colorChannelToHex(color[0]) +
        colorChannelToHex(color[1]) +
        colorChannelToHex(color[2]);
}
// Take a color and multiplies it with a factor. factor = 0 produces black.
export function scaleColorBy(color, factor) {
    return colorToHex([color[0] * factor, color[1] * factor, color[2] * factor]);
}
// Takes a triplet [H,S,V] and returns a triplet [R,G,B], representing the same color. All components are 0 - 1.
export function hsvToRgb(hsv) {
    const c = hsv[1] * hsv[2];
    const m = hsv[2] - c;
    const h = ((hsv[0] % 1) + 1) % 1;
    const hrel = 6 * h;
    const hseg = Math.floor(hrel);
    const x = c * (1 - Math.abs((hrel % 2) - 1));
    switch (hseg) {
        case 0:
            return [c + m, x + m, m];
        case 1:
            return [x + m, c + m, m];
        case 2:
            return [m, c + m, x + m];
        case 3:
            return [m, x + m, c + m];
        case 4:
            return [x + m, m, c + m];
        default:
            return [c + m, m, x + m];
    }
}
