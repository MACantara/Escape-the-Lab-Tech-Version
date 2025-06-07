// Import networking modules for Room1

// Import cloud computing modules for Room2

class EscapeTheLabGame {
    constructor() {
        this.currentRoom = 1;
        this.totalRooms = 6; // Updated to include only 6 tech rooms
        this.timeLimit = 3600; // 60 minutes in seconds
        this.timeRemaining = this.timeLimit;
        this.gameActive = false;
        this.rooms = [
            'networking',           // Room1
            'cloud-computing',      // Room2
            'ai-systems',          // Room3
            'database-emergency',   // Room4
            'cybersecurity',       // Room5
            'programming-crisis'    // Room6
        ];
        this.loadedScripts = new Set(); // Track loaded scripts
        this.gameStarted = false;
        this.currentRoomInstance = null; // Track current room instance
        
        // Player character system
        this.player = {
            name: "Agent",
            level: 1,
            roomsCompleted: 0,
            cosmetics: {
                suit: 'basic',
                helmet: 'none',
                gloves: 'basic',
                badge: 'none',
                weapon: 'none'
            },
            unlockedCosmetics: ['basic-suit', 'basic-gloves']
        };
        
        this.init();
    }

    init() {
        this.loadPlayerData(); // Load player data before starting
        this.setupEventListeners();
        this.startGame();
        
        // Set up wave navigation after game initialization
        this.setupWaveNavigation();
    }

    setupEventListeners() {
        document.getElementById('next-room-btn').addEventListener('click', () => {
            this.nextRoom();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // Add fullscreen toggle
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F11' && this.gameActive) {
                e.preventDefault();
                this.toggleFullscreen();
            }
        });
    }

    setupWaveNavigation() {
        // Set up wave navigation buttons
        document.querySelectorAll('.wave-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roomNumber = parseInt(e.currentTarget.dataset.room);
                console.log(`Wave navigation: Jumping to Room ${roomNumber}`);
                this.stopCurrentRoom(); // Stop current room before loading new one
                this.loadRoom(roomNumber);
            });
        });
        
        console.log('Wave navigation buttons configured');
    }

    stopCurrentRoom() {
        if (this.currentRoomInstance) {
            console.log('Stopping current room instance...');
            
            // Clear any running timers/intervals
            if (this.currentRoomInstance.defenseTimer) {
                clearInterval(this.currentRoomInstance.defenseTimer);
                console.log('Cleared defense timer');
            }
            
            if (this.currentRoomInstance.gameTimer) {
                clearInterval(this.currentRoomInstance.gameTimer);
                console.log('Cleared game timer');
            }
            
            if (this.currentRoomInstance.visualTimer) {
                clearInterval(this.currentRoomInstance.visualTimer);
                console.log('Cleared visual timer');
            }
            
            if (this.currentRoomInstance.timerInterval) {
                clearInterval(this.currentRoomInstance.timerInterval);
                console.log('Cleared timer interval');
            }
            
            // Call cleanup method if it exists
            if (typeof this.currentRoomInstance.cleanup === 'function') {
                this.currentRoomInstance.cleanup();
                console.log('Called room cleanup method');
            }
            
            // Stop any running games/simulations
            if (this.currentRoomInstance.isRunning) {
                this.currentRoomInstance.isRunning = false;
            }
            
            if (this.currentRoomInstance.isDefending) {
                this.currentRoomInstance.isDefending = false;
            }
            
            // Clear the instance
            this.currentRoomInstance = null;
            console.log('Current room instance cleared');
        }
    }

    startGame() {
        this.gameActive = true;
        this.gameStarted = true;
        
        this.startTimer();
        this.loadRoom(1);
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.gameOver('Time\'s up! The lab security system has been activated.');
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    async loadRoom(roomNumber) {
        console.log(`Loading room ${roomNumber}...`);
        
        // Stop the current room before loading new one
        this.stopCurrentRoom();
        
        this.currentRoom = roomNumber;
        document.getElementById('current-room').textContent = roomNumber;
        
        const roomName = this.rooms[roomNumber - 1];
        
        try {
            // Show loading state
            document.getElementById('room-content').innerHTML = `
                <div class="loading text-center">
                    <i class="bi bi-gear-fill animate-spin text-4xl text-yellow-400"></i>
                    <p class="mt-4">Loading Room ${roomNumber}...</p>
                </div>
            `;

            // Handle modular rooms with ES6 imports
            if (roomNumber === 1 || roomNumber === 2 || roomNumber === 4) {
                console.log(`Loading modular room: ${roomName}`);
                
                // Dynamic import for modular rooms - Fixed paths
                const moduleMap = {
                    1: './networking/networking.js',
                    2: './cloud-computing/cloud-computing.js', 
                    4: './database-emergency/database-emergency.js'
                };
                
                const modulePath = moduleMap[roomNumber];
                
                try {
                    console.log(`Importing module from: ${modulePath}`);
                    const module = await import(modulePath);
                    
                    // The main class should be exported as default or named export
                    const RoomClass = module[`Room${roomNumber}`] || module.default;
                    
                    if (RoomClass) {
                        console.log(`Successfully imported Room${roomNumber}`);
                        this.currentRoomInstance = new RoomClass(this);
                        await this.currentRoomInstance.init();
                    } else {
                        throw new Error(`Room${roomNumber} class not found in module`);
                    }
                } catch (importError) {
                    console.error(`Failed to import modular room ${roomNumber}:`, importError);
                    throw importError;
                }
            } else {
                // Handle non-modular rooms (3, 5, 6) with traditional script loading
                console.log(`Loading traditional room: ${roomName}`);
                
                const scriptMap = {
                    3: 'static/js/ai-systems/ai-systems.js',
                    5: 'static/js/cybersecurity/cybersecurity.js',
                    6: 'static/js/programming-crisis/programming-crisis.js'
                };
                
                const scriptPath = scriptMap[roomNumber];
                
                if (!this.loadedScripts.has(scriptPath)) {
                    console.log(`Loading script: ${scriptPath}`);
                    await this.loadScript(scriptPath);
                    this.loadedScripts.add(scriptPath);
                    console.log(`Script loaded: ${scriptPath}`);
                }
                
                // Small delay to ensure script is fully executed
                await this.sleep(100);
                
                // Initialize room
                const roomClassName = `Room${roomNumber}`;
                console.log(`Looking for class: ${roomClassName}`, window[roomClassName]);
                
                if (window[roomClassName]) {
                    console.log(`Initializing ${roomClassName}...`);
                    this.currentRoomInstance = new window[roomClassName](this);
                    await this.currentRoomInstance.init();
                    console.log(`${roomClassName} initialized successfully`);
                } else {
                    throw new Error(`Room class ${roomClassName} not found after script load`);
                }
            }
        } catch (error) {
            console.error('Failed to load room:', error);
            document.getElementById('room-content').innerHTML = `
                <div class="error text-center text-red-400">
                    <i class="bi bi-exclamation-triangle text-6xl mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Room Loading Error</h3>
                    <p class="mb-4">Failed to load Room ${roomNumber}</p>
                    <p class="text-sm text-gray-400">Error: ${error.message}</p>
                    <button onclick="location.reload()" class="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
                        Restart Game
                    </button>
                </div>
            `;
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log(`Script loaded: ${src}`);
                resolve();
            };
            script.onerror = () => {
                console.error(`Failed to load script: ${src}`);
                reject(new Error(`Failed to load script: ${src}`));
            };
            document.head.appendChild(script);
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    roomCompleted(message) {
        this.player.roomsCompleted++;
        this.unlockCosmetics();
        
        if (this.currentRoom === this.totalRooms) {
            this.gameWon();
        } else {
            this.showSuccessModal(message);
        }
    }

    unlockCosmetics() {
        const roomsCompleted = this.player.roomsCompleted;
        const newUnlocks = [];
        
        // Room-based cosmetic unlocks for tech rooms only
        switch(roomsCompleted) {
            case 1:
                newUnlocks.push('Network Security Badge', 'Cyber Defense Helmet');
                this.player.unlockedCosmetics.push('network-badge', 'neural-helmet');
                break;
            case 2:
                newUnlocks.push('Cloud Engineer Suit', 'DevOps Badge');
                this.player.unlockedCosmetics.push('cloud-suit', 'devops-badge');
                break;
            case 3:
                newUnlocks.push('AI Specialist Suit', 'AI Ethics Badge');
                this.player.unlockedCosmetics.push('ai-suit', 'ai-badge');
                break;
            case 4:
                newUnlocks.push('Database Engineer Suit', 'SQL Tablet', 'Database Badge');
                this.player.unlockedCosmetics.push('data-suit', 'sql-tablet', 'data-badge');
                break;
            case 5:
                newUnlocks.push('Cybersecurity Suit', 'Security Badge', 'Penetration Testing Kit');
                this.player.unlockedCosmetics.push('cyber-suit', 'security-badge', 'penetration-kit');
                break;
            case 6:
                newUnlocks.push('Master Developer Suit', 'Programming Badge', 'Debug Scanner');
                this.player.unlockedCosmetics.push('developer-suit', 'programming-badge', 'debug-scanner');
                break;
        }
        
        if (newUnlocks.length > 0) {
            this.showCosmeticUnlocks(newUnlocks);
        }
    }

    showCosmeticUnlocks(newUnlocks) {
        const unlockModal = document.createElement('div');
        unlockModal.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
        unlockModal.innerHTML = `
            <div class="bg-gradient-to-br from-purple-900 to-blue-900 border-2 border-purple-500 p-6 rounded-lg max-w-md text-center">
                <i class="bi bi-star-fill text-6xl text-yellow-400 mb-4 animate-pulse"></i>
                <h3 class="text-2xl font-bold text-purple-200 mb-4">COSMETICS UNLOCKED!</h3>
                <div class="text-purple-100 mb-4">
                    <p class="mb-2">🎉 New equipment available:</p>
                    <ul class="list-disc list-inside space-y-1">
                        ${newUnlocks.map(item => `<li class="text-yellow-300">${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="flex gap-3 justify-center">
                    <button id="view-cosmetics" class="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded font-bold">
                        View Equipment
                    </button>
                    <button id="continue-mission" class="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded font-bold">
                        Continue Mission
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(unlockModal);
        
        document.getElementById('view-cosmetics').addEventListener('click', () => {
            unlockModal.remove();
            this.showCosmeticMenu();
        });
        
        document.getElementById('continue-mission').addEventListener('click', () => {
            unlockModal.remove();
        });
    }

    showSuccessModal(message) {
        document.getElementById('success-message').textContent = message;
        
        // Add cosmetic button to success modal
        const successModal = document.getElementById('success-modal');
        const existingButton = successModal.querySelector('#customize-character');
        if (!existingButton) {
            const nextButton = document.getElementById('next-room-btn');
            const customizeButton = document.createElement('button');
            customizeButton.id = 'customize-character';
            customizeButton.className = 'bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded mr-3';
            customizeButton.innerHTML = '<i class="bi bi-person-gear"></i> Customize';
            customizeButton.addEventListener('click', () => this.showCosmeticMenu());
            nextButton.parentNode.insertBefore(customizeButton, nextButton);
        }
        
        successModal.classList.remove('hidden');
        successModal.classList.add('flex');
    }

    nextRoom() {
        document.getElementById('success-modal').classList.add('hidden');
        document.getElementById('success-modal').classList.remove('flex');
        this.stopCurrentRoom(); // Stop current room before loading next
        this.loadRoom(this.currentRoom + 1);
    }

    pauseGame(reason) {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.showPauseOverlay(reason);
    }

    resumeGame() {
        this.hidePauseOverlay();
        this.startTimer();
    }

    showPauseOverlay(reason) {
        let overlay = document.getElementById('pause-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'pause-overlay';
            overlay.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50';
            overlay.innerHTML = `
                <div class="text-center">
                    <i class="bi bi-pause-circle text-8xl text-yellow-400 mb-4 animate-pulse"></i>
                    <h2 class="text-3xl font-bold text-yellow-400 mb-4">GAME PAUSED</h2>
                    <p id="pause-reason" class="text-gray-300 mb-6"></p>
                    <p class="text-gray-400 text-sm">Return to this tab to continue...</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        
        document.getElementById('pause-reason').textContent = reason;
        overlay.style.display = 'flex';
    }

    hidePauseOverlay() {
        const overlay = document.getElementById('pause-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showNavigationWarning() {
        const warning = document.createElement('div');
        warning.className = 'fixed top-4 right-4 bg-red-800 border border-red-500 p-4 rounded-lg z-50 animate-pulse';
        warning.innerHTML = `
            <div class="flex items-center">
                <i class="bi bi-exclamation-triangle text-red-400 mr-2"></i>
                <span class="text-red-100 text-sm">Navigation restricted during active mission!</span>
            </div>
        `;
        
        document.body.appendChild(warning);
        
        setTimeout(() => {
            warning.remove();
        }, 3000);
    }

    enableFullscreen() {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Fullscreen request failed:', err);
            });
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.enableFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    gameWon() {
        clearInterval(this.timerInterval);
        this.gameActive = false;
        
        const timeUsed = this.timeLimit - this.timeRemaining;
        const minutes = Math.floor(timeUsed / 60);
        const seconds = timeUsed % 60;
        
        // Show victory modal with character
        document.getElementById('room-content').innerHTML = `
            <div class="victory text-center">
                <i class="bi bi-trophy-fill text-8xl text-yellow-400 mb-6"></i>
                <h2 class="text-4xl font-bold text-green-400 mb-4">MISSION ACCOMPLISHED!</h2>
                
                <div class="victory-character mb-6">
                    ${this.renderCharacter()}
                </div>
                
                <p class="text-xl mb-4">You've successfully escaped the lab!</p>
                <p class="text-lg text-gray-300 mb-6">
                    Completion Time: ${minutes}:${seconds.toString().padStart(2, '0')}
                </p>
                
                <div class="victory-stats bg-gray-800 p-4 rounded-lg mb-6 max-w-md mx-auto">
                    <h3 class="text-lg font-bold text-purple-400 mb-2">🏆 Mission Statistics</h3>
                    <p class="text-gray-300">Rooms Completed: <span class="text-green-400">${this.player.roomsCompleted}/${this.totalRooms}</span></p>
                    <p class="text-gray-300">Equipment Unlocked: <span class="text-purple-400">${this.player.unlockedCosmetics.length}</span></p>
                    <p class="text-gray-300">Agent Level: <span class="text-yellow-400">${this.player.level}</span></p>
                </div>
                
                <div class="flex gap-4 justify-center">
                    <button onclick="location.reload()" class="bg-green-600 hover:bg-green-700 px-8 py-3 rounded text-lg">
                        New Mission
                    </button>
                    <button onclick="game.showCosmeticMenu()" class="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded text-lg">
                        <i class="bi bi-person-gear"></i> View Equipment
                    </button>
                </div>
            </div>
        `;
        
        // Level up player
        this.player.level++;
        this.savePlayerData();
    }

    gameOver(message) {
        clearInterval(this.timerInterval);
        this.gameActive = false;
        
        document.getElementById('failure-message').textContent = message;
        document.getElementById('gameover-modal').classList.remove('hidden');
        document.getElementById('gameover-modal').classList.add('flex');
    }

    restartGame() {
        this.stopCurrentRoom(); // Stop current room before restart
        window.location.reload();
    }

    renderCharacter() {
        const { suit, helmet, gloves, badge, weapon } = this.player.cosmetics;
        
        // Character visual representation for tech theme
        const suitIcons = {
            basic: '💻',
            cyber: '🔒',
            cloud: '☁️',
            ai: '🤖',
            data: '💾',
            hacker: '🕶️',
            developer: '👨‍💻'
        };
        
        const helmetIcons = {
            none: '',
            'neural-helmet': '🧠',
            'crypto-helmet': '🔐',
            'code-helmet': '💭'
        };
        
        const badgeIcons = {
            none: '',
            network: '🌐',
            devops: '🔄',
            ai: '🤖',
            data: '💾',
            security: '🔒',
            programming: '💻'
        };
        
        const weaponIcons = {
            none: '',
            'security-tablet': '📋',
            'monitoring-device': '📊',
            'quantum-scanner': '🔮',
            'sql-tablet': '💽',
            'penetration-kit': '🛠️',
            'debug-scanner': '🐛'
        };
        
        return `
            <div class="character-avatar-display text-center bg-gray-800 p-6 rounded-lg">
                <div class="character-visual text-8xl mb-4">
                    <div class="relative inline-block">
                        ${suitIcons[suit] || '💻'}
                        ${helmet !== 'none' ? `<div class="absolute -top-2 left-1/2 transform -translate-x-1/2 text-2xl">${helmetIcons[helmet]}</div>` : ''}
                    </div>
                </div>
                <div class="character-accessories flex justify-center gap-2 text-2xl">
                    ${badge !== 'none' ? badgeIcons[badge] : ''}
                    ${weapon !== 'none' ? weaponIcons[weapon] : ''}
                </div>
                <div class="character-name mt-2">
                    <p class="text-lg font-bold text-green-400">${this.player.name}</p>
                    <p class="text-sm text-gray-400">Technology Emergency Specialist</p>
                </div>
            </div>
        `;
    }

    showCosmeticMenu() {
        const cosmeticModal = document.createElement('div');
        cosmeticModal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4';
        cosmeticModal.innerHTML = `
            <div class="bg-gray-800 border-2 border-gray-600 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-3xl font-bold text-purple-400">🎽 AGENT CUSTOMIZATION</h2>
                        <button id="close-cosmetics" class="text-gray-400 hover:text-white text-2xl">
                            <i class="bi bi-x-circle"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Character Preview -->
                        <div class="character-preview bg-gray-900 p-6 rounded-lg">
                            <h3 class="text-xl font-bold text-green-400 mb-4 text-center">Agent Preview</h3>
                            <div id="character-display" class="character-avatar mx-auto">
                                ${this.renderCharacter()}
                            </div>
                            <div class="character-stats mt-4 text-center">
                                <p class="text-gray-300">Agent Level: <span class="text-green-400 font-bold">${this.player.level}</span></p>
                                <p class="text-gray-300">Missions Completed: <span class="text-blue-400 font-bold">${this.player.roomsCompleted}</span></p>
                                <p class="text-gray-300">Equipment Unlocked: <span class="text-purple-400 font-bold">${this.player.unlockedCosmetics.length}</span></p>
                            </div>
                        </div>
                        
                        <!-- Cosmetic Categories -->
                        <div class="cosmetic-options">
                            <h3 class="text-xl font-bold text-yellow-400 mb-4">Equipment Categories</h3>
                            
                            <!-- Suits -->
                            <div class="cosmetic-category mb-4">
                                <h4 class="font-bold text-blue-300 mb-2">🥽 Protective Suits</h4>
                                <div class="grid grid-cols-2 gap-2">
                                    ${this.renderCosmeticOptions('suit')}
                                </div>
                            </div>
                            
                            <!-- Helmets -->
                            <div class="cosmetic-category mb-4">
                                <h4 class="font-bold text-orange-300 mb-2">🪖 Head Protection</h4>
                                <div class="grid grid-cols-2 gap-2">
                                    ${this.renderCosmeticOptions('helmet')}
                                </div>
                            </div>
                            
                            <!-- Gloves -->
                            <div class="cosmetic-category mb-4">
                                <h4 class="font-bold text-green-300 mb-2">🧤 Hand Protection</h4>
                                <div class="grid grid-cols-2 gap-2">
                                    ${this.renderCosmeticOptions('gloves')}
                                </div>
                            </div>
                            
                            <!-- Badges -->
                            <div class="cosmetic-category mb-4">
                                <h4 class="font-bold text-purple-300 mb-2">🏅 Badges & Insignia</h4>
                                <div class="grid grid-cols-2 gap-2">
                                    ${this.renderCosmeticOptions('badge')}
                                </div>
                            </div>
                            
                            <!-- Equipment -->
                            <div class="cosmetic-category mb-4">
                                <h4 class="font-bold text-red-300 mb-2">🔧 Equipment & Tools</h4>
                                <div class="grid grid-cols-2 gap-2">
                                    ${this.renderCosmeticOptions('weapon')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(cosmeticModal);
        
        document.getElementById('close-cosmetics').addEventListener('click', () => {
            cosmeticModal.remove();
        });
        
        // Add event listeners for cosmetic selections
        cosmeticModal.querySelectorAll('.cosmetic-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const button = e.currentTarget;
                if (button.disabled) return;
                
                const category = button.dataset.category;
                const value = button.dataset.value;
                
                // Equip the cosmetic
                this.equipCosmetic(category, value);
                
                // Update character preview
                this.updateCharacterPreview();
                
                // Update button states
                this.updateCosmeticSelection(cosmeticModal);
            });
        });
    }

    renderCosmeticOptions(category) {
        const cosmetics = this.getCosmeticsByCategory(category);
        
        return cosmetics.map(item => {
            const isUnlocked = this.player.unlockedCosmetics.includes(item.id);
            const isSelected = this.player.cosmetics[category] === item.value;
            
            return `
                <button class="cosmetic-item p-2 rounded border-2 transition-colors ${
                    isSelected ? 'border-blue-400 bg-blue-800' : 
                    isUnlocked ? 'border-gray-500 bg-gray-700 hover:border-gray-300' : 
                    'border-red-500 bg-red-900 opacity-50'
                }" 
                data-category="${category}" 
                data-value="${item.value}"
                ${!isUnlocked ? 'disabled' : ''}>
                    <div class="text-center">
                        <div class="text-2xl mb-1">${item.icon}</div>
                        <div class="text-xs font-bold">${item.name}</div>
                        ${!isUnlocked ? '<div class="text-red-400 text-xs">🔒 Locked</div>' : ''}
                        ${isSelected ? '<div class="text-blue-400 text-xs">✓ Equipped</div>' : ''}
                    </div>
                </button>
            `;
        }).join('');
    }

    getCosmeticsByCategory(category) {
        const cosmetics = {
            suit: [
                { id: 'basic-suit', value: 'basic', name: 'Basic Tech Suit', icon: '💻' },
                { id: 'cyber-suit', value: 'cyber', name: 'Cyber Security Suit', icon: '🔒' },
                { id: 'cloud-suit', value: 'cloud', name: 'Cloud Engineer Suit', icon: '☁️' },
                { id: 'ai-suit', value: 'ai', name: 'AI Specialist Suit', icon: '🤖' },
                { id: 'data-suit', value: 'data', name: 'Data Engineer Suit', icon: '💾' },
                { id: 'hacker-suit', value: 'hacker', name: 'Ethical Hacker Suit', icon: '🕶️' },
                { id: 'developer-suit', value: 'developer', name: 'Master Developer Suit', icon: '👨‍💻' }
            ],
            helmet: [
                { id: 'none', value: 'none', name: 'None', icon: '👤' },
                { id: 'neural-helmet', value: 'neural-helmet', name: 'Neural Interface', icon: '🧠' },
                { id: 'crypto-helmet', value: 'crypto-helmet', name: 'Crypto Helmet', icon: '🔐' },
                { id: 'code-helmet', value: 'code-helmet', name: 'Code Helmet', icon: '💭' }
            ],
            gloves: [
                { id: 'basic-gloves', value: 'basic', name: 'Basic Tech Gloves', icon: '🧤' },
                { id: 'cyber-gloves', value: 'cyber', name: 'Cyber Gloves', icon: '⌨️' },
                { id: 'data-gloves', value: 'data', name: 'Data Gloves', icon: '📊' }
            ],
            badge: [
                { id: 'none', value: 'none', name: 'None', icon: '⚪' },
                { id: 'network-badge', value: 'network', name: 'Network Badge', icon: '🌐' },
                { id: 'devops-badge', value: 'devops', name: 'DevOps Badge', icon: '🔄' },
                { id: 'ai-badge', value: 'ai', name: 'AI Badge', icon: '🤖' },
                { id: 'data-badge', value: 'data', name: 'Database Badge', icon: '💾' },
                { id: 'security-badge', value: 'security', name: 'Security Badge', icon: '🔒' },
                { id: 'programming-badge', value: 'programming', name: 'Programming Badge', icon: '💻' }
            ],
            weapon: [
                { id: 'none', value: 'none', name: 'None', icon: '⚪' },
                { id: 'security-tablet', value: 'security-tablet', name: 'Security Tablet', icon: '📋' },
                { id: 'monitoring-device', value: 'monitoring-device', name: 'Monitoring Device', icon: '📊' },
                { id: 'quantum-scanner', value: 'quantum-scanner', name: 'Quantum Scanner', icon: '🔮' },
                { id: 'sql-tablet', value: 'sql-tablet', name: 'SQL Tablet', icon: '💽' },
                { id: 'penetration-kit', value: 'penetration-kit', name: 'Penetration Kit', icon: '🛠️' },
                { id: 'debug-scanner', value: 'debug-scanner', name: 'Debug Scanner', icon: '🐛' }
            ]
        };
        
        return cosmetics[category] || [];
    }

    equipCosmetic(category, itemValue) {
        this.player.cosmetics[category] = itemValue;
        localStorage.setItem('player-cosmetics', JSON.stringify(this.player.cosmetics));
    }

    updateCharacterPreview() {
        const characterDisplay = document.getElementById('character-display');
        if (characterDisplay) {
            characterDisplay.innerHTML = this.renderCharacter();
        }
    }

    updateCosmeticSelection(modal) {
        // Update button states
        modal.querySelectorAll('.cosmetic-item').forEach(item => {
            const category = item.dataset.category;
            const value = item.dataset.value;
            const isSelected = this.player.cosmetics[category] === value;
            
            // Remove existing selection classes
            item.classList.remove('border-blue-400', 'bg-blue-800', 'border-gray-500', 'bg-gray-700');
            
            if (isSelected) {
                item.classList.add('border-blue-400', 'bg-blue-800');
                item.querySelector('.text-xs:last-child')?.remove();
                const selectedDiv = document.createElement('div');
                selectedDiv.className = 'text-blue-400 text-xs';
                selectedDiv.textContent = '✓ Equipped';
                item.appendChild(selectedDiv);
            } else if (!item.disabled) {
                item.classList.add('border-gray-500', 'bg-gray-700');
            }
        });
    }

    loadPlayerData() {
        const savedCosmetics = localStorage.getItem('player-cosmetics');
        if (savedCosmetics) {
            this.player.cosmetics = { ...this.player.cosmetics, ...JSON.parse(savedCosmetics) };
        }
        
        const savedProgress = localStorage.getItem('player-progress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            this.player.roomsCompleted = progress.roomsCompleted || 0;
            this.player.unlockedCosmetics = progress.unlockedCosmetics || ['basic-suit', 'basic-gloves'];
        }
    }

    savePlayerData() {
        localStorage.setItem('player-cosmetics', JSON.stringify(this.player.cosmetics));
        localStorage.setItem('player-progress', JSON.stringify({
            roomsCompleted: this.player.roomsCompleted,
            unlockedCosmetics: this.player.unlockedCosmetics
        }));
    }
}

// Make game instance globally available for victory screen and navigation
let game;

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    game = new EscapeTheLabGame();
    
    // Make game globally available immediately
    window.game = game;
});

// Global function for manual testing
window.jumpToRoom = function(roomNumber) {
    console.log(`Manual jump to room ${roomNumber}`);
    if (window.game && window.game.loadRoom) {
        window.game.stopCurrentRoom();
        window.game.loadRoom(roomNumber);
    } else {
        console.error('Game not available for manual jump');
    }
};

// Export the game class for potential use in other modules
export { EscapeTheLabGame };
