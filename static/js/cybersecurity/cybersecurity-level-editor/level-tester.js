export class LevelTester {
    constructor(editorCore) {
        this.editor = editorCore;
        this.room = editorCore.room;
        this.isTestMode = false;
        this.originalGameState = null;
    }

    startTest(levelData) {
        if (this.isTestMode) {
            this.stopTest();
            return;
        }
        
        this.isTestMode = true;
        
        // Save original game state
        this.originalGameState = {
            path: [...this.room.defenseGrid.path],
            websiteHealth: this.room.websiteHealth,
            securityBudget: this.room.securityBudget,
            currentWave: this.room.currentWave,
            maxWaves: this.room.maxWaves
        };
        
        // Apply test level data
        this.room.defenseGrid.path = this.editor.pathEditor.generateSmoothPath();
        this.room.websiteHealth = 100;
        this.room.securityBudget = levelData.settings.budget;
        this.room.currentWave = 1;
        this.room.maxWaves = levelData.settings.waves;
        
        // Clear existing game state
        this.room.defenseUnits = [];
        this.room.attackWaves = [];
        this.room.attacksBlocked = 0;
        this.room.attacksPassed = 0;
        this.room.isDefending = false;
        
        // Switch to test mode UI
        this.renderTestMode();
        this.room.defenseGrid.setupGameArea();
        
        this.room.showMessage('Test mode activated! Try your level design.', 'info');
    }

    stopTest() {
        if (!this.isTestMode) return;
        
        this.isTestMode = false;
        
        // Restore original game state
        if (this.originalGameState) {
            this.room.defenseGrid.path = this.originalGameState.path;
            this.room.websiteHealth = this.originalGameState.websiteHealth;
            this.room.securityBudget = this.originalGameState.securityBudget;
            this.room.currentWave = this.originalGameState.currentWave;
            this.room.maxWaves = this.originalGameState.maxWaves;
        }
        
        // Clear test state
        this.room.defenseUnits = [];
        this.room.attackWaves = [];
        this.room.attacksBlocked = 0;
        this.room.attacksPassed = 0;
        this.room.isDefending = false;
        
        // Clear any running timers
        if (this.room.gameTimer) {
            clearInterval(this.room.gameTimer);
            this.room.gameTimer = null;
        }
        
        // Return to editor
        this.editor.ui.renderEditor();
        this.editor.setupEditorGrid();
        this.editor.renderEditorElements();
        
        this.room.showMessage('Test mode stopped. Returned to editor.', 'info');
    }

    renderTestMode() {
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="test-mode-container p-6 fade-in">
                <div class="text-center mb-6">
                    <i class="bi bi-play-circle text-6xl text-green-500 animate-pulse"></i>
                    <h2 class="text-3xl font-bold mt-4 text-green-400">LEVEL TEST MODE</h2>
                    <p class="text-gray-300 mt-2">Testing your custom cyber defense level</p>
                </div>
                
                <div class="test-controls bg-yellow-900 border border-yellow-600 p-4 rounded mb-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <h4 class="font-bold text-yellow-200">🧪 Test Mode Active</h4>
                            <p class="text-yellow-100 text-sm">This is a preview of your level. Game progress will not be saved.</p>
                        </div>
                        <div class="space-x-2">
                            <button id="stop-test" class="bg-red-600 hover:bg-red-500 px-4 py-2 rounded font-bold">
                                Stop Test
                            </button>
                            <button id="restart-test" class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold">
                                Restart Test
                            </button>
                        </div>
                    </div>
                </div>
                
                ${this.room.ui.renderStatusPanel()}
                ${this.room.ui.renderGameArea()}
                ${this.room.ui.renderControlPanels()}
            </div>
        `;
        
        // Setup test mode event listeners
        document.getElementById('stop-test').addEventListener('click', () => {
            this.stopTest();
        });
        
        document.getElementById('restart-test').addEventListener('click', () => {
            this.restartTest();
        });
        
        // Setup normal game event listeners
        this.room.ui.setupEventListeners();
    }

    restartTest() {
        const currentLevelData = {
            path: [...this.editor.customPath],
            spawnPoints: [...this.editor.spawnPoints],
            objectives: [...this.editor.objectives],
            settings: { ...this.editor.levelSettings }
        };
        
        this.stopTest();
        setTimeout(() => {
            this.startTest(currentLevelData);
        }, 100);
    }

    isTestModeActive() {
        return this.isTestMode;
    }
}
