/**
 * Power-up System
 * Handles power-up creation, effects, and management
 */
export class PowerUpSystem {
    constructor(accessibility) {
        this.accessibility = accessibility;
        this.powerUps = [];
        this.activePowerUps = [];
        
        // Power-up type definitions
        this.types = {
            widePaddle: {
                name: 'Wide Paddle',
                color: '#4444ff',
                letter: 'W',
                duration: 15000,
                effect: (paddle) => {
                    paddle.makeWide();
                },
                reset: (paddle) => {
                    paddle.makeNormal();
                }
            },
            multiBall: {
                name: 'Multi-ball',
                color: '#ff44ff',
                letter: 'M',
                duration: 0, // Permanent until balls are lost
                effect: (paddle, ballSystem) => {
                    // Find a ball that's not on paddle to split
                    const activeBalls = ballSystem.getActiveBalls();
                    if (activeBalls.length > 0) {
                        const sourceBall = activeBalls[0];
                        ballSystem.splitBall(sourceBall, 2);
                    }
                }
            },
            slowBall: {
                name: 'Slow Ball',
                color: '#44ff44',
                letter: 'S',
                duration: 20000,
                effect: (paddle, ballSystem) => {
                    ballSystem.updateAllSpeeds(0.7);
                },
                reset: (paddle, ballSystem) => {
                    ballSystem.updateAllSpeeds(1.0);
                }
            }
        };
    }

    create(x, y) {
        const typeKeys = Object.keys(this.types);
        const randomType = typeKeys[Math.floor(Math.random() * typeKeys.length)];
        
        this.powerUps.push({
            x: x - 15,
            y: y,
            width: 30,
            height: 20,
            dy: 2,
            type: randomType,
            config: this.types[randomType]
        });
    }

    update(paddle, ballSystem) {
        // Update falling power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.y += powerUp.dy;
            
            // Check collision with paddle
            if (powerUp.y + powerUp.height >= paddle.y &&
                powerUp.y <= paddle.y + paddle.height &&
                powerUp.x + powerUp.width >= paddle.x &&
                powerUp.x <= paddle.x + paddle.width) {
                
                // Activate power-up
                this.activate(powerUp.type, paddle, ballSystem);
                this.powerUps.splice(i, 1);
                continue;
            }
            
            // Remove if off screen
            if (powerUp.y > 600) { // Assuming canvas height of 600
                this.powerUps.splice(i, 1);
            }
        }
        
        // Update active power-up timers
        for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
            const activePowerUp = this.activePowerUps[i];
            activePowerUp.timeLeft -= 16; // Approximate frame time
            
            if (activePowerUp.timeLeft <= 0) {
                // Reset power-up effect
                if (activePowerUp.config.reset) {
                    activePowerUp.config.reset(paddle, ballSystem);
                }
                this.activePowerUps.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        // Draw falling power-ups
        this.powerUps.forEach(powerUp => {
            // Draw power-up background with better contrast
            ctx.fillStyle = powerUp.config.color;
            ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
            
            // Add dark border for better definition
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
            
            // Draw letter with text shadow for better contrast
            ctx.fillStyle = '#000';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            // Text shadow
            ctx.fillText(powerUp.config.letter, powerUp.x + powerUp.width / 2 + 1, powerUp.y + 15);
            
            // Main text in white
            ctx.fillStyle = '#fff';
            ctx.fillText(powerUp.config.letter, powerUp.x + powerUp.width / 2, powerUp.y + 14);
        });
    }

    activate(type, paddle, ballSystem) {
        const config = this.types[type];
        if (!config) return;
        
        // Apply effect
        config.effect(paddle, ballSystem);
        
        // Announce power-up
        if (this.accessibility) {
            this.accessibility.announcePowerUp(config.name);
        }
        
        // Add to active power-ups if it has a duration
        if (config.duration > 0) {
            // Remove existing power-up of same type
            for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
                if (this.activePowerUps[i].type === type) {
                    this.activePowerUps.splice(i, 1);
                    break;
                }
            }
            
            this.activePowerUps.push({
                type: type,
                config: config,
                timeLeft: config.duration
            });
        }
        
        this.updateUI();
    }

    updateUI() {
        const powerUpDiv = document.getElementById('powerUps');
        if (!powerUpDiv) return;
        
        powerUpDiv.innerHTML = '';
        
        this.activePowerUps.forEach(powerUp => {
            const timer = document.createElement('div');
            timer.className = 'power-up-timer';
            timer.style.backgroundColor = powerUp.config.color;
            timer.textContent = `${powerUp.config.name}: ${Math.ceil(powerUp.timeLeft / 1000)}s`;
            powerUpDiv.appendChild(timer);
        });
    }

    // Clear all power-ups
    clear() {
        this.powerUps.length = 0;
        this.activePowerUps.length = 0;
        this.updateUI();
    }

    // Reset all active power-ups
    resetActive(paddle, ballSystem) {
        this.activePowerUps.forEach(activePowerUp => {
            if (activePowerUp.config.reset) {
                activePowerUp.config.reset(paddle, ballSystem);
            }
        });
        this.activePowerUps.length = 0;
        this.updateUI();
    }

    // Get active power-up count
    getActiveCount() {
        return this.activePowerUps.length;
    }

    // Check if specific power-up is active
    isActive(type) {
        return this.activePowerUps.some(powerUp => powerUp.type === type);
    }

    // Get falling power-up count
    getFallingCount() {
        return this.powerUps.length;
    }

    // Add custom power-up type
    addType(name, config) {
        this.types[name] = config;
    }

    // Remove power-up type
    removeType(name) {
        delete this.types[name];
    }
}
