export class AttackManager {
    constructor(room) {
        this.room = room;
        this.attacks = [];
        this.nextAttackId = 1;
    }

    spawnAttack() {
        if (!this.room.isDefending) return;
        
        const gameArea = document.getElementById('defense-game');
        if (!gameArea) return;
        
        // Get current wave difficulty
        const attackPattern = this.getRandomAttackPattern();
        
        const attack = {
            id: this.nextAttackId++,
            type: attackPattern.name,
            damage: attackPattern.damage,
            speed: this.getAttackSpeed(attackPattern.speed),
            pattern: attackPattern.pattern,
            icon: attackPattern.icon,
            x: this.getSpawnX(attackPattern.pattern),
            y: this.getSpawnY(attackPattern.pattern),
            targetX: this.room.shieldPosition.x + (Math.random() - 0.5) * 100,
            targetY: this.room.shieldPosition.y + (Math.random() - 0.5) * 100,
            element: null,
            startTime: Date.now(),
            size: 20
        };
        
        this.attacks.push(attack);
        this.createAttackElement(attack);
        
        // Play spawn sound
        this.room.audioManager.playSound('alien_spawn');
    }

    getRandomAttackPattern() {
        const patterns = this.room.data.alien_attack_patterns;
        const waveDifficulty = this.room.wave;
        
        // Increase chance of stronger attacks in later waves
        let availablePatterns = patterns;
        
        if (waveDifficulty >= 4) {
            // Higher chance of Void Pulse in later waves
            availablePatterns = [...patterns, patterns.find(p => p.name === 'Void Pulse')];
        }
        
        if (waveDifficulty >= 3) {
            // Add more Neural Worms
            availablePatterns = [...availablePatterns, patterns.find(p => p.name === 'Neural Worm')];
        }
        
        return availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
    }

    getAttackSpeed(speedType) {
        const baseSpeed = {
            'Very Fast': 200,
            'Fast': 150,
            'Medium': 100,
            'Slow': 60
        };
        
        const waveMultiplier = 1 + (this.room.wave - 1) * 0.1; // Increase speed by 10% each wave
        return (baseSpeed[speedType] || 100) * waveMultiplier;
    }

    getSpawnX(pattern) {
        const gameArea = document.getElementById('defense-game');
        const width = gameArea.offsetWidth;
        
        switch(pattern) {
            case 'Direct':
                return Math.random() * width;
            case 'Weaving':
                return Math.random() < 0.5 ? 0 : width;
            case 'Heavy':
                return width / 2 + (Math.random() - 0.5) * 200;
            case 'Multiple':
                return Math.random() * width;
            default:
                return Math.random() * width;
        }
    }

    getSpawnY(pattern) {
        const gameArea = document.getElementById('defense-game');
        const height = gameArea.offsetHeight;
        
        switch(pattern) {
            case 'Direct':
                return 0;
            case 'Weaving':
                return Math.random() * height * 0.3;
            case 'Heavy':
                return 0;
            case 'Multiple':
                return Math.random() * height * 0.2;
            default:
                return 0;
        }
    }

    createAttackElement(attack) {
        const gameArea = document.getElementById('defense-game');
        
        const element = document.createElement('div');
        element.className = 'alien-attack absolute transition-all duration-100';
        element.style.left = `${attack.x - attack.size/2}px`;
        element.style.top = `${attack.y - attack.size/2}px`;
        element.style.width = `${attack.size}px`;
        element.style.height = `${attack.size}px`;
        element.style.borderRadius = '50%';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.fontSize = '16px';
        element.style.zIndex = '15';
        element.style.userSelect = 'none';
        element.innerHTML = attack.icon;
        
        // Attack-specific styling
        this.styleAttackElement(element, attack);
        
        attack.element = element;
        gameArea.appendChild(element);
    }

    styleAttackElement(element, attack) {
        switch(attack.type) {
            case 'Quantum Spike':
                element.style.background = 'linear-gradient(45deg, #fbbf24, #f59e0b)';
                element.style.boxShadow = '0 0 15px #fbbf24';
                break;
            case 'Neural Worm':
                element.style.background = 'linear-gradient(45deg, #8b5cf6, #7c3aed)';
                element.style.boxShadow = '0 0 15px #8b5cf6';
                break;
            case 'Void Pulse':
                element.style.background = 'linear-gradient(45deg, #1f2937, #374151)';
                element.style.boxShadow = '0 0 20px #ef4444';
                element.style.border = '2px solid #ef4444';
                break;
            case 'Swarm Packet':
                element.style.background = 'linear-gradient(45deg, #10b981, #059669)';
                element.style.boxShadow = '0 0 10px #10b981';
                break;
            default:
                element.style.background = 'linear-gradient(45deg, #ef4444, #dc2626)';
                element.style.boxShadow = '0 0 15px #ef4444';
        }
    }

    updateAttacks() {
        this.attacks = this.attacks.filter(attack => {
            if (!attack.element || !attack.element.parentNode) {
                return false;
            }
            
            const elapsed = Date.now() - attack.startTime;
            const progress = (elapsed / 1000) / (attack.speed / 100);
            
            if (progress >= 1) {
                // Attack reached target - check for network damage
                this.handleNetworkDamage(attack);
                attack.element.remove();
                return false;
            }
            
            // Move attack towards target
            this.moveAttack(attack, progress);
            
            // Check collision with shield
            if (this.room.shieldManager.checkShieldCollision(attack)) {
                this.room.attacksBlocked++;
                attack.element.remove();
                return false;
            }
            
            return true;
        });
    }

    moveAttack(attack, progress) {
        let currentX, currentY;
        
        switch(attack.pattern) {
            case 'Direct':
                currentX = attack.x + (attack.targetX - attack.x) * progress;
                currentY = attack.y + (attack.targetY - attack.y) * progress;
                break;
                
            case 'Weaving':
                currentX = attack.x + (attack.targetX - attack.x) * progress;
                currentY = attack.y + (attack.targetY - attack.y) * progress + Math.sin(progress * Math.PI * 4) * 50;
                break;
                
            case 'Heavy':
                const easeProgress = progress * progress; // Accelerating
                currentX = attack.x + (attack.targetX - attack.x) * easeProgress;
                currentY = attack.y + (attack.targetY - attack.y) * easeProgress;
                break;
                
            case 'Multiple':
                currentX = attack.x + (attack.targetX - attack.x) * progress;
                currentY = attack.y + (attack.targetY - attack.y) * progress;
                break;
                
            default:
                currentX = attack.x + (attack.targetX - attack.x) * progress;
                currentY = attack.y + (attack.targetY - attack.y) * progress;
        }
        
        attack.x = currentX;
        attack.y = currentY;
        
        if (attack.element) {
            attack.element.style.left = `${currentX - attack.size/2}px`;
            attack.element.style.top = `${currentY - attack.size/2}px`;
        }
    }

    handleNetworkDamage(attack) {
        // Attack hit the network - reduce integrity
        this.room.networkIntegrity = Math.max(0, this.room.networkIntegrity - attack.damage);
        this.room.audioManager.playSound('network_hit');
        this.showNetworkDamage();
    }

    showNetworkDamage() {
        const gameArea = document.getElementById('defense-game');
        const superEarth = document.getElementById('super-earth');
        
        // Flash red background to indicate damage
        gameArea.style.backgroundColor = '#7f1d1d';
        setTimeout(() => {
            gameArea.style.backgroundColor = '#1f2937';
        }, 200);
        
        // Make Super Earth flash red when hit
        if (superEarth) {
            const originalBackground = superEarth.style.background;
            const originalBorder = superEarth.style.border;
            
            superEarth.style.background = 'linear-gradient(45deg, #dc2626, #b91c1c)';
            superEarth.style.border = '3px solid #f87171';
            superEarth.style.transform = 'scale(1.1)';
            
            setTimeout(() => {
                superEarth.style.background = originalBackground;
                superEarth.style.border = originalBorder;
                superEarth.style.transform = 'scale(1)';
            }, 300);
        }
        
        // Show damage indicator
        const damageIndicator = document.createElement('div');
        damageIndicator.className = 'absolute text-red-400 font-bold text-xl animate-pulse';
        damageIndicator.style.left = '50%';
        damageIndicator.style.top = '50%';
        damageIndicator.style.transform = 'translate(-50%, -50%)';
        damageIndicator.style.zIndex = '20';
        damageIndicator.textContent = 'SUPER EARTH HIT!';
        
        gameArea.appendChild(damageIndicator);
        
        setTimeout(() => {
            damageIndicator.remove();
        }, 1500);
    }

    clearAllAttacks() {
        this.attacks.forEach(attack => {
            if (attack.element && attack.element.parentNode) {
                attack.element.remove();
            }
        });
        this.attacks = [];
    }

    getAttackSpawnRate() {
        // Base spawn rate increases with wave difficulty
        const baseRate = 0.015; // 1.5% chance per frame at wave 1
        const waveMultiplier = 1 + (this.room.wave - 1) * 0.25; // 25% increase per wave
        
        return Math.min(0.12, baseRate * waveMultiplier); // Cap at 12% chance
    }
}
