import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GENRES } from '../../data/mockData';
import { 
  Sparkles, 
  Lock, 
  ShieldCheck, 
  Upload, 
  Copy, 
  Check, 
  ArrowRight, 
  CheckCircle2, 
  Mic, 
  MessageSquare, 
  RefreshCw 
} from 'lucide-react';

export const CreateRoomView = () => {
  const { 
    userProfile, 
    selectedLocalMedia, 
    handleSelectLocalFile, 
    createRoom, 
    setActiveView, 
    showToast 
  } = useApp();

  const [roomName, setRoomName] = useState(`${userProfile.username}'s Watch Room`);
  const [privacy, setPrivacy] = useState('Private');
  const [selectedTheme, setSelectedTheme] = useState('scifi');
  const [autoTheme, setAutoTheme] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Success state after creation
  const [createdRoomData, setCreatedRoomData] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessingFile(true);
      await handleSelectLocalFile(file);
      setIsProcessingFile(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedLocalMedia) {
      showToast('Please select a local video file to continue.');
      return;
    }

    const newRoom = createRoom({
      name: roomName,
      privacy: privacy,
      theme: selectedTheme,
      autoTheme: autoTheme,
      voiceEnabled: voiceEnabled,
      chatEnabled: chatEnabled,
    });

    if (newRoom) {
      setCreatedRoomData(newRoom);
    }
  };

  const handleCopyCode = () => {
    if (createdRoomData) {
      navigator.clipboard.writeText(createdRoomData.code);
      setCopiedCode(true);
      showToast('Room Code copied!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (createdRoomData) {
      const link = `https://watchparty.app/room/${createdRoomData.code}`;
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      showToast('Invite link copied!');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-[85vh] py-10 px-4 md:px-8 max-w-4xl mx-auto space-y-8 bg-[#0B0C0E]">
      
      {/* TITLE */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Create Your Watch Room
        </h1>
        <p className="text-gray-400 text-sm">
          Set up a private virtual cinema room using your actual local video file.
        </p>
      </div>

      {/* FORM IF ROOM NOT YET CREATED */}
      {!createdRoomData ? (
        <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-lg stream-panel space-y-6">
          
          {/* ROOM NAME */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
              ROOM NAME
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Watch Room Name"
              className="w-full px-4 py-3 rounded-lg stream-input text-sm text-white font-medium focus:outline-none"
              required
            />
          </div>

          {/* ROOM PRIVACY */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
              ROOM PRIVACY
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPrivacy('Private')}
                className={`p-4 rounded-lg border text-left transition-all flex items-center gap-3 ${
                  privacy === 'Private'
                    ? 'bg-[#1A1C22] border-[#FF4D00] text-white'
                    : 'bg-[#121418] border-[#262933] text-gray-400 hover:text-white'
                }`}
              >
                <Lock className="w-5 h-5 text-[#FF4D00]" />
                <div>
                  <div className="text-sm font-bold text-white">Private</div>
                  <div className="text-[11px] text-gray-400">Only invited friends with code</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPrivacy('Invite Only')}
                className={`p-4 rounded-lg border text-left transition-all flex items-center gap-3 ${
                  privacy === 'Invite Only'
                    ? 'bg-[#1A1C22] border-[#FF4D00] text-white'
                    : 'bg-[#121418] border-[#262933] text-gray-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-[#FF4D00]" />
                <div>
                  <div className="text-sm font-bold text-white">Invite Only</div>
                  <div className="text-[11px] text-gray-400">Host approval required to enter</div>
                </div>
              </button>
            </div>
          </div>

          {/* LOCAL VIDEO SELECTION */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
              SELECT YOUR VIDEO
            </label>

            {!selectedLocalMedia ? (
              <div className="p-8 rounded-lg bg-[#121418] border-2 border-dashed border-[#262933] text-center space-y-4">
                <div className="w-12 h-12 rounded-lg bg-[#FF4D00]/20 border border-[#FF4D00]/40 flex items-center justify-center mx-auto text-[#FF4D00]">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Select Your Video File</h3>
                  <p className="text-gray-400 text-xs max-w-sm mx-auto">
                    Choose a movie or series file from your computer to watch together.
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-6 py-3 rounded-lg stream-btn-primary text-white font-bold text-xs uppercase tracking-wider cursor-pointer">
                  {isProcessingFile ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 fill-current" />
                  )}
                  {isProcessingFile ? 'Reading Metadata...' : 'Choose Local Video'}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="p-5 rounded-lg bg-[#121418] border border-[#262933] space-y-3">
                <div className="flex items-center justify-between border-b border-[#262933] pb-3">
                  <div className="flex items-center gap-2 text-[#FF4D00] text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    SELECTED VIDEO FILE
                  </div>
                  
                  <label className="px-3 py-1 rounded-md stream-btn-secondary text-xs text-gray-200 hover:text-white cursor-pointer transition-all flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-[#FF4D00]" />
                    Change Video
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="col-span-2 sm:col-span-4">
                    <span className="text-[10px] text-gray-400 block font-sans">File Name</span>
                    <strong className="text-white text-sm block font-bold truncate">{selectedLocalMedia.fileName}</strong>
                  </div>

                  <div className="p-2.5 rounded bg-[#1A1C22] border border-[#262933]">
                    <span className="text-[10px] text-gray-400 block">Resolution</span>
                    <strong className="text-white font-bold block">{selectedLocalMedia.resolution}</strong>
                  </div>

                  <div className="p-2.5 rounded bg-[#1A1C22] border border-[#262933]">
                    <span className="text-[10px] text-gray-400 block">Frame Rate</span>
                    <strong className="text-gray-300 font-bold block">{selectedLocalMedia.fps}</strong>
                  </div>

                  <div className="p-2.5 rounded bg-[#1A1C22] border border-[#262933]">
                    <span className="text-[10px] text-gray-400 block">Duration</span>
                    <strong className="text-gray-300 font-bold block">{selectedLocalMedia.formattedDuration}</strong>
                  </div>

                  <div className="p-2.5 rounded bg-[#1A1C22] border border-[#262933]">
                    <span className="text-[10px] text-gray-400 block">Format & Size</span>
                    <strong className="text-[#FF4D00] font-bold block">{selectedLocalMedia.format} • {selectedLocalMedia.fileSize}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ATMOSPHERE THEME */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
              ROOM ATMOSPHERE
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {GENRES.map((g) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => {
                    if (g.id === 'auto') {
                      setAutoTheme(true);
                      setSelectedTheme('scifi');
                    } else {
                      setAutoTheme(false);
                      setSelectedTheme(g.id);
                    }
                  }}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    (autoTheme && g.id === 'auto') || (!autoTheme && selectedTheme === g.id)
                      ? 'bg-[#FF4D00] text-white border-[#FF4D00]'
                      : 'bg-[#121418] border-[#262933] text-gray-400 hover:text-white'
                  }`}
                >
                  {g.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* TOGGLES: VOICE & CHAT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-[#121418] border border-[#262933] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-[#FF4D00]" />
                <div>
                  <div className="text-xs font-bold text-white">Voice Chat</div>
                  <div className="text-[10px] text-gray-400">Enable spatial microphone audio</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#FF4D00] rounded cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-lg bg-[#121418] border border-[#262933] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-[#FF4D00]" />
                <div>
                  <div className="text-xs font-bold text-white">Live Room Chat</div>
                  <div className="text-[10px] text-gray-400">Allow instant text messages</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={chatEnabled}
                onChange={(e) => setChatEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#FF4D00] rounded cursor-pointer"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={!selectedLocalMedia}
            className={`w-full py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              selectedLocalMedia
                ? 'stream-btn-primary cursor-pointer'
                : 'bg-[#242731] text-gray-500 border border-[#262933] cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4 fill-current" />
            Create Watch Room
          </button>

        </form>
      ) : (
        /* SUCCESS CARD WHEN ROOM IS CREATED */
        <div className="p-8 rounded-lg stream-panel text-center space-y-6">
          
          <div className="w-14 h-14 rounded-full bg-[#FF4D00]/20 border border-[#FF4D00] flex items-center justify-center mx-auto text-[#FF4D00]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold tracking-widest text-[#FF4D00] uppercase">Success</span>
            <h2 className="text-3xl font-black text-white mt-1">ROOM CREATED</h2>
            <p className="text-gray-400 text-xs mt-1">Your Virtual Box watch room is live and ready!</p>
          </div>

          {/* ROOM CODE DISPLAY */}
          <div className="p-5 rounded-lg bg-[#0B0C0E] border border-[#262933] max-w-sm mx-auto space-y-1">
            <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">Room Code</span>
            <div className="text-3xl font-black font-mono text-[#FF4D00] tracking-widest">
              {createdRoomData.code}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleCopyCode}
              className="w-full sm:w-auto px-6 py-3 rounded-lg stream-btn-secondary text-xs font-bold text-white flex items-center justify-center gap-2"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#FF4D00]" />}
              {copiedCode ? 'Code Copied!' : 'Copy Code'}
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full sm:w-auto px-6 py-3 rounded-lg stream-btn-secondary text-xs font-bold text-white flex items-center justify-center gap-2"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#FF4D00]" />}
              {copiedLink ? 'Link Copied!' : 'Copy Link'}
            </button>

            <button
              onClick={() => setActiveView('watch_room')}
              className="w-full sm:w-auto px-8 py-3 rounded-lg stream-btn-primary text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              Enter Room
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
