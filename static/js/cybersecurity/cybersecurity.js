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
        
        // Game area
        this.gameArea = null;
        this.cellSize = 40;
        this.gridWidth = 16;
        this.gridHeight = 10;
        this.path = this.generateAttackPath();
        
        // Selection and building
        this.selectedDefenseType = null;
        this.placementMode = false;
        this.selectedDefense = null;
        
        // Timers
        this.gameTimer = null;
        this.waveTimer = null;
    }

    async init() {
        const response = await fetch('data/cybersecurity.json');
        this.data = await response.json();
        this.render();
        this.setupGameArea();
    }

    generateAttackPath() {
        // Generate a path from left edge to right edge for attacks to follow
        return [
            {x: 0, y: 4}, {x: 1, y: 4}, {x: 2, y: 4}, {x: 3, y: 4}, 
            {x: 4, y: 4}, {x: 5, y: 3}, {x: 6, y: 2}, {x: 7, y: 2}, 
            {x: 8, y: 2}, {x: 9, y: 3}, {x: 10, y: 4}, {x: 11, y: 5}, 
            {x: 12, y: 6}, {x: 13, y: 6}, {x: 14, y: 6}, {x: 15, y: 6}
        ];
    }

    render() {
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="room-container p-6 fade-in">
                <div class="text-center mb-6">
                    <i class="bi bi-shield-exclamation text-6xl text-red-500 animate-pulse"></i>
                    <h2 class="text-3xl font-bold mt-4 text-red-400">CYBER TOWER DEFENSE</h2>
                    <p class="text-gray-300 mt-2">Defend your website from waves of cyber attacks!</p>
                </div>
                
                <div class="defense-status grid grid-cols-5 gap-3 mb-4">
                    <div class="status-card bg-green-900 p-3 rounded text-center">
                        <i class="bi bi-heart text-green-400 text-xl"></i>
                        <p class="text-xs text-green-200">Website Health</p>
                        <p id="website-health" class="text-lg font-bold text-green-100">${this.websiteHealth}%</p>
                    </div>
                    <div class="status-card bg-yellow-900 p-3 rounded text-center">
                        <i class="bi bi-currency-dollar text-yellow-400 text-xl"></i>
                        <p class="text-xs text-yellow-200">Security Budget</p>
                        <p id="security-budget" class="text-lg font-bold text-yellow-100">$${this.securityBudget}</p>
                    </div>
                    <div class="status-card bg-blue-900 p-3 rounded text-center">
                        <i class="bi bi-layers text-blue-400 text-xl"></i>
                        <p class="text-xs text-blue-200">Current Wave</p>
                        <p id="wave-display" class="text-lg font-bold text-blue-100">${this.currentWave}/${this.maxWaves}</p>
                    </div>
                    <div class="status-card bg-purple-900 p-3 rounded text-center">
                        <i class="bi bi-shield-check text-purple-400 text-xl"></i>
                        <p class="text-xs text-purple-200">Attacks Blocked</p>
                        <p id="attacks-blocked" class="text-lg font-bold text-purple-100">${this.attacksBlocked}</p>
                    </div>
                    <div class="status-card bg-red-900 p-3 rounded text-center">
                        <i class="bi bi-exclamation-triangle text-red-400 text-xl"></i>
                        <p class="text-xs text-red-200">Breaches</p>
                        <p id="attacks-passed" class="text-lg font-bold text-red-100">${this.attacksPassed}</p>
                    </div>
                </div>

                <div class="game-container bg-gray-800 rounded-lg p-4 mb-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-white">🛡️ Cyber Defense Grid</h3>
                        <div class="wave-info">
                            <span class="text-gray-300">Next Wave: </span>
                            <span id="next-wave-timer" class="font-bold text-orange-400">Ready</span>
                        </div>
                    </div>
                    
                    <div id="defense-canvas" class="bg-black rounded border-2 border-gray-600 relative overflow-hidden" 
                         style="width: 640px; height: 400px; margin: 0 auto;">
                        <!-- Defense grid will be rendered here -->
                        <div class="absolute top-2 left-2 text-white text-sm">
                            <div>Click defenses below, then click grid to place | Click placed defenses to upgrade</div>
                        </div>
                        <div class="absolute top-2 right-2 text-white text-sm">
                            <div id="placement-mode" class="font-bold">Mode: SELECT DEFENSE</div>
                        </div>
                    </div>
                </div>

                <div class="controls-panel grid grid-cols-2 gap-4">
                    <div class="defense-shop bg-gray-700 p-4 rounded">
                        <h4 class="font-bold text-white mb-3">🏪 Security Defense Shop</h4>
                        <div class="grid grid-cols-1 gap-2">
                            ${this.data.defense_types.map(defense => `
                                <button class="defense-item p-2 rounded border transition-colors ${this.securityBudget >= defense.cost ? 'border-gray-500 hover:border-gray-300 bg-gray-600' : 'border-red-500 bg-red-900 opacity-50'} ${this.selectedDefenseType === defense.id ? 'border-blue-400 bg-blue-700' : ''}"
                                        data-defense-type="${defense.id}" ${this.securityBudget < defense.cost ? 'disabled' : ''}>
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center">
                                            <span class="text-2xl mr-2">${defense.icon}</span>
                                            <div class="text-left">
                                                <div class="font-bold text-sm">${defense.name}</div>
                                                <div class="text-xs text-gray-300">Damage: ${defense.damage} | Range: ${defense.range}</div>
                                                <div class="text-xs text-gray-400">${defense.description}</div>
                                            </div>
                                        </div>
                                        <div class="text-yellow-400 font-bold">$${defense.cost}</div>
                                    </div>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="control-center bg-gray-700 p-4 rounded">
                        <h4 class="font-bold text-white mb-3">🎛️ Command Center</h4>
                        <div class="space-y-2">
                            <button id="start-defense" class="w-full p-2 rounded transition-colors ${this.isDefending ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-500'}">
                                <i class="bi bi-play-fill"></i> ${this.isDefending ? 'Defense Active' : 'Start Defense'}
                            </button>
                            <button id="send-next-wave" class="w-full p-2 rounded bg-orange-600 hover:bg-orange-500 transition-colors">
                                <i class="bi bi-forward"></i> Send Next Wave
                            </button>
                            <button id="sell-defense" class="w-full p-2 rounded bg-yellow-600 hover:bg-yellow-500 transition-colors">
                                <i class="bi bi-currency-exchange"></i> Sell Selected Defense
                            </button>
                            <button id="emergency-shutdown" class="w-full p-2 rounded bg-red-600 hover:bg-red-500 transition-colors">
                                <i class="bi bi-power"></i> Emergency Shutdown
                            </button>
                        </div>
                        
                        <div class="selected-info mt-4 p-3 bg-gray-800 rounded">
                            <h5 class="font-bold text-blue-400 mb-2">🎯 Selection Info</h5>
                            <div id="selection-details" class="text-sm text-gray-300">
                                <div>No defense selected</div>
                                <div class="text-gray-500">Click a placed defense to upgrade</div>
                            </div>
                        </div>
                        
                        <div class="wave-info mt-4 p-3 bg-gray-800 rounded">
                            <h5 class="font-bold text-red-400 mb-2">⚠️ Incoming Threats</h5>
                            <div class="text-sm text-gray-300" id="threat-preview">
                                <div>Wave ${this.currentWave}: ${this.getWaveDifficulty()}</div>
                                <div class="text-gray-500">Click "Send Next Wave" when ready</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Defense shop items
        document.querySelectorAll('.defense-item').forEach(item => {
            item.addEventListener('click', () => {
                if (!item.disabled) {
                    this.selectDefenseType(item.dataset.defenseType);
                }
            });
        });

        // Control buttons
        document.getElementById('start-defense')?.addEventListener('click', () => {
            this.startDefense();
        });

        document.getElementById('send-next-wave')?.addEventListener('click', () => {
            this.sendNextWave();
        });

        document.getElementById('sell-defense')?.addEventListener('click', () => {
            this.sellSelectedDefense();
        });

        document.getElementById('emergency-shutdown')?.addEventListener('click', () => {
            this.emergencyShutdown();
        });
    }

    setupGameArea() {
        this.gameArea = document.getElementById('defense-canvas');
        
        // Create grid
        this.createGrid();
        
        // Draw attack path
        this.drawAttackPath();
        
        // Setup canvas event listeners
        this.gameArea.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });
    }

    createGrid() {
        // Create visual grid
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell absolute border border-gray-700';
                cell.style.left = `${x * this.cellSize}px`;
                cell.style.top = `${y * this.cellSize}px`;
                cell.style.width = `${this.cellSize}px`;
                cell.style.height = `${this.cellSize}px`;
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // Check if this cell is on the attack path
                const isOnPath = this.path.some(p => p.x === x && p.y === y);
                if (isOnPath) {
                    cell.classList.add('bg-red-900', 'opacity-30');
                } else {
                    cell.classList.add('hover:bg-gray-700', 'cursor-pointer');
                }
                
                this.gameArea.appendChild(cell);
            }
        }
    }

    drawAttackPath() {
        // Draw the path that attacks will follow
        this.path.forEach((point, index) => {
            const pathMarker = document.createElement('div');
            pathMarker.className = 'absolute bg-red-600 opacity-50 pointer-events-none';
            pathMarker.style.left = `${point.x * this.cellSize + 2}px`;
            pathMarker.style.top = `${point.y * this.cellSize + 2}px`;
            pathMarker.style.width = `${this.cellSize - 4}px`;
            pathMarker.style.height = `${this.cellSize - 4}px`;
            pathMarker.style.border = '2px solid #dc2626';
            
            if (index === 0) {
                pathMarker.innerHTML = '<div class="text-white text-xs text-center">START</div>';
            } else if (index === this.path.length - 1) {
                pathMarker.innerHTML = '<div class="text-white text-xs text-center">SITE</div>';
            }
            
            this.gameArea.appendChild(pathMarker);
        });
    }

    selectDefenseType(defenseId) {
        this.selectedDefenseType = defenseId;
        this.placementMode = true;
        this.selectedDefense = null;
        
        // Update UI
        document.querySelectorAll('.defense-item').forEach(item => {
            item.classList.remove('border-blue-400', 'bg-blue-700');
            if (item.dataset.defenseType === defenseId) {
                item.classList.add('border-blue-400', 'bg-blue-700');
            }
        });
        
        document.getElementById('placement-mode').textContent = 'Mode: PLACE DEFENSE';
        this.updateSelectionInfo();
    }

    handleCanvasClick(e) {
        const rect = this.gameArea.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.cellSize);
        const y = Math.floor((e.clientY - rect.top) / this.cellSize);
        
        if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) return;
        
        // Check if clicking on existing defense
        const existingDefense = this.defenseUnits.find(d => d.x === x && d.y === y);
        
        if (existingDefense) {
            this.selectDefense(existingDefense);
        } else if (this.placementMode && this.selectedDefenseType) {
            this.placeDefense(x, y);
        }
    }

    placeDefense(x, y) {
        // Check if position is valid (not on path)
        const isOnPath = this.path.some(p => p.x === x && p.y === y);
        if (isOnPath) {
            this.showMessage('Cannot place defense on attack path!', 'error');
            return;
        }
        
        // Check if position is occupied
        const isOccupied = this.defenseUnits.some(d => d.x === x && d.y === y);
        if (isOccupied) {
            this.showMessage('Position already occupied!', 'error');
            return;
        }
        
        const defenseType = this.data.defense_types.find(d => d.id === this.selectedDefenseType);
        
        // Check budget
        if (this.securityBudget < defenseType.cost) {
            this.showMessage('Insufficient budget!', 'error');
            return;
        }
        
        // Create defense unit
        const defense = {
            id: Date.now(),
            type: defenseType.id,
            x: x,
            y: y,
            level: 1,
            damage: defenseType.damage,
            range: defenseType.range,
            cost: defenseType.cost,
            killCount: 0,
            lastShot: 0
        };
        
        this.defenseUnits.push(defense);
        this.securityBudget -= defenseType.cost;
        
        // Create visual element
        this.createDefenseElement(defense, defenseType);
        
        // Reset placement mode
        this.placementMode = false;
        this.selectedDefenseType = null;
        document.getElementById('placement-mode').textContent = 'Mode: SELECT DEFENSE';
        
        // Update UI
        document.querySelectorAll('.defense-item').forEach(item => {
            item.classList.remove('border-blue-400', 'bg-blue-700');
        });
        
        this.updateDisplay();
        this.updateSelectionInfo();
    }

    createDefenseElement(defense, defenseType) {
        const element = document.createElement('div');
        element.className = 'defense-unit absolute cursor-pointer transition-transform hover:scale-110';
        element.style.left = `${defense.x * this.cellSize + 2}px`;
        element.style.top = `${defense.y * this.cellSize + 2}px`;
        element.style.width = `${this.cellSize - 4}px`;
        element.style.height = `${this.cellSize - 4}px`;
        element.style.backgroundColor = defenseType.color || '#3b82f6';
        element.style.border = '2px solid #1e40af';
        element.style.borderRadius = '4px';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.fontSize = '20px';
        element.innerHTML = defenseType.icon;
        element.dataset.defenseId = defense.id;
        
        this.gameArea.appendChild(element);
    }

    selectDefense(defense) {
        this.selectedDefense = defense;
        this.placementMode = false;
        this.selectedDefenseType = null;
        
        // Update visual selection
        document.querySelectorAll('.defense-unit').forEach(el => {
            el.style.boxShadow = '';
        });
        
        const element = document.querySelector(`[data-defense-id="${defense.id}"]`);
        if (element) {
            element.style.boxShadow = '0 0 0 3px #fbbf24';
        }
        
        document.getElementById('placement-mode').textContent = 'Mode: DEFENSE SELECTED';
        this.updateSelectionInfo();
    }

    updateSelectionInfo() {
        const details = document.getElementById('selection-details');
        
        if (this.selectedDefense) {
            const defenseType = this.data.defense_types.find(d => d.id === this.selectedDefense.type);
            details.innerHTML = `
                <div class="font-bold text-white">${defenseType.name} (Level ${this.selectedDefense.level})</div>
                <div>Damage: ${this.selectedDefense.damage}</div>
                <div>Range: ${this.selectedDefense.range}</div>
                <div>Kills: ${this.selectedDefense.killCount}</div>
                <div class="text-yellow-400">Upgrade Cost: $${defenseType.cost * this.selectedDefense.level}</div>
            `;
        } else if (this.selectedDefenseType) {
            const defenseType = this.data.defense_types.find(d => d.id === this.selectedDefenseType);
            details.innerHTML = `
                <div class="font-bold text-blue-400">${defenseType.name}</div>
                <div>Damage: ${defenseType.damage}</div>
                <div>Range: ${defenseType.range}</div>
                <div class="text-gray-400">Click grid to place</div>
            `;
        } else {
            details.innerHTML = `
                <div>No defense selected</div>
                <div class="text-gray-500">Select from shop or click placed defense</div>
            `;
        }
    }

    startDefense() {
        if (this.isDefending) return;
        
        this.isDefending = true;
        this.sendNextWave();
        
        // Start main game loop
        this.gameTimer = setInterval(() => {
            this.updateGame();
        }, 50); // 20 FPS
        
        this.updateDisplay();
    }

    sendNextWave() {
        if (this.currentWave > this.maxWaves) return;
        
        const wave = this.generateWave(this.currentWave);
        this.attackWaves.push(...wave);
        
        this.currentWave++;
        this.lastWaveTime = this.gameTime;
        
        this.updateDisplay();
        this.updateThreatPreview();
    }

    generateWave(waveNumber) {
        const attacks = [];
        const attackTypes = this.data.attack_types;
        const baseCount = 3 + waveNumber;
        
        for (let i = 0; i < baseCount; i++) {
            const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
            
            attacks.push({
                id: Date.now() + i,
                type: attackType.id,
                health: attackType.health * (1 + waveNumber * 0.2),
                maxHealth: attackType.health * (1 + waveNumber * 0.2),
                speed: attackType.speed,
                damage: attackType.damage,
                reward: attackType.reward,
                icon: attackType.icon,
                pathIndex: 0,
                x: this.path[0].x * this.cellSize,
                y: this.path[0].y * this.cellSize,
                element: null,
                spawnDelay: i * 1000, // 1 second between spawns
                spawned: false
            });
        }
        
        return attacks;
    }

    updateGame() {
        this.gameTime += 50; // 50ms per update
        
        // Spawn delayed attacks
        this.attackWaves.forEach(attack => {
            if (!attack.spawned && this.gameTime - this.lastWaveTime >= attack.spawnDelay) {
                this.spawnAttack(attack);
                attack.spawned = true;
            }
        });
        
        // Update attack positions
        this.attackWaves.forEach(attack => {
            if (attack.spawned && attack.element) {
                this.updateAttackPosition(attack);
            }
        });
        
        // Defense shooting
        this.defenseUnits.forEach(defense => {
            this.updateDefenseShooting(defense);
        });
        
        // Check win/lose conditions
        if (this.websiteHealth <= 0) {
            this.defenseFailure();
        } else if (this.currentWave > this.maxWaves && this.attackWaves.length === 0) {
            this.defenseSuccess();
        }
    }

    spawnAttack(attack) {
        const element = document.createElement('div');
        element.className = 'attack-unit absolute transition-all duration-75';
        element.style.width = '30px';
        element.style.height = '30px';
        element.style.borderRadius = '50%';
        element.style.backgroundColor = '#ef4444';
        element.style.border = '2px solid #dc2626';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.fontSize = '16px';
        element.style.zIndex = '10';
        element.innerHTML = attack.icon;
        
        // Health bar
        const healthBar = document.createElement('div');
        healthBar.className = 'health-bar absolute';
        healthBar.style.top = '-8px';
        healthBar.style.left = '0';
        healthBar.style.width = '30px';
        healthBar.style.height = '4px';
        healthBar.style.backgroundColor = '#dc2626';
        healthBar.style.border = '1px solid #000';
        element.appendChild(healthBar);
        
        attack.element = element;
        this.gameArea.appendChild(element);
    }

    updateAttackPosition(attack) {
        if (attack.pathIndex >= this.path.length - 1) {
            // Attack reached the website
            this.websiteHealth -= attack.damage;
            this.attacksPassed++;
            this.removeAttack(attack);
            return;
        }
        
        const currentPoint = this.path[attack.pathIndex];
        const nextPoint = this.path[attack.pathIndex + 1];
        
        const targetX = nextPoint.x * this.cellSize + 5;
        const targetY = nextPoint.y * this.cellSize + 5;
        
        const dx = targetX - attack.x;
        const dy = targetY - attack.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < attack.speed) {
            attack.pathIndex++;
            attack.x = targetX;
            attack.y = targetY;
        } else {
            attack.x += (dx / distance) * attack.speed;
            attack.y += (dy / distance) * attack.speed;
        }
        
        attack.element.style.left = `${attack.x}px`;
        attack.element.style.top = `${attack.y}px`;
    }

    updateDefenseShooting(defense) {
        const now = Date.now();
        if (now - defense.lastShot < 1000) return; // 1 second cooldown
        
        // Find attacks in range
        const targets = this.attackWaves.filter(attack => {
            if (!attack.spawned || !attack.element) return false;
            
            const dx = attack.x - (defense.x * this.cellSize + 20);
            const dy = attack.y - (defense.y * this.cellSize + 20);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            return distance <= defense.range * this.cellSize;
        });
        
        if (targets.length > 0) {
            // Shoot at first target
            const target = targets[0];
            this.shootAtTarget(defense, target);
            defense.lastShot = now;
        }
    }

    shootAtTarget(defense, target) {
        // Create projectile effect
        this.createProjectile(defense, target);
        
        // Deal damage
        target.health -= defense.damage;
        
        // Update health bar
        const healthPercent = target.health / target.maxHealth;
        const healthBar = target.element.querySelector('.health-bar');
        if (healthBar) {
            healthBar.style.width = `${30 * healthPercent}px`;
            healthBar.style.backgroundColor = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#f59e0b' : '#dc2626';
        }
        
        // Check if attack is destroyed
        if (target.health <= 0) {
            this.attacksBlocked++;
            defense.killCount++;
            this.securityBudget += target.reward;
            this.removeAttack(target);
        }
    }

    createProjectile(defense, target) {
        const projectile = document.createElement('div');
        projectile.className = 'projectile absolute';
        projectile.style.width = '4px';
        projectile.style.height = '4px';
        projectile.style.backgroundColor = '#fbbf24';
        projectile.style.borderRadius = '50%';
        projectile.style.left = `${defense.x * this.cellSize + 20}px`;
        projectile.style.top = `${defense.y * this.cellSize + 20}px`;
        projectile.style.zIndex = '15';
        
        this.gameArea.appendChild(projectile);
        
        // Animate to target
        setTimeout(() => {
            projectile.style.left = `${target.x + 15}px`;
            projectile.style.top = `${target.y + 15}px`;
            projectile.style.transition = 'all 0.2s ease-out';
        }, 10);
        
        // Remove after animation
        setTimeout(() => {
            projectile.remove();
        }, 250);
    }

    removeAttack(attack) {
        if (attack.element) {
            attack.element.remove();
        }
        
        const index = this.attackWaves.indexOf(attack);
        if (index > -1) {
            this.attackWaves.splice(index, 1);
        }
    }

    sellSelectedDefense() {
        if (!this.selectedDefense) {
            this.showMessage('No defense selected!', 'error');
            return;
        }
        
        const sellValue = Math.floor(this.selectedDefense.cost * 0.7); // 70% sell value
        this.securityBudget += sellValue;
        
        // Remove visual element
        const element = document.querySelector(`[data-defense-id="${this.selectedDefense.id}"]`);
        if (element) {
            element.remove();
        }
        
        // Remove from array
        const index = this.defenseUnits.indexOf(this.selectedDefense);
        if (index > -1) {
            this.defenseUnits.splice(index, 1);
        }
        
        this.selectedDefense = null;
        this.updateDisplay();
        this.updateSelectionInfo();
        this.showMessage(`Defense sold for $${sellValue}`, 'success');
    }

    updateDisplay() {
        document.getElementById('website-health').textContent = `${Math.max(0, this.websiteHealth)}%`;
        document.getElementById('security-budget').textContent = `$${this.securityBudget}`;
        document.getElementById('wave-display').textContent = `${Math.min(this.currentWave, this.maxWaves)}/${this.maxWaves}`;
        document.getElementById('attacks-blocked').textContent = this.attacksBlocked;
        document.getElementById('attacks-passed').textContent = this.attacksPassed;
        
        // Update shop availability
        document.querySelectorAll('.defense-item').forEach(item => {
            const defenseType = item.dataset.defenseType;
            const defense = this.data.defense_types.find(d => d.id === defenseType);
            
            if (this.securityBudget >= defense.cost) {
                item.disabled = false;
                item.classList.remove('opacity-50', 'bg-red-900', 'border-red-500');
                item.classList.add('bg-gray-600', 'border-gray-500');
            } else {
                item.disabled = true;
                item.classList.add('opacity-50', 'bg-red-900', 'border-red-500');
                item.classList.remove('bg-gray-600', 'border-gray-500');
            }
        });
    }

    updateThreatPreview() {
        const preview = document.getElementById('threat-preview');
        if (this.currentWave <= this.maxWaves) {
            preview.innerHTML = `
                <div>Wave ${this.currentWave}: ${this.getWaveDifficulty()}</div>
                <div class="text-gray-500">Click "Send Next Wave" when ready</div>
            `;
        } else {
            preview.innerHTML = `
                <div class="text-green-400">All waves sent!</div>
                <div class="text-gray-500">Defend until all attacks cleared</div>
            `;
        }
    }

    getWaveDifficulty() {
        const difficulties = ['Easy', 'Moderate', 'Hard', 'Very Hard', 'Extreme'];
        return difficulties[Math.min(this.currentWave - 1, difficulties.length - 1)];
    }

    defenseSuccess() {
        clearInterval(this.gameTimer);
        this.isDefending = false;
        
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="defense-success text-center p-8">
                <i class="bi bi-shield-check text-8xl text-green-400 mb-4 animate-bounce"></i>
                <h2 class="text-3xl font-bold text-green-400 mb-4">WEBSITE SECURED!</h2>
                
                <div class="final-stats grid grid-cols-4 gap-4 mb-6">
                    <div class="bg-green-800 p-3 rounded">
                        <p class="text-green-200">Website Health</p>
                        <p class="text-xl font-bold text-green-400">${this.websiteHealth}%</p>
                        <p class="text-xs text-green-300">✓ Protected</p>
                    </div>
                    <div class="bg-purple-800 p-3 rounded">
                        <p class="text-purple-200">Attacks Blocked</p>
                        <p class="text-xl font-bold text-purple-400">${this.attacksBlocked}</p>
                        <p class="text-xs text-purple-300">✓ Excellent Defense</p>
                    </div>
                    <div class="bg-blue-800 p-3 rounded">
                        <p class="text-blue-200">Defenses Built</p>
                        <p class="text-xl font-bold text-blue-400">${this.defenseUnits.length}</p>
                        <p class="text-xs text-blue-300">✓ Strategic</p>
                    </div>
                    <div class="bg-yellow-800 p-3 rounded">
                        <p class="text-yellow-200">Budget Remaining</p>
                        <p class="text-xl font-bold text-yellow-400">$${this.securityBudget}</p>
                        <p class="text-xs text-yellow-300">✓ Efficient</p>
                    </div>
                </div>
                
                <div class="security-report bg-gray-800 p-4 rounded mb-4">
                    <h4 class="font-bold text-gray-200 mb-2">🛡️ Cybersecurity Defense Report</h4>
                    <div class="text-left text-sm text-gray-300">
                        <p>✅ All ${this.maxWaves} attack waves successfully repelled</p>
                        <p>✅ Website integrity maintained at ${this.websiteHealth}%</p>
                        <p>✅ ${this.attacksBlocked} cyber attacks neutralized</p>
                        <p>✅ Strategic defense placement prevented breaches</p>
                        <p>✅ Security budget managed efficiently</p>
                        <p>✅ Enterprise-level cybersecurity demonstrated</p>
                    </div>
                </div>
            </div>
        `;
        
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

// Register the class globally
window.Room5 = Room5;
