import {gcd, mod} from './math.js';

function makePythagoreanScale(from, to) {
    const result = [];

    for (let i = from; i <= to; i++) {

        const power = Math.abs(i);

        let num = 1;
        let den = 1;
        let ratio = 1;

        if (i >= 0) {
            // Proceeding by ascending fifths
            num = Math.pow(3, power);
            den = Math.pow(2, power);
        } else {
            // Proceeding by descending fifths
            num = Math.pow(2, power);
            den = Math.pow(3, power);
        }

        ratio = num / den;

        // Make ratio fit the interval [1, 2]

        while (ratio > 2) {
            den *= 2;
            ratio /= 2;
        }

        while (ratio < 1) {
            num *= 2;
            ratio *= 2;
        }

        // Simplify ratio
        const ratioGcd = gcd(num, den);

        num /= ratioGcd;
        den /= ratioGcd;

        // Multiply by 7 semitones modulo 12 to find the note at the i-th fifth
        const note = mod(i * 7, 12);

        // Get the octave
        const octave = Math.floor(i / 12);

        // Get the number of semitones
        const semitones = note + 12 * octave;

        // Get the angle on a circumference
        const angle = Math.log2(ratio) * 2 * Math.PI;

        result.push({
            num: num,
            den: den,
            ratio: ratio,
            angle: angle,
            note: note,
            octave: octave,
            semitones: semitones,
            ord: i
        });
    }

    return result;
}

function makeJustScale(from, to, octaveLimit = 1, key = 0) {
    const result = [];

    const greatestOctave = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    for (let i = from; i <= to; i++) {
        let num = 1;
        let den = 1;
        let ratio = 1;

        // The exponents of the powers of 3 follow the sequence
        //
        // ...-2 -2 -2 -1 -1 -1 0 |0| 0 1 1 1 2 2 2... = ⌊(i + 1) / 3⌋
        //
        const exp3 = Math.floor((i + 1) / 3);

        if (exp3 > 0) {
            num *= Math.pow(3, exp3);
        }

        if (exp3 < 0) {
            den *= Math.pow(3, -exp3);
        }

        // The exponents of the powers of 5 follow the sequence
        //                                 ⌈ 1   if (i mod 3) = 1 |
        // ...-1 0 1 -1 |0| 1 -1 0 1... = <| -1  if (i mod 3) = 2 | = i - 3 * ⌊(i + 1) / 3⌋
        //                                 ⌊ 0   otherwise        |
        //
        const exp5 = i - 3 * Math.floor((i + 1) / 3);

        if (exp5 > 0) {
            num *= Math.pow(5, exp5);
        }

        if (exp5 < 0) {
            den *= Math.pow(5, -exp5);
        }

        ratio = num / den;

        // Make ratio fit the interval [1, 2]

        while (ratio > 2) {
            den *= 2;
            ratio /= 2;
        }

        while (ratio < 1) {
            num *= 2;
            ratio *= 2;
        }

        // Simplify ratio

        const ratioGcd = gcd(num, den);

        num /= ratioGcd;
        den /= ratioGcd;

        // Get the semitone-interval following the sequence
        //
        //       -4  -1  -4  -4  -1  -4   +4  -1  +4  +4   -1   +4
        // ...-14 -10 -11  -7  -3  -4  |0|  +4  +3  +7  +11  +10  +14...
        //
        // = 4 * (⌊i / 3⌋ + ⌊(i + 2) / 3⌋) - 1 * ⌊(i + 1) / 3⌋
        //
        const interval = 4 * (Math.floor(i / 3) + Math.floor((i + 2) / 3)) - 1 * Math.floor((i + 1) / 3);

        // Multiply by 7 interval modulo 12 to find the fifth
        const fifth = mod(interval * 7, 12);

        // Get the note
        const note = mod(interval, 12);

        // Get the octave
        const octave = greatestOctave[note];

        if (Math.abs(octave) > octaveLimit && note !== key) {
            continue;
        }

        greatestOctave[note] += i < 0 ? -1 : 1;

        // Get the number of semitones
        const semitones = note + 12 * octave;

        // Get the ordinal number of the fifth
        const ord = fifth + 12 * octave;

        // Get the angle on a circumference
        const angle = Math.log2(ratio) * 2 * Math.PI;

        result.push({
            num: num,
            den: den,
            ratio: ratio,
            angle: angle,
            note: note,
            octave: octave,
            semitones: semitones,
            ord: ord
        });
    }

    return result;
}

function makeETScale(from, to) {
    const result = [];

    for (let i = from; i <= to; i++) {
        // Multiply by 7 semitones modulo 12 to find the note at the i-th fifth
        const note = mod(i * 7, 12);

        let num = Math.pow(2, note / 12);

        // Check if the note is the last of the octave
        if (i !== 0 && mod(i, 12) === 0) {
            num = 2;
        }

        const den = 1;
        const ratio = num;

        // Get the octave
        const octave = Math.floor(i / 12);

        // Get the number of semitones
        const semitones = note + 12 * octave;

        // Get the angle on a circumference
        // no need to calculate the log2 since we know the exact exponent
        const angle = note / 12 * 2 * Math.PI;

        result.push({
            num: num,
            den: den,
            ratio: ratio,
            angle: angle,
            note: note,
            octave: octave,
            semitones: semitones,
            ord: i
        });
    }

    return result;
}

export {makePythagoreanScale, makeJustScale, makeETScale};
