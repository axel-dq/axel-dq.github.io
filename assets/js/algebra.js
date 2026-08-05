// Retuned to match Deep Space Navy (#presentation)
const primaryColor = "#38bdf8";   // Electric Cyan for axes, matrix text & brackets
const secondaryColor = "#1e293b"; // Dark Slate grid lines
const tertiaryColor = "#080c14";  // Deep Space Navy background

class AlgebraRenderer {
    constructor(transformDuration = 4000, pauseDuration = 1000, maxCompounds = 3) {
        this.transformDuration = transformDuration;
        this.pauseDuration = pauseDuration;
        this.maxCompounds = maxCompounds; 
        this.compoundCount = 0; 
        this.isResetting = false;

        this.startTime = null;
        this.isPaused = false;
        this.pauseStartTime = null;

        this.canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('algebra'));
        if (!this.canvas) {
            throw new Error('Canvas element with id "algebra" not found.');
        }

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Failed to get 2D context from canvas.');
        }

        /** @type {*} */
        this.startState = { rotate: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 };
        this.targetState = this.generateSmoothState(this.startState);

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.parentElement?.offsetWidth || this.canvas.offsetWidth;
        this.canvas.height = this.canvas.parentElement?.offsetHeight || this.canvas.offsetHeight;
    }

    /**
     * 
     * @param {*} baseState
     * @returns 
     */
    generateSmoothState(baseState) {
        return {
            scaleX: baseState.scaleX * (0.9 + Math.random() * 0.8),
            scaleY: baseState.scaleY * (0.9 + Math.random() * 0.8),
            skewX: baseState.skewX + ((Math.random() - 0.5) * 45),
            skewY: baseState.skewY + ((Math.random() - 0.5) * 45),
            rotate: baseState.rotate + ((Math.random() - 0.5) * 90)
        };
    }

    /**
     * 
     * @param {number} t
     * @returns {number}
     */
    easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    /**
     * 
     * @param {*} start 
     * @param {*} end 
     * @param {number} progress 
     * @returns 
     */
    getStateMatrix(start, end, progress) {
        const eased = this.easeInOutSine(progress);

        const rotate = start.rotate + (end.rotate - start.rotate) * eased;
        const scaleX = start.scaleX + (end.scaleX - start.scaleX) * eased;
        const scaleY = start.scaleY + (end.scaleY - start.scaleY) * eased;
        const skewX = start.skewX + (end.skewX - start.skewX) * eased;
        const skewY = start.skewY + (end.skewY - start.skewY) * eased;

        return new DOMMatrix()
            .rotate(rotate)
            .scale(scaleX, scaleY)
            .skewX(skewX)
            .skewY(skewY);
    }

    /** @param {number} currentTime */
    update(currentTime = performance.now()) {
        if (!this.startTime) this.startTime = currentTime;

        if (this.isPaused) {
            if (this.pauseStartTime && currentTime - this.pauseStartTime >= this.pauseDuration) {
                this.isPaused = false;
                this.startTime = currentTime;
                this.startState = { ...this.targetState };
                
                if (this.isResetting) {
                    this.isResetting = false;
                    this.compoundCount = 0;
                    this.targetState = this.generateSmoothState(this.startState);
                } else if (this.compoundCount >= this.maxCompounds) {
                    this.isResetting = true;
                    this.targetState = { rotate: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 };
                } else {
                    this.compoundCount++;
                    this.targetState = this.generateSmoothState(this.startState);
                }
            }
            requestAnimationFrame((t) => this.update(t));
            return;
        }

        const elapsed = currentTime - this.startTime;
        const progress = Math.min(elapsed / this.transformDuration, 1);
        
        const currentTransform = this.getStateMatrix(this.startState, this.targetState, progress);

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const cells_per_row = 24;
        const gridSpacing = this.canvas.width / cells_per_row;
        const maxExtents = gridSpacing * cells_per_row * 3;

        // Clear canvas
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = tertiaryColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Center and transform space
        this.ctx.translate(centerX, centerY);
        this.ctx.transform(
            currentTransform.a, currentTransform.b, 
            currentTransform.c, currentTransform.d, 
            currentTransform.e, currentTransform.f
        );
        this.ctx.translate(-centerX, -centerY);

        // Minor Grid Lines
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = secondaryColor;

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
        }

        // Principal Axes
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

        // Basis Vectors
        const arrowSize = 6;

        // i-hat
        this.ctx.strokeStyle = '#f43f5e';
        this.ctx.fillStyle = '#f43f5e';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(centerX + gridSpacing, centerY);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + gridSpacing, centerY);
        this.ctx.lineTo(centerX + gridSpacing - arrowSize, centerY - arrowSize / 1.5);
        this.ctx.lineTo(centerX + gridSpacing - arrowSize, centerY + arrowSize / 1.5);
        this.ctx.fill();

        // j-hat
        this.ctx.strokeStyle = '#38bdf8';
        this.ctx.fillStyle = '#38bdf8';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(centerX, centerY - gridSpacing);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - gridSpacing);
        this.ctx.lineTo(centerX - arrowSize / 1.5, centerY - gridSpacing + arrowSize);
        this.ctx.lineTo(centerX + arrowSize / 1.5, centerY - gridSpacing + arrowSize);
        this.ctx.fill();

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        if (this.canvas.width > 600) {
            this.drawDOMMatrix(currentTransform, this.canvas.width * 0.75, this.canvas.height * 0.1);
        }
    
        if (progress < 1) {
            requestAnimationFrame((t) => this.update(t));
        } else {
            this.isPaused = true;
            this.pauseStartTime = currentTime;
            requestAnimationFrame((t) => this.update(t));
        }
    }

    /**
     * 
     * @param {DOMMatrix} matrix 
     * @param {number} x 
     * @param {number} y 
     */
    drawDOMMatrix(matrix, x = 50, y = 50) {
        let grid;
        if (matrix.is2D) {
            grid = [
                [matrix.a.toFixed(2), matrix.c.toFixed(2), matrix.e.toFixed(2)],
                [matrix.b.toFixed(2), matrix.d.toFixed(2), matrix.f.toFixed(2)],
                ['0', '0', '1']
            ];
        } else {
            grid = [
                [matrix.m11.toFixed(2), matrix.m21.toFixed(2), matrix.m31.toFixed(2), matrix.m41.toFixed(2)],
                [matrix.m12.toFixed(2), matrix.m22.toFixed(2), matrix.m32.toFixed(2), matrix.m42.toFixed(2)],
                [matrix.m13.toFixed(2), matrix.m23.toFixed(2), matrix.m33.toFixed(2), matrix.m43.toFixed(2)],
                [matrix.m14.toFixed(2), matrix.m24.toFixed(2), matrix.m34.toFixed(2), matrix.m44.toFixed(2)]
            ];
        }

        const fontSize = 15;
        const colWidth = 55;
        const rowHeight = 28;
        const bracketPadding = 8;
        
        this.ctx.save();
        this.ctx.font = `${fontSize}px "Courier New", monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = primaryColor;
        this.ctx.strokeStyle = primaryColor;
        this.ctx.lineWidth = 2;

        const rows = grid.length;
        const cols = grid[0].length;
        const matrixWidth = cols * colWidth;
        const matrixHeight = rows * rowHeight;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const px = x + c * colWidth + colWidth / 2;
                const py = y + r * rowHeight + rowHeight / 2;
                this.ctx.fillText(grid[r][c], px, py);
            }
        }

        const leftX = x - bracketPadding;
        const rightX = x + matrixWidth + bracketPadding;
        const topY = y;
        const bottomY = y + matrixHeight;
        const bracketWidth = 8;

        this.ctx.beginPath();
        this.ctx.moveTo(leftX + bracketWidth, topY);
        this.ctx.lineTo(leftX, topY);
        this.ctx.lineTo(leftX, bottomY);
        this.ctx.lineTo(leftX + bracketWidth, bottomY);

        this.ctx.moveTo(rightX - bracketWidth, topY);
        this.ctx.lineTo(rightX, topY);
        this.ctx.lineTo(rightX, bottomY);
        this.ctx.lineTo(rightX - bracketWidth, bottomY);
        
        this.ctx.stroke();
        this.ctx.restore();
    }
}

new AlgebraRenderer(4000, 1500, 3).update();