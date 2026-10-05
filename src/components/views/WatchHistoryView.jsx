import React from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Trash2, RotateCcw, FolderOpen } from 'lucide-react';

export const WatchHistoryView = () => {
  const { watchHistory, promptContinueSession, showToast } = useApp();

  return (
    <div className="min-h-[80vh] py-10 px-4 md:px-8 max-w-4xl mx-auto space-y-8 bg-[#0B0C0E]">
      
      <div className="flex items-center justify-between border-b border-[#262933] pb-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Clock className="w-7 h-7 text-[#FF4D00]" />
            Watch History
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track your past Virtual Box local media sessions.
          </p>
        </div>

        {watchHistory.length > 0 && (
          <button 
            onClick={() => showToast('Watch history cleared')}
            className="px-3.5 py-1.5 rounded-lg stream-btn-secondary text-xs text-rose-400 border-rose-500/30 flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear History
          </button>
        )}
      </div>

      {watchHistory.length === 0 ? (
        <div className="p-10 rounded-lg stream-panel text-center space-y-3">
          <FolderOpen className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-base font-bold text-gray-300">No watch history recorded yet.</h3>
          <p className="text-gray-500 text-xs">Watch a local video in a Virtual Box room to build your history.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {watchHistory.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg stream-card-interactive flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#FF4D00] font-bold uppercase tracking-wider">
                  Room #{item.roomCode} • {item.lastWatchedAt}
                </span>
                <h3 className="text-base font-bold text-white">{item.fileName}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>Last Position: <strong className="text-white font-mono">{item.lastPositionFormatted}</strong></span>
                  <span>•</span>
                  <span className="text-[#FF4D00]">{item.formattedDuration}</span>
                </div>
              </div>

              <button
                onClick={() => promptContinueSession(item)}
                className="stream-btn-primary w-full sm:w-auto px-6 py-2.5 rounded-lg text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Select File & Resume
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
