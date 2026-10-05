import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, HardDrive, Radio, Cpu, Sparkles, Play } from 'lucide-react';

export const Footer = () => {
  const { setActiveView } = useApp();

  return (
    <footer className="relative z-10 w-full bg-[#0B0C0E] border-t border-[#262933] pt-10 pb-8 px-4 md:px-8 text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* BRAND COLUMN */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveView('home')}>
              <div className="w-8 h-8 rounded-lg bg-[#FF4D00] flex items-center justify-center text-white font-bold">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              <span className="text-lg font-black tracking-wider text-white uppercase font-sans">
                VIRTUAL<span className="text-[#FF4D00]">BOX</span>
              </span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Private virtual cinema platform for watching local media together in synchronized rooms with real-time audio and chat.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-[#FF4D00] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>System Status: Operational</span>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-gray-300">
              <li>
                <button onClick={() => setActiveView('home')} className="hover:text-[#FF4D00] transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('movie_select')} className="hover:text-[#FF4D00] transition-colors">
                  My Media Library
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('create_room')} className="hover:text-[#FF4D00] transition-colors">
                  Create Watch Room
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('join_room')} className="hover:text-[#FF4D00] transition-colors">
                  Join with Code
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('watch_history')} className="hover:text-[#FF4D00] transition-colors">
                  Watch History & Sessions
                </button>
              </li>
            </ul>
          </div>

          {/* FEATURES & TECH */}
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              Architecture
            </h4>
            <ul className="space-y-1.5 text-gray-400 font-mono text-[11px]">
              <li className="flex items-center gap-1.5">
                <HardDrive className="w-3 h-3 text-[#FF4D00]" />
                Local Media Storage
              </li>
              <li className="flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400" />
                Jakarta WebSocket Sync Engine
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#FF4D00]" />
                WebRTC Peer Media Stream
              </li>
            </ul>
          </div>

          {/* PRIVACY & COMPLIANCE NOTICE */}
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              Legal Policy
            </h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Virtual Box does not host, stream, or index copyrighted movie catalogs. Users bring their own legally acquired video files for local peer playback.
            </p>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="pt-6 border-t border-[#262933] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>© 2026 Virtual Box Cinema Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-gray-300 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-gray-300 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-gray-300 cursor-pointer">Security Protocol</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
