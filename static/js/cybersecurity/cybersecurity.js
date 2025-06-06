class Room5 {
    constructor(game) {
        this.game = game;
        this.securityLevel = 'CRITICAL';
        this.encryptionStatus = 'COMPROMISED';
        this.intrusionAlerts = 47;
        this.secureConnections = 3;
        this.totalConnections = 15;
        this.selectedResponses = [];
        this.correctSequence = ['isolate-threat', 'analyze-payload', 'patch-vulnerability', 'restore-services'];
        this.attempts = 0;
        this.maxAttempts = 3;
        this.timeRemaining = 360; // 6 minutes
    }

    async init() {
        const response = await fetch('data/cybersecurity.json');
        this.data = await response.json();
        this.render();
        this.startSecurityTimer();
    }

    render() {
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="room-container p-6 fade-in">
                <div class="text-center mb-6">
                    <i class="bi bi-shield-exclamation text-6xl text-red-500 animate-pulse"></i>
                    <h2 class="text-3xl font-bold mt-4 text-red-400">SECURITY INCIDENT RESPONSE</h2>
                    <p class="text-gray-300 mt-2">Active security breach detected - Emergency response protocol activated</p>
                </div>
                
                <div class="security-status grid grid-cols-4 gap-3 mb-6">
                    <div class="status-card bg-red-900 p-3 rounded text-center">
                        <i class="bi bi-exclamation-octagon text-red-400 text-xl"></i>
                        <p class="text-xs text-red-200">Security Level</p>
                        <p class="text-lg font-bold text-red-100">${this.securityLevel}</p>
                        <p class="text-xs text-red-300">BREACH ACTIVE</p>
                    </div>
                    <div class="status-card bg-orange-900 p-3 rounded text-center">
                        <i class="bi bi-key text-orange-400 text-xl"></i>
                        <p class="text-xs text-orange-200">Encryption</p>
                        <p class="text-lg font-bold text-orange-100">${this.encryptionStatus}</p>
                        <p class="text-xs text-red-400">BROKEN</p>
                    </div>
                    <div class="status-card bg-purple-900 p-3 rounded text-center">
                        <i class="bi bi-exclamation-triangle text-purple-400 text-xl"></i>
                        <p class="text-xs text-purple-200">Intrusion Alerts</p>
                        <p id="intrusion-count" class="text-lg font-bold text-purple-100">${this.intrusionAlerts}</p>
                        <p class="text-xs text-purple-300">Active Threats</p>
                    </div>
                    <div class="status-card bg-blue-900 p-3 rounded text-center">
                        <i class="bi bi-shield-check text-blue-400 text-xl"></i>
                        <p class="text-xs text-blue-200">Secure Channels</p>
                        <p id="secure-connections" class="text-lg font-bold text-blue-100">${this.secureConnections}/${this.totalConnections}</p>
                        <p class="text-xs text-blue-300">Protected</p>
                    </div>
                </div>

                <div class="challenge-content bg-gray-700 p-6 rounded-lg">
                    <div class="incident-alert bg-red-900 border-2 border-red-500 p-4 rounded mb-4">
                        <h3 class="text-red-200 font-bold mb-2">🔴 SECURITY INCIDENT DETECTED</h3>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p class="text-red-100"><strong>Incident Type:</strong> ${this.data.incident_info.type}</p>
                                <p class="text-red-100"><strong>Attack Vector:</strong> ${this.data.incident_info.attack_vector}</p>
                                <p class="text-red-100"><strong>Severity:</strong> ${this.data.incident_info.severity}</p>
                            </div>
                            <div>
                                <p class="text-red-100"><strong>Target:</strong> ${this.data.incident_info.target_systems}</p>
                                <p class="text-red-100"><strong>Impact:</strong> ${this.data.incident_info.business_impact}</p>
                                <p class="text-red-100"><strong>Threat Actor:</strong> ${this.data.incident_info.threat_actor}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="response-panel bg-black p-4 rounded mb-4">
                        <h4 class="text-white font-bold mb-3 text-center">🛡️ INCIDENT RESPONSE ACTIONS</h4>
                        <p class="text-gray-300 text-sm mb-4 text-center">Execute response actions in correct order to contain the security breach</p>
                        
                        <div class="response-grid grid grid-cols-2 gap-3">
                            ${this.data.response_actions.map((action, index) => `
                                <button class="response-btn ${this.getResponseStatus(action.id)} 
                                       p-3 rounded text-left transition-colors" 
                                       data-response="${action.id}">
                                    <div class="flex items-start">
                                        <span class="text-2xl mr-3">${action.icon}</span>
                                        <div>
                                            <div class="font-bold text-sm">${action.name}</div>
                                            <div class="text-xs text-gray-300 mt-1">${action.description}</div>
                                            <div class="text-xs mt-1">
                                                <span class="text-green-300">Priority: ${action.priority}</span>
                                                <span class="text-blue-300 ml-2">Phase: ${action.phase}</span>
                                            </div>
                                        </div>
                                    </div>
                                    ${this.getResponseStepNumber(action.id)}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="sequence-display bg-gray-800 p-4 rounded mb-4">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-300">Response Sequence:</span>
                            <span class="text-blue-400 font-mono">${this.selectedResponses.length}/4 actions selected</span>
                        </div>
                        <div class="response-sequence mt-2">
                            <span class="text-gray-400">Order: </span>
                            ${this.selectedResponses.map((resp, index) => `<span class="text-green-400">${index + 1}. ${resp}</span>`).join(' → ')}
                        </div>
                    </div>
                    
                    <div class="threat-intel bg-gray-800 p-4 rounded mb-4">
                        <h4 class="font-bold text-gray-200 mb-3">🔍 Threat Intelligence</h4>
                        <div class="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p class="text-blue-300">Malware Detected: <span class="text-white font-mono">17 variants</span></p>
                                <p class="text-green-300">IOCs Identified: <span class="text-white font-mono">243</span></p>
                                <p class="text-yellow-300">Failed Login Attempts: <span class="text-white font-mono">8,947</span></p>
                            </div>
                            <div>
                                <p class="text-purple-300">Data Exfiltration: <span class="text-white font-mono">2.3 GB</span></p>
                                <p class="text-orange-300">Compromised Accounts: <span class="text-white font-mono">156</span></p>
                                <p class="text-red-300">Lateral Movement: <span class="text-white font-mono">47 systems</span></p>
                            </div>
                            <div>
                                <p class="text-cyan-300">Privilege Escalation: <span class="text-red-400">DETECTED</span></p>
                                <p class="text-pink-300">Persistence Mechanisms: <span class="text-red-400">5 Active</span></p>
                                <p class="text-lime-300">Command & Control: <span class="text-yellow-400">3 C2 Servers</span></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="control-buttons text-center mb-4">
                        <button id="execute-response" class="btn-primary px-6 py-3 rounded mr-4" 
                                ${this.selectedResponses.length !== 4 ? 'disabled' : ''}>
                            <i class="bi bi-shield-check"></i> Execute Response
                        </button>
                        <button id="reset-response" class="bg-gray-600 hover:bg-gray-500 px-6 py-3 rounded transition-colors mr-4">
                            <i class="bi bi-arrow-clockwise"></i> Reset Sequence
                        </button>
                        <button id="emergency-lockdown" class="bg-red-600 hover:bg-red-500 px-6 py-3 rounded transition-colors">
                            <i class="bi bi-lock"></i> Emergency Lockdown
                        </button>
                    </div>
                    
                    <div class="timer-warning text-center">
                        <span class="text-orange-300">Time Remaining: <span id="security-timer">${Math.floor(this.timeRemaining / 60)}:${(this.timeRemaining % 60).toString().padStart(2, '0')}</span></span>
                        <br><span class="text-gray-400 text-sm">Threat actor maintaining persistence - Response window closing</span>
                        <br><span class="text-purple-400 text-sm">Response attempts: ${this.attempts}/${this.maxAttempts}</span>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.response-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectResponse(e.target.closest('.response-btn').dataset.response);
            });
        });

        document.getElementById('execute-response').addEventListener('click', () => {
            this.executeResponse();
        });

        document.getElementById('reset-response').addEventListener('click', () => {
            this.resetResponse();
        });

        document.getElementById('emergency-lockdown').addEventListener('click', () => {
            this.emergencyLockdown();
        });
    }

    getResponseStatus(responseId) {
        const stepIndex = this.selectedResponses.indexOf(responseId);
        if (stepIndex !== -1) {
            return 'selected bg-blue-700 border-2 border-blue-400';
        }
        return 'bg-gray-600 hover:bg-gray-500';
    }

    getResponseStepNumber(responseId) {
        const stepIndex = this.selectedResponses.indexOf(responseId);
        if (stepIndex !== -1) {
            return `<div class="text-blue-400 text-xs mt-2">Step ${stepIndex + 1}</div>`;
        }
        return '';
    }

    selectResponse(responseId) {
        if (this.selectedResponses.includes(responseId)) {
            // Remove response and all responses after it
            const index = this.selectedResponses.indexOf(responseId);
            this.selectedResponses = this.selectedResponses.slice(0, index);
        } else if (this.selectedResponses.length < 4) {
            this.selectedResponses.push(responseId);
        }
        
        this.render();
    }

    resetResponse() {
        this.selectedResponses = [];
        this.render();
    }

    executeResponse() {
        this.attempts++;
        
        // Check if sequence matches the correct incident response procedure
        const isCorrectSequence = JSON.stringify(this.selectedResponses) === JSON.stringify(this.correctSequence);
        
        if (isCorrectSequence) {
            this.incidentContained();
        } else {
            if (this.attempts >= this.maxAttempts) {
                this.game.gameOver('Security incident response failed! Complete system compromise - All critical data exfiltrated by threat actors.');
            } else {
                this.showResponseFailure();
            }
        }
    }

    incidentContained() {
        clearInterval(this.securityTimer);
        
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="incident-contained text-center p-8">
                <i class="bi bi-shield-check text-8xl text-green-400 mb-4 animate-bounce"></i>
                <h2 class="text-3xl font-bold text-green-400 mb-4">INCIDENT CONTAINED</h2>
                
                <div class="final-metrics grid grid-cols-4 gap-4 mb-6">
                    <div class="bg-green-800 p-3 rounded">
                        <p class="text-green-200">Security Level</p>
                        <p class="text-xl font-bold text-green-400">SECURE</p>
                        <p class="text-xs text-green-300">✓ Restored</p>
                    </div>
                    <div class="bg-blue-800 p-3 rounded">
                        <p class="text-blue-200">Encryption</p>
                        <p class="text-xl font-bold text-blue-400">ACTIVE</p>
                        <p class="text-xs text-blue-300">✓ Restored</p>
                    </div>
                    <div class="bg-purple-800 p-3 rounded">
                        <p class="text-purple-200">Threats</p>
                        <p class="text-xl font-bold text-purple-400">0</p>
                        <p class="text-xs text-purple-300">✓ Eliminated</p>
                    </div>
                    <div class="bg-yellow-800 p-3 rounded">
                        <p class="text-yellow-200">Connections</p>
                        <p class="text-xl font-bold text-yellow-400">15/15</p>
                        <p class="text-xs text-yellow-300">✓ Secured</p>
                    </div>
                </div>
                
                <div class="incident-report bg-gray-800 p-4 rounded mb-4">
                    <h4 class="font-bold text-gray-200 mb-2">🛡️ Incident Response Report</h4>
                    <div class="text-left text-sm text-gray-300">
                        <p>✅ Threat actors successfully isolated and expelled</p>
                        <p>✅ Malware payload analyzed and neutralized</p>
                        <p>✅ Security vulnerabilities patched and hardened</p>
                        <p>✅ All affected services restored to normal operation</p>
                        <p>✅ Forensic evidence preserved for investigation</p>
                        <p>✅ Security monitoring enhanced with new detection rules</p>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            this.game.roomCompleted(`Security incident successfully contained! Threat actors expelled and all systems secured. Advanced persistent threat neutralized through expert incident response.`);
        }, 3000);
    }

    showResponseFailure() {
        this.showFeedback(false, 
            `❌ INCIDENT RESPONSE INEFFECTIVE\n\nThreat actors adapting to countermeasures!\nCorrect sequence: ${this.correctSequence.join(' → ')}\nYour sequence: ${this.selectedResponses.join(' → ')}\n\nReassess threat and adjust response strategy...`);
        
        setTimeout(() => {
            this.selectedResponses = [];
            this.render();
        }, 4000);
    }

    emergencyLockdown() {
        this.game.gameOver('Emergency system lockdown initiated! All network access terminated - Business operations completely halted.');
    }

    startSecurityTimer() {
        this.securityTimer = setInterval(() => {
            this.timeRemaining--;
            
            // Update display
            const timerDisplay = document.getElementById('security-timer');
            if (timerDisplay) {
                timerDisplay.textContent = `${Math.floor(this.timeRemaining / 60)}:${(this.timeRemaining % 60).toString().padStart(2, '0')}`;
            }
            
            // Security degradation
            this.intrusionAlerts = Math.min(100, this.intrusionAlerts + 2);
            this.secureConnections = Math.max(0, this.secureConnections - 0.1);
            
            // Update displays
            const intrusionDisplay = document.getElementById('intrusion-count');
            const connectionDisplay = document.getElementById('secure-connections');
            
            if (intrusionDisplay) intrusionDisplay.textContent = `${Math.round(this.intrusionAlerts)}`;
            if (connectionDisplay) connectionDisplay.textContent = `${Math.round(this.secureConnections)}/${this.totalConnections}`;
            
            if (this.timeRemaining <= 0 || this.secureConnections <= 0) {
                clearInterval(this.securityTimer);
                this.game.gameOver('Security perimeter completely breached! All systems compromised - Critical infrastructure under hostile control.');
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
window.Room5 = Room5;
