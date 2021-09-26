import {mod} from './math.js';
import {makePythagoreanScale, makeJustScale, makeETScale} from './scales.js';

export default function View(canvas, controls) {
    const DPR = window.devicePixelRatio || 1;

    const NOTES_ENGLISH = ['C', '*', 'D', '*', 'E', 'F', '*', 'G', '*', 'A', '*', 'B'];
    const NOTES_LATIN = ['Do', '*', 'Re', '*', 'Mi', 'Fa', '*', 'Sol', '*', 'La', '*', 'Si'];

    const INTERVALS_ENGLISH = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'A4', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'];
    const INTERVALS_LATIN = ['1ª G', '2ª m', '2ª M', '3ª m', '3ª M', '4ª G', '4ª E', '5ª G', '6ª m', '6ª M', '7ª m', '7ª M', '8ª G'];

    const SHARP_SYMBOL = '♯';
    const FLAT_SYMBOL = '♭';

    const VIEW_CIRCLE = 'circle';
    const VIEW_SPIRAL = 'spiral';

    const SCALE_PYTHAGOREAN = 'pythagorean';
    const SCALE_JUST = 'just';
    const SCALE_ET = 'ET';

    const LABEL_NOTE = 'note';
    const LABEL_SEMITONES = 'semitones';
    const LABEL_INTERVAL = 'interval';

    const NOTE_NAMES_ENGLISH = 'english';
    const NOTE_NAMES_LATIN = 'latin';

    const INTERVAL_NAMES_ENGLISH = 'english';
    const INTERVAL_NAMES_LATIN = 'latin';

    const PYTHAGOREAN_COMMA = 531441 / 524288;
    const PYTHAGOREAN_COMMA_ANGLE = Math.log2(PYTHAGOREAN_COMMA) * Math.PI * 2;

    const SYNTONIC_COMMA = 81 / 80;
    const SYNTONIC_COMMA_ANGLE = Math.log2(SYNTONIC_COMMA) * Math.PI * 2;

    const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉';

    const ctx = setupCanvas(canvas);
    const originX = canvas.width / 2;
    const originY = canvas.width / 2;
    const originAngle = Math.PI / 2;

    const controlInputs = controls.querySelectorAll('input');

    controlInputs.forEach((element) => element.addEventListener('change', handleOptionsChange));

    handleOptionsChange();

    function setupCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        const style = window.getComputedStyle(canvas);

        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';

        canvas.width *= DPR;
        canvas.height *= DPR;

        ctx.scale(DPR, DPR);

        ctx.font = [style.fontSize, style.fontFamily].join(' ');
        ctx.textAlign = style.textAlign;
        ctx.textBaseline = 'middle';

        return ctx;
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function xyToCanvas(x, y) {
        return {
            x: (originX + x) / DPR,
            y: (canvas.width - originY - y) / DPR
        };
    }

    function drawPoint(x, y, color = '#ff0000') {
        const coords = xyToCanvas(x, y);
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }

    function drawLine(x0, y0, x1, y1, color = '#000000') {
        const coords0 = xyToCanvas(x0, y0);
        const coords1 = xyToCanvas(x1, y1);
        ctx.save();
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(coords0.x, coords0.y);
        ctx.lineTo(coords1.x, coords1.y);
        ctx.stroke();
        ctx.restore();
    }

    function drawCircle(x, y, r, color) {
        const coords = xyToCanvas(x, y);
        ctx.save();
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, r / DPR, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }

    function drawCircularSector(x, y, r, a0, a1, color = 'rgba(255, 0, 0, 0.33)') {
        const coords = xyToCanvas(x, y);
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        ctx.arc(coords.x, coords.y, r / DPR, -a1, -a0);
        ctx.lineTo(coords.x, coords.y);
        ctx.fill();
        ctx.restore();
    }

    function drawLineAtAngle(x, y, angle, length, color) {
        drawLine(x, y, length * Math.cos(angle), length * Math.sin(angle), color);
    }

    function drawText(x, y, text) {
        ctx.save();
        if (x > 20) {
            x += 10;
            ctx.textAlign = 'left';
        }
        if (x < -20) {
            x -= 10;
            ctx.textAlign = 'right';
        }
        if (y > 60) {
            ctx.textBaseline = 'bottom';
            y += 5;
        }
        if (y < -60) {
            y -= 10;
            ctx.textBaseline = 'top';
        }
        ctx.fillStyle = '#000000';
        const coords = xyToCanvas(x, y);
        ctx.fillText(text, coords.x, coords.y);
        ctx.restore();
    }

    function drawGridRadii(n, color = '#cccccc') {
        const length = Math.min(canvas.width, canvas.height) / 2;
        for (let i = 0; i < n; i++) {
            drawLineAtAngle(0, 0, i / n * 2 * Math.PI, length, color);
        }
    }

    function drawGridCircles(n, radius, increment, color = '#cccccc') {
        for (let i = 0; i < n; i++) {
            drawCircle(0, 0, radius + increment * i, color);
        }
    }

    function semitonesToInterval(semitones) {
        if (semitones === 0) {
            return 0;
        }
        const interval = mod(semitones, 12);
        return interval > 0 ? interval : 12;
    }

    function numberToSubscripts(number) {
        let result = number.toString();

        for (let i = 0; i < 10; i++) {
            result = result.replace(i, SUBSCRIPTS[i]);
        }

        return result.replace('-', '₋');
    }

    function getOptions() {
        const options = {};

        controlInputs.forEach(function (element) {
            if (element.checked) {
                options[element.name] = element.type === 'checkbox' ? true : element.value;
            }
        });

        return options;
    }

    function handleOptionsChange() {
        const isViewSpiral = controls.querySelector('[name=view][value=spiral]').checked;
        const isPythagoreanScale = controls.querySelector('[name=scale][value=pythagorean]').checked;
        const isJustScale = controls.querySelector('[name=scale][value=just]').checked;

        controls.querySelector('[name=majorGrid]').disabled = !isViewSpiral;
        controls.querySelector('[name=minorGrid]').disabled = !isViewSpiral;

        controls.querySelector('[name=displayPythagoreanComma]').disabled = !(isViewSpiral && isPythagoreanScale);
        controls.querySelector('[name=displaySyntonicComma]').disabled = !(isViewSpiral && isJustScale);

        clearCanvas();
        drawView(getOptions());
    }

    function drawView(options) {
        let scale = [];
        let radius = 0;
        let noteOffset = 0;

        switch (options.notes) {
            case NOTE_NAMES_ENGLISH:
                options.notes = NOTES_ENGLISH;
                break;
            case NOTE_NAMES_LATIN:
                options.notes = NOTES_LATIN;
                break;
        }

        switch (options.intervals) {
            case INTERVAL_NAMES_ENGLISH:
                options.intervals = INTERVALS_ENGLISH;
                break;
            case INTERVAL_NAMES_LATIN:
                options.intervals = INTERVALS_LATIN;
                break;
        }

        switch (options.view) {
            case VIEW_CIRCLE:
                radius = 240 * DPR;

                drawCircle(0, 0, radius);

                switch (options.scale) {
                    case SCALE_PYTHAGOREAN:
                        scale = makePythagoreanScale(-6, 6);
                        break;
                    case SCALE_JUST:
                        scale = makeJustScale(0, 13, 0);
                        break;
                    case SCALE_ET:
                        scale = makeETScale(-6, 6);
                        break;
                }

                scale.sort((a, b) => a.ord - b.ord);

                break;

            case VIEW_SPIRAL:
                radius = 50 * DPR;
                noteOffset = 8 * DPR;

                if (options.minorGrid) {
                    drawGridRadii(48, '#e9e9e9');
                }

                if (options.majorGrid) {
                    drawGridRadii(12);
                    drawGridCircles(3, radius, noteOffset * 12);
                }

                if (options.scale === SCALE_PYTHAGOREAN && options.displayPythagoreanComma) {
                    drawCircularSector(0, 0, 300 * DPR, originAngle - PYTHAGOREAN_COMMA_ANGLE, originAngle);
                }

                if (options.scale === SCALE_JUST && options.displaySyntonicComma) {
                    drawCircularSector(0, 0, 300 * DPR, originAngle - SYNTONIC_COMMA_ANGLE, originAngle);
                }

                switch (options.scale) {
                    case SCALE_PYTHAGOREAN:
                        scale = makePythagoreanScale(0, 24);
                        break;
                    case SCALE_JUST:
                        scale = makeJustScale(0, 25);
                        break;
                    case SCALE_ET:
                        scale = makeETScale(0, 24);
                        break;
                }

                scale.sort((a, b) => a.semitones - b.semitones);

                break;
        }

        for (let i = 0; i < scale.length; i++) {
            const angle0 = originAngle - scale[i].angle;
            const distance0 = radius + scale[i].semitones * noteOffset;

            if (options.drawLines && i < scale.length - 1) {
                const angle1 = originAngle - scale[i + 1].angle;
                const distance1 = radius + scale[i + 1].semitones * noteOffset;
                drawLine(
                    Math.cos(angle0) * distance0,
                    Math.sin(angle0) * distance0,
                    Math.cos(angle1) * distance1,
                    Math.sin(angle1) * distance1
                );
            }

            if (options.drawPoints) {
                drawPoint(Math.cos(angle0) * distance0, Math.sin(angle0) * distance0);
            }

            if (options.drawLabels) {
                if (options.view == VIEW_CIRCLE && options.scale == SCALE_ET && i === 0) {
                    continue;
                }

                let text = '';

                if (options.labelFormat === LABEL_NOTE) {
                    const note = scale[i].note;
                    let name = options.notes[note];

                    // Decide whether the altered note is a sharp or a flat
                    if (name === '*') {
                        if (scale[i].ord >= 0) {
                            name = options.notes[note - 1] + SHARP_SYMBOL;
                        } else {
                            name = options.notes[note + 1] + FLAT_SYMBOL;
                        }
                    }

                    text = name;
                }

                if (options.labelFormat === LABEL_SEMITONES) {
                    text = scale[i].semitones;
                }

                if (options.labelFormat === LABEL_INTERVAL) {
                    text = options.intervals[semitonesToInterval(scale[i].semitones)];
                }

                if (options.displayOctave) {
                    text += numberToSubscripts(scale[i].octave);
                }

                drawText(Math.cos(angle0) * distance0, Math.sin(angle0) * distance0, text);
            }
        }
    }
}
