export class PathEditor {
    constructor(editorCore) {
        this.editor = editorCore;
        this.room = editorCore.room;
    }

    addPathPoint(x, y) {
        // Check if point already exists in path
        const existingIndex = this.editor.customPath.findIndex(p => p.x === x && p.y === y);
        
        if (existingIndex >= 0) {
            // Remove existing point
            this.editor.customPath.splice(existingIndex, 1);
            this.room.showMessage('Path point removed', 'info');
        } else {
            // Add new point
            this.editor.customPath.push({ x, y });
            this.room.showMessage(`Path point ${this.editor.customPath.length} added`, 'success');
        }
        
        // Auto-connect paths if they make sense
        this.optimizePath();
    }

    optimizePath() {
        if (this.editor.customPath.length < 2) return;
        
        // Sort path points to create a logical flow from left to right
        // This is a simple heuristic - could be improved with pathfinding
        this.editor.customPath.sort((a, b) => {
            if (Math.abs(a.x - b.x) > 1) {
                return a.x - b.x; // Sort by x primarily
            }
            return a.y - b.y; // Then by y
        });
    }

    validatePath() {
        if (this.editor.customPath.length < 2) {
            return { valid: false, error: 'Path must have at least 2 points' };
        }
        
        // Check if path has reasonable connectivity
        for (let i = 0; i < this.editor.customPath.length - 1; i++) {
            const current = this.editor.customPath[i];
            const next = this.editor.customPath[i + 1];
            
            const distance = Math.abs(current.x - next.x) + Math.abs(current.y - next.y);
            if (distance > 3) {
                return { 
                    valid: false, 
                    error: `Gap too large between points ${i + 1} and ${i + 2}` 
                };
            }
        }
        
        return { valid: true };
    }

    generateSmoothPath() {
        if (this.editor.customPath.length < 2) return this.editor.customPath;
        
        const smoothPath = [];
        
        for (let i = 0; i < this.editor.customPath.length - 1; i++) {
            const current = this.editor.customPath[i];
            const next = this.editor.customPath[i + 1];
            
            smoothPath.push(current);
            
            // Add intermediate points for smooth movement
            const dx = next.x - current.x;
            const dy = next.y - current.y;
            const steps = Math.max(Math.abs(dx), Math.abs(dy));
            
            for (let step = 1; step < steps; step++) {
                const t = step / steps;
                const interpolatedX = Math.round(current.x + dx * t);
                const interpolatedY = Math.round(current.y + dy * t);
                
                // Avoid duplicates
                if (!smoothPath.some(p => p.x === interpolatedX && p.y === interpolatedY)) {
                    smoothPath.push({ x: interpolatedX, y: interpolatedY });
                }
            }
        }
        
        // Add final point
        smoothPath.push(this.editor.customPath[this.editor.customPath.length - 1]);
        
        return smoothPath;
    }

    clearPath() {
        this.editor.customPath = [];
        this.room.showMessage('Path cleared', 'info');
    }
}
