import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RotateCcw, Play, X, Clock, Upload, HardDrive } from 'lucide-react';

export const ContinueWatchingModal = () => {
  const { 
    showContinueWatchingModal, 
    setShowContinueWatchingModal, 
    pendingSession, 
    confirmContinueSession 
  } = useApp();

  const [isProcessing, setIsProcessing] = useState(false);

  if (!showContinueWatchingModal || !pendingSession) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessing(true);
      await confirmContinueSession(file);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border-purple-400/40 shadow-[0_0_50px_rgba(139,92,246,0.3)] space-y-6 text-center">
        
        <button
          onClick={() => setShowContinueWatchingModal(false)}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center mx-auto text-purple-200 shadow-[0_0_20px_rgba(139,92,246,0.4)]">
          <Clock className="w-7 h-7 text-purple-300" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider">
            Resume Watch Session
          </span>
          <h3 className="text-xl font-extrabold text-white truncate px-4">
            {pendingSession.fileName}
          </h3>
          <p className="text-slate-300 text-xs">
            Continue watching from position <strong className="text-purple-200 font-mono text-sm">{pendingSession.lastPositionFormatted}</strong>
          </p>
        </div>

        {/* SECTION 28 & 29 REQUIREMENT: SELECT LOCAL VIDEO & CONTINUE */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-slate-300 space-y-3">
          <p className="text-[11px] leading-relaxed">
            Select your local video file <strong className="text-white">{pendingSession.fileName}</strong> from your computer to restore playback position.
          </p>

          <label className="glass-button-primary w-full py-3.5 rounded-2xl text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 fill-white" />
            {isProcessing ? 'Processing File...' : '[ Select Video & Continue ]'}
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

      </div>
    </div>
  );
};
