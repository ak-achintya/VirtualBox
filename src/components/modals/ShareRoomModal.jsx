import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Copy, Check, Share2, QrCode } from 'lucide-react';

export const ShareRoomModal = () => {
  const { showShareModal, setShowShareModal, currentRoom, showToast } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!showShareModal || !currentRoom) return null;

  const roomLink = `https://virtualbox.app/room/${currentRoom.code}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentRoom.code);
    setCopiedCode(true);
    showToast('Room code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomLink);
    setCopiedLink(true);
    showToast('Invitation link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border-white/20 shadow-2xl space-y-6 text-center">
        
        <button
          onClick={() => setShowShareModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center mx-auto text-purple-300 shadow-[0_0_20px_rgba(139,92,246,0.4)]">
          <Share2 className="w-7 h-7 text-purple-200" />
        </div>

        <div>
          <h3 className="text-2xl font-extrabold text-white">Invite Friends</h3>
          <p className="text-slate-300 text-xs mt-1">Share room credentials to start watching together.</p>
        </div>

        {/* CODE BOX */}
        <div className="p-4 rounded-2xl bg-black/50 border border-purple-500/30 space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-400">Room Code</span>
          <div className="text-3xl font-extrabold font-mono text-purple-200 tracking-widest">
            {currentRoom.code}
          </div>
        </div>

        {/* SIMULATED QR CODE */}
        <div className="p-4 rounded-2xl glass-panel border-white/10 max-w-[140px] mx-auto space-y-2">
          <div className="w-24 h-24 bg-white rounded-xl p-2 mx-auto flex items-center justify-center">
            <QrCode className="w-full h-full text-black" />
          </div>
          <span className="text-[9px] text-slate-400 font-mono block">Scan to Join</span>
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleCopyCode}
            className="w-full py-3 rounded-xl glass-panel-interactive border-white/20 text-xs font-bold text-white flex items-center justify-center gap-2"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-300" />}
            {copiedCode ? 'Code Copied!' : 'Copy Code'}
          </button>

          <button
            onClick={handleCopyLink}
            className="glass-button-primary w-full py-3 rounded-xl text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
            {copiedLink ? 'Link Copied!' : 'Copy Link'}
          </button>
        </div>

      </div>
    </div>
  );
};
