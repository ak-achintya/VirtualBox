import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { GENRES } from '../data/mockData';
import { inspectLocalMediaFile } from '../services/mediaUtils';
import { getCurrentUser, loginUser, registerUser, logoutUser } from '../services/authService';
import { wsService } from '../services/websocketService';
import { webrtcEngine } from '../services/webrtcService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeView, setActiveView] = useState('landing'); // 'landing', 'home', 'create_room', 'join_room', 'watch_room', 'movie_select', 'watch_history', 'profile'
  
  // Real User Auth State
  const [userProfile, setUserProfile] = useState(getCurrentUser());
  const [authError, setAuthError] = useState(null);

  // Real Selected Media File (NO FAKE MOVIES)
  const [selectedLocalMedia, setSelectedLocalMedia] = useState(null);

  // Room State
  const [currentRoom, setCurrentRoom] = useState(null);
  const [genreTheme, setGenreThemeState] = useState('scifi');
  const [isAutoTheme, setIsAutoTheme] = useState(true);
  const [isHost, setIsHost] = useState(true);

  // Saved Sessions & History (Real File Data)
  const [savedSessions, setSavedSessions] = useState(() => {
    try {
      const raw = localStorage.getItem('virtualbox_saved_sessions');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const [watchHistory, setWatchHistory] = useState(() => {
    try {
      const raw = localStorage.getItem('virtualbox_watch_history');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  // Voice Chat State & Real Speaking Meter
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micError, setMicError] = useState(null);

  // Modals & Toast State
  const [showContinueWatchingModal, setShowContinueWatchingModal] = useState(false);
  const [pendingSession, setPendingSession] = useState(null);
  const [showRoomSettingsModal, setShowRoomSettingsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Remote Event Guard to prevent infinite playback loops
  const isRemoteCommand = useRef(false);

  // Dynamic Theme CSS attribute synchronization
  useEffect(() => {
    document.documentElement.setAttribute('data-genre-theme', genreTheme);
  }, [genreTheme]);

  // Toast Helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Auth Operations
  const handleLogin = async (identifier, password) => {
    try {
      setAuthError(null);
      const user = await loginUser(identifier, password);
      setUserProfile(user);
      showToast(`Welcome back, ${user.username}!`);
      setActiveView('home');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleRegister = async (username, email, password) => {
    try {
      setAuthError(null);
      const user = await registerUser(username, email, password);
      setUserProfile(user);
      showToast(`Account created for ${user.username}!`);
      setActiveView('home');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUserProfile({ id: 'guest', username: 'Guest', avatar: '👤' });
    showToast('Logged out');
    setActiveView('landing');
  };

  // Real Local File Selection Handler
  const handleSelectLocalFile = async (file) => {
    if (!file) return null;
    try {
      const mediaInfo = await inspectLocalMediaFile(file);
      setSelectedLocalMedia(mediaInfo);
      showToast(`Selected: ${mediaInfo.fileName} (${mediaInfo.resolution})`);
      return mediaInfo;
    } catch (err) {
      showToast(err.message || 'Failed to read video file.');
      return null;
    }
  };

  // Change Genre Theme
  const setGenreTheme = (themeId) => {
    if (themeId === 'auto') {
      setIsAutoTheme(true);
      showToast('Theme set to Auto (Genre Synced)');
    } else {
      setIsAutoTheme(false);
      setGenreThemeState(themeId);
      const themeObj = GENRES.find(g => g.id === themeId);
      showToast(`Atmosphere set to ${themeObj?.name || themeId}`);
    }
  };

  // Real Room Creation
  const createRoom = (details) => {
    if (!selectedLocalMedia) {
      showToast('Please select a local video file before creating a room.');
      return null;
    }

    const realCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRoom = {
      code: realCode,
      name: details.name || `${userProfile.username}'s Virtual Cinema`,
      media: selectedLocalMedia,
      hostId: userProfile.id,
      hostName: userProfile.username,
      hostAvatar: userProfile.avatar || '👑',
      privacy: details.privacy || 'Private',
      theme: details.theme || genreTheme,
      autoTheme: details.autoTheme ?? true,
      isSynced: true,
      syncMessage: 'SYNCED (Host Control)',
      sequence: 0,
      voiceEnabled: details.voiceEnabled ?? true,
      chatEnabled: details.chatEnabled ?? true,
      participants: [
        {
          id: userProfile.id,
          name: userProfile.username,
          role: 'HOST',
          isHost: true,
          isSpeaking: false,
          isMuted: userProfile.isMicMuted || false,
          avatar: userProfile.avatar || '👑',
          color: 'from-amber-400 to-yellow-600'
        }
      ],
      chat: [
        {
          id: `msg_${Date.now()}`,
          sender: 'System',
          text: `Virtual Box Room #${realCode} initialized by Host ${userProfile.username}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true
        }
      ]
    };

    setCurrentRoom(newRoom);
    setIsHost(true);

    // Register Session in History & Saved
    saveWatchSession(selectedLocalMedia, 0, newRoom.name, realCode);

    return newRoom;
  };

  // Join Room
  const joinRoom = (code) => {
    if (!code || code.trim().length < 3) {
      showToast('Invalid room code entered');
      return false;
    }

    const cleanCode = code.trim().toUpperCase();
    const joinedRoom = {
      code: cleanCode,
      name: `Watch Party #${cleanCode}`,
      media: selectedLocalMedia, // will populate when host sends MEDIA_SELECTED
      hostId: 'host_peer',
      hostName: 'Host',
      hostAvatar: '👑',
      privacy: 'Private',
      theme: genreTheme,
      autoTheme: true,
      isSynced: true,
      syncMessage: 'SYNCED (Host Control)',
      sequence: 0,
      voiceEnabled: true,
      chatEnabled: true,
      participants: [
        { id: userProfile.id, name: userProfile.username, role: 'VIEWER', isHost: false, isSpeaking: false, isMuted: false, avatar: userProfile.avatar || '👤', color: 'from-purple-500 to-pink-500' }
      ],
      chat: [
        { id: `msg_${Date.now()}`, sender: 'System', text: `${userProfile.username} joined the room.`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isSystem: true }
      ]
    };

    setCurrentRoom(joinedRoom);
    setIsHost(false);
    showToast(`Joined Room #${cleanCode}`);
    setActiveView('watch_room');
    return true;
  };

  // Real Chat Message
  const sendMessage = (text) => {
    if (!text || !text.trim() || !currentRoom) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: userProfile.username,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: false
    };

    setCurrentRoom(prev => ({
      ...prev,
      chat: [...prev.chat, newMsg]
    }));

    wsService.sendChatMessage(userProfile.username, text.trim());
  };

  // Real Voice Chat & Mic Access
  const toggleMic = async () => {
    try {
      setMicError(null);
      if (!webrtcEngine.localMicStream) {
        await webrtcEngine.startVoiceChat(
          (speaking) => setIsSpeaking(speaking),
          (errMsg) => setMicError(errMsg)
        );
        showToast('Microphone connected & active');
      } else {
        const isMuted = webrtcEngine.toggleMicrophoneMute();
        showToast(isMuted ? 'Microphone muted' : 'Microphone unmuted');
      }
    } catch (err) {
      setMicError('Microphone permission is required for voice chat.');
      showToast('Microphone permission is required for voice chat.');
    }
  };

  // Save Watch Session & History to LocalStorage
  const saveWatchSession = (media, positionSeconds, roomName, roomCode) => {
    if (!media) return;

    const newSession = {
      id: `session_${Date.now()}`,
      fileName: media.fileName,
      fileSize: media.fileSize,
      resolution: media.resolution,
      durationSeconds: media.durationSeconds,
      formattedDuration: media.formattedDuration,
      lastPositionSeconds: positionSeconds,
      lastPositionFormatted: new Date(positionSeconds * 1000).toISOString().substr(11, 8),
      lastWatchedAt: new Date().toLocaleDateString(),
      roomName: roomName || 'Virtual Cinema',
      roomCode: roomCode || 'A7K29P'
    };

    setSavedSessions(prev => {
      const filtered = prev.filter(s => s.fileName !== media.fileName);
      const updated = [newSession, ...filtered];
      localStorage.setItem('virtualbox_saved_sessions', JSON.stringify(updated));
      return updated;
    });

    setWatchHistory(prev => {
      const filtered = prev.filter(h => h.fileName !== media.fileName);
      const updated = [newSession, ...filtered];
      localStorage.setItem('virtualbox_watch_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Saved Session Resume Prompt
  const promptContinueSession = (session) => {
    setPendingSession(session);
    setShowContinueWatchingModal(true);
  };

  const confirmContinueSession = async (file) => {
    if (file && pendingSession) {
      const inspected = await handleSelectLocalFile(file);
      if (inspected) {
        setActiveView('watch_room');
        showToast(`Resumed ${inspected.fileName} at ${pendingSession.lastPositionFormatted}`);
      }
    }
    setShowContinueWatchingModal(false);
    setPendingSession(null);
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        userProfile,
        setUserProfile,
        handleLogin,
        handleRegister,
        handleLogout,
        authError,
        selectedLocalMedia,
        setSelectedLocalMedia,
        handleSelectLocalFile,
        currentRoom,
        setCurrentRoom,
        genreTheme,
        setGenreTheme,
        isAutoTheme,
        setIsAutoTheme,
        isHost,
        setIsHost,
        savedSessions,
        watchHistory,
        showContinueWatchingModal,
        setShowContinueWatchingModal,
        pendingSession,
        promptContinueSession,
        confirmContinueSession,
        showRoomSettingsModal,
        setShowRoomSettingsModal,
        showShareModal,
        setShowShareModal,
        toastMessage,
        showToast,
        createRoom,
        joinRoom,
        sendMessage,
        toggleMic,
        isSpeaking,
        micError,
        isRemoteCommand,
        saveWatchSession
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
