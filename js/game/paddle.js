/**
 * Paddle System
 * Handles paddle movement, controls, and rendering
 */
export class PaddleSystem {
    constructor() {
        this.x = 350;
        this.y = 550;
        this.width = 100;
        this.height = 15;
        this.speed = 8;
        this.normalWidth = 100;
        this.usingMouse = false;
    }

    update(keys, mouse, canvas) {
        // Arrow key controls (only if not using mouse)
        if (!this.usingMouse) {
            if (keys['ArrowLeft'] && this.x > 0) {
                this.x -= this.speed;
            }
            if (keys['ArrowRight'] && this.x < canvas.width - this.width) {
                this.x += this.speed;
            }
        }
        
        // Mouse controls (only when mouse is actively being used)
        if (this.usingMouse && mouse.x >= 0 && mouse.x <= canvas.width) {
            this.x = Math.max(0, Math.min(canvas.width - this.width, mouse.x - this.width / 2));
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add a slight gradient effect
        ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
        ctx.fillRect(this.x, this.y, this.width, 3);
    }

    reset() {
        this.x = 350;
        this.width = this.normalWidth;
        this.usingMouse = false;
    }

    // Power-up effects
    makeWide() {
        this.width = this.normalWidth * 1.5;
    }

    makeNormal() {
        this.width = this.normalWidth;
    }

    // Input mode switching
    switchToKeyboard() {
        this.usingMouse = false;
    }

    switchToMouse() {
        this.usingMouse = true;
    }

    // Collision detection helper
    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height,
            centerX: this.x + this.width / 2,
            centerY: this.y + this.height / 2
        };
    }

    // Check if point is within paddle bounds
    contains(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }

    // Get hit position (0 = left edge, 0.5 = center, 1 = right edge)
    getHitPosition(ballX) {
        return Math.max(0, Math.min(1, (ballX - this.x) / this.width));
    }

    // Calculate bounce angle based on hit position
    getBounceAngle(ballX) {
        const hitPos = this.getHitPosition(ballX);
        return (hitPos - 0.5) * Math.PI * 0.6; // Max 54 degrees
    }

    // Getters for external access
    get centerX() {
        return this.x + this.width / 2;
    }

    get centerY() {
        return this.y + this.height / 2;
    }

    get left() {
        return this.x;
    }

    get right() {
        return this.x + this.width;
    }

    get top() {
        return this.y;
    }

    get bottom() {
        return this.y + this.height;
    }

    // Check if paddle is at screen edges (for AI assistance)
    isAtLeftEdge() {
        return this.x <= 0;
    }

    isAtRightEdge(canvasWidth) {
        return this.x + this.width >= canvasWidth;
    }

    // Move paddle to specific position (for AI assistance)
    moveTo(x, canvasWidth) {
        this.x = Math.max(0, Math.min(canvasWidth - this.width, x));
    }

    // Move paddle by delta (for smooth AI assistance)
    moveBy(deltaX, canvasWidth) {
        this.x = Math.max(0, Math.min(canvasWidth - this.width, this.x + deltaX));
    }
}
