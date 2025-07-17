/**
 * Event Handling Utilities
 * Centralized event management for the game
 */
import { debugLogger } from '../debug.js';

export class EventHandler {
    constructor(game, accessibility) {
        this.game = game;
        this.accessibility = accessibility;
        this.keys = {};
        this.mouse = { x: 400, y: 500 };
        
        this.init();
    }

    init() {
        this.setupKeyboardEvents();
        this.setupMouseEvents();
        this.setupCanvasEvents();
    }

    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    setupMouseEvents() {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            canvas.addEventListener('click', (e) => this.handleClick(e));
        }
    }

    setupCanvasEvents() {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            // Focus canvas for keyboard input
            canvas.addEventListener('click', () => {
                canvas.focus();
            });
        }
    }

    handleKeyDown(e) {
        this.keys[e.code] = true;
        
        debugLogger.input('Key pressed', { key: e.code, gameState: this.game.state });
        
        // Switch to keyboard control when arrow keys are pressed
        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
            this.game.paddle.switchToKeyboard();
            debugLogger.input('Switched to keyboard control');
        }
        
        // ENTER key launches ball when using keyboard controls
        if (e.code === 'Enter' && this.game.state === 'playing' && !this.game.paddle.usingMouse) {
            e.preventDefault();
            this.game.ballSystem.launch();
            debugLogger.input('Ball launched via keyboard');
        }
        
        // SHIFT key starts sprint
        if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && this.game.state === 'playing') {
            e.preventDefault();
            this.game.sprintSystem.start(this.game.ballSystem.getAllBalls(), this.game.state);
            debugLogger.input('Sprint started');
        }
        
        // SPACE key pauses/unpauses
        if (e.code === 'Space') {
            e.preventDefault();
            this.handleSpaceKey();
            debugLogger.input('Space key handled', { newState: this.game.state });
        }
        
        // A key toggles audio
        if (e.code === 'KeyA') {
            e.preventDefault();
            if (this.accessibility) {
                this.accessibility.toggleAudio();
                debugLogger.input('Audio toggled');
            }
        }
        
        // H key shows help/shortcuts
        if (e.code === 'KeyH') {
            e.preventDefault();
            if (this.accessibility) {
                this.accessibility.announceKeyboardShortcuts();
                debugLogger.input('Help shortcuts announced');
            }
        }
        
        // ESC key returns to menu (if in game)
        if (e.code === 'Escape') {
            e.preventDefault();
            if (this.game.state === 'playing' || this.game.state === 'paused') {
                this.game.returnToMenu();
                debugLogger.input('Returned to menu via ESC');
            }
        }
    }

    handleKeyUp(e) {
        this.keys[e.code] = false;
        
        debugLogger.input('Key released', { key: e.code });
        
        // SHIFT key ends sprint
        if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && this.game.state === 'playing') {
            e.preventDefault();
            this.game.sprintSystem.end();
            debugLogger.input('Sprint ended');
        }
    }

    handleMouseMove(e) {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const newX = e.clientX - rect.left;
        const newY = e.clientY - rect.top;
        
        // Only log significant mouse movements to avoid spam
        if (Math.abs(newX - this.mouse.x) > 10) {
            debugLogger.input('Mouse moved', { x: newX.toFixed(0), y: newY.toFixed(0) });
        }
        
        this.mouse.x = newX;
        this.mouse.y = newY;
        
        // Switch to mouse control when mouse moves
        if (this.game.state === 'playing') {
            this.game.paddle.switchToMouse();
        }
    }

    handleClick(e) {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        debugLogger.input('Mouse clicked', { 
            x: clickX.toFixed(0), 
            y: clickY.toFixed(0), 
            gameState: this.game.state 
        });
        
        // Focus canvas for keyboard input
        canvas.focus();
        
        if (this.game.state === 'menu' || this.game.state === 'gameOver') {
            this.game.start();
            debugLogger.input('Game started via click');
        } else if (this.game.state === 'playing') {
            this.game.ballSystem.launch();
            debugLogger.input('Ball launched via click');
        } else if (this.game.state === 'ballLost') {
            // Allow clicking during ball lost state to continue faster
            if (this.game.lives > 0) {
                this.game.ballSystem.addBall(
                    this.game.paddle.centerX, 
                    this.game.paddle.y - 8, 
                    true
                );
                this.game.state = 'playing';
                debugLogger.input('Ball respawned via click');
            }
        }
    }

    handleSpaceKey() {
        if (this.game.state === 'playing') {
            this.game.pause();
        } else if (this.game.state === 'paused') {
            this.game.resume();
        } else if (this.game.state === 'menu') {
            this.game.start();
        }
    }

    // Get current key states
    getKeys() {
        return { ...this.keys };
    }

    // Get current mouse position
    getMouse() {
        return { ...this.mouse };
    }

    // Check if specific key is pressed
    isKeyPressed(keyCode) {
        return !!this.keys[keyCode];
    }

    // Check if any arrow key is pressed
    isArrowKeyPressed() {
        return this.keys['ArrowLeft'] || this.keys['ArrowRight'] || 
               this.keys['ArrowUp'] || this.keys['ArrowDown'];
    }

    // Check if any shift key is pressed
    isShiftPressed() {
        return this.keys['ShiftLeft'] || this.keys['ShiftRight'];
    }

    // Cleanup event listeners
    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.removeEventListener('mousemove', this.handleMouseMove);
            canvas.removeEventListener('click', this.handleClick);
        }
    }
}
