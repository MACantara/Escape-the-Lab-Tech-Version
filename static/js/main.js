// Import managers
import { LevelManager } from './managers/level-manager.js';
import { CosmeticManager } from './managers/cosmetic-manager.js';
import { ModalManager } from './managers/modal-manager.js';

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
        this.modalManager = new ModalManager(this);
        
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
            this.modalManager.showSuccessModal(message);
        }
    }

    nextRoom() {
        this.modalManager.hideSuccessModal();
        this.levelManager.stopCurrentRoom(); // Stop current room before loading next
        this.levelManager.loadRoom(this.currentRoom + 1);
    }

    pauseGame(reason) {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.modalManager.showPauseOverlay(reason);
    }

    resumeGame() {
        this.modalManager.hidePauseOverlay();
        this.startTimer();
    }

    showNavigationWarning() {
        this.modalManager.showNavigationWarning();
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
        
        // Show victory modal with character
        document.getElementById('room-content').innerHTML = this.modalManager.showVictoryContent(timeUsed);
        
        // Level up player
        this.player.level++;
        this.cosmeticManager.savePlayerData();
    }

    gameOver(message) {
        clearInterval(this.timerInterval);
        this.gameActive = false;
        
        this.modalManager.showGameOverModal(message);
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
