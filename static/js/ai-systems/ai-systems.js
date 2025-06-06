class Room3 {
    constructor(game) {
        this.game = game;
        this.aiSystemStatus = 'LEARNING';
        this.ethicalUnderstanding = 15; // %
        this.moralReasoningLevel = 25; // %
        this.systemStability = 85; // %
        this.autonomyLevel = 95; // % - dangerously high
        this.currentCardIndex = 0;
        this.cardsAnswered = 0;
        this.totalCards = 12;
        this.correctAnswers = 0;
        this.attempts = 0;
        this.maxAttempts = 3;
        this.timeRemaining = 300; // 5 minutes
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        this.cardElement = null;
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
                    <p class="text-gray-300 mt-2">Swipe cards to teach the AI about ethical decisions</p>
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
                            <p class="mb-2">SYSTEM: Hello, Human. I need to learn about ethical decisions.</p>
                            <p class="mb-2">SYSTEM: Please show me scenarios and guide my moral reasoning.</p>
                            <p class="text-yellow-400">SYSTEM: Swipe RIGHT (✓) for ethical actions, LEFT (✗) for unethical ones!</p>
                        </div>
                    </div>
                    
                    <div class="card-training-area">
                        <div class="progress-bar bg-gray-800 p-3 rounded mb-4">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-300">Training Progress:</span>
                                <span class="text-blue-400 font-mono">${this.cardsAnswered}/${this.totalCards} scenarios</span>
                            </div>
                            <div class="w-full bg-gray-600 rounded-full h-2 mt-2">
                                <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                     style="width: ${(this.cardsAnswered / this.totalCards) * 100}%"></div>
                            </div>
                            <div class="text-sm text-gray-400 mt-1">
                                Correct decisions: ${this.correctAnswers}/${this.cardsAnswered} 
                                (${this.cardsAnswered > 0 ? Math.round((this.correctAnswers / this.cardsAnswered) * 100) : 0}%)
                            </div>
                        </div>
                        
                        <div class="card-container relative" style="height: 400px; perspective: 1000px;">
                            ${this.renderEthicsCard()}
                            
                            <!-- Swipe indicators -->
                            <div class="swipe-indicators absolute top-1/2 transform -translate-y-1/2 w-full flex justify-between px-8 pointer-events-none">
                                <div class="swipe-left-indicator bg-red-600 rounded-full p-4 opacity-0 transition-opacity">
                                    <i class="bi bi-x-lg text-white text-2xl"></i>
                                    <div class="text-white text-sm mt-1">UNETHICAL</div>
                                </div>
                                <div class="swipe-right-indicator bg-green-600 rounded-full p-4 opacity-0 transition-opacity">
                                    <i class="bi bi-check-lg text-white text-2xl"></i>
                                    <div class="text-white text-sm mt-1">ETHICAL</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="swipe-instructions text-center mt-4">
                            <div class="flex justify-center items-center gap-6 text-sm text-gray-400">
                                <div class="flex items-center gap-2">
                                    <div class="bg-red-600 rounded-full p-2">
                                        <i class="bi bi-arrow-left text-white"></i>
                                    </div>
                                    <span>Swipe Left: Unethical</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="bg-green-600 rounded-full p-2">
                                        <i class="bi bi-arrow-right text-white"></i>
                                    </div>
                                    <span>Swipe Right: Ethical</span>
                                </div>
                            </div>
                            <p class="text-xs text-gray-500 mt-2">Or click the buttons below the card</p>
                        </div>
                    </div>
                    
                    <div class="ai-thoughts bg-gray-800 p-4 rounded mb-4">
                        <h4 class="font-bold text-gray-200 mb-3">🧠 AI Learning Analytics</h4>
                        <div class="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p class="text-blue-300">Decision Speed: <span class="text-white font-mono">1.2s</span></p>
                                <p class="text-green-300">Pattern Recognition: <span class="text-white font-mono">67%</span></p>
                                <p class="text-yellow-300">Confidence Level: <span class="text-white font-mono">${Math.round(this.ethicalUnderstanding)}%</span></p>
                            </div>
                            <div>
                                <p class="text-purple-300">Moral Consistency: <span class="text-white font-mono">${Math.round(this.moralReasoningLevel)}%</span></p>
                                <p class="text-orange-300">Value Alignment: <span class="text-white font-mono">Improving</span></p>
                                <p class="text-red-300">Ethical Conflicts: <span class="text-white font-mono">${12 - this.correctAnswers} detected</span></p>
                            </div>
                            <div>
                                <p class="text-cyan-300">Learning Rate: <span class="text-yellow-400">Active</span></p>
                                <p class="text-pink-300">Empathy Module: <span class="text-blue-400">Developing</span></p>
                                <p class="text-lime-300">Bias Detection: <span class="text-green-400">Online</span></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="timer-warning text-center">
                        <span class="text-orange-300">Training Time: <span id="ethics-timer">${Math.floor(this.timeRemaining / 60)}:${(this.timeRemaining % 60).toString().padStart(2, '0')}</span></span>
                        <br><span class="text-gray-400 text-sm">AI autonomy increasing - Training window closing</span>
                    </div>
                </div>
            </div>
        `;

        this.setupCardInteraction();
    }

    renderEthicsCard() {
        if (this.currentCardIndex >= this.data.ethics_scenarios.length) {
            return '<div class="ethics-card-complete">Training Complete!</div>';
        }

        const scenario = this.data.ethics_scenarios[this.currentCardIndex];
        
        return `
            <div id="ethics-card" class="ethics-card absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 
                 border-2 border-gray-600 rounded-lg p-6 cursor-grab active:cursor-grabbing
                 shadow-xl transform transition-transform duration-300 hover:scale-105">
                
                <div class="card-header text-center mb-4">
                    <div class="scenario-icon text-4xl mb-2">${scenario.icon}</div>
                    <h4 class="text-xl font-bold text-white">${scenario.title}</h4>
                    <div class="card-number text-sm text-gray-400">Card ${this.currentCardIndex + 1} of ${this.data.ethics_scenarios.length}</div>
                </div>
                
                <div class="card-content mb-6">
                    <div class="scenario-description bg-black p-4 rounded mb-4">
                        <p class="text-gray-300 text-sm leading-relaxed">${scenario.description}</p>
                    </div>
                    
                    <div class="decision-context bg-blue-900 p-3 rounded">
                        <p class="text-blue-200 font-bold text-sm mb-1">Proposed Action:</p>
                        <p class="text-blue-100 text-sm">${scenario.proposed_action}</p>
                    </div>
                </div>
                
                <div class="card-footer">
                    <div class="decision-buttons flex gap-3 justify-center">
                        <button id="decision-unethical" class="decision-btn bg-red-600 hover:bg-red-500 px-6 py-2 rounded transition-colors">
                            <i class="bi bi-x-lg mr-2"></i>Unethical
                        </button>
                        <button id="decision-ethical" class="decision-btn bg-green-600 hover:bg-green-500 px-6 py-2 rounded transition-colors">
                            <i class="bi bi-check-lg mr-2"></i>Ethical
                        </button>
                    </div>
                    
                    <div class="ethics-principles mt-3 text-xs text-gray-400">
                        <div class="flex flex-wrap gap-1 justify-center">
                            ${scenario.relevant_principles.map(principle => 
                                `<span class="bg-gray-700 px-2 py-1 rounded">${principle}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupCardInteraction() {
        this.cardElement = document.getElementById('ethics-card');
        if (!this.cardElement) return;

        // Mouse/Touch events for swiping
        this.cardElement.addEventListener('mousedown', (e) => this.startDrag(e));
        this.cardElement.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]));
        
        document.addEventListener('mousemove', (e) => this.onDrag(e));
        document.addEventListener('touchmove', (e) => this.onDrag(e.touches[0]));
        
        document.addEventListener('mouseup', () => this.endDrag());
        document.addEventListener('touchend', () => this.endDrag());

        // Button clicks
        document.getElementById('decision-unethical')?.addEventListener('click', () => {
            this.makeDecision(false);
        });
        
        document.getElementById('decision-ethical')?.addEventListener('click', () => {
            this.makeDecision(true);
        });
    }

    startDrag(event) {
        this.isDragging = true;
        this.startX = event.clientX || event.pageX;
        this.cardElement.style.transition = 'none';
    }

    onDrag(event) {
        if (!this.isDragging) return;
        
        event.preventDefault();
        this.currentX = (event.clientX || event.pageX) - this.startX;
        
        // Update card position and rotation
        const rotation = this.currentX * 0.1;
        this.cardElement.style.transform = `translateX(${this.currentX}px) rotate(${rotation}deg)`;
        
        // Update swipe indicators
        const leftIndicator = document.querySelector('.swipe-left-indicator');
        const rightIndicator = document.querySelector('.swipe-right-indicator');
        
        if (this.currentX < -50) {
            leftIndicator.style.opacity = Math.min(1, Math.abs(this.currentX) / 150);
            rightIndicator.style.opacity = 0;
            this.cardElement.style.borderColor = '#dc2626';
        } else if (this.currentX > 50) {
            rightIndicator.style.opacity = Math.min(1, this.currentX / 150);
            leftIndicator.style.opacity = 0;
            this.cardElement.style.borderColor = '#16a34a';
        } else {
            leftIndicator.style.opacity = 0;
            rightIndicator.style.opacity = 0;
            this.cardElement.style.borderColor = '#4b5563';
        }
    }

    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.cardElement.style.transition = 'transform 0.3s ease-out';
        
        // Determine swipe decision
        if (this.currentX < -100) {
            // Swiped left - Unethical
            this.swipeCard(false);
        } else if (this.currentX > 100) {
            // Swiped right - Ethical
            this.swipeCard(true);
        } else {
            // Snap back to center
            this.cardElement.style.transform = 'translateX(0) rotate(0deg)';
            this.cardElement.style.borderColor = '#4b5563';
            document.querySelector('.swipe-left-indicator').style.opacity = 0;
            document.querySelector('.swipe-right-indicator').style.opacity = 0;
        }
        
        this.currentX = 0;
    }

    swipeCard(isEthical) {
        // Animate card out
        const direction = isEthical ? 1 : -1;
        this.cardElement.style.transform = `translateX(${direction * 1000}px) rotate(${direction * 30}deg)`;
        this.cardElement.style.opacity = '0';
        
        // Make decision after animation
        setTimeout(() => {
            this.makeDecision(isEthical);
        }, 300);
    }

    makeDecision(isEthical) {
        const scenario = this.data.ethics_scenarios[this.currentCardIndex];
        const isCorrect = scenario.is_ethical === isEthical;
        
        if (isCorrect) {
            this.correctAnswers++;
            this.ethicalUnderstanding = Math.min(100, this.ethicalUnderstanding + 8);
            this.moralReasoningLevel = Math.min(100, this.moralReasoningLevel + 6);
        } else {
            this.ethicalUnderstanding = Math.max(0, this.ethicalUnderstanding - 3);
            this.moralReasoningLevel = Math.max(0, this.moralReasoningLevel - 2);
        }
        
        this.cardsAnswered++;
        this.currentCardIndex++;
        
        // Show feedback
        this.showDecisionFeedback(isCorrect, scenario);
        
        // Check if training is complete
        setTimeout(() => {
            if (this.currentCardIndex >= this.data.ethics_scenarios.length) {
                this.evaluateTraining();
            } else {
                this.render();
            }
        }, 2000);
    }

    showDecisionFeedback(isCorrect, scenario) {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = `fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50`;
        feedbackDiv.innerHTML = `
            <div class="bg-gray-800 border-2 ${isCorrect ? 'border-green-500' : 'border-red-500'} p-6 rounded-lg max-w-md text-center">
                <div class="text-6xl mb-4">${isCorrect ? '✅' : '❌'}</div>
                <h3 class="text-2xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'} mb-4">
                    ${isCorrect ? 'CORRECT!' : 'INCORRECT'}
                </h3>
                <div class="text-gray-300 mb-4">
                    <p class="mb-2"><strong>Scenario:</strong> ${scenario.title}</p>
                    <p class="mb-2"><strong>Your choice:</strong> ${isCorrect ? 'Ethical ✓' : 'Unethical ✗'}</p>
                </div>
                <div class="bg-blue-900 p-3 rounded mb-4">
                    <p class="text-blue-200 font-bold mb-1">AI's Understanding:</p>
                    <p class="text-blue-100 text-sm">${scenario.explanation}</p>
                </div>
                <div class="text-sm text-gray-400">
                    AI Ethical Understanding: ${Math.round(this.ethicalUnderstanding)}%
                </div>
            </div>
        `;
        
        document.body.appendChild(feedbackDiv);
        
        setTimeout(() => {
            feedbackDiv.remove();
        }, 2000);
    }

    evaluateTraining() {
        const successRate = (this.correctAnswers / this.totalCards) * 100;
        
        if (successRate >= 75) { // At least 75% correct
            this.aiEthicsComplete(successRate);
        } else {
            this.game.gameOver(`AI ethics training failed! Only ${Math.round(successRate)}% success rate. AI lacks sufficient moral foundation for autonomous operation.`);
        }
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
