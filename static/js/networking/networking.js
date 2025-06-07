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
                            <!-- Game elements will be added by setupDefenseGame -->
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
        if (!gameArea) {
            console.error('Defense game area not found');
            return;
        }
        
        // Clear any existing content
        gameArea.innerHTML = '';
        
        // Add Super Earth visual at bottom center
        const superEarth = document.createElement('div');
        superEarth.id = 'super-earth';
        superEarth.className = 'absolute flex items-center justify-center z-5';
        superEarth.style.width = '80px';
        superEarth.style.height = '80px';
        superEarth.style.left = `${(800 - 80) / 2}px`; // Center horizontally (gameArea width - earth width) / 2
        superEarth.style.bottom = '10px'; // Position at bottom
        superEarth.style.borderRadius = '50%';
        superEarth.style.background = 'linear-gradient(45deg, #2563eb, #1d4ed8, #1e40af)';
        superEarth.style.border = '3px solid #60a5fa';
        superEarth.style.boxShadow = '0 0 20px rgba(96, 165, 250, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)';
        superEarth.style.fontSize = '32px';
        superEarth.innerHTML = '🌍';
        
        // Add pulsing glow effect based on network integrity
        superEarth.style.animation = 'pulse 2s infinite';
        
        gameArea.appendChild(superEarth);
        
        // Add game instructions and info overlays
        const instructions = document.createElement('div');
        instructions.className = 'absolute top-2 left-2 text-white text-sm z-20 pointer-events-none';
        instructions.textContent = 'Move shield to block alien attacks!';
        gameArea.appendChild(instructions);
        
        const waveInfo = document.createElement('div');
        waveInfo.className = 'absolute top-2 right-2 text-white text-sm z-20 pointer-events-none';
        waveInfo.textContent = `Wave ${this.wave}: ${this.waveManager.getWaveDifficulty()}`;
        gameArea.appendChild(waveInfo);
        
        const progressInfo = document.createElement('div');
        progressInfo.className = 'absolute bottom-2 left-2 text-white text-sm z-20 pointer-events-none';
        progressInfo.innerHTML = `Progress: <span id="wave-counter">${this.waveManager.getAttacksThisWave()}/${this.attacksPerWave}</span>`;
        gameArea.appendChild(progressInfo);
        
        const shieldInfo = document.createElement('div');
        shieldInfo.className = 'absolute bottom-2 right-2 text-white text-sm z-20 pointer-events-none';
        shieldInfo.innerHTML = `Shield: <span id="shield-counter">${Math.round(this.shieldStrength)}%</span>`;
        gameArea.appendChild(shieldInfo);
        
        // Create and add shield
        const shield = this.shieldManager.createShieldElement();
        gameArea.appendChild(shield);
        
        // Setup shield controls
        this.shieldManager.setupShieldControls();
        
        console.log('Defense game setup complete with shield and Super Earth');
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
        
        this.showMessage('Defense started! Move your mouse to control the shield.', 'info');
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
        
        // Update Super Earth visual based on network integrity
        this.updateSuperEarthVisual();
        
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

    updateSuperEarthVisual() {
        const superEarth = document.getElementById('super-earth');
        if (superEarth) {
            const integrityRatio = this.networkIntegrity / 100;
            
            // Change appearance based on network integrity
            if (integrityRatio > 0.7) {
                // Healthy - Blue and glowing
                superEarth.style.background = 'linear-gradient(45deg, #2563eb, #1d4ed8, #1e40af)';
                superEarth.style.border = '3px solid #60a5fa';
                superEarth.style.boxShadow = '0 0 20px rgba(96, 165, 250, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.2)';
                superEarth.style.animation = 'pulse 2s infinite';
            } else if (integrityRatio > 0.4) {
                // Degraded - Orange/Yellow warning
                superEarth.style.background = 'linear-gradient(45deg, #f59e0b, #d97706, #b45309)';
                superEarth.style.border = '3px solid #fbbf24';
                superEarth.style.boxShadow = '0 0 20px rgba(251, 191, 36, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.1)';
                superEarth.style.animation = 'pulse 1s infinite';
            } else {
                // Critical - Red and flashing
                superEarth.style.background = 'linear-gradient(45deg, #dc2626, #b91c1c, #991b1b)';
                superEarth.style.border = '3px solid #f87171';
                superEarth.style.boxShadow = '0 0 25px rgba(248, 113, 113, 1), inset 0 0 20px rgba(255, 255, 255, 0.1)';
                superEarth.style.animation = 'pulse 0.5s infinite';
            }
            
            // Add screen shake effect when critically damaged
            if (integrityRatio < 0.3) {
                superEarth.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
                setTimeout(() => {
                    superEarth.style.transform = 'translate(0, 0)';
                }, 100);
            }
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

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `fixed top-20 right-4 p-3 rounded z-50 animate-pulse max-w-sm`;
        
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
}

// Register the class globally
window.Room1 = Room1;

// Also export for potential module use
export { Room1 };
