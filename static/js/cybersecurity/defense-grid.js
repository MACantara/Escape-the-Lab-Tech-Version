export class DefenseGrid {
    constructor(room) {
        this.room = room;
        this.gameArea = null;
        this.cellSize = 40;
        this.gridWidth = 16;
        this.gridHeight = 10;
        this.path = this.generateAttackPath();
    }

    generateAttackPath() {
        return [
            {x: 0, y: 4}, {x: 1, y: 4}, {x: 2, y: 4}, {x: 3, y: 4}, 
            {x: 4, y: 4}, {x: 5, y: 3}, {x: 6, y: 2}, {x: 7, y: 2}, 
            {x: 8, y: 2}, {x: 9, y: 3}, {x: 10, y: 4}, {x: 11, y: 5}, 
            {x: 12, y: 6}, {x: 13, y: 6}, {x: 14, y: 6}, {x: 15, y: 6}
        ];
    }

    setupGameArea() {
        this.gameArea = document.getElementById('defense-canvas');
        this.createGrid();
        this.drawAttackPath();
        
        this.gameArea.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });
    }

    createGrid() {
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

    handleCanvasClick(e) {
        const rect = this.gameArea.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.cellSize);
        const y = Math.floor((e.clientY - rect.top) / this.cellSize);
        
        if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) return;
        
        const existingDefense = this.room.defenseUnits.find(d => d.x === x && d.y === y);
        
        if (existingDefense) {
            this.room.defenseManager.selectDefense(existingDefense);
        } else if (this.room.placementMode && this.room.selectedDefenseType) {
            this.room.defenseManager.placeDefense(x, y);
        }
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
        
        setTimeout(() => {
            projectile.style.left = `${target.x + 15}px`;
            projectile.style.top = `${target.y + 15}px`;
            projectile.style.transition = 'all 0.2s ease-out';
        }, 10);
        
        setTimeout(() => {
            projectile.remove();
        }, 250);
    }
}
