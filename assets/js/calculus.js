// Retuned to match Forest Emerald (#about-me)
const primaryColor = "#34d399";   // Emerald Green
const secondaryColor = "#0f2e28"; // Dark Forest Slate grid
const tertiaryColor = "#061111";  // Forest Teal background

class CalculusRenderer {
    constructor(renderDuration = 4000, pauseDuration = 1000) {
        this.renderDuration = renderDuration;
        this.pauseDuration = pauseDuration;
        this.startTime = null;
        this.isPaused = false;
        this.pauseStartTime = null;

        this.canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('calculus'));
        if (!this.canvas) {
            throw new Error('Canvas element with id "calculus" not found.');
        }

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Failed to get 2D context from canvas.');
        }

        this.previousEquation = null;
        this.currentEquation = this.generateRandomEquation();

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.parentElement?.offsetWidth || this.canvas.offsetWidth;
        this.canvas.height = this.canvas.parentElement?.offsetHeight || this.canvas.offsetHeight;

        this.drawGrid();
    }

    drawGrid() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const cells_per_row = 24;
        const gridSpacing = this.canvas.width / cells_per_row;
        const maxExtents = gridSpacing * cells_per_row;

        // Background
        this.ctx.fillStyle = tertiaryColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid lines
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = secondaryColor;
        this.ctx.fillStyle = "#047857";
        this.ctx.font = "12px monospace";

        let i = 1;
        for (let offset = gridSpacing; offset < maxExtents; offset += gridSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(centerX + offset, centerY - maxExtents);
            this.ctx.lineTo(centerX + offset, centerY + maxExtents);
            this.ctx.moveTo(centerX - offset, centerY - maxExtents);
            this.ctx.lineTo(centerX - offset, centerY + maxExtents);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(centerX - maxExtents, centerY + offset);
            this.ctx.lineTo(centerX + maxExtents, centerY + offset);
            this.ctx.moveTo(centerX - maxExtents, centerY - offset);
            this.ctx.lineTo(centerX + maxExtents, centerY - offset);
            this.ctx.stroke();

            // Labels
            this.ctx.fillText(`${i}`, centerX + offset + 5, centerY + 15);
            this.ctx.fillText(`-${i}`, centerX - offset + 5, centerY + 15);
            this.ctx.fillText(`-${i}`, centerX + 5, centerY + offset + 15);
            this.ctx.fillText(`${i}`, centerX + 5, centerY - offset + 15);
            i++;
        }

        // Axes
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeStyle = primaryColor;
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - maxExtents, centerY);
        this.ctx.lineTo(centerX + maxExtents, centerY);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - maxExtents);
        this.ctx.lineTo(centerX, centerY + maxExtents);
        this.ctx.stroke();

        this.ctx.fillText("0", centerX + 5, centerY + 15);
    }

    generateRandomEquation(type = 'random', maxDegree = 3) {
        const types = ['polynomial', 'trig', 'exponential'];
        const selectedType = type === 'random' 
            ? types[Math.floor(Math.random() * types.length)] 
            : type;

        const randomInt = (/** @type {number} */ min, /** @type {number} */ max) => {
            let val = 0;
            while (val === 0) {
                val = Math.floor(Math.random() * (max - min + 1)) + min;
            }
            return val;
        };

        let terms = [];
        let formattedTerms = [];

        switch (selectedType) {
            case 'polynomial': {
                const degree = Math.floor(Math.random() * maxDegree) + 1;
                for (let power = degree; power >= 0; power--) {
                    if (power === degree || Math.random() > 0.3) {
                        const coef = randomInt(-5, 5);
                        if (power === 0) terms.push(`${coef}`);
                        else if (power === 1) terms.push(`${coef} * x`);
                        else terms.push(`${coef} * Math.pow(x, ${power})`);

                        let formattedCoef = coef > 0 ? `+ ${coef}` : `- ${Math.abs(coef)}`;
                        if (power === degree && coef > 0) formattedCoef = `${coef}`;
                        
                        if (power === 0) formattedTerms.push(`${formattedCoef}`);
                        else if (power === 1) formattedTerms.push(`${formattedCoef === '1' ? '' : formattedCoef === '-1' ? '-' : formattedCoef}x`);
                        else formattedTerms.push(`${formattedCoef === '1' ? '' : formattedCoef === '-1' ? '-' : formattedCoef}x^${power}`);
                    }
                }
                break;
            }
            case 'trig': {
                const fn = ['Math.sin', 'Math.cos'][Math.floor(Math.random() * 2)];
                const fnName = fn.split('.')[1];
                const a = randomInt(-4, 4);
                const b = randomInt(1, 3);
                const c = randomInt(-3, 3);

                terms.push(`${a} * ${fn}(${b} * x) + ${c}`);
                
                const formattedA = a === 1 ? '' : a === -1 ? '-' : `${a}`;
                const formattedB = b === 1 ? '' : `${b}`;
                const formattedC = c > 0 ? ` + ${c}` : c < 0 ? ` - ${Math.abs(c)}` : '';
                
                formattedTerms.push(`${formattedA}${fnName}(${formattedB}x)${formattedC}`);
                break;
            }
            case 'exponential': {
                const a = randomInt(-3, 3);
                const base = [2, 3, 'Math.E'][Math.floor(Math.random() * 3)];
                const baseDisplay = base === 'Math.E' ? 'e' : base;
                const c = randomInt(-4, 4);

                terms.push(`${a} * Math.pow(${base}, x) + ${c}`);

                const formattedA = a === 1 ? '' : a === -1 ? '-' : `${a}`;
                const formattedC = c > 0 ? ` + ${c}` : c < 0 ? ` - ${Math.abs(c)}` : '';

                formattedTerms.push(`${formattedA}${baseDisplay}^x${formattedC}`);
                break;
            }
        }

        const rawExpression = terms.join(' + ').replace(/\+ -/g, '- ');
        const formattedExpression = `y = ` + formattedTerms.join(' ').replace(/\+ -/g, '- ');

        return {
            raw: rawExpression,
            formatted: formattedExpression,
            evaluate: ( /** @type {number} */ x) => new Function('x', `return ${rawExpression};`)(x)
        };
    }

    /**
     * @param eq {*} The equation object containing the raw and formatted expressions, as well as the evaluate function.
     * @param startX {number}
     * @param endX {number}
     * Draws the segment of the equation from startX to endX on the canvas.
     * The area under the curve is filled with a translucent emerald green color.
     * The curve itself is drawn in the primary color.
     */
    drawEquationSegment(eq, startX, endX) {
        if (startX >= endX) return;

        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = width / 30;

        const toCanvasX = (/** @type {number} */ x) => centerX + x * scale;
        const toCanvasY = (/** @type {number} */ y) => centerY - y * scale;
        const step = 0.1;

        // Area Fill (Translucent Emerald Green)
        this.ctx.fillStyle = `rgba(52, 211, 153, 0.15)`;
        this.ctx.beginPath();
        this.ctx.moveTo(toCanvasX(startX), toCanvasY(0));

        for (let x = startX; x <= endX; x += step) {
            const y = eq.evaluate(x);
            this.ctx.lineTo(toCanvasX(x), toCanvasY(y));
        }

        this.ctx.lineTo(toCanvasX(endX), toCanvasY(0));
        this.ctx.closePath();
        this.ctx.fill();

        // Curve Line
        this.ctx.strokeStyle = primaryColor;
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        
        let firstPoint = true;
        for (let x = startX; x <= endX; x += step) {
            const y = eq.evaluate(x);
            const cx = toCanvasX(x);
            const cy = toCanvasY(y);

            if (firstPoint) {
                this.ctx.moveTo(cx, cy);
                firstPoint = false;
            } else {
                this.ctx.lineTo(cx, cy);
            }
        }
        this.ctx.stroke();
    }

    update(currentTime = performance.now()) {
        const minX = -15;
        const maxX = 15;

        if (this.isPaused) {
            if (this.pauseStartTime && currentTime - this.pauseStartTime >= this.pauseDuration) {
                this.previousEquation = this.currentEquation;
                this.currentEquation = this.generateRandomEquation();
                this.startTime = null;
                this.isPaused = false;
            } else {
                requestAnimationFrame((newTime) => this.update(newTime));
                return;
            }
        }

        if (!this.startTime) this.startTime = currentTime;
        const elapsed = currentTime - this.startTime;
        const progress = Math.min(elapsed / this.renderDuration, 1);

        const easedProgress = progress * progress * (3 - 2 * progress);
        const currentMaxX = minX + easedProgress * (maxX - minX);

        this.drawGrid();

        if (this.previousEquation) {
            this.drawEquationSegment(this.previousEquation, currentMaxX, maxX);
        }

        this.drawEquationSegment(this.currentEquation, minX, currentMaxX);

        if (this.canvas.width > 600) {
            // Header text
            this.ctx.fillStyle = "#ecfdf5";
            this.ctx.font = "24px serif";
            this.ctx.textAlign = "center";
            const equationText = this.formatSuperscript(this.currentEquation.formatted);
            this.ctx.fillText(equationText, this.canvas.width * 0.8, this.canvas.height * 0.1);
        }
        if (progress < 1) {
            requestAnimationFrame((newTime) => this.update(newTime));
        } else {
            this.isPaused = true;
            this.pauseStartTime = currentTime;
            requestAnimationFrame((newTime) => this.update(newTime));
        }
    }

    /**
     * Formats a string with superscript characters.
     * 
     * @param {string} str 
     * @returns {string} A string with superscript formatting applied.
     * This function replaces instances of ^ followed by numbers or certain characters with their corresponding Unicode superscript characters.
     * For example, "x^2" becomes "x²", and "x^n" becomes "xⁿ".
     * It supports the following characters for superscripting: 0-9, +, -, =, (, ), x, y, n.
     * Any character not in the mapping will remain unchanged.
     */
    formatSuperscript(str) {
        const superMap = {
            '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
            '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
            '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
            'x': 'ˣ', 'y': 'ʸ', 'n': 'ⁿ'
        };

        return str.replace(/\^([0-9+\-()xyn]+)/g, (_, match) => {
            return match.split('').map((/** @type {keyof typeof superMap} */ char) => superMap[char] || char).join('');
        });
    }
}

new CalculusRenderer().update();