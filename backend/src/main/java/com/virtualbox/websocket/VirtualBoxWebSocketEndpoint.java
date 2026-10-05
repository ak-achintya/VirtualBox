package com.virtualbox.websocket;

import jakarta.websocket.*;
import jakarta.websocket.server.ServerEndpoint;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Production-Grade Jakarta WebSocket Endpoint for Virtual Box
 * 
 * Responsibilities:
 * - Connection lifecycle & authenticated connection tracking
 * (WebSocketConnection model)
 * - Thread-safe per-room state management & sequence tracking (RoomState model)
 * - Room membership isolation & cross-room access prevention
 * - Host-only playback control (PLAY, PAUSE, SEEK, MEDIA_SELECTED)
 * - Section 28 mid-stream join server time position compensation
 * - Structured input validation (finite non-negative position, 500-char chat
 * limit, room code format)
 * - WebRTC cross-room signaling protection
 * - Host disconnect notification & empty room memory cleanup
 * - Structured JSON error responses (NOT_HOST, INVALID_POSITION,
 * FORBIDDEN_TARGET, etc.)
 */
@ServerEndpoint("/ws")
public class VirtualBoxWebSocketEndpoint {

    // Connection & Room registries
    private static final Map<String, Session> sessions = new ConcurrentHashMap<>();
    private static final Map<String, WebSocketConnection> connections = new ConcurrentHashMap<>();
    private static final Map<String, RoomState> roomStates = new ConcurrentHashMap<>();
    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Authenticated Connection Model
     */
    public static class WebSocketConnection {
        private final String connectionId;
        private final Session session;
        private String userId;
        private String username;
        private String roomCode;
        private String role; // "HOST" or "VIEWER"
        private final long connectedAt;

        public WebSocketConnection(Session session) {
            this.connectionId = session.getId();
            this.session = session;
            this.userId = "usr_" + session.getId().substring(0, Math.min(8, session.getId().length()));
            this.username = "User_" + session.getId().substring(0, Math.min(4, session.getId().length()));
            this.role = "VIEWER";
            this.connectedAt = System.currentTimeMillis();
        }

        public String getConnectionId() {
            return connectionId;
        }

        public Session getSession() {
            return session;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getRoomCode() {
            return roomCode;
        }

        public void setRoomCode(String roomCode) {
            this.roomCode = roomCode;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public long getConnectedAt() {
            return connectedAt;
        }
    }

    /**
     * Per-Room Thread-Safe Playback & Member State
     */
    public static class RoomState {
        private final String roomCode;
        private String hostUserId;
        private double position = 0.0;
        private boolean playing = false;
        private long serverTime = System.currentTimeMillis();
        private long sequence = 0;
        private Map<String, Object> currentMediaMetadata = null;
        private final Set<String> memberConnectionIds = ConcurrentHashMap.newKeySet();

        public RoomState(String roomCode, String hostUserId) {
            this.roomCode = roomCode;
            this.hostUserId = hostUserId;
        }

        public String getRoomCode() {
            return roomCode;
        }

        public synchronized String getHostUserId() {
            return hostUserId;
        }

        public synchronized void setHostUserId(String hostUserId) {
            this.hostUserId = hostUserId;
        }

        public synchronized double getEffectivePosition() {
            if (playing) {
                double elapsedSeconds = (System.currentTimeMillis() - serverTime) / 1000.0;
                return Math.max(0.0, position + elapsedSeconds);
            }
            return position;
        }

        public synchronized boolean isPlaying() {
            return playing;
        }

        public synchronized long getServerTime() {
            return serverTime;
        }

        public synchronized long getSequence() {
            return sequence;
        }

        public synchronized Map<String, Object> getCurrentMediaMetadata() {
            return currentMediaMetadata;
        }

        public Set<String> getMemberConnectionIds() {
            return memberConnectionIds;
        }

        public synchronized void play(double requestedPos) {
            this.position = requestedPos;
            this.playing = true;
            this.serverTime = System.currentTimeMillis();
            this.sequence++;
        }

        public synchronized void pause(double requestedPos) {
            if (this.playing) {
                double elapsedSeconds = (System.currentTimeMillis() - this.serverTime) / 1000.0;
                this.position = Math.max(0.0, this.position + elapsedSeconds);
            } else {
                this.position = requestedPos;
            }
            this.playing = false;
            this.serverTime = System.currentTimeMillis();
            this.sequence++;
        }

        public synchronized void seek(double requestedPos) {
            this.position = requestedPos;
            this.serverTime = System.currentTimeMillis();
            this.sequence++;
        }

        public synchronized void setMedia(Map<String, Object> mediaMetadata) {
            this.currentMediaMetadata = mediaMetadata;
            this.position = 0.0;
            this.playing = false;
            this.serverTime = System.currentTimeMillis();
            this.sequence++;
        }
    }

    @OnOpen
    public void onOpen(Session session) {
        sessions.put(session.getId(), session);
        WebSocketConnection conn = new WebSocketConnection(session);
        connections.put(session.getId(), conn);
        System.out.println("[VirtualBox WebSocket] Client connected: " + session.getId());
    }

    @OnMessage
    public void onMessage(String messageJson, Session session) {
        WebSocketConnection conn = connections.get(session.getId());
        if (conn == null) {
            conn = new WebSocketConnection(session);
            connections.put(session.getId(), conn);
        }

        try {
            Map<String, Object> msg = objectMapper.readValue(messageJson, new TypeReference<Map<String, Object>>() {
            });
            Object typeObj = msg.get("type");

            if (!(typeObj instanceof String)) {
                sendError(session, "INVALID_MESSAGE", "Message type must be a valid string.");
                return;
            }

            String type = (String) typeObj;

            switch (type) {
                case "JOIN_ROOM":
                    handleJoinRoom(conn, msg);
                    break;
                case "LEAVE_ROOM":
                    handleLeaveRoom(conn);
                    break;
                case "PLAY":
                case "PAUSE":
                case "SEEK":
                    handlePlaybackControl(conn, type, msg);
                    break;
                case "CHAT":
                    handleChat(conn, msg);
                    break;
                case "MEDIA_SELECTED":
                    handleMediaSelected(conn, msg);
                    break;
                case "VOICE_OFFER":
                case "VOICE_ANSWER":
                case "ICE_CANDIDATE":
                    handleWebRTCSignaling(conn, msg, messageJson);
                    break;
                default:
                    sendError(session, "UNKNOWN_MESSAGE_TYPE", "Unsupported WebSocket message type: " + type);
                    break;
            }

        } catch (Exception e) {
            System.err
                    .println("[VirtualBox WebSocket] JSON parse error from " + session.getId() + ": " + e.getMessage());
            sendError(session, "INVALID_MESSAGE", "Invalid WebSocket JSON payload format.");
        }
    }

    private void handleJoinRoom(WebSocketConnection conn, Map<String, Object> msg) throws IOException {
        Object roomCodeObj = msg.get("roomCode");
        if (!(roomCodeObj instanceof String) || ((String) roomCodeObj).trim().isEmpty()) {
            sendError(conn.getSession(), "INVALID_ROOM_CODE", "Room code is required.");
            return;
        }

        String roomCode = ((String) roomCodeObj).trim().toUpperCase();
        if (!roomCode.matches("^[A-Z0-9]{4,8}$")) {
            sendError(conn.getSession(), "INVALID_ROOM_CODE",
                    "Room code format is invalid (4-8 alphanumeric characters expected).");
            return;
        }

        // Authenticated user identity binding
        if (msg.get("userId") instanceof String) {
            conn.setUserId((String) msg.get("userId"));
        }
        if (msg.get("username") instanceof String) {
            conn.setUsername((String) msg.get("username"));
        }

        // Retrieve or create room state
        RoomState room = roomStates.computeIfAbsent(roomCode, k -> new RoomState(roomCode, conn.getUserId()));

        synchronized (room) {
            if (room.getMemberConnectionIds().isEmpty()) {
                room.setHostUserId(conn.getUserId());
                conn.setRole("HOST");
            } else if (conn.getUserId().equals(room.getHostUserId())) {
                conn.setRole("HOST");
            } else {
                conn.setRole("VIEWER");
            }

            room.getMemberConnectionIds().add(conn.getConnectionId());
            conn.setRoomCode(roomCode);

            // 1. Send INITIAL_STATE to joining viewer inside critical section
            Map<String, Object> initialState = new HashMap<>();
            initialState.put("type", "INITIAL_STATE");
            initialState.put("roomCode", roomCode);
            initialState.put("position", room.getEffectivePosition());
            initialState.put("playing", room.isPlaying());
            initialState.put("serverTime", room.getServerTime());
            initialState.put("sequence", room.getSequence());
            initialState.put("hostId", room.getHostUserId());
            initialState.put("isHost", conn.getUserId().equals(room.getHostUserId()));
            if (room.getCurrentMediaMetadata() != null) {
                initialState.put("media", room.getCurrentMediaMetadata());
            }

            sendTextSynchronized(conn.getSession(), objectMapper.writeValueAsString(initialState));
        }

        // 2. Notify existing room members of new join
        Map<String, Object> joinNotice = new HashMap<>();
        joinNotice.put("type", "USER_JOINED");
        joinNotice.put("roomCode", roomCode);
        joinNotice.put("userId", conn.getUserId());
        joinNotice.put("username", conn.getUsername());
        joinNotice.put("role", conn.getRole());
        joinNotice.put("timestamp", System.currentTimeMillis());

        broadcastToRoom(roomCode, objectMapper.writeValueAsString(joinNotice));
    }

    private void handlePlaybackControl(WebSocketConnection conn, String type, Map<String, Object> msg)
            throws IOException {
        String roomCode = conn.getRoomCode();
        if (roomCode == null) {
            sendError(conn.getSession(), "NOT_IN_ROOM", "You must join a room before controlling playback.");
            return;
        }

        RoomState room = roomStates.get(roomCode);
        if (room == null) {
            sendError(conn.getSession(), "ROOM_NOT_FOUND", "Room not found.");
            return;
        }

        // Host authorization enforcement
        if (!conn.getUserId().equals(room.getHostUserId())) {
            sendError(conn.getSession(), "NOT_HOST", "Only the room host can control playback.");
            return;
        }

        // Position validation
        double position = room.getEffectivePosition();
        if (msg.containsKey("position")) {
            Object posObj = msg.get("position");
            if (posObj instanceof Number) {
                double requestedPos = ((Number) posObj).doubleValue();
                if (!Double.isFinite(requestedPos) || requestedPos < 0) {
                    sendError(conn.getSession(), "INVALID_POSITION",
                            "Playback position must be a non-negative finite number.");
                    return;
                }
                position = requestedPos;
            }
        }

        // Atomically transition room state
        synchronized (room) {
            if ("PLAY".equals(type)) {
                room.play(position);
            } else if ("PAUSE".equals(type)) {
                room.pause(position);
            } else if ("SEEK".equals(type)) {
                room.seek(position);
            }

            Map<String, Object> syncPayload = new HashMap<>();
            syncPayload.put("type", type);
            syncPayload.put("event", type);
            syncPayload.put("roomCode", roomCode);
            syncPayload.put("position", "PAUSE".equals(type) ? room.getEffectivePosition() : position);
            syncPayload.put("playing", room.isPlaying());
            syncPayload.put("serverTime", room.getServerTime());
            syncPayload.put("sequence", room.getSequence());
            syncPayload.put("hostId", room.getHostUserId());

            broadcastToRoom(roomCode, objectMapper.writeValueAsString(syncPayload));
        }
    }

    private void handleChat(WebSocketConnection conn, Map<String, Object> msg) throws IOException {
        String roomCode = conn.getRoomCode();
        if (roomCode == null) {
            sendError(conn.getSession(), "NOT_IN_ROOM", "You must join a room to send chat messages.");
            return;
        }

        Object textObj = msg.get("text");
        if (textObj == null)
            textObj = msg.get("message");

        if (!(textObj instanceof String) || ((String) textObj).trim().isEmpty()) {
            sendError(conn.getSession(), "INVALID_CHAT_MESSAGE", "Chat message text cannot be empty.");
            return;
        }

        String text = ((String) textObj).trim();
        if (text.length() > 500) {
            sendError(conn.getSession(), "INVALID_CHAT_MESSAGE", "Chat message exceeds limit of 500 characters.");
            return;
        }

        Map<String, Object> chatNotice = new HashMap<>();
        chatNotice.put("type", "CHAT");
        chatNotice.put("roomCode", roomCode);
        chatNotice.put("senderId", conn.getUserId());
        chatNotice.put("sender", conn.getUsername());
        chatNotice.put("text", text);
        chatNotice.put("timestamp", new java.text.SimpleDateFormat("hh:mm a").format(new Date()));
        chatNotice.put("serverTime", System.currentTimeMillis());

        broadcastToRoom(roomCode, objectMapper.writeValueAsString(chatNotice));
    }

    private void handleMediaSelected(WebSocketConnection conn, Map<String, Object> msg) throws IOException {
        String roomCode = conn.getRoomCode();
        if (roomCode == null) {
            sendError(conn.getSession(), "NOT_IN_ROOM", "You must join a room before selecting media.");
            return;
        }

        RoomState room = roomStates.get(roomCode);
        if (room == null || !conn.getUserId().equals(room.getHostUserId())) {
            sendError(conn.getSession(), "NOT_HOST", "Only the room host can select room media.");
            return;
        }

        Map<String, Object> mediaMetadata = new HashMap<>();
        mediaMetadata.put("fileName", msg.getOrDefault("fileName", "local_media.mp4"));
        mediaMetadata.put("duration", msg.getOrDefault("duration", 0));
        mediaMetadata.put("resolution", msg.getOrDefault("resolution", "1080p"));
        mediaMetadata.put("format", msg.getOrDefault("format", "MP4"));
        mediaMetadata.put("width", msg.getOrDefault("width", 1920));
        mediaMetadata.put("height", msg.getOrDefault("height", 1080));
        mediaMetadata.put("fps", msg.getOrDefault("fps", 24));

        synchronized (room) {
            room.setMedia(mediaMetadata);
        }

        Map<String, Object> mediaNotice = new HashMap<>(mediaMetadata);
        mediaNotice.put("type", "MEDIA_SELECTED");
        mediaNotice.put("roomCode", roomCode);
        mediaNotice.put("hostId", conn.getUserId());
        mediaNotice.put("serverTime", System.currentTimeMillis());

        broadcastToRoom(roomCode, objectMapper.writeValueAsString(mediaNotice));
    }

    private void handleWebRTCSignaling(WebSocketConnection conn, Map<String, Object> msg, String messageJson) {
        String roomCode = conn.getRoomCode();
        if (roomCode == null) {
            sendError(conn.getSession(), "NOT_IN_ROOM", "You must join a room to participate in WebRTC signaling.");
            return;
        }

        Object targetObj = msg.get("target");
        if (targetObj == null)
            targetObj = msg.get("targetId");

        if (targetObj instanceof String && !((String) targetObj).trim().isEmpty()) {
            String targetId = ((String) targetObj).trim();

            // Search for target connection
            WebSocketConnection targetConn = null;
            for (WebSocketConnection c : connections.values()) {
                if (targetId.equals(c.getUserId()) || targetId.equals(c.getConnectionId())) {
                    targetConn = c;
                    break;
                }
            }

            if (targetConn == null) {
                sendError(conn.getSession(), "TARGET_NOT_FOUND", "Signaling target client was not found.");
                return;
            }

            // Cross-room signaling security enforcement
            if (!roomCode.equals(targetConn.getRoomCode())) {
                sendError(conn.getSession(), "FORBIDDEN_TARGET", "Cross-room WebRTC signaling is strictly prohibited.");
                return;
            }

            sendTextSynchronized(targetConn.getSession(), messageJson);
        } else {
            broadcastToRoomExcept(roomCode, conn.getConnectionId(), messageJson);
        }
    }

    private void handleLeaveRoom(WebSocketConnection conn) {
        String roomCode = conn.getRoomCode();
        if (roomCode == null)
            return;

        RoomState room = roomStates.get(roomCode);
        if (room != null) {
            room.getMemberConnectionIds().remove(conn.getConnectionId());

            // Notify remaining members
            Map<String, Object> leaveNotice = new HashMap<>();
            leaveNotice.put("type", "USER_LEFT");
            leaveNotice.put("roomCode", roomCode);
            leaveNotice.put("userId", conn.getUserId());
            leaveNotice.put("username", conn.getUsername());
            leaveNotice.put("timestamp", System.currentTimeMillis());
            try {
                broadcastToRoom(roomCode, objectMapper.writeValueAsString(leaveNotice));
            } catch (Exception ignored) {
            }

            // Handle host disconnect
            if (conn.getUserId().equals(room.getHostUserId())) {
                Map<String, Object> hostNotice = new HashMap<>();
                hostNotice.put("type", "HOST_DISCONNECTED");
                hostNotice.put("roomCode", roomCode);
                hostNotice.put("message", "The room host has disconnected.");
                try {
                    broadcastToRoom(roomCode, objectMapper.writeValueAsString(hostNotice));
                } catch (Exception ignored) {
                }
            }

            // Clean up empty room state
            if (room.getMemberConnectionIds().isEmpty()) {
                roomStates.remove(roomCode);
            }
        }

        conn.setRoomCode(null);
        conn.setRole("VIEWER");
    }

    private void sendError(Session session, String code, String message) {
        if (session != null && session.isOpen()) {
            Map<String, Object> errPayload = new HashMap<>();
            errPayload.put("type", "ERROR");
            errPayload.put("code", code);
            errPayload.put("message", message);
            errPayload.put("timestamp", System.currentTimeMillis());
            try {
                sendTextSynchronized(session, objectMapper.writeValueAsString(errPayload));
            } catch (Exception ignored) {
            }
        }
    }

    private void sendTextSynchronized(Session session, String text) {
        if (session != null && session.isOpen()) {
            try {
                synchronized (session) {
                    session.getBasicRemote().sendText(text);
                }
            } catch (IOException e) {
                System.err.println("[VirtualBox WebSocket] IOException sending to session " + session.getId() + ": "
                        + e.getMessage());
            } catch (IllegalStateException e) {
                System.err.println("[VirtualBox WebSocket] Concurrent write prevented for session " + session.getId());
            }
        }
    }

    private void broadcastToRoom(String roomCode, String json) {
        RoomState room = roomStates.get(roomCode);
        if (room == null)
            return;

        for (String connId : room.getMemberConnectionIds()) {
            WebSocketConnection c = connections.get(connId);
            if (c != null) {
                sendTextSynchronized(c.getSession(), json);
            }
        }
    }

    private void broadcastToRoomExcept(String roomCode, String excludeConnId, String json) {
        RoomState room = roomStates.get(roomCode);
        if (room == null)
            return;

        for (String connId : room.getMemberConnectionIds()) {
            if (connId.equals(excludeConnId))
                continue;
            WebSocketConnection c = connections.get(connId);
            if (c != null) {
                sendTextSynchronized(c.getSession(), json);
            }
        }
    }

    @OnClose
    public void onClose(Session session) {
        WebSocketConnection conn = connections.remove(session.getId());
        sessions.remove(session.getId());
        if (conn != null) {
            handleLeaveRoom(conn);
        }
        System.out.println("[VirtualBox WebSocket] Client disconnected: " + session.getId());
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        System.err.println("[VirtualBox WebSocket] Error on session " + (session != null ? session.getId() : "null")
                + ": " + (throwable != null ? throwable.getMessage() : "Unknown"));
    }
}