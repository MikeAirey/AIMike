/**
 * Accessibility System
 * Handles screen reader announcements, audio feedback, and accessibility features
 */
import { debugLogger } from './debug.js';

export class Accessibility {
    constructor() {
        this.audioEnabled = true;
        this.audioContext = null;
    }

    init() {
        // Initialize audio context on first user interaction
        document.addEventListener('click', this.initAudio.bind(this), { once: true });
        document.addEventListener('keydown', this.initAudio.bind(this), { once: true });
        
        // Setup audio toggle button
        const audioToggle = document.getElementById('audioToggle');
        if (audioToggle) {
            audioToggle.addEventListener('click', this.toggleAudio.bind(this));
        }
        
        // Load audio state from localStorage, default to enabled
        const savedState = localStorage.getItem('speedball_audio_enabled');
        if (savedState === 'false') {
            this.audioEnabled = false;
            if (audioToggle) {
                audioToggle.textContent = 'OFF';
                audioToggle.setAttribute('aria-pressed', 'false');
            }
        } else {
            this.audioEnabled = true;
            if (audioToggle) {
                audioToggle.textContent = 'ON';
                audioToggle.setAttribute('aria-pressed', 'true');
            }
        }
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            debugLogger.audio('Audio context initialized');
        } catch (e) {
            console.log('Audio not supported');
            this.audioEnabled = false;
            debugLogger.audio('Audio initialization failed', { error: e.message });
        }
    }

    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        const button = document.getElementById('audioToggle');
        if (button) {
            button.textContent = this.audioEnabled ? 'ON' : 'OFF';
            button.setAttribute('aria-pressed', this.audioEnabled.toString());
        }
        
        // Save state to localStorage
        localStorage.setItem('speedball_audio_enabled', this.audioEnabled.toString());
        
        debugLogger.audio('Audio toggled', { enabled: this.audioEnabled });
    }

    playSound(frequency, duration = 100, type = 'sine') {
        if (!this.audioEnabled || !this.audioContext) return;
        
        debugLogger.audio('Playing sound', { frequency, duration, type });
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }

    announce(message, priority = 'polite') {
        const element = priority === 'assertive' ? 
            document.getElementById('gameStatus') : 
            document.getElementById('gameAnnouncements');
        
        if (!element) return;
        
        element.textContent = message;
        
        // Clear after a delay to allow for new announcements
        setTimeout(() => {
            if (element.textContent === message) {
                element.textContent = '';
            }
        }, 3000);
    }

    announceGameState(state, gameData = {}) {
        switch (state) {
            case 'menu':
                this.announce('Game menu. Click or press Enter to start playing.');
                break;
            case 'playing':
                this.announce('Game started. Use arrow keys to move paddle.');
                break;
            case 'paused':
                this.announce('Game paused. Press Space to continue.', 'assertive');
                break;
            case 'ballLost':
                this.announce(`Ball lost! ${gameData.lives || 0} lives remaining.`, 'assertive');
                this.playSound(200, 300, 'sawtooth'); // Low warning sound
                break;
            case 'gameOver':
                this.announce(`Game Over! Final score: ${gameData.score || 0}. Level reached: ${gameData.level || 1}.`, 'assertive');
                this.playSound(150, 500, 'triangle'); // Game over sound
                break;
            case 'levelComplete':
                this.announce(`Level ${gameData.level || 1} complete! Advancing to next level.`);
                this.playSound(800, 200); // Success sound
                break;
            case 'sprintStart':
                this.announce('Sprint mode activated!', 'assertive');
                break;
            case 'sprintEnd':
                this.announce('Sprint mode deactivated.');
                break;
        }
    }

    announcePowerUp(powerUpName) {
        this.announce(`Power-up collected: ${powerUpName}`);
        this.playSound(600, 150); // Power-up sound
    }

    announceBrickHit(brickColor, points) {
        // Only announce occasionally to avoid spam
        if (Math.random() < 0.1) {
            this.announce(`${brickColor} brick hit for ${points} points`);
        }
        this.playSound(400 + (points * 5), 50); // Pitch varies with points
    }

    announcePaddleHit() {
        this.playSound(300, 50, 'square'); // Paddle hit sound
    }

    announceWallBounce() {
        this.playSound(250, 30, 'square'); // Wall bounce sound
    }

    // Enhanced accessibility features
    announceScore(score) {
        if (score % 100 === 0 && score > 0) {
            this.announce(`Score milestone: ${score} points!`);
        }
    }

    announceAccuracy(accuracy) {
        if (accuracy >= 90) {
            this.announce('Excellent accuracy!');
        } else if (accuracy <= 20) {
            this.announce('Try to aim for the bricks!');
        }
    }

    // Keyboard shortcut announcements
    announceKeyboardShortcuts() {
        const shortcuts = [
            'Arrow keys: Move paddle',
            'Space: Pause game',
            'Enter: Launch ball',
            'Shift: Sprint mode',
            'A: Toggle audio'
        ];
        this.announce(`Keyboard shortcuts: ${shortcuts.join(', ')}`);
    }
}
