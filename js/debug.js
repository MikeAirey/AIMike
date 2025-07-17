/**
 * Debug Logging System
 * Handles debug log output to the debug panel
 */
export class DebugLogger {
    constructor() {
        this.enabled = false;
        this.logElement = null;
        this.maxLogEntries = 100;
        this.logEntries = [];
        
        this.init();
    }

    init() {
        this.logElement = document.getElementById('debugLog');
        const debugPanel = document.getElementById('debugPanel');
        const debugToggle = document.getElementById('debugToggle');
        const clearButton = document.getElementById('clearDebugLog');
        
        // Initially hide the debug panel
        if (debugPanel) {
            debugPanel.classList.add('hidden');
        }
        
        // Setup debug toggle button
        if (debugToggle) {
            debugToggle.addEventListener('click', this.toggleDebug.bind(this));
        }
        
        // Setup clear button
        if (clearButton) {
            clearButton.addEventListener('click', this.clearLog.bind(this));
        }
        
        // Load debug state from localStorage
        const savedState = localStorage.getItem('speedball_debug_enabled');
        if (savedState === 'true') {
            this.enableDebug();
        }
    }

    toggleDebug() {
        if (this.enabled) {
            this.disableDebug();
        } else {
            this.enableDebug();
        }
    }

    enableDebug() {
        this.enabled = true;
        const debugPanel = document.getElementById('debugPanel');
        const debugToggle = document.getElementById('debugToggle');
        
        if (debugPanel) {
            debugPanel.classList.remove('hidden');
        }
        
        if (debugToggle) {
            debugToggle.textContent = 'ON';
            debugToggle.setAttribute('aria-pressed', 'true');
        }
        
        // Save state to localStorage
        localStorage.setItem('speedball_debug_enabled', 'true');
        
        this.log('Debug logging enabled', 'system');
    }

    disableDebug() {
        this.enabled = false;
        const debugPanel = document.getElementById('debugPanel');
        const debugToggle = document.getElementById('debugToggle');
        
        if (debugPanel) {
            debugPanel.classList.add('hidden');
        }
        
        if (debugToggle) {
            debugToggle.textContent = 'OFF';
            debugToggle.setAttribute('aria-pressed', 'false');
        }
        
        // Save state to localStorage
        localStorage.setItem('speedball_debug_enabled', 'false');
    }

    log(message, category = 'info', data = null) {
        if (!this.enabled) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            timestamp,
            category,
            message,
            data
        };
        
        this.logEntries.push(logEntry);
        
        // Keep only the last maxLogEntries
        if (this.logEntries.length > this.maxLogEntries) {
            this.logEntries.shift();
        }
        
        this.updateLogDisplay();
    }

    updateLogDisplay() {
        if (!this.logElement) return;
        
        const logText = this.logEntries.map(entry => {
            let line = `[${entry.timestamp}] [${entry.category.toUpperCase()}] ${entry.message}`;
            if (entry.data) {
                line += ` | Data: ${JSON.stringify(entry.data)}`;
            }
            return line;
        }).join('\n');
        
        this.logElement.textContent = logText;
        
        // Auto-scroll to bottom
        this.logElement.scrollTop = this.logElement.scrollHeight;
    }

    clearLog() {
        this.logEntries = [];
        if (this.logElement) {
            this.logElement.textContent = '';
        }
        this.log('Debug log cleared', 'system');
    }

    // Convenience methods for different log levels
    info(message, data = null) {
        this.log(message, 'info', data);
    }

    warn(message, data = null) {
        this.log(message, 'warn', data);
    }

    error(message, data = null) {
        this.log(message, 'error', data);
    }

    game(message, data = null) {
        this.log(message, 'game', data);
    }

    ai(message, data = null) {
        this.log(message, 'ai', data);
    }

    physics(message, data = null) {
        this.log(message, 'physics', data);
    }

    input(message, data = null) {
        this.log(message, 'input', data);
    }

    audio(message, data = null) {
        this.log(message, 'audio', data);
    }
}

// Create global debug logger instance
export const debugLogger = new DebugLogger();
