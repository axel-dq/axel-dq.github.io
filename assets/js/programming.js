// Retuned to match Dark Violet (#projects)
class ProgrammingRenderer {
    constructor(fallSpeed = 30) { 
        this.fallSpeed = fallSpeed;
        this.interval = 1000 / this.fallSpeed;
        this.lastTime = 0;

        this.canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('programming'));

        if (!this.canvas) {
            throw new Error('Canvas element with id "programming" not found.');
        }

        this.ctx = this.canvas.getContext('2d');

        if (!this.ctx) {
            throw new Error('Failed to get 2D context from canvas.');
        }

        this.fontSize = 16;
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = Array(this.columns).fill(1);

        this.animate = this.animate.bind(this);
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = Array(this.columns).fill(1);
    }

    /**
     * Animates the programming effect.
     * @param {number} currentTime
     */
    animate(currentTime) {
        requestAnimationFrame(this.animate);

        const deltaTime = currentTime - this.lastTime;

        if (deltaTime >= this.interval) {
            this.lastTime = currentTime - (deltaTime % this.interval);
            this.draw();
        }
    }

    draw() {
        // Soft violet/dark trail
        this.ctx.fillStyle = 'rgba(16, 8, 26, 0.08)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Soft Violet Digits
        this.ctx.fillStyle = '#c084fc'; 
        this.ctx.font = `${this.fontSize}px monospace`;

        for (let i = 0; i < this.drops.length; i++) {
            const char = Math.random() > 0.5 ? '1' : '0';
            
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;

            this.ctx.fillText(char, x, y);

            if (y > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }

            this.drops[i]++;
        }
    }

    start() {
        requestAnimationFrame(this.animate);
    }
}

const renderer = new ProgrammingRenderer(30);
renderer.start();