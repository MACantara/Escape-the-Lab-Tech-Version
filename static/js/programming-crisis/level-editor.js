class ProgrammingLevelEditor {
    constructor() {
        this.gridWidth = 12;
        this.gridHeight = 8;
        this.cellSize = 50;
        
        // Editor state
        this.currentTool = 'bug';
        this.selectedBugType = 'syntax_error';
        this.selectedObstacleType = 'wall';
        this.selectedPowerUpType = 'health_pack';
        this.playerPosition = { x: 1, y: 6 };
        
        // Level data
        this.currentLevel = {
            name: 'Custom Level',
            description: 'A custom level created in the editor',
            difficulty: 'Beginner',
            bugs: [],
            obstacles: [],
            powerUps: [],
            playerStart: { x: 1, y: 6 }
        };
        
        // Available types
        this.bugTypes = [
            { id: 'syntax_error', name: 'Syntax Error', health: 30, icon: '🔴', color: '#dc2626' },
            { id: 'type_error', name: 'Type Error', health: 25, icon: '🟡', color: '#f59e0b' },
            { id: 'logic_error', name: 'Logic Error', health: 40, icon: '🟣', color: '#8b5cf6' },
            { id: 'runtime_error', name: 'Runtime Error', health: 50, icon: '🟠', color: '#f97316' },
            { id: 'memory_leak', name: 'Memory Leak', health: 60, icon: '💧', color: '#06b6d4' },
            { id: 'race_condition', name: 'Race Condition', health: 70, icon: '🏃', color: '#10b981' },
            { id: 'buffer_overflow', name: 'Buffer Overflow', health: 80, icon: '💥', color: '#ef4444' }
        ];
        
        this.obstacleTypes = [
            { id: 'wall', name: 'System Wall', icon: '🧱', color: '#6b7280' },
            { id: 'firewall', name: 'Security Firewall', icon: '🔥', color: '#f59e0b' },
            { id: 'encrypted_wall', name: 'Encrypted Barrier', icon: '🔒', color: '#7c3aed' }
        ];
        
        this.powerUpTypes = [
            { id: 'health_pack', name: 'Health Pack', value: 25, icon: '💊', color: '#10b981' },
            { id: 'energy_boost', name: 'Energy Boost', value: 20, icon: '⚡', color: '#3b82f6' },
            { id: 'debug_tool', name: 'Debug Tool', value: 30, icon: '🔧', color: '#8b5cf6' },
            { id: 'super_debug', name: 'Super Debug', value: 50, icon: '🛠️', color: '#f59e0b' }
        ];
        
        this.savedLevels = this.loadSavedLevels();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.setupGrid();
    }

    render() {
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="level-editor-container p-6 fade-in">
                <div class="text-center mb-6">
                    <i class="bi bi-tools text-6xl text-blue-500 animate-pulse"></i>
                    <h2 class="text-3xl font-bold mt-4 text-blue-400">PROGRAMMING CRISIS LEVEL EDITOR</h2>
                    <p class="text-gray-300 mt-2">Create custom debugging challenges!</p>
                </div>
                
                <div class="editor-controls grid grid-cols-4 gap-4 mb-6">
                    <div class="level-info bg-gray-700 p-4 rounded">
                        <h4 class="font-bold text-white mb-3">📋 Level Info</h4>
                        <div class="space-y-2">
                            <input id="level-name" type="text" value="${this.currentLevel.name}" 
                                   class="w-full p-2 bg-gray-800 text-white rounded border border-gray-600" 
                                   placeholder="Level Name">
                            <textarea id="level-description" 
                                     class="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 text-sm h-20" 
                                     placeholder="Level Description">${this.currentLevel.description}</textarea>
                            <select id="level-difficulty" class="w-full p-2 bg-gray-800 text-white rounded border border-gray-600">
                                <option value="Beginner" ${this.currentLevel.difficulty === 'Beginner' ? 'selected' : ''}>Beginner</option>
                                <option value="Intermediate" ${this.currentLevel.difficulty === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                                <option value="Advanced" ${this.currentLevel.difficulty === 'Advanced' ? 'selected' : ''}>Advanced</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="tool-palette bg-gray-700 p-4 rounded">
                        <h4 class="font-bold text-white mb-3">🎨 Tools</h4>
                        <div class="grid grid-cols-2 gap-2">
                            <button class="tool-btn ${this.currentTool === 'player' ? 'bg-blue-600' : 'bg-gray-600'} p-2 rounded text-sm" data-tool="player">
                                🤖 Player
                            </button>
                            <button class="tool-btn ${this.currentTool === 'bug' ? 'bg-blue-600' : 'bg-gray-600'} p-2 rounded text-sm" data-tool="bug">
                                🐛 Bugs
                            </button>
                            <button class="tool-btn ${this.currentTool === 'obstacle' ? 'bg-blue-600' : 'bg-gray-600'} p-2 rounded text-sm" data-tool="obstacle">
                                🧱 Obstacles
                            </button>
                            <button class="tool-btn ${this.currentTool === 'powerup' ? 'bg-blue-600' : 'bg-gray-600'} p-2 rounded text-sm" data-tool="powerup">
                                💊 Power-ups
                            </button>
                            <button class="tool-btn ${this.currentTool === 'eraser' ? 'bg-blue-600' : 'bg-gray-600'} p-2 rounded text-sm" data-tool="eraser">
                                🗑️ Eraser
                            </button>
                        </div>
                    </div>
                    
                    <div class="type-selector bg-gray-700 p-4 rounded">
                        <h4 class="font-bold text-white mb-3">⚙️ Properties</h4>
                        <div id="type-options">
                            ${this.renderTypeOptions()}
                        </div>
                    </div>
                    
                    <div class="editor-actions bg-gray-700 p-4 rounded">
                        <h4 class="font-bold text-white mb-3">💾 Actions</h4>
                        <div class="space-y-2">
                            <button id="save-level" class="w-full p-2 bg-green-600 hover:bg-green-500 rounded text-sm">
                                Save Level
                            </button>
                            <button id="load-level" class="w-full p-2 bg-blue-600 hover:bg-blue-500 rounded text-sm">
                                Load Level
                            </button>
                            <button id="test-level" class="w-full p-2 bg-purple-600 hover:bg-purple-500 rounded text-sm">
                                Test Level
                            </button>
                            <button id="clear-level" class="w-full p-2 bg-red-600 hover:bg-red-500 rounded text-sm">
                                Clear All
                            </button>
                            <button id="export-level" class="w-full p-2 bg-yellow-600 hover:bg-yellow-500 rounded text-sm">
                                Export JSON
                            </button>
                            <button id="import-level" class="w-full p-2 bg-cyan-600 hover:bg-cyan-500 rounded text-sm">
                                Import JSON
                            </button>
                        </div>
                    </div>
                </div>

                <div class="editor-workspace bg-gray-800 rounded-lg p-4 mb-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-white">🎮 Level Editor Grid</h3>
                        <div class="level-stats text-sm text-gray-300">
                            <span class="mr-4">Bugs: <span id="bug-count">${this.currentLevel.bugs.length}</span></span>
                            <span class="mr-4">Obstacles: <span id="obstacle-count">${this.currentLevel.obstacles.length}</span></span>
                            <span>Power-ups: <span id="powerup-count">${this.currentLevel.powerUps.length}</span></span>
                        </div>
                    </div>
                    
                    <div id="editor-grid" class="bg-black rounded border-2 border-gray-600 relative" 
                         style="width: ${this.gridWidth * this.cellSize}px; height: ${this.gridHeight * this.cellSize}px; margin: 0 auto;">
                        <!-- Grid will be rendered here -->
                    </div>
                    
                    <div class="editor-instructions mt-4 text-sm text-gray-400 text-center">
                        <p>Click on the grid to place objects | Use tools on the left to switch modes | Right-click to remove objects</p>
                    </div>
                </div>

                <div class="saved-levels bg-gray-700 p-4 rounded">
                    <h4 class="font-bold text-white mb-3">💾 Saved Levels</h4>
                    <div id="saved-levels-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        ${this.renderSavedLevels()}
                    </div>
                </div>
            </div>
        `;
    }

    renderTypeOptions() {
        switch(this.currentTool) {
            case 'bug':
                return `
                    <select id="bug-type-select" class="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 mb-2">
                        ${this.bugTypes.map(bug => 
                            `<option value="${bug.id}" ${this.selectedBugType === bug.id ? 'selected' : ''}>${bug.icon} ${bug.name}</option>`
                        ).join('')}
                    </select>
                    <div class="text-xs text-gray-400">
                        Health: ${this.bugTypes.find(b => b.id === this.selectedBugType)?.health || 30}
                    </div>
                `;
            case 'obstacle':
                return `
                    <select id="obstacle-type-select" class="w-full p-2 bg-gray-800 text-white rounded border border-gray-600">
                        ${this.obstacleTypes.map(obstacle => 
                            `<option value="${obstacle.id}" ${this.selectedObstacleType === obstacle.id ? 'selected' : ''}>${obstacle.icon} ${obstacle.name}</option>`
                        ).join('')}
                    </select>
                `;
            case 'powerup':
                return `
                    <select id="powerup-type-select" class="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 mb-2">
                        ${this.powerUpTypes.map(powerUp => 
                            `<option value="${powerUp.id}" ${this.selectedPowerUpType === powerUp.id ? 'selected' : ''}>${powerUp.icon} ${powerUp.name}</option>`
                        ).join('')}
                    </select>
                    <div class="text-xs text-gray-400">
                        Value: +${this.powerUpTypes.find(p => p.id === this.selectedPowerUpType)?.value || 25}
                    </div>
                `;
            case 'player':
                return `
                    <div class="text-sm text-gray-300">
                        <p>Place player start position</p>
                        <p class="text-xs text-gray-400">Current: (${this.playerPosition.x}, ${this.playerPosition.y})</p>
                    </div>
                `;
            case 'eraser':
                return `
                    <div class="text-sm text-gray-300">
                        <p>Click to remove objects</p>
                        <p class="text-xs text-gray-400">Right-click also removes</p>
                    </div>
                `;
            default:
                return '<div class="text-sm text-gray-400">Select a tool</div>';
        }
    }

    renderSavedLevels() {
        if (this.savedLevels.length === 0) {
            return '<div class="text-gray-400 text-sm col-span-full text-center">No saved levels</div>';
        }
        
        return this.savedLevels.map((level, index) => `
            <div class="saved-level-card bg-gray-800 p-3 rounded border border-gray-600">
                <div class="font-bold text-white text-sm mb-1">${level.name}</div>
                <div class="text-xs text-gray-400 mb-2">${level.difficulty} • ${level.bugs.length} bugs</div>
                <div class="flex gap-1">
                    <button class="load-level-btn bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-xs" data-index="${index}">
                        Load
                    </button>
                    <button class="delete-level-btn bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-xs" data-index="${index}">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectTool(btn.dataset.tool);
            });
        });

        // Type selectors
        document.getElementById('bug-type-select')?.addEventListener('change', (e) => {
            this.selectedBugType = e.target.value;
            this.updateTypeOptions();
        });

        document.getElementById('obstacle-type-select')?.addEventListener('change', (e) => {
            this.selectedObstacleType = e.target.value;
        });

        document.getElementById('powerup-type-select')?.addEventListener('change', (e) => {
            this.selectedPowerUpType = e.target.value;
            this.updateTypeOptions();
        });

        // Level info updates
        document.getElementById('level-name').addEventListener('input', (e) => {
            this.currentLevel.name = e.target.value;
        });

        document.getElementById('level-description').addEventListener('input', (e) => {
            this.currentLevel.description = e.target.value;
        });

        document.getElementById('level-difficulty').addEventListener('change', (e) => {
            this.currentLevel.difficulty = e.target.value;
        });

        // Action buttons
        document.getElementById('save-level').addEventListener('click', () => this.saveLevel());
        document.getElementById('load-level').addEventListener('click', () => this.showLoadDialog());
        document.getElementById('test-level').addEventListener('click', () => this.testLevel());
        document.getElementById('clear-level').addEventListener('click', () => this.clearLevel());
        document.getElementById('export-level').addEventListener('click', () => this.exportLevel());
        document.getElementById('import-level').addEventListener('click', () => this.importLevel());

        // Saved level actions
        document.querySelectorAll('.load-level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.loadLevel(parseInt(btn.dataset.index));
            });
        });

        document.querySelectorAll('.delete-level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.deleteLevel(parseInt(btn.dataset.index));
            });
        });
    }

    setupGrid() {
        const grid = document.getElementById('editor-grid');
        
        // Create grid cells
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'editor-cell absolute border border-gray-700 cursor-pointer hover:bg-gray-600';
                cell.style.left = `${x * this.cellSize}px`;
                cell.style.top = `${y * this.cellSize}px`;
                cell.style.width = `${this.cellSize}px`;
                cell.style.height = `${this.cellSize}px`;
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // Add click listeners
                cell.addEventListener('click', (e) => this.handleCellClick(x, y, e));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.removeObjectAt(x, y);
                });
                
                grid.appendChild(cell);
            }
        }
        
        // Render existing objects
        this.renderGridObjects();
    }

    handleCellClick(x, y, event) {
        switch(this.currentTool) {
            case 'player':
                this.placePlayer(x, y);
                break;
            case 'bug':
                this.placeBug(x, y);
                break;
            case 'obstacle':
                this.placeObstacle(x, y);
                break;
            case 'powerup':
                this.placePowerUp(x, y);
                break;
            case 'eraser':
                this.removeObjectAt(x, y);
                break;
        }
    }

    placePlayer(x, y) {
        // Remove existing player visual
        const existingPlayer = document.querySelector('.editor-player');
        if (existingPlayer) existingPlayer.remove();
        
        this.playerPosition = { x, y };
        this.currentLevel.playerStart = { x, y };
        
        // Create player visual
        this.createGridObject(x, y, '🤖', '#3b82f6', 'editor-player');
        this.updateTypeOptions();
    }

    placeBug(x, y) {
        // Check if position is occupied
        if (this.isPositionOccupied(x, y)) {
            this.showMessage('Position occupied!', 'error');
            return;
        }
        
        const bugType = this.bugTypes.find(b => b.id === this.selectedBugType);
        const bug = {
            x, y,
            type: this.selectedBugType,
            health: bugType.health,
            id: Date.now() + Math.random()
        };
        
        this.currentLevel.bugs.push(bug);
        this.createGridObject(x, y, bugType.icon, bugType.color, 'editor-bug');
        this.updateStats();
    }

    placeObstacle(x, y) {
        if (this.isPositionOccupied(x, y)) {
            this.showMessage('Position occupied!', 'error');
            return;
        }
        
        const obstacleType = this.obstacleTypes.find(o => o.id === this.selectedObstacleType);
        const obstacle = {
            x, y,
            type: this.selectedObstacleType
        };
        
        this.currentLevel.obstacles.push(obstacle);
        this.createGridObject(x, y, obstacleType.icon, obstacleType.color, 'editor-obstacle');
        this.updateStats();
    }

    placePowerUp(x, y) {
        if (this.isPositionOccupied(x, y)) {
            this.showMessage('Position occupied!', 'error');
            return;
        }
        
        const powerUpType = this.powerUpTypes.find(p => p.id === this.selectedPowerUpType);
        const powerUp = {
            x, y,
            type: this.selectedPowerUpType,
            value: powerUpType.value
        };
        
        this.currentLevel.powerUps.push(powerUp);
        this.createGridObject(x, y, powerUpType.icon, powerUpType.color, 'editor-powerup');
        this.updateStats();
    }

    removeObjectAt(x, y) {
        // Remove visuals
        const elements = document.querySelectorAll(`[data-grid-x="${x}"][data-grid-y="${y}"]`);
        elements.forEach(el => el.remove());
        
        // Remove from arrays
        this.currentLevel.bugs = this.currentLevel.bugs.filter(bug => !(bug.x === x && bug.y === y));
        this.currentLevel.obstacles = this.currentLevel.obstacles.filter(obs => !(obs.x === x && obs.y === y));
        this.currentLevel.powerUps = this.currentLevel.powerUps.filter(pu => !(pu.x === x && pu.y === y));
        
        // Handle player removal
        if (this.playerPosition.x === x && this.playerPosition.y === y) {
            this.playerPosition = { x: 1, y: 6 }; // Reset to default
            this.currentLevel.playerStart = { x: 1, y: 6 };
        }
        
        this.updateStats();
    }

    createGridObject(x, y, icon, color, className) {
        const element = document.createElement('div');
        element.className = `grid-object ${className} absolute flex items-center justify-center text-2xl font-bold pointer-events-none`;
        element.style.left = `${x * this.cellSize + 2}px`;
        element.style.top = `${y * this.cellSize + 2}px`;
        element.style.width = `${this.cellSize - 4}px`;
        element.style.height = `${this.cellSize - 4}px`;
        element.style.backgroundColor = color;
        element.style.border = '2px solid #000';
        element.style.borderRadius = '4px';
        element.style.zIndex = '10';
        element.innerHTML = icon;
        element.dataset.gridX = x;
        element.dataset.gridY = y;
        
        document.getElementById('editor-grid').appendChild(element);
    }

    renderGridObjects() {
        // Clear existing objects
        document.querySelectorAll('.grid-object').forEach(el => el.remove());
        
        // Render player
        const { x: px, y: py } = this.playerPosition;
        this.createGridObject(px, py, '🤖', '#3b82f6', 'editor-player');
        
        // Render bugs
        this.currentLevel.bugs.forEach(bug => {
            const bugType = this.bugTypes.find(b => b.id === bug.type);
            this.createGridObject(bug.x, bug.y, bugType.icon, bugType.color, 'editor-bug');
        });
        
        // Render obstacles
        this.currentLevel.obstacles.forEach(obstacle => {
            const obstacleType = this.obstacleTypes.find(o => o.id === obstacle.type);
            this.createGridObject(obstacle.x, obstacle.y, obstacleType.icon, obstacleType.color, 'editor-obstacle');
        });
        
        // Render power-ups
        this.currentLevel.powerUps.forEach(powerUp => {
            const powerUpType = this.powerUpTypes.find(p => p.id === powerUp.type);
            this.createGridObject(powerUp.x, powerUp.y, powerUpType.icon, powerUpType.color, 'editor-powerup');
        });
    }

    isPositionOccupied(x, y) {
        // Check if player is at position
        if (this.playerPosition.x === x && this.playerPosition.y === y) return true;
        
        // Check bugs
        if (this.currentLevel.bugs.some(bug => bug.x === x && bug.y === y)) return true;
        
        // Check obstacles
        if (this.currentLevel.obstacles.some(obs => obs.x === x && obs.y === y)) return true;
        
        // Check power-ups
        if (this.currentLevel.powerUps.some(pu => pu.x === x && pu.y === y)) return true;
        
        return false;
    }

    selectTool(tool) {
        this.currentTool = tool;
        
        // Update tool button visuals
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('bg-blue-600');
            btn.classList.add('bg-gray-600');
        });
        
        document.querySelector(`[data-tool="${tool}"]`).classList.remove('bg-gray-600');
        document.querySelector(`[data-tool="${tool}"]`).classList.add('bg-blue-600');
        
        this.updateTypeOptions();
    }

    updateTypeOptions() {
        const typeOptions = document.getElementById('type-options');
        typeOptions.innerHTML = this.renderTypeOptions();
        
        // Re-setup event listeners for new elements
        this.setupTypeSelectListeners();
    }

    setupTypeSelectListeners() {
        document.getElementById('bug-type-select')?.addEventListener('change', (e) => {
            this.selectedBugType = e.target.value;
            this.updateTypeOptions();
        });

        document.getElementById('obstacle-type-select')?.addEventListener('change', (e) => {
            this.selectedObstacleType = e.target.value;
        });

        document.getElementById('powerup-type-select')?.addEventListener('change', (e) => {
            this.selectedPowerUpType = e.target.value;
            this.updateTypeOptions();
        });
    }

    updateStats() {
        document.getElementById('bug-count').textContent = this.currentLevel.bugs.length;
        document.getElementById('obstacle-count').textContent = this.currentLevel.obstacles.length;
        document.getElementById('powerup-count').textContent = this.currentLevel.powerUps.length;
    }

    saveLevel() {
        if (!this.currentLevel.name.trim()) {
            this.showMessage('Please enter a level name!', 'error');
            return;
        }
        
        if (this.currentLevel.bugs.length === 0) {
            this.showMessage('Level must have at least one bug!', 'error');
            return;
        }
        
        const levelData = {
            ...this.currentLevel,
            createdAt: new Date().toISOString(),
            id: Date.now()
        };
        
        this.savedLevels.push(levelData);
        this.saveLevelsToStorage();
        this.updateSavedLevelsList();
        this.showMessage(`Level "${levelData.name}" saved successfully!`, 'success');
    }

    loadLevel(index) {
        const level = this.savedLevels[index];
        if (!level) return;
        
        this.currentLevel = { ...level };
        this.playerPosition = { ...level.playerStart };
        
        // Update UI
        document.getElementById('level-name').value = level.name;
        document.getElementById('level-description').value = level.description;
        document.getElementById('level-difficulty').value = level.difficulty;
        
        this.renderGridObjects();
        this.updateStats();
        this.showMessage(`Level "${level.name}" loaded!`, 'success');
    }

    deleteLevel(index) {
        const level = this.savedLevels[index];
        if (confirm(`Delete level "${level.name}"?`)) {
            this.savedLevels.splice(index, 1);
            this.saveLevelsToStorage();
            this.updateSavedLevelsList();
            this.showMessage('Level deleted!', 'info');
        }
    }

    clearLevel() {
        if (confirm('Clear the entire level? This cannot be undone.')) {
            this.currentLevel = {
                name: 'Custom Level',
                description: 'A custom level created in the editor',
                difficulty: 'Beginner',
                bugs: [],
                obstacles: [],
                powerUps: [],
                playerStart: { x: 1, y: 6 }
            };
            
            this.playerPosition = { x: 1, y: 6 };
            
            // Update UI
            document.getElementById('level-name').value = this.currentLevel.name;
            document.getElementById('level-description').value = this.currentLevel.description;
            document.getElementById('level-difficulty').value = this.currentLevel.difficulty;
            
            this.renderGridObjects();
            this.updateStats();
            this.showMessage('Level cleared!', 'info');
        }
    }

    testLevel() {
        if (this.currentLevel.bugs.length === 0) {
            this.showMessage('Add some bugs to test the level!', 'error');
            return;
        }
        
        // Create a test instance of Room6
        const testGame = {
            roomCompleted: (message) => {
                this.showMessage('Level test completed! ' + message, 'success');
                this.exitTestMode();
            },
            gameOver: (message) => {
                this.showMessage('Level test failed: ' + message, 'error');
                this.exitTestMode();
            }
        };
        
        // Save current level as test data
        window.testLevelData = this.currentLevel;
        
        // Switch to test mode
        this.showMessage('Entering test mode...', 'info');
        setTimeout(() => {
            this.startTestMode(testGame);
        }, 1000);
    }

    startTestMode(testGame) {
        // Create test room instance
        this.testRoom = new Room6(testGame);
        
        // Override the level initialization
        this.testRoom.initializeLevel = () => {
            const level = window.testLevelData;
            this.testRoom.bugs = level.bugs.map(bug => ({
                ...bug,
                id: Date.now() + Math.random()
            }));
            this.testRoom.obstacles = [...level.obstacles];
            this.testRoom.powerUps = [...level.powerUps];
            this.testRoom.player.x = level.playerStart.x;
            this.testRoom.player.y = level.playerStart.y;
        };
        
        // Initialize and render test room
        this.testRoom.initializeLevel();
        this.testRoom.render();
        this.testRoom.setupGameGrid();
        this.testRoom.startTimer();
        
        // Add exit test mode button
        const container = document.getElementById('room-content');
        const exitButton = document.createElement('button');
        exitButton.id = 'exit-test-mode';
        exitButton.className = 'fixed top-4 right-4 bg-red-600 hover:bg-red-500 px-4 py-2 rounded z-50';
        exitButton.innerHTML = '<i class="bi bi-x-circle"></i> Exit Test Mode';
        exitButton.addEventListener('click', () => this.exitTestMode());
        
        document.body.appendChild(exitButton);
    }

    exitTestMode() {
        // Clean up test room
        if (this.testRoom) {
            this.testRoom.cleanup();
            this.testRoom = null;
        }
        
        // Remove exit button
        const exitButton = document.getElementById('exit-test-mode');
        if (exitButton) exitButton.remove();
        
        // Clean up test data
        delete window.testLevelData;
        
        // Return to editor
        this.init();
    }

    exportLevel() {
        const levelData = JSON.stringify(this.currentLevel, null, 2);
        const blob = new Blob([levelData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentLevel.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('Level exported!', 'success');
    }

    importLevel() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const levelData = JSON.parse(e.target.result);
                    
                    // Validate level data
                    if (!levelData.bugs || !levelData.obstacles || !levelData.powerUps) {
                        throw new Error('Invalid level format');
                    }
                    
                    this.currentLevel = levelData;
                    this.playerPosition = levelData.playerStart || { x: 1, y: 6 };
                    
                    // Update UI
                    document.getElementById('level-name').value = levelData.name || 'Imported Level';
                    document.getElementById('level-description').value = levelData.description || '';
                    document.getElementById('level-difficulty').value = levelData.difficulty || 'Beginner';
                    
                    this.renderGridObjects();
                    this.updateStats();
                    this.showMessage('Level imported successfully!', 'success');
                    
                } catch (error) {
                    this.showMessage('Failed to import level: Invalid format', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    updateSavedLevelsList() {
        const listContainer = document.getElementById('saved-levels-list');
        listContainer.innerHTML = this.renderSavedLevels();
        
        // Re-setup event listeners
        document.querySelectorAll('.load-level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.loadLevel(parseInt(btn.dataset.index));
            });
        });

        document.querySelectorAll('.delete-level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.deleteLevel(parseInt(btn.dataset.index));
            });
        });
    }

    loadSavedLevels() {
        const saved = localStorage.getItem('programmingCrisisLevels');
        return saved ? JSON.parse(saved) : [];
    }

    saveLevelsToStorage() {
        localStorage.setItem('programmingCrisisLevels', JSON.stringify(this.savedLevels));
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
}

// Make available globally
window.ProgrammingLevelEditor = ProgrammingLevelEditor;

// Function to start level editor
window.startLevelEditor = function() {
    const editor = new ProgrammingLevelEditor();
    editor.init();
};


export class LevelEditor {
    constructor(room) {
        this.room = room;
        this.isEditorMode = false;
        this.selectedTool = 'bug';
        this.selectedBugType = 'syntax_error';
        this.selectedObstacleType = 'wall';
        this.selectedPowerUpType = 'health_pack';
        this.customLevels = this.loadCustomLevels();
        this.currentEditingLevel = null;
        
        this.tools = {
            bug: { icon: '🐛', name: 'Bug' },
            obstacle: { icon: '🧱', name: 'Obstacle' },
            powerup: { icon: '💊', name: 'Power-up' },
            player: { icon: '🤖', name: 'Player Start' },
            eraser: { icon: '🗑️', name: 'Eraser' }
        };
        
        this.bugTypes = {
            syntax_error: { health: 30, color: '#dc2626' },
            type_error: { health: 25, color: '#f59e0b' },
            logic_error: { health: 40, color: '#8b5cf6' },
            runtime_error: { health: 50, color: '#ef4444' },
            memory_leak: { health: 60, color: '#06b6d4' },
            race_condition: { health: 70, color: '#10b981' },
            buffer_overflow: { health: 80, color: '#f97316' }
        };
        
        this.obstacleTypes = {
            wall: { color: '#6b7280', icon: '🧱' },
            firewall: { color: '#f59e0b', icon: '🔥' },
            encrypted_wall: { color: '#8b5cf6', icon: '🔐' }
        };
        
        this.powerUpTypes = {
            health_pack: { value: 25, color: '#10b981', icon: '💊' },
            energy_boost: { value: 20, color: '#3b82f6', icon: '⚡' },
            debug_tool: { value: 30, color: '#8b5cf6', icon: '🔧' },
            super_debug: { value: 50, color: '#f59e0b', icon: '⭐' }
        };
    }

    enterEditorMode() {
        this.isEditorMode = true;
        this.currentEditingLevel = {
            name: `Custom Level ${this.customLevels.length + 1}`,
            bugs: [],
            obstacles: [],
            powerUps: [],
            playerStart: { x: 1, y: 6 }
        };
        
        this.renderEditor();
        this.setupEditorGrid();
    }

    exitEditorMode() {
        this.isEditorMode = false;
        this.room.render();
        this.room.gridManager.setupGameGrid();
    }

    renderEditor() {
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="level-editor-container p-6 fade-in">
                <div class="text-center mb-6">
                    <i class="bi bi-pencil-square text-6xl text-blue-500 animate-pulse"></i>
                    <h2 class="text-3xl font-bold mt-4 text-blue-400">LEVEL EDITOR</h2>
                    <p class="text-gray-300 mt-2">Create custom debugging challenges!</p>
                </div>
                
                <div class="editor-controls grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <!-- Tool Palette -->
                    <div class="tool-palette bg-gray-800 p-4 rounded-lg">
                        <h3 class="text-lg font-bold text-white mb-3">🛠️ Tools</h3>
                        <div class="tools-grid grid grid-cols-3 gap-2">
                            ${Object.entries(this.tools).map(([key, tool]) => `
                                <button class="tool-btn ${this.selectedTool === key ? 'selected' : ''} 
                                       bg-gray-700 hover:bg-gray-600 p-3 rounded border-2 transition-colors"
                                       data-tool="${key}">
                                    <div class="text-2xl mb-1">${tool.icon}</div>
                                    <div class="text-xs">${tool.name}</div>
                                </button>
                            `).join('')}
                        </div>
                        
                        <!-- Sub-tool options -->
                        <div class="sub-tools mt-4">
                            <div id="bug-options" class="sub-tool-panel ${this.selectedTool === 'bug' ? '' : 'hidden'}">
                                <h4 class="text-sm font-bold text-gray-300 mb-2">Bug Types</h4>
                                <select id="bug-type-select" class="w-full bg-gray-700 text-white p-2 rounded">
                                    ${Object.entries(this.bugTypes).map(([key, bug]) => `
                                        <option value="${key}" ${this.selectedBugType === key ? 'selected' : ''}>
                                            ${key.replace('_', ' ')} (${bug.health} HP)
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div id="obstacle-options" class="sub-tool-panel ${this.selectedTool === 'obstacle' ? '' : 'hidden'}">
                                <h4 class="text-sm font-bold text-gray-300 mb-2">Obstacle Types</h4>
                                <select id="obstacle-type-select" class="w-full bg-gray-700 text-white p-2 rounded">
                                    ${Object.entries(this.obstacleTypes).map(([key, obstacle]) => `
                                        <option value="${key}" ${this.selectedObstacleType === key ? 'selected' : ''}>
                                            ${obstacle.icon} ${key.replace('_', ' ')}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div id="powerup-options" class="sub-tool-panel ${this.selectedTool === 'powerup' ? '' : 'hidden'}">
                                <h4 class="text-sm font-bold text-gray-300 mb-2">Power-up Types</h4>
                                <select id="powerup-type-select" class="w-full bg-gray-700 text-white p-2 rounded">
                                    ${Object.entries(this.powerUpTypes).map(([key, powerup]) => `
                                        <option value="${key}" ${this.selectedPowerUpType === key ? 'selected' : ''}>
                                            ${powerup.icon} ${key.replace('_', ' ')} (+${powerup.value})
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Level Info -->
                    <div class="level-info bg-gray-800 p-4 rounded-lg">
                        <h3 class="text-lg font-bold text-white mb-3">📝 Level Properties</h3>
                        <div class="space-y-3">
                            <div>
                                <label class="block text-sm font-bold text-gray-300 mb-1">Level Name</label>
                                <input id="level-name" type="text" value="${this.currentEditingLevel?.name || ''}" 
                                       class="w-full bg-gray-700 text-white p-2 rounded">
                            </div>
                            
                            <div class="level-stats grid grid-cols-2 gap-2 text-sm">
                                <div class="stat-item bg-gray-700 p-2 rounded text-center">
                                    <div class="text-red-400 font-bold" id="bug-count">0</div>
                                    <div class="text-gray-300">Bugs</div>
                                </div>
                                <div class="stat-item bg-gray-700 p-2 rounded text-center">
                                    <div class="text-gray-400 font-bold" id="obstacle-count">0</div>
                                    <div class="text-gray-300">Obstacles</div>
                                </div>
                                <div class="stat-item bg-gray-700 p-2 rounded text-center">
                                    <div class="text-green-400 font-bold" id="powerup-count">0</div>
                                    <div class="text-gray-300">Power-ups</div>
                                </div>
                                <div class="stat-item bg-gray-700 p-2 rounded text-center">
                                    <div class="text-blue-400 font-bold" id="difficulty-score">0</div>
                                    <div class="text-gray-300">Difficulty</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="editor-actions bg-gray-800 p-4 rounded-lg">
                        <h3 class="text-lg font-bold text-white mb-3">⚡ Actions</h3>
                        <div class="space-y-2">
                            <button id="clear-level" class="w-full bg-red-600 hover:bg-red-700 p-2 rounded transition-colors">
                                <i class="bi bi-trash"></i> Clear Level
                            </button>
                            <button id="test-level" class="w-full bg-green-600 hover:bg-green-700 p-2 rounded transition-colors">
                                <i class="bi bi-play"></i> Test Level
                            </button>
                            <button id="save-level" class="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded transition-colors">
                                <i class="bi bi-save"></i> Save Level
                            </button>
                            <button id="load-level" class="w-full bg-purple-600 hover:bg-purple-700 p-2 rounded transition-colors">
                                <i class="bi bi-folder-open"></i> Load Level
                            </button>
                            <button id="exit-editor" class="w-full bg-gray-600 hover:bg-gray-700 p-2 rounded transition-colors">
                                <i class="bi bi-x-circle"></i> Exit Editor
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Editor Grid -->
                <div class="editor-grid-container bg-gray-800 rounded-lg p-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-white">🎨 Level Design Canvas</h3>
                        <div class="grid-info text-sm text-gray-400">
                            Click to place objects • Right-click to remove
                        </div>
                    </div>
                    
                    <div id="editor-game-grid" class="bg-black rounded border-2 border-gray-600 relative mx-auto" 
                         style="width: ${this.room.gridManager.gridWidth * this.room.gridManager.cellSize}px; 
                                height: ${this.room.gridManager.gridHeight * this.room.gridManager.cellSize}px;">
                        <!-- Editor grid will be rendered here -->
                    </div>
                    
                    <div class="grid-legend mt-2 text-sm text-gray-400 text-center">
                        <span class="mr-4">🤖 = Player Start</span>
                        <span class="mr-4">🐛 = Bug</span>
                        <span class="mr-4">🧱 = Wall</span>
                        <span class="mr-4">🔥 = Firewall</span>
                        <span class="mr-4">💊 = Power-up</span>
                    </div>
                </div>
            </div>
        `;
        
        this.setupEditorEventListeners();
    }

    setupEditorGrid() {
        const editorGrid = document.getElementById('editor-game-grid');
        editorGrid.innerHTML = '';
        
        // Create grid cells
        for (let y = 0; y < this.room.gridManager.gridHeight; y++) {
            for (let x = 0; x < this.room.gridManager.gridWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'editor-cell absolute border border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors';
                cell.style.left = `${x * this.room.gridManager.cellSize}px`;
                cell.style.top = `${y * this.room.gridManager.cellSize}px`;
                cell.style.width = `${this.room.gridManager.cellSize}px`;
                cell.style.height = `${this.room.gridManager.cellSize}px`;
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // Add click handlers
                cell.addEventListener('click', (e) => this.handleCellClick(e, x, y));
                cell.addEventListener('contextmenu', (e) => this.handleCellRightClick(e, x, y));
                
                editorGrid.appendChild(cell);
            }
        }
        
        // Render initial player position
        this.renderPlayerStart();
        this.updateLevelStats();
    }

    handleCellClick(event, x, y) {
        event.preventDefault();
        
        switch (this.selectedTool) {
            case 'bug':
                this.placeBug(x, y);
                break;
            case 'obstacle':
                this.placeObstacle(x, y);
                break;
            case 'powerup':
                this.placePowerUp(x, y);
                break;
            case 'player':
                this.setPlayerStart(x, y);
                break;
            case 'eraser':
                this.eraseObject(x, y);
                break;
        }
        
        this.renderEditorObjects();
        this.updateLevelStats();
    }

    handleCellRightClick(event, x, y) {
        event.preventDefault();
        this.eraseObject(x, y);
        this.renderEditorObjects();
        this.updateLevelStats();
    }

    placeBug(x, y) {
        // Remove existing object at position
        this.eraseObject(x, y);
        
        const bugType = this.bugTypes[this.selectedBugType];
        const newBug = {
            x, y,
            type: this.selectedBugType,
            health: bugType.health,
            id: Date.now() + Math.random()
        };
        
        this.currentEditingLevel.bugs.push(newBug);
    }

    placeObstacle(x, y) {
        // Remove existing object at position
        this.eraseObject(x, y);
        
        const newObstacle = {
            x, y,
            type: this.selectedObstacleType
        };
        
        this.currentEditingLevel.obstacles.push(newObstacle);
    }

    placePowerUp(x, y) {
        // Remove existing object at position
        this.eraseObject(x, y);
        
        const powerUpType = this.powerUpTypes[this.selectedPowerUpType];
        const newPowerUp = {
            x, y,
            type: this.selectedPowerUpType,
            value: powerUpType.value
        };
        
        this.currentEditingLevel.powerUps.push(newPowerUp);
    }

    setPlayerStart(x, y) {
        this.currentEditingLevel.playerStart = { x, y };
        this.renderPlayerStart();
    }

    eraseObject(x, y) {
        // Remove bugs at position
        this.currentEditingLevel.bugs = this.currentEditingLevel.bugs.filter(
            bug => !(bug.x === x && bug.y === y)
        );
        
        // Remove obstacles at position
        this.currentEditingLevel.obstacles = this.currentEditingLevel.obstacles.filter(
            obstacle => !(obstacle.x === x && obstacle.y === y)
        );
        
        // Remove power-ups at position
        this.currentEditingLevel.powerUps = this.currentEditingLevel.powerUps.filter(
            powerUp => !(powerUp.x === x && powerUp.y === y)
        );
    }

    renderPlayerStart() {
        // Remove existing player element
        document.querySelectorAll('.editor-player').forEach(el => el.remove());
        
        const playerElement = document.createElement('div');
        playerElement.className = 'editor-player absolute flex items-center justify-center text-2xl font-bold z-10 pointer-events-none';
        playerElement.style.left = `${this.currentEditingLevel.playerStart.x * this.room.gridManager.cellSize}px`;
        playerElement.style.top = `${this.currentEditingLevel.playerStart.y * this.room.gridManager.cellSize}px`;
        playerElement.style.width = `${this.room.gridManager.cellSize}px`;
        playerElement.style.height = `${this.room.gridManager.cellSize}px`;
        playerElement.style.backgroundColor = '#3b82f6';
        playerElement.style.border = '2px solid #1e40af';
        playerElement.style.borderRadius = '8px';
        playerElement.innerHTML = '🤖';
        
        document.getElementById('editor-game-grid').appendChild(playerElement);
    }

    renderEditorObjects() {
        // Clear existing objects
        document.querySelectorAll('.editor-object').forEach(el => el.remove());
        
        const editorGrid = document.getElementById('editor-game-grid');
        
        // Render bugs
        this.currentEditingLevel.bugs.forEach(bug => {
            const element = document.createElement('div');
            element.className = 'editor-object bug absolute flex items-center justify-center text-2xl z-5 pointer-events-none';
            element.style.left = `${bug.x * this.room.gridManager.cellSize}px`;
            element.style.top = `${bug.y * this.room.gridManager.cellSize}px`;
            element.style.width = `${this.room.gridManager.cellSize}px`;
            element.style.height = `${this.room.gridManager.cellSize}px`;
            element.style.backgroundColor = this.bugTypes[bug.type].color;
            element.style.border = '2px solid #991b1b';
            element.style.borderRadius = '8px';
            element.innerHTML = '🐛';
            element.title = `${bug.type} (HP: ${bug.health})`;
            editorGrid.appendChild(element);
        });
        
        // Render obstacles
        this.currentEditingLevel.obstacles.forEach(obstacle => {
            const element = document.createElement('div');
            element.className = 'editor-object obstacle absolute flex items-center justify-center text-2xl z-5 pointer-events-none';
            element.style.left = `${obstacle.x * this.room.gridManager.cellSize}px`;
            element.style.top = `${obstacle.y * this.room.gridManager.cellSize}px`;
            element.style.width = `${this.room.gridManager.cellSize}px`;
            element.style.height = `${this.room.gridManager.cellSize}px`;
            element.style.backgroundColor = this.obstacleTypes[obstacle.type].color;
            element.style.border = '2px solid #374151';
            element.style.borderRadius = '4px';
            element.innerHTML = this.obstacleTypes[obstacle.type].icon;
            editorGrid.appendChild(element);
        });
        
        // Render power-ups
        this.currentEditingLevel.powerUps.forEach(powerUp => {
            const element = document.createElement('div');
            element.className = 'editor-object powerup absolute flex items-center justify-center text-2xl z-5 pointer-events-none';
            element.style.left = `${powerUp.x * this.room.gridManager.cellSize}px`;
            element.style.top = `${powerUp.y * this.room.gridManager.cellSize}px`;
            element.style.width = `${this.room.gridManager.cellSize}px`;
            element.style.height = `${this.room.gridManager.cellSize}px`;
            element.style.backgroundColor = this.powerUpTypes[powerUp.type].color;
            element.style.border = '2px solid #047857';
            element.style.borderRadius = '50%';
            element.innerHTML = this.powerUpTypes[powerUp.type].icon;
            element.title = `${powerUp.type} (+${powerUp.value})`;
            editorGrid.appendChild(element);
        });
    }

    updateLevelStats() {
        document.getElementById('bug-count').textContent = this.currentEditingLevel.bugs.length;
        document.getElementById('obstacle-count').textContent = this.currentEditingLevel.obstacles.length;
        document.getElementById('powerup-count').textContent = this.currentEditingLevel.powerUps.length;
        
        // Calculate difficulty score
        const difficultyScore = this.calculateDifficultyScore();
        document.getElementById('difficulty-score').textContent = difficultyScore;
    }

    calculateDifficultyScore() {
        let score = 0;
        
        // Add points for bugs based on their health
        this.currentEditingLevel.bugs.forEach(bug => {
            score += this.bugTypes[bug.type].health;
        });
        
        // Add points for obstacles
        score += this.currentEditingLevel.obstacles.length * 10;
        
        // Subtract points for power-ups
        this.currentEditingLevel.powerUps.forEach(powerUp => {
            score -= this.powerUpTypes[powerUp.type].value / 2;
        });
        
        return Math.max(0, Math.round(score));
    }

    setupEditorEventListeners() {
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.currentTarget.dataset.tool;
                this.selectTool(tool);
            });
        });
        
        // Sub-tool selection
        document.getElementById('bug-type-select')?.addEventListener('change', (e) => {
            this.selectedBugType = e.target.value;
        });
        
        document.getElementById('obstacle-type-select')?.addEventListener('change', (e) => {
            this.selectedObstacleType = e.target.value;
        });
        
        document.getElementById('powerup-type-select')?.addEventListener('change', (e) => {
            this.selectedPowerUpType = e.target.value;
        });
        
        // Action buttons
        document.getElementById('clear-level')?.addEventListener('click', () => {
            this.clearLevel();
        });
        
        document.getElementById('test-level')?.addEventListener('click', () => {
            this.testLevel();
        });
        
        document.getElementById('save-level')?.addEventListener('click', () => {
            this.saveLevel();
        });
        
        document.getElementById('load-level')?.addEventListener('click', () => {
            this.showLoadLevelModal();
        });
        
        document.getElementById('exit-editor')?.addEventListener('click', () => {
            this.exitEditorMode();
        });
        
        // Level name input
        document.getElementById('level-name')?.addEventListener('input', (e) => {
            this.currentEditingLevel.name = e.target.value;
        });
    }

    selectTool(tool) {
        this.selectedTool = tool;
        
        // Update tool button appearances
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.tool === tool);
            if (btn.dataset.tool === tool) {
                btn.style.borderColor = '#3b82f6';
                btn.style.backgroundColor = '#1e40af';
            } else {
                btn.style.borderColor = '#6b7280';
                btn.style.backgroundColor = '#374151';
            }
        });
        
        // Show/hide sub-tool panels
        document.querySelectorAll('.sub-tool-panel').forEach(panel => {
            panel.classList.add('hidden');
        });
        
        const activePanel = document.getElementById(`${tool}-options`);
        if (activePanel) {
            activePanel.classList.remove('hidden');
        }
    }

    clearLevel() {
        if (confirm('Are you sure you want to clear the entire level?')) {
            this.currentEditingLevel.bugs = [];
            this.currentEditingLevel.obstacles = [];
            this.currentEditingLevel.powerUps = [];
            this.currentEditingLevel.playerStart = { x: 1, y: 6 };
            
            this.renderPlayerStart();
            this.renderEditorObjects();
            this.updateLevelStats();
        }
    }

    testLevel() {
        if (this.currentEditingLevel.bugs.length === 0) {
            alert('Add at least one bug to test the level!');
            return;
        }
        
        // Apply the custom level to the room
        this.room.bugs = [...this.currentEditingLevel.bugs];
        this.room.obstacles = [...this.currentEditingLevel.obstacles];
        this.room.powerUps = [...this.currentEditingLevel.powerUps];
        this.room.player.x = this.currentEditingLevel.playerStart.x;
        this.room.player.y = this.currentEditingLevel.playerStart.y;
        this.room.player.health = 100;
        this.room.player.energy = 50;
        this.room.player.inventory = [];
        
        // Exit editor and start test
        this.isEditorMode = false;
        this.room.render();
        this.room.gridManager.setupGameGrid();
        
        // Add a test mode indicator
        const testIndicator = document.createElement('div');
        testIndicator.className = 'fixed top-4 left-4 bg-yellow-600 text-white p-2 rounded z-50';
        testIndicator.innerHTML = '🧪 TEST MODE - Press ESC to return to editor';
        document.body.appendChild(testIndicator);
        
        // Add escape key handler to return to editor
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', escapeHandler);
                testIndicator.remove();
                this.enterEditorMode();
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    saveLevel() {
        if (!this.currentEditingLevel.name.trim()) {
            alert('Please enter a level name!');
            return;
        }
        
        if (this.currentEditingLevel.bugs.length === 0) {
            alert('Add at least one bug before saving!');
            return;
        }
        
        const levelData = {
            ...this.currentEditingLevel,
            created: new Date().toISOString(),
            difficulty: this.calculateDifficultyScore()
        };
        
        this.customLevels.push(levelData);
        this.saveCustomLevels();
        
        alert(`Level "${levelData.name}" saved successfully!`);
    }

    showLoadLevelModal() {
        if (this.customLevels.length === 0) {
            alert('No custom levels found! Create and save a level first.');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 border-2 border-gray-600 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-white">📁 Load Custom Level</h2>
                    <button id="close-load-modal" class="text-gray-400 hover:text-white text-2xl">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>
                
                <div class="custom-levels-list space-y-2">
                    ${this.customLevels.map((level, index) => `
                        <div class="level-item bg-gray-700 p-3 rounded hover:bg-gray-600 cursor-pointer transition-colors"
                             data-index="${index}">
                            <div class="flex justify-between items-center">
                                <div>
                                    <h3 class="font-bold text-white">${level.name}</h3>
                                    <p class="text-sm text-gray-300">
                                        🐛 ${level.bugs.length} bugs • 
                                        🧱 ${level.obstacles.length} obstacles • 
                                        💊 ${level.powerUps.length} power-ups
                                    </p>
                                    <p class="text-xs text-gray-400">
                                        Difficulty: ${level.difficulty} • 
                                        Created: ${new Date(level.created).toLocaleDateString()}
                                    </p>
                                </div>
                                <button class="delete-level bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm"
                                        data-index="${index}">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners - Fix: Use querySelector instead of getElementById on modal
        const closeBtn = modal.querySelector('#close-load-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });
        }
        
        modal.querySelectorAll('.level-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-level')) return;
                
                const index = parseInt(item.dataset.index);
                this.loadLevel(this.customLevels[index]);
                modal.remove();
            });
        });
        
        modal.querySelectorAll('.delete-level').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                if (confirm(`Delete level "${this.customLevels[index].name}"?`)) {
                    this.customLevels.splice(index, 1);
                    this.saveCustomLevels();
                    modal.remove();
                    this.showLoadLevelModal();
                }
            });
        });
    }

    loadLevel(levelData) {
        this.currentEditingLevel = {
            name: levelData.name,
            bugs: [...levelData.bugs],
            obstacles: [...levelData.obstacles],
            powerUps: [...levelData.powerUps],
            playerStart: { ...levelData.playerStart }
        };
        
        document.getElementById('level-name').value = this.currentEditingLevel.name;
        this.renderPlayerStart();
        this.renderEditorObjects();
        this.updateLevelStats();
    }

    loadCustomLevels() {
        const saved = localStorage.getItem('programming-crisis-custom-levels');
        return saved ? JSON.parse(saved) : [];
    }

    saveCustomLevels() {
        localStorage.setItem('programming-crisis-custom-levels', JSON.stringify(this.customLevels));
    }

    getCustomLevels() {
        return this.customLevels;
    }
}
