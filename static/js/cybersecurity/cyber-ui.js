export class CyberUI {
    constructor(room) {
        this.room = room;
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
                
                ${this.renderStatusPanel()}
                ${this.renderGameArea()}
                ${this.renderControlPanels()}
            </div>
        `;
    }

    renderStatusPanel() {
        return `
            <div class="defense-status grid grid-cols-5 gap-3 mb-4">
                <div class="status-card bg-green-900 p-3 rounded text-center">
                    <i class="bi bi-heart text-green-400 text-xl"></i>
                    <p class="text-xs text-green-200">Website Health</p>
                    <p id="website-health" class="text-lg font-bold text-green-100">${this.room.websiteHealth}%</p>
                </div>
                <div class="status-card bg-yellow-900 p-3 rounded text-center">
                    <i class="bi bi-currency-dollar text-yellow-400 text-xl"></i>
                    <p class="text-xs text-yellow-200">Security Budget</p>
                    <p id="security-budget" class="text-lg font-bold text-yellow-100">$${this.room.securityBudget}</p>
                </div>
                <div class="status-card bg-blue-900 p-3 rounded text-center">
                    <i class="bi bi-layers text-blue-400 text-xl"></i>
                    <p class="text-xs text-blue-200">Current Wave</p>
                    <p id="wave-display" class="text-lg font-bold text-blue-100">${this.room.currentWave}/${this.room.maxWaves}</p>
                </div>
                <div class="status-card bg-purple-900 p-3 rounded text-center">
                    <i class="bi bi-shield-check text-purple-400 text-xl"></i>
                    <p class="text-xs text-purple-200">Attacks Blocked</p>
                    <p id="attacks-blocked" class="text-lg font-bold text-purple-100">${this.room.attacksBlocked}</p>
                </div>
                <div class="status-card bg-red-900 p-3 rounded text-center">
                    <i class="bi bi-exclamation-triangle text-red-400 text-xl"></i>
                    <p class="text-xs text-red-200">Breaches</p>
                    <p id="attacks-passed" class="text-lg font-bold text-red-100">${this.room.attacksPassed}</p>
                </div>
            </div>
        `;
    }

    renderGameArea() {
        return `
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
                    <div class="absolute top-2 left-2 text-white text-sm">
                        <div>Click defenses below, then click grid to place | Click placed defenses to upgrade</div>
                    </div>
                    <div class="absolute top-2 right-2 text-white text-sm">
                        <div id="placement-mode" class="font-bold">Mode: SELECT DEFENSE</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderControlPanels() {
        return `
            <div class="controls-panel grid grid-cols-2 gap-4">
                ${this.renderDefenseShop()}
                ${this.renderControlCenter()}
            </div>
        `;
    }

    renderDefenseShop() {
        return `
            <div class="defense-shop bg-gray-700 p-4 rounded">
                <h4 class="font-bold text-white mb-3">🏪 Security Defense Shop</h4>
                <div class="grid grid-cols-1 gap-2">
                    ${this.room.data.defense_types.map(defense => `
                        <button class="defense-item p-2 rounded border transition-colors ${this.room.securityBudget >= defense.cost ? 'border-gray-500 hover:border-gray-300 bg-gray-600' : 'border-red-500 bg-red-900 opacity-50'} ${this.room.selectedDefenseType === defense.id ? 'border-blue-400 bg-blue-700' : ''}"
                                data-defense-type="${defense.id}" ${this.room.securityBudget < defense.cost ? 'disabled' : ''}>
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
        `;
    }

    renderControlCenter() {
        return `
            <div class="control-center bg-gray-700 p-4 rounded">
                <h4 class="font-bold text-white mb-3">🎛️ Command Center</h4>
                <div class="space-y-2">
                    <button id="start-defense" class="w-full p-2 rounded transition-colors ${this.room.isDefending ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-500'}">
                        <i class="bi bi-play-fill"></i> ${this.room.isDefending ? 'Defense Active' : 'Start Defense'}
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
                        <div>Wave ${this.room.currentWave}: ${this.getWaveDifficulty()}</div>
                        <div class="text-gray-500">Click "Send Next Wave" when ready</div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.querySelectorAll('.defense-item').forEach(item => {
            item.addEventListener('click', () => {
                if (!item.disabled) {
                    this.room.defenseManager.selectDefenseType(item.dataset.defenseType);
                }
            });
        });

        document.getElementById('start-defense')?.addEventListener('click', () => {
            this.room.startDefense();
        });

        document.getElementById('send-next-wave')?.addEventListener('click', () => {
            this.room.sendNextWave();
        });

        document.getElementById('sell-defense')?.addEventListener('click', () => {
            this.room.defenseManager.sellSelectedDefense();
        });

        document.getElementById('emergency-shutdown')?.addEventListener('click', () => {
            this.room.emergencyShutdown();
        });
    }

    updateDisplay() {
        document.getElementById('website-health').textContent = `${Math.max(0, this.room.websiteHealth)}%`;
        document.getElementById('security-budget').textContent = `$${this.room.securityBudget}`;
        document.getElementById('wave-display').textContent = `${Math.min(this.room.currentWave, this.room.maxWaves)}/${this.room.maxWaves}`;
        document.getElementById('attacks-blocked').textContent = this.room.attacksBlocked;
        document.getElementById('attacks-passed').textContent = this.room.attacksPassed;
        
        // Update shop availability
        document.querySelectorAll('.defense-item').forEach(item => {
            const defenseType = item.dataset.defenseType;
            const defense = this.room.data.defense_types.find(d => d.id === defenseType);
            
            if (this.room.securityBudget >= defense.cost) {
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
        if (this.room.currentWave <= this.room.maxWaves) {
            preview.innerHTML = `
                <div>Wave ${this.room.currentWave}: ${this.getWaveDifficulty()}</div>
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
        return difficulties[Math.min(this.room.currentWave - 1, difficulties.length - 1)];
    }

    renderSuccessScreen() {
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="defense-success text-center p-8">
                <i class="bi bi-shield-check text-8xl text-green-400 mb-4 animate-bounce"></i>
                <h2 class="text-3xl font-bold text-green-400 mb-4">WEBSITE SECURED!</h2>
                
                <div class="final-stats grid grid-cols-4 gap-4 mb-6">
                    <div class="bg-green-800 p-3 rounded">
                        <p class="text-green-200">Website Health</p>
                        <p class="text-xl font-bold text-green-400">${this.room.websiteHealth}%</p>
                        <p class="text-xs text-green-300">✓ Protected</p>
                    </div>
                    <div class="bg-purple-800 p-3 rounded">
                        <p class="text-purple-200">Attacks Blocked</p>
                        <p class="text-xl font-bold text-purple-400">${this.room.attacksBlocked}</p>
                        <p class="text-xs text-purple-300">✓ Excellent Defense</p>
                    </div>
                    <div class="bg-blue-800 p-3 rounded">
                        <p class="text-blue-200">Defenses Built</p>
                        <p class="text-xl font-bold text-blue-400">${this.room.defenseUnits.length}</p>
                        <p class="text-xs text-blue-300">✓ Strategic</p>
                    </div>
                    <div class="bg-yellow-800 p-3 rounded">
                        <p class="text-yellow-200">Budget Remaining</p>
                        <p class="text-xl font-bold text-yellow-400">$${this.room.securityBudget}</p>
                        <p class="text-xs text-yellow-300">✓ Efficient</p>
                    </div>
                </div>
                
                <div class="security-report bg-gray-800 p-4 rounded mb-4">
                    <h4 class="font-bold text-gray-200 mb-2">🛡️ Cybersecurity Defense Report</h4>
                    <div class="text-left text-sm text-gray-300">
                        <p>✅ All ${this.room.maxWaves} attack waves successfully repelled</p>
                        <p>✅ Website integrity maintained at ${this.room.websiteHealth}%</p>
                        <p>✅ ${this.room.attacksBlocked} cyber attacks neutralized</p>
                        <p>✅ Strategic defense placement prevented breaches</p>
                        <p>✅ Security budget managed efficiently</p>
                        <p>✅ Enterprise-level cybersecurity demonstrated</p>
                    </div>
                </div>
            </div>
        `;
    }
}
