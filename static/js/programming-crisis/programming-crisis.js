import { GridManager } from './grid-manager.js';
import { CodeExecutor } from './code-executor.js';
import { PlayerActions } from './player-actions.js';
import { LevelGenerator } from './level-generator.js';

class Room6 {
    constructor(game) {
        this.game = game;
        
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
        
        // Initialize managers
        this.gridManager = new GridManager(this);
        this.codeExecutor = new CodeExecutor(this);
        this.playerActions = new PlayerActions(this);
        this.levelGenerator = new LevelGenerator(this);
    }

    async init() {
        const response = await fetch('data/programming-crisis.json');
        this.data = await response.json();
        this.levelGenerator.initializeLevel();
        this.render();
        this.gridManager.setupGameGrid();
        this.startTimer();
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
                            <span id="execution-status" class="font-bold ${this.codeExecutor.isExecuting ? 'text-yellow-400' : 'text-green-400'}">
                                ${this.codeExecutor.isExecuting ? 'EXECUTING' : 'READY'}
                            </span>
                        </div>
                    </div>
                    
                    <div id="game-grid" class="bg-black rounded border-2 border-gray-600 relative" 
                         style="width: ${this.gridManager.gridWidth * this.gridManager.cellSize}px; height: ${this.gridManager.gridHeight * this.gridManager.cellSize}px; margin: 0 auto;">
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
            this.codeExecutor.executeCode();
        });

        document.getElementById('clear-code')?.addEventListener('click', () => {
            document.getElementById('code-input').value = '';
        });

        document.getElementById('stop-execution')?.addEventListener('click', () => {
            this.codeExecutor.stopExecution();
        });

        // Allow enter to execute single line
        document.getElementById('code-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                this.codeExecutor.executeCode();
            }
        });
    }

    levelComplete() {
        this.codeExecutor.stopExecution();
        
        if (this.currentLevel >= this.maxLevel) {
            this.systemStabilized();
        } else {
            this.currentLevel++;
            this.showMessage(`Level ${this.currentLevel - 1} complete! Advancing to level ${this.currentLevel}...`, 'success');
            
            setTimeout(() => {
                this.levelGenerator.initializeLevel();
                this.render();
                this.gridManager.setupGameGrid();
            }, 2000);
        }
    }

    updateDisplay() {
        document.getElementById('player-health').textContent = this.player.health;
        document.getElementById('player-energy').textContent = this.player.energy;
        document.getElementById('bugs-defeated').textContent = this.bugsDefeated;
        document.getElementById('current-level').textContent = `${this.currentLevel}/${this.maxLevel}`;
        document.getElementById('time-remaining').textContent = `${Math.floor(this.timeRemaining / 60)}m`;
        
        this.codeExecutor.updateExecutionDisplay();
        this.updateInventoryDisplay();
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
        this.codeExecutor.stopExecution();
        
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
        this.codeExecutor.stopExecution();
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
        this.codeExecutor.stopExecution();
    }
}

// Register the class globally
window.Room6 = Room6;
