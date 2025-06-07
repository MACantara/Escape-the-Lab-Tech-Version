export class ProgrammingCrisisUI {
    constructor(room) {
        this.room = room;
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
                
                <!-- Add level editor button -->
                <div class="text-center mb-4">
                    <button id="open-level-editor" class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors">
                        <i class="bi bi-pencil-square"></i> Level Editor
                    </button>
                </div>
                
                ${this.renderStatusPanel()}
                ${this.renderGameContainer()}
                ${this.renderControlsPanel()}
            </div>
        `;

        this.setupEventListeners();
    }

    renderStatusPanel() {
        return `
            <div class="status-panel grid grid-cols-5 gap-3 mb-4">
                <div class="status-card bg-green-900 p-3 rounded text-center">
                    <i class="bi bi-heart text-green-400 text-xl"></i>
                    <p class="text-xs text-green-200">Health</p>
                    <p id="player-health" class="text-lg font-bold text-green-100">${this.room.player.health}</p>
                </div>
                <div class="status-card bg-blue-900 p-3 rounded text-center">
                    <i class="bi bi-lightning text-blue-400 text-xl"></i>
                    <p class="text-xs text-blue-200">Energy</p>
                    <p id="player-energy" class="text-lg font-bold text-blue-100">${this.room.player.energy}</p>
                </div>
                <div class="status-card bg-purple-900 p-3 rounded text-center">
                    <i class="bi bi-bug text-purple-400 text-xl"></i>
                    <p class="text-xs text-purple-200">Bugs Fixed</p>
                    <p id="bugs-defeated" class="text-lg font-bold text-purple-100">${this.room.bugsDefeated}</p>
                </div>
                <div class="status-card bg-yellow-900 p-3 rounded text-center">
                    <i class="bi bi-layers text-yellow-400 text-xl"></i>
                    <p class="text-xs text-yellow-200">Level</p>
                    <p id="current-level" class="text-lg font-bold text-yellow-100">${this.room.currentLevel}/${this.room.maxLevel}</p>
                </div>
                <div class="status-card bg-red-900 p-3 rounded text-center">
                    <i class="bi bi-clock text-red-400 text-xl"></i>
                    <p class="text-xs text-red-200">Time</p>
                    <p id="time-remaining" class="text-lg font-bold text-red-100">${Math.floor(this.room.timeRemaining / 60)}m</p>
                </div>
            </div>
        `;
    }

    renderGameContainer() {
        return `
            <div class="game-container bg-gray-800 rounded-lg p-4 mb-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-white">🎮 Debug Grid - Level ${this.room.currentLevel}</h3>
                    <div class="execution-status">
                        <span class="text-gray-300">Status: </span>
                        <span id="execution-status" class="font-bold ${this.room.codeExecutor.isExecuting ? 'text-yellow-400' : 'text-green-400'}">
                            ${this.room.codeExecutor.isExecuting ? 'EXECUTING' : 'READY'}
                        </span>
                    </div>
                </div>
                
                <div id="game-grid" class="bg-black rounded border-2 border-gray-600 relative" 
                     style="width: ${this.room.gridManager.gridWidth * this.room.gridManager.cellSize}px; height: ${this.room.gridManager.gridHeight * this.room.gridManager.cellSize}px; margin: 0 auto;">
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
        `;
    }

    renderControlsPanel() {
        return `
            <div class="controls-panel grid grid-cols-2 gap-4">
                <div class="code-editor bg-gray-700 p-4 rounded">
                    <h4 class="font-bold text-white mb-3">💻 Code Editor</h4>
                    <div class="mb-3">
                        <textarea id="code-input" 
                                 class="w-full h-40 bg-black text-green-400 font-mono p-3 rounded border border-gray-500 text-sm"
                                 placeholder="# Write Python-like commands with loops and conditions:
# Basic commands:
# move('up'), move('down'), move('left'), move('right')
# attack('direction'), scan(), wait(), collect()
# 
# Loops (Python syntax):
# for i in range(3):
#     move('right')
#     scan()
# 
# Conditions (Python syntax):
# if has_energy():
#     attack('up')
# elif bug_nearby('left'):
#     attack('left')
# else:
#     wait()
#
# While loops:
# while can_move('right'):
#     move('right')
#
# Example multi-line program:
# for i in range(2):
#     if can_move('right'):
#         move('right')
#     if bug_nearby('up'):
#         attack('up')
#     else:
#         wait()"></textarea>
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
                        <button id="step-debug" class="bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded transition-colors">
                            <i class="bi bi-skip-forward"></i> Step
                        </button>
                    </div>
                    <div class="text-xs text-gray-400 mt-2">
                        💡 Press Tab to indent, Shift+Tab to unindent, Ctrl+Enter to execute
                    </div>
                </div>

                <div class="game-info bg-gray-700 p-4 rounded">
                    <h4 class="font-bold text-white mb-3">📋 Enhanced Command Reference</h4>
                    <div class="commands-list text-sm text-gray-300 space-y-1 mb-4 max-h-48 overflow-y-auto">
                        <div class="font-bold text-blue-400 mb-2">Basic Commands:</div>
                        <div><code class="text-green-400">move('direction')</code> - Move in direction (2 energy)</div>
                        <div><code class="text-red-400">attack('direction')</code> - Attack adjacent bug (5 energy)</div>
                        <div><code class="text-blue-400">scan()</code> - Reveal nearby info (3 energy)</div>
                        <div><code class="text-yellow-400">use_item('item')</code> - Use inventory item</div>
                        <div><code class="text-purple-400">wait()</code> - Skip turn, gain 5 energy</div>
                        <div><code class="text-cyan-400">collect()</code> - Pick up items at current position</div>
                        
                        <div class="font-bold text-orange-400 mb-2 mt-3">Conditionals (Python syntax):</div>
                        <div><code class="text-orange-400">if condition:</code> - Execute if true</div>
                        <div><code class="text-orange-400">elif condition:</code> - Else if condition</div>
                        <div><code class="text-orange-400">else:</code> - Execute if all above false</div>
                        <div><code class="text-green-300">has_energy()</code> - Check if energy > 10</div>
                        <div><code class="text-green-300">bug_nearby('dir')</code> - Check for bug in direction</div>
                        <div><code class="text-green-300">can_move('dir')</code> - Check if movement possible</div>
                        <div><code class="text-green-300">health_low()</code> - Check if health < 30</div>
                        <div><code class="text-green-300">energy_low()</code> - Check if energy < 15</div>
                        
                        <div class="font-bold text-pink-400 mb-2 mt-3">Loops (Python syntax):</div>
                        <div><code class="text-pink-400">for i in range(n):</code> - Repeat n times</div>
                        <div><code class="text-pink-400">while condition:</code> - Repeat while true</div>
                    </div>
                    
                    <div class="execution-queue bg-gray-800 p-3 rounded mb-3">
                        <h5 class="font-bold text-blue-400 mb-2">⚙️ Execution Queue</h5>
                        <div id="queue-display" class="text-sm text-gray-300 max-h-16 overflow-y-auto">
                            <div class="text-gray-500">No commands queued</div>
                        </div>
                    </div>
                    
                    <div class="inventory bg-gray-800 p-3 rounded">
                        <h5 class="font-bold text-purple-400 mb-2">🎒 Inventory</h5>
                        <div id="inventory-display" class="text-sm text-gray-300">
                            <div class="text-gray-500">Empty</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('execute-code')?.addEventListener('click', () => {
            this.room.codeExecutor.executeCode();
        });

        document.getElementById('clear-code')?.addEventListener('click', () => {
            document.getElementById('code-input').value = '';
        });

        document.getElementById('stop-execution')?.addEventListener('click', () => {
            this.room.codeExecutor.stopExecution();
        });

        document.getElementById('step-debug')?.addEventListener('click', () => {
            this.room.codeExecutor.stepDebug();
        });

        // Enhanced code input event listeners
        const codeInput = document.getElementById('code-input');
        if (codeInput) {
            // Tab functionality for indentation
            codeInput.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    
                    const start = codeInput.selectionStart;
                    const end = codeInput.selectionEnd;
                    const value = codeInput.value;
                    
                    if (e.shiftKey) {
                        // Shift+Tab: Remove indentation
                        this.handleUnindent(codeInput, start, end);
                    } else {
                        // Tab: Add indentation
                        this.handleIndent(codeInput, start, end);
                    }
                } else if (e.key === 'Enter' && e.ctrlKey) {
                    // Ctrl+Enter: Execute code
                    e.preventDefault();
                    this.room.codeExecutor.executeCode();
                } else if (e.key === 'Enter') {
                    // Auto-indentation after colon
                    this.handleAutoIndent(e, codeInput);
                }
            });
        }
        
        // Level editor button
        document.getElementById('open-level-editor')?.addEventListener('click', () => {
            this.room.levelEditor.enterEditorMode();
        });
    }

    handleIndent(codeInput, start, end) {
        const value = codeInput.value;
        const indent = '    '; // 4 spaces
        
        if (start === end) {
            // No selection, just insert tab at cursor
            const newValue = value.substring(0, start) + indent + value.substring(end);
            codeInput.value = newValue;
            codeInput.selectionStart = codeInput.selectionEnd = start + indent.length;
        } else {
            // Selection exists, indent all selected lines
            const lines = value.split('\n');
            const startLine = value.substring(0, start).split('\n').length - 1;
            const endLine = value.substring(0, end).split('\n').length - 1;
            
            for (let i = startLine; i <= endLine; i++) {
                lines[i] = indent + lines[i];
            }
            
            codeInput.value = lines.join('\n');
            codeInput.selectionStart = start + indent.length;
            codeInput.selectionEnd = end + (indent.length * (endLine - startLine + 1));
        }
    }

    handleUnindent(codeInput, start, end) {
        const value = codeInput.value;
        const lines = value.split('\n');
        const startLine = value.substring(0, start).split('\n').length - 1;
        const endLine = value.substring(0, end).split('\n').length - 1;
        
        let removedChars = 0;
        for (let i = startLine; i <= endLine; i++) {
            if (lines[i].startsWith('    ')) {
                lines[i] = lines[i].substring(4);
                removedChars += 4;
            } else if (lines[i].startsWith('\t')) {
                lines[i] = lines[i].substring(1);
                removedChars += 1;
            }
        }
        
        codeInput.value = lines.join('\n');
        codeInput.selectionStart = Math.max(0, start - 4);
        codeInput.selectionEnd = Math.max(0, end - removedChars);
    }

    handleAutoIndent(e, codeInput) {
        const start = codeInput.selectionStart;
        const value = codeInput.value;
        const currentLine = value.substring(0, start).split('\n').pop();
        
        // Check if current line ends with colon (for if/for/while statements)
        if (currentLine.trim().endsWith(':')) {
            // Let the Enter key work normally first
            setTimeout(() => {
                const newStart = codeInput.selectionStart;
                const indent = this.getIndentLevel(currentLine) + '    '; // Add 4 spaces
                const newValue = codeInput.value.substring(0, newStart) + indent + codeInput.value.substring(newStart);
                codeInput.value = newValue;
                codeInput.selectionStart = codeInput.selectionEnd = newStart + indent.length;
            }, 0);
        }
    }

    getIndentLevel(line) {
        const match = line.match(/^(\s*)/);
        return match ? match[1] : '';
    }

    renderSuccessScreen() {
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="system-success text-center p-8">
                <i class="bi bi-check-circle text-8xl text-green-400 mb-4 animate-bounce"></i>
                <h2 class="text-3xl font-bold text-green-400 mb-4">SYSTEM DEBUGGED!</h2>
                
                <div class="final-stats grid grid-cols-4 gap-4 mb-6">
                    <div class="bg-green-800 p-3 rounded">
                        <p class="text-green-200">Player Health</p>
                        <p class="text-xl font-bold text-green-400">${this.room.player.health}%</p>
                        <p class="text-xs text-green-300">✓ Survived</p>
                    </div>
                    <div class="bg-purple-800 p-3 rounded">
                        <p class="text-purple-200">Bugs Fixed</p>
                        <p class="text-xl font-bold text-purple-400">${this.room.bugsDefeated}</p>
                        <p class="text-xs text-purple-300">✓ Debugging Master</p>
                    </div>
                    <div class="bg-blue-800 p-3 rounded">
                        <p class="text-blue-200">Levels Completed</p>
                        <p class="text-xl font-bold text-blue-400">${this.room.maxLevel}</p>
                        <p class="text-xs text-blue-300">✓ Full System</p>
                    </div>
                    <div class="bg-yellow-800 p-3 rounded">
                        <p class="text-yellow-200">Time Used</p>
                        <p class="text-xl font-bold text-yellow-400">${Math.floor((600 - this.room.timeRemaining) / 60)}m</p>
                        <p class="text-xs text-yellow-300">✓ Efficient</p>
                    </div>
                </div>
                
                <div class="debug-report bg-gray-800 p-4 rounded mb-4">
                    <h4 class="font-bold text-gray-200 mb-2">🐛 System Debug Report</h4>
                    <div class="text-left text-sm text-gray-300">
                        <p>✅ All ${this.room.bugsDefeated} critical bugs successfully eliminated</p>
                        <p>✅ System traversed using programmatic movement controls</p>
                        <p>✅ Python-like command syntax with loops and conditionals mastered</p>
                        <p>✅ Strategic debugging approach with resource management</p>
                        <p>✅ All ${this.room.maxLevel} system levels debugged and stabilized</p>
                        <p>✅ Programming crisis resolved through advanced code-based problem solving</p>
                    </div>
                </div>
            </div>
        `;
    }

    updateDisplay() {
        // Check if elements exist before updating them
        const playerHealth = document.getElementById('player-health');
        const playerEnergy = document.getElementById('player-energy');
        const bugsDefeated = document.getElementById('bugs-defeated');
        const currentLevel = document.getElementById('current-level');
        const timeRemaining = document.getElementById('time-remaining');
        
        if (playerHealth) playerHealth.textContent = this.room.player.health;
        if (playerEnergy) playerEnergy.textContent = this.room.player.energy;
        if (bugsDefeated) bugsDefeated.textContent = this.room.bugsDefeated;
        if (currentLevel) currentLevel.textContent = `${this.room.currentLevel}/${this.room.maxLevel}`;
        if (timeRemaining) timeRemaining.textContent = `${Math.floor(this.room.timeRemaining / 60)}m`;
        
        this.updateInventoryDisplay();
    }

    updateInventoryDisplay() {
        const inventoryDisplay = document.getElementById('inventory-display');
        if (inventoryDisplay) {
            if (this.room.player.inventory.length > 0) {
                inventoryDisplay.innerHTML = this.room.player.inventory.map(item => 
                    `<div class="text-green-300">${item.type} ${item.value ? `(+${item.value})` : ''}</div>`
                ).join('');
            } else {
                inventoryDisplay.innerHTML = '<div class="text-gray-500">Empty</div>';
            }
        }
    }
}
