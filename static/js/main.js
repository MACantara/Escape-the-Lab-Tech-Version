// Import managers
import { LevelManager } from './managers/level-manager.js';
import { CosmeticManager } from './managers/cosmetic-manager.js';

class EscapeTheLabGame {
    constructor() {
        this.currentRoom = 1;
        this.totalRooms = 6; // Updated to include only 6 tech rooms
        this.timeLimit = 3600; // 60 minutes in seconds
        this.timeRemaining = this.timeLimit;
        this.gameActive = false;
        this.gameStarted = false;
        
        // Initialize managers
        this.levelManager = new LevelManager(this);
        this.cosmeticManager = new CosmeticManager(this);
        
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
        this.cosmeticManager.loadPlayerData(); // Load player data before starting
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
        
        // Add character menu button listener
        const characterMenuBtn = document.getElementById('character-menu-btn');
        if (characterMenuBtn) {
            characterMenuBtn.addEventListener('click', () => {
                this.cosmeticManager.showCosmeticMenu();
            });
        }
        
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
                this.levelManager.stopCurrentRoom(); // Stop current room before loading new one
                this.levelManager.loadRoom(roomNumber);
            });
        });
        
        console.log('Wave navigation buttons configured');
    }

    startGame() {
        this.gameActive = true;
        this.gameStarted = true;
        
        this.startTimer();
        this.levelManager.loadRoom(1);
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

    roomCompleted(message) {
        this.player.roomsCompleted++;
        this.cosmeticManager.unlockCosmetics();
        
        if (this.currentRoom === this.totalRooms) {
            this.gameWon();
        } else {
            this.showSuccessModal(message);
        }
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
            customizeButton.addEventListener('click', () => this.cosmeticManager.showCosmeticMenu());
            nextButton.parentNode.insertBefore(customizeButton, nextButton);
        }
        
        successModal.classList.remove('hidden');
        successModal.classList.add('flex');
    }

    nextRoom() {
        document.getElementById('success-modal').classList.add('hidden');
        document.getElementById('success-modal').classList.remove('flex');
        this.levelManager.stopCurrentRoom(); // Stop current room before loading next
        this.levelManager.loadRoom(this.currentRoom + 1);
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
                    ${this.cosmeticManager.renderCharacter()}
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
                    <button onclick="game.cosmeticManager.showCosmeticMenu()" class="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded text-lg">
                        <i class="bi bi-person-gear"></i> View Equipment
                    </button>
                </div>
            </div>
        `;
        
        // Level up player
        this.player.level++;
        this.cosmeticManager.savePlayerData();
    }

    gameOver(message) {
        clearInterval(this.timerInterval);
        this.gameActive = false;
        
        document.getElementById('failure-message').textContent = message;
        document.getElementById('gameover-modal').classList.remove('hidden');
        document.getElementById('gameover-modal').classList.add('flex');
    }

    restartGame() {
        this.levelManager.stopCurrentRoom(); // Stop current room before restart
        window.location.reload();
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
    if (window.game && window.game.levelManager.loadRoom) {
        window.game.levelManager.stopCurrentRoom();
        window.game.levelManager.loadRoom(roomNumber);
    } else {
        console.error('Game not available for manual jump');
    }
};

// Export the game class for potential use in other modules
export { EscapeTheLabGame };
