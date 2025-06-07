export class LevelManager {
    constructor(game) {
        this.game = game;
        this.loadedScripts = new Set();
        this.currentRoomInstance = null;
        this.rooms = [
            'networking',           // Room1
            'cloud-computing',      // Room2
            'ai-systems',          // Room3
            'database-emergency',   // Room4
            'cybersecurity',       // Room5
            'programming-crisis'    // Room6
        ];
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

    async loadRoom(roomNumber) {
        console.log(`Loading room ${roomNumber}...`);
        
        // Stop the current room before loading new one
        this.stopCurrentRoom();
        
        this.game.currentRoom = roomNumber;
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
                
                // Dynamic import for modular rooms
                const moduleMap = {
                    1: '../networking/networking.js',
                    2: '../cloud-computing/cloud-computing.js', 
                    4: '../database-emergency/database-emergency.js'
                };
                
                const modulePath = moduleMap[roomNumber];
                
                try {
                    console.log(`Importing module from: ${modulePath}`);
                    const module = await import(modulePath);
                    
                    // The main class should be exported as default or named export
                    const RoomClass = module[`Room${roomNumber}`] || module.default;
                    
                    if (RoomClass) {
                        console.log(`Successfully imported Room${roomNumber}`);
                        this.currentRoomInstance = new RoomClass(this.game);
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
                    this.currentRoomInstance = new window[roomClassName](this.game);
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

    getCurrentRoomInstance() {
        return this.currentRoomInstance;
    }
}
