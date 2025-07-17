/**
 * Main Game Engine
 * Coordinates all game systems and manages the game loop
 */
import { Accessibility } from './accessibility.js';
import { SprintSystem } from './game/sprint.js';
import { BallSystem } from './game/ball.js';
import { PaddleSystem } from './game/paddle.js';
import { BrickSystem } from './game/bricks.js';
import { PowerUpSystem } from './game/powerups.js';
import { ParticleSystem } from './game/particles.js';
import { AIAnalysis } from './ai/analysis.js';
import { EventHandler } from './utils/events.js';
import { debugLogger } from './debug.js';

class Game {
    constructor() {
        // Get canvas and context
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.state = 'menu'; // menu, playing, paused, gameOver, levelComplete, ballLost
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.lastTime = 0;
        this.animationId = null;
        
        // Initialize systems
        this.accessibility = new Accessibility();
        this.sprintSystem = new SprintSystem(this.accessibility);
        this.ballSystem = new BallSystem(this.accessibility);
        this.paddle = new PaddleSystem();
        this.brickSystem = new BrickSystem(this.accessibility);
        this.powerUpSystem = new PowerUpSystem(this.accessibility);
        this.particleSystem = new ParticleSystem();
        this.aiAnalysis = new AIAnalysis();
        this.eventHandler = new EventHandler(this, this.accessibility);
        
        this.init();
    }

    init() {
        debugLogger.game('Initializing game systems');
        
        // Initialize all systems
        this.accessibility.init();
        this.sprintSystem.init();
        
        // Announce initial state
        this.accessibility.announceGameState('menu');
        
        debugLogger.game('Game systems initialized, starting game loop');
        
        // Start game loop
        this.gameLoop(0);
    }

    start() {
        debugLogger.game('Starting new game');
        
        this.state = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        // Hide cursor when game starts
        this.canvas.classList.add('playing');
        
        // Reset all systems
        this.paddle.reset();
        this.paddle.speed = 8; // Reset paddle speed
        this.brickSystem.create();
        this.ballSystem.reset(this.paddle);
        this.particleSystem.clear();
        this.powerUpSystem.clear();
        this.aiAnalysis.resetForNewGame();
        
        debugLogger.game('Game started', { score: this.score, lives: this.lives, level: this.level });
        
        // Announce game start
        this.accessibility.announceGameState('playing');
        this.updateUI();
    }

    pause() {
        if (this.state === 'playing') {
            debugLogger.game('Game paused');
            this.state = 'paused';
            this.accessibility.announceGameState('paused');
        }
    }

    resume() {
        if (this.state === 'paused') {
            debugLogger.game('Game resumed');
            this.state = 'playing';
        }
    }

    returnToMenu() {
        this.state = 'menu';
        this.canvas.classList.remove('playing');
        this.accessibility.announceGameState('menu');
    }

    respawn() {
        // Lose a life
        this.lives--;
        this.aiAnalysis.trackBallLoss();
        
        debugLogger.game('Ball lost, respawning', { lives: this.lives });
        
        if (this.lives <= 0) {
            this.gameOver();
            return;
        }
        
        // Brief pause before respawn
        this.state = 'ballLost';
        this.accessibility.announceGameState('ballLost', { lives: this.lives });
        
        setTimeout(() => {
            if (this.lives > 0) {
                // Add new ball on paddle
                this.ballSystem.addBall(this.paddle.centerX, this.paddle.y - 8, true);
                this.state = 'playing';
                debugLogger.game('Ball respawned');
            }
        }, 1000);
    }

    gameOver() {
        debugLogger.game('Game over', { 
            finalScore: this.score, 
            finalLevel: this.level,
            accuracy: this.aiAnalysis.getMetrics().currentAccuracy
        });
        
        this.state = 'gameOver';
        this.accessibility.announceGameState('gameOver', { 
            score: this.score, 
            level: this.level 
        });
        // Show cursor when game ends
        this.canvas.classList.remove('playing');
    }

    nextLevel() {
        this.level++;
        
        debugLogger.game('Advancing to next level', { level: this.level });
        
        this.brickSystem.create();
        this.paddle.reset();
        this.ballSystem.reset(this.paddle);
        
        // Slightly increase difficulty each level
        this.ballSystem.getAllBalls().forEach(ball => {
            ball.normalSpeed += 0.2;
            ball.speed = ball.normalSpeed;
        });
        
        // Increase paddle speed slightly too
        this.paddle.speed += 0.2;
        
        debugLogger.game('Level difficulty increased', { 
            level: this.level,
            ballSpeed: this.ballSystem.getAllBalls()[0]?.normalSpeed,
            paddleSpeed: this.paddle.speed
        });
        
        this.state = 'playing';
        this.aiAnalysis.resetForNewLevel();
        
        this.accessibility.announceGameState('levelComplete', { level: this.level - 1 });
    }

    update() {
        if (this.state !== 'playing') return;
        
        // Update all systems
        this.paddle.update(this.eventHandler.getKeys(), this.eventHandler.getMouse(), this.canvas);
        this.ballSystem.update(this.canvas, this.paddle, this.aiAnalysis.getMetrics());
        this.powerUpSystem.update(this.paddle, this.ballSystem);
        this.particleSystem.update();
        
        // Check brick collisions for all balls
        this.ballSystem.getAllBalls().forEach(ball => {
            if (this.brickSystem.checkCollision(
                ball, 
                this, 
                this.aiAnalysis.getMetrics(), 
                this.particleSystem, 
                this.powerUpSystem, 
                this.aiAnalysis
            )) {
                this.aiAnalysis.trackBrickHit();
            }
        });
        
        // Update sprint system after brick collisions
        this.sprintSystem.update(this.ballSystem.getAllBalls());
        
        // Check if no balls left
        if (!this.ballSystem.hasActiveBalls()) {
            this.respawn();
        }
        
        // Check if level complete
        if (this.brickSystem.allDestroyed()) {
            this.state = 'levelComplete';
            setTimeout(() => {
                this.nextLevel();
            }, 2000);
        }
        
        // Update AI analysis
        if (this.aiAnalysis.shouldUpdate()) {
            this.aiAnalysis.analyzePerformance();
            this.aiAnalysis.markUpdated();
        }
        
        // Update UI
        this.updateUI();
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.state === 'playing') {
            // Draw all game objects
            this.brickSystem.draw(this.ctx);
            this.paddle.draw(this.ctx);
            this.ballSystem.draw(this.ctx);
            this.powerUpSystem.draw(this.ctx);
            this.particleSystem.draw(this.ctx);
            
        } else if (this.state === 'levelComplete') {
            // Draw game objects
            this.brickSystem.draw(this.ctx);
            this.paddle.draw(this.ctx);
            this.ballSystem.draw(this.ctx);
            this.particleSystem.draw(this.ctx);
            
            // Draw level complete message
            this.drawLevelComplete();
            
        } else if (this.state === 'menu') {
            this.drawMenu();
        } else if (this.state === 'gameOver') {
            this.drawGameOver();
        } else if (this.state === 'ballLost') {
            this.drawBallLost();
        } else if (this.state === 'paused') {
            // Draw game objects (frozen)
            this.brickSystem.draw(this.ctx);
            this.paddle.draw(this.ctx);
            this.ballSystem.draw(this.ctx);
            this.powerUpSystem.draw(this.ctx);
            this.particleSystem.draw(this.ctx);
            this.drawPaused();
        }
    }

    drawMenu() {
        // Show cursor in menu
        this.canvas.classList.remove('playing');
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SPEEDBALL', this.canvas.width / 2, 200);
        
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Click to Start', this.canvas.width / 2, 280);
    }

    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, 200);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, 260);
        this.ctx.fillText(`Level Reached: ${this.level}`, this.canvas.width / 2, 290);
        this.ctx.fillText(`Accuracy: ${this.aiAnalysis.getMetrics().currentAccuracy}%`, this.canvas.width / 2, 320);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = '#aaa';
        const metrics = this.aiAnalysis.getMetrics();
        this.ctx.fillText(`Bricks Hit: ${metrics.bricksHit} | Balls Lost: ${metrics.ballsLost}`, this.canvas.width / 2, 360);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Click to Play Again', this.canvas.width / 2, 420);
    }

    drawBallLost() {
        // Draw game objects (frozen)
        this.brickSystem.draw(this.ctx);
        this.paddle.draw(this.ctx);
        this.particleSystem.draw(this.ctx);
        
        // Draw ball lost message
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ff4444';
        this.ctx.font = '36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('BALL LOST!', this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`Lives Remaining: ${this.lives}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        if (this.lives > 0) {
            this.ctx.font = '14px Arial';
            this.ctx.fillStyle = '#aaa';
            this.ctx.fillText('Click to continue or wait...', this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
    }

    drawPaused() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Press SPACE to continue', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }

    drawLevelComplete() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LEVEL COMPLETE!', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Get ready for the next level...', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
        
        // Calculate and display accuracy with AI skill level indicator
        const metrics = this.aiAnalysis.getMetrics();
        const accuracy = metrics.currentAccuracy;
        
        let accuracyText = accuracy + '%';
        
        // Add skill level indicator (subtle visual feedback)
        if (metrics.skillLevel === 'struggling') {
            accuracyText += ' 🔴'; // Red circle for struggling
        } else if (metrics.skillLevel === 'skilled') {
            accuracyText += ' 🟢'; // Green circle for skilled
        } else {
            accuracyText += ' 🟡'; // Yellow circle for average
        }
        
        document.getElementById('accuracy').textContent = accuracyText;
        
        // Announce score milestones
        this.accessibility.announceScore(this.score);
        this.accessibility.announceAccuracy(accuracy);
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update();
        this.draw();
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    // Cleanup
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.eventHandler.destroy();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
