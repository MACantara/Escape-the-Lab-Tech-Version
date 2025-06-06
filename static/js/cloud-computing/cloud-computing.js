class Room2 {
    constructor(game) {
        this.game = game;
        this.nodes = [];
        this.connections = [];
        this.budget = 500;
        this.currentTraffic = 500;
        this.totalCapacity = 0;
        this.uptime = 100;
        this.gameTime = 0;
        this.maxGameTime = 180; // 3 minutes
        this.isRunning = false;
        this.selectedNode = null;
        this.connectionMode = false;
        this.gameArea = null;
        this.trafficParticles = [];
        this.nextNodeId = 1;
        this.internetNode = null; // Special internet node
        
        // Game state
        this.uptimeThreshold = 95; // Minimum uptime required
        this.downtimeSeconds = 0;
        this.maxDowntime = 30; // Max seconds of downtime before failure
        
        // Stable value tracking
        this.smoothedTraffic = 500;
        this.smoothedUptime = 100;
        this.smoothingFactor = 0.1; // Lower = more smoothing
        
        // Node dragging
        this.isDragging = false;
        this.dragNode = null;
        this.dragOffset = { x: 0, y: 0 };
        
        // Budget income system
        this.budgetIncomeRate = 5; // $5 per second
        this.lastIncomeTime = 0;
    }

    async init() {
        const response = await fetch('data/cloud-computing.json');
        this.data = await response.json();
        this.render();
        this.setupGameArea();
        this.startGame();
    }

    render() {
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="room-container p-6 fade-in">
                <div class="text-center mb-6">
                    <i class="bi bi-cloud-arrow-up text-6xl text-blue-500 animate-pulse"></i>
                    <h2 class="text-3xl font-bold mt-4 text-blue-400">VIRAL TRAFFIC SURGE</h2>
                    <p class="text-gray-300 mt-2">Scale your infrastructure to handle explosive traffic growth!</p>
                </div>
                
                <div class="status-panel grid grid-cols-5 gap-3 mb-4">
                    <div class="status-card bg-green-900 p-3 rounded text-center">
                        <i class="bi bi-speedometer2 text-green-400 text-xl"></i>
                        <p class="text-xs text-green-200">Uptime</p>
                        <p id="uptime-display" class="text-lg font-bold text-green-100">${this.uptime.toFixed(1)}%</p>
                    </div>
                    <div class="status-card bg-blue-900 p-3 rounded text-center">
                        <i class="bi bi-graph-up text-blue-400 text-xl"></i>
                        <p class="text-xs text-blue-200">Traffic</p>
                        <p id="traffic-display" class="text-lg font-bold text-blue-100">${this.currentTraffic}/s</p>
                    </div>
                    <div class="status-card bg-purple-900 p-3 rounded text-center">
                        <i class="bi bi-hdd text-purple-400 text-xl"></i>
                        <p class="text-xs text-purple-200">Capacity</p>
                        <p id="capacity-display" class="text-lg font-bold text-purple-100">${this.totalCapacity}/s</p>
                    </div>
                    <div class="status-card bg-yellow-900 p-3 rounded text-center">
                        <i class="bi bi-currency-dollar text-yellow-400 text-xl"></i>
                        <p class="text-xs text-yellow-200">Budget (+$${this.budgetIncomeRate}/s)</p>
                        <p id="budget-display" class="text-lg font-bold text-yellow-100">$${this.budget}</p>
                    </div>
                    <div class="status-card bg-red-900 p-3 rounded text-center">
                        <i class="bi bi-clock text-red-400 text-xl"></i>
                        <p class="text-xs text-red-200">Time</p>
                        <p id="time-display" class="text-lg font-bold text-red-100">${Math.max(0, this.maxGameTime - this.gameTime)}s</p>
                    </div>
                </div>

                <div class="game-container bg-gray-800 rounded-lg p-4 mb-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-white">🌐 Infrastructure Management</h3>
                        <div class="mode-indicator">
                            <span class="text-gray-300">Mode: </span>
                            <span id="mode-display" class="font-bold ${this.connectionMode ? 'text-blue-400' : 'text-green-400'}">
                                ${this.connectionMode ? 'CONNECTING' : 'BUILDING'}
                            </span>
                        </div>
                    </div>
                    
                    <div id="infrastructure-canvas" class="bg-black rounded border-2 border-gray-600 relative overflow-hidden" 
                         style="width: 100%; height: 400px;">
                        <!-- Traffic visualization and nodes will be rendered here -->
                        <div class="absolute top-2 left-2 text-white text-sm">
                            <div>Click to build | Right-click to connect | Drag to move | Middle-click to upgrade</div>
                        </div>
                        <div class="absolute top-2 right-2 text-white text-sm">
                            <div id="load-indicator" class="font-bold">Load: <span id="load-percentage">0</span>%</div>
                        </div>
                    </div>
                </div>

                <div class="controls-panel grid grid-cols-2 gap-4">
                    <div class="node-shop bg-gray-700 p-4 rounded">
                        <h4 class="font-bold text-white mb-3">🏪 Infrastructure Shop</h4>
                        <div class="grid grid-cols-1 gap-2">
                            ${this.data.node_types.map(node => `
                                <button class="shop-item p-2 rounded border transition-colors ${this.budget >= node.cost ? 'border-gray-500 hover:border-gray-300 bg-gray-600' : 'border-red-500 bg-red-900 opacity-50'}"
                                        data-node-type="${node.id}" ${this.budget < node.cost ? 'disabled' : ''}>
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center">
                                            <span class="text-2xl mr-2">${node.icon}</span>
                                            <div class="text-left">
                                                <div class="font-bold text-sm">${node.name}</div>
                                                <div class="text-xs text-gray-300">${node.capacity}/s capacity</div>
                                            </div>
                                        </div>
                                        <div class="text-yellow-400 font-bold">$${node.cost}</div>
                                    </div>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="control-center bg-gray-700 p-4 rounded">
                        <h4 class="font-bold text-white mb-3">🎛️ Control Center</h4>
                        <div class="space-y-2">
                            <button id="toggle-connection-mode" class="w-full p-2 rounded transition-colors ${this.connectionMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'}">
                                <i class="bi bi-diagram-3"></i> ${this.connectionMode ? 'Exit Connect Mode' : 'Connect Nodes'}
                            </button>
                            <button id="auto-scale" class="w-full p-2 rounded bg-green-600 hover:bg-green-500 transition-colors">
                                <i class="bi bi-gear"></i> Auto-Scale ($200)
                            </button>
                            <button id="emergency-maintenance" class="w-full p-2 rounded bg-yellow-600 hover:bg-yellow-500 transition-colors">
                                <i class="bi bi-tools"></i> Emergency Maintenance
                            </button>
                            <button id="abandon-infrastructure" class="w-full p-2 rounded bg-red-600 hover:bg-red-500 transition-colors">
                                <i class="bi bi-power"></i> Abandon Infrastructure
                            </button>
                        </div>
                        
                        <div class="traffic-info mt-4 p-3 bg-gray-800 rounded">
                            <h5 class="font-bold text-blue-400 mb-2">📊 Traffic Analysis</h5>
                            <div class="text-sm text-gray-300">
                                <div>Current Load: <span id="current-load" class="font-bold">${Math.round((this.currentTraffic / Math.max(this.totalCapacity, 1)) * 100)}%</span></div>
                                <div>Status: <span id="system-status" class="font-bold ${this.uptime >= this.uptimeThreshold ? 'text-green-400' : 'text-red-400'}">${this.uptime >= this.uptimeThreshold ? 'STABLE' : 'CRITICAL'}</span></div>
                                <div>Downtime: <span id="downtime-counter" class="font-bold text-orange-400">${this.downtimeSeconds}s</span></div>
                                <div>Revenue: <span class="font-bold text-green-400">+$${this.budgetIncomeRate}/s</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Shop items
        document.querySelectorAll('.shop-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const nodeType = e.currentTarget.dataset.nodeType;
                this.selectNodeType(nodeType);
            });
        });

        // Control buttons
        document.getElementById('toggle-connection-mode').addEventListener('click', () => {
            this.toggleConnectionMode();
        });

        document.getElementById('auto-scale').addEventListener('click', () => {
            this.autoScale();
        });

        document.getElementById('emergency-maintenance').addEventListener('click', () => {
            this.emergencyMaintenance();
        });

        document.getElementById('abandon-infrastructure').addEventListener('click', () => {
            this.abandonInfrastructure();
        });
    }

    setupGameArea() {
        this.gameArea = document.getElementById('infrastructure-canvas');
        
        // Canvas event listeners
        this.gameArea.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.gameArea.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleCanvasRightClick(e);
        });
        this.gameArea.addEventListener('mousedown', (e) => {
            if (e.button === 1) { // Middle click
                e.preventDefault();
                this.handleCanvasMiddleClick(e);
            } else if (e.button === 0) { // Left click for dragging
                this.handleMouseDown(e);
            }
        });
        
        // Add mouse move and mouse up listeners for dragging
        this.gameArea.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.gameArea.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.gameArea.addEventListener('mouseleave', (e) => this.handleMouseUp(e)); // Stop dragging if mouse leaves area

        // Create the internet node (fixed position, cannot be moved)
        this.createInternetNode();
        
        // Start with a basic web server connected to internet
        this.addNode('web-server', 200, 200, true);
        
        // Auto-connect first web server to internet
        if (this.nodes.length > 0) {
            this.createConnection(this.internetNode, this.nodes[0]);
        }
    }

    handleMouseDown(e) {
        if (this.connectionMode) return; // Don't drag in connection mode
        
        const rect = this.gameArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const clickedNode = this.getNodeAt(x, y);
        
        if (clickedNode && !clickedNode.isInternet) { // Don't allow dragging internet node
            this.isDragging = true;
            this.dragNode = clickedNode;
            this.dragOffset.x = x - clickedNode.x;
            this.dragOffset.y = y - clickedNode.y;
            
            // Change cursor to indicate dragging
            this.gameArea.style.cursor = 'grabbing';
            
            // Highlight the node being dragged
            this.highlightNode(clickedNode, true);
            
            e.preventDefault(); // Prevent text selection
        }
    }

    handleMouseMove(e) {
        if (!this.isDragging || !this.dragNode) return;
        
        const rect = this.gameArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate new position
        const newX = x - this.dragOffset.x;
        const newY = y - this.dragOffset.y;
        
        // Keep node within bounds (considering node size)
        const nodeRadius = 20;
        const boundedX = Math.max(nodeRadius, Math.min(800 - nodeRadius, newX));
        const boundedY = Math.max(nodeRadius, Math.min(400 - nodeRadius, newY));
        
        // Update node position
        this.dragNode.x = boundedX;
        this.dragNode.y = boundedY;
        
        // Update visual position
        if (this.dragNode.element) {
            this.dragNode.element.style.left = `${boundedX - nodeRadius}px`;
            this.dragNode.element.style.top = `${boundedY - nodeRadius}px`;
        }
        
        // Update all connections involving this node
        this.updateNodeConnections(this.dragNode);
    }

    handleMouseUp(e) {
        if (this.isDragging && this.dragNode) {
            // Remove highlight from dragged node
            this.highlightNode(this.dragNode, false);
            
            // Reset cursor
            this.gameArea.style.cursor = 'default';
            
            this.isDragging = false;
            this.dragNode = null;
        }
    }

    updateNodeConnections(node) {
        // Update all connection lines that involve this node
        this.connections.forEach(connection => {
            if (connection.from === node.id || connection.to === node.id) {
                this.updateConnectionElement(connection);
            }
        });
    }

    updateConnectionElement(connection) {
        if (!connection.element) return;
        
        let fromNode, toNode;
        
        if (connection.from === 'internet') {
            fromNode = this.internetNode;
            toNode = this.nodes.find(n => n.id === connection.to);
        } else if (connection.to === 'internet') {
            fromNode = this.nodes.find(n => n.id === connection.from);
            toNode = this.internetNode;
        } else {
            fromNode = this.nodes.find(n => n.id === connection.from);
            toNode = this.nodes.find(n => n.id === connection.to);
        }
        
        if (!fromNode || !toNode) return;
        
        // Recalculate line position and angle
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        connection.element.style.width = `${length}px`;
        connection.element.style.left = `${fromNode.x}px`;
        connection.element.style.top = `${fromNode.y}px`;
        connection.element.style.transform = `rotate(${angle}deg)`;
    }

    updateBudget() {
        const now = Date.now();
        
        // Initialize last income time if not set
        if (this.lastIncomeTime === 0) {
            this.lastIncomeTime = now;
            return;
        }
        
        // Calculate time since last income
        const timeDiff = (now - this.lastIncomeTime) / 1000; // Convert to seconds
        
        // Add income based on time passed
        if (timeDiff >= 1) { // Update every second
            const incomeAmount = Math.floor(timeDiff) * this.budgetIncomeRate;
            this.budget += incomeAmount;
            this.lastIncomeTime = now;
            
            // Show income notification occasionally
            if (Math.floor(timeDiff) >= 10) { // Every 10 seconds
                this.showMessage(`Revenue: +$${incomeAmount}`, 'info');
            }
        }
    }

    startGame() {
        this.isRunning = true;
        this.lastIncomeTime = Date.now(); // Initialize income timer
        
        this.gameTimer = setInterval(() => {
            this.gameTime++;
            this.updateTraffic();
            this.updateNodeLoads();
            this.updateUptime();
            this.updateTrafficVisualization();
            this.updateBudget(); // Add budget income
            this.updateDisplay();
            
            if (this.gameTime >= this.maxGameTime) {
                this.victoryCondition();
            }
            
            if (this.downtimeSeconds >= this.maxDowntime) {
                this.infrastructureCollapse();
            }
        }, 1000);
        
        // Visual update loop
        this.visualTimer = setInterval(() => {
            this.updateTrafficParticles();
        }, 50);
    }

    handleCanvasClick(e) {
        // Don't handle clicks if we just finished dragging
        if (this.isDragging) return;
        
        const rect = this.gameArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.connectionMode) {
            this.handleConnectionClick(x, y);
        } else if (this.selectedNodeType) {
            this.placeNode(x, y);
        }
    }

    placeNode(x, y) {
        if (!this.selectedNodeType) return;

        const nodeData = this.data.node_types.find(n => n.id === this.selectedNodeType);
        
        if (this.budget >= nodeData.cost) {
            this.addNode(this.selectedNodeType, x, y);
            this.budget -= nodeData.cost;
            this.selectedNodeType = null;
            this.gameArea.style.cursor = 'default';
            this.updateDisplay();
            this.playSound('node_place');
        }
    }

    addNode(type, x, y, free = false) {
        const nodeData = this.data.node_types.find(n => n.id === type);
        
        const node = {
            id: this.nextNodeId++,
            type: type,
            x: x,
            y: y,
            capacity: nodeData.capacity,
            currentLoad: 0,
            connections: [],
            upgrades: [],
            health: 100,
            element: null
        };

        this.nodes.push(node);
        this.totalCapacity += nodeData.capacity;
        this.createNodeElement(node);
        
        if (!free) {
            this.budget -= nodeData.cost;
        }
        
        this.updateDisplay();
        return node;
    }

    createNodeElement(node) {
        const nodeData = this.data.node_types.find(n => n.id === node.type);
        
        const element = document.createElement('div');
        element.className = 'node absolute cursor-pointer transition-all duration-200 hover:scale-110';
        element.style.left = `${node.x - 20}px`;
        element.style.top = `${node.y - 20}px`;
        element.style.width = '40px';
        element.style.height = '40px';
        element.style.backgroundColor = nodeData.color;
        element.style.borderRadius = '50%';
        element.style.border = '2px solid #fff';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.fontSize = '20px';
        element.style.zIndex = '10';
        element.innerHTML = nodeData.icon;
        element.title = `${nodeData.name} (${node.capacity}/s) - Click and drag to move`;
        
        // Add visual feedback for draggable nodes
        element.style.userSelect = 'none'; // Prevent text selection while dragging
        
        node.element = element;
        this.gameArea.appendChild(element);
    }

    createInternetNode() {
        this.internetNode = {
            id: 'internet',
            type: 'internet',
            x: 50,
            y: 200,
            capacity: Infinity, // Internet has unlimited capacity
            currentLoad: 0,
            connections: [],
            upgrades: [],
            health: 100,
            element: null,
            isInternet: true
        };

        const element = document.createElement('div');
        element.className = 'node absolute cursor-pointer transition-all duration-200';
        element.style.left = `${this.internetNode.x - 25}px`;
        element.style.top = `${this.internetNode.y - 25}px`;
        element.style.width = '50px';
        element.style.height = '50px';
        element.style.backgroundColor = '#1e40af';
        element.style.borderRadius = '50%';
        element.style.border = '3px solid #3b82f6';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.fontSize = '24px';
        element.style.zIndex = '10';
        element.style.boxShadow = '0 0 20px #3b82f6';
        element.innerHTML = '🌐';
        element.title = 'Internet - Traffic Source (∞ capacity)';
        
        this.internetNode.element = element;
        this.gameArea.appendChild(element);
    }

    selectNodeType(nodeType) {
        this.selectedNodeType = nodeType;
        const nodeData = this.data.node_types.find(n => n.id === nodeType);
        
        if (this.budget >= nodeData.cost) {
            this.gameArea.style.cursor = 'crosshair';
            this.showMessage(`Click to place ${nodeData.name} ($${nodeData.cost})`, 'info');
        } else {
            this.showMessage('Insufficient budget!', 'error');
        }
    }

    handleCanvasClick(e) {
        // Don't handle clicks if we just finished dragging
        if (this.isDragging) return;
        
        const rect = this.gameArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.connectionMode) {
            this.handleConnectionClick(x, y);
        } else if (this.selectedNodeType) {
            this.placeNode(x, y);
        }
    }

    handleCanvasRightClick(e) {
        const rect = this.gameArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.handleConnectionClick(x, y);
    }

    handleCanvasMiddleClick(e) {
        const rect = this.gameArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const node = this.getNodeAt(x, y);
        if (node) {
            this.showUpgradeMenu(node);
        }
    }

    placeNode(x, y) {
        if (!this.selectedNodeType) return;

        const nodeData = this.data.node_types.find(n => n.id === this.selectedNodeType);
        
        if (this.budget >= nodeData.cost) {
            this.addNode(this.selectedNodeType, x, y);
            this.budget -= nodeData.cost;
            this.selectedNodeType = null;
            this.gameArea.style.cursor = 'default';
            this.updateDisplay();
            this.playSound('node_place');
        }
    }

    addNode(type, x, y, free = false) {
        const nodeData = this.data.node_types.find(n => n.id === type);
        
        const node = {
            id: this.nextNodeId++,
            type: type,
            x: x,
            y: y,
            capacity: nodeData.capacity,
            currentLoad: 0,
            connections: [],
            upgrades: [],
            health: 100,
            element: null
        };

        this.nodes.push(node);
        this.totalCapacity += nodeData.capacity;
        this.createNodeElement(node);
        
        if (!free) {
            this.budget -= nodeData.cost;
        }
        
        this.updateDisplay();
        return node;
    }

    createNodeElement(node) {
        const nodeData = this.data.node_types.find(n => n.id === node.type);
        
        const element = document.createElement('div');
        element.className = 'node absolute cursor-pointer transition-all duration-200 hover:scale-110';
        element.style.left = `${node.x - 20}px`;
        element.style.top = `${node.y - 20}px`;
        element.style.width = '40px';
        element.style.height = '40px';
        element.style.backgroundColor = nodeData.color;
        element.style.borderRadius = '50%';
        element.style.border = '2px solid #fff';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.fontSize = '20px';
        element.style.zIndex = '10';
        element.innerHTML = nodeData.icon;
        element.title = `${nodeData.name} (${node.capacity}/s) - Click and drag to move`;
        
        // Add visual feedback for draggable nodes
        element.style.userSelect = 'none'; // Prevent text selection while dragging
        
        node.element = element;
        this.gameArea.appendChild(element);
    }

    handleConnectionClick(x, y) {
        const clickedNode = this.getNodeAt(x, y);
        
        if (!clickedNode) return;

        if (!this.selectedNode) {
            this.selectedNode = clickedNode;
            this.highlightNode(clickedNode, true);
            
            if (clickedNode.isInternet) {
                this.showMessage('Internet selected - connect to infrastructure nodes', 'info');
            } else {
                this.showMessage('Click another node to connect', 'info');
            }
        } else if (this.selectedNode === clickedNode) {
            this.highlightNode(clickedNode, false);
            this.selectedNode = null;
            this.showMessage('Connection cancelled', 'info');
        } else {
            this.createConnection(this.selectedNode, clickedNode);
            this.highlightNode(this.selectedNode, false);
            this.selectedNode = null;
        }
    }

    createConnection(node1, node2) {
        // Prevent connection between internet and itself
        if (node1.isInternet && node2.isInternet) return;
        
        // Check if connection already exists
        const exists = this.connections.some(conn => 
            (conn.from === node1.id && conn.to === node2.id) ||
            (conn.from === node2.id && conn.to === node1.id)
        );

        if (exists) {
            this.showMessage('Connection already exists!', 'error');
            return;
        }

        const connection = {
            from: node1.id,
            to: node2.id,
            element: null
        };

        this.connections.push(connection);
        node1.connections.push(node2.id);
        node2.connections.push(node1.id);
        
        this.createConnectionElement(connection);
        this.playSound('connection_made');
        
        if (node1.isInternet || node2.isInternet) {
            this.showMessage('Internet connection established!', 'success');
        } else {
            this.showMessage('Connection established!', 'success');
        }
    }

    createConnectionElement(connection) {
        let fromNode, toNode;
        
        if (connection.from === 'internet') {
            fromNode = this.internetNode;
            toNode = this.nodes.find(n => n.id === connection.to);
        } else if (connection.to === 'internet') {
            fromNode = this.nodes.find(n => n.id === connection.from);
            toNode = this.internetNode;
        } else {
            fromNode = this.nodes.find(n => n.id === connection.from);
            toNode = this.nodes.find(n => n.id === connection.to);
        }
        
        if (!fromNode || !toNode) return;
        
        const line = document.createElement('div');
        line.className = 'connection absolute border-t-2 border-yellow-400 opacity-60 transition-all duration-300';
        line.style.zIndex = '5';
        
        // Internet connections are thicker and blue
        if (fromNode.isInternet || toNode.isInternet) {
            line.style.borderColor = '#3b82f6';
            line.style.borderWidth = '3px';
            line.style.opacity = '0.8';
        }
        
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        line.style.width = `${length}px`;
        line.style.left = `${fromNode.x}px`;
        line.style.top = `${fromNode.y}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 0';
        
        // Add connection activity indicator
        line.addEventListener('mouseenter', () => {
            line.style.borderColor = '#60a5fa';
            line.style.opacity = '1.0';
        });
        
        line.addEventListener('mouseleave', () => {
            if (fromNode.isInternet || toNode.isInternet) {
                line.style.borderColor = '#3b82f6';
                line.style.opacity = '0.8';
            } else {
                line.style.borderColor = '#fbbf24';
                line.style.opacity = '0.6';
            }
        });
        
        connection.element = line;
        this.gameArea.appendChild(line);
    }

    updateTraffic() {
        // Get base traffic from pattern with proper time-based progression
        let baseTraffic = 500; // Starting traffic
        
        // Find the appropriate traffic pattern based on game time
        const relevantPatterns = this.data.traffic_patterns.filter(pattern => pattern.time <= this.gameTime);
        if (relevantPatterns.length > 0) {
            const currentPattern = relevantPatterns[relevantPatterns.length - 1]; // Get the latest applicable pattern
            baseTraffic = currentPattern.requests_per_second;
            
            // If there's a next pattern, interpolate between current and next
            const nextPattern = this.data.traffic_patterns.find(pattern => pattern.time > this.gameTime);
            if (nextPattern) {
                const timeDiff = nextPattern.time - currentPattern.time;
                const timeProgress = this.gameTime - currentPattern.time;
                const progressRatio = timeProgress / timeDiff;
                
                // Linear interpolation between current and next traffic levels
                const trafficDiff = nextPattern.requests_per_second - currentPattern.requests_per_second;
                baseTraffic = currentPattern.requests_per_second + (trafficDiff * progressRatio);
            }
        }
        
        // Add small controlled randomness (±2% instead of ±5% for more stability)
        const randomVariation = baseTraffic * 0.02 * (Math.random() - 0.5);
        const targetTraffic = Math.max(0, baseTraffic + randomVariation);
        
        // Smooth the traffic changes
        this.smoothedTraffic += (targetTraffic - this.smoothedTraffic) * this.smoothingFactor;
        this.currentTraffic = Math.round(this.smoothedTraffic);
    }

    updateUptime() {
        const loadPercentage = (this.currentTraffic / Math.max(this.totalCapacity, 1)) * 100;
        
        let targetUptime = this.uptime;
        
        if (loadPercentage > 100) {
            targetUptime = Math.max(0, this.uptime - 1.5);
            this.downtimeSeconds += 0.5;
            this.playSound('server_overload');
        } else if (loadPercentage > 90) {
            targetUptime = Math.max(0, this.uptime - 0.3);
        } else if (loadPercentage < 80) {
            targetUptime = Math.min(100, this.uptime + 0.2);
            if (this.downtimeSeconds > 0) {
                this.downtimeSeconds = Math.max(0, this.downtimeSeconds - 0.2);
            }
        }
        
        // Smooth uptime changes
        this.smoothedUptime += (targetUptime - this.smoothedUptime) * this.smoothingFactor;
        this.uptime = this.smoothedUptime;
    }

    updateTrafficVisualization() {
        // Calculate particle spawn rate based on current traffic
        const trafficLevel = this.currentTraffic;
        
        // Base spawn chance scales with traffic volume
        let particleSpawnChance = Math.min(trafficLevel / 1000, 1.0); // Scale from 0 to 1 based on traffic
        
        // Minimum spawn chance to always show some activity
        particleSpawnChance = Math.max(particleSpawnChance, 0.1);
        
        // For very high traffic, spawn multiple particles per frame
        let particlesToSpawn = 1;
        if (trafficLevel > 10000) {
            particlesToSpawn = Math.min(Math.floor(trafficLevel / 5000), 5); // Up to 5 particles at once
            particleSpawnChance = 0.8; // High chance to spawn when traffic is massive
        } else if (trafficLevel > 5000) {
            particlesToSpawn = 2;
            particleSpawnChance = 0.6;
        } else if (trafficLevel > 2000) {
            particleSpawnChance = 0.4;
        }
        
        // Only spawn if we have internet connections
        if (this.internetNode && this.internetNode.connections.length > 0) {
            for (let i = 0; i < particlesToSpawn; i++) {
                if (Math.random() < particleSpawnChance) {
                    this.createTrafficParticle();
                }
            }
        }
    }

    createTrafficParticle() {
        // Always start traffic from the internet node
        if (!this.internetNode || this.internetNode.connections.length === 0) return;

        // Choose a random node connected to internet (or the only one if there's just one)
        const targetNodeId = this.internetNode.connections[Math.floor(Math.random() * this.internetNode.connections.length)];
        const targetNode = this.nodes.find(n => n.id === targetNodeId);
        
        if (!targetNode) return;

        const particle = document.createElement('div');
        particle.className = 'traffic-particle absolute';
        
        // Vary particle size based on traffic intensity
        const trafficIntensity = this.currentTraffic / 1000;
        const particleSize = Math.max(4, Math.min(10, 4 + trafficIntensity * 0.5));
        
        particle.style.width = `${particleSize}px`;
        particle.style.height = `${particleSize}px`;
        particle.style.backgroundColor = this.getTrafficColor();
        particle.style.borderRadius = '50%';
        
        // Add slight random offset to spread particles out from internet node
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        
        particle.style.left = `${this.internetNode.x - particleSize/2 + offsetX}px`;
        particle.style.top = `${this.internetNode.y - particleSize/2 + offsetY}px`;
        particle.style.zIndex = '15';
        particle.style.boxShadow = `0 0 ${particleSize * 2}px ${particle.style.backgroundColor}`;
        particle.style.transition = 'all 0.1s ease-out';
        particle.dataset.startTime = Date.now();
        
        // Add pulsing animation for high traffic
        const loadPercentage = (this.currentTraffic / Math.max(this.totalCapacity, 1)) * 100;
        if (loadPercentage > 70) {
            particle.style.animation = 'pulse 0.5s infinite alternate';
        }
        
        // Add slight random rotation for visual variety
        particle.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        this.gameArea.appendChild(particle);
        
        // Animate particle from internet to first node
        this.animateParticleAlongPath(particle, this.internetNode, targetNode);
    }

    animateParticleAlongPath(particle, startNode, targetNode) {
        const startTime = Date.now();
        
        // Speed varies slightly with load but not dramatically
        const loadPercentage = (this.currentTraffic / Math.max(this.totalCapacity, 1)) * 100;
        const speedMultiplier = Math.max(0.8, Math.min(1.5, 1 + (loadPercentage - 50) / 200)); // 0.8x to 1.5x speed
        const duration = (1200 + Math.random() * 600) / speedMultiplier; // 1.2-1.8 seconds, slightly faster with high load
        
        const startX = startNode.x;
        const startY = startNode.y;
        const endX = targetNode.x;
        const endY = targetNode.y;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth movement
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            // Calculate current position
            const currentX = startX + (endX - startX) * easeProgress;
            const currentY = startY + (endY - startY) * easeProgress;
            
            const particleSize = parseFloat(particle.style.width);
            particle.style.left = `${currentX - particleSize/2}px`;
            particle.style.top = `${currentY - particleSize/2}px`;
            
            // Add subtle pulsing effect for overloaded systems
            if (loadPercentage > 90) {
                const pulseScale = 1 + Math.sin(elapsed * 0.02) * 0.3;
                particle.style.transform = `scale(${pulseScale}) rotate(${elapsed * 0.1}deg)`;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Particle reached destination, continue to next connection if available
                const availableConnections = targetNode.connections.filter(id => 
                    id !== startNode.id && id !== 'internet' // Don't go back to where we came from
                );
                
                if (availableConnections.length > 0 && Math.random() < 0.6) {
                    // 60% chance to continue to another node (reduced from 70% to prevent too long chains)
                    const nextNodeId = availableConnections[Math.floor(Math.random() * availableConnections.length)];
                    const nextNode = this.nodes.find(n => n.id === nextNodeId);
                    
                    if (nextNode) {
                        // Continue journey to next node
                        setTimeout(() => {
                            this.animateParticleAlongPath(particle, targetNode, nextNode);
                        }, 30); // Very short delay for continuous flow
                        return;
                    }
                }
                
                // End of journey - remove particle with fade effect
                particle.style.opacity = '0';
                particle.style.transform = 'scale(0.2)';
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.remove();
                    }
                }, 150);
            }
        };
        
        animate();
    }

    getNodeAt(x, y) {
        // Check internet node first (larger hitbox)
        if (this.internetNode) {
            const dx = this.internetNode.x - x;
            const dy = this.internetNode.y - y;
            if (Math.sqrt(dx * dx + dy * dy) <= 30) {
                return this.internetNode;
            }
        }
        
        // Check regular nodes
        return this.nodes.find(node => {
            const dx = node.x - x;
            const dy = node.y - y;
            return Math.sqrt(dx * dx + dy * dy) <= 25;
        });
    }

    toggleConnectionMode() {
        this.connectionMode = !this.connectionMode;
        this.selectedNode = null;
        
        // Reset any highlighted nodes
        this.nodes.forEach(node => this.highlightNode(node, false));
        
        this.updateDisplay();
        this.render(); // Re-render to update button text
    }

    startGame() {
        this.isRunning = true;
        this.lastIncomeTime = Date.now(); // Initialize income timer
        
        this.gameTimer = setInterval(() => {
            this.gameTime++;
            this.updateTraffic();
            this.updateNodeLoads();
            this.updateUptime();
            this.updateTrafficVisualization();
            this.updateBudget(); // Add budget income
            this.updateDisplay();
            
            if (this.gameTime >= this.maxGameTime) {
                this.victoryCondition();
            }
            
            if (this.downtimeSeconds >= this.maxDowntime) {
                this.infrastructureCollapse();
            }
        }, 1000);
        
        // Visual update loop
        this.visualTimer = setInterval(() => {
            this.updateTrafficParticles();
        }, 50);
    }

    updateTrafficVisualization() {
        // Calculate particle spawn rate based on current traffic
        const trafficLevel = this.currentTraffic;
        
        // Base spawn chance scales with traffic volume
        let particleSpawnChance = Math.min(trafficLevel / 1000, 1.0); // Scale from 0 to 1 based on traffic
        
        // Minimum spawn chance to always show some activity
        particleSpawnChance = Math.max(particleSpawnChance, 0.1);
        
        // For very high traffic, spawn multiple particles per frame
        let particlesToSpawn = 1;
        if (trafficLevel > 10000) {
            particlesToSpawn = Math.min(Math.floor(trafficLevel / 5000), 5); // Up to 5 particles at once
            particleSpawnChance = 0.8; // High chance to spawn when traffic is massive
        } else if (trafficLevel > 5000) {
            particlesToSpawn = 2;
            particleSpawnChance = 0.6;
        } else if (trafficLevel > 2000) {
            particleSpawnChance = 0.4;
        }
        
        // Only spawn if we have internet connections
        if (this.internetNode && this.internetNode.connections.length > 0) {
            for (let i = 0; i < particlesToSpawn; i++) {
                if (Math.random() < particleSpawnChance) {
                    this.createTrafficParticle();
                }
            }
        }
    }

    createTrafficParticle() {
        // Always start traffic from the internet node
        if (!this.internetNode || this.internetNode.connections.length === 0) return;

        // Choose a random node connected to internet (or the only one if there's just one)
        const targetNodeId = this.internetNode.connections[Math.floor(Math.random() * this.internetNode.connections.length)];
        const targetNode = this.nodes.find(n => n.id === targetNodeId);
        
        if (!targetNode) return;

        const particle = document.createElement('div');
        particle.className = 'traffic-particle absolute';
        
        // Vary particle size based on traffic intensity
        const trafficIntensity = this.currentTraffic / 1000;
        const particleSize = Math.max(4, Math.min(10, 4 + trafficIntensity * 0.5));
        
        particle.style.width = `${particleSize}px`;
        particle.style.height = `${particleSize}px`;
        particle.style.backgroundColor = this.getTrafficColor();
        particle.style.borderRadius = '50%';
        
        // Add slight random offset to spread particles out from internet node
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        
        particle.style.left = `${this.internetNode.x - particleSize/2 + offsetX}px`;
        particle.style.top = `${this.internetNode.y - particleSize/2 + offsetY}px`;
        particle.style.zIndex = '15';
        particle.style.boxShadow = `0 0 ${particleSize * 2}px ${particle.style.backgroundColor}`;
        particle.style.transition = 'all 0.1s ease-out';
        particle.dataset.startTime = Date.now();
        
        // Add pulsing animation for high traffic
        const loadPercentage = (this.currentTraffic / Math.max(this.totalCapacity, 1)) * 100;
        if (loadPercentage > 70) {
            particle.style.animation = 'pulse 0.5s infinite alternate';
        }
        
        // Add slight random rotation for visual variety
        particle.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        this.gameArea.appendChild(particle);
        
        // Animate particle from internet to first node
        this.animateParticleAlongPath(particle, this.internetNode, targetNode);
    }

    animateParticleAlongPath(particle, startNode, targetNode) {
        const startTime = Date.now();
        
        // Speed varies slightly with load but not dramatically
        const loadPercentage = (this.currentTraffic / Math.max(this.totalCapacity, 1)) * 100;
        const speedMultiplier = Math.max(0.8, Math.min(1.5, 1 + (loadPercentage - 50) / 200)); // 0.8x to 1.5x speed
        const duration = (1200 + Math.random() * 600) / speedMultiplier; // 1.2-1.8 seconds, slightly faster with high load
        
        const startX = startNode.x;
        const startY = startNode.y;
        const endX = targetNode.x;
        const endY = targetNode.y;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth movement
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            // Calculate current position
            const currentX = startX + (endX - startX) * easeProgress;
            const currentY = startY + (endY - startY) * easeProgress;
            
            const particleSize = parseFloat(particle.style.width);
            particle.style.left = `${currentX - particleSize/2}px`;
            particle.style.top = `${currentY - particleSize/2}px`;
            
            // Add subtle pulsing effect for overloaded systems
            if (loadPercentage > 90) {
                const pulseScale = 1 + Math.sin(elapsed * 0.02) * 0.3;
                particle.style.transform = `scale(${pulseScale}) rotate(${elapsed * 0.1}deg)`;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Particle reached destination, continue to next connection if available
                const availableConnections = targetNode.connections.filter(id => 
                    id !== startNode.id && id !== 'internet' // Don't go back to where we came from
                );
                
                if (availableConnections.length > 0 && Math.random() < 0.6) {
                    // 60% chance to continue to another node (reduced from 70% to prevent too long chains)
                    const nextNodeId = availableConnections[Math.floor(Math.random() * availableConnections.length)];
                    const nextNode = this.nodes.find(n => n.id === nextNodeId);
                    
                    if (nextNode) {
                        // Continue journey to next node
                        setTimeout(() => {
                            this.animateParticleAlongPath(particle, targetNode, nextNode);
                        }, 30); // Very short delay for continuous flow
                        return;
                    }
                }
                
                // End of journey - remove particle with fade effect
                particle.style.opacity = '0';
                particle.style.transform = 'scale(0.2)';
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.remove();
                    }
                }, 150);
            }
        };
        
        animate();
    }

    getTrafficColor() {
        const loadPercentage = (this.currentTraffic / Math.max(this.totalCapacity, 1)) * 100;
        
        if (loadPercentage > 100) {
            return '#ef4444'; // Red for overload
        } else if (loadPercentage > 80) {
            return '#f59e0b'; // Orange for high load
        } else if (loadPercentage > 50) {
            return '#3b82f6'; // Blue for medium load
        } else if (loadPercentage > 25) {
            return '#10b981'; // Green for normal load
        } else {
            return '#6b7280'; // Gray for low load
        }
    }

    updateTrafficParticles() {
        // Clean up old particles that might be stuck
        const particles = this.gameArea.querySelectorAll('.traffic-particle');
        particles.forEach(particle => {
            // Remove particles that have been around too long (failsafe)
            if (!particle.dataset.startTime) {
                particle.dataset.startTime = Date.now();
            } else if (Date.now() - parseInt(particle.dataset.startTime) > 8000) { // Reduced from 10s to 8s
                particle.remove();
            }
        });
        
        // Show particle count for debugging (optional)
        if (particles.length > 50) { // If too many particles, clean up more aggressively
            const oldestParticles = Array.from(particles)
                .sort((a, b) => parseInt(a.dataset.startTime) - parseInt(b.dataset.startTime))
                .slice(0, 10);
            oldestParticles.forEach(p => p.remove());
        }
    }

    emergencyMaintenance() {
        // Temporarily boost uptime
        this.uptime = Math.min(100, this.uptime + 10);
        this.downtimeSeconds = Math.max(0, this.downtimeSeconds - 5);
        this.showMessage('Emergency maintenance completed!', 'success');
        this.updateDisplay();
    }

    showUpgradeMenu(node) {
        // Implementation for node upgrades
        this.showMessage('Upgrade menu not implemented yet', 'info');
    }

    highlightNode(node, highlight) {
        if (node.element) {
            if (highlight) {
                node.element.style.border = '3px solid #00ff00';
                node.element.style.boxShadow = '0 0 20px #00ff00';
            } else {
                node.element.style.border = '2px solid #fff';
                node.element.style.boxShadow = 'none';
            }
        }
    }

    updateDisplay() {
        const loadPercentage = Math.round((this.currentTraffic / Math.max(this.totalCapacity, 1)) * 100);
        
        // Use smoothed/rounded values for stable display
        document.getElementById('uptime-display').textContent = `${this.uptime.toFixed(1)}%`;
        document.getElementById('traffic-display').textContent = `${Math.round(this.currentTraffic)}/s`;
        document.getElementById('capacity-display').textContent = `${this.totalCapacity}/s`;
        document.getElementById('budget-display').textContent = `$${this.budget}`;
        document.getElementById('time-display').textContent = `${Math.max(0, this.maxGameTime - this.gameTime)}s`;
        document.getElementById('load-percentage').textContent = loadPercentage;
        document.getElementById('current-load').textContent = `${loadPercentage}%`;
        document.getElementById('system-status').textContent = this.uptime >= this.uptimeThreshold ? 'STABLE' : 'CRITICAL';
        document.getElementById('downtime-counter').textContent = `${Math.round(this.downtimeSeconds)}s`;
        
        // Update load indicator color
        const loadIndicator = document.getElementById('load-indicator');
        if (loadPercentage > 100) {
            loadIndicator.style.color = '#ef4444';
        } else if (loadPercentage > 80) {
            loadIndicator.style.color = '#f59e0b';
        } else {
            loadIndicator.style.color = '#10b981';
        }
        
        // Update shop items availability
        document.querySelectorAll('.shop-item').forEach(item => {
            const nodeType = item.dataset.nodeType;
            const nodeData = this.data.node_types.find(n => n.id === nodeType);
            
            if (this.budget >= nodeData.cost) {
                item.disabled = false;
                item.classList.remove('opacity-50', 'bg-red-900', 'border-red-500');
                item.classList.add('bg-gray-600', 'border-gray-500');
            } else {
                item.disabled = true;
                item.classList.add('opacity-50', 'bg-red-900', 'border-red-500');
                item.classList.remove('bg-gray-600', 'border-gray-500');
            }
        });
    }

    updateNodeLoads() {
        // Reset all node loads
        this.nodes.forEach(node => node.currentLoad = 0);
        
        // Traffic always starts from internet and flows through connected nodes
        if (this.internetNode && this.internetNode.connections.length > 0) {
            // Distribute traffic from internet to directly connected nodes
            const directConnections = this.internetNode.connections;
            const trafficPerConnection = this.currentTraffic / directConnections.length;
            
            directConnections.forEach(connectedId => {
                const connectedNode = this.nodes.find(n => n.id === connectedId);
                if (connectedNode) {
                    const nodeLoad = Math.min(connectedNode.capacity, trafficPerConnection);
                    connectedNode.currentLoad = nodeLoad;
                    
                    // Distribute excess traffic to further connected nodes
                    const excessTraffic = Math.max(0, trafficPerConnection - connectedNode.capacity);
                    if (excessTraffic > 0) {
                        // Don't send traffic back to internet
                        const forwardConnections = connectedNode.connections.filter(id => id !== 'internet');
                        if (forwardConnections.length > 0) {
                            const trafficPerForward = excessTraffic / forwardConnections.length;
                            
                            forwardConnections.forEach(forwardId => {
                                const forwardNode = this.nodes.find(n => n.id === forwardId);
                                if (forwardNode) {
                                    const additionalLoad = Math.min(
                                        forwardNode.capacity - forwardNode.currentLoad,
                                        trafficPerForward
                                    );
                                    forwardNode.currentLoad += additionalLoad;
                                }
                            });
                        }
                    }
                }
            });
        } else if (this.nodes.length > 0) {
            // Fallback: if no internet connections, distribute equally (but this shouldn't happen)
            const trafficPerNode = this.currentTraffic / this.nodes.length;
            this.nodes.forEach(node => {
                node.currentLoad = Math.min(node.capacity, trafficPerNode);
            });
        }
        
        // Update visual load indicators for all nodes
        this.nodes.forEach(node => {
            if (node.element) {
                const loadPercentage = (node.currentLoad / node.capacity) * 100;
                
                if (loadPercentage > 90) {
                    node.element.style.boxShadow = '0 0 15px #ef4444';
                    node.element.style.animation = 'pulse 1s infinite';
                    node.element.style.borderColor = '#ef4444';
                } else if (loadPercentage > 70) {
                    node.element.style.boxShadow = '0 0 10px #f59e0b';
                    node.element.style.animation = 'none';
                    node.element.style.borderColor = '#f59e0b';
                } else {
                    node.element.style.boxShadow = 'none';
                    node.element.style.animation = 'none';
                    node.element.style.borderColor = '#fff';
                }
                
                // Update node tooltip with load info
                const nodeData = this.data.node_types.find(n => n.id === node.type);
                node.element.title = `${nodeData.name}\nCapacity: ${node.capacity}/s\nCurrent Load: ${Math.round(node.currentLoad)}/s (${Math.round(loadPercentage)}%)`;
            }
        });
        
        // Update internet node visual (always stable)
        if (this.internetNode && this.internetNode.element) {
            this.internetNode.element.style.boxShadow = '0 0 20px #3b82f6';
            // Show current traffic output from internet
            this.internetNode.element.title = `Internet - Traffic Source\nCurrent Output: ${Math.round(this.currentTraffic)}/s\nConnected Nodes: ${this.internetNode.connections.length}`;
        }
    }

    autoScale() {
        if (this.budget >= 200) {
            this.budget -= 200;
            
            // Add optimal nodes based on current load
            const loadPercentage = (this.currentTraffic / this.totalCapacity) * 100;
            
            if (loadPercentage > 80) {
                // Add load balancer and web servers
                const x1 = 100 + Math.random() * 600;
                const y1 = 100 + Math.random() * 200;
                const x2 = 100 + Math.random() * 600;
                const y2 = 100 + Math.random() * 200;
                
                this.addNode('load-balancer', x1, y1, true);
                this.addNode('web-server', x2, y2, true);
                
                this.playSound('upgrade_complete');
                this.showMessage('Auto-scaling completed!', 'success');
            }
            
            this.updateDisplay();
        } else {
            this.showMessage('Insufficient budget for auto-scaling!', 'error');
        }
    }

    victoryCondition() {
        clearInterval(this.gameTimer);
        clearInterval(this.visualTimer);
        this.isRunning = false;
        
        const avgUptime = this.uptime;
        const finalCapacity = this.totalCapacity;
        const nodesBuilt = this.nodes.length;
        
        const container = document.getElementById('room-content');
        container.innerHTML = `
            <div class="infrastructure-success text-center p-8">
                <i class="bi bi-cloud-check text-8xl text-green-400 mb-4 animate-bounce"></i>
                <h2 class="text-3xl font-bold text-green-400 mb-4">INFRASTRUCTURE SCALED!</h2>
                
                <div class="final-stats grid grid-cols-4 gap-4 mb-6">
                    <div class="bg-green-800 p-3 rounded">
                        <p class="text-green-200">Final Uptime</p>
                        <p class="text-xl font-bold text-green-400">${avgUptime.toFixed(1)}%</p>
                        <p class="text-xs text-green-300">✓ Service Maintained</p>
                    </div>
                    <div class="bg-blue-800 p-3 rounded">
                        <p class="text-blue-200">Total Capacity</p>
                        <p class="text-xl font-bold text-blue-400">${finalCapacity}/s</p>
                        <p class="text-xs text-blue-300">✓ Traffic Handled</p>
                    </div>
                    <div class="bg-purple-800 p-3 rounded">
                        <p class="text-purple-200">Nodes Deployed</p>
                        <p class="text-xl font-bold text-purple-400">${nodesBuilt}</p>
                        <p class="text-xs text-purple-300">✓ Infrastructure</p>
                    </div>
                    <div class="bg-yellow-800 p-3 rounded">
                        <p class="text-yellow-200">Budget Remaining</p>
                        <p class="text-xl font-bold text-yellow-400">$${this.budget}</p>
                        <p class="text-xs text-yellow-300">✓ Cost Effective</p>
                    </div>
                </div>
                
                <div class="success-report bg-gray-800 p-4 rounded mb-4">
                    <h4 class="font-bold text-gray-200 mb-2">🌐 Infrastructure Scaling Report</h4>
                    <div class="text-left text-sm text-gray-300">
                        <p>✅ Viral traffic surge successfully handled</p>
                        <p>✅ Website maintained ${avgUptime.toFixed(1)}% uptime during crisis</p>
                        <p>✅ Infrastructure scaled to ${finalCapacity} requests/second capacity</p>
                        <p>✅ ${nodesBuilt} nodes deployed with optimal connections</p>
                        <p>✅ Revenue preserved - $0 lost to downtime</p>
                        <p>✅ Customer satisfaction maintained at maximum levels</p>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            this.game.roomCompleted(`Infrastructure crisis averted! Website scaling successful with ${avgUptime.toFixed(1)}% uptime maintained during viral traffic surge.`);
        }, 3000);
    }

    infrastructureCollapse() {
        clearInterval(this.gameTimer);
        clearInterval(this.visualTimer);
        this.isRunning = false;
        this.playSound('infrastructure_collapse');
        
        this.game.gameOver('Infrastructure collapsed! Website overwhelmed by traffic - Service unavailable, revenue lost, customers frustrated.');
    }

    abandonInfrastructure() {
        this.game.gameOver('Infrastructure abandoned! Website taken offline - Business operations halted.');
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `fixed top-20 right-4 p-3 rounded z-50 animate-pulse`;
        
        switch(type) {
            case 'success':
                messageDiv.classList.add('bg-green-800', 'text-green-200', 'border', 'border-green-500');
                break;
            case 'error':
                messageDiv.classList.add('bg-red-800', 'text-red-200', 'border', 'border-red-500');
                break;
            case 'info':
                messageDiv.classList.add('bg-blue-800', 'text-blue-200', 'border', 'border-blue-500');
                break;
        }
        
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    playSound(soundType) {
        // Placeholder for audio implementation
        console.log(`Playing sound: ${soundType}`);
        
        // Future implementation:
        // const audio = new Audio(this.data.audio_cues[soundType]);
        // audio.volume = 0.3;
        // audio.play().catch(e => console.log('Audio play failed:', e));
    }
}

// Register the class globally
window.Room2 = Room2;
