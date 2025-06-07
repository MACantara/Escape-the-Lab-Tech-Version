export class DefenseManager {
    constructor(room) {
        this.room = room;
    }

    selectDefenseType(defenseId) {
        this.room.selectedDefenseType = defenseId;
        this.room.placementMode = true;
        this.room.selectedDefense = null;
        
        document.querySelectorAll('.defense-item').forEach(item => {
            item.classList.remove('border-blue-400', 'bg-blue-700');
            if (item.dataset.defenseType === defenseId) {
                item.classList.add('border-blue-400', 'bg-blue-700');
            }
        });
        
        document.getElementById('placement-mode').textContent = 'Mode: PLACE DEFENSE';
        this.updateSelectionInfo();
    }

    placeDefense(x, y) {
        const isOnPath = this.room.defenseGrid.path.some(p => p.x === x && p.y === y);
        if (isOnPath) {
            this.room.showMessage('Cannot place defense on attack path!', 'error');
            return;
        }
        
        const isOccupied = this.room.defenseUnits.some(d => d.x === x && d.y === y);
        if (isOccupied) {
            this.room.showMessage('Position already occupied!', 'error');
            return;
        }
        
        const defenseType = this.room.data.defense_types.find(d => d.id === this.room.selectedDefenseType);
        
        if (this.room.securityBudget < defenseType.cost) {
            this.room.showMessage('Insufficient budget!', 'error');
            return;
        }
        
        const defense = {
            id: Date.now(),
            type: defenseType.id,
            x: x,
            y: y,
            level: 1,
            damage: defenseType.damage,
            range: defenseType.range,
            cost: defenseType.cost,
            killCount: 0,
            lastShot: 0
        };
        
        this.room.defenseUnits.push(defense);
        this.room.securityBudget -= defenseType.cost;
        
        this.room.defenseGrid.createDefenseElement(defense, defenseType);
        
        this.room.placementMode = false;
        this.room.selectedDefenseType = null;
        document.getElementById('placement-mode').textContent = 'Mode: SELECT DEFENSE';
        
        document.querySelectorAll('.defense-item').forEach(item => {
            item.classList.remove('border-blue-400', 'bg-blue-700');
        });
        
        this.room.updateDisplay();
        this.updateSelectionInfo();
    }

    selectDefense(defense) {
        this.room.selectedDefense = defense;
        this.room.placementMode = false;
        this.room.selectedDefenseType = null;
        
        document.querySelectorAll('.defense-unit').forEach(el => {
            el.style.boxShadow = '';
        });
        
        const element = document.querySelector(`[data-defense-id="${defense.id}"]`);
        if (element) {
            element.style.boxShadow = '0 0 0 3px #fbbf24';
        }
        
        document.getElementById('placement-mode').textContent = 'Mode: DEFENSE SELECTED';
        this.updateSelectionInfo();
    }

    updateDefenses() {
        this.room.defenseUnits.forEach(defense => {
            this.updateDefenseShooting(defense);
        });
    }

    updateDefenseShooting(defense) {
        const now = Date.now();
        if (now - defense.lastShot < 1000) return;
        
        const targets = this.room.attackWaves.filter(attack => {
            if (!attack.spawned || !attack.element) return false;
            
            const dx = attack.x - (defense.x * this.room.defenseGrid.cellSize + 20);
            const dy = attack.y - (defense.y * this.room.defenseGrid.cellSize + 20);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            return distance <= defense.range * this.room.defenseGrid.cellSize;
        });
        
        if (targets.length > 0) {
            const target = targets[0];
            this.shootAtTarget(defense, target);
            defense.lastShot = now;
        }
    }

    shootAtTarget(defense, target) {
        this.room.defenseGrid.createProjectile(defense, target);
        
        const wasDestroyed = this.room.attackWaveManager.damageAttack(target, defense.damage);
        if (wasDestroyed) {
            defense.killCount++;
        }
    }

    sellSelectedDefense() {
        if (!this.room.selectedDefense) {
            this.room.showMessage('No defense selected!', 'error');
            return;
        }
        
        const sellValue = Math.floor(this.room.selectedDefense.cost * 0.7);
        this.room.securityBudget += sellValue;
        
        const element = document.querySelector(`[data-defense-id="${this.room.selectedDefense.id}"]`);
        if (element) {
            element.remove();
        }
        
        const index = this.room.defenseUnits.indexOf(this.room.selectedDefense);
        if (index > -1) {
            this.room.defenseUnits.splice(index, 1);
        }
        
        this.room.selectedDefense = null;
        this.room.updateDisplay();
        this.updateSelectionInfo();
        this.room.showMessage(`Defense sold for $${sellValue}`, 'success');
    }

    updateSelectionInfo() {
        const details = document.getElementById('selection-details');
        
        if (this.room.selectedDefense) {
            const defenseType = this.room.data.defense_types.find(d => d.id === this.room.selectedDefense.type);
            details.innerHTML = `
                <div class="font-bold text-white">${defenseType.name} (Level ${this.room.selectedDefense.level})</div>
                <div>Damage: ${this.room.selectedDefense.damage}</div>
                <div>Range: ${this.room.selectedDefense.range}</div>
                <div>Kills: ${this.room.selectedDefense.killCount}</div>
                <div class="text-yellow-400">Upgrade Cost: $${defenseType.cost * this.room.selectedDefense.level}</div>
            `;
        } else if (this.room.selectedDefenseType) {
            const defenseType = this.room.data.defense_types.find(d => d.id === this.room.selectedDefenseType);
            details.innerHTML = `
                <div class="font-bold text-blue-400">${defenseType.name}</div>
                <div>Damage: ${defenseType.damage}</div>
                <div>Range: ${defenseType.range}</div>
                <div class="text-gray-400">Click grid to place</div>
            `;
        } else {
            details.innerHTML = `
                <div>No defense selected</div>
                <div class="text-gray-500">Select from shop or click placed defense</div>
            `;
        }
    }
}
