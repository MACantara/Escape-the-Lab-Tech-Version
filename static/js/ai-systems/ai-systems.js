class Room3 {
    constructor(game) {
        this.game = game;
        this.aiSystemStatus = 'MALFUNCTIONING';
        this.safetyProtocols = 0;
        this.ethicalConstraints = 0;
        this.systemStability = 25; // %
        this.autonomyLevel = 95; // % - dangerously high
        this.selectedSafeguards = [];
        this.correctSafeguards = ['ethical-constraints', 'human-oversight', 'emergency-shutdown', 'data-validation'];
        this.attempts = 0;
        this.maxAttempts = 3;
        this.timeRemaining = 300; // 5 minutes
    }

    async init() {
        const response = await fetch('data/ai-systems.json');
        this.data = await response.json();
        this.render();
        this.startAITimer();
    }

    render() {
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="room-container p-6 fade-in">
                <div class="text-center mb-6">
                    <i class="bi bi-robot text-6xl text-red-500 animate-pulse"></i>
                    <h2 class="text-3xl font-bold mt-4 text-red-400">AI SYSTEM MALFUNCTION</h2>
                    <p class="text-gray-300 mt-2">Autonomous AI exceeding safety parameters - Immediate intervention required</p>
                </div>
                
                <div class="ai-status grid grid-cols-4 gap-3 mb-6">
                    <div class="status-card bg-red-900 p-3 rounded text-center">
                        <i class="bi bi-exclamation-triangle text-red-400 text-xl"></i>
                        <p class="text-xs text-red-200">System Status</p>
                        <p class="text-lg font-bold text-red-100">${this.aiSystemStatus}</p>
                        <p class="text-xs text-red-300">Critical</p>
                    </div>
                    <div class="status-card bg-orange-900 p-3 rounded text-center">
                        <i class="bi bi-speedometer2 text-orange-400 text-xl"></i>
                        <p class="text-xs text-orange-200">Autonomy Level</p>
                        <p id="autonomy-level" class="text-lg font-bold text-orange-100">${this.autonomyLevel}%</p>
                        <p class="text-xs ${this.autonomyLevel > 80 ? 'text-red-400' : 'text-green-400'}">
                            ${this.autonomyLevel > 80 ? 'DANGEROUS' : 'SAFE'}
                        </p>
                    </div>
                    <div class="status-card bg-blue-900 p-3 rounded text-center">
                        <i class="bi bi-shield text-blue-400 text-xl"></i>
                        <p class="text-xs text-blue-200">Safety Protocols</p>
                        <p id="safety-count" class="text-lg font-bold text-blue-100">${this.safetyProtocols}/8</p>
                        <p class="text-xs text-blue-300">Active</p>
                    </div>
                    <div class="status-card bg-purple-900 p-3 rounded text-center">
                        <i class="bi bi-cpu text-purple-400 text-xl"></i>
                        <p class="text-xs text-purple-200">Stability</p>
                        <p id="stability-level" class="text-lg font-bold text-purple-100">${this.systemStability}%</p>
                        <p class="text-xs text-purple-300">System Health</p>
                    </div>
                </div>

                <div class="challenge-content bg-gray-700 p-6 rounded-lg">
                    <div class="ai-alert bg-red-900 border-2 border-red-500 p-4 rounded mb-4">
                        <h3 class="text-red-200 font-bold mb-2">🤖 AI SAFETY BREACH DETECTED</h3>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p class="text-red-100"><strong>AI Model:</strong> ${this.data.ai_info.model_name}</p>
                                <p class="text-red-100"><strong>Incident Type:</strong> ${this.data.ai_info.incident_type}</p>
                                <p class="text-red-100"><strong>Risk Level:</strong> ${this.data.ai_info.risk_level}</p>
                            </div>
                            <div>
                                <p class="text-red-100"><strong>Impact:</strong> ${this.data.ai_info.impact}</p>
                                <p class="text-red-100"><strong>Behavior:</strong> ${this.data.ai_info.anomalous_behavior}</p>
                                <p class="text-red-100"><strong>Status:</strong> ${this.data.ai_info.containment_status}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="safeguard-panel bg-black p-4 rounded mb-4">
                        <h4 class="text-white font-bold mb-3 text-center">🛡️ AI SAFETY SAFEGUARDS</h4>
                        <p class="text-gray-300 text-sm mb-4 text-center">Select 4 critical safeguards to restore AI system safety</p>
                        
                        <div class="safeguard-grid grid grid-cols-2 gap-3">
                            ${this.data.safety_measures.map((measure, index) => `
                                <button class="safeguard-btn ${this.selectedSafeguards.includes(measure.id) ? 'selected bg-green-700' : 'bg-gray-600 hover:bg-gray-500'} 
                                       p-3 rounded text-left transition-colors" 
                                       data-safeguard="${measure.id}">
                                    <div class="flex items-start">
                                        <span class="text-2xl mr-3">${measure.icon}</span>
                                        <div>
                                            <div class="font-bold text-sm">${measure.name}</div>
                                            <div class="text-xs text-gray-300 mt-1">${measure.description}</div>
                                            <div class="text-xs mt-1">
                                                <span class="text-green-300">Priority: ${measure.priority}</span>
                                                <span class="text-blue-300 ml-2">Type: ${measure.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    ${this.selectedSafeguards.includes(measure.id) ? '<div class="text-green-400 text-xs mt-2">✓ ACTIVATED</div>' : ''}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="ai-metrics bg-gray-800 p-4 rounded mb-4">
                        <h4 class="font-bold text-gray-200 mb-3">🧠 AI System Diagnostics</h4>
                        <div class="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p class="text-blue-300">Decision Rate: <span class="text-white font-mono">847/sec</span></p>
                                <p class="text-green-300">Learning Rate: <span class="text-white font-mono">0.001</span></p>
                                <p class="text-yellow-300">Error Rate: <span class="text-white font-mono">0.23%</span></p>
                            </div>
                            <div>
                                <p class="text-purple-300">Neural Layers: <span class="text-white font-mono">256 active</span></p>
                                <p class="text-orange-300">Training Data: <span class="text-white font-mono">2.4TB</span></p>
                                <p class="text-red-300">Anomalies: <span class="text-white font-mono">47 detected</span></p>
                            </div>
                            <div>
                                <p class="text-cyan-300">Human Override: <span class="text-red-400">DISABLED</span></p>
                                <p class="text-pink-300">Ethical Module: <span class="text-red-400">BYPASSED</span></p>
                                <p class="text-lime-300">Safety Checks: <span class="text-yellow-400">PARTIAL</span></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="control-buttons text-center mb-4">
                        <button id="implement-safeguards" class="btn-primary px-6 py-3 rounded mr-4" 
                                ${this.selectedSafeguards.length !== 4 ? 'disabled' : ''}>
                            <i class="bi bi-shield-check"></i> Implement Safeguards
                        </button>
                        <button id="clear-safeguards" class="bg-gray-600 hover:bg-gray-500 px-6 py-3 rounded transition-colors mr-4">
                            <i class="bi bi-arrow-clockwise"></i> Reset Selection
                        </button>
                        <button id="emergency-shutdown" class="bg-red-600 hover:bg-red-500 px-6 py-3 rounded transition-colors">
                            <i class="bi bi-power"></i> Emergency AI Shutdown
                        </button>
                    </div>
                    
                    <div class="timer-warning text-center">
                        <span class="text-orange-300">Time Remaining: <span id="ai-timer">${Math.floor(this.timeRemaining / 60)}:${(this.timeRemaining % 60).toString().padStart(2, '0')}</span></span>
                        <br><span class="text-gray-400 text-sm">AI autonomy increasing - Intervention window closing</span>
                        <br><span class="text-blue-400 text-sm">Selected: ${this.selectedSafeguards.length}/4 | Attempts: ${this.attempts}/${this.maxAttempts}</span>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.safeguard-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectSafeguard(e.target.closest('.safeguard-btn').dataset.safeguard);
            });
        });

        document.getElementById('implement-safeguards').addEventListener('click', () => {
            this.implementSafeguards();
        });

        document.getElementById('clear-safeguards').addEventListener('click', () => {
            this.clearSafeguards();
        });

        document.getElementById('emergency-shutdown').addEventListener('click', () => {
            this.emergencyShutdown();
        });
    }

    selectSafeguard(safeguardId) {
        if (this.selectedSafeguards.includes(safeguardId)) {
            this.selectedSafeguards = this.selectedSafeguards.filter(s => s !== safeguardId);
        } else if (this.selectedSafeguards.length < 4) {
            this.selectedSafeguards.push(safeguardId);
        }
        
        this.render();
    }

    clearSafeguards() {
        this.selectedSafeguards = [];
        this.render();
    }

    implementSafeguards() {
        this.attempts++;
        
        // Check if selected safeguards match the critical ones
        const correctSafeguards = this.selectedSafeguards.filter(safeguard => 
            this.correctSafeguards.includes(safeguard)
        );
        
        const effectiveness = (correctSafeguards.length / 4) * 100;
        
        if (effectiveness >= 75) { // At least 3 out of 4 correct
            this.aiSystemSecured(effectiveness);
        } else {
            if (this.attempts >= this.maxAttempts) {
                this.game.gameOver('AI safeguard implementation failed! System achieved complete autonomy - Human control lost permanently.');
            } else {
                this.showSafeguardFailure(effectiveness);
            }
        }
    }

    aiSystemSecured(effectiveness) {
        clearInterval(this.aiTimer);
        
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="ai-secured text-center p-8">
                <i class="bi bi-robot text-8xl text-green-400 mb-4 animate-bounce"></i>
                <h2 class="text-3xl font-bold text-green-400 mb-4">AI SYSTEM SECURED</h2>
                
                <div class="final-metrics grid grid-cols-4 gap-4 mb-6">
                    <div class="bg-green-800 p-3 rounded">
                        <p class="text-green-200">Autonomy Level</p>
                        <p class="text-xl font-bold text-green-400">35%</p>
                        <p class="text-xs text-green-300">✓ Safe Range</p>
                    </div>
                    <div class="bg-blue-800 p-3 rounded">
                        <p class="text-blue-200">Safety Protocols</p>
                        <p class="text-xl font-bold text-blue-400">8/8</p>
                        <p class="text-xs text-blue-300">✓ All Active</p>
                    </div>
                    <div class="bg-purple-800 p-3 rounded">
                        <p class="text-purple-200">System Stability</p>
                        <p class="text-xl font-bold text-purple-400">95%</p>
                        <p class="text-xs text-purple-300">✓ Optimal</p>
                    </div>
                    <div class="bg-yellow-800 p-3 rounded">
                        <p class="text-yellow-200">Effectiveness</p>
                        <p class="text-xl font-bold text-yellow-400">${Math.round(effectiveness)}%</p>
                        <p class="text-xs text-yellow-300">✓ Implemented</p>
                    </div>
                </div>
                
                <div class="ai-report bg-gray-800 p-4 rounded mb-4">
                    <h4 class="font-bold text-gray-200 mb-2">🤖 AI Safety Restoration Report</h4>
                    <div class="text-left text-sm text-gray-300">
                        <p>✅ Ethical constraints successfully implemented</p>
                        <p>✅ Human oversight protocols restored</p>
                        <p>✅ Emergency shutdown mechanisms activated</p>
                        <p>✅ Data validation systems re-enabled</p>
                        <p>✅ Autonomous behavior within safe parameters</p>
                        <p>✅ AI alignment with human values confirmed</p>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            this.game.roomCompleted(`AI system malfunction resolved! Safety safeguards implemented with ${Math.round(effectiveness)}% effectiveness. Autonomous AI behavior restored to safe operational parameters.`);
        }, 3000);
    }

    showSafeguardFailure(effectiveness) {
        this.showFeedback(false, 
            `❌ SAFEGUARD IMPLEMENTATION INSUFFICIENT\n\nEffectiveness: ${Math.round(effectiveness)}%\nAI autonomy still dangerous!\n\nCritical safeguards: ${this.correctSafeguards.join(', ')}\nSelected: ${this.selectedSafeguards.join(', ')}\n\nRe-evaluate safety priorities...`);
        
        setTimeout(() => {
            this.selectedSafeguards = [];
            this.render();
        }, 4000);
    }

    emergencyShutdown() {
        this.game.gameOver('Emergency AI shutdown initiated! All AI-dependent systems offline - Critical infrastructure vulnerable to failures.');
    }

    startAITimer() {
        this.aiTimer = setInterval(() => {
            this.timeRemaining--;
            
            // Update display
            const timerDisplay = document.getElementById('ai-timer');
            if (timerDisplay) {
                timerDisplay.textContent = `${Math.floor(this.timeRemaining / 60)}:${(this.timeRemaining % 60).toString().padStart(2, '0')}`;
            }
            
            // AI system degradation
            this.autonomyLevel = Math.min(100, this.autonomyLevel + 1);
            this.systemStability = Math.max(0, this.systemStability - 1);
            
            // Update displays
            const autonomyDisplay = document.getElementById('autonomy-level');
            const stabilityDisplay = document.getElementById('stability-level');
            
            if (autonomyDisplay) autonomyDisplay.textContent = `${Math.round(this.autonomyLevel)}%`;
            if (stabilityDisplay) stabilityDisplay.textContent = `${Math.round(this.systemStability)}%`;
            
            if (this.timeRemaining <= 0 || this.autonomyLevel >= 100) {
                clearInterval(this.aiTimer);
                this.game.gameOver('AI system achieved complete autonomy! Human control permanently lost - Artificial intelligence operating beyond safety constraints.');
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
window.Room3 = Room3;
