import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wsService } from '../../services/websocketService';
import { webrtcEngine } from '../../services/webrtcService';
import { formatTimeDisplay } from '../../services/mediaUtils';
import { GENRES } from '../../data/mockData';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Mic, 
  MicOff, 
  MessageSquare, 
  Users, 
  Settings, 
  Share2, 
  LogOut, 
  Crown, 
  Radio, 
  Send, 
  Sparkles, 
  Palette, 
  Sliders, 
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Upload,
  HardDrive,
  RefreshCw,
  VideoOff
} from 'lucide-react';

export const WatchRoomView = () => {
  const { 
    currentRoom, 
    selectedLocalMedia, 
    handleSelectLocalFile, 
    isHost, 
    userProfile, 
    sendMessage, 
    toggleMic, 
    isSpeaking, 
    micError, 
    genreTheme, 
    setGenreTheme,
    setShowRoomSettingsModal,
    setShowShareModal,
    setActiveView,
    showToast,
    isRemoteCommand,
    saveWatchSession
  } = useApp();

  // Active side panel tab: 'chat', 'people', 'voice'
  const [activeSideTab, setActiveSideTab] = useState('chat');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

  // Video Player & Playback Synchronization State
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(selectedLocalMedia ? selectedLocalMedia.durationSeconds : 0);
  const [chatInput, setChatInput] = useState('');
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // Handle Local Video Source Setup
  useEffect(() => {
    if (selectedLocalMedia && videoRef.current) {
      videoRef.current.src = selectedLocalMedia.objectUrl;
      setDuration(selectedLocalMedia.durationSeconds || 0);

      // Attempt Play
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        }).catch(err => {
          console.warn('[VirtualBox Player] Autoplay policy blocked audio/video play:', err);
          setIsPlaying(false);
          setAutoplayBlocked(true);
        });
      }
    }
  }, [selectedLocalMedia]);

  // WebSocket Playback Listener for Sync Commands (Section 22-26)
  useEffect(() => {
    const handleRemoteSync = (msg) => {
      if (!videoRef.current) return;
      isRemoteCommand.current = true;

      if (msg.type === 'PLAY') {
        if (Math.abs(videoRef.current.currentTime - msg.position) > 1.2) {
          videoRef.current.currentTime = msg.position;
        }
        videoRef.current.play().then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        }).catch(() => setAutoplayBlocked(true));
      } else if (msg.type === 'PAUSE') {
        videoRef.current.currentTime = msg.position;
        videoRef.current.pause();
        setIsPlaying(false);
      } else if (msg.type === 'SEEK') {
        videoRef.current.currentTime = msg.position;
        setCurrentTime(msg.position);
      } else if (msg.type === 'INITIAL_STATE') {
        // Mid-stream join synchronization (Section 23)
        if (msg.position) {
          videoRef.current.currentTime = msg.position;
          setCurrentTime(msg.position);
        }
        if (msg.playing) {
          videoRef.current.play().catch(() => setAutoplayBlocked(true));
          setIsPlaying(true);
        }
      }

      setTimeout(() => {
        isRemoteCommand.current = false;
      }, 300);
    };

    wsService.on('PLAY', handleRemoteSync);
    wsService.on('PAUSE', handleRemoteSync);
    wsService.on('SEEK', handleRemoteSync);
    wsService.on('INITIAL_STATE', handleRemoteSync);

    return () => {
      wsService.off('PLAY', handleRemoteSync);
      wsService.off('PAUSE', handleRemoteSync);
      wsService.off('SEEK', handleRemoteSync);
      wsService.off('INITIAL_STATE', handleRemoteSync);
    };
  }, []);

  // Sync Play / Pause Toggle
  const handlePlayPauseToggle = () => {
    if (!isHost) {
      showToast('Only the HOST can control synchronized playback.');
      return;
    }

    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      wsService.sendPause(videoRef.current.currentTime);
      showToast(`Host paused playback at ${formatTimeDisplay(videoRef.current.currentTime)}`);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setAutoplayBlocked(false);
        wsService.sendPlay(videoRef.current.currentTime);
        showToast('Host resumed synchronized playback');
      }).catch(err => {
        setAutoplayBlocked(true);
        showToast('Click Play to start the synchronized video.');
      });
    }

    // Save Watch Session Progress
    if (selectedLocalMedia && currentRoom) {
      saveWatchSession(selectedLocalMedia, videoRef.current.currentTime, currentRoom.name, currentRoom.code);
    }
  };

  // Sync Seek Slider
  const handleSeekChange = (e) => {
    if (!isHost) {
      showToast('Only the HOST can seek playback position.');
      return;
    }
    const newPos = parseFloat(e.target.value);
    setCurrentTime(newPos);
    if (videoRef.current) {
      videoRef.current.currentTime = newPos;
      wsService.sendSeek(newPos);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendMessage(chatInput);
      setChatInput('');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleSelectLocalFile(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C0E] text-white overflow-hidden">
      
      {/* ------------------------------------------------ */}
      {/* TOP NAVIGATION BAR */}
      {/* ------------------------------------------------ */}
      <div className="w-full px-4 py-3 bg-[#0B0C0E] border-b border-[#262933] flex items-center justify-between z-30 shrink-0">
        
        {/* LEFT: LOGO, ROOM NAME, CODE */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveView('home')}
            className="p-2 rounded-lg bg-[#1A1C22] hover:bg-[#242731] border border-[#262933] text-gray-300"
            title="Back to Home"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D00]" />
            <div>
              <h2 className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-xs">
                {currentRoom ? currentRoom.name : 'Virtual Cinema'}
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                <span>Room Code:</span>
                <button
                  onClick={() => {
                    if (currentRoom) {
                      navigator.clipboard.writeText(currentRoom.code);
                      showToast('Room code copied!');
                    }
                  }}
                  className="px-2 py-0.5 rounded bg-[#FF4D00]/20 text-[#FF4D00] font-bold border border-[#FF4D00]/30 hover:bg-[#FF4D00] hover:text-white transition-all"
                >
                  #{currentRoom ? currentRoom.code : 'A7K29P'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: SYNC STATUS & ATMOSPHERE */}
        <div className="hidden md:flex items-center gap-3">
          <div className="px-3 py-1 rounded bg-[#1A1C22] border border-[#262933] text-emerald-400 text-xs font-mono font-bold flex items-center gap-2">
            <Radio className="w-3.5 h-3.5" />
            <span>SYNCED 4K (Host Control)</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#1A1C22] border border-[#262933] text-xs text-gray-300">
            <Palette className="w-3.5 h-3.5 text-[#FF4D00]" />
            <span className="capitalize font-semibold">{genreTheme} Atmosphere</span>
          </div>
        </div>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveSideTab('people');
              setIsSidePanelOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#1A1C22] border border-[#262933] text-xs font-bold text-gray-200 hover:bg-[#242731] flex items-center gap-1.5"
          >
            <Users className="w-4 h-4 text-[#FF4D00]" />
            <span>{currentRoom ? currentRoom.participants.length : 1}</span>
          </button>

          <button
            onClick={toggleMic}
            className={`p-2 rounded-lg border transition-all ${
              userProfile.isMicMuted
                ? 'text-rose-400 bg-rose-950/30 border-rose-800/40'
                : 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40'
            }`}
            title={userProfile.isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {userProfile.isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="p-2 rounded-xl glass-pill text-purple-300 border-purple-500/30 hover:bg-purple-500/20 transition-all"
            title="Invite Friends"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowRoomSettingsModal(true)}
            className="p-2 rounded-xl glass-pill text-slate-300 hover:text-white border-white/10 transition-all"
            title="Room Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              showToast('Left Watch Room');
              setActiveView('home');
            }}
            className="px-3.5 py-1.5 rounded-xl glass-pill text-xs font-bold text-rose-400 bg-rose-500/10 border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>

      </div>

      {/* ------------------------------------------------ */}
      {/* MAIN WATCH ROOM BODY (REAL HTML5 VIDEO + SIDE PANEL) */}
      {/* ------------------------------------------------ */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        
        {/* LEFT COLUMN: CINEMATIC REAL HTML5 VIDEO PLAYER */}
        <div className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* AUTOPLAY RESTRICTION OVERLAY WARNING (SECTION 41) */}
          {autoplayBlocked && (
            <div className="absolute top-8 z-40 px-6 py-3 rounded-2xl glass-panel border-amber-400/50 bg-amber-950/80 text-amber-200 text-xs font-bold shadow-2xl flex items-center gap-3 animate-bounce">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Click Play to start the synchronized video.</span>
              <button
                onClick={handlePlayPauseToggle}
                className="px-3 py-1 rounded-xl bg-amber-400 text-black font-extrabold text-[11px]"
              >
                Start Playback
              </button>
            </div>
          )}

          {/* MAIN FROSTED LIQUID GLASS PLAYER FRAME CONTAINER */}
          <div className="relative w-full max-w-5xl rounded-3xl glass-panel p-2 md:p-3 border-white/20 shadow-2xl overflow-hidden group flex flex-col justify-between">
            
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/10">
              
              {!selectedLocalMedia ? (
                /* SECTION 44 REQUIREMENT: NO VIDEO SELECTED STATE */
                <div className="text-center p-8 space-y-4">
                  <VideoOff className="w-12 h-12 text-slate-500 mx-auto" />
                  <div>
                    <h3 className="text-xl font-extrabold text-white font-mono uppercase">NO VIDEO SELECTED</h3>
                    <p className="text-slate-300 text-xs mt-1">
                      Choose a local video to start your Virtual Box session.
                    </p>
                  </div>
                  <label className="glass-button-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer">
                    <Upload className="w-4 h-4 fill-white" />
                    [ Choose Local Video ]
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                /* REAL HTML5 VIDEO PLAYER (NO FAKE POSTERS) */
                <video
                  ref={videoRef}
                  controls={false}
                  playsInline
                  onTimeUpdate={() => {
                    if (videoRef.current && !isRemoteCommand.current) {
                      setCurrentTime(videoRef.current.currentTime);
                    }
                  }}
                  onLoadedMetadata={() => {
                    if (videoRef.current) setDuration(videoRef.current.duration);
                  }}
                  className="w-full h-full object-contain"
                />
              )}

              {/* OVERLAY HOST BADGE & METADATA */}
              {selectedLocalMedia && (
                <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none z-10">
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-black font-extrabold text-[10px] tracking-wider uppercase shadow-lg flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-black" />
                    HOST: {currentRoom ? currentRoom.hostName : userProfile.username}
                  </span>

                  <span className="px-3 py-1 rounded-full glass-pill text-purple-200 font-mono text-[10px] border-purple-400/30 truncate max-w-[200px]">
                    {selectedLocalMedia.fileName}
                  </span>
                </div>
              )}

              {/* OVERLAY PLAY / PAUSE INTERACTIVE BUTTON */}
              {selectedLocalMedia && (
                <button
                  onClick={handlePlayPauseToggle}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full glass-panel flex items-center justify-center text-purple-200 border-purple-400/40 opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 shadow-[0_0_30px_rgba(139,92,246,0.4)] z-20"
                >
                  {isPlaying ? <Pause className="w-8 h-8 fill-purple-200" /> : <Play className="w-8 h-8 fill-purple-200 ml-1" />}
                </button>
              )}

            </div>

            {/* REAL VIDEO CONTROLS BAR */}
            {selectedLocalMedia && (
              <div className="mt-3 p-3 rounded-2xl glass-panel border-white/10 space-y-2">
                
                {/* SEEK SLIDER */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-purple-300 font-bold w-16 text-right">
                    {formatTimeDisplay(currentTime)}
                  </span>
                  
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeekChange}
                    className="w-full accent-purple-400 cursor-pointer h-1.5 rounded-lg bg-white/20"
                  />

                  <span className="text-[11px] font-mono text-slate-400 w-16">
                    {formatTimeDisplay(duration)}
                  </span>
                </div>

                {/* CONTROL BUTTONS */}
                <div className="flex items-center justify-between pt-1">
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePlayPauseToggle}
                      className="glass-button-primary w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsMuted(!isMuted);
                          if (videoRef.current) videoRef.current.muted = !isMuted;
                        }}
                        className="text-slate-300 hover:text-white"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-purple-300" />}
                      </button>

                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={volume}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setVolume(val);
                          if (videoRef.current) videoRef.current.volume = val;
                        }}
                        className="w-16 sm:w-24 accent-purple-400 cursor-pointer h-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                      {selectedLocalMedia.resolution} • {selectedLocalMedia.format}
                    </span>

                    {/* YOUTUBE-INSPIRED QUALITY CONTROL (SECTION 36-40) */}
                    <div className="relative">
                      <button
                        onClick={() => setShowQualityMenu(!showQualityMenu)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill text-xs font-mono text-slate-200 border-white/10 hover:border-purple-300 transition-all"
                        title="Video Quality Settings"
                      >
                        <Settings className="w-3.5 h-3.5 text-purple-300" />
                        <span>{selectedLocalMedia.resolution || '1080p'}</span>
                      </button>

                      {showQualityMenu && (
                        <div className="absolute bottom-10 right-0 w-64 rounded-2xl glass-panel border-white/20 p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 space-y-2.5">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider font-mono">⚙ PLAYBACK QUALITY</span>
                            <span className="text-[9px] font-mono text-slate-400">{selectedLocalMedia.width}×{selectedLocalMedia.height}</span>
                          </div>

                          <div className="space-y-1">
                            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/40 text-xs font-bold text-purple-200 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                ✓ Original — {selectedLocalMedia.resolution}
                              </span>
                              <span className="text-[9px] font-mono text-emerald-400">Native Source</span>
                            </div>
                          </div>

                          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-slate-400 space-y-1">
                            <span className="font-bold text-slate-300 block">✨ Enhancement Status</span>
                            <p className="text-[9px] leading-relaxed text-slate-400">
                              Native source quality is active ({selectedLocalMedia.resolution}). Synthetic CSS/filter scaling is disabled to prevent false resolution claims.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          if (!document.fullscreenElement) {
                            videoRef.current.requestFullscreen();
                          } else {
                            document.exitFullscreen();
                          }
                        }
                      }}
                      className="p-2 rounded-xl text-slate-300 hover:text-white glass-pill border-white/10"
                      title="Fullscreen"
                    >
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>

        {/* ------------------------------------------------ */}
        {/* RIGHT SIDE PANEL: CHAT, PEOPLE, VOICE */}
        {/* ------------------------------------------------ */}
        <div className={`w-full lg:w-96 glass-panel border-l border-white/10 flex flex-col z-20 shrink-0 transition-all duration-300 ${
          isSidePanelOpen ? 'h-[500px] lg:h-auto' : 'h-12 lg:h-auto'
        }`}>
          
          {/* TAB HEADERS */}
          <div className="flex items-center justify-between p-2 border-b border-white/10 bg-black/30">
            <div className="flex items-center gap-1 flex-1">
              <button
                onClick={() => {
                  setActiveSideTab('chat');
                  setIsSidePanelOpen(true);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
                  activeSideTab === 'chat'
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-400/40 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat
              </button>

              <button
                onClick={() => {
                  setActiveSideTab('people');
                  setIsSidePanelOpen(true);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
                  activeSideTab === 'people'
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-400/40 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                People ({currentRoom ? currentRoom.participants.length : 1})
              </button>

              <button
                onClick={() => {
                  setActiveSideTab('voice');
                  setIsSidePanelOpen(true);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
                  activeSideTab === 'voice'
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-400/40 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                Voice
              </button>
            </div>

            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              {isSidePanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* TAB CONTENT */}
          {isSidePanelOpen && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              
              {/* 1. CHAT TAB */}
              {activeSideTab === 'chat' && (
                <div className="flex-1 flex flex-col min-h-0 p-3">
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {currentRoom && currentRoom.chat.map((msg) => (
                      <div key={msg.id} className="space-y-1">
                        {msg.isSystem ? (
                          <div className="text-[10px] font-mono text-center text-slate-400 py-1 bg-white/5 rounded-lg border border-white/5">
                            {msg.text}
                          </div>
                        ) : (
                          <div className="p-3 rounded-2xl glass-panel border-white/10 space-y-1 bg-white/5">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-purple-300 flex items-center gap-1">
                                {msg.sender === userProfile.username && <Crown className="w-3 h-3 text-amber-300" />}
                                {msg.sender}
                              </span>
                              <span className="text-slate-400 font-mono">{msg.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-200 leading-relaxed">{msg.text}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <form onSubmit={handleSendChat} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Say something to room..."
                        className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="glass-button-primary p-2.5 rounded-xl text-white font-bold"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* 2. PEOPLE TAB */}
              {activeSideTab === 'people' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                      👑 ROOM HOST
                    </span>
                    <div className="p-3 rounded-2xl glass-panel border-amber-400/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center font-bold text-black ring-2 ring-amber-400">
                          {userProfile.avatar || '👑'}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-1">
                            {userProfile.username}
                            <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                          </h4>
                          <span className="text-[10px] text-slate-400">Host Control • Online</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        👑 HOST
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. VOICE TAB */}
              {activeSideTab === 'voice' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {micError && (
                    <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{micError}</span>
                    </div>
                  )}

                  <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <Mic className="w-4 h-4 text-purple-300" />
                      WebRTC Spatial Audio
                    </span>
                    <span className="text-[10px] font-mono bg-purple-500/20 px-2 py-0.5 rounded-full text-purple-200">48kHz HD</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-4 rounded-2xl glass-panel border-white/10 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden ${
                      isSpeaking ? 'border-purple-400 shadow-[0_0_20px_rgba(139,92,246,0.4)]' : ''
                    }`}>
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-2xl font-bold shadow-lg ${
                        isSpeaking ? 'speaking-ring-pulse ring-4 ring-purple-400' : ''
                      }`}>
                        {userProfile.avatar || '👑'}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white truncate max-w-[100px]">
                          {userProfile.username}
                        </h4>
                        <span className="text-[9px] font-mono text-slate-400 block">
                          {userProfile.isMicMuted ? '🔇 Muted' : isSpeaking ? '🎙️ Speaking' : 'Listening'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <button
                      onClick={toggleMic}
                      className={`w-full p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        userProfile.isMicMuted
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {userProfile.isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      {userProfile.isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
