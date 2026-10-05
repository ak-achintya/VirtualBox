import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Play, 
  PlusCircle, 
  Clock, 
  FolderOpen, 
  Upload, 
  Tv, 
  CheckCircle2,
  Film,
  Sparkles,
  ChevronRight,
  HardDrive
} from 'lucide-react';

export const HomeView = () => {
  const { 
    setActiveView, 
    selectedLocalMedia, 
    handleSelectLocalFile, 
    savedSessions, 
    currentRoom,
    promptContinueSession 
  } = useApp();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const media = await handleSelectLocalFile(file);
      if (media) {
        setActiveView('create_room');
      }
    }
  };

  // Primary Hero item from user's history or local media
  const primaryHeroSession = savedSessions.length > 0 ? savedSessions[0] : null;

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-10 bg-[#0B0C0E]">
      
      {/* ============================================================ */}
      {/* 1. HERO / FEATURED BANNER (STREAMPULSE CINEMATIC) */}
      {/* ============================================================ */}
      <section className="relative rounded-lg overflow-hidden bg-[#1A1C22] border border-[#262933] min-h-[400px] md:min-h-[460px] flex flex-col justify-end p-6 md:p-12 shadow-xl group">
        
        {/* DARK BOTTOM FADE GRADIENT INTO #0B0C0E */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0B0C0E] via-[#0B0C0E]/70 to-transparent" />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0B0C0E] via-[#0B0C0E]/60 to-transparent" />
        
        {/* Subtle Brand Background Glow */}
        <div className="absolute inset-0 z-0 opacity-15 bg-[radial-gradient(circle_at_80%_20%,#FF4D00_0%,transparent_60%)]" />

        {/* HERO CONTENT OVERLAY */}
        <div className="relative z-10 max-w-2xl space-y-4">
          
          {primaryHeroSession ? (
            /* IF USER HAS SAVED WATCH HISTORY */
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#FF4D00]/20 text-[#FF4D00] text-xs font-bold uppercase tracking-wider border border-[#FF4D00]/40">
                <Sparkles className="w-3.5 h-3.5" />
                CONTINUE WATCHING
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {primaryHeroSession.fileName}
              </h1>

              {/* METADATA BAR */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-gray-300">
                <span className="px-2 py-0.5 rounded bg-[#FF4D00] text-white font-bold">
                  {primaryHeroSession.resolution || '1080p'}
                </span>
                <span>•</span>
                <span>{primaryHeroSession.formattedDuration}</span>
                <span>•</span>
                <span className="text-[#FF4D00] font-semibold">Saved position: {primaryHeroSession.lastPositionFormatted}</span>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed font-sans max-w-xl">
                Resume synchronized streaming in your private room. Select your local video file to restore your watch position at {primaryHeroSession.lastPositionFormatted}.
              </p>

              {/* ACTION BUTTONS */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => promptContinueSession(primaryHeroSession)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-lg stream-btn-primary text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Play Now
                </button>

                <button
                  onClick={() => setActiveView('create_room')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-lg stream-btn-secondary text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 text-[#FF4D00]" />
                  + Create Room
                </button>
              </div>
            </>
          ) : (
            /* EMPTY STATE HERO */
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#FF4D00]/20 text-[#FF4D00] text-xs font-bold uppercase tracking-wider border border-[#FF4D00]/40">
                <Tv className="w-3.5 h-3.5" />
                VIRTUAL BOX CINEMA
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Bring Your Own Video.<br />
                Stream Together.
              </h1>

              <p className="text-gray-300 text-sm leading-relaxed max-w-xl">
                Select your local media file and stream with your friends in sub-second synchronized 4K with spatial voice chat.
              </p>

              {/* ACTION BUTTONS */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <label className="w-full sm:w-auto px-8 py-3.5 rounded-lg stream-btn-primary text-white font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4 fill-current" />
                  Choose Local Video
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => setActiveView('create_room')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-lg stream-btn-secondary text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 text-[#FF4D00]" />
                  + Create Room
                </button>
              </div>
            </>
          )}

        </div>

      </section>

      {/* ============================================================ */}
      {/* 2. MEDIA GRID & CARDS: CONTINUE WATCHING */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FF4D00]" />
            Continue Watching
          </h2>
          {savedSessions.length > 0 && (
            <button
              onClick={() => setActiveView('watch_history')}
              className="text-xs font-semibold text-[#FF4D00] hover:text-[#E64500] flex items-center gap-1 transition-colors"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {savedSessions.length === 0 ? (
          /* EMPTY STATE */
          <div className="p-8 rounded-lg stream-panel text-center space-y-4">
            <FolderOpen className="w-12 h-12 text-gray-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Your watch history is empty.</h3>
              <p className="text-gray-400 text-xs">
                Select a local video file to start your first session.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 px-6 py-3 rounded-lg stream-btn-primary text-white font-bold text-xs uppercase tracking-wider cursor-pointer">
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
        ) : (
          /* STRUCTURED MEDIA CARDS GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {savedSessions.map((session) => {
              const progressPercent = session.durationSeconds > 0 
                ? Math.min(100, Math.round((session.lastPositionSeconds / session.durationSeconds) * 100))
                : 0;

              return (
                <div
                  key={session.id}
                  onClick={() => promptContinueSession(session)}
                  className="rounded-lg stream-card-interactive overflow-hidden cursor-pointer group flex flex-col justify-between"
                >
                  {/* 16:9 MEDIA POSTER CONTAINER */}
                  <div className="relative aspect-video bg-[#121418] flex items-center justify-center overflow-hidden border-b border-[#262933]">
                    <Film className="w-10 h-10 text-gray-600 group-hover:scale-105 transition-transform" />
                    
                    {/* OVERLAY PLAY BUTTON */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-11 h-11 rounded-full bg-[#FF4D00] flex items-center justify-center text-white shadow-lg">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* DURATION BADGE */}
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-gray-200">
                      {session.formattedDuration}
                    </span>

                    {/* PROGRESS BAR */}
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-gray-800">
                      <div 
                        className="h-full bg-[#FF4D00]" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* MEDIA INFO BELOW CARD */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#FF4D00] transition-colors line-clamp-1">
                        {session.fileName}
                      </h3>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 font-mono">
                        <span>{session.resolution || '1080p'}</span>
                        <span className="text-[#FF4D00] font-semibold">{session.lastPositionFormatted}</span>
                      </div>
                    </div>

                    <button
                      className="w-full py-2 rounded-lg stream-btn-secondary text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 group-hover:bg-[#FF4D00] group-hover:border-[#FF4D00] transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Continue
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 3. CONTENT ROW: ACTIVE WATCH ROOM (IF OPEN) */}
      {/* ============================================================ */}
      {currentRoom && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Tv className="w-4 h-4 text-[#FF4D00]" />
            Active Room
          </h2>

          <div className="p-5 rounded-lg stream-panel border-[#262933] flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#FF4D00]/20 border border-[#FF4D00]/40 flex items-center justify-center text-[#FF4D00] font-black font-mono text-base">
                #{currentRoom.code}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{currentRoom.name}</h3>
                <p className="text-gray-400 text-xs mt-1">
                  Playing: <strong className="text-gray-200">{currentRoom.media ? currentRoom.media.fileName : 'No video'}</strong> • Host: {currentRoom.hostName}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveView('watch_room')}
              className="w-full md:w-auto px-6 py-2.5 rounded-lg stream-btn-primary text-white font-bold text-xs uppercase tracking-wider"
            >
              Enter Room #{currentRoom.code}
            </button>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 4. CONTENT ROW: CURRENTLY LOADED VIDEO */}
      {/* ============================================================ */}
      {selectedLocalMedia && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#FF4D00]" />
            Loaded Video File
          </h2>

          <div className="p-5 rounded-lg stream-panel border-[#262933] flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-[#FF4D00]/20 border border-[#FF4D00]/40 flex items-center justify-center text-[#FF4D00] shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#FF4D00]" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-[#FF4D00] uppercase tracking-wider block">Ready to Stream</span>
                <h3 className="text-sm font-bold text-white">{selectedLocalMedia.fileName}</h3>
                <p className="text-gray-400 text-xs font-mono">
                  {selectedLocalMedia.resolution} • {selectedLocalMedia.formattedDuration} • {selectedLocalMedia.fileSize}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveView('create_room')}
              className="w-full md:w-auto px-6 py-2.5 rounded-lg stream-btn-primary text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4 fill-current" />
              Create Room
            </button>
          </div>
        </section>
      )}

    </div>
  );
};
