export class AudioManager {
    constructor(room) {
        this.room = room;
        this.sounds = new Map();
        this.soundEnabled = true;
    }

    async loadSounds() {
        const soundFiles = {
            'shield_block': 'static/audio/shield-block.mp3',
            'network_hit': 'static/audio/network-hit.mp3',
            'wave_complete': 'static/audio/wave-complete.mp3',
            'defense_start': 'static/audio/defense-start.mp3',
            'defense_complete': 'static/audio/defense-complete.mp3',
            'game_over': 'static/audio/game-over.mp3',
            'alien_spawn': 'static/audio/alien-spawn.mp3'
        };

        // Load audio files (placeholder implementation)
        for (const [key, path] of Object.entries(soundFiles)) {
            try {
                const audio = new Audio(path);
                audio.volume = 0.3;
                audio.preload = 'auto';
                this.sounds.set(key, audio);
            } catch (error) {
                console.warn(`Failed to load sound: ${key}`, error);
            }
        }
    }

    playSound(soundKey) {
        if (!this.soundEnabled) return;
        
        console.log(`Playing sound: ${soundKey}`);
        
        const sound = this.sounds.get(soundKey);
        if (sound) {
            try {
                sound.currentTime = 0; // Reset to beginning
                sound.play().catch(e => {
                    console.warn(`Failed to play sound ${soundKey}:`, e);
                });
            } catch (error) {
                console.warn(`Error playing sound ${soundKey}:`, error);
            }
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }

    setSoundVolume(volume) {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        this.sounds.forEach(sound => {
            sound.volume = clampedVolume;
        });
    }
}
