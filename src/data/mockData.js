export const GENRES = [
  { id: 'auto', name: 'Auto (Genre Synced)', color: 'from-violet-500 to-pink-500' },
  { id: 'scifi', name: 'Sci-Fi', color: 'from-violet-500 to-fuchsia-600' },
  { id: 'horror', name: 'Horror', color: 'from-rose-600 to-red-900' },
  { id: 'action', name: 'Action', color: 'from-orange-500 to-rose-600' },
  { id: 'romance', name: 'Romance', color: 'from-pink-500 to-rose-400' },
  { id: 'fantasy', name: 'Fantasy', color: 'from-purple-500 to-pink-500' },
  { id: 'mystery', name: 'Mystery', color: 'from-purple-700 to-slate-900' },
  { id: 'comedy', name: 'Comedy', color: 'from-amber-400 to-rose-400' },
  { id: 'classic', name: 'Classic Glass', color: 'from-purple-400 to-pink-400' },
];

export const INITIAL_ROOM_TEMPLATE = {
  code: null,
  name: 'Virtual Cinema Room',
  media: null,
  hostId: null,
  hostName: null,
  privacy: 'Private',
  theme: 'scifi',
  autoTheme: true,
  isSynced: true,
  syncMessage: 'SYNCED (Host Control)',
  sequence: 0,
  voiceEnabled: true,
  chatEnabled: true,
  participants: [],
  chat: []
};
