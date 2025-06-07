export class WaveManager {
    constructor(room) {
        this.room = room;
    }

    getWaveDifficulty() {
        const difficulties = ['Reconnaissance', 'Probing', 'Infiltration', 'Assault', 'Full Invasion'];
        return difficulties[Math.min(this.room.wave - 1, difficulties.length - 1)];
    }

    getAttacksThisWave() {
        return Math.min(this.room.currentWaveAttacks, this.room.attacksPerWave);
    }

    checkWaveCompletion() {
        // Check if current wave is complete
        if (this.room.currentWaveAttacks >= this.room.attacksPerWave && 
            this.room.attackManager.attacks.length === 0) {
            this.completeWave();
        }
    }

    completeWave() {
        this.room.wave++;
        this.room.currentWaveAttacks = 0;
        
        // Increase attacks per wave for higher difficulty
        this.room.attacksPerWave = Math.min(30, 8 + (this.room.wave - 1) * 3);
        
        // Play wave complete sound
        this.room.audioManager.playSound('wave_complete');
        
        if (this.room.wave > this.room.maxWaves) {
            // All waves completed
            this.room.defenseComplete();
        } else {
            // Show wave completion message
            this.showWaveComplete();
            
            // Brief pause between waves
            setTimeout(() => {
                if (this.room.isDefending) {
                    this.room.updateDisplay(); // Update display for new wave
                }
            }, 2000);
        }
    }

    showWaveComplete() {
        const gameArea = document.getElementById('defense-game');
        
        const waveMessage = document.createElement('div');
        waveMessage.className = 'absolute text-green-400 font-bold text-2xl animate-pulse';
        waveMessage.style.left = '50%';
        waveMessage.style.top = '50%';
        waveMessage.style.transform = 'translate(-50%, -50%)';
        waveMessage.style.zIndex = '25';
        waveMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        waveMessage.style.padding = '20px';
        waveMessage.style.borderRadius = '10px';
        waveMessage.style.border = '2px solid #10b981';
        waveMessage.innerHTML = `
            <div class="text-center">
                <div class="text-3xl mb-2">🛡️</div>
                <div>WAVE ${this.room.wave - 1} REPELLED!</div>
                <div class="text-sm mt-2">Preparing for Wave ${this.room.wave}...</div>
            </div>
        `;
        
        gameArea.appendChild(waveMessage);
        
        setTimeout(() => {
            waveMessage.remove();
        }, 2000);
    }

    resetWave() {
        this.room.wave = 1;
        this.room.currentWaveAttacks = 0;
        this.room.attacksPerWave = 8;
    }
}
