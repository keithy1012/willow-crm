// backend/websocket/socketServer.js
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const messageHandler = require('./handlers/messageHandler');

class SocketServer {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // userId -> ws connection
    this.userSockets = new Map(); // userId -> Set of connections (for multiple devices)
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection');
      
      // Setup ping-pong for connection health
      ws.isAlive = true;
      ws.on('pong', () => { ws.isAlive = true; });
      
      // Handle incoming messages
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error handling message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      // Handle disconnect
      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    // Heartbeat interval to detect broken connections
    this.startHeartbeat();
  }

  async handleMessage(ws, message) {
    switch (message.type) {
      case 'auth':
        await this.handleAuth(ws, message.token);
        break;
        
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
        
      case 'message':
        await messageHandler.handleNewMessage(this, ws, message.data);
        break;
        
      case 'typing':
        await messageHandler.handleTyping(this, ws, message.data);
        break;
        
      case 'read':
        await messageHandler.handleMarkAsRead(this, ws, message.data);
        break;
        
      case 'get-online-users':
        this.sendOnlineUsers(ws);
        break;
        
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  async handleAuth(ws, token) {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Store user info on the connection
      ws.userId = decoded.userId;
      ws.userRole = decoded.role;
      ws.userName = decoded.name;
      
      // Add to clients map
      this.clients.set(ws.userId, ws);
      
      // Track multiple connections per user
      if (!this.userSockets.has(ws.userId)) {
        this.userSockets.set(ws.userId, new Set());
      }
      this.userSockets.get(ws.userId).add(ws);
      
      // Send success message
      ws.send(JSON.stringify({
        type: 'auth-success',
        data: {
          userId: ws.userId,
          userName: ws.userName
        }
      }));
      
      // Notify others that user is online
      this.broadcastUserStatus(ws.userId, 'online');
      
      console.log(`User ${ws.userId} authenticated`);
      
    } catch (error) {
      console.error('Auth failed:', error);
      ws.send(JSON.stringify({
        type: 'auth-error',
        error: 'Authentication failed'
      }));
      ws.close(1008, 'Invalid token');
    }
  }

  handleDisconnect(ws) {
    if (!ws.userId) return;
    
    console.log(`User ${ws.userId} disconnected`);
    
    // Remove from clients map
    this.clients.delete(ws.userId);
    
    // Remove from user sockets
    const userSockets = this.userSockets.get(ws.userId);
    if (userSockets) {
      userSockets.delete(ws);
      if (userSockets.size === 0) {
        this.userSockets.delete(ws.userId);
        // User is completely offline
        this.broadcastUserStatus(ws.userId, 'offline');
      }
    }
  }

  // Send message to specific user
  sendToUser(userId, message) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  // Send message to multiple users
  sendToUsers(userIds, message) {
    const messageStr = JSON.stringify(message);
    userIds.forEach(userId => {
      const client = this.clients.get(userId);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  // Broadcast to all connected users except sender
  broadcast(message, excludeUserId = null) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach((client, userId) => {
      if (userId !== excludeUserId && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  // Broadcast user status change
  broadcastUserStatus(userId, status) {
    this.broadcast({
      type: 'user-status',
      data: {
        userId,
        status
      }
    }, userId);
  }

  // Send list of online users
  sendOnlineUsers(ws) {
    const onlineUsers = Array.from(this.clients.keys());
    ws.send(JSON.stringify({
      type: 'online-users',
      data: onlineUsers
    }));
  }

  // Send error message
  sendError(ws, error) {
    ws.send(JSON.stringify({
      type: 'error',
      error
    }));
  }

  // Heartbeat to detect broken connections
  startHeartbeat() {
    setInterval(() => {
      this.wss.clients.forEach(ws => {
        if (ws.isAlive === false) {
          this.handleDisconnect(ws);
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds
  }

  // Get online status for a user
  isUserOnline(userId) {
    return this.clients.has(userId);
  }

  // Get all online users
  getOnlineUsers() {
    return Array.from(this.clients.keys());
  }
}

// Create singleton instance
const socketServer = new SocketServer();

module.exports = socketServer;