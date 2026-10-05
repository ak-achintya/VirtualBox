import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GENRES } from '../../data/mockData';
import { 
  Play, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Upload,
  HardDrive,
  CheckCircle2,
  Mic
} from 'lucide-react';

export const LandingView = () => {
  const { 
    setActiveView, 
    joinRoom, 
    showToast, 
    setGenreTheme, 
    handleSelectLocalFile, 
    selectedLocalMedia 
  } = useApp();

  const [inputCode, setInputCode] = useState('A7K29P');

  const handleQuickJoin = (e) => {
    e.preventDefault();
    if (inputCode) {
      joinRoom(inputCode);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleSelectLocalFile(file);
      setActiveView('create_room');
    }
  };

  return (
    <div className="relative min-h-screen pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-20 bg-[#0B0C0E]">
      
      {/* HERO SECTION */}
      <section className="pt-10 md:pt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* HERO LEFT COLUMN */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#FF4D00]/20 text-[#FF4D00] text-xs font-bold tracking-wider uppercase border border-[#FF4D00]/30">
            <Sparkles className="w-3.5 h-3.5" />
            VIRTUAL CINEMA PLATFORM
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
            Watch Together. <br />
            <span className="text-[#FF4D00]">Anywhere.</span>
          </h1>

          <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
            Create a private watch room, invite your friends, and stream movies together in sub-second synchronized 4K with low-latency spatial voice chat.
          </p>

          {/* MAIN CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
            <button
              onClick={() => setActiveView('create_room')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg stream-btn-primary text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              Create Room
            </button>

            <button
              onClick={() => setActiveView('join_room')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg stream-btn-secondary text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-[#FF4D00]" />
              Join Room
            </button>
          </div>

          {/* QUICK CODE INPUT CARD */}
          <div className="pt-2">
            <form 
              onSubmit={handleQuickJoin}
              className="max-w-md mx-auto lg:mx-0 p-2 rounded-lg stream-panel flex items-center gap-2"
            >
              <div className="pl-3 text-gray-400 text-xs font-mono font-semibold uppercase tracking-wider">
                Code:
              </div>
              <input
                type="text"
                maxLength={6}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="A7K29P"
                className="w-full bg-transparent px-2 py-1.5 text-sm font-mono tracking-widest text-[#FF4D00] font-bold focus:outline-none uppercase"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-lg stream-btn-primary text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
              >
                Join
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* HERO RIGHT COLUMN - LOCAL MEDIA DROP ZONE */}
        <div className="lg:col-span-6 relative">
          
          <div className="relative rounded-lg stream-panel p-8 border-[#262933] text-center space-y-5">
            
            <div className="w-14 h-14 rounded-lg bg-[#FF4D00]/20 border border-[#FF4D00]/40 flex items-center justify-center mx-auto text-[#FF4D00]">
              <HardDrive className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[#FF4D00] font-bold uppercase tracking-wider">
                Media Engine
              </span>
              <h3 className="text-xl font-bold text-white">
                Select Your Video File
              </h3>
              <p className="text-gray-400 text-xs max-w-sm mx-auto">
                No fake movie catalogs. Load your own MP4, WebM, or MKV file directly from your computer.
              </p>
            </div>

            {selectedLocalMedia && (
              <div className="p-3 rounded-lg bg-[#0B0C0E] border border-[#262933] text-left text-xs font-mono space-y-1">
                <div className="flex items-center gap-2 text-[#FF4D00] font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#FF4D00]" />
                  {selectedLocalMedia.fileName}
                </div>
                <div className="text-[11px] text-gray-400">
                  {selectedLocalMedia.resolution} • {selectedLocalMedia.formattedDuration}
                </div>
              </div>
            )}

            <label className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg stream-btn-primary text-white font-bold text-xs uppercase tracking-wider cursor-pointer">
              <Upload className="w-4 h-4 fill-current" />
              Choose Local Video
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

          </div>

        </div>

      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold tracking-widest text-[#FF4D00] uppercase">
            Seamless Architecture
          </h2>
          <h3 className="text-3xl font-black text-white">
            How Virtual Box Works
          </h3>
          <p className="text-gray-400 text-sm max-w-lg mx-auto">
            Get your private virtual cinema running in four simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-lg stream-card-interactive space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#FF4D00]/20 border border-[#FF4D00]/40 flex items-center justify-center text-[#FF4D00] font-black font-mono text-sm">
              01
            </div>
            <h4 className="text-base font-bold text-white">
              Choose Local Video
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Select your actual movie file from your computer using browser File APIs.
            </p>
          </div>

          <div className="p-5 rounded-lg stream-card-interactive space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#FF4D00]/20 border border-[#FF4D00]/40 flex items-center justify-center text-[#FF4D00] font-black font-mono text-sm">
              02
            </div>
            <h4 className="text-base font-bold text-white">
              Invite Your Friends
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Share your generated 6-character room code <code className="text-[#FF4D00] font-mono">A7K29P</code> with your group.
            </p>
          </div>

          <div className="p-5 rounded-lg stream-card-interactive space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#FF4D00]/20 border border-[#FF4D00]/40 flex items-center justify-center text-[#FF4D00] font-black font-mono text-sm">
              03
            </div>
            <h4 className="text-base font-bold text-white">
              Playback Sync
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Host controls playback in real-time. Sub-second WebSocket synchronization for Play, Pause, and Seek.
            </p>
          </div>

          <div className="p-5 rounded-lg stream-card-interactive space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#FF4D00]/20 border border-[#FF4D00]/40 flex items-center justify-center text-[#FF4D00] font-black font-mono text-sm">
              04
            </div>
            <h4 className="text-base font-bold text-white">
              Chat & Voice
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Speak over WebRTC voice, send text chat, and enjoy streamlined dark room lighting.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
