export class GameManager {
    constructor(game) {
        this.game = game;
    }

    startGame() {
        this.game.gameActive = true;
        this.game.gameStarted = true;
        
        this.startTimer();
        this.game.levelManager.loadRoom(1);
    }

    startTimer() {
        this.game.timerInterval = setInterval(() => {
            this.game.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.game.timeRemaining <= 0) {
                this.gameOver('Time\'s up! The lab security system has been activated.');
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.game.timeRemaining / 60);
        const seconds = this.game.timeRemaining % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    roomCompleted(message) {
        this.game.player.roomsCompleted++;
        this.game.cosmeticManager.unlockCosmetics();
        
        if (this.game.currentRoom === this.game.totalRooms) {
            this.gameWon();
        } else {
            this.game.modalManager.showSuccessModal(message);
        }
    }

    nextRoom() {
        this.game.modalManager.hideSuccessModal();
        this.game.levelManager.stopCurrentRoom(); // Stop current room before loading next
        this.game.levelManager.loadRoom(this.game.currentRoom + 1);
    }

    pauseGame(reason) {
        if (this.game.timerInterval) {
            clearInterval(this.game.timerInterval);
        }
        
        this.game.modalManager.showPauseOverlay(reason);
    }

    resumeGame() {
        this.game.modalManager.hidePauseOverlay();
        this.startTimer();
    }

    gameWon() {
        clearInterval(this.game.timerInterval);
        this.game.gameActive = false;
        
        const timeUsed = this.game.timeLimit - this.game.timeRemaining;
        
        // Show victory modal with character
        document.getElementById('room-content').innerHTML = this.game.modalManager.showVictoryContent(timeUsed);
        
        // Level up player
        this.game.player.level++;
        this.game.cosmeticManager.savePlayerData();
    }

    gameOver(message) {
        clearInterval(this.game.timerInterval);
        this.game.gameActive = false;
        
        this.game.modalManager.showGameOverModal(message);
    }

    restartGame() {
        this.game.levelManager.stopCurrentRoom(); // Stop current room before restart
        window.location.reload();
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
}
