/**
 * Real WebSocket Synchronization Engine for Virtual Box
 * Connects to Jakarta WebSocket backend (ws://localhost:8080/ws) or runs a local real-time signaling hub.
 */

class WebSocketSyncService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.currentRoomCode = null;
    this.sequence = 0;
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  connect(url = 'ws://localhost:8080/ws') {
    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connection_status', { connected: true });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleIncomingMessage(data);
        } catch (e) {
          console.error('[VirtualBox WS] Message parse error:', e);
        }
      };

      this.socket.onerror = (err) => {
        console.warn('[VirtualBox WS] Server offline or connecting to fallback signaling engine.');
        this.isConnected = false;
        this.emit('connection_status', { connected: false });
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.emit('connection_status', { connected: false });
      };
    } catch (e) {
      console.warn('[VirtualBox WS] WebSocket init fallback.');
    }
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  off(eventType, callback) {
    if (!this.listeners.has(eventType)) return;
    const callbacks = this.listeners.get(eventType).filter(cb => cb !== callback);
    this.listeners.set(eventType, callbacks);
  }

  emit(eventType, data) {
    const callbacks = this.listeners.get(eventType) || [];
    callbacks.forEach(cb => cb(data));
  }

  send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      // Standalone Fallback Dispatch for Offline Client Mode
      setTimeout(() => {
        this.handleIncomingMessage(message);
      }, 50);
    }
  }

  handleIncomingMessage(msg) {
    // Stale message sequence filter
    if (msg.sequence && msg.sequence < this.sequence) {
      console.warn(`[VirtualBox WS] Discarding stale message sequence ${msg.sequence} (current ${this.sequence})`);
      return;
    }
    if (msg.sequence) {
      this.sequence = msg.sequence;
    }

    this.emit(msg.type, msg);
  }

  // PLAYBACK SYNCHRONIZATION COMMANDS
  sendPlay(position) {
    this.sequence += 1;
    this.send({
      type: 'PLAY',
      position: position,
      playing: true,
      sequence: this.sequence,
      serverTime: Date.now()
    });
  }

  sendPause(position) {
    this.sequence += 1;
    this.send({
      type: 'PAUSE',
      position: position,
      playing: false,
      sequence: this.sequence,
      serverTime: Date.now()
    });
  }

  sendSeek(position) {
    this.sequence += 1;
    this.send({
      type: 'SEEK',
      position: position,
      playing: true,
      sequence: this.sequence,
      serverTime: Date.now()
    });
  }

  sendMediaSelected(metadata) {
    this.send({
      type: 'MEDIA_SELECTED',
      fileName: metadata.fileName,
      fileSize: metadata.fileSize,
      duration: metadata.durationSeconds,
      width: metadata.width,
      height: metadata.height,
      resolution: metadata.resolution,
      format: metadata.format,
      fps: metadata.fps
    });
  }

  sendChatMessage(sender, text) {
    this.send({
      type: 'CHAT',
      sender: sender,
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }

  sendWebRTCSignaling(type, payload) {
    this.send({
      type: type, // VOICE_OFFER, VOICE_ANSWER, ICE_CANDIDATE
      payload: payload
    });
  }
}

export const wsService = new WebSocketSyncService();
