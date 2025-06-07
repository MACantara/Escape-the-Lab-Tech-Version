class Room6 {
    constructor(game) {
        this.game = game;
        this.gridWidth = 12;
        this.gridHeight = 8;
        this.cellSize = 50;
        
        // Player character
        this.player = {
            x: 1,
            y: 6,
            health: 100,
            energy: 50,
            inventory: []
        };
        
        // Game state
        this.bugs = [];
        this.obstacles = [];
        this.powerUps = [];
        this.codeLines = [];
        this.currentLevel = 1;
        this.maxLevel = 3;
        this.bugsDefeated = 0;
        this.timeRemaining = 600; // 10 minutes
        
        // Code execution
        this.codeQueue = [];
        this.isExecuting = false;
        this.executionSpeed = 500; // ms between commands
        
        // Game grid
        this.gameGrid = null;
        this.playerElement = null;
    }

    async init() {
        const response = await fetch('data/programming-crisis.json');
        this.data = await response.json();
        this.initializeLevel();
        this.render();
        this.setupGameGrid();
        this.startTimer();
    }

    initializeLevel() {
        this.bugs = [];
        this.obstacles = [];
        this.powerUps = [];
        
        // Generate level layout
        switch(this.currentLevel) {
            case 1:
                this.generateBeginnerLevel();
                break;
            case 2:
                this.generateIntermediateLevel();
                break;
            case 3:
                this.generateAdvancedLevel();
                break;
        }
    }

    generateBeginnerLevel() {
        // Simple bugs scattered around
        this.bugs = [
            { x: 5, y: 2, type: 'syntax_error', health: 30, id: 1 },
            { x: 8, y: 4, type: 'type_error', health: 25, id: 2 },
            { x: 3, y: 6, type: 'syntax_error', health: 30, id: 3 }
        ];
        
        // Basic obstacles
        this.obstacles = [
            { x: 4, y: 3, type: 'wall' },
            { x: 6, y: 5, type: 'wall' },
            { x: 9, y: 2, type: 'wall' }
        ];
        
        // Power-ups
        this.powerUps = [
            { x: 10, y: 1, type: 'energy_boost', value: 20 },
            { x: 2, y: 4, type: 'health_pack', value: 25 }
        ];
    }

    generateIntermediateLevel() {
        this.bugs = [
            { x: 4, y: 1, type: 'logic_error', health: 40, id: 4 },
            { x: 7, y: 3, type: 'runtime_error', health: 50, id: 5 },
            { x: 2, y: 5, type: 'type_error', health: 25, id: 6 },
            { x: 9, y: 6, type: 'syntax_error', health: 30, id: 7 }
        ];
        
        this.obstacles = [
            { x: 3, y: 2, type: 'firewall' },
            { x: 5, y: 4, type: 'firewall' },
            { x: 8, y: 1, type: 'wall' },
            { x: 6, y: 6, type: 'wall' }
        ];
        
        this.powerUps = [
            { x: 10, y: 3, type: 'debug_tool', value: 30 },
            { x: 1, y: 2, type: 'energy_boost', value: 25 }
        ];
    }

    generateAdvancedLevel() {
        this.bugs = [
            { x: 3, y: 1, type: 'memory_leak', health: 60, id: 8 },
            { x: 6, y: 2, type: 'race_condition', health: 70, id: 9 },
            { x: 9, y: 4, type: 'buffer_overflow', health: 80, id: 10 },
            { x: 2, y: 6, type: 'logic_error', health: 40, id: 11 },
            { x: 8, y: 7, type: 'runtime_error', health: 50, id: 12 }
        ];
        
        this.obstacles = [
            { x: 4, y: 3, type: 'encrypted_wall' },
            { x: 7, y: 5, type: 'encrypted_wall' },
            { x: 5, y: 1, type: 'firewall' },
            { x: 10, y: 6, type: 'firewall' }
        ];
        
        this.powerUps = [
            { x: 11, y: 2, type: 'super_debug', value: 50 },
            { x: 1, y: 7, type: 'health_pack', value: 40 }
        ];
    }

    render() {
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="room-container p-6 fade-in">
                <div class="text-center mb-6">
                    <i class="bi bi-bug text-6xl text-red-500 animate-pulse"></i>
                    <h2 class="text-3xl font-bold mt-4 text-red-400">PROGRAMMING CRISIS</h2>
                    <p class="text-gray-300 mt-2">Debug the system by writing code to control your character!</p>
                </div>
                
                <div class="status-panel grid grid-cols-5 gap-3 mb-4">
                    <div class="status-card bg-green-900 p-3 rounded text-center">
                        <i class="bi bi-heart text-green-400 text-xl"></i>
                        <p class="text-xs text-green-200">Health</p>
                        <p id="player-health" class="text-lg font-bold text-green-100">${this.player.health}</p>
                    </div>
                    <div class="status-card bg-blue-900 p-3 rounded text-center">
                        <i class="bi bi-lightning text-blue-400 text-xl"></i>
                        <p class="text-xs text-blue-200">Energy</p>
                        <p id="player-energy" class="text-lg font-bold text-blue-100">${this.player.energy}</p>
                    </div>
                    <div class="status-card bg-purple-900 p-3 rounded text-center">
                        <i class="bi bi-bug text-purple-400 text-xl"></i>
                        <p class="text-xs text-purple-200">Bugs Fixed</p>
                        <p id="bugs-defeated" class="text-lg font-bold text-purple-100">${this.bugsDefeated}</p>
                    </div>
                    <div class="status-card bg-yellow-900 p-3 rounded text-center">
                        <i class="bi bi-layers text-yellow-400 text-xl"></i>
                        <p class="text-xs text-yellow-200">Level</p>
                        <p id="current-level" class="text-lg font-bold text-yellow-100">${this.currentLevel}/${this.maxLevel}</p>
                    </div>
                    <div class="status-card bg-red-900 p-3 rounded text-center">
                        <i class="bi bi-clock text-red-400 text-xl"></i>
                        <p class="text-xs text-red-200">Time</p>
                        <p id="time-remaining" class="text-lg font-bold text-red-100">${Math.floor(this.timeRemaining / 60)}m</p>
                    </div>
                </div>

                <div class="game-container bg-gray-800 rounded-lg p-4 mb-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-white">🎮 Debug Grid - Level ${this.currentLevel}</h3>
                        <div class="execution-status">
                            <span class="text-gray-300">Status: </span>
                            <span id="execution-status" class="font-bold ${this.isExecuting ? 'text-yellow-400' : 'text-green-400'}">
                                ${this.isExecuting ? 'EXECUTING' : 'READY'}
                            </span>
                        </div>
                    </div>
                    
                    <div id="game-grid" class="bg-black rounded border-2 border-gray-600 relative" 
                         style="width: ${this.gridWidth * this.cellSize}px; height: ${this.gridHeight * this.cellSize}px; margin: 0 auto;">
                        <!-- Game grid will be rendered here -->
                    </div>
                    
                    <div class="grid-legend mt-2 text-sm text-gray-400 text-center">
                        <span class="mr-4">🤖 = You</span>
                        <span class="mr-4">🐛 = Bug</span>
                        <span class="mr-4">🧱 = Wall</span>
                        <span class="mr-4">🔥 = Firewall</span>
                        <span class="mr-4">💊 = Power-up</span>
                    </div>
                </div>

                <div class="controls-panel grid grid-cols-2 gap-4">
                    <div class="code-editor bg-gray-700 p-4 rounded">
                        <h4 class="font-bold text-white mb-3">💻 Code Editor</h4>
                        <div class="mb-3">
                            <textarea id="code-input" 
                                     class="w-full h-32 bg-black text-green-400 font-mono p-3 rounded border border-gray-500 text-sm"
                                     placeholder="# Write Python-like commands:
# move('up'), move('down'), move('left'), move('right')
# attack('up'), attack('down'), attack('left'), attack('right')
# use_item('health_pack'), scan(), wait()
# 
# Example:
# move('right')
# move('right')
# attack('up')"></textarea>
                        </div>
                        <div class="code-controls flex gap-2">
                            <button id="execute-code" class="bg-green-600 hover:bg-green-500 px-4 py-2 rounded transition-colors">
                                <i class="bi bi-play-fill"></i> Execute Code
                            </button>
                            <button id="clear-code" class="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded transition-colors">
                                <i class="bi bi-trash"></i> Clear
                            </button>
                            <button id="stop-execution" class="bg-red-600 hover:bg-red-500 px-4 py-2 rounded transition-colors" disabled>
                                <i class="bi bi-stop-fill"></i> Stop
                            </button>
                        </div>
                    </div>

                    <div class="game-info bg-gray-700 p-4 rounded">
                        <h4 class="font-bold text-white mb-3">📋 Command Reference</h4>
                        <div class="commands-list text-sm text-gray-300 space-y-1 mb-4">
                            <div><code class="text-green-400">move('direction')</code> - Move in direction (2 energy)</div>
                            <div><code class="text-red-400">attack('direction')</code> - Attack adjacent bug (5 energy)</div>
                            <div><code class="text-blue-400">scan()</code> - Reveal nearby info (3 energy)</div>
                            <div><code class="text-yellow-400">use_item('item')</code> - Use inventory item</div>
                            <div><code class="text-purple-400">wait()</code> - Skip turn, gain 5 energy</div>
                            <div><code class="text-cyan-400">collect()</code> - Pick up items at current position</div>
                        </div>
                        
                        <div class="execution-queue bg-gray-800 p-3 rounded">
                            <h5 class="font-bold text-blue-400 mb-2">⚙️ Execution Queue</h5>
                            <div id="queue-display" class="text-sm text-gray-300 max-h-16 overflow-y-auto">
                                <div class="text-gray-500">No commands queued</div>
                            </div>
                        </div>
                        
                        <div class="inventory mt-3 bg-gray-800 p-3 rounded">
                            <h5 class="font-bold text-purple-400 mb-2">🎒 Inventory</h5>
                            <div id="inventory-display" class="text-sm text-gray-300">
                                <div class="text-gray-500">Empty</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('execute-code')?.addEventListener('click', () => {
            this.executeCode();
        });

        document.getElementById('clear-code')?.addEventListener('click', () => {
            document.getElementById('code-input').value = '';
        });

        document.getElementById('stop-execution')?.addEventListener('click', () => {
            this.stopExecution();
        });

        // Allow enter to execute single line
        document.getElementById('code-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                this.executeCode();
            }
        });
    }

    setupGameGrid() {
        this.gameGrid = document.getElementById('game-grid');
        
        // Create grid cells
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
                this.gameGrid.appendChild(cell);
            }
        }
        
        // Place player
        this.renderPlayer();
        
        // Place game objects
        this.renderGameObjects();
    }

    renderPlayer() {
        if (this.playerElement) {
            this.playerElement.remove();
        }
        
        this.playerElement = document.createElement('div');
        this.playerElement.className = 'player-character absolute flex items-center justify-center text-2xl font-bold z-10';
        this.playerElement.style.left = `${this.player.x * this.cellSize}px`;
        this.playerElement.style.top = `${this.player.y * this.cellSize}px`;
        this.playerElement.style.width = `${this.cellSize}px`;
        this.playerElement.style.height = `${this.cellSize}px`;
        this.playerElement.style.backgroundColor = '#3b82f6';
        this.playerElement.style.border = '2px solid #1e40af';
        this.playerElement.style.borderRadius = '8px';
        this.playerElement.innerHTML = '🤖';
        
        this.gameGrid.appendChild(this.playerElement);
    }

    renderGameObjects() {
        // Clear existing objects
        document.querySelectorAll('.game-object').forEach(el => el.remove());
        
        // Render bugs
        this.bugs.forEach(bug => {
            const element = document.createElement('div');
            element.className = 'game-object bug absolute flex items-center justify-center text-2xl z-5';
            element.style.left = `${bug.x * this.cellSize}px`;
            element.style.top = `${bug.y * this.cellSize}px`;
            element.style.width = `${this.cellSize}px`;
            element.style.height = `${this.cellSize}px`;
            element.style.backgroundColor = '#dc2626';
            element.style.border = '2px solid #991b1b';
            element.style.borderRadius = '8px';
            element.innerHTML = '🐛';
            element.title = `${bug.type} (HP: ${bug.health})`;
            this.gameGrid.appendChild(element);
        });
        
        // Render obstacles
        this.obstacles.forEach(obstacle => {
            const element = document.createElement('div');
            element.className = 'game-object obstacle absolute flex items-center justify-center text-2xl z-5';
            element.style.left = `${obstacle.x * this.cellSize}px`;
            element.style.top = `${obstacle.y * this.cellSize}px`;
            element.style.width = `${this.cellSize}px`;
            element.style.height = `${this.cellSize}px`;
            element.style.backgroundColor = obstacle.type === 'firewall' ? '#f59e0b' : '#6b7280';
            element.style.border = '2px solid #374151';
            element.style.borderRadius = '4px';
            element.innerHTML = obstacle.type === 'firewall' ? '🔥' : '🧱';
            this.gameGrid.appendChild(element);
        });
        
        // Render power-ups
        this.powerUps.forEach(powerUp => {
            const element = document.createElement('div');
            element.className = 'game-object powerup absolute flex items-center justify-center text-2xl z-5';
            element.style.left = `${powerUp.x * this.cellSize}px`;
            element.style.top = `${powerUp.y * this.cellSize}px`;
            element.style.width = `${this.cellSize}px`;
            element.style.height = `${this.cellSize}px`;
            element.style.backgroundColor = '#10b981';
            element.style.border = '2px solid #047857';
            element.style.borderRadius = '50%';
            element.innerHTML = '💊';
            element.title = `${powerUp.type} (+${powerUp.value})`;
            this.gameGrid.appendChild(element);
        });
    }

    executeCode() {
        if (this.isExecuting) return;
        
        const codeInput = document.getElementById('code-input');
        const code = codeInput.value.trim();
        
        if (!code) {
            this.showMessage('Please enter some code to execute!', 'error');
            return;
        }
        
        // Parse code into commands
        this.codeQueue = this.parseCode(code);
        
        if (this.codeQueue.length === 0) {
            this.showMessage('No valid commands found!', 'error');
            return;
        }
        
        this.isExecuting = true;
        this.updateExecutionDisplay();
        this.executeNextCommand();
    }

    parseCode(code) {
        const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        const commands = [];
        
        lines.forEach((line, index) => {
            const trimmed = line.trim();
            
            // Parse move commands
            if (trimmed.match(/move\s*\(\s*['"]?(up|down|left|right)['"]?\s*\)/i)) {
                const direction = trimmed.match(/['"]?(up|down|left|right)['"]?/i)[1].toLowerCase();
                commands.push({ type: 'move', direction, line: index + 1 });
            }
            
            // Parse attack commands
            else if (trimmed.match(/attack\s*\(\s*['"]?(up|down|left|right)['"]?\s*\)/i)) {
                const direction = trimmed.match(/['"]?(up|down|left|right)['"]?/i)[1].toLowerCase();
                commands.push({ type: 'attack', direction, line: index + 1 });
            }
            
            // Parse scan command
            else if (trimmed.match(/scan\s*\(\s*\)/i)) {
                commands.push({ type: 'scan', line: index + 1 });
            }
            
            // Parse wait command
            else if (trimmed.match(/wait\s*\(\s*\)/i)) {
                commands.push({ type: 'wait', line: index + 1 });
            }
            
            // Parse collect command
            else if (trimmed.match(/collect\s*\(\s*\)/i)) {
                commands.push({ type: 'collect', line: index + 1 });
            }
            
            // Parse use_item command
            else if (trimmed.match(/use_item\s*\(\s*['"]?\w+['"]?\s*\)/i)) {
                const item = trimmed.match(/use_item\s*\(\s*['"]?(\w+)['"]?\s*\)/i)[1];
                commands.push({ type: 'use_item', item, line: index + 1 });
            }
            
            // Invalid command
            else {
                commands.push({ type: 'error', message: `Syntax error on line ${index + 1}: ${trimmed}`, line: index + 1 });
            }
        });
        
        return commands;
    }

    executeNextCommand() {
        if (!this.isExecuting || this.codeQueue.length === 0) {
            this.isExecuting = false;
            this.updateExecutionDisplay();
            return;
        }
        
        const command = this.codeQueue.shift();
        
        // Handle error commands
        if (command.type === 'error') {
            this.showMessage(command.message, 'error');
            this.executeNextCommand();
            return;
        }
        
        // Execute command
        const result = this.executeCommand(command);
        
        if (result.success) {
            this.updateDisplay();
            this.renderPlayer();
            this.renderGameObjects();
            
            // Check for level completion
            if (this.bugs.length === 0) {
                this.levelComplete();
                return;
            }
            
            // Check for game over
            if (this.player.health <= 0) {
                this.gameOver();
                return;
            }
            
            // Continue execution
            setTimeout(() => {
                this.executeNextCommand();
            }, this.executionSpeed);
        } else {
            this.showMessage(result.message, 'error');
            this.isExecuting = false;
            this.updateExecutionDisplay();
        }
    }

    executeCommand(command) {
        switch (command.type) {
            case 'move':
                return this.executeMove(command.direction);
            case 'attack':
                return this.executeAttack(command.direction);
            case 'scan':
                return this.executeScan();
            case 'wait':
                return this.executeWait();
            case 'collect':
                return this.executeCollect();
            case 'use_item':
                return this.executeUseItem(command.item);
            default:
                return { success: false, message: 'Unknown command type' };
        }
    }

    executeMove(direction) {
        if (this.player.energy < 2) {
            return { success: false, message: 'Not enough energy to move!' };
        }
        
        const directions = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };
        
        const delta = directions[direction];
        const newX = this.player.x + delta.x;
        const newY = this.player.y + delta.y;
        
        // Check bounds
        if (newX < 0 || newX >= this.gridWidth || newY < 0 || newY >= this.gridHeight) {
            return { success: false, message: 'Cannot move outside the grid!' };
        }
        
        // Check for obstacles
        const obstacle = this.obstacles.find(obs => obs.x === newX && obs.y === newY);
        if (obstacle) {
            return { success: false, message: `Cannot move through ${obstacle.type}!` };
        }
        
        // Check for bugs
        const bug = this.bugs.find(bug => bug.x === newX && bug.y === newY);
        if (bug) {
            return { success: false, message: 'Cannot move into a bug! Use attack() instead.' };
        }
        
        // Move player
        this.player.x = newX;
        this.player.y = newY;
        this.player.energy -= 2;
        
        // Check for power-ups
        const powerUpIndex = this.powerUps.findIndex(pu => pu.x === newX && pu.y === newY);
        if (powerUpIndex > -1) {
            const powerUp = this.powerUps[powerUpIndex];
            this.collectPowerUp(powerUp);
            this.powerUps.splice(powerUpIndex, 1);
        }
        
        return { success: true };
    }

    executeAttack(direction) {
        if (this.player.energy < 5) {
            return { success: false, message: 'Not enough energy to attack!' };
        }
        
        const directions = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };
        
        const delta = directions[direction];
        const targetX = this.player.x + delta.x;
        const targetY = this.player.y + delta.y;
        
        // Find bug at target position
        const bugIndex = this.bugs.findIndex(bug => bug.x === targetX && bug.y === targetY);
        if (bugIndex === -1) {
            return { success: false, message: 'No bug found in that direction!' };
        }
        
        const bug = this.bugs[bugIndex];
        const damage = 25 + Math.floor(Math.random() * 15); // 25-40 damage
        
        bug.health -= damage;
        this.player.energy -= 5;
        
        this.showMessage(`Dealt ${damage} damage to ${bug.type}!`, 'success');
        
        if (bug.health <= 0) {
            this.bugs.splice(bugIndex, 1);
            this.bugsDefeated++;
            this.player.energy += 10; // Bonus energy for defeating bug
            this.showMessage(`${bug.type} defeated! +10 energy`, 'success');
        }
        
        return { success: true };
    }

    executeScan() {
        if (this.player.energy < 3) {
            return { success: false, message: 'Not enough energy to scan!' };
        }
        
        this.player.energy -= 3;
        
        // Show information about nearby objects
        let scanInfo = 'Scan results:\n';
        
        // Check adjacent cells
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const x = this.player.x + dx;
                const y = this.player.y + dy;
                
                if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) continue;
                
                const bug = this.bugs.find(b => b.x === x && b.y === y);
                if (bug) {
                    scanInfo += `• Bug at (${x},${y}): ${bug.type} (${bug.health} HP)\n`;
                }
                
                const obstacle = this.obstacles.find(o => o.x === x && o.y === y);
                if (obstacle) {
                    scanInfo += `• Obstacle at (${x},${y}): ${obstacle.type}\n`;
                }
                
                const powerUp = this.powerUps.find(p => p.x === x && p.y === y);
                if (powerUp) {
                    scanInfo += `• Power-up at (${x},${y}): ${powerUp.type}\n`;
                }
            }
        }
        
        this.showMessage(scanInfo || 'No objects detected nearby.', 'info');
        return { success: true };
    }

    executeWait() {
        this.player.energy = Math.min(50, this.player.energy + 5);
        this.showMessage('Resting... +5 energy', 'info');
        return { success: true };
    }

    executeCollect() {
        const powerUp = this.powerUps.find(pu => pu.x === this.player.x && pu.y === this.player.y);
        if (!powerUp) {
            return { success: false, message: 'No items to collect at this position!' };
        }
        
        this.collectPowerUp(powerUp);
        const index = this.powerUps.indexOf(powerUp);
        this.powerUps.splice(index, 1);
        
        return { success: true };
    }

    executeUseItem(itemName) {
        const itemIndex = this.player.inventory.findIndex(item => item.type === itemName);
        if (itemIndex === -1) {
            return { success: false, message: `No ${itemName} in inventory!` };
        }
        
        const item = this.player.inventory[itemIndex];
        
        switch (item.type) {
            case 'health_pack':
                this.player.health = Math.min(100, this.player.health + item.value);
                this.showMessage(`Used ${item.type}! +${item.value} health`, 'success');
                break;
            case 'energy_boost':
                this.player.energy = Math.min(50, this.player.energy + item.value);
                this.showMessage(`Used ${item.type}! +${item.value} energy`, 'success');
                break;
            default:
                this.showMessage(`Used ${item.type}!`, 'success');
        }
        
        this.player.inventory.splice(itemIndex, 1);
        this.updateInventoryDisplay();
        
        return { success: true };
    }

    collectPowerUp(powerUp) {
        switch (powerUp.type) {
            case 'health_pack':
                this.player.inventory.push({ type: 'health_pack', value: powerUp.value });
                this.showMessage(`Collected health pack (+${powerUp.value})`, 'success');
                break;
            case 'energy_boost':
                this.player.inventory.push({ type: 'energy_boost', value: powerUp.value });
                this.showMessage(`Collected energy boost (+${powerUp.value})`, 'success');
                break;
            default:
                this.player.inventory.push(powerUp);
                this.showMessage(`Collected ${powerUp.type}`, 'success');
        }
        
        this.updateInventoryDisplay();
    }

    updateExecutionDisplay() {
        const statusDisplay = document.getElementById('execution-status');
        const queueDisplay = document.getElementById('queue-display');
        const executeBtn = document.getElementById('execute-code');
        const stopBtn = document.getElementById('stop-execution');
        
        if (statusDisplay) {
            statusDisplay.textContent = this.isExecuting ? 'EXECUTING' : 'READY';
            statusDisplay.className = `font-bold ${this.isExecuting ? 'text-yellow-400' : 'text-green-400'}`;
        }
        
        if (queueDisplay) {
            if (this.codeQueue.length > 0) {
                queueDisplay.innerHTML = this.codeQueue.map(cmd => 
                    `<div class="text-yellow-300">${cmd.type}${cmd.direction ? `('${cmd.direction}')` : '()'}</div>`
                ).join('');
            } else {
                queueDisplay.innerHTML = '<div class="text-gray-500">No commands queued</div>';
            }
        }
        
        if (executeBtn) executeBtn.disabled = this.isExecuting;
        if (stopBtn) stopBtn.disabled = !this.isExecuting;
    }

    updateInventoryDisplay() {
        const inventoryDisplay = document.getElementById('inventory-display');
        if (inventoryDisplay) {
            if (this.player.inventory.length > 0) {
                inventoryDisplay.innerHTML = this.player.inventory.map(item => 
                    `<div class="text-green-300">${item.type} ${item.value ? `(+${item.value})` : ''}</div>`
                ).join('');
            } else {
                inventoryDisplay.innerHTML = '<div class="text-gray-500">Empty</div>';
            }
        }
    }

    stopExecution() {
        this.isExecuting = false;
        this.codeQueue = [];
        this.updateExecutionDisplay();
        this.showMessage('Code execution stopped.', 'info');
    }

    levelComplete() {
        this.stopExecution();
        
        if (this.currentLevel >= this.maxLevel) {
            this.systemStabilized();
        } else {
            this.currentLevel++;
            this.showMessage(`Level ${this.currentLevel - 1} complete! Advancing to level ${this.currentLevel}...`, 'success');
            
            setTimeout(() => {
                this.initializeLevel();
                this.render();
                this.setupGameGrid();
            }, 2000);
        }
    }

    updateDisplay() {
        document.getElementById('player-health').textContent = this.player.health;
        document.getElementById('player-energy').textContent = this.player.energy;
        document.getElementById('bugs-defeated').textContent = this.bugsDefeated;
        document.getElementById('current-level').textContent = `${this.currentLevel}/${this.maxLevel}`;
        document.getElementById('time-remaining').textContent = `${Math.floor(this.timeRemaining / 60)}m`;
        
        this.updateExecutionDisplay();
        this.updateInventoryDisplay();
    }

    startTimer() {
        this.programmingTimer = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();
            
            if (this.timeRemaining <= 0) {
                clearInterval(this.programmingTimer);
                this.game.gameOver('Time expired! System debugging failed - Critical errors remain unfixed.');
            }
        }, 1000);
    }

    systemStabilized() {
        clearInterval(this.programmingTimer);
        this.stopExecution();
        
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="system-success text-center p-8">
                <i class="bi bi-check-circle text-8xl text-green-400 mb-4 animate-bounce"></i>
                <h2 class="text-3xl font-bold text-green-400 mb-4">SYSTEM DEBUGGED!</h2>
                
                <div class="final-stats grid grid-cols-4 gap-4 mb-6">
                    <div class="bg-green-800 p-3 rounded">
                        <p class="text-green-200">Player Health</p>
                        <p class="text-xl font-bold text-green-400">${this.player.health}%</p>
                        <p class="text-xs text-green-300">✓ Survived</p>
                    </div>
                    <div class="bg-purple-800 p-3 rounded">
                        <p class="text-purple-200">Bugs Fixed</p>
                        <p class="text-xl font-bold text-purple-400">${this.bugsDefeated}</p>
                        <p class="text-xs text-purple-300">✓ Debugging Master</p>
                    </div>
                    <div class="bg-blue-800 p-3 rounded">
                        <p class="text-blue-200">Levels Completed</p>
                        <p class="text-xl font-bold text-blue-400">${this.maxLevel}</p>
                        <p class="text-xs text-blue-300">✓ Full System</p>
                    </div>
                    <div class="bg-yellow-800 p-3 rounded">
                        <p class="text-yellow-200">Time Used</p>
                        <p class="text-xl font-bold text-yellow-400">${Math.floor((600 - this.timeRemaining) / 60)}m</p>
                        <p class="text-xs text-yellow-300">✓ Efficient</p>
                    </div>
                </div>
                
                <div class="debug-report bg-gray-800 p-4 rounded mb-4">
                    <h4 class="font-bold text-gray-200 mb-2">🐛 System Debug Report</h4>
                    <div class="text-left text-sm text-gray-300">
                        <p>✅ All ${this.bugsDefeated} critical bugs successfully eliminated</p>
                        <p>✅ System traversed using programmatic movement controls</p>
                        <p>✅ Python-like command syntax mastered for automation</p>
                        <p>✅ Strategic debugging approach with resource management</p>
                        <p>✅ All ${this.maxLevel} system levels debugged and stabilized</p>
                        <p>✅ Programming crisis resolved through code-based problem solving</p>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            this.game.roomCompleted(`Programming crisis resolved! System debugged through code-based navigation. ${this.bugsDefeated} bugs eliminated using Python-like programming commands.`);
        }, 3000);
    }

    gameOver() {
        clearInterval(this.programmingTimer);
        this.stopExecution();
        this.game.gameOver('Player health depleted! Debugging failed - System remains unstable with critical errors.');
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
        
        messageDiv.innerHTML = message.replace(/\n/g, '<br>');
        document.body.appendChild(messageDiv);
        
        setTimeout(() => messageDiv.remove(), 4000);
    }

    cleanup() {
        if (this.programmingTimer) clearInterval(this.programmingTimer);
        this.stopExecution();
    }
}

// Register the class globally
window.Room6 = Room6;
