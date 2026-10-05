import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Upload, 
  Clock, 
  ShieldAlert, 
  Play, 
  CheckCircle2, 
  HardDrive,
  RotateCcw,
  FolderOpen
} from 'lucide-react';

export const MovieSelectionView = () => {
  const { 
    selectedLocalMedia, 
    handleSelectLocalFile, 
    createRoom, 
    setActiveView, 
    savedSessions, 
    promptContinueSession 
  } = useApp();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const media = await handleSelectLocalFile(file);
      if (media) {
        createRoom({});
        setActiveView('watch_room');
      }
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 max-w-7xl mx-auto space-y-8 bg-[#0B0C0E]">
      
      {/* HEADER & LEGAL DISCLAIMER */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              My Media Library
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Select your own local video file from your computer to stream with your group.
            </p>
          </div>

          {/* CHOOSE LOCAL VIDEO BUTTON */}
          <label className="px-6 py-3.5 rounded-lg stream-btn-primary text-white font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2">
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

        {/* COMPLIANCE DISCLAIMER BOX */}
        <div className="p-4 rounded-lg bg-[#121418] border border-[#262933] text-gray-300 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#FF4D00] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-white">Virtual Box Local Media Principle</span>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Virtual Box is a private virtual cinema platform where users select their own local video content and watch it together with friends. No copyrighted video catalog is provided or hosted by Virtual Box.
            </p>
          </div>
        </div>
      </div>

      {/* SELECTED MEDIA BANNER */}
      {selectedLocalMedia ? (
        <div className="p-5 rounded-lg stream-panel border-[#262933] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#FF4D00] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF4D00]" />
              Active Local Video File
            </span>
            <button
              onClick={() => {
                createRoom({});
                setActiveView('watch_room');
              }}
              className="px-5 py-2 rounded-lg stream-btn-primary text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Watch Room
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-1">
            <div>
              <span className="text-[10px] text-gray-400 block font-sans">File Name</span>
              <strong className="text-white font-bold block truncate">{selectedLocalMedia.fileName}</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block font-sans">Resolution</span>
              <strong className="text-[#FF4D00] font-bold block">{selectedLocalMedia.resolution}</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block font-sans">Duration</span>
              <strong className="text-gray-300 font-bold block">{selectedLocalMedia.formattedDuration}</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block font-sans">Format & Size</span>
              <strong className="text-[#FF4D00] font-bold block">{selectedLocalMedia.format} • {selectedLocalMedia.fileSize}</strong>
            </div>
          </div>
        </div>
      ) : (
        /* NO VIDEO SELECTED STATE */
        <div className="p-10 rounded-lg bg-[#121418] border-2 border-dashed border-[#262933] text-center space-y-4">
          <div className="w-14 h-14 rounded-lg bg-[#FF4D00]/20 border border-[#FF4D00]/40 flex items-center justify-center mx-auto text-[#FF4D00]">
            <HardDrive className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider font-mono">NO VIDEO SELECTED</h2>
            <p className="text-gray-400 text-xs mt-1 max-w-sm mx-auto">
              Choose a local video to start your Virtual Box session.
            </p>
          </div>
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
      )}

      {/* SAVED SESSIONS & WATCH HISTORY */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#FF4D00]" />
          Saved Watch Sessions & History
        </h2>

        {savedSessions.length === 0 ? (
          <div className="p-8 rounded-lg stream-panel text-center space-y-2">
            <FolderOpen className="w-10 h-10 text-gray-600 mx-auto" />
            <h3 className="text-sm font-bold text-gray-300">Your library is empty.</h3>
            <p className="text-gray-500 text-xs">Select a local video and start watching.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => promptContinueSession(session)}
                className="p-4 rounded-lg stream-card-interactive space-y-3 cursor-pointer group"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#FF4D00] font-bold uppercase tracking-wider">
                    Room #{session.roomCode} • {session.lastWatchedAt}
                  </span>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#FF4D00] transition-colors truncate">
                    {session.fileName}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                    <span>Position: <strong className="text-white font-mono">{session.lastPositionFormatted}</strong></span>
                    <span className="text-gray-300">{session.formattedDuration}</span>
                  </div>
                </div>

                <button
                  className="w-full py-2 rounded-lg stream-btn-secondary text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 group-hover:bg-[#FF4D00] group-hover:border-[#FF4D00] transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Select File & Continue
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
