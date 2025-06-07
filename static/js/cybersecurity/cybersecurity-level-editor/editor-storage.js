export class EditorStorage {
    constructor() {
        this.storageKey = 'cyber-defense-custom-levels';
    }

    getCustomLevels() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load custom levels:', error);
            return [];
        }
    }

    saveCustomLevel(levelData) {
        try {
            const existingLevels = this.getCustomLevels();
            
            // Replace existing level with same name or add new one
            const existingIndex = existingLevels.findIndex(level => level.name === levelData.name);
            
            if (existingIndex >= 0) {
                existingLevels[existingIndex] = levelData;
            } else {
                existingLevels.push(levelData);
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(existingLevels));
            return true;
        } catch (error) {
            console.error('Failed to save custom level:', error);
            return false;
        }
    }

    deleteCustomLevel(levelName) {
        try {
            const existingLevels = this.getCustomLevels();
            const filteredLevels = existingLevels.filter(level => level.name !== levelName);
            localStorage.setItem(this.storageKey, JSON.stringify(filteredLevels));
            return true;
        } catch (error) {
            console.error('Failed to delete custom level:', error);
            return false;
        }
    }

    clearAllCustomLevels() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Failed to clear custom levels:', error);
            return false;
        }
    }
}
