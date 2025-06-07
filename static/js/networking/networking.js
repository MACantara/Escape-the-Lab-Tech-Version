// Import all modules using ES6 imports
import { ShieldManager } from './shield-manager.js';
import { AttackManager } from './attack-manager.js';
import { WaveManager } from './wave-manager.js';
import { AudioManager } from './audio-manager.js';
import { NetworkingUI } from './networking-ui.js';

class Room1 {
    constructor(game) {
        this.game = game;
        this.networkIntegrity = 100;
        this.attacksBlocked = 0;
        this.wave = 1;
        this.maxWaves = 5;
        this.currentWaveAttacks = 0;
        this.attacksPerWave = 8;
        this.isDefending = false;
        this.shieldPosition = { x: 400, y: 200 };
        this.shieldSize = 60;
        this.shieldStrength = 100;
        this.defenseTimer = null;

        // Initialize managers
        this.shieldManager = new ShieldManager(this);
        this.attackManager = new AttackManager(this);
        this.waveManager = new WaveManager(this);
        this.audioManager = new AudioManager(this);
        this.ui = new NetworkingUI(this);
    }

    async init() {
        const response = await fetch('data/networking.json');
        this.data = await response.json();
        await this.audioManager.loadSounds();
        this.render();
        this.setupDefenseGame();
    }

    render() {
        this.ui.render();
    }

    setupDefenseGame() {
        this.ui.setupDefenseGame();
    }

    startDefense() {
        if (this.isDefending) return;
        
        this.isDefending = true;
        this.audioManager.playSound('defense_start');
        
        // Re-setup shield controls to ensure proper mouse tracking
        this.shieldManager.setupShieldControls();
        
        // Update UI to show defense is active
        this.updateDisplay();
        
        // Start defense timer
        this.defenseTimer = setInterval(() => {
            this.updateDefenseGame();
        }, 50); // 20 FPS
        
        this.showMessage('Defense started! Protect Super Earth from alien attacks!', 'info');
    }

    updateDefenseGame() {
        if (!this.isDefending) return;
        
        // Update shield
        this.shieldManager.updateShieldStrength();
        
        // Spawn attacks based on wave manager
        if (this.waveManager.shouldSpawnAttack()) {
            this.attackManager.spawnAttack();
            this.currentWaveAttacks++;
        }
        
        // Update existing attacks
        this.attackManager.updateAttacks();
        
        // Check wave completion
        this.waveManager.checkWaveCompletion();
        
        // Update display
        this.updateDisplay();
        
        // Check game over conditions
        if (this.networkIntegrity <= 0) {
            this.defenseFailure();
        } else if (this.shieldStrength <= 0) {
            this.shieldDestroyed();
        }
    }

    updateDisplay() {
        this.ui.updateDisplay();
    }

    defenseComplete() {
        clearInterval(this.defenseTimer);
        this.isDefending = false;
        this.attackManager.clearAllAttacks();
        this.audioManager.playSound('defense_complete');
        
        this.ui.renderSuccessScreen();
        
        setTimeout(() => {
            this.game.roomCompleted(`Alien cyber invasion repelled! Super Earth's networks defended with ${Math.round(this.networkIntegrity)}% integrity preserved. ${this.attacksBlocked} attacks successfully blocked.`);
        }, 3000);
    }

    defenseFailure() {
        clearInterval(this.defenseTimer);
        this.isDefending = false;
        this.attackManager.clearAllAttacks();
        this.audioManager.playSound('game_over');
        
        this.game.gameOver('Network defense failed! Alien cyber invasion successful - Super Earth communications compromised.');
    }

    shieldDestroyed() {
        clearInterval(this.defenseTimer);
        this.isDefending = false;
        this.attackManager.clearAllAttacks();
        this.audioManager.playSound('game_over');
        
        this.game.gameOver('Shield destroyed! Defense perimeter breached - Alien forces overwhelming network defenses.');
    }

    emergencyRetreat() {
        this.game.gameOver('Emergency retreat initiated! Super Earth networks abandoned to alien forces - Democracy compromised.');
    }

    playSound(soundType) {
        this.audioManager.playSound(soundType);
    }

    showMessage(message, type) {
        this.ui.showMessage(message, type);
    }

    cleanup() {
        if (this.defenseTimer) {
            clearInterval(this.defenseTimer);
        }
        this.isDefending = false;
        this.attackManager.clearAllAttacks();
    }
}

// Register the class globally
window.Room1 = Room1;

// Also export for potential module use
export { Room1 };
