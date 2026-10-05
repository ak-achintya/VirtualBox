import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  ArrowRight, 
  Link as LinkIcon, 
  Radio, 
  HardDrive 
} from 'lucide-react';

export const JoinRoomView = () => {
  const { joinRoom, setActiveView } = useApp();
  const [code, setCode] = useState('A7K29P');
  const [isInviteLinkMode, setIsInviteLinkMode] = useState(false);
  const [inviteLink, setInviteLink] = useState('https://virtualbox.app/room/A7K29P');
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    let checkCode = code.trim().toUpperCase();
    if (isInviteLinkMode && inviteLink) {
      const parts = inviteLink.split('/');
      checkCode = parts[parts.length - 1].toUpperCase();
    }

    if (checkCode && checkCode.length >= 4) {
      setPreviewData({
        code: checkCode,
        roomName: `Virtual Cinema Room #${checkCode}`,
        hostName: "Host",
        participantsCount: 1,
        status: "Active Party",
      });
    } else {
      setPreviewData(null);
    }
  }, [code, inviteLink, isInviteLinkMode]);

  const handleJoin = (e) => {
    e.preventDefault();
    let targetCode = code;
    if (isInviteLinkMode && inviteLink) {
      const parts = inviteLink.split('/');
      targetCode = parts[parts.length - 1];
    }
    joinRoom(targetCode);
  };

  return (
    <div className="min-h-[80vh] py-12 px-4 md:px-8 max-w-xl mx-auto space-y-8 bg-[#0B0C0E]">
      
      {/* HEADER */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Join a Watch Room
        </h1>
        <p className="text-gray-400 text-sm">
          Enter a 6-character room code or paste an invitation link to enter the cinema.
        </p>
      </div>

      {/* JOIN CONTAINER */}
      <div className="p-6 sm:p-8 rounded-lg stream-panel space-y-6">
        
        {/* TOGGLE INPUT METHOD */}
        <div className="flex items-center justify-center p-1 rounded-lg bg-[#121418] border border-[#262933]">
          <button
            type="button"
            onClick={() => setIsInviteLinkMode(false)}
            className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${
              !isInviteLinkMode
                ? 'bg-[#FF4D00] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Room Code
          </button>
          <button
            type="button"
            onClick={() => setIsInviteLinkMode(true)}
            className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${
              isInviteLinkMode
                ? 'bg-[#FF4D00] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Invitation Link
          </button>
        </div>

        <form onSubmit={handleJoin} className="space-y-5">
          
          {!isInviteLinkMode ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block text-center">
                6-Character Room Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="A7K29P"
                className="w-full px-4 py-3.5 text-center rounded-lg stream-input text-2xl font-mono tracking-[0.4em] font-black text-[#FF4D00] focus:outline-none uppercase"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                Paste Invitation Link
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="url"
                  value={inviteLink}
                  onChange={(e) => setInviteLink(e.target.value)}
                  placeholder="https://virtualbox.app/room/A7K29P"
                  className="w-full pl-11 pr-4 py-3 rounded-lg stream-input text-xs font-mono text-white focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          {/* LIVE ROOM PREVIEW CARD */}
          {previewData && (
            <div className="p-4 rounded-lg bg-[#121418] border border-[#262933] flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-[#FF4D00]/20 border border-[#FF4D00]/40 flex items-center justify-center text-[#FF4D00] shrink-0">
                <HardDrive className="w-5 h-5 text-[#FF4D00]" />
              </div>
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#FF4D00] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Radio className="w-3 h-3 text-emerald-400" />
                    {previewData.status}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">#{previewData.code}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{previewData.roomName}</h4>
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span>Host: <strong className="text-gray-200">{previewData.hostName}</strong></span>
                  <span>•</span>
                  <span className="text-[#FF4D00] font-semibold">{previewData.participantsCount} connected user</span>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="stream-btn-primary w-full py-3.5 rounded-lg text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4 fill-current" />
            Join Room Now
          </button>

        </form>

      </div>

    </div>
  );
};
