// Import all modules using ES6 imports
import { ShieldManager } from './shield-manager.js';
import { AttackManager } from './attack-manager.js';
import { WaveManager } from './wave-manager.js';
import { AudioManager } from './audio-manager.js';

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
    }

    async init() {
        const response = await fetch('data/networking.json');
        this.data = await response.json();
        await this.audioManager.loadSounds();
        this.render();
        this.setupDefenseGame();
    }

    render() {
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="room-container p-6 fade-in">
                <div class="text-center mb-6">
                    <i class="bi bi-alien text-6xl text-red-500 animate-pulse"></i>
                    <h2 class="text-3xl font-bold mt-4 text-red-400">ALIEN CYBER INVASION</h2>
                    <p class="text-gray-300 mt-2">Defend Super Earth's networks with your shield!</p>
                </div>
                
                <div class="defense-status grid grid-cols-3 gap-4 mb-6">
                    <div class="status-card bg-green-900 p-4 rounded text-center">
                        <i class="bi bi-globe text-green-400 text-2xl"></i>
                        <p class="text-sm text-green-200">Network Integrity</p>
                        <p id="network-integrity" class="text-2xl font-bold text-green-100">${Math.round(this.networkIntegrity)}%</p>
                        <p class="text-xs ${this.networkIntegrity > 70 ? 'text-green-400' : 'text-red-400'}">
                            ${this.networkIntegrity > 70 ? 'STABLE' : 'CRITICAL'}
                        </p>
                    </div>
                    <div class="status-card bg-purple-900 p-4 rounded text-center">
                        <i class="bi bi-trophy text-purple-400 text-2xl"></i>
                        <p class="text-sm text-purple-200">Attacks Blocked</p>
                        <p id="attacks-blocked" class="text-2xl font-bold text-purple-100">${this.attacksBlocked}</p>
                        <p class="text-xs text-purple-300">Defense Score</p>
                    </div>
                    <div class="status-card bg-yellow-900 p-4 rounded text-center">
                        <i class="bi bi-layers text-yellow-400 text-2xl"></i>
                        <p class="text-sm text-yellow-200">Current Wave</p>
                        <p id="wave-progress" class="text-2xl font-bold text-yellow-100">${this.wave}/${this.maxWaves}</p>
                        <p class="text-xs text-yellow-300">${this.waveManager.getWaveDifficulty()}</p>
                    </div>
                </div>

                <div class="challenge-content bg-gray-700 p-6 rounded-lg">
                    <div class="game-area-container bg-black rounded-lg p-4 mb-4">
                        <h4 class="text-white font-bold mb-3 text-center">⚔️ DEFEND SUPER EARTH</h4>
                        <div id="defense-game" class="relative bg-gray-900 rounded" style="width: 800px; height: 400px; margin: 0 auto; border: 2px solid #4299e1;">
                            <div class="absolute top-2 left-2 text-white text-sm">
                                Move shield to block alien attacks!
                            </div>
                            <div class="absolute top-2 right-2 text-white text-sm">
                                Wave ${this.wave}: ${this.waveManager.getWaveDifficulty()}
                            </div>
                            <div class="absolute bottom-2 left-2 text-white text-sm">
                                Progress: <span id="wave-counter">${this.waveManager.getAttacksThisWave()}/${this.attacksPerWave}</span>
                            </div>
                            <div class="absolute bottom-2 right-2 text-white text-sm">
                                Shield: <span id="shield-counter">${Math.round(this.shieldStrength)}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="control-buttons text-center mb-4">
                        <button id="start-defense" class="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg text-lg transition-colors mr-4">
                            <i class="bi bi-play-fill"></i> ${this.isDefending ? 'Defense Active' : 'Start Defense'}
                        </button>
                        <button id="emergency-retreat" class="bg-red-600 hover:bg-red-500 px-8 py-3 rounded-lg text-lg transition-colors">
                            <i class="bi bi-flag"></i> Emergency Retreat
                        </button>
                    </div>
                    
                    <div class="instructions text-center text-sm text-gray-400">
                        <p class="mb-2">🎯 Survive ${this.maxWaves} waves of alien attacks to secure Super Earth's networks</p>
                        <p>🛡️ Use mouse to move shield and block incoming attacks</p>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('start-defense').addEventListener('click', () => {
            this.startDefense();
        });

        document.getElementById('emergency-retreat').addEventListener('click', () => {
            this.emergencyRetreat();
        });
    }

    setupDefenseGame() {
        const gameArea = document.getElementById('defense-game');
        
        // Create and add shield
        const shield = this.shieldManager.createShieldElement();
        gameArea.appendChild(shield);
        
        // Setup shield controls
        this.shieldManager.setupShieldControls();
    }

    startDefense() {
        if (this.isDefending) return;
        
        this.isDefending = true;
        this.audioManager.playSound('defense_start');
        this.render(); // Update button text
        
        // Start defense timer
        this.defenseTimer = setInterval(() => {
            this.updateDefenseGame();
        }, 50); // 20 FPS
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
        // Update network integrity
        const integrityDisplay = document.getElementById('network-integrity');
        if (integrityDisplay) {
            integrityDisplay.textContent = `${Math.round(this.networkIntegrity)}%`;
            
            // Update status color and text
            const statusCard = integrityDisplay.closest('.status-card');
            const statusText = statusCard.querySelector('.text-xs');
            
            if (this.networkIntegrity > 70) {
                statusText.textContent = 'STABLE';
                statusText.className = 'text-xs text-green-400';
            } else if (this.networkIntegrity > 30) {
                statusText.textContent = 'DEGRADED';
                statusText.className = 'text-xs text-yellow-400';
            } else {
                statusText.textContent = 'CRITICAL';
                statusText.className = 'text-xs text-red-400';
            }
        }
        
        // Update attacks blocked
        const blockedDisplay = document.getElementById('attacks-blocked');
        if (blockedDisplay) {
            blockedDisplay.textContent = this.attacksBlocked;
        }
        
        // Update wave progress
        const waveDisplay = document.getElementById('wave-progress');
        if (waveDisplay) {
            waveDisplay.textContent = `${this.wave}/${this.maxWaves}`;
        }
        
        // Update wave counter
        const counterDisplay = document.getElementById('wave-counter');
        if (counterDisplay) {
            counterDisplay.textContent = `${this.waveManager.getAttacksThisWave()}/${this.attacksPerWave}`;
        }
        
        // Update shield counter
        const shieldDisplay = document.getElementById('shield-counter');
        if (shieldDisplay) {
            shieldDisplay.textContent = `${Math.round(this.shieldStrength)}%`;
        }
        
        // Update wave difficulty display
        const waveInfo = document.querySelector('.text-yellow-300');
        if (waveInfo) {
            waveInfo.textContent = this.waveManager.getWaveDifficulty();
        }
    }

    defenseComplete() {
        clearInterval(this.defenseTimer);
        this.isDefending = false;
        this.attackManager.clearAllAttacks();
        this.audioManager.playSound('defense_complete');
        
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="defense-success text-center p-8">
                <i class="bi bi-shield-check text-8xl text-green-400 mb-4 animate-bounce"></i>
                <h2 class="text-3xl font-bold text-green-400 mb-4">SUPER EARTH DEFENDED!</h2>
                
                <div class="final-stats grid grid-cols-3 gap-4 mb-6">
                    <div class="bg-green-800 p-4 rounded">
                        <p class="text-green-200">Network Integrity</p>
                        <p class="text-2xl font-bold text-green-400">${Math.round(this.networkIntegrity)}%</p>
                        <p class="text-xs text-green-300">✓ Protected</p>
                    </div>
                    <div class="bg-purple-800 p-4 rounded">
                        <p class="text-purple-200">Attacks Blocked</p>
                        <p class="text-2xl font-bold text-purple-400">${this.attacksBlocked}</p>
                        <p class="text-xs text-purple-300">✓ Defensive Excellence</p>
                    </div>
                    <div class="bg-blue-800 p-4 rounded">
                        <p class="text-blue-200">Waves Survived</p>
                        <p class="text-2xl font-bold text-blue-400">${this.maxWaves}</p>
                        <p class="text-xs text-blue-300">✓ Full Defense</p>
                    </div>
                </div>
                
                <div class="victory-report bg-gray-800 p-4 rounded mb-4">
                    <h4 class="font-bold text-gray-200 mb-2">🌍 Defense Report</h4>
                    <div class="text-left text-sm text-gray-300">
                        <p>✅ Alien cyber invasion successfully repelled</p>
                        <p>✅ Super Earth communication networks secured</p>
                        <p>✅ All ${this.maxWaves} invasion waves neutralized</p>
                        <p>✅ Network integrity maintained at ${Math.round(this.networkIntegrity)}%</p>
                        <p>✅ Planetary defense grid operational</p>
                        <p>✅ Democracy and freedom preserved</p>
                    </div>
                </div>
            </div>
        `;
        
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
