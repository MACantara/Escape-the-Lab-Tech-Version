export class AttackWaveManager {
    constructor(room) {
        this.room = room;
    }

    generateWave(waveNumber) {
        const attacks = [];
        const attackTypes = this.room.data.attack_types;
        const baseCount = 3 + waveNumber;
        
        for (let i = 0; i < baseCount; i++) {
            const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
            
            attacks.push({
                id: Date.now() + i,
                type: attackType.id,
                health: attackType.health * (1 + waveNumber * 0.2),
                maxHealth: attackType.health * (1 + waveNumber * 0.2),
                speed: attackType.speed,
                damage: attackType.damage,
                reward: attackType.reward,
                icon: attackType.icon,
                pathIndex: 0,
                x: this.room.defenseGrid.path[0].x * this.room.defenseGrid.cellSize,
                y: this.room.defenseGrid.path[0].y * this.room.defenseGrid.cellSize,
                element: null,
                spawnDelay: i * 1000,
                spawned: false
            });
        }
        
        return attacks;
    }

    updateAttacks(gameTime, lastWaveTime) {
        // Spawn delayed attacks
        this.room.attackWaves.forEach(attack => {
            if (!attack.spawned && gameTime - lastWaveTime >= attack.spawnDelay) {
                this.spawnAttack(attack);
                attack.spawned = true;
            }
        });
        
        // Update attack positions
        this.room.attackWaves.forEach(attack => {
            if (attack.spawned && attack.element) {
                this.updateAttackPosition(attack);
            }
        });
    }

    spawnAttack(attack) {
        const element = document.createElement('div');
        element.className = 'attack-unit absolute transition-all duration-75';
        element.style.width = '30px';
        element.style.height = '30px';
        element.style.borderRadius = '50%';
        element.style.backgroundColor = '#ef4444';
        element.style.border = '2px solid #dc2626';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.fontSize = '16px';
        element.style.zIndex = '10';
        element.innerHTML = attack.icon;
        
        const healthBar = document.createElement('div');
        healthBar.className = 'health-bar absolute';
        healthBar.style.top = '-8px';
        healthBar.style.left = '0';
        healthBar.style.width = '30px';
        healthBar.style.height = '4px';
        healthBar.style.backgroundColor = '#dc2626';
        healthBar.style.border = '1px solid #000';
        element.appendChild(healthBar);
        
        attack.element = element;
        this.room.defenseGrid.gameArea.appendChild(element);
    }

    updateAttackPosition(attack) {
        if (attack.pathIndex >= this.room.defenseGrid.path.length - 1) {
            this.room.websiteHealth -= attack.damage;
            this.room.attacksPassed++;
            this.removeAttack(attack);
            return;
        }
        
        const currentPoint = this.room.defenseGrid.path[attack.pathIndex];
        const nextPoint = this.room.defenseGrid.path[attack.pathIndex + 1];
        
        const targetX = nextPoint.x * this.room.defenseGrid.cellSize + 5;
        const targetY = nextPoint.y * this.room.defenseGrid.cellSize + 5;
        
        const dx = targetX - attack.x;
        const dy = targetY - attack.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < attack.speed) {
            attack.pathIndex++;
            attack.x = targetX;
            attack.y = targetY;
        } else {
            attack.x += (dx / distance) * attack.speed;
            attack.y += (dy / distance) * attack.speed;
        }
        
        attack.element.style.left = `${attack.x}px`;
        attack.element.style.top = `${attack.y}px`;
    }

    damageAttack(attack, damage) {
        attack.health -= damage;
        
        const healthPercent = attack.health / attack.maxHealth;
        const healthBar = attack.element.querySelector('.health-bar');
        if (healthBar) {
            healthBar.style.width = `${30 * healthPercent}px`;
            healthBar.style.backgroundColor = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#f59e0b' : '#dc2626';
        }
        
        if (attack.health <= 0) {
            this.room.attacksBlocked++;
            this.room.securityBudget += attack.reward;
            this.removeAttack(attack);
            return true;
        }
        return false;
    }

    removeAttack(attack) {
        if (attack.element) {
            attack.element.remove();
        }
        
        const index = this.room.attackWaves.indexOf(attack);
        if (index > -1) {
            this.room.attackWaves.splice(index, 1);
        }
    }
}
