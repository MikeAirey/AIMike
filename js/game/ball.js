/**
 * Ball System
 * Handles ball creation, movement, and collision detection
 */
import { debugLogger } from '../debug.js';

export class BallSystem {
    constructor(accessibility) {
        this.accessibility = accessibility;
        this.balls = [];
    }

    // Ball factory function
    createBall(x, y, onPaddle = false) {
        return {
            x: x,
            y: y,
            radius: 8,
            dx: 0,
            dy: 0,
            speed: 5,
            normalSpeed: 5,
            onPaddle: onPaddle
        };
    }

    // Add a new ball to the system
    addBall(x, y, onPaddle = false) {
        const ball = this.createBall(x, y, onPaddle);
        this.balls.push(ball);
        debugLogger.physics('Ball added', { x, y, onPaddle, totalBalls: this.balls.length });
        return ball;
    }

    // Remove all balls
    clear() {
        this.balls.length = 0;
    }

    // Reset balls to initial state
    reset(paddle) {
        this.clear();
        this.addBall(paddle.x + paddle.width / 2, paddle.y - 8, true);
    }

    // Launch the first ball on paddle
    launch() {
        const ballOnPaddle = this.balls.find(ball => ball.onPaddle);
        if (ballOnPaddle) {
            ballOnPaddle.onPaddle = false;
            ballOnPaddle.dx = (Math.random() - 0.5) * 4;
            ballOnPaddle.dy = -ballOnPaddle.speed;
            debugLogger.physics('Ball launched', { 
                dx: ballOnPaddle.dx, 
                dy: ballOnPaddle.dy, 
                speed: ballOnPaddle.speed 
            });
        }
    }

    // Update all balls
    update(canvas, paddle, playerMetrics) {
        // Update each ball
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            
            if (ball.onPaddle) {
                // Ball follows paddle when on paddle
                ball.x = paddle.x + paddle.width / 2;
                ball.y = paddle.y - ball.radius;
                continue;
            }
            
            // Move ball
            ball.x += ball.dx;
            ball.y += ball.dy;
            
            // Wall collisions
            if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
                ball.dx = -ball.dx;
                ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x));
                debugLogger.physics('Ball hit side wall', { x: ball.x, dx: ball.dx });
                if (this.accessibility) {
                    this.accessibility.announceWallBounce();
                }
            }
            
            if (ball.y - ball.radius <= 0) {
                ball.dy = -ball.dy;
                ball.y = ball.radius;
                debugLogger.physics('Ball hit top wall', { y: ball.y, dy: ball.dy });
                if (this.accessibility) {
                    this.accessibility.announceWallBounce();
                }
            }
            
            // Paddle collision
            if (ball.y + ball.radius >= paddle.y && 
                ball.y - ball.radius <= paddle.y + paddle.height &&
                ball.x >= paddle.x && 
                ball.x <= paddle.x + paddle.width) {
                
                // Calculate bounce angle based on where ball hits paddle
                const hitPos = (ball.x - paddle.x) / paddle.width;
                const bounceAngle = (hitPos - 0.5) * Math.PI * 0.6; // Max 54 degrees
                
                ball.dx = Math.sin(bounceAngle) * ball.speed;
                ball.dy = -Math.cos(bounceAngle) * ball.speed;
                ball.y = paddle.y - ball.radius;
                
                debugLogger.physics('Ball hit paddle', { 
                    hitPos: hitPos.toFixed(2), 
                    bounceAngle: (bounceAngle * 180 / Math.PI).toFixed(1) + '°',
                    newDx: ball.dx.toFixed(2),
                    newDy: ball.dy.toFixed(2)
                });
                
                // Track paddle hits for AI
                if (playerMetrics) {
                    playerMetrics.paddleHits++;
                    playerMetrics.totalBallBounces++;
                }
                
                if (this.accessibility) {
                    this.accessibility.announcePaddleHit();
                }
            }
            
            // Remove balls that fall off bottom
            if (ball.y > canvas.height) {
                debugLogger.physics('Ball fell off screen', { 
                    ballsRemaining: this.balls.length - 1 
                });
                this.balls.splice(i, 1);
            }
        }
    }

    // Draw all balls
    draw(ctx) {
        this.balls.forEach(ball => {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            
            // Add glow effect
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }

    // Check if any balls are still in play
    hasActiveBalls() {
        return this.balls.length > 0;
    }

    // Get all balls (for external systems like sprint)
    getAllBalls() {
        return this.balls;
    }

    // Get balls not on paddle
    getActiveBalls() {
        return this.balls.filter(ball => !ball.onPaddle);
    }

    // Get balls on paddle
    getBallsOnPaddle() {
        return this.balls.filter(ball => ball.onPaddle);
    }

    // Update ball speeds (used by power-ups and sprint system)
    updateAllSpeeds(speedModifier) {
        this.balls.forEach(ball => {
            if (!ball.onPaddle) {
                const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                const newSpeed = ball.normalSpeed * speedModifier;
                const ratio = newSpeed / currentSpeed;
                
                ball.dx *= ratio;
                ball.dy *= ratio;
                ball.speed = newSpeed;
            }
        });
    }

    // Create multiple balls from existing ball (for multi-ball power-up)
    splitBall(sourceBall, count = 2) {
        if (!sourceBall || sourceBall.onPaddle) return [];
        
        const newBalls = [];
        const originalDx = sourceBall.dx;
        const originalDy = sourceBall.dy;
        
        debugLogger.physics('Splitting ball', { count, totalBallsBefore: this.balls.length });
        
        for (let i = 0; i < count; i++) {
            const newBall = this.createBall(sourceBall.x, sourceBall.y, false);
            
            // Create spread pattern
            const angle = (i - (count - 1) / 2) * 0.5; // Spread balls
            newBall.dx = originalDx * Math.cos(angle) - originalDy * Math.sin(angle);
            newBall.dy = originalDx * Math.sin(angle) + originalDy * Math.cos(angle);
            newBall.speed = sourceBall.speed;
            newBall.normalSpeed = sourceBall.normalSpeed;
            
            this.balls.push(newBall);
            newBalls.push(newBall);
        }
        
        debugLogger.physics('Ball split complete', { 
            newBallsCreated: count, 
            totalBallsAfter: this.balls.length 
        });
        
        return newBalls;
    }

    // Get count of balls
    get count() {
        return this.balls.length;
    }

    // Get count of active balls (not on paddle)
    get activeCount() {
        return this.balls.filter(ball => !ball.onPaddle).length;
    }
}
