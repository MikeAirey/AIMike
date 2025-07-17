/**
 * Sprint System
 * Handles ball speed acceleration/deceleration mechanics
 */
export class SprintSystem {
    constructor(accessibility) {
        this.accessibility = accessibility;
        
        // Configuration
        this.config = {
            accelerationPeriodMs: 500,
            defaultSpeed: 5,
            topSpeed: 50,
            
            // Calculate multiplier dynamically
            get speedMultiplier() {
                return this.topSpeed / this.defaultSpeed;
            }
        };
        
        // State management
        this.state = {
            isActive: false,
            isAccelerating: false,
            isDecelerating: false,
            startTime: 0,
            ballStates: new Map(), // track each ball's original speed
            currentOscillator: null,
            audioUpdateTimer: null
        };
        
        // Audio configuration
        this.audioConfig = {
            baseFrequency: 300,
            maxFrequency: 800,
            oscillatorType: 'sine',
            volume: 0.1,
            updateInterval: 50
        };
    }

    init() {
        this.initializeControls();
    }

    initializeControls() {
        // Set initial values from config
        const accelerationPeriod = document.getElementById('accelerationPeriod');
        const defaultSpeed = document.getElementById('defaultSpeed');
        const topSpeed = document.getElementById('topSpeed');
        
        if (accelerationPeriod) accelerationPeriod.value = this.config.accelerationPeriodMs;
        if (defaultSpeed) defaultSpeed.value = this.config.defaultSpeed;
        if (topSpeed) topSpeed.value = this.config.topSpeed;
        
        // Add event listeners
        const applyButton = document.getElementById('applySprintConfig');
        const resetButton = document.getElementById('resetSprintConfig');
        
        if (applyButton) {
            applyButton.addEventListener('click', () => this.applySettings());
        }
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetSettings());
        }
    }

    applySettings() {
        const accelerationPeriod = document.getElementById('accelerationPeriod');
        const defaultSpeed = document.getElementById('defaultSpeed');
        const topSpeed = document.getElementById('topSpeed');
        
        if (accelerationPeriod) {
            this.config.accelerationPeriodMs = parseInt(accelerationPeriod.value);
        }
        if (defaultSpeed) {
            this.config.defaultSpeed = parseFloat(defaultSpeed.value);
        }
        if (topSpeed) {
            this.config.topSpeed = parseFloat(topSpeed.value);
        }
        
        console.log('Sprint settings applied:', this.config);
        
        // Announce settings change
        if (this.accessibility) {
            this.accessibility.announce('Sprint settings updated');
        }
    }

    resetSettings() {
        this.config.accelerationPeriodMs = 500;
        this.config.defaultSpeed = 5;
        this.config.topSpeed = 50;
        
        // Update UI
        this.initializeControls();
        
        if (this.accessibility) {
            this.accessibility.announce('Sprint settings reset to defaults');
        }
    }

    start(balls, gameState) {
        if (this.state.isActive || gameState !== 'playing') return;
        
        this.state.isActive = true;
        this.state.isAccelerating = true;
        this.state.isDecelerating = false;
        this.state.startTime = performance.now();
        this.state.ballStates.clear();
        
        // Record original speeds for all balls
        balls.forEach((ball, index) => {
            if (!ball.onPaddle) {
                this.state.ballStates.set(index, ball.speed);
            }
        });
        
        // Start acceleration audio
        this.startAudio(true);
        
        // Announce sprint start
        if (this.accessibility) {
            this.accessibility.announceGameState('sprintStart');
        }
    }

    end() {
        if (!this.state.isActive || this.state.isDecelerating) return;
        
        this.state.isAccelerating = false;
        this.state.isDecelerating = true;
        this.state.startTime = performance.now();
        
        // Start deceleration audio
        this.startAudio(false);
        
        // Announce sprint end
        if (this.accessibility) {
            this.accessibility.announceGameState('sprintEnd');
        }
    }

    update(balls) {
        if (!this.state.isActive) return;
        
        const currentTime = performance.now();
        const elapsed = currentTime - this.state.startTime;
        const progress = Math.min(elapsed / this.config.accelerationPeriodMs, 1);
        
        if (this.state.isAccelerating) {
            // Accelerate all balls
            balls.forEach((ball, index) => {
                if (!ball.onPaddle && this.state.ballStates.has(index)) {
                    const originalSpeed = this.state.ballStates.get(index);
                    const targetSpeed = originalSpeed * this.config.speedMultiplier;
                    ball.speed = originalSpeed + (targetSpeed - originalSpeed) * progress;
                    
                    // Update velocity components proportionally
                    const speedRatio = ball.speed / originalSpeed;
                    ball.dx = (ball.dx / Math.abs(ball.dx || 1)) * Math.abs(ball.dx) * speedRatio;
                    ball.dy = (ball.dy / Math.abs(ball.dy || 1)) * Math.abs(ball.dy) * speedRatio;
                }
            });
            
            if (progress >= 1) {
                this.state.isAccelerating = false;
                // Continue at top speed
            }
        } else if (this.state.isDecelerating) {
            // Decelerate all balls
            balls.forEach((ball, index) => {
                if (!ball.onPaddle && this.state.ballStates.has(index)) {
                    const originalSpeed = this.state.ballStates.get(index);
                    const currentTopSpeed = originalSpeed * this.config.speedMultiplier;
                    ball.speed = currentTopSpeed - (currentTopSpeed - originalSpeed) * progress;
                    
                    // Update velocity components proportionally
                    const speedRatio = ball.speed / currentTopSpeed;
                    ball.dx = (ball.dx / Math.abs(ball.dx || 1)) * Math.abs(ball.dx) * speedRatio;
                    ball.dy = (ball.dy / Math.abs(ball.dy || 1)) * Math.abs(ball.dy) * speedRatio;
                }
            });
            
            if (progress >= 1) {
                // Sprint complete
                this.state.isActive = false;
                this.state.isDecelerating = false;
                this.state.ballStates.clear();
                this.stopAudio();
            }
        }
    }

    startAudio(isAccelerating) {
        if (!this.accessibility || !this.accessibility.audioEnabled || !this.accessibility.audioContext) return;
        
        // Stop any existing sprint audio
        this.stopAudio();
        
        // Create new oscillator
        this.state.currentOscillator = this.accessibility.audioContext.createOscillator();
        const gainNode = this.accessibility.audioContext.createGain();
        
        this.state.currentOscillator.connect(gainNode);
        gainNode.connect(this.accessibility.audioContext.destination);
        
        this.state.currentOscillator.type = this.audioConfig.oscillatorType;
        this.state.currentOscillator.frequency.value = isAccelerating ? 
            this.audioConfig.baseFrequency : this.audioConfig.maxFrequency;
        
        gainNode.gain.setValueAtTime(this.audioConfig.volume, this.accessibility.audioContext.currentTime);
        
        this.state.currentOscillator.start();
        
        // Start audio update timer
        this.state.audioUpdateTimer = setInterval(() => {
            this.updateAudioPitch(isAccelerating);
        }, this.audioConfig.updateInterval);
    }

    updateAudioPitch(isAccelerating) {
        if (!this.state.currentOscillator || !this.state.isActive) return;
        
        const currentTime = performance.now();
        const elapsed = currentTime - this.state.startTime;
        const progress = Math.min(elapsed / this.config.accelerationPeriodMs, 1);
        
        let frequency;
        if (isAccelerating) {
            frequency = this.audioConfig.baseFrequency + 
                (this.audioConfig.maxFrequency - this.audioConfig.baseFrequency) * progress;
        } else {
            frequency = this.audioConfig.maxFrequency - 
                (this.audioConfig.maxFrequency - this.audioConfig.baseFrequency) * progress;
        }
        
        this.state.currentOscillator.frequency.setValueAtTime(
            frequency, 
            this.accessibility.audioContext.currentTime
        );
    }

    stopAudio() {
        if (this.state.currentOscillator) {
            try {
                this.state.currentOscillator.stop();
            } catch (e) {
                // Oscillator may already be stopped
            }
            this.state.currentOscillator = null;
        }
        
        if (this.state.audioUpdateTimer) {
            clearInterval(this.state.audioUpdateTimer);
            this.state.audioUpdateTimer = null;
        }
    }

    // Getters for external access
    get isActive() {
        return this.state.isActive;
    }

    get isAccelerating() {
        return this.state.isAccelerating;
    }

    get isDecelerating() {
        return this.state.isDecelerating;
    }
}
