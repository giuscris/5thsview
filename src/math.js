function mod(a, b) {
    return a - b * Math.floor(a / b);
}

function gcd(a, b) {
    if (b === 0) {
        return a;
    }
    return gcd(b, mod(a, b));
}

export {mod, gcd};
