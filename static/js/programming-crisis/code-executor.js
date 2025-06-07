export class CodeExecutor {
    constructor(room) {
        this.room = room;
        this.codeQueue = [];
        this.isExecuting = false;
        this.executionSpeed = 500; // ms between commands
    }

    executeCode() {
        if (this.isExecuting) return;
        
        const codeInput = document.getElementById('code-input');
        const code = codeInput.value.trim();
        
        if (!code) {
            this.room.showMessage('Please enter some code to execute!', 'error');
            return;
        }
        
        // Parse code into commands
        this.codeQueue = this.parseCode(code);
        
        if (this.codeQueue.length === 0) {
            this.room.showMessage('No valid commands found!', 'error');
            return;
        }
        
        this.isExecuting = true;
        this.updateExecutionDisplay();
        this.executeNextCommand();
    }

    parseCode(code) {
        const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        const commands = [];
        
        lines.forEach((line, index) => {
            const trimmed = line.trim();
            
            // Parse move commands
            if (trimmed.match(/move\s*\(\s*['"]?(up|down|left|right)['"]?\s*\)/i)) {
                const direction = trimmed.match(/['"]?(up|down|left|right)['"]?/i)[1].toLowerCase();
                commands.push({ type: 'move', direction, line: index + 1 });
            }
            
            // Parse attack commands
            else if (trimmed.match(/attack\s*\(\s*['"]?(up|down|left|right)['"]?\s*\)/i)) {
                const direction = trimmed.match(/['"]?(up|down|left|right)['"]?/i)[1].toLowerCase();
                commands.push({ type: 'attack', direction, line: index + 1 });
            }
            
            // Parse scan command
            else if (trimmed.match(/scan\s*\(\s*\)/i)) {
                commands.push({ type: 'scan', line: index + 1 });
            }
            
            // Parse wait command
            else if (trimmed.match(/wait\s*\(\s*\)/i)) {
                commands.push({ type: 'wait', line: index + 1 });
            }
            
            // Parse collect command
            else if (trimmed.match(/collect\s*\(\s*\)/i)) {
                commands.push({ type: 'collect', line: index + 1 });
            }
            
            // Parse use_item command
            else if (trimmed.match(/use_item\s*\(\s*['"]?\w+['"]?\s*\)/i)) {
                const item = trimmed.match(/use_item\s*\(\s*['"]?(\w+)['"]?\s*\)/i)[1];
                commands.push({ type: 'use_item', item, line: index + 1 });
            }
            
            // Invalid command
            else {
                commands.push({ type: 'error', message: `Syntax error on line ${index + 1}: ${trimmed}`, line: index + 1 });
            }
        });
        
        return commands;
    }

    executeNextCommand() {
        if (!this.isExecuting || this.codeQueue.length === 0) {
            this.isExecuting = false;
            this.updateExecutionDisplay();
            return;
        }
        
        const command = this.codeQueue.shift();
        
        // Handle error commands
        if (command.type === 'error') {
            this.room.showMessage(command.message, 'error');
            this.executeNextCommand();
            return;
        }
        
        // Execute command
        const result = this.executeCommand(command);
        
        if (result.success) {
            this.room.updateDisplay();
            this.room.gridManager.renderPlayer();
            this.room.gridManager.renderGameObjects();
            
            // Check for level completion
            if (this.room.bugs.length === 0) {
                this.room.levelComplete();
                return;
            }
            
            // Check for game over
            if (this.room.player.health <= 0) {
                this.room.gameOver();
                return;
            }
            
            // Continue execution
            setTimeout(() => {
                this.executeNextCommand();
            }, this.executionSpeed);
        } else {
            this.room.showMessage(result.message, 'error');
            this.isExecuting = false;
            this.updateExecutionDisplay();
        }
    }

    executeCommand(command) {
        switch (command.type) {
            case 'move':
                return this.room.playerActions.executeMove(command.direction);
            case 'attack':
                return this.room.playerActions.executeAttack(command.direction);
            case 'scan':
                return this.room.playerActions.executeScan();
            case 'wait':
                return this.room.playerActions.executeWait();
            case 'collect':
                return this.room.playerActions.executeCollect();
            case 'use_item':
                return this.room.playerActions.executeUseItem(command.item);
            default:
                return { success: false, message: 'Unknown command type' };
        }
    }

    stopExecution() {
        this.isExecuting = false;
        this.codeQueue = [];
        this.updateExecutionDisplay();
        this.room.showMessage('Code execution stopped.', 'info');
    }

    updateExecutionDisplay() {
        const statusDisplay = document.getElementById('execution-status');
        const queueDisplay = document.getElementById('queue-display');
        const executeBtn = document.getElementById('execute-code');
        const stopBtn = document.getElementById('stop-execution');
        
        if (statusDisplay) {
            statusDisplay.textContent = this.isExecuting ? 'EXECUTING' : 'READY';
            statusDisplay.className = `font-bold ${this.isExecuting ? 'text-yellow-400' : 'text-green-400'}`;
        }
        
        if (queueDisplay) {
            if (this.codeQueue.length > 0) {
                queueDisplay.innerHTML = this.codeQueue.map(cmd => 
                    `<div class="text-yellow-300">${cmd.type}${cmd.direction ? `('${cmd.direction}')` : '()'}</div>`
                ).join('');
            } else {
                queueDisplay.innerHTML = '<div class="text-gray-500">No commands queued</div>';
            }
        }
        
        if (executeBtn) executeBtn.disabled = this.isExecuting;
        if (stopBtn) stopBtn.disabled = !this.isExecuting;
    }
}
