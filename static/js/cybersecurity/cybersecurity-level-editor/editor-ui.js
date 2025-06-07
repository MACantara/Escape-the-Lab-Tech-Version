export class EditorUI {
    constructor(editorCore) {
        this.editor = editorCore;
        this.room = editorCore.room;
    }

    renderEditor() {
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="editor-container p-6 fade-in">
                <div class="text-center mb-6">
                    <i class="bi bi-tools text-6xl text-blue-500 animate-pulse"></i>
                    <h2 class="text-3xl font-bold mt-4 text-blue-400">CYBER DEFENSE LEVEL EDITOR</h2>
                    <p class="text-gray-300 mt-2">Design custom tower defense scenarios</p>
                </div>
                
                ${this.renderEditorHeader()}
                ${this.renderMainEditor()}
                ${this.renderEditorControls()}
            </div>
        `;

        this.setupEventListeners();
    }

    renderEditorHeader() {
        return `
            <div class="editor-header grid grid-cols-3 gap-4 mb-4">
                <div class="level-info bg-gray-700 p-3 rounded">
                    <h4 class="font-bold text-green-400 mb-2">📊 Level Status</h4>
                    <div id="editor-status" class="text-sm text-gray-300">
                        <div>Path Points: <span class="text-yellow-400" id="path-count">0</span></div>
                        <div>Spawn Points: <span class="text-green-400" id="spawn-count">0</span></div>
                        <div>Objectives: <span class="text-red-400" id="objective-count">0</span></div>
                        <div id="validation-status" class="text-red-400 mt-1"></div>
                    </div>
                </div>
                
                <div class="editor-tools bg-gray-700 p-3 rounded">
                    <h4 class="font-bold text-blue-400 mb-2">🔧 Editor Tools</h4>
                    <div class="grid grid-cols-2 gap-1">
                        <button class="tool-btn active" data-tool="path">📍 Path</button>
                        <button class="tool-btn" data-tool="spawn">🚀 Spawn</button>
                        <button class="tool-btn" data-tool="objective">🎯 Goal</button>
                        <button class="tool-btn" data-tool="erase">🗑️ Erase</button>
                    </div>
                </div>
                
                <div class="quick-actions bg-gray-700 p-3 rounded">
                    <h4 class="font-bold text-purple-400 mb-2">⚡ Quick Actions</h4>
                    <div class="space-y-1">
                        <button id="clear-level" class="w-full p-1 rounded bg-red-600 hover:bg-red-500 text-xs">Clear All</button>
                        <button id="test-level" class="w-full p-1 rounded bg-green-600 hover:bg-green-500 text-xs">Test Level</button>
                        <button id="save-level" class="w-full p-1 rounded bg-blue-600 hover:bg-blue-500 text-xs">Save Level</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderMainEditor() {
        return `
            <div class="main-editor grid grid-cols-3 gap-4 mb-4">
                <div class="editor-canvas-container col-span-2 bg-gray-800 rounded-lg p-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-white">🎮 Level Designer</h3>
                        <div class="editor-mode">
                            <span class="text-gray-300">Mode: </span>
                            <span id="current-tool" class="font-bold text-blue-400">Path</span>
                        </div>
                    </div>
                    
                    <div id="defense-canvas" class="bg-black rounded border-2 border-blue-600 relative overflow-hidden" 
                         style="width: 640px; height: 400px; margin: 0 auto;">
                        <!-- Editor grid will be rendered here -->
                    </div>
                </div>
                
                <div class="editor-settings bg-gray-800 rounded-lg p-4">
                    <h3 class="text-xl font-bold text-white mb-4">⚙️ Level Settings</h3>
                    
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm font-bold text-gray-300 mb-1">Level Name</label>
                            <input type="text" id="level-name" value="${this.editor.levelSettings.name}" 
                                   class="w-full p-2 rounded bg-gray-700 text-white border border-gray-600">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-bold text-gray-300 mb-1">Difficulty</label>
                            <select id="level-difficulty" class="w-full p-2 rounded bg-gray-700 text-white border border-gray-600">
                                <option value="easy">Easy</option>
                                <option value="medium" selected>Medium</option>
                                <option value="hard">Hard</option>
                                <option value="extreme">Extreme</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-bold text-gray-300 mb-1">Wave Count</label>
                            <input type="number" id="wave-count" value="${this.editor.levelSettings.waves}" 
                                   min="1" max="10" class="w-full p-2 rounded bg-gray-700 text-white border border-gray-600">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-bold text-gray-300 mb-1">Starting Budget</label>
                            <input type="number" id="starting-budget" value="${this.editor.levelSettings.budget}" 
                                   min="100" max="2000" step="50" class="w-full p-2 rounded bg-gray-700 text-white border border-gray-600">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-bold text-gray-300 mb-1">Time Limit (seconds)</label>
                            <input type="number" id="time-limit" value="${this.editor.levelSettings.timeLimit}" 
                                   min="60" max="1800" step="30" class="w-full p-2 rounded bg-gray-700 text-white border border-gray-600">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderEditorControls() {
        return `
            <div class="editor-controls grid grid-cols-2 gap-4">
                <div class="file-operations bg-gray-700 p-4 rounded">
                    <h4 class="font-bold text-white mb-3">💾 File Operations</h4>
                    <div class="space-y-2">
                        <button id="export-level" class="w-full p-2 rounded bg-purple-600 hover:bg-purple-500 transition-colors">
                            <i class="bi bi-download"></i> Export Level
                        </button>
                        <div class="import-container">
                            <input type="file" id="import-level" accept=".json" class="hidden">
                            <button id="import-level-btn" class="w-full p-2 rounded bg-orange-600 hover:bg-orange-500 transition-colors">
                                <i class="bi bi-upload"></i> Import Level
                            </button>
                        </div>
                        <button id="exit-editor" class="w-full p-2 rounded bg-gray-600 hover:bg-gray-500 transition-colors">
                            <i class="bi bi-arrow-left"></i> Exit Editor
                        </button>
                    </div>
                </div>

                <div class="saved-levels bg-gray-700 p-4 rounded">
                    <h4 class="font-bold text-white mb-3">📁 Saved Levels</h4>
                    <div id="custom-levels-list" class="space-y-2 max-h-40 overflow-y-auto">
                        <!-- Custom levels will be populated here -->
                    </div>
                    <button id="refresh-levels" class="w-full p-2 rounded bg-blue-600 hover:bg-blue-500 transition-colors mt-2">
                        <i class="bi bi-arrow-clockwise"></i> Refresh List
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.target.dataset.tool;
                this.editor.setTool(tool);
            });
        });

        // Level settings
        document.getElementById('level-name').addEventListener('input', (e) => {
            this.editor.levelSettings.name = e.target.value;
        });

        document.getElementById('level-difficulty').addEventListener('change', (e) => {
            this.editor.levelSettings.difficulty = e.target.value;
        });

        document.getElementById('wave-count').addEventListener('input', (e) => {
            this.editor.levelSettings.waves = parseInt(e.target.value);
        });

        document.getElementById('starting-budget').addEventListener('input', (e) => {
            this.editor.levelSettings.budget = parseInt(e.target.value);
        });

        document.getElementById('time-limit').addEventListener('input', (e) => {
            this.editor.levelSettings.timeLimit = parseInt(e.target.value);
        });

        // Quick actions
        document.getElementById('clear-level').addEventListener('click', () => {
            if (confirm('Clear all level data?')) {
                this.editor.resetLevel();
            }
        });

        document.getElementById('test-level').addEventListener('click', () => {
            this.editor.testLevel();
        });

        document.getElementById('save-level').addEventListener('click', () => {
            this.editor.saveLevel();
        });

        // File operations
        document.getElementById('export-level').addEventListener('click', () => {
            this.editor.exportLevel();
        });

        document.getElementById('import-level-btn').addEventListener('click', () => {
            document.getElementById('import-level').click();
        });

        document.getElementById('import-level').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.editor.importLevel(file);
            }
        });

        document.getElementById('exit-editor').addEventListener('click', () => {
            this.editor.exitEditorMode();
        });

        document.getElementById('refresh-levels').addEventListener('click', () => {
            this.updateLevelList();
        });

        // Initialize level list
        this.updateLevelList();
    }

    updateToolSelection() {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tool === this.editor.currentTool) {
                btn.classList.add('active');
            }
        });

        document.getElementById('current-tool').textContent = 
            this.editor.currentTool.charAt(0).toUpperCase() + this.editor.currentTool.slice(1);
    }

    updateEditorStatus() {
        document.getElementById('path-count').textContent = this.editor.customPath.length;
        document.getElementById('spawn-count').textContent = this.editor.spawnPoints.length;
        document.getElementById('objective-count').textContent = this.editor.objectives.length;

        // Update validation status
        const isValid = this.editor.validateLevel();
        const statusElement = document.getElementById('validation-status');
        if (isValid) {
            statusElement.textContent = '✅ Level Valid';
            statusElement.className = 'text-green-400 mt-1';
        } else {
            statusElement.textContent = '❌ Level Invalid';
            statusElement.className = 'text-red-400 mt-1';
        }
    }

    updateLevelList() {
        const customLevels = this.editor.storage.getCustomLevels();
        const container = document.getElementById('custom-levels-list');
        
        if (customLevels.length === 0) {
            container.innerHTML = '<div class="text-gray-500 text-sm">No saved levels</div>';
            return;
        }

        container.innerHTML = customLevels.map(level => `
            <div class="custom-level-item p-2 bg-gray-800 rounded border border-gray-600">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="font-bold text-white text-sm">${level.name}</div>
                        <div class="text-xs text-gray-400">${level.difficulty} • ${level.waves} waves</div>
                    </div>
                    <div class="flex gap-1">
                        <button class="load-level p-1 rounded bg-green-600 hover:bg-green-500 text-xs" 
                                data-level-name="${level.name}">Load</button>
                        <button class="delete-level p-1 rounded bg-red-600 hover:bg-red-500 text-xs" 
                                data-level-name="${level.name}">Del</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners for level operations
        container.querySelectorAll('.load-level').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const levelName = e.target.dataset.levelName;
                const level = customLevels.find(l => l.name === levelName);
                if (level) {
                    this.editor.loadLevel(level);
                }
            });
        });

        container.querySelectorAll('.delete-level').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const levelName = e.target.dataset.levelName;
                if (confirm(`Delete level "${levelName}"?`)) {
                    this.editor.storage.deleteCustomLevel(levelName);
                    this.updateLevelList();
                }
            });
        });
    }

    cleanup() {
        // Remove any event listeners or cleanup editor-specific elements
        document.querySelectorAll('.editor-element').forEach(el => el.remove());
    }
}
