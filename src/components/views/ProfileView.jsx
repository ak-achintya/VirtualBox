import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, Settings, Sliders, Volume2 } from 'lucide-react';

export const ProfileView = () => {
  const { userProfile, setUserProfile, showToast } = useApp();

  const avatarOptions = ['👤', '👑', '🎮', '🎬', '🍿', '⚡', '🎧', '🚀'];

  return (
    <div className="min-h-[85vh] py-10 px-4 md:px-8 max-w-4xl mx-auto space-y-8 bg-[#0B0C0E]">
      
      <div className="flex items-center gap-4 border-b border-[#262933] pb-6">
        <div className="w-16 h-16 rounded-lg bg-[#FF4D00] flex items-center justify-center text-3xl font-bold text-white shadow-md">
          {userProfile.avatar || '👤'}
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">{userProfile.username || 'User'}</h1>
          <p className="text-gray-400 text-xs font-mono">{userProfile.id || 'usr_guest'}</p>
          <span className="inline-block px-3 py-0.5 rounded bg-[#FF4D00]/20 text-[#FF4D00] font-mono text-[10px] font-bold border border-[#FF4D00]/30 mt-1.5">
            PRO CINEMA HOST
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* AVATAR SELECTOR */}
        <div className="p-5 rounded-lg stream-panel space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-[#FF4D00]" />
            Choose Avatar Icon
          </h3>
          <div className="grid grid-cols-4 gap-2.5">
            {avatarOptions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setUserProfile(prev => ({ ...prev, avatar: emoji }));
                  showToast('Avatar updated');
                }}
                className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl transition-all ${
                  userProfile.avatar === emoji
                    ? 'bg-[#FF4D00] text-white font-bold shadow-md'
                    : 'bg-[#121418] border border-[#262933] hover:bg-[#242731]'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* DISPLAY NAME & HANDLE */}
        <div className="p-5 rounded-lg stream-panel space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#FF4D00]" />
            Profile Details
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Username</label>
              <input
                type="text"
                value={userProfile.username || 'User'}
                onChange={(e) => setUserProfile(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-lg stream-input text-xs font-semibold text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">User ID</label>
              <input
                type="text"
                disabled
                value={userProfile.id || 'usr_guest'}
                className="w-full px-3.5 py-2 rounded-lg bg-[#121418] border border-[#262933] text-xs font-mono text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* AUDIO & HARDWARE PREFERENCES */}
        <div className="p-5 rounded-lg stream-panel space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#FF4D00]" />
            Audio Input & Microphone
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Audio Device</label>
              <select
                value={userProfile.audioDevice || 'Default Headset'}
                onChange={(e) => setUserProfile(prev => ({ ...prev, audioDevice: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-lg stream-input text-xs text-white focus:outline-none"
              >
                <option value="Default Headset" className="bg-[#0B0C0E]">Default Headset (Virtual Box HD)</option>
                <option value="Realtek High Definition Audio" className="bg-[#0B0C0E]">Realtek High Definition Audio</option>
                <option value="USB Studio Mic" className="bg-[#0B0C0E]">USB Studio Mic</option>
              </select>
            </div>
          </div>
        </div>

        {/* UI PREFERENCE */}
        <div className="p-5 rounded-lg stream-panel space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#FF4D00]" />
            Theme Preset
          </h3>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-[#121418] border border-[#262933] text-xs space-y-1">
              <span className="font-bold text-[#FF4D00]">StreamPulse Cinematic Dark</span>
              <p className="text-[11px] text-gray-400">High-contrast dark mode with fiery orange accents (#FF4D00) and 8px rounded components.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
