class WebSocketService {
    constructor() {
        this.socket = null;
        this.listeners = {};
        this.reconnectInterval = null;
    }
    
    connect(url) {
        const wsUrl = url.replace('http', 'ws') + '/ws/monitor';
        this.socket = new WebSocket(wsUrl);
        
        this.socket.onopen = () => {
            console.log('WebSocket connected');
            if (this.reconnectInterval) {
                clearInterval(this.reconnectInterval);
                this.reconnectInterval = null;
            }
        };
        
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const eventMap = {
                'new_block': 'block',
                'new_transaction': 'transaction',
                'badge_minted': 'badge',
                'stats_update': 'stats'
            };
            const mappedEvent = eventMap[message.type] || message.type;
            this.emit(mappedEvent, message.data);
        };
        
        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            this.reconnect(url);
        };
        
        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
    
    reconnect(url) {
        if (!this.reconnectInterval) {
            this.reconnectInterval = setInterval(() => {
                console.log('Attempting to reconnect...');
                this.connect(url);
            }, 5000);
        }
    }
    
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }
    
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
    
    disconnect() {
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
        }
        if (this.socket) {
            this.socket.close();
        }
    }
}

export default new WebSocketService();
