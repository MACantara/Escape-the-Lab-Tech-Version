class Room4 {
    constructor(game) {
        this.game = game;
        this.corruptedTables = 8;
        this.recoveredTables = 0;
        this.dataIntegrity = 25; // %
        this.backupStatus = 'CORRUPTED';
        this.transactionLog = 'DAMAGED';
        this.currentStep = 'assessment';
        this.sqlCommands = [];
        this.timeRemaining = 420; // 7 minutes
        this.sqlEditor = null;
        this.queryResults = [];
        this.tablesStatus = {
            'users': 'corrupted',
            'orders': 'corrupted', 
            'products': 'corrupted',
            'payments': 'corrupted',
            'inventory': 'corrupted',
            'customers': 'corrupted',
            'transactions': 'corrupted',
            'audit_log': 'corrupted'
        };
        
        // Command history
        this.commandHistory = [];
        this.commandHistoryIndex = -1;
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
                    <p class="text-gray-300 mt-2">Execute SQL commands to recover corrupted database</p>
                </div>
                
                <div class="db-status grid grid-cols-4 gap-3 mb-6">
                    <div class="status-card bg-red-900 p-3 rounded text-center">
                        <i class="bi bi-exclamation-triangle text-red-400 text-xl"></i>
                        <p class="text-xs text-red-200">Corrupted Tables</p>
                        <p id="corrupted-count" class="text-lg font-bold text-red-100">${this.corruptedTables}/8</p>
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
                        <i class="bi bi-clock text-blue-400 text-xl"></i>
                        <p class="text-xs text-blue-200">Recovery Time</p>
                        <p id="db-timer" class="text-lg font-bold text-blue-100">${Math.floor(this.timeRemaining / 60)}:${(this.timeRemaining % 60).toString().padStart(2, '0')}</p>
                        <p class="text-xs text-blue-300">Remaining</p>
                    </div>
                    <div class="status-card bg-green-900 p-3 rounded text-center">
                        <i class="bi bi-check-circle text-green-400 text-xl"></i>
                        <p class="text-xs text-green-200">Recovery Progress</p>
                        <p id="recovery-progress" class="text-lg font-bold text-green-100">${this.recoveredTables}/8</p>
                        <p class="text-xs text-green-300">Tables Fixed</p>
                    </div>
                </div>

                <div class="challenge-content bg-gray-700 p-6 rounded-lg">
                    ${this.renderCurrentStep()}
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    renderCurrentStep() {
        switch(this.currentStep) {
            case 'assessment':
                return this.renderAssessmentStep();
            case 'backup':
                return this.renderBackupStep();
            case 'recovery':
                return this.renderRecoveryStep();
            case 'verification':
                return this.renderVerificationStep();
            default:
                return this.renderAssessmentStep();
        }
    }

    renderAssessmentStep() {
        return `
            <div class="assessment-step">
                <h3 class="text-xl font-bold text-blue-400 mb-4">📊 Database Assessment</h3>
                <p class="text-gray-300 mb-4">Run diagnostic queries to assess database corruption</p>
                
                <div class="sql-terminal bg-black p-4 rounded mb-4">
                    <div class="terminal-header bg-gray-800 p-2 rounded-t flex justify-between items-center">
                        <span class="text-green-400">MySQL Terminal</span>
                        <span class="text-gray-400">Server version: 8.0.35</span>
                    </div>
                    <div class="terminal-body p-4" style="min-height: 300px; max-height: 400px; overflow-y: auto;">
                        <div id="terminal-output" class="font-mono text-sm text-gray-300 mb-3">
                            <div class="text-blue-400">MySQL [CriticalBusiness_DB]> </div>
                            <div class="text-gray-400 mb-2">Welcome to the MySQL monitor. Commands end with ; or \\g.</div>
                            <div class="text-gray-400 mb-2">Database connection established. Type 'help;' or '\\h' for help.</div>
                            <div class="text-gray-400 mb-4">Emergency recovery mode active.</div>
                        </div>
                        <div class="terminal-input flex items-center">
                            <span class="text-blue-400 mr-2">mysql> </span>
                            <input type="text" id="sql-command" 
                                   class="flex-1 bg-transparent text-green-400 font-mono border-none outline-none"
                                   placeholder="Enter SQL command..."
                                   autocomplete="off">
                        </div>
                    </div>
                    <div class="terminal-footer p-2 border-t border-gray-600">
                        <button id="execute-sql" class="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-sm">
                            <i class="bi bi-play-fill"></i> Execute (Enter)
                        </button>
                        <button id="clear-terminal" class="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-sm ml-2">
                            <i class="bi bi-trash"></i> Clear History
                        </button>
                        <span class="text-gray-400 text-xs ml-4">Tip: Press Enter to execute, use ↑↓ for command history</span>
                    </div>
                </div>
                
                <div class="diagnostic-hint bg-blue-900 p-3 rounded">
                    <p class="text-blue-200 text-sm">
                        <strong>Emergency Commands:</strong> 
                        <code>SHOW TABLES;</code> | 
                        <code>CHECK TABLE tablename;</code> | 
                        <code>SHOW STATUS;</code> | 
                        <code>DESCRIBE tablename;</code> |
                        <code>CLEAR;</code>
                    </p>
                </div>
            </div>
        `;
    }

    renderBackupStep() {
        return `
            <div class="backup-step">
                <h3 class="text-xl font-bold text-yellow-400 mb-4">💾 Backup Recovery</h3>
                <p class="text-gray-300 mb-4">Locate and restore from available backups</p>
                
                <div class="backup-browser bg-black p-4 rounded mb-4">
                    <h4 class="text-white mb-3">Available Backups:</h4>
                    <div class="backup-list space-y-2">
                        ${this.data.available_backups.map((backup, index) => `
                            <div class="backup-item p-3 bg-gray-800 rounded cursor-pointer hover:bg-gray-700 transition-colors"
                                 data-backup="${backup.id}">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <div class="font-bold text-white">${backup.filename}</div>
                                        <div class="text-sm text-gray-400">${backup.date} - ${backup.size}</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm font-bold ${backup.integrity > 80 ? 'text-green-400' : backup.integrity > 50 ? 'text-yellow-400' : 'text-red-400'}">
                                            ${backup.integrity}% integrity
                                        </div>
                                        <div class="text-xs text-gray-400">${backup.tables_affected} tables</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="restore-command bg-gray-800 p-4 rounded mb-4">
                    <h4 class="text-white mb-2">Restore Command:</h4>
                    <div class="command-preview bg-black p-3 rounded font-mono text-green-400 text-sm">
                        <span id="restore-preview">Select a backup to generate restore command...</span>
                    </div>
                    <button id="execute-restore" class="mt-3 bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded" disabled>
                        <i class="bi bi-download"></i> Execute Restore
                    </button>
                </div>
            </div>
        `;
    }

    renderRecoveryStep() {
        return `
            <div class="recovery-step">
                <h3 class="text-xl font-bold text-purple-400 mb-4">🔧 Manual Recovery</h3>
                <p class="text-gray-300 mb-4">Fix corrupted tables using repair commands</p>
                
                <div class="tables-grid grid grid-cols-2 gap-3 mb-4">
                    ${Object.entries(this.tablesStatus).map(([table, status]) => `
                        <div class="table-card p-3 rounded cursor-pointer transition-colors
                             ${status === 'corrupted' ? 'bg-red-900 border-red-500' : 
                               status === 'repairing' ? 'bg-yellow-900 border-yellow-500' : 
                               'bg-green-900 border-green-500'} border"
                             data-table="${table}">
                            <div class="flex justify-between items-center">
                                <div>
                                    <div class="font-bold text-white">${table}</div>
                                    <div class="text-xs text-gray-300">${this.getTableDescription(table)}</div>
                                </div>
                                <div class="text-right">
                                    <div class="text-sm font-bold capitalize ${status === 'corrupted' ? 'text-red-400' : 
                                          status === 'repairing' ? 'text-yellow-400' : 'text-green-400'}">
                                        ${status}
                                    </div>
                                    ${status === 'corrupted' ? '<i class="bi bi-exclamation-triangle text-red-400"></i>' :
                                      status === 'repairing' ? '<i class="bi bi-gear animate-spin text-yellow-400"></i>' :
                                      '<i class="bi bi-check-circle text-green-400"></i>'}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="repair-terminal bg-black p-4 rounded mb-4">
                    <div class="terminal-header bg-gray-800 p-2 rounded-t">
                        <span class="text-purple-400">Database Repair Terminal</span>
                    </div>
                    <div class="terminal-body p-4">
                        <div id="repair-output" class="font-mono text-sm text-gray-300 mb-3" style="min-height: 100px; max-height: 150px; overflow-y: auto;">
                            <div class="text-blue-400">Database repair console ready...</div>
                        </div>
                        <div class="repair-input flex gap-2">
                            <input type="text" id="repair-command" 
                                   class="flex-1 bg-gray-800 text-white px-3 py-2 rounded font-mono text-sm"
                                   placeholder="Enter repair command (e.g., REPAIR TABLE users;)
                                   autocomplete="off">
                            <button id="execute-repair" class="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded text-sm">
                                Execute
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="repair-hints bg-purple-900 p-3 rounded">
                    <p class="text-purple-200 text-sm">
                        <strong>Commands:</strong> 
                        <code>REPAIR TABLE tablename;</code> | 
                        <code>OPTIMIZE TABLE tablename;</code> | 
                        <code>ANALYZE TABLE tablename;</code>
                    </p>
                </div>
            </div>
        `;
    }

    renderVerificationStep() {
        return `
            <div class="verification-step">
                <h3 class="text-xl font-bold text-green-400 mb-4">✅ Data Verification</h3>
                <p class="text-gray-300 mb-4">Verify data integrity and run final checks</p>
                
                <div class="verification-tests bg-gray-800 p-4 rounded mb-4">
                    <h4 class="text-white mb-3">Integrity Tests:</h4>
                    <div class="test-list space-y-2">
                        ${this.data.verification_tests.map((test, index) => `
                            <div class="test-item p-3 bg-gray-700 rounded">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <div class="font-bold text-white">${test.name}</div>
                                        <div class="text-sm text-gray-400">${test.description}</div>
                                    </div>
                                    <button class="run-test bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm"
                                            data-test="${test.id}">
                                        Run Test
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="test-results bg-black p-4 rounded">
                    <h4 class="text-white mb-2">Test Results:</h4>
                    <div id="test-output" class="font-mono text-sm text-gray-300">
                        No tests run yet...
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // SQL execution
        document.getElementById('execute-sql')?.addEventListener('click', () => {
            this.executeSQLCommand();
        });

        document.getElementById('sql-command')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.executeSQLCommand();
            }
        });

        // Command history navigation
        document.getElementById('sql-command')?.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory('up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory('down');
            }
        });

        document.getElementById('clear-terminal')?.addEventListener('click', () => {
            this.clearTerminal();
        });

        // Backup selection
        document.querySelectorAll('.backup-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectBackup(item.dataset.backup);
            });
        });

        document.getElementById('execute-restore')?.addEventListener('click', () => {
            this.executeRestore();
        });

        // Table repair
        document.getElementById('execute-repair')?.addEventListener('click', () => {
            this.executeRepairCommand();
        });

        document.getElementById('repair-command')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.executeRepairCommand();
            }
        });

        // Verification tests
        document.querySelectorAll('.run-test').forEach(btn => {
            btn.addEventListener('click', () => {
                this.runVerificationTest(btn.dataset.test);
            });
        });
    }

    executeSQLCommand() {
        const sqlInput = document.getElementById('sql-command');
        const terminalOutput = document.getElementById('terminal-output');
        const command = sqlInput.value.trim();

        if (!command) return;

        // Add command to terminal output
        const commandDiv = document.createElement('div');
        commandDiv.className = 'mb-2';
        commandDiv.innerHTML = `<span class="text-blue-400">mysql> </span><span class="text-white">${command}</span>`;
        terminalOutput.appendChild(commandDiv);

        // Process command and generate result
        const result = this.processSQL(command.toUpperCase());
        
        // Add result to terminal output
        const resultDiv = document.createElement('div');
        resultDiv.className = 'mb-3';
        resultDiv.innerHTML = result;
        terminalOutput.appendChild(resultDiv);

        // Scroll to bottom
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        
        // Clear input
        sqlInput.value = '';
        
        // Add command to history
        this.addToCommandHistory(command);
    }

    processSQL(command) {
        if (command.includes('SHOW TABLES')) {
            return this.generateShowTablesResult();
        } else if (command.includes('CHECK TABLE')) {
            const tableName = command.match(/CHECK TABLE (\w+)/)?.[1]?.toLowerCase();
            return this.generateCheckTableResult(tableName);
        } else if (command.includes('SHOW STATUS')) {
            return this.generateShowStatusResult();
        } else if (command.includes('DESCRIBE') || command.includes('DESC')) {
            const tableName = command.match(/DESC(?:RIBE)?\s+(\w+)/)?.[1]?.toLowerCase();
            return this.generateDescribeTableResult(tableName);
        } else if (command.includes('SELECT')) {
            return this.generateSelectResult(command);
        } else if (command.includes('HELP') || command.includes('\\H')) {
            return this.generateHelpResult();
        } else if (command.includes('CLEAR') || command === 'CLS') {
            this.clearTerminal();
            return '';
        } else if (command.includes('HISTORY')) {
            return this.generateHistoryResult();
        } else {
            return '<div class="text-red-400">ERROR 1064 (42000): Command not recognized or not safe in recovery mode</div><div class="text-gray-400">Type \'help;\' for available emergency commands.</div>';
        }
    }

    generateShowTablesResult() {
        const result = `
            <div class="text-green-400">+------------------+</div>
            <div class="text-green-400">| Tables_in_db     |</div>
            <div class="text-green-400">+------------------+</div>
            ${Object.keys(this.tablesStatus).map(table => 
                `<div class="text-gray-300">| ${table.padEnd(16)} |</div>`
            ).join('')}
            <div class="text-green-400">+------------------+</div>
            <div class="text-blue-400">${Object.keys(this.tablesStatus).length} rows in set (0.01 sec)</div>
        `;
        return result;
    }

    generateCheckTableResult(tableName) {
        if (!tableName || !this.tablesStatus[tableName]) {
            return '<div class="text-red-400">ERROR 1146 (42S02): Table doesn\'t exist</div>';
        }

        const status = this.tablesStatus[tableName];
        const statusText = status === 'corrupted' ? 'Corrupted' : status === 'repairing' ? 'Under repair' : 'OK';
        const statusColor = status === 'corrupted' ? 'text-red-400' : status === 'repairing' ? 'text-yellow-400' : 'text-green-400';
        
        const result = `
            <div class="text-green-400">+----------+--------+----------+----------+</div>
            <div class="text-green-400">| Table    | Op     | Msg_type | Msg_text |</div>
            <div class="text-green-400">+----------+--------+----------+----------+</div>
            <div class="text-gray-300">| ${tableName.padEnd(8)} | check  | status   | <span class="${statusColor}">${statusText.padEnd(8)}</span> |</div>
            ${status === 'corrupted' ? `<div class="text-gray-300">| ${tableName.padEnd(8)} | check  | warning  | <span class="text-orange-400">1 client is using or hasn't closed the table properly</span> |</div>` : ''}
            ${status === 'corrupted' ? `<div class="text-gray-300">| ${tableName.padEnd(8)} | check  | error    | <span class="text-red-400">Table '${tableName}' is marked as crashed and should be repaired</span> |</div>` : ''}
            <div class="text-green-400">+----------+--------+----------+----------+</div>
            <div class="text-blue-400">1 row in set (0.03 sec)</div>
        `;

        // Progress assessment
        if (status === 'corrupted') {
            this.assessmentProgress = (this.assessmentProgress || 0) + 1;
            if (this.assessmentProgress >= 3) {
                setTimeout(() => this.proceedToBackup(), 2000);
            }
        }

        return result;
    }

    generateShowStatusResult() {
        return `
            <div class="text-green-400">+---------------------------+-------+</div>
            <div class="text-green-400">| Variable_name             | Value |</div>
            <div class="text-green-400">+---------------------------+-------+</div>
            <div class="text-gray-300">| Connections               | 847   |</div>
            <div class="text-gray-300">| Created_tmp_tables        | 23891 |</div>
            <div class="text-gray-300">| Handler_read_first        | 4567  |</div>
            <div class="text-gray-300">| Innodb_buffer_pool_reads  | <span class="text-red-400">98234</span> |</div>
            <div class="text-gray-300">| Innodb_data_reads         | <span class="text-red-400">45678</span> |</div>
            <div class="text-gray-300">| Questions                 | 23456 |</div>
            <div class="text-gray-300">| Slow_queries              | <span class="text-yellow-400">1247</span>  |</div>
            <div class="text-gray-300">| Threads_connected         | 156   |</div>
            <div class="text-gray-300">| Uptime                    | <span class="text-red-400">847</span>   |</div>
            <div class="text-green-400">+---------------------------+-------+</div>
            <div class="text-blue-400">9 rows in set (0.02 sec)</div>
            <div class="text-yellow-400">Warning: High buffer pool reads indicate potential corruption</div>
        `;
    }

    generateDescribeTableResult(tableName) {
        if (!tableName || !this.tablesStatus[tableName]) {
            return '<div class="text-red-400">ERROR 1146 (42S02): Table doesn\'t exist</div>';
        }

        const tableStructures = {
            'users': [
                ['id', 'int(11)', 'NO', 'PRI', 'NULL', 'auto_increment'],
                ['username', 'varchar(50)', 'NO', 'UNI', 'NULL', ''],
                ['email', 'varchar(100)', 'NO', '', 'NULL', ''],
                ['password_hash', 'varchar(255)', 'NO', '', 'NULL', ''],
                ['created_at', 'timestamp', 'NO', '', 'CURRENT_TIMESTAMP', '']
            ],
            'orders': [
                ['order_id', 'int(11)', 'NO', 'PRI', 'NULL', 'auto_increment'],
                ['user_id', 'int(11)', 'NO', 'MUL', 'NULL', ''],
                ['total_amount', 'decimal(10,2)', 'NO', '', 'NULL', ''],
                ['order_date', 'timestamp', 'NO', '', 'CURRENT_TIMESTAMP', ''],
                ['status', 'enum(\'pending\',\'shipped\',\'delivered\')', 'NO', '', 'pending', '']
            ]
        };

        const structure = tableStructures[tableName] || [
            ['id', 'int(11)', 'NO', 'PRI', 'NULL', 'auto_increment'],
            ['data', 'text', 'YES', '', 'NULL', ''],
            ['created_at', 'timestamp', 'NO', '', 'CURRENT_TIMESTAMP', '']
        ];

        let result = `
            <div class="text-green-400">+-------------+-------------+------+-----+---------+----------------+</div>
            <div class="text-green-400">| Field       | Type        | Null | Key | Default | Extra          |</div>
            <div class="text-green-400">+-------------+-------------+------+-----+---------+----------------+</div>
        `;

        structure.forEach(([field, type, nullVal, key, defaultVal, extra]) => {
            result += `<div class="text-gray-300">| ${field.padEnd(11)} | ${type.padEnd(11)} | ${nullVal.padEnd(4)} | ${key.padEnd(3)} | ${defaultVal.padEnd(7)} | ${extra.padEnd(14)} |</div>`;
        });

        result += `
            <div class="text-green-400">+-------------+-------------+------+-----+---------+----------------+</div>
            <div class="text-blue-400">${structure.length} rows in set (0.01 sec)</div>
        `;

        return result;
    }

    generateSelectResult(command) {
        // Basic simulation of SELECT results
        if (command.includes('COUNT')) {
            return `
                <div class="text-green-400">+----------+</div>
                <div class="text-green-400">| COUNT(*) |</div>
                <div class="text-green-400">+----------+</div>
                <div class="text-gray-300">|    23891 |</div>
                <div class="text-green-400">+----------+</div>
                <div class="text-blue-400">1 row in set (0.15 sec)</div>
                <div class="text-yellow-400">Warning: Query execution time high due to table corruption</div>
            `;
        }
        return '<div class="text-red-400">ERROR 1030 (HY000): Got error 145 "Table was marked as crashed" from storage engine</div>';
    }

    generateHelpResult() {
        return `
            <div class="text-cyan-400">Emergency Database Recovery Commands:</div>
            <div class="text-gray-300 mt-2">
                <div class="mb-1"><span class="text-green-400">SHOW TABLES;</span>                - List all tables in database</div>
                <div class="mb-1"><span class="text-green-400">CHECK TABLE tablename;</span>      - Check table for corruption</div>
                <div class="mb-1"><span class="text-green-400">DESCRIBE tablename;</span>         - Show table structure</div>
                <div class="mb-1"><span class="text-green-400">SHOW STATUS;</span>                - Display server status variables</div>
                <div class="mb-1"><span class="text-green-400">SELECT COUNT(*) FROM table;</span> - Count rows (if accessible)</div>
                <div class="mb-1"><span class="text-green-400">CLEAR;</span>                      - Clear terminal history</div>
                <div class="mb-1"><span class="text-green-400">HISTORY;</span>                    - Show command history</div>
                <div class="mb-1"><span class="text-yellow-400">REPAIR TABLE tablename;</span>     - Available in recovery mode</div>
                <div class="mb-1"><span class="text-yellow-400">OPTIMIZE TABLE tablename;</span>   - Available in recovery mode</div>
            </div>
            <div class="text-blue-400 mt-2">Use ↑↓ arrow keys to navigate command history</div>
        `;
    }

    generateHistoryResult() {
        if (this.commandHistory.length === 0) {
            return '<div class="text-gray-400">No commands in history</div>';
        }

        let result = `
            <div class="text-cyan-400">Command History (${this.commandHistory.length} commands):</div>
            <div class="text-gray-300 mt-2">
        `;
        
        this.commandHistory.forEach((cmd, index) => {
            result += `<div class="mb-1"><span class="text-yellow-400">${index + 1}:</span> <span class="text-gray-200">${cmd}</span></div>`;
        });

        result += `
            </div>
            <div class="text-blue-400 mt-2">Use ↑↓ keys to navigate history or 'CLEAR;' to reset</div>
        `;

        return result;
    }

    clearTerminal() {
        const terminalOutput = document.getElementById('terminal-output');
        terminalOutput.innerHTML = `
            <div class="text-blue-400">MySQL [CriticalBusiness_DB]> </div>
            <div class="text-gray-400 mb-2">Terminal cleared. Emergency recovery mode active.</div>
            <div class="text-gray-400 mb-4">Type 'help;' for available commands.</div>
        `;
        
        // Clear command history
        this.commandHistory = [];
        this.commandHistoryIndex = -1;
        
        // Show confirmation
        const clearConfirm = document.createElement('div');
        clearConfirm.className = 'text-green-400 mb-2';
        clearConfirm.textContent = 'Terminal and command history cleared.';
        terminalOutput.appendChild(clearConfirm);
    }

    addToCommandHistory(command) {
        // Don't add empty commands or duplicate consecutive commands
        if (!command.trim() || (this.commandHistory.length > 0 && this.commandHistory[this.commandHistory.length - 1] === command)) {
            return;
        }
        
        this.commandHistory.push(command);
        this.commandHistoryIndex = this.commandHistory.length;
        
        // Limit history to last 50 commands
        if (this.commandHistory.length > 50) {
            this.commandHistory.shift();
            this.commandHistoryIndex = this.commandHistory.length;
        }
    }

    navigateHistory(direction) {
        const sqlInput = document.getElementById('sql-command');
        
        if (this.commandHistory.length === 0) return;
        
        if (direction === 'up') {
            if (this.commandHistoryIndex > 0) {
                this.commandHistoryIndex--;
                sqlInput.value = this.commandHistory[this.commandHistoryIndex];
            }
        } else if (direction === 'down') {
            if (this.commandHistoryIndex < this.commandHistory.length - 1) {
                this.commandHistoryIndex++;
                sqlInput.value = this.commandHistory[this.commandHistoryIndex];
            } else {
                this.commandHistoryIndex = this.commandHistory.length;
                sqlInput.value = '';
            }
        }
        
        // Move cursor to end
        setTimeout(() => {
            sqlInput.setSelectionRange(sqlInput.value.length, sqlInput.value.length);
        }, 0);
    }

    proceedToBackup() {
        this.showMessage('Assessment complete! Proceeding to backup recovery...', 'info');
        this.currentStep = 'backup';
        this.assessmentProgress = 0;
        setTimeout(() => this.render(), 1500);
    }

    getTableDescription(tableName) {
        const descriptions = {
            'users': 'User accounts and profiles',
            'orders': 'Customer orders and history',
            'products': 'Product catalog',
            'payments': 'Payment transactions',
            'inventory': 'Stock management',
            'customers': 'Customer information',
            'transactions': 'Financial records',
            'audit_log': 'System audit trail'
        };
        return descriptions[tableName] || 'Database table';
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `fixed top-20 right-4 p-3 rounded z-50 animate-pulse`;
        
        switch(type) {
            case 'success':
                messageDiv.classList.add('bg-green-800', 'text-green-200');
                break;
            case 'error':
                messageDiv.classList.add('bg-red-800', 'text-red-200');
                break;
            case 'info':
                messageDiv.classList.add('bg-blue-800', 'text-blue-200');
                break;
        }
        
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => messageDiv.remove(), 3000);
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
                        <p class="text-xl font-bold text-green-400">${Math.round(this.dataIntegrity)}%</p>
                        <p class="text-xs text-green-300">✓ Restored</p>
                    </div>
                    <div class="bg-blue-800 p-3 rounded">
                        <p class="text-blue-200">Tables Recovered</p>
                        <p class="text-xl font-bold text-blue-400">${this.recoveredTables}/8</p>
                        <p class="text-xs text-blue-300">✓ Complete</p>
                    </div>
                    <div class="bg-purple-800 p-3 rounded">
                        <p class="text-purple-200">Commands Used</p>
                        <p class="text-xl font-bold text-purple-400">${this.sqlCommands.length}</p>
                        <p class="text-xs text-purple-300">✓ Expert Level</p>
                    </div>
                    <div class="bg-yellow-800 p-3 rounded">
                        <p class="text-yellow-200">Recovery Time</p>
                        <p class="text-xl font-bold text-yellow-400">${Math.floor((420 - this.timeRemaining) / 60)}m</p>
                        <p class="text-xs text-yellow-300">✓ Efficient</p>
                    </div>
                </div>
                
                <div class="recovery-report bg-gray-800 p-4 rounded mb-4">
                    <h4 class="font-bold text-gray-200 mb-2">💾 Database Recovery Report</h4>
                    <div class="text-left text-sm text-gray-300">
                        <p>✅ Database assessment completed using SQL diagnostics</p>
                        <p>✅ Backup recovery executed with optimal integrity selection</p>
                        <p>✅ Manual table repairs performed using REPAIR commands</p>
                        <p>✅ Data verification tests passed with full integrity</p>
                        <p>✅ All critical business data preserved and accessible</p>
                        <p>✅ Database performance restored to optimal levels</p>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            this.game.roomCompleted(`Database emergency resolved through expert SQL recovery! ${this.recoveredTables}/8 tables recovered with ${Math.round(this.dataIntegrity)}% data integrity using hands-on database administration.`);
        }, 3000);
    }

    startDatabaseTimer() {
        this.databaseTimer = setInterval(() => {
            this.timeRemaining--;
            
            const timerDisplay = document.getElementById('db-timer');
            if (timerDisplay) {
                timerDisplay.textContent = `${Math.floor(this.timeRemaining / 60)}:${(this.timeRemaining % 60).toString().padStart(2, '0')}`;
            }
            
            // Update other displays
            const integrityDisplay = document.getElementById('data-integrity');
            const progressDisplay = document.getElementById('recovery-progress');
            const corruptedDisplay = document.getElementById('corrupted-count');
            
            if (integrityDisplay) integrityDisplay.textContent = `${Math.round(this.dataIntegrity)}%`;
            if (progressDisplay) progressDisplay.textContent = `${this.recoveredTables}/8`;
            if (corruptedDisplay) corruptedDisplay.textContent = `${this.corruptedTables}/8`;
            
            if (this.timeRemaining <= 0) {
                clearInterval(this.databaseTimer);
                this.game.gameOver('Database recovery time expired! Complete data loss - All customer records permanently destroyed.');
            }
        }, 1000);
    }
}

// Register the class globally
window.Room4 = Room4;
