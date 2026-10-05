import React from 'react';
import { useApp } from '../../context/AppContext';
import { GENRES } from '../../data/mockData';
import { X, Settings, Crown, Lock, Mic, MessageSquare, Palette, ShieldCheck, Sparkles } from 'lucide-react';

export const RoomSettingsModal = () => {
  const { 
    showRoomSettingsModal, 
    setShowRoomSettingsModal, 
    currentRoom, 
    setCurrentRoom,
    isHost,
    genreTheme,
    setGenreTheme,
    isAutoTheme,
    setIsAutoTheme,
    showToast 
  } = useApp();

  if (!showRoomSettingsModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel border-white/20 shadow-2xl space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-300" />
            <h3 className="text-xl font-bold text-white">Room Settings</h3>
          </div>
          <button
            onClick={() => setShowRoomSettingsModal(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* HOST CONTROL NOTICE */}
        {isHost && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <Crown className="w-4 h-4 shrink-0 text-amber-400" />
            <span>You are the Host. Changes apply in real-time to all viewers.</span>
          </div>
        )}

        <div className="space-y-5">
          
          {/* ROOM NAME */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Room Name
            </label>
            <input
              type="text"
              value={currentRoom.name}
              onChange={(e) => setCurrentRoom(prev => ({ ...prev, name: e.target.value }))}
              disabled={!isHost}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-semibold text-white focus:outline-none"
            />
          </div>

          {/* ROOM ATMOSPHERE THEME */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Room Atmosphere Theme
              </label>
              <span className="text-[10px] text-purple-300 font-mono">Current: {genreTheme}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {GENRES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGenreTheme(g.id)}
                  className={`py-2 px-2 rounded-xl border text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 ${
                    (isAutoTheme && g.id === 'auto') || (!isAutoTheme && genreTheme === g.id)
                      ? 'glass-panel border-purple-400 text-purple-200 font-bold shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${g.color}`} />
                  {g.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* PLAYBACK PERMISSIONS */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Playback Control
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentRoom(prev => ({ ...prev, syncMessage: 'SYNCED (Host Control)' }));
                  showToast('Playback set to Host Only');
                }}
                className="p-3 rounded-xl glass-panel border-purple-400 text-purple-200 text-xs font-bold flex items-center gap-2"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                Host Only
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentRoom(prev => ({ ...prev, syncMessage: 'SYNCED (Shared Control)' }));
                  showToast('Playback set to Everyone');
                }}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs hover:text-white flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                Everyone
              </button>
            </div>
          </div>

          {/* CHAT & VOICE TOGGLES */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setCurrentRoom(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }));
                showToast(`Voice chat ${!currentRoom.voiceEnabled ? 'enabled' : 'disabled'}`);
              }}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                currentRoom.voiceEnabled
                  ? 'glass-panel border-purple-400 text-purple-300'
                  : 'bg-white/5 border-white/10 text-slate-500'
              }`}
            >
              <Mic className="w-4 h-4" />
              Voice Chat: {currentRoom.voiceEnabled ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => {
                setCurrentRoom(prev => ({ ...prev, chatEnabled: !prev.chatEnabled }));
                showToast(`Live Chat ${!currentRoom.chatEnabled ? 'enabled' : 'disabled'}`);
              }}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                currentRoom.chatEnabled
                  ? 'glass-panel border-purple-400 text-purple-300'
                  : 'bg-white/5 border-white/10 text-slate-500'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Live Chat: {currentRoom.chatEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

        </div>

        {/* DONE BUTTON */}
        <button
          onClick={() => setShowRoomSettingsModal(false)}
          className="glass-button-primary w-full py-3 rounded-xl text-white font-extrabold text-xs uppercase tracking-wider"
        >
          Save & Apply Settings
        </button>

      </div>
    </div>
  );
};
