/**
 * Brick System
 * Handles brick creation, rendering, and collision detection
 */
export class BrickSystem {
    constructor(accessibility) {
        this.accessibility = accessibility;
        this.bricks = [];
        
        // Configuration
        this.config = {
            rows: 6,
            cols: 10,
            width: 75,
            height: 20,
            padding: 5,
            offsetTop: 60,
            offsetLeft: 37.5,
            types: [
                { color: '#ff4444', hits: 1, points: 10, name: 'red' },
                { color: '#ff8844', hits: 1, points: 20, name: 'orange' },
                { color: '#ffff44', hits: 2, points: 30, name: 'yellow' },
                { color: '#44ff44', hits: 2, points: 40, name: 'green' }
            ]
        };
    }

    create() {
        this.bricks.length = 0;
        
        for (let row = 0; row < this.config.rows; row++) {
            for (let col = 0; col < this.config.cols; col++) {
                const x = col * (this.config.width + this.config.padding) + this.config.offsetLeft;
                const y = row * (this.config.height + this.config.padding) + this.config.offsetTop;
                
                // Determine brick type based on row
                let typeIndex;
                if (row < 2) typeIndex = 0; // Red bricks (top 2 rows)
                else if (row < 4) typeIndex = 1; // Orange bricks (next 2 rows)
                else if (row < 5) typeIndex = 2; // Yellow bricks (1 row)
                else typeIndex = 3; // Green bricks (bottom row)
                
                const brickType = this.config.types[typeIndex];
                
                this.bricks.push({
                    x: x,
                    y: y,
                    width: this.config.width,
                    height: this.config.height,
                    hits: brickType.hits,
                    maxHits: brickType.hits,
                    points: brickType.points,
                    color: brickType.color,
                    name: brickType.name,
                    destroyed: false
                });
            }
        }
    }

    draw(ctx) {
        this.bricks.forEach(brick => {
            if (brick.destroyed) return;
            
            // Calculate color intensity based on remaining hits
            const intensity = brick.hits / brick.maxHits;
            let color = brick.color;
            
            if (intensity < 1) {
                // Darken damaged bricks
                const r = parseInt(color.substr(1, 2), 16);
                const g = parseInt(color.substr(3, 2), 16);
                const b = parseInt(color.substr(5, 2), 16);
                
                color = `rgb(${Math.floor(r * intensity)}, ${Math.floor(g * intensity)}, ${Math.floor(b * intensity)})`;
            }
            
            ctx.fillStyle = color;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            
            // Add border
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            
            // Add highlight for 3D effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(brick.x, brick.y, brick.width, 3);
        });
    }

    checkCollision(ball, game, playerMetrics, particleSystem, powerUpSystem, aiAnalysis) {
        for (let i = 0; i < this.bricks.length; i++) {
            const brick = this.bricks[i];
            if (brick.destroyed) continue;
            
            if (ball.x + ball.radius > brick.x &&
                ball.x - ball.radius < brick.x + brick.width &&
                ball.y + ball.radius > brick.y &&
                ball.y - ball.radius < brick.y + brick.height) {
                
                const ballCenterX = ball.x;
                const ballCenterY = ball.y;
                const brickCenterX = brick.x + brick.width / 2;
                const brickCenterY = brick.y + brick.height / 2;
                
                const deltaX = ballCenterX - brickCenterX;
                const deltaY = ballCenterY - brickCenterY;
                
                const intersectX = Math.abs(deltaX) - (brick.width / 2 + ball.radius);
                const intersectY = Math.abs(deltaY) - (brick.height / 2 + ball.radius);
                
                if (intersectX > intersectY) {
                    ball.dx = -ball.dx;
                } else {
                    ball.dy = -ball.dy;
                }
                
                brick.hits--;
                if (playerMetrics) {
                    playerMetrics.bricksHit++;
                    playerMetrics.totalBallBounces++;
                }
                
                if (brick.hits <= 0) {
                    brick.destroyed = true;
                    if (game) {
                        game.score += brick.points;
                    }
                    
                    // Create particles
                    if (particleSystem) {
                        particleSystem.create(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color);
                    }
                    
                    // Announce brick hit
                    if (this.accessibility) {
                        this.accessibility.announceBrickHit(brick.name, brick.points);
                    }
                    
                    // Dynamic power-up drop rate based on player performance
                    if (powerUpSystem && aiAnalysis) {
                        let dropRate = 0.15; // Base 15% chance
                        
                        if (aiAnalysis.shouldIncreasePowerUpRate()) {
                            dropRate = 0.25; // 25% for struggling players
                        } else if (aiAnalysis.shouldDecreasePowerUpRate()) {
                            dropRate = 0.10; // 10% for skilled players
                        }
                        
                        if (Math.random() < dropRate) {
                            powerUpSystem.create(brick.x + brick.width / 2, brick.y + brick.height / 2);
                        }
                    }
                    
                    if (playerMetrics) {
                        playerMetrics.consecutiveDeaths = 0;
                    }
                }
                
                return true; // Collision occurred
            }
        }
        
        return false; // No collision
    }

    // Check if all bricks are destroyed
    allDestroyed() {
        return this.bricks.every(brick => brick.destroyed);
    }

    // Get remaining brick count
    getRemainingCount() {
        return this.bricks.filter(brick => !brick.destroyed).length;
    }

    // Get total brick count
    getTotalCount() {
        return this.bricks.length;
    }

    // Get completion percentage
    getCompletionPercentage() {
        const destroyed = this.bricks.filter(brick => brick.destroyed).length;
        return Math.round((destroyed / this.bricks.length) * 100);
    }

    // Get bricks by type
    getBricksByType(typeName) {
        return this.bricks.filter(brick => brick.name === typeName && !brick.destroyed);
    }

    // Reset all bricks
    reset() {
        this.bricks.forEach(brick => {
            brick.destroyed = false;
            brick.hits = brick.maxHits;
        });
    }
}
