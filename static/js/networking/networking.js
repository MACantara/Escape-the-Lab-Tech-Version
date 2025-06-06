class Room1 {
    constructor(game) {
        this.game = game;
        this.networkIntegrity = 100;
        this.shieldStrength = 100;
        this.alienBreach = 15; // % breach progress
        this.attacksBlocked = 0;
        this.attacksMissed = 0;
        this.activeAttacks = [];
        this.gameArea = null;
        this.shieldPosition = { x: 400, y: 300 };
        this.shieldSize = 60;
        this.isDefending = false;
        this.lastAttackSpawn = 0;
        this.attackSpawnRate = 2500;
        this.shieldRechargeRate = 1.5;
        this.wave = 1;
        this.maxWaves = 5;
        this.attacksPerWave = 20;
        this.attacksSpawnedThisWave = 0;
        this.attacksProcessedThisWave = 0; // Track attacks blocked/missed this wave
        this.waveCompleted = false;
        this.betweenWaves = false;
        this.waveTimer = 0;
    }

    async init() {
        const response = await fetch('data/networking.json');
        this.data = await response.json();
        this.render();
        this.setupGameArea();
        this.startDefenseGame();
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
                        <p class="text-xs text-yellow-300">${this.getWaveDifficulty()}</p>
                    </div>
                </div>

                <div class="challenge-content bg-gray-700 p-6 rounded-lg">
                    <div class="game-area-container bg-black rounded-lg p-4 mb-4">
                        <h4 class="text-white font-bold mb-3 text-center">⚔️ DEFEND SUPER EARTH</h4>
                        <div id="defense-game" class="relative bg-gray-900 rounded" style="width: 800px; height: 400px; margin: 0 auto; border: 2px solid #4299e1;">
                            <div id="shield" class="absolute bg-blue-500 rounded-full opacity-80 cursor-move" 
                                 style="width: ${this.shieldSize}px; height: ${this.shieldSize}px; left: ${this.shieldPosition.x - this.shieldSize/2}px; top: ${this.shieldPosition.y - this.shieldSize/2}px;">
                            </div>
                            <div class="absolute top-2 left-2 text-white text-sm">
                                Move shield to block alien attacks!
                            </div>
                            <div class="absolute top-2 right-2 text-white text-sm">
                                Wave ${this.wave}: ${this.getWaveDifficulty()}
                            </div>
                            <div class="absolute bottom-2 left-2 text-white text-sm">
                                Progress: <span id="wave-counter">${this.getAttacksThisWave()}/${this.attacksPerWave}</span>
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
            this.toggleDefense();
        });

        document.getElementById('emergency-retreat').addEventListener('click', () => {
            this.emergencyRetreat();
        });
    }

    setupGameArea() {
        this.gameArea = document.getElementById('defense-game');
        const shield = document.getElementById('shield');
        
        // Mouse movement for shield
        this.gameArea.addEventListener('mousemove', (e) => {
            if (!this.isDefending) return;
            
            const rect = this.gameArea.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Keep shield within bounds
            this.shieldPosition.x = Math.max(this.shieldSize/2, Math.min(800 - this.shieldSize/2, x));
            this.shieldPosition.y = Math.max(this.shieldSize/2, Math.min(400 - this.shieldSize/2, y));
            
            shield.style.left = `${this.shieldPosition.x - this.shieldSize/2}px`;
            shield.style.top = `${this.shieldPosition.y - this.shieldSize/2}px`;
        });
    }

    selectShield(shieldName) {
        this.selectedShield = shieldName;
        const selectedShieldData = this.data.shield_types.find(s => s.name === shieldName);
        this.shieldStrength = selectedShieldData.strength;
        this.shieldRechargeRate = selectedShieldData.recharge_rate;
        this.render();
        this.setupGameArea();
    }

    toggleDefense() {
        if (!this.isDefending) {
            this.startDefenseGame();
        }
    }

    startDefenseGame() {
        this.isDefending = true;
        this.lastAttackSpawn = Date.now();
        document.getElementById('start-defense').textContent = 'Defense Active';
        document.getElementById('start-defense').disabled = true;
        
        this.startDefenseTimer();
        this.spawnAttacks();
    }

    startDefenseTimer() {
        this.defenseTimer = setInterval(() => {
            // Recharge shield slowly
            if (this.shieldStrength < 100) {
                this.shieldStrength = Math.min(100, this.shieldStrength + this.shieldRechargeRate / 60);
                this.updateDisplay();
            }
            
            // Update attacks
            this.updateAttacks();
            
            // Check wave completion - when all attacks for the wave are spawned and processed
            if (this.attacksSpawnedThisWave >= this.attacksPerWave && 
                this.attacksProcessedThisWave >= this.attacksPerWave && 
                this.activeAttacks.length === 0 && 
                !this.betweenWaves) {
                this.completeWave();
            }
            
            // Check win/lose conditions
            if (this.wave > this.maxWaves) {
                this.defenseSuccessful();
            } else if (this.alienBreach >= 100 || this.networkIntegrity <= 0) {
                this.defenseFailure();
            }
        }, 1000/60); // 60 FPS for smooth gameplay
    }

    spawnAttacks() {
        if (!this.isDefending || this.betweenWaves) {
            if (this.isDefending && !this.betweenWaves) {
                requestAnimationFrame(() => this.spawnAttacks());
            }
            return;
        }
        
        const now = Date.now();
        
        // Don't spawn more attacks if wave is complete
        if (this.attacksSpawnedThisWave >= this.attacksPerWave) {
            if (this.isDefending) {
                requestAnimationFrame(() => this.spawnAttacks());
            }
            return;
        }
        
        if (now - this.lastAttackSpawn > this.attackSpawnRate) {
            this.createAlienAttack();
            this.lastAttackSpawn = now;
            this.attacksSpawnedThisWave++;
            
            // Increase difficulty with each wave
            const waveMultiplier = 1 + (this.wave - 1) * 0.3;
            this.attackSpawnRate = Math.max(600 / waveMultiplier, 400);
        }
        
        if (this.isDefending) {
            requestAnimationFrame(() => this.spawnAttacks());
        }
    }

    createAlienAttack() {
        const attackTypes = this.data.alien_attack_patterns;
        
        // Increase chance of harder attacks in later waves
        let availableAttacks = attackTypes;
        if (this.wave >= 3) {
            // Add more void pulses and quantum spikes
            availableAttacks = [...attackTypes, ...attackTypes.filter(a => a.damage > 20)];
        }
        if (this.wave >= 5) {
            // Final wave - mostly hard attacks
            availableAttacks = attackTypes.filter(a => a.damage >= 25);
            if (availableAttacks.length === 0) availableAttacks = attackTypes;
        }
        
        const attackType = availableAttacks[Math.floor(Math.random() * availableAttacks.length)];
        
        const attack = {
            id: Date.now() + Math.random(),
            type: attackType,
            x: Math.random() * 800,
            y: -30,
            speed: this.getAttackSpeed(attackType.speed) * (1 + (this.wave - 1) * 0.2), // Faster in later waves
            element: null,
            wave: this.wave
        };
        
        // Create visual element
        const attackElement = document.createElement('div');
        attackElement.className = 'absolute text-2xl';
        attackElement.innerHTML = attackType.icon;
        attackElement.style.left = `${attack.x}px`;
        attackElement.style.top = `${attack.y}px`;
        attackElement.style.zIndex = '10';
        
        // Add glow effect for higher waves
        if (this.wave >= 3) {
            attackElement.style.textShadow = '0 0 10px #ff0000';
        }
        if (this.wave >= 5) {
            attackElement.style.textShadow = '0 0 15px #ff0000, 0 0 25px #ff0000';
        }
        
        attack.element = attackElement;
        this.gameArea.appendChild(attackElement);
        this.activeAttacks.push(attack);
    }

    getAttackSpeed(speedType) {
        switch(speedType) {
            case 'Very Fast': return 8;
            case 'Fast': return 6;
            case 'Medium': return 4;
            case 'Slow': return 2;
            default: return 4;
        }
    }

    updateAttacks() {
        this.activeAttacks.forEach((attack, index) => {
            attack.y += attack.speed;
            attack.element.style.top = `${attack.y}px`;
            
            // Check collision with shield
            const dist = Math.sqrt(
                Math.pow(attack.x - this.shieldPosition.x, 2) + 
                Math.pow(attack.y - this.shieldPosition.y, 2)
            );
            
            if (dist < this.shieldSize/2 + 15) { // Hit shield
                this.handleShieldHit(attack, index);
            } else if (attack.y > 400) { // Missed shield, hit network
                this.handleNetworkHit(attack, index);
            }
        });
    }

    handleShieldHit(attack, index) {
        // Remove attack
        attack.element.remove();
        this.activeAttacks.splice(index, 1);
        
        // Damage shield based on attack strength and wave
        const damage = attack.type.damage / 3;
        this.shieldStrength = Math.max(0, this.shieldStrength - damage);
        this.attacksBlocked++;
        this.attacksProcessedThisWave++;
        
        // Visual feedback
        this.showBlockEffect();
        this.updateDisplay();
    }

    handleNetworkHit(attack, index) {
        // Remove attack
        attack.element.remove();
        this.activeAttacks.splice(index, 1);
        
        // Damage network - more damage in later waves
        const waveDamageMultiplier = 1 + (this.wave - 1) * 0.2;
        const damage = attack.type.damage * waveDamageMultiplier;
        
        this.networkIntegrity = Math.max(0, this.networkIntegrity - damage);
        this.alienBreach = Math.min(100, this.alienBreach + (damage / 2));
        this.attacksMissed++;
        this.attacksProcessedThisWave++;
        
        // Visual feedback
        this.showHitEffect();
        this.updateDisplay();
    }

    showBlockEffect() {
        const shield = document.getElementById('shield');
        if (shield) {
            const originalColor = shield.style.backgroundColor;
            shield.style.backgroundColor = '#00ff00';
            shield.style.boxShadow = '0 0 20px #00ff00';
            setTimeout(() => {
                shield.style.backgroundColor = originalColor || '#4299e1';
                shield.style.boxShadow = '';
            }, 200);
        }
    }

    showHitEffect() {
        if (this.gameArea) {
            const originalBackground = this.gameArea.style.backgroundColor;
            this.gameArea.style.backgroundColor = '#ff0000';
            this.gameArea.style.boxShadow = 'inset 0 0 30px #ff0000';
            setTimeout(() => {
                this.gameArea.style.backgroundColor = originalBackground || '#1a202c';
                this.gameArea.style.boxShadow = '';
            }, 200);
        }
    }

    completeWave() {
        this.betweenWaves = true;
        this.waveTimer = 5; // 5 second break between waves
        
        // Clear any remaining attacks
        this.activeAttacks.forEach(attack => attack.element.remove());
        this.activeAttacks = [];
        
        // Show wave completion message
        this.showWaveComplete();
        
        // Start next wave after timer
        const waveBreakInterval = setInterval(() => {
            this.waveTimer--;
            this.updateWaveTimer();
            
            if (this.waveTimer <= 0) {
                clearInterval(waveBreakInterval);
                this.startNextWave();
            }
        }, 1000);
    }

    startNextWave() {
        this.wave++;
        this.betweenWaves = false;
        this.attacksSpawnedThisWave = 0;
        this.attacksProcessedThisWave = 0; // Reset processed counter
        
        // Partially restore shield between waves
        this.shieldStrength = Math.min(100, this.shieldStrength + 30);
        
        // Update UI
        this.updateDisplay();
        this.hideWaveComplete();
        
        // Re-render to update wave info
        this.render();
        this.setupGameArea();
        
        // Restart the attack spawning for the new wave
        this.lastAttackSpawn = Date.now();
        if (this.isDefending) {
            this.spawnAttacks(); // Restart the spawning loop
        }
    }

    showWaveComplete() {
        const waveMsg = document.createElement('div');
        waveMsg.id = 'wave-complete';
        waveMsg.className = 'absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-20';
        
        const attacksBlockedThisWave = Math.max(0, this.attacksPerWave - (this.attacksMissed - ((this.wave - 1) * this.attacksPerWave)));
        
        waveMsg.innerHTML = `
            <div class="text-center">
                <i class="bi bi-shield-check text-6xl text-green-400 mb-4 animate-bounce"></i>
                <h3 class="text-3xl font-bold text-green-400 mb-2">WAVE ${this.wave} COMPLETE!</h3>
                <p class="text-gray-300 mb-4">Alien assault wave repelled!</p>
                <p class="text-blue-400">Shield recharging... Next wave in <span id="wave-countdown">${this.waveTimer}</span>s</p>
                <div class="mt-4">
                    <p class="text-yellow-400">${this.wave < this.maxWaves ? `Wave ${this.wave + 1} incoming - Increased difficulty!` : 'Final wave completed!'}</p>
                    <p class="text-gray-300 text-sm">Attacks blocked this wave: ${attacksBlockedThisWave}/${this.attacksPerWave}</p>
                </div>
            </div>
        `;
        
        this.gameArea.appendChild(waveMsg);
    }

    updateWaveTimer() {
        const countdown = document.getElementById('wave-countdown');
        if (countdown) {
            countdown.textContent = this.waveTimer;
        }
    }

    hideWaveComplete() {
        const waveMsg = document.getElementById('wave-complete');
        if (waveMsg) {
            waveMsg.remove();
        }
    }

    getAttacksThisWave() {
        return this.attacksProcessedThisWave;
    }

    getWaveDifficulty() {
        const difficulties = ['ROOKIE', 'STANDARD', 'VETERAN', 'EXPERT', 'LEGENDARY'];
        return difficulties[this.wave - 1] || 'EXTREME';
    }

    getSuccessRate() {
        if (this.attacksBlocked + this.attacksMissed === 0) return 100;
        return Math.round((this.attacksBlocked / (this.attacksBlocked + this.attacksMissed)) * 100);
    }

    updateDisplay() {
        const networkDisplay = document.getElementById('network-integrity');
        const blockedDisplay = document.getElementById('attacks-blocked');
        const waveDisplay = document.getElementById('wave-progress');
        const waveCounter = document.getElementById('wave-counter');
        const shieldCounter = document.getElementById('shield-counter');
        
        if (networkDisplay) networkDisplay.textContent = `${Math.round(this.networkIntegrity)}%`;
        if (blockedDisplay) blockedDisplay.textContent = `${this.attacksBlocked}`;
        if (waveDisplay) waveDisplay.textContent = `${this.wave}/${this.maxWaves}`;
        if (waveCounter) waveCounter.textContent = `${this.getAttacksThisWave()}/${this.attacksPerWave}`;
        if (shieldCounter) shieldCounter.textContent = `${Math.round(this.shieldStrength)}%`;
    }

    getSectorStatusColor(status) {
        switch(status) {
            case 'secure': return 'bg-green-800';
            case 'defending': return 'bg-blue-800';
            case 'under_attack': return 'bg-orange-800';
            case 'compromised': return 'bg-red-800';
            default: return 'bg-gray-800';
        }
    }

    defenseSuccessful() {
        clearInterval(this.defenseTimer);
        this.isDefending = false;
        
        // Clear all attacks
        this.activeAttacks.forEach(attack => attack.element.remove());
        this.activeAttacks = [];
        
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="defense-successful text-center p-8">
                <i class="bi bi-shield-check text-8xl text-green-400 mb-4 animate-bounce"></i>
                <h2 class="text-3xl font-bold text-green-400 mb-4">SUPER EARTH DEFENDED!</h2>
                
                <div class="final-stats grid grid-cols-3 gap-4 mb-6">
                    <div class="bg-green-800 p-3 rounded">
                        <p class="text-green-200">Attacks Blocked</p>
                        <p class="text-xl font-bold text-green-400">${this.attacksBlocked}</p>
                        <p class="text-xs text-green-300">✓ Threats Neutralized</p>
                    </div>
                    <div class="bg-blue-800 p-3 rounded">
                        <p class="text-blue-200">Waves Survived</p>
                        <p class="text-xl font-bold text-blue-400">${this.maxWaves}/${this.maxWaves}</p>
                        <p class="text-xs text-blue-300">✓ Mission Complete</p>
                    </div>
                    <div class="bg-yellow-800 p-3 rounded">
                        <p class="text-yellow-200">Defense Rating</p>
                        <p class="text-xl font-bold text-yellow-400">${this.calculateDefenseRating()}</p>
                        <p class="text-xs text-yellow-300">✓ Performance</p>
                    </div>
                </div>
                
                <div class="victory-report bg-gray-800 p-4 rounded mb-4">
                    <h4 class="font-bold text-gray-200 mb-2">👽 Alien Invasion Repelled</h4>
                    <div class="text-left text-sm text-gray-300">
                        <p>✅ ${this.maxWaves} alien assault waves defeated</p>
                        <p>✅ Super Earth's networks secured</p>
                        <p>✅ ${this.attacksBlocked} alien attacks neutralized</p>
                        <p>✅ ${this.getSuccessRate()}% mission accuracy</p>
                        <p>✅ Democracy preserved across the galaxy</p>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            this.game.roomCompleted(`Alien cyber invasion repelled! Super Earth defended through ${this.maxWaves} waves. ${this.attacksBlocked} threats neutralized with ${this.calculateDefenseRating()} rating.`);
        }, 3000);
    }

    calculateDefenseRating() {
        const accuracy = this.getSuccessRate() / 100;
        const waveBonus = this.maxWaves / 5; // Bonus for completing all waves
        const totalScore = accuracy * waveBonus;
        
        if (totalScore >= 0.9) return 'S-Class Hero';
        if (totalScore >= 0.75) return 'A-Class Elite';
        if (totalScore >= 0.6) return 'B-Class Veteran';
        if (totalScore >= 0.4) return 'C-Class Defender';
        return 'D-Class Recruit';
    }

    defenseFailure() {
        clearInterval(this.defenseTimer);
        this.isDefending = false;
        this.game.gameOver('Super Earth networks compromised! Alien forces have breached planetary defenses - Democratic order collapsing across all sectors.');
    }

    emergencyRetreat() {
        this.game.gameOver('Emergency retreat authorized! Super Earth defense forces withdrawn - Planet surrendered to alien occupation.');
    }
}

// Register the class globally
window.Room1 = Room1;
