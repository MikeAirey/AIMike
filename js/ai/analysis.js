/**
 * AI Performance Analysis System
 * Analyzes player performance and provides adaptive assistance
 */
import { debugLogger } from '../debug.js';

export class AIAnalysis {
    constructor() {
        this.updateInterval = 1000; // Update every second
        this.lastUpdate = Date.now();
        
        // Player performance metrics
        this.playerMetrics = {
            ballsLost: 0,
            bricksHit: 0,
            totalBallBounces: 0,
            paddleHits: 0,
            missedBalls: 0,
            timeSpentOnLevel: 0,
            consecutiveDeaths: 0,
            currentAccuracy: 0,
            levelStartTime: Date.now(),
            skillLevel: 'average', // struggling, average, skilled
            needsHelp: false,
            recentPerformance: [], // Track last 10 ball interactions
            avgReactionTime: 0,
            paddleMissDistance: 0 // How far off paddle was when ball was missed
        };
    }

    analyzePerformance() {
        const now = Date.now();
        this.playerMetrics.timeSpentOnLevel = now - this.playerMetrics.levelStartTime;
        
        // Calculate current accuracy
        const previousAccuracy = this.playerMetrics.currentAccuracy;
        if (this.playerMetrics.totalBallBounces > 0) {
            this.playerMetrics.currentAccuracy = Math.round(
                (this.playerMetrics.bricksHit / this.playerMetrics.totalBallBounces) * 100
            );
        }
        
        // Determine skill level based on multiple factors
        const previousSkillLevel = this.playerMetrics.skillLevel;
        this.determineSkillLevel();
        
        // Check if player needs help
        const previousNeedsHelp = this.playerMetrics.needsHelp;
        this.checkNeedsHelp();
        
        // Log significant changes
        if (previousSkillLevel !== this.playerMetrics.skillLevel) {
            debugLogger.ai('Skill level changed', { 
                from: previousSkillLevel, 
                to: this.playerMetrics.skillLevel,
                accuracy: this.playerMetrics.currentAccuracy,
                consecutiveDeaths: this.playerMetrics.consecutiveDeaths
            });
        }
        
        if (previousNeedsHelp !== this.playerMetrics.needsHelp) {
            debugLogger.ai('Help status changed', { 
                needsHelp: this.playerMetrics.needsHelp,
                assistanceLevel: this.getAssistanceLevel()
            });
        }
        
        // Update performance history
        this.updatePerformanceHistory();
        
        debugLogger.ai('Performance analyzed', this.getPerformanceSummary());
    }

    determineSkillLevel() {
        const accuracy = this.playerMetrics.currentAccuracy;
        const consecutiveDeaths = this.playerMetrics.consecutiveDeaths;
        const timeOnLevel = this.playerMetrics.timeSpentOnLevel / 1000; // Convert to seconds
        const ballsLostRate = this.playerMetrics.ballsLost / Math.max(1, timeOnLevel / 30); // Balls lost per 30 seconds
        
        debugLogger.ai('Determining skill level', {
            accuracy,
            consecutiveDeaths,
            timeOnLevel: timeOnLevel.toFixed(1),
            ballsLostRate: ballsLostRate.toFixed(2)
        });
        
        // Struggling indicators
        if (accuracy < 30 || consecutiveDeaths >= 3 || ballsLostRate > 2) {
            this.playerMetrics.skillLevel = 'struggling';
        } 
        // Skilled indicators
        else if (accuracy > 60 && consecutiveDeaths === 0 && ballsLostRate < 0.5) {
            this.playerMetrics.skillLevel = 'skilled';
        }
        // Average (default)
        else {
            this.playerMetrics.skillLevel = 'average';
        }
    }

    checkNeedsHelp() {
        const struggling = this.playerMetrics.skillLevel === 'struggling';
        const longTimeOnLevel = this.playerMetrics.timeSpentOnLevel > 120000; // 2 minutes
        const lowProgress = this.playerMetrics.bricksHit < 10 && this.playerMetrics.timeSpentOnLevel > 60000; // Less than 10 bricks in 1 minute
        
        this.playerMetrics.needsHelp = struggling || longTimeOnLevel || lowProgress;
    }

    updatePerformanceHistory() {
        // Track recent performance for trend analysis
        const currentPerformance = {
            timestamp: Date.now(),
            accuracy: this.playerMetrics.currentAccuracy,
            consecutiveDeaths: this.playerMetrics.consecutiveDeaths,
            skillLevel: this.playerMetrics.skillLevel
        };
        
        this.playerMetrics.recentPerformance.push(currentPerformance);
        
        // Keep only last 10 entries
        if (this.playerMetrics.recentPerformance.length > 10) {
            this.playerMetrics.recentPerformance.shift();
        }
    }

    trackPaddleMiss(ballX, paddleX, paddleWidth) {
        // Calculate how far the ball was from the paddle center when missed
        const paddleCenter = paddleX + paddleWidth / 2;
        const missDistance = Math.abs(ballX - paddleCenter);
        
        // Update average miss distance (for AI assistance calibration)
        if (this.playerMetrics.paddleMissDistance === 0) {
            this.playerMetrics.paddleMissDistance = missDistance;
        } else {
            this.playerMetrics.paddleMissDistance = (this.playerMetrics.paddleMissDistance + missDistance) / 2;
        }
    }

    getAssistanceLevel() {
        if (this.playerMetrics.skillLevel === 'struggling') {
            return 'active'; // Noticeable help
        } else if (this.playerMetrics.skillLevel === 'average' && this.playerMetrics.needsHelp) {
            return 'subtle'; // Minor help
        } else {
            return 'none'; // No help needed
        }
    }

    shouldIncreasePowerUpRate() {
        return this.playerMetrics.skillLevel === 'struggling' || 
               (this.playerMetrics.consecutiveDeaths >= 2 && this.playerMetrics.currentAccuracy < 40);
    }

    shouldDecreasePowerUpRate() {
        return this.playerMetrics.skillLevel === 'skilled' && this.playerMetrics.currentAccuracy > 70;
    }

    // Track ball loss event
    trackBallLoss() {
        this.playerMetrics.ballsLost++;
        this.playerMetrics.consecutiveDeaths++;
        this.playerMetrics.missedBalls++;
        
        debugLogger.ai('Ball loss tracked', {
            totalBallsLost: this.playerMetrics.ballsLost,
            consecutiveDeaths: this.playerMetrics.consecutiveDeaths,
            currentAccuracy: this.playerMetrics.currentAccuracy
        });
    }

    // Track successful brick hit
    trackBrickHit() {
        this.playerMetrics.bricksHit++;
        this.playerMetrics.totalBallBounces++;
        this.playerMetrics.consecutiveDeaths = 0; // Reset on success
        
        debugLogger.ai('Brick hit tracked', {
            totalBricksHit: this.playerMetrics.bricksHit,
            totalBounces: this.playerMetrics.totalBallBounces,
            newAccuracy: Math.round((this.playerMetrics.bricksHit / this.playerMetrics.totalBallBounces) * 100)
        });
    }

    // Track paddle hit
    trackPaddleHit() {
        this.playerMetrics.paddleHits++;
        this.playerMetrics.totalBallBounces++;
    }

    // Reset metrics for new level
    resetForNewLevel() {
        debugLogger.ai('Resetting AI metrics for new level', {
            previousSkillLevel: this.playerMetrics.skillLevel,
            previousAccuracy: this.playerMetrics.currentAccuracy,
            bricksHitLastLevel: this.playerMetrics.bricksHit
        });
        
        // Keep some persistent metrics
        const persistentMetrics = {
            skillLevel: this.playerMetrics.skillLevel,
            recentPerformance: this.playerMetrics.recentPerformance,
            avgReactionTime: this.playerMetrics.avgReactionTime,
            paddleMissDistance: this.playerMetrics.paddleMissDistance
        };
        
        // Reset level-specific metrics
        this.playerMetrics = {
            ballsLost: 0,
            bricksHit: 0,
            totalBallBounces: 0,
            paddleHits: 0,
            missedBalls: 0,
            timeSpentOnLevel: 0,
            consecutiveDeaths: 0,
            currentAccuracy: 0,
            levelStartTime: Date.now(),
            skillLevel: persistentMetrics.skillLevel,
            needsHelp: false,
            recentPerformance: persistentMetrics.recentPerformance,
            avgReactionTime: persistentMetrics.avgReactionTime,
            paddleMissDistance: persistentMetrics.paddleMissDistance
        };
    }

    // Reset all metrics for new game
    resetForNewGame() {
        debugLogger.ai('Resetting AI metrics for new game');
        
        this.playerMetrics = {
            ballsLost: 0,
            bricksHit: 0,
            totalBallBounces: 0,
            paddleHits: 0,
            missedBalls: 0,
            timeSpentOnLevel: 0,
            consecutiveDeaths: 0,
            currentAccuracy: 0,
            levelStartTime: Date.now(),
            skillLevel: 'average',
            needsHelp: false,
            recentPerformance: [],
            avgReactionTime: 0,
            paddleMissDistance: 0
        };
        this.lastUpdate = Date.now();
    }

    // Get performance summary
    getPerformanceSummary() {
        return {
            accuracy: this.playerMetrics.currentAccuracy,
            skillLevel: this.playerMetrics.skillLevel,
            needsHelp: this.playerMetrics.needsHelp,
            assistanceLevel: this.getAssistanceLevel(),
            bricksHit: this.playerMetrics.bricksHit,
            ballsLost: this.playerMetrics.ballsLost,
            timeOnLevel: Math.round(this.playerMetrics.timeSpentOnLevel / 1000),
            consecutiveDeaths: this.playerMetrics.consecutiveDeaths
        };
    }

    // Check if it's time to update analysis
    shouldUpdate() {
        return Date.now() - this.lastUpdate > this.updateInterval;
    }

    // Update timestamp
    markUpdated() {
        this.lastUpdate = Date.now();
    }

    // Get metrics for external access
    getMetrics() {
        return { ...this.playerMetrics };
    }
}
