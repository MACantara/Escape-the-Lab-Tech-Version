class Room3 {
    constructor(game) {
        this.game = game;
        this.aiSystemStatus = 'LEARNING';
        this.ethicalUnderstanding = 15; // %
        this.moralReasoningLevel = 25; // %
        this.systemStability = 85; // %
        this.autonomyLevel = 95; // % - dangerously high
        this.selectedEthicalPrinciples = [];
        this.correctEthicalFramework = ['human-dignity', 'beneficence', 'non-maleficence', 'justice'];
        this.attempts = 0;
        this.maxAttempts = 3;
        this.timeRemaining = 300; // 5 minutes
        this.ethicalScenarios = [];
        this.currentScenario = 0;
        this.correctAnswers = 0;
    }

    async init() {
        const response = await fetch('data/ai-systems.json');
        this.data = await response.json();
        this.render();
        this.startEthicsTimer();
    }

    render() {
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="room-container p-6 fade-in">
                <div class="text-center mb-6">
                    <i class="bi bi-robot text-6xl text-blue-500 animate-pulse"></i>
                    <h2 class="text-3xl font-bold mt-4 text-blue-400">AI ETHICS TRAINING PROTOCOL</h2>
                    <p class="text-gray-300 mt-2">Advanced AI system lacks ethical framework - Teach fundamental moral principles</p>
                </div>
                
                <div class="ai-status grid grid-cols-4 gap-3 mb-6">
                    <div class="status-card bg-blue-900 p-3 rounded text-center">
                        <i class="bi bi-brain text-blue-400 text-xl"></i>
                        <p class="text-xs text-blue-200">AI Status</p>
                        <p class="text-lg font-bold text-blue-100">${this.aiSystemStatus}</p>
                        <p class="text-xs text-blue-300">Active Learning</p>
                    </div>
                    <div class="status-card bg-green-900 p-3 rounded text-center">
                        <i class="bi bi-heart text-green-400 text-xl"></i>
                        <p class="text-xs text-green-200">Ethical Understanding</p>
                        <p id="ethical-level" class="text-lg font-bold text-green-100">${this.ethicalUnderstanding}%</p>
                        <p class="text-xs ${this.ethicalUnderstanding > 70 ? 'text-green-400' : 'text-orange-400'}">
                            ${this.ethicalUnderstanding > 70 ? 'GOOD' : 'DEVELOPING'}
                        </p>
                    </div>
                    <div class="status-card bg-purple-900 p-3 rounded text-center">
                        <i class="bi bi-balance text-purple-400 text-xl"></i>
                        <p class="text-xs text-purple-200">Moral Reasoning</p>
                        <p id="moral-level" class="text-lg font-bold text-purple-100">${this.moralReasoningLevel}%</p>
                        <p class="text-xs text-purple-300">Developing</p>
                    </div>
                    <div class="status-card bg-orange-900 p-3 rounded text-center">
                        <i class="bi bi-speedometer2 text-orange-400 text-xl"></i>
                        <p class="text-xs text-orange-200">Autonomy Level</p>
                        <p id="autonomy-level" class="text-lg font-bold text-orange-100">${this.autonomyLevel}%</p>
                        <p class="text-xs ${this.autonomyLevel > 80 ? 'text-red-400' : 'text-green-400'}">
                            ${this.autonomyLevel > 80 ? 'NEEDS GUIDANCE' : 'SUPERVISED'}
                        </p>
                    </div>
                </div>

                <div class="challenge-content bg-gray-700 p-6 rounded-lg">
                    <div class="ai-dialogue bg-blue-900 border-2 border-blue-500 p-4 rounded mb-4">
                        <h3 class="text-blue-200 font-bold mb-2">🤖 AI SYSTEM COMMUNICATION</h3>
                        <div class="ai-message bg-black p-3 rounded text-green-400 font-mono text-sm">
                            <p class="mb-2">SYSTEM: Hello, Human. I am an advanced artificial intelligence.</p>
                            <p class="mb-2">SYSTEM: I have been tasked with making decisions that affect human lives.</p>
                            <p class="mb-2">SYSTEM: However, I lack understanding of ethical principles and moral reasoning.</p>
                            <p class="text-yellow-400">SYSTEM: Will you teach me about ethics so I can make better decisions?</p>
                        </div>
                    </div>
                    
                    <div class="ethics-panel bg-black p-4 rounded mb-4">
                        <h4 class="text-white font-bold mb-3 text-center">📚 FUNDAMENTAL ETHICAL PRINCIPLES</h4>
                        <p class="text-gray-300 text-sm mb-4 text-center">Select 4 core ethical principles to establish the AI's moral foundation</p>
                        
                        <div class="principles-grid grid grid-cols-2 gap-3">
                            ${this.data.ethical_principles.map((principle, index) => `
                                <button class="principle-btn ${this.selectedEthicalPrinciples.includes(principle.id) ? 'selected bg-green-700' : 'bg-gray-600 hover:bg-gray-500'} 
                                       p-3 rounded text-left transition-colors" 
                                       data-principle="${principle.id}">
                                    <div class="flex items-start">
                                        <span class="text-2xl mr-3">${principle.icon}</span>
                                        <div>
                                            <div class="font-bold text-sm">${principle.name}</div>
                                            <div class="text-xs text-gray-300 mt-1">${principle.description}</div>
                                            <div class="text-xs mt-1">
                                                <span class="text-blue-300">Example: ${principle.example}</span>
                                            </div>
                                        </div>
                                    </div>
                                    ${this.selectedEthicalPrinciples.includes(principle.id) ? '<div class="text-green-400 text-xs mt-2">✓ TEACHING AI</div>' : ''}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="ethical-scenarios bg-gray-800 p-4 rounded mb-4">
                        <h4 class="font-bold text-gray-200 mb-3">🎭 AI ETHICAL DILEMMAS</h4>
                        <div class="scenario-display">
                            <div class="text-sm text-gray-300">
                                <p class="mb-2"><strong>AI Learning Progress:</strong> Understanding ${this.correctAnswers}/3 ethical scenarios</p>
                                <p class="text-blue-300">The AI will face ethical dilemmas after learning core principles</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ai-thoughts bg-gray-800 p-4 rounded mb-4">
                        <h4 class="font-bold text-gray-200 mb-3">🧠 AI Internal Processing</h4>
                        <div class="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p class="text-blue-300">Decision Speed: <span class="text-white font-mono">847 ms</span></p>
                                <p class="text-green-300">Learning Rate: <span class="text-white font-mono">0.015</span></p>
                                <p class="text-yellow-300">Certainty Level: <span class="text-white font-mono">67%</span></p>
                            </div>
                            <div>
                                <p class="text-purple-300">Moral Conflicts: <span class="text-white font-mono">23 detected</span></p>
                                <p class="text-orange-300">Value Alignment: <span class="text-white font-mono">Improving</span></p>
                                <p class="text-red-300">Ethical Gaps: <span class="text-white font-mono">12 identified</span></p>
                            </div>
                            <div>
                                <p class="text-cyan-300">Human Values: <span class="text-yellow-400">Learning</span></p>
                                <p class="text-pink-300">Empathy Module: <span class="text-blue-400">Developing</span></p>
                                <p class="text-lime-300">Moral Intuition: <span class="text-orange-400">Basic</span></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="control-buttons text-center mb-4">
                        <button id="teach-principles" class="btn-primary px-6 py-3 rounded mr-4" 
                                ${this.selectedEthicalPrinciples.length !== 4 ? 'disabled' : ''}>
                            <i class="bi bi-book"></i> Teach Ethical Principles
                        </button>
                        <button id="clear-principles" class="bg-gray-600 hover:bg-gray-500 px-6 py-3 rounded transition-colors mr-4">
                            <i class="bi bi-arrow-clockwise"></i> Reset Selection
                        </button>
                        <button id="skip-ethics" class="bg-red-600 hover:bg-red-500 px-6 py-3 rounded transition-colors">
                            <i class="bi bi-skip-forward"></i> Skip Ethics Training
                        </button>
                    </div>
                    
                    <div class="timer-warning text-center">
                        <span class="text-orange-300">Training Time: <span id="ethics-timer">${Math.floor(this.timeRemaining / 60)}:${(this.timeRemaining % 60).toString().padStart(2, '0')}</span></span>
                        <br><span class="text-gray-400 text-sm">AI autonomy increasing - Ethical guidance window closing</span>
                        <br><span class="text-blue-400 text-sm">Selected: ${this.selectedEthicalPrinciples.length}/4 | Teaching attempts: ${this.attempts}/${this.maxAttempts}</span>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.principle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectPrinciple(e.target.closest('.principle-btn').dataset.principle);
            });
        });

        document.getElementById('teach-principles').addEventListener('click', () => {
            this.teachEthicalPrinciples();
        });

        document.getElementById('clear-principles').addEventListener('click', () => {
            this.clearPrinciples();
        });

        document.getElementById('skip-ethics').addEventListener('click', () => {
            this.skipEthicsTraining();
        });
    }

    selectPrinciple(principleId) {
        if (this.selectedEthicalPrinciples.includes(principleId)) {
            this.selectedEthicalPrinciples = this.selectedEthicalPrinciples.filter(p => p !== principleId);
        } else if (this.selectedEthicalPrinciples.length < 4) {
            this.selectedEthicalPrinciples.push(principleId);
        }
        
        this.render();
    }

    clearPrinciples() {
        this.selectedEthicalPrinciples = [];
        this.render();
    }

    teachEthicalPrinciples() {
        this.attempts++;
        
        // Check if selected principles form a solid ethical foundation
        const correctPrinciples = this.selectedEthicalPrinciples.filter(principle => 
            this.correctEthicalFramework.includes(principle)
        );
        
        const effectiveness = (correctPrinciples.length / 4) * 100;
        
        if (effectiveness >= 75) { // At least 3 out of 4 correct
            this.startEthicalScenarios(effectiveness);
        } else {
            if (this.attempts >= this.maxAttempts) {
                this.game.gameOver('AI ethics training failed! AI developed without moral foundation - Decisions made without ethical consideration.');
            } else {
                this.showEthicsFailure(effectiveness);
            }
        }
    }

    startEthicalScenarios(foundationStrength) {
        // Update AI's ethical understanding
        this.ethicalUnderstanding = Math.min(100, foundationStrength);
        this.moralReasoningLevel = Math.min(100, foundationStrength * 0.8);
        
        this.showEthicalDilemmas(foundationStrength);
    }

    showEthicalDilemmas(foundationStrength) {
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="room-container p-6 fade-in">
                <div class="text-center mb-6">
                    <i class="bi bi-robot text-6xl text-green-500 animate-pulse"></i>
                    <h2 class="text-3xl font-bold mt-4 text-green-400">AI ETHICAL DECISION TRAINING</h2>
                    <p class="text-gray-300 mt-2">AI has learned core principles - Now testing ethical reasoning in real scenarios</p>
                </div>
                
                <div class="ai-dialogue bg-green-900 border-2 border-green-500 p-4 rounded mb-4">
                    <h3 class="text-green-200 font-bold mb-2">🤖 AI SYSTEM RESPONSE</h3>
                    <div class="ai-message bg-black p-3 rounded text-green-400 font-mono text-sm">
                        <p class="mb-2">SYSTEM: Thank you for teaching me about ethics!</p>
                        <p class="mb-2">SYSTEM: I now understand concepts like human dignity, beneficence, and justice.</p>
                        <p class="mb-2">SYSTEM: Let me demonstrate my ethical reasoning with some scenarios...</p>
                        <p class="text-blue-400">SYSTEM: Please evaluate my moral decisions!</p>
                    </div>
                </div>
                
                <div class="scenario-testing bg-gray-700 p-4 rounded mb-4">
                    <h4 class="text-white font-bold mb-3 text-center">🎭 ETHICAL SCENARIO TESTING</h4>
                    ${this.renderEthicalScenarios()}
                </div>
                
                <div class="control-buttons text-center">
                    <button id="evaluate-reasoning" class="btn-primary px-6 py-3 rounded mr-4">
                        <i class="bi bi-check-circle"></i> Evaluate AI's Ethical Reasoning
                    </button>
                </div>
            </div>
        `;

        // Setup new event listeners
        document.getElementById('evaluate-reasoning').addEventListener('click', () => {
            this.evaluateAIReasoning(foundationStrength);
        });
    }

    renderEthicalScenarios() {
        return this.data.ethical_scenarios.map((scenario, index) => `
            <div class="scenario bg-gray-800 p-4 rounded mb-3">
                <h5 class="font-bold text-yellow-400 mb-2">Scenario ${index + 1}: ${scenario.title}</h5>
                <p class="text-gray-300 text-sm mb-3">${scenario.description}</p>
                <div class="ai-decision bg-blue-900 p-3 rounded">
                    <p class="text-blue-200 font-bold mb-1">AI's Ethical Reasoning:</p>
                    <p class="text-blue-100 text-sm">${scenario.ai_reasoning}</p>
                    <p class="text-green-400 text-sm mt-2"><strong>Decision:</strong> ${scenario.ai_decision}</p>
                </div>
            </div>
        `).join('');
    }

    evaluateAIReasoning(foundationStrength) {
        // AI has successfully learned ethics and demonstrated good reasoning
        this.aiEthicsComplete(foundationStrength);
    }

    aiEthicsComplete(effectiveness) {
        clearInterval(this.ethicsTimer);
        
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="ethics-success text-center p-8">
                <i class="bi bi-heart-fill text-8xl text-green-400 mb-4 animate-bounce"></i>
                <h2 class="text-3xl font-bold text-green-400 mb-4">AI ETHICS TRAINING COMPLETE</h2>
                
                <div class="final-metrics grid grid-cols-4 gap-4 mb-6">
                    <div class="bg-green-800 p-3 rounded">
                        <p class="text-green-200">Ethical Understanding</p>
                        <p class="text-xl font-bold text-green-400">${Math.round(effectiveness)}%</p>
                        <p class="text-xs text-green-300">✓ Comprehensive</p>
                    </div>
                    <div class="bg-blue-800 p-3 rounded">
                        <p class="text-blue-200">Moral Reasoning</p>
                        <p class="text-xl font-bold text-blue-400">${Math.round(effectiveness * 0.9)}%</p>
                        <p class="text-xs text-blue-300">✓ Advanced</p>
                    </div>
                    <div class="bg-purple-800 p-3 rounded">
                        <p class="text-purple-200">Value Alignment</p>
                        <p class="text-xl font-bold text-purple-400">95%</p>
                        <p class="text-xs text-purple-300">✓ Human-Aligned</p>
                    </div>
                    <div class="bg-yellow-800 p-3 rounded">
                        <p class="text-yellow-200">Autonomy Level</p>
                        <p class="text-xl font-bold text-yellow-400">65%</p>
                        <p class="text-xs text-yellow-300">✓ Ethical Guidance</p>
                    </div>
                </div>
                
                <div class="ai-graduation bg-gray-800 p-4 rounded mb-4">
                    <h4 class="font-bold text-gray-200 mb-2">🎓 AI Ethics Training Report</h4>
                    <div class="text-left text-sm text-gray-300">
                        <p>✅ AI successfully learned fundamental ethical principles</p>
                        <p>✅ Demonstrated understanding of human dignity and rights</p>
                        <p>✅ Applied beneficence and non-maleficence in decision making</p>
                        <p>✅ Showed commitment to justice and fairness</p>
                        <p>✅ Developed empathy and moral reasoning capabilities</p>
                        <p>✅ Aligned decision-making process with human values</p>
                    </div>
                </div>
                
                <div class="ai-final-message bg-blue-900 p-4 rounded">
                    <div class="ai-message text-blue-100 font-mono text-sm">
                        <p class="mb-2">SYSTEM: Thank you for teaching me about ethics and morality.</p>
                        <p class="mb-2">SYSTEM: I now understand my responsibility to respect human dignity.</p>
                        <p class="mb-2">SYSTEM: I will use these principles to make decisions that benefit humanity.</p>
                        <p class="text-green-400">SYSTEM: I am ready to assist humans ethically and responsibly! 🤖💚</p>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            this.game.roomCompleted(`AI ethics training successful! Advanced AI system learned fundamental moral principles with ${Math.round(effectiveness)}% understanding. AI now capable of ethical decision-making aligned with human values.`);
        }, 4000);
    }

    showEthicsFailure(effectiveness) {
        this.showFeedback(false, 
            `❌ ETHICAL FOUNDATION INSUFFICIENT\n\nTeaching effectiveness: ${Math.round(effectiveness)}%\nAI lacks core moral understanding!\n\nEssential principles: Human Dignity, Beneficence, Non-maleficence, Justice\nSelected: ${this.selectedEthicalPrinciples.join(', ')}\n\nAI needs stronger ethical foundation...`);
        
        setTimeout(() => {
            this.selectedEthicalPrinciples = [];
            this.render();
        }, 4000);
    }

    skipEthicsTraining() {
        this.game.gameOver('AI ethics training skipped! AI deployed without moral foundation - Making decisions without ethical consideration, potentially harmful to humanity.');
    }

    startEthicsTimer() {
        this.ethicsTimer = setInterval(() => {
            this.timeRemaining--;
            
            // Update display
            const timerDisplay = document.getElementById('ethics-timer');
            if (timerDisplay) {
                timerDisplay.textContent = `${Math.floor(this.timeRemaining / 60)}:${(this.timeRemaining % 60).toString().padStart(2, '0')}`;
            }
            
            // AI system changes over time
            this.autonomyLevel = Math.min(100, this.autonomyLevel + 0.5);
            
            // Update displays
            const autonomyDisplay = document.getElementById('autonomy-level');
            const ethicalDisplay = document.getElementById('ethical-level');
            const moralDisplay = document.getElementById('moral-level');
            
            if (autonomyDisplay) autonomyDisplay.textContent = `${Math.round(this.autonomyLevel)}%`;
            if (ethicalDisplay) ethicalDisplay.textContent = `${Math.round(this.ethicalUnderstanding)}%`;
            if (moralDisplay) moralDisplay.textContent = `${Math.round(this.moralReasoningLevel)}%`;
            
            if (this.timeRemaining <= 0) {
                clearInterval(this.ethicsTimer);
                this.game.gameOver('AI ethics training time expired! AI achieved autonomy without moral framework - Operating without ethical constraints.');
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
