class Room6 {
    constructor(game) {
        this.game = game;
        this.systemErrors = 23;
        this.codeQuality = 15; // %
        this.testCoverage = 32; // %
        this.performanceMetric = 12; // requests/sec
        this.selectedFixes = [];
        this.correctFixes = ['memory-leak', 'null-pointer', 'race-condition', 'buffer-overflow'];
        this.attempts = 0;
        this.maxAttempts = 3;
        this.timeRemaining = 480; // 8 minutes
    }

    async init() {
        const response = await fetch('data/programming-crisis.json');
        this.data = await response.json();
        this.render();
        this.startProgrammingTimer();
    }

    render() {
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="room-container p-6 fade-in">
                <div class="text-center mb-6">
                    <i class="bi bi-bug text-6xl text-red-500 animate-pulse"></i>
                    <h2 class="text-3xl font-bold mt-4 text-red-400">CRITICAL SOFTWARE FAILURE</h2>
                    <p class="text-gray-300 mt-2">Production system compromised by critical bugs - Emergency debugging required</p>
                </div>
                
                <div class="code-status grid grid-cols-4 gap-3 mb-6">
                    <div class="status-card bg-red-900 p-3 rounded text-center">
                        <i class="bi bi-exclamation-triangle text-red-400 text-xl"></i>
                        <p class="text-xs text-red-200">System Errors</p>
                        <p id="error-count" class="text-lg font-bold text-red-100">${this.systemErrors}</p>
                        <p class="text-xs text-red-300">Critical Bugs</p>
                    </div>
                    <div class="status-card bg-orange-900 p-3 rounded text-center">
                        <i class="bi bi-code-slash text-orange-400 text-xl"></i>
                        <p class="text-xs text-orange-200">Code Quality</p>
                        <p id="code-quality" class="text-lg font-bold text-orange-100">${this.codeQuality}%</p>
                        <p class="text-xs ${this.codeQuality > 70 ? 'text-green-400' : 'text-red-400'}">
                            ${this.codeQuality > 70 ? 'GOOD' : 'POOR'}
                        </p>
                    </div>
                    <div class="status-card bg-blue-900 p-3 rounded text-center">
                        <i class="bi bi-check2-square text-blue-400 text-xl"></i>
                        <p class="text-xs text-blue-200">Test Coverage</p>
                        <p id="test-coverage" class="text-lg font-bold text-blue-100">${this.testCoverage}%</p>
                        <p class="text-xs text-blue-300">Unit Tests</p>
                    </div>
                    <div class="status-card bg-purple-900 p-3 rounded text-center">
                        <i class="bi bi-speedometer text-purple-400 text-xl"></i>
                        <p class="text-xs text-purple-200">Performance</p>
                        <p id="performance-metric" class="text-lg font-bold text-purple-100">${this.performanceMetric}</p>
                        <p class="text-xs text-purple-300">req/sec</p>
                    </div>
                </div>

                <div class="challenge-content bg-gray-700 p-6 rounded-lg">
                    <div class="bug-alert bg-red-900 border-2 border-red-500 p-4 rounded mb-4">
                        <h3 class="text-red-200 font-bold mb-2">💥 CRITICAL SYSTEM FAILURE</h3>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p class="text-red-100"><strong>Application:</strong> ${this.data.system_info.application}</p>
                                <p class="text-red-100"><strong>Environment:</strong> ${this.data.system_info.environment}</p>
                                <p class="text-red-100"><strong>Severity:</strong> ${this.data.system_info.severity}</p>
                            </div>
                            <div>
                                <p class="text-red-100"><strong>Impact:</strong> ${this.data.system_info.impact}</p>
                                <p class="text-red-100"><strong>Users Affected:</strong> ${this.data.system_info.affected_users}</p>
                                <p class="text-red-100"><strong>Revenue Loss:</strong> ${this.data.system_info.revenue_loss}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="debug-panel bg-black p-4 rounded mb-4">
                        <h4 class="text-white font-bold mb-3 text-center">🐛 CRITICAL BUG FIXES</h4>
                        <p class="text-gray-300 text-sm mb-4 text-center">Identify and fix the 4 most critical bugs causing system failure</p>
                        
                        <div class="bug-grid grid grid-cols-2 gap-3">
                            ${this.data.critical_bugs.map((bug, index) => `
                                <button class="bug-btn ${this.selectedFixes.includes(bug.id) ? 'selected bg-green-700' : 'bg-gray-600 hover:bg-gray-500'} 
                                       p-3 rounded text-left transition-colors" 
                                       data-bug="${bug.id}">
                                    <div class="flex items-start">
                                        <span class="text-2xl mr-3">${bug.icon}</span>
                                        <div>
                                            <div class="font-bold text-sm">${bug.name}</div>
                                            <div class="text-xs text-gray-300 mt-1">${bug.description}</div>
                                            <div class="text-xs mt-1">
                                                <span class="text-red-300">Severity: ${bug.severity}</span>
                                                <span class="text-blue-300 ml-2">Impact: ${bug.impact}</span>
                                            </div>
                                        </div>
                                    </div>
                                    ${this.selectedFixes.includes(bug.id) ? '<div class="text-green-400 text-xs mt-2">✓ FIXING</div>' : ''}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="fix-progress bg-gray-800 p-4 rounded mb-4">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-300">Bug Fixes Applied:</span>
                            <span class="text-green-400 font-mono">${this.selectedFixes.length}/4 critical fixes</span>
                        </div>
                        <div class="fix-list mt-2">
                            <span class="text-gray-400">Fixes: </span>
                            ${this.selectedFixes.map(fix => `<span class="text-blue-400">${fix}</span>`).join(' + ')}
                        </div>
                    </div>
                    
                    <div class="system-metrics bg-gray-800 p-4 rounded mb-4">
                        <h4 class="font-bold text-gray-200 mb-3">📊 System Health Metrics</h4>
                        <div class="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p class="text-blue-300">CPU Usage: <span class="text-white font-mono">98%</span></p>
                                <p class="text-green-300">Memory Usage: <span class="text-white font-mono">94%</span></p>
                                <p class="text-yellow-300">Disk I/O: <span class="text-white font-mono">847 MB/s</span></p>
                            </div>
                            <div>
                                <p class="text-purple-300">Active Sessions: <span class="text-white font-mono">12,847</span></p>
                                <p class="text-orange-300">Queue Depth: <span class="text-white font-mono">2,891</span></p>
                                <p class="text-red-300">Failed Requests: <span class="text-white font-mono">15,234</span></p>
                            </div>
                            <div>
                                <p class="text-cyan-300">Log Errors: <span class="text-red-400">3,456/min</span></p>
                                <p class="text-pink-300">Stack Traces: <span class="text-red-400">1,247</span></p>
                                <p class="text-lime-300">Exception Rate: <span class="text-yellow-400">23.7%</span></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="control-buttons text-center mb-4">
                        <button id="deploy-fixes" class="btn-primary px-6 py-3 rounded mr-4" 
                                ${this.selectedFixes.length !== 4 ? 'disabled' : ''}>
                            <i class="bi bi-cloud-upload"></i> Deploy Fixes
                        </button>
                        <button id="reset-fixes" class="bg-gray-600 hover:bg-gray-500 px-6 py-3 rounded transition-colors mr-4">
                            <i class="bi bi-arrow-clockwise"></i> Reset Selection
                        </button>
                        <button id="emergency-rollback" class="bg-red-600 hover:bg-red-500 px-6 py-3 rounded transition-colors">
                            <i class="bi bi-skip-backward"></i> Emergency Rollback
                        </button>
                    </div>
                    
                    <div class="timer-warning text-center">
                        <span class="text-orange-300">Time Remaining: <span id="programming-timer">${Math.floor(this.timeRemaining / 60)}:${(this.timeRemaining % 60).toString().padStart(2, '0')}</span></span>
                        <br><span class="text-gray-400 text-sm">System stability deteriorating - Fix deployment window closing</span>
                        <br><span class="text-purple-400 text-sm">Debug attempts: ${this.attempts}/${this.maxAttempts}</span>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.bug-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectFix(e.target.closest('.bug-btn').dataset.bug);
            });
        });

        document.getElementById('deploy-fixes').addEventListener('click', () => {
            this.deployFixes();
        });

        document.getElementById('reset-fixes').addEventListener('click', () => {
            this.resetFixes();
        });

        document.getElementById('emergency-rollback').addEventListener('click', () => {
            this.emergencyRollback();
        });
    }

    selectFix(bugId) {
        if (this.selectedFixes.includes(bugId)) {
            this.selectedFixes = this.selectedFixes.filter(f => f !== bugId);
        } else if (this.selectedFixes.length < 4) {
            this.selectedFixes.push(bugId);
        }
        
        this.render();
    }

    resetFixes() {
        this.selectedFixes = [];
        this.render();
    }

    deployFixes() {
        this.attempts++;
        
        // Check if selected fixes address the most critical bugs
        const correctFixes = this.selectedFixes.filter(fix => 
            this.correctFixes.includes(fix)
        );
        
        const effectiveness = (correctFixes.length / 4) * 100;
        
        if (effectiveness >= 75) { // At least 3 out of 4 correct
            this.systemStabilized(effectiveness);
        } else {
            if (this.attempts >= this.maxAttempts) {
                this.game.gameOver('Critical bug fixes failed! System completely unstable - Production environment irrecoverable.');
            } else {
                this.showFixFailure(effectiveness);
            }
        }
    }

    systemStabilized(effectiveness) {
        clearInterval(this.programmingTimer);
        
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="system-stabilized text-center p-8">
                <i class="bi bi-check-circle text-8xl text-green-400 mb-4 animate-bounce"></i>
                <h2 class="text-3xl font-bold text-green-400 mb-4">SYSTEM STABILIZED</h2>
                
                <div class="final-metrics grid grid-cols-4 gap-4 mb-6">
                    <div class="bg-green-800 p-3 rounded">
                        <p class="text-green-200">System Errors</p>
                        <p class="text-xl font-bold text-green-400">0</p>
                        <p class="text-xs text-green-300">✓ Resolved</p>
                    </div>
                    <div class="bg-blue-800 p-3 rounded">
                        <p class="text-blue-200">Code Quality</p>
                        <p class="text-xl font-bold text-blue-400">87%</p>
                        <p class="text-xs text-blue-300">✓ Improved</p>
                    </div>
                    <div class="bg-purple-800 p-3 rounded">
                        <p class="text-purple-200">Test Coverage</p>
                        <p class="text-xl font-bold text-purple-400">95%</p>
                        <p class="text-xs text-purple-300">✓ Enhanced</p>
                    </div>
                    <div class="bg-yellow-800 p-3 rounded">
                        <p class="text-yellow-200">Performance</p>
                        <p class="text-xl font-bold text-yellow-400">1,247</p>
                        <p class="text-xs text-yellow-300">✓ req/sec</p>
                    </div>
                </div>
                
                <div class="debug-report bg-gray-800 p-4 rounded mb-4">
                    <h4 class="font-bold text-gray-200 mb-2">🐛 Critical Bug Resolution Report</h4>
                    <div class="text-left text-sm text-gray-300">
                        <p>✅ Memory leaks identified and patched</p>
                        <p>✅ Null pointer exceptions handled with validation</p>
                        <p>✅ Race conditions resolved with proper synchronization</p>
                        <p>✅ Buffer overflow vulnerabilities secured</p>
                        <p>✅ Performance optimizations deployed and verified</p>
                        <p>✅ System monitoring enhanced with new alerting</p>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            this.game.roomCompleted(`Critical software failure resolved! System performance restored to ${Math.round(effectiveness)}% efficiency. All production bugs successfully patched through expert debugging.`);
        }, 3000);
    }

    showFixFailure(effectiveness) {
        this.showFeedback(false, 
            `❌ BUG FIXES INSUFFICIENT\n\nEffectiveness: ${Math.round(effectiveness)}%\nSystem still unstable!\n\nCritical bugs: ${this.correctFixes.join(', ')}\nSelected: ${this.selectedFixes.join(', ')}\n\nRe-analyze critical failure points...`);
        
        setTimeout(() => {
            this.selectedFixes = [];
            this.render();
        }, 4000);
    }

    emergencyRollback() {
        this.game.gameOver('Emergency system rollback initiated! Reverted to previous stable version - Recent features and data lost.');
    }

    startProgrammingTimer() {
        this.programmingTimer = setInterval(() => {
            this.timeRemaining--;
            
            // Update display
            const timerDisplay = document.getElementById('programming-timer');
            if (timerDisplay) {
                timerDisplay.textContent = `${Math.floor(this.timeRemaining / 60)}:${(this.timeRemaining % 60).toString().padStart(2, '0')}`;
            }
            
            // System degradation
            this.systemErrors = Math.min(50, this.systemErrors + 1);
            this.codeQuality = Math.max(0, this.codeQuality - 0.5);
            this.performanceMetric = Math.max(0, this.performanceMetric - 0.3);
            
            // Update displays
            const errorDisplay = document.getElementById('error-count');
            const qualityDisplay = document.getElementById('code-quality');
            const performanceDisplay = document.getElementById('performance-metric');
            
            if (errorDisplay) errorDisplay.textContent = `${Math.round(this.systemErrors)}`;
            if (qualityDisplay) qualityDisplay.textContent = `${Math.round(this.codeQuality)}%`;
            if (performanceDisplay) performanceDisplay.textContent = `${Math.round(this.performanceMetric)}`;
            
            if (this.timeRemaining <= 0 || this.performanceMetric <= 0) {
                clearInterval(this.programmingTimer);
                this.game.gameOver('System performance collapsed! Critical bugs caused complete service failure - Production environment destroyed.');
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
window.Room6 = Room6;
