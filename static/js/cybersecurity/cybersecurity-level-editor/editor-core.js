import { EditorUI } from './editor-ui.js';
import { EditorStorage } from './editor-storage.js';
import { LevelTester } from './level-tester.js';
import { PathEditor } from './path-editor.js';

export class EditorCore {
    constructor(room) {
        this.room = room;
        this.isEditorMode = false;
        this.currentTool = 'path';
        this.editingLevel = null;
        
        // Initialize editor components
        this.ui = new EditorUI(this);
        this.storage = new EditorStorage();
        this.tester = new LevelTester(this);
        this.pathEditor = new PathEditor(this);
        
        // Editor state
        this.customPath = [];
        this.spawnPoints = [];
        this.objectives = [];
        this.levelSettings = {
            name: 'Custom Level',
            difficulty: 'medium',
            waves: 3,
            budget: 500,
            timeLimit: 600
        };
    }

    enterEditorMode() {
        if (this.isEditorMode) return;
        
        this.isEditorMode = true;
        // Don't call pauseGame - handle editor state internally
        this.ui.renderEditor();
        this.setupEditorGrid();
        
        // Initialize with current level or new level
        this.resetLevel();
        this.room.showMessage('Level Editor activated! Design your cyber defense scenario.', 'info');
    }

    exitEditorMode() {
        if (!this.isEditorMode) return;
        
        this.isEditorMode = false;
        this.ui.cleanup();
        // Don't call resumeGame - just restore the room view
        this.room.render(); // Restore normal game view
        this.room.defenseGrid.setupGameArea();
        this.room.showMessage('Level Editor closed.', 'info');
    }

    setupEditorGrid() {
        const gameArea = document.getElementById('defense-canvas');
        gameArea.innerHTML = ''; // Clear existing content
        
        // Create editor grid with different styling
        for (let y = 0; y < this.room.defenseGrid.gridHeight; y++) {
            for (let x = 0; x < this.room.defenseGrid.gridWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'editor-cell absolute border border-blue-300 cursor-pointer hover:bg-blue-600 hover:bg-opacity-30 transition-colors';
                cell.style.left = `${x * this.room.defenseGrid.cellSize}px`;
                cell.style.top = `${y * this.room.defenseGrid.cellSize}px`;
                cell.style.width = `${this.room.defenseGrid.cellSize}px`;
                cell.style.height = `${this.room.defenseGrid.cellSize}px`;
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                cell.addEventListener('click', (e) => {
                    this.handleCellClick(parseInt(e.target.dataset.x), parseInt(e.target.dataset.y));
                });
                
                gameArea.appendChild(cell);
            }
        }
        
        // Add editor instructions
        const instructions = document.createElement('div');
        instructions.className = 'absolute top-2 left-2 bg-black bg-opacity-70 text-white p-2 rounded text-sm max-w-xs';
        instructions.innerHTML = `
            <div class="font-bold text-blue-400 mb-1">LEVEL EDITOR</div>
            <div>Click cells to place elements</div>
            <div>Use tools panel to switch modes</div>
        `;
        gameArea.appendChild(instructions);
    }

    handleCellClick(x, y) {
        switch (this.currentTool) {
            case 'path':
                this.pathEditor.addPathPoint(x, y);
                break;
            case 'spawn':
                this.addSpawnPoint(x, y);
                break;
            case 'objective':
                this.addObjective(x, y);
                break;
            case 'erase':
                this.eraseElement(x, y);
                break;
        }
        
        this.renderEditorElements();
        this.ui.updateEditorStatus();
    }

    addSpawnPoint(x, y) {
        // Remove existing spawn point (only one allowed)
        this.spawnPoints = [];
        this.spawnPoints.push({ x, y });
        this.room.showMessage('Spawn point placed', 'success');
    }

    addObjective(x, y) {
        // Remove existing objective (only one allowed)
        this.objectives = [];
        this.objectives.push({ x, y, type: 'website' });
        this.room.showMessage('Objective placed', 'success');
    }

    eraseElement(x, y) {
        // Remove path points
        this.customPath = this.customPath.filter(p => !(p.x === x && p.y === y));
        
        // Remove spawn points
        this.spawnPoints = this.spawnPoints.filter(p => !(p.x === x && p.y === y));
        
        // Remove objectives
        this.objectives = this.objectives.filter(p => !(p.x === x && p.y === y));
        
        this.room.showMessage('Element erased', 'info');
    }

    renderEditorElements() {
        const gameArea = document.getElementById('defense-canvas');
        
        // Clear existing editor elements
        document.querySelectorAll('.editor-element').forEach(el => el.remove());
        
        // Render path
        this.customPath.forEach((point, index) => {
            const element = document.createElement('div');
            element.className = 'editor-element absolute pointer-events-none border-2 border-yellow-400 bg-yellow-600 bg-opacity-30';
            element.style.left = `${point.x * this.room.defenseGrid.cellSize + 2}px`;
            element.style.top = `${point.y * this.room.defenseGrid.cellSize + 2}px`;
            element.style.width = `${this.room.defenseGrid.cellSize - 4}px`;
            element.style.height = `${this.room.defenseGrid.cellSize - 4}px`;
            element.innerHTML = `<div class="text-yellow-200 text-xs text-center leading-9">${index + 1}</div>`;
            gameArea.appendChild(element);
        });
        
        // Render spawn points
        this.spawnPoints.forEach(point => {
            const element = document.createElement('div');
            element.className = 'editor-element absolute pointer-events-none border-2 border-green-400 bg-green-600 bg-opacity-30 flex items-center justify-center';
            element.style.left = `${point.x * this.room.defenseGrid.cellSize + 2}px`;
            element.style.top = `${point.y * this.room.defenseGrid.cellSize + 2}px`;
            element.style.width = `${this.room.defenseGrid.cellSize - 4}px`;
            element.style.height = `${this.room.defenseGrid.cellSize - 4}px`;
            element.innerHTML = '<div class="text-green-200 text-lg">🚀</div>';
            gameArea.appendChild(element);
        });
        
        // Render objectives
        this.objectives.forEach(point => {
            const element = document.createElement('div');
            element.className = 'editor-element absolute pointer-events-none border-2 border-red-400 bg-red-600 bg-opacity-30 flex items-center justify-center';
            element.style.left = `${point.x * this.room.defenseGrid.cellSize + 2}px`;
            element.style.top = `${point.y * this.room.defenseGrid.cellSize + 2}px`;
            element.style.width = `${this.room.defenseGrid.cellSize - 4}px`;
            element.style.height = `${this.room.defenseGrid.cellSize - 4}px`;
            element.innerHTML = '<div class="text-red-200 text-lg">🎯</div>';
            gameArea.appendChild(element);
        });
    }

    setTool(tool) {
        this.currentTool = tool;
        this.ui.updateToolSelection();
    }

    resetLevel() {
        this.customPath = [];
        this.spawnPoints = [];
        this.objectives = [];
        this.levelSettings = {
            name: 'Custom Level',
            difficulty: 'medium',
            waves: 3,
            budget: 500,
            timeLimit: 600
        };
        this.renderEditorElements();
        this.ui.updateEditorStatus();
    }

    saveLevel() {
        if (!this.validateLevel()) {
            return false;
        }
        
        const levelData = {
            name: this.levelSettings.name,
            difficulty: this.levelSettings.difficulty,
            waves: this.levelSettings.waves,
            budget: this.levelSettings.budget,
            timeLimit: this.levelSettings.timeLimit,
            path: [...this.customPath],
            spawnPoints: [...this.spawnPoints],
            objectives: [...this.objectives],
            createdDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const success = this.storage.saveCustomLevel(levelData);
        if (success) {
            this.room.showMessage(`Level "${levelData.name}" saved successfully!`, 'success');
            this.ui.updateLevelList();
            return true;
        } else {
            this.room.showMessage('Failed to save level', 'error');
            return false;
        }
    }

    loadLevel(levelData) {
        this.customPath = [...levelData.path];
        this.spawnPoints = [...levelData.spawnPoints];
        this.objectives = [...levelData.objectives];
        this.levelSettings = {
            name: levelData.name,
            difficulty: levelData.difficulty,
            waves: levelData.waves,
            budget: levelData.budget,
            timeLimit: levelData.timeLimit
        };
        
        this.renderEditorElements();
        this.ui.updateEditorStatus();
        this.room.showMessage(`Level "${levelData.name}" loaded`, 'success');
    }

    testLevel() {
        if (!this.validateLevel()) {
            return;
        }
        
        this.tester.startTest({
            path: this.customPath,
            spawnPoints: this.spawnPoints,
            objectives: this.objectives,
            settings: this.levelSettings
        });
    }

    validateLevel() {
        const errors = [];
        
        if (this.customPath.length < 2) {
            errors.push('Path must have at least 2 points');
        }
        
        if (this.spawnPoints.length === 0) {
            errors.push('Must have at least one spawn point');
        }
        
        if (this.objectives.length === 0) {
            errors.push('Must have at least one objective');
        }
        
        if (this.levelSettings.waves < 1 || this.levelSettings.waves > 10) {
            errors.push('Wave count must be between 1 and 10');
        }
        
        if (this.levelSettings.budget < 100 || this.levelSettings.budget > 2000) {
            errors.push('Budget must be between 100 and 2000');
        }
        
        if (errors.length > 0) {
            this.room.showMessage('Validation errors:\n' + errors.join('\n'), 'error');
            return false;
        }
        
        return true;
    }

    exportLevel() {
        if (!this.validateLevel()) {
            return;
        }
        
        const levelData = {
            name: this.levelSettings.name,
            difficulty: this.levelSettings.difficulty,
            waves: this.levelSettings.waves,
            budget: this.levelSettings.budget,
            timeLimit: this.levelSettings.timeLimit,
            path: this.customPath,
            spawnPoints: this.spawnPoints,
            objectives: this.objectives,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(levelData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${levelData.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.room.showMessage('Level exported successfully!', 'success');
    }

    importLevel(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const levelData = JSON.parse(e.target.result);
                
                // Validate imported data
                if (!this.validateImportedLevel(levelData)) {
                    this.room.showMessage('Invalid level file format', 'error');
                    return;
                }
                
                this.loadLevel(levelData);
                this.room.showMessage(`Level "${levelData.name}" imported successfully!`, 'success');
            } catch (error) {
                this.room.showMessage('Failed to parse level file', 'error');
            }
        };
        reader.readAsText(file);
    }

    validateImportedLevel(data) {
        return data.path && Array.isArray(data.path) &&
               data.spawnPoints && Array.isArray(data.spawnPoints) &&
               data.objectives && Array.isArray(data.objectives) &&
               data.name && typeof data.name === 'string';
    }
}
