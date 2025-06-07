import { DefenseGrid } from './defense-grid.js';
import { AttackWaveManager } from './attack-wave-manager.js';
import { DefenseManager } from './defense-manager.js';
import { CyberUI } from './cyber-ui.js';

class Room5 {
    constructor(game) {
        this.game = game;
        this.websiteHealth = 100;
        this.securityBudget = 500;
        this.defenseUnits = [];
        this.attackWaves = [];
        this.currentWave = 1;
        this.maxWaves = 5;
        this.attacksBlocked = 0;
        this.attacksPassed = 0;
        this.isDefending = false;
        this.gameTime = 0;
        this.lastWaveTime = 0;
        
        // Selection and building
        this.selectedDefenseType = null;
        this.placementMode = false;
        this.selectedDefense = null;
        
        // Timers
        this.gameTimer = null;
        this.waveTimer = null;
        
        // Initialize components
        this.defenseGrid = new DefenseGrid(this);
        this.attackWaveManager = new AttackWaveManager(this);
        this.defenseManager = new DefenseManager(this);
        this.ui = new CyberUI(this);
    }

    async init() {
        const response = await fetch('data/cybersecurity.json');
        this.data = await response.json();
        this.render();
        this.defenseGrid.setupGameArea();
    }

    render() {
        this.ui.render();
        this.ui.setupEventListeners();
    }

    startDefense() {
        if (this.isDefending) return;
        
        this.isDefending = true;
        this.sendNextWave();
        
        this.gameTimer = setInterval(() => {
            this.updateGame();
        }, 50);
        
        this.updateDisplay();
    }

    sendNextWave() {
        if (this.currentWave > this.maxWaves) return;
        
        const wave = this.attackWaveManager.generateWave(this.currentWave);
        this.attackWaves.push(...wave);
        
        this.currentWave++;
        this.lastWaveTime = this.gameTime;
        
        this.updateDisplay();
        this.ui.updateThreatPreview();
    }

    updateGame() {
        this.gameTime += 50;
        this.attackWaveManager.updateAttacks(this.gameTime, this.lastWaveTime);
        this.defenseManager.updateDefenses();
        
        if (this.websiteHealth <= 0) {
            this.defenseFailure();
        } else if (this.currentWave > this.maxWaves && this.attackWaves.length === 0) {
            this.defenseSuccess();
        }
    }

    updateDisplay() {
        this.ui.updateDisplay();
    }

    defenseSuccess() {
        clearInterval(this.gameTimer);
        this.isDefending = false;
        this.ui.renderSuccessScreen();
        
        setTimeout(() => {
            this.game.roomCompleted(`Cybersecurity defense successful! Website protected with ${this.websiteHealth}% integrity. ${this.attacksBlocked} attacks blocked through strategic tower defense.`);
        }, 3000);
    }

    defenseFailure() {
        clearInterval(this.gameTimer);
        this.isDefending = false;
        this.game.gameOver('Website compromised! Cyber attacks overwhelmed defenses - Critical data breached and services unavailable.');
    }

    emergencyShutdown() {
        this.game.gameOver('Emergency shutdown initiated! Website taken offline to prevent further damage - All services unavailable.');
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `fixed top-20 right-4 p-3 rounded z-50 animate-pulse`;
        
        switch(type) {
            case 'success':
                messageDiv.classList.add('bg-green-800', 'text-green-200', 'border', 'border-green-500');
                break;
            case 'error':
                messageDiv.classList.add('bg-red-800', 'text-red-200', 'border', 'border-red-500');
                break;
            case 'info':
                messageDiv.classList.add('bg-blue-800', 'text-blue-200', 'border', 'border-blue-500');
                break;
        }
        
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => messageDiv.remove(), 3000);
    }

    cleanup() {
        if (this.gameTimer) clearInterval(this.gameTimer);
        this.isDefending = false;
        this.attackWaves = [];
        this.defenseUnits = [];
    }
}

// Register the class globally for backward compatibility
window.Room5 = Room5;

// Export the class for ES6 module imports
export { Room5 };
export default Room5;
