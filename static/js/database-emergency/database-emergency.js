class Room4 {
    constructor(game) {
        this.game = game;
        this.corruptedTables = 8;
        this.recoveredTables = 0;
        this.dataIntegrity = 25; // %
        this.backupStatus = 'CORRUPTED';
        this.transactionLog = 'DAMAGED';
        this.selectedCommands = [];
        this.correctSequence = ['BACKUP_RESTORE', 'INTEGRITY_CHECK', 'INDEX_REBUILD', 'TRANSACTION_ROLLBACK'];
        this.attempts = 0;
        this.maxAttempts = 3;
        this.timeRemaining = 420; // 7 minutes
    }

    async init() {
        const response = await fetch('data/database-emergency.json');
        this.data = await response.json();
        this.render();
        this.startDatabaseTimer();
    }

    render() {
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="room-container p-6 fade-in">
                <div class="text-center mb-6">
                    <i class="bi bi-database-exclamation text-6xl text-red-500 animate-pulse"></i>
                    <h2 class="text-3xl font-bold mt-4 text-red-400">DATABASE CRITICAL FAILURE</h2>
                    <p class="text-gray-300 mt-2">Massive data corruption detected - Emergency recovery procedures required</p>
                </div>
                
                <div class="db-status grid grid-cols-4 gap-3 mb-6">
                    <div class="status-card bg-red-900 p-3 rounded text-center">
                        <i class="bi bi-exclamation-triangle text-red-400 text-xl"></i>
                        <p class="text-xs text-red-200">Corrupted Tables</p>
                        <p id="corrupted-count" class="text-lg font-bold text-red-100">${this.corruptedTables}/12</p>
                        <p class="text-xs text-red-300">Critical Loss</p>
                    </div>
                    <div class="status-card bg-orange-900 p-3 rounded text-center">
                        <i class="bi bi-shield-slash text-orange-400 text-xl"></i>
                        <p class="text-xs text-orange-200">Data Integrity</p>
                        <p id="data-integrity" class="text-lg font-bold text-orange-100">${this.dataIntegrity}%</p>
                        <p class="text-xs ${this.dataIntegrity > 70 ? 'text-green-400' : 'text-red-400'}">
                            ${this.dataIntegrity > 70 ? 'STABLE' : 'CRITICAL'}
                        </p>
                    </div>
                    <div class="status-card bg-blue-900 p-3 rounded text-center">
                        <i class="bi bi-hdd text-blue-400 text-xl"></i>
                        <p class="text-xs text-blue-200">Backup Status</p>
                        <p class="text-lg font-bold text-blue-100">${this.backupStatus}</p>
                        <p class="text-xs text-red-400">Damaged</p>
                    </div>
                    <div class="status-card bg-green-900 p-3 rounded text-center">
                        <i class="bi bi-check-circle text-green-400 text-xl"></i>
                        <p class="text-xs text-green-200">Recovered</p>
                        <p id="recovered-count" class="text-lg font-bold text-green-100">${this.recoveredTables}/12</p>
                        <p class="text-xs text-green-300">Tables</p>
                    </div>
                </div>

                <div class="challenge-content bg-gray-700 p-6 rounded-lg">
                    <div class="db-alert bg-red-900 border-2 border-red-500 p-4 rounded mb-4">
                        <h3 class="text-red-200 font-bold mb-2">💾 DATABASE EMERGENCY DETECTED</h3>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p class="text-red-100"><strong>Database:</strong> ${this.data.database_info.name}</p>
                                <p class="text-red-100"><strong>Incident:</strong> ${this.data.database_info.incident_type}</p>
                                <p class="text-red-100"><strong>Cause:</strong> ${this.data.database_info.failure_cause}</p>
                            </div>
                            <div>
                                <p class="text-red-100"><strong>Data Loss:</strong> ${this.data.database_info.data_loss}</p>
                                <p class="text-red-100"><strong>Impact:</strong> ${this.data.database_info.business_impact}</p>
                                <p class="text-red-100"><strong>Users Affected:</strong> ${this.data.database_info.affected_users}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="recovery-panel bg-black p-4 rounded mb-4">
                        <h4 class="text-white font-bold mb-3 text-center">🛠️ DATABASE RECOVERY OPERATIONS</h4>
                        <p class="text-gray-300 text-sm mb-4 text-center">Execute recovery commands in correct sequence to restore database integrity</p>
                        
                        <div class="command-grid grid grid-cols-2 gap-3">
                            ${this.data.recovery_commands.map((command, index) => `
                                <button class="command-btn ${this.getCommandStatus(command.id)} 
                                       p-3 rounded text-left transition-colors" 
                                       data-command="${command.id}">
                                    <div class="flex items-start">
                                        <span class="text-2xl mr-3">${command.icon}</span>
                                        <div>
                                            <div class="font-bold text-sm">${command.name}</div>
                                            <div class="text-xs text-gray-300 mt-1">${command.description}</div>
                                            <div class="text-xs mt-1">
                                                <span class="text-green-300">Risk: ${command.risk_level}</span>
                                                <span class="text-blue-300 ml-2">Time: ${command.execution_time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    ${this.getCommandStepNumber(command.id)}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="sequence-display bg-gray-800 p-4 rounded mb-4">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-300">Recovery Sequence:</span>
                            <span class="text-blue-400 font-mono">${this.selectedCommands.length}/4 commands selected</span>
                        </div>
                        <div class="command-sequence mt-2">
                            <span class="text-gray-400">Order: </span>
                            ${this.selectedCommands.map((cmd, index) => `<span class="text-green-400">${index + 1}. ${cmd}</span>`).join(' → ')}
                        </div>
                    </div>
                    
                    <div class="db-metrics bg-gray-800 p-4 rounded mb-4">
                        <h4 class="font-bold text-gray-200 mb-3">📊 Database Health Metrics</h4>
                        <div class="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p class="text-blue-300">Active Connections: <span class="text-white font-mono">247</span></p>
                                <p class="text-green-300">Query Response: <span class="text-white font-mono">8.7s</span></p>
                                <p class="text-yellow-300">Lock Waits: <span class="text-white font-mono">156</span></p>
                            </div>
                            <div>
                                <p class="text-purple-300">Buffer Hit Ratio: <span class="text-white font-mono">23%</span></p>
                                <p class="text-orange-300">Deadlocks: <span class="text-white font-mono">47</span></p>
                                <p class="text-red-300">Failed Queries: <span class="text-white font-mono">2,891</span></p>
                            </div>
                            <div>
                                <p class="text-cyan-300">Log File Size: <span class="text-white font-mono">847 GB</span></p>
                                <p class="text-pink-300">Index Fragmentation: <span class="text-red-400">89%</span></p>
                                <p class="text-lime-300">Backup Age: <span class="text-yellow-400">72 hours</span></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="control-buttons text-center mb-4">
                        <button id="execute-recovery" class="btn-primary px-6 py-3 rounded mr-4" 
                                ${this.selectedCommands.length !== 4 ? 'disabled' : ''}>
                            <i class="bi bi-play-fill"></i> Execute Recovery
                        </button>
                        <button id="reset-sequence" class="bg-gray-600 hover:bg-gray-500 px-6 py-3 rounded transition-colors mr-4">
                            <i class="bi bi-arrow-clockwise"></i> Reset Sequence
                        </button>
                        <button id="emergency-rollback" class="bg-red-600 hover:bg-red-500 px-6 py-3 rounded transition-colors">
                            <i class="bi bi-skip-backward"></i> Emergency Rollback
                        </button>
                    </div>
                    
                    <div class="timer-warning text-center">
                        <span class="text-orange-300">Time Remaining: <span id="db-timer">${Math.floor(this.timeRemaining / 60)}:${(this.timeRemaining % 60).toString().padStart(2, '0')}</span></span>
                        <br><span class="text-gray-400 text-sm">Data corruption spreading - Recovery window closing</span>
                        <br><span class="text-purple-400 text-sm">Attempts remaining: ${this.maxAttempts - this.attempts}</span>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.command-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectCommand(e.target.closest('.command-btn').dataset.command);
            });
        });

        document.getElementById('execute-recovery').addEventListener('click', () => {
            this.executeRecovery();
        });

        document.getElementById('reset-sequence').addEventListener('click', () => {
            this.resetSequence();
        });

        document.getElementById('emergency-rollback').addEventListener('click', () => {
            this.emergencyRollback();
        });
    }

    getCommandStatus(commandId) {
        const stepIndex = this.selectedCommands.indexOf(commandId);
        if (stepIndex !== -1) {
            return 'selected bg-blue-700 border-2 border-blue-400';
        }
        return 'bg-gray-600 hover:bg-gray-500';
    }

    getCommandStepNumber(commandId) {
        const stepIndex = this.selectedCommands.indexOf(commandId);
        if (stepIndex !== -1) {
            return `<div class="text-blue-400 text-xs mt-2">Step ${stepIndex + 1}</div>`;
        }
        return '';
    }

    selectCommand(commandId) {
        if (this.selectedCommands.includes(commandId)) {
            // Remove command and all commands after it
            const index = this.selectedCommands.indexOf(commandId);
            this.selectedCommands = this.selectedCommands.slice(0, index);
        } else if (this.selectedCommands.length < 4) {
            this.selectedCommands.push(commandId);
        }
        
        this.render();
    }

    resetSequence() {
        this.selectedCommands = [];
        this.render();
    }

    executeRecovery() {
        this.attempts++;
        
        // Check if sequence matches the correct recovery order
        const isCorrectSequence = JSON.stringify(this.selectedCommands) === JSON.stringify(this.correctSequence);
        
        if (isCorrectSequence) {
            this.databaseRecovered();
        } else {
            if (this.attempts >= this.maxAttempts) {
                this.game.gameOver('Database recovery failed! Complete data loss - All customer records and business data permanently destroyed.');
            } else {
                this.showRecoveryFailure();
            }
        }
    }

    databaseRecovered() {
        clearInterval(this.databaseTimer);
        
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="database-recovered text-center p-8">
                <i class="bi bi-database-check text-8xl text-green-400 mb-4 animate-bounce"></i>
                <h2 class="text-3xl font-bold text-green-400 mb-4">DATABASE RECOVERED</h2>
                
                <div class="final-metrics grid grid-cols-4 gap-4 mb-6">
                    <div class="bg-green-800 p-3 rounded">
                        <p class="text-green-200">Data Integrity</p>
                        <p class="text-xl font-bold text-green-400">98%</p>
                        <p class="text-xs text-green-300">✓ Restored</p>
                    </div>
                    <div class="bg-blue-800 p-3 rounded">
                        <p class="text-blue-200">Tables Recovered</p>
                        <p class="text-xl font-bold text-blue-400">12/12</p>
                        <p class="text-xs text-blue-300">✓ Complete</p>
                    </div>
                    <div class="bg-purple-800 p-3 rounded">
                        <p class="text-purple-200">Backup Status</p>
                        <p class="text-xl font-bold text-purple-400">HEALTHY</p>
                        <p class="text-xs text-purple-300">✓ Verified</p>
                    </div>
                    <div class="bg-yellow-800 p-3 rounded">
                        <p class="text-yellow-200">Performance</p>
                        <p class="text-xl font-bold text-yellow-400">Optimal</p>
                        <p class="text-xs text-yellow-300">✓ Enhanced</p>
                    </div>
                </div>
                
                <div class="recovery-report bg-gray-800 p-4 rounded mb-4">
                    <h4 class="font-bold text-gray-200 mb-2">💾 Database Recovery Report</h4>
                    <div class="text-left text-sm text-gray-300">
                        <p>✅ Emergency backup restoration completed successfully</p>
                        <p>✅ Data integrity checks passed with 98% recovery rate</p>
                        <p>✅ Database indexes rebuilt and optimized</p>
                        <p>✅ Transaction logs rolled back to stable state</p>
                        <p>✅ All critical business data preserved and accessible</p>
                        <p>✅ Performance metrics restored to optimal levels</p>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            this.game.roomCompleted(`Database emergency resolved! Critical data recovery completed with 98% success rate. All business operations restored and database performance optimized.`);
        }, 3000);
    }

    showRecoveryFailure() {
        this.showFeedback(false, 
            `❌ RECOVERY SEQUENCE INCORRECT\n\nDatabase corruption accelerated!\nCorrect sequence: ${this.correctSequence.join(' → ')}\nYour sequence: ${this.selectedCommands.join(' → ')}\n\nData loss increasing - recalculate recovery strategy...`);
        
        setTimeout(() => {
            this.selectedCommands = [];
            this.render();
        }, 4000);
    }

    emergencyRollback() {
        this.game.gameOver('Emergency database rollback initiated! System restored to 72-hour old backup - Recent data permanently lost.');
    }

    startDatabaseTimer() {
        this.databaseTimer = setInterval(() => {
            this.timeRemaining--;
            
            // Update display
            const timerDisplay = document.getElementById('db-timer');
            if (timerDisplay) {
                timerDisplay.textContent = `${Math.floor(this.timeRemaining / 60)}:${(this.timeRemaining % 60).toString().padStart(2, '0')}`;
            }
            
            // Database degradation
            this.corruptedTables = Math.min(12, this.corruptedTables + 0.1);
            this.dataIntegrity = Math.max(0, this.dataIntegrity - 0.5);
            
            // Update displays
            const corruptedDisplay = document.getElementById('corrupted-count');
            const integrityDisplay = document.getElementById('data-integrity');
            
            if (corruptedDisplay) corruptedDisplay.textContent = `${Math.round(this.corruptedTables)}/12`;
            if (integrityDisplay) integrityDisplay.textContent = `${Math.round(this.dataIntegrity)}%`;
            
            if (this.timeRemaining <= 0 || this.dataIntegrity <= 0) {
                clearInterval(this.databaseTimer);
                this.game.gameOver('Database corruption complete! All data permanently lost - Business operations terminated.');
            }
        }, 1000);
    }

    showFeedback(correct, message) {
        const content = document.querySelector('.challenge-content');
        const existing = content.querySelector('.feedback');
        if (existing) existing.remove();
        
        const feedback = document.createElement('div');
        feedback.className = `feedback mt-4 p-3 rounded ${correct ? 'bg-green-700' : 'bg-red-700'}`;
        feedback.innerHTML = `<pre class="whitespace-pre-wrap text-sm">${message}</pre>`;
        content.appendChild(feedback);
        
        setTimeout(() => feedback.remove(), 4000);
    }
}

// Register the class globally
window.Room4 = Room4;
