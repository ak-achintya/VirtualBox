import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GENRES } from '../../data/mockData';
import { 
  PlusCircle, 
  Users, 
  Compass, 
  Clock, 
  Palette, 
  Bell, 
  Sparkles,
  ChevronDown,
  Film,
  Search,
  Play
} from 'lucide-react';

export const Navbar = ({ onOpenAuth }) => {
  const { 
    activeView, 
    setActiveView, 
    genreTheme, 
    setGenreTheme, 
    userProfile, 
    currentRoom,
    showToast 
  } = useApp();

  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const notifications = [
    { id: 1, text: 'Friend invited you to a Virtual Cinema session', time: '5m ago' },
    { id: 2, text: 'Room #A7K29P session was saved automatically', time: '1h ago' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-4 md:px-8 py-3 bg-[#0B0C0E]/95 border-b border-[#262933] transition-all duration-200 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LOGO - VIRTUAL BOX / STREAMPULSE CINEMATIC */}
        <div 
          onClick={() => setActiveView('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-[#FF4D00] flex items-center justify-center text-white font-bold shadow-md group-hover:bg-[#E64500] transition-colors">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-white uppercase font-sans">
              VIRTUAL<span className="text-[#FF4D00]">BOX</span>
            </span>
          </div>
        </div>

        {/* NAVIGATION LINKS (DESKTOP) */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-[#1A1C22] px-3 py-1.5 rounded-lg border border-[#262933]">
          <button
            onClick={() => setActiveView('home')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeView === 'home' 
                ? 'bg-[#FF4D00] text-white shadow-sm' 
                : 'text-gray-300 hover:text-white hover:bg-[#242731]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Home
          </button>

          <button
            onClick={() => setActiveView('movie_select')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeView === 'movie_select' 
                ? 'bg-[#FF4D00] text-white shadow-sm' 
                : 'text-gray-300 hover:text-white hover:bg-[#242731]'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Library
          </button>

          <button
            onClick={() => setActiveView('create_room')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeView === 'create_room' 
                ? 'bg-[#FF4D00] text-white shadow-sm' 
                : 'text-gray-300 hover:text-white hover:bg-[#242731]'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Create Room
          </button>

          <button
            onClick={() => setActiveView('join_room')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeView === 'join_room' 
                ? 'bg-[#FF4D00] text-white shadow-sm' 
                : 'text-gray-300 hover:text-white hover:bg-[#242731]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Join Room
          </button>

          <button
            onClick={() => setActiveView('watch_history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeView === 'watch_history' 
                ? 'bg-[#FF4D00] text-white shadow-sm' 
                : 'text-gray-300 hover:text-white hover:bg-[#242731]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            History
          </button>

          {currentRoom && (
            <button
              onClick={() => setActiveView('watch_room')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold tracking-wide transition-all ${
                activeView === 'watch_room'
                  ? 'bg-[#FF4D00] text-white shadow-sm'
                  : 'bg-[#FF4D00]/20 text-[#FF4D00] border border-[#FF4D00]/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Room #{currentRoom.code}
            </button>
          )}
        </nav>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-3">
          
          {/* SEARCH CONTROL */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121418] border border-[#262933]">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search videos & history..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setActiveView('movie_select');
                }
              }}
              className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-32 focus:w-44 transition-all"
            />
          </div>

          {/* THEME ATMOSPHERE PICKER */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1A1C22] text-xs text-gray-200 border border-[#262933] hover:bg-[#242731] transition-all"
              title="Change Dynamic Room Atmosphere"
            >
              <Palette className="w-3.5 h-3.5 text-[#FF4D00]" />
              <span className="hidden sm:inline font-medium capitalize">{genreTheme}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-52 rounded-lg bg-[#1A1C22] border border-[#262933] p-2 shadow-xl z-50">
                <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Atmosphere Theme
                </div>
                <div className="space-y-1 mt-1">
                  {GENRES.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setGenreTheme(g.id);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between transition-all ${
                        genreTheme === g.id
                          ? 'bg-[#FF4D00] text-white font-semibold'
                          : 'text-gray-300 hover:bg-[#242731]'
                      }`}
                    >
                      <span>{g.name}</span>
                      {genreTheme === g.id && <Sparkles className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* NOTIFICATIONS BELL */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-lg bg-[#1A1C22] text-gray-300 hover:text-white border border-[#262933] transition-all"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF4D00]" />
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-72 rounded-lg bg-[#1A1C22] border border-[#262933] p-3 shadow-xl z-50">
                <div className="flex items-center justify-between pb-2 border-b border-[#262933] text-xs font-bold text-white">
                  <span>Notifications</span>
                  <span className="text-[10px] text-[#FF4D00] cursor-pointer" onClick={() => showToast('Notifications cleared')}>Mark read</span>
                </div>
                <div className="space-y-2 mt-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2 rounded-md bg-[#0B0C0E] border border-[#262933] text-xs">
                      <p className="text-gray-200">{n.text}</p>
                      <span className="text-[10px] text-gray-500 mt-1 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* USER PROFILE AVATAR / AUTH */}
          <button
            onClick={() => setActiveView('profile')}
            className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[#1A1C22] border border-[#262933] hover:bg-[#242731] transition-all"
          >
            <span className="w-7 h-7 rounded-md bg-[#FF4D00] flex items-center justify-center text-sm text-white font-bold">
              {userProfile.avatar || '👤'}
            </span>
            <span className="hidden sm:inline text-xs font-semibold text-white">
              {userProfile.username || 'User'}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
