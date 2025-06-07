export class GridManager {
    constructor(room) {
        this.room = room;
        this.gridWidth = 12;
        this.gridHeight = 8;
        this.cellSize = 50;
        this.gameGrid = null;
        this.playerElement = null;
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
        this.playerElement.style.left = `${this.room.player.x * this.cellSize}px`;
        this.playerElement.style.top = `${this.room.player.y * this.cellSize}px`;
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
        this.room.bugs.forEach(bug => {
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
        this.room.obstacles.forEach(obstacle => {
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
        this.room.powerUps.forEach(powerUp => {
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

    getGridDimensions() {
        return {
            width: this.gridWidth,
            height: this.gridHeight,
            cellSize: this.cellSize
        };
    }
}
