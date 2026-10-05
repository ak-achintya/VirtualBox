import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BackgroundCanvas } from './components/common/BackgroundCanvas';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Toast } from './components/common/Toast';

import { LandingView } from './components/views/LandingView';
import { HomeView } from './components/views/HomeView';
import { CreateRoomView } from './components/views/CreateRoomView';
import { JoinRoomView } from './components/views/JoinRoomView';
import { MovieSelectionView } from './components/views/MovieSelectionView';
import { WatchRoomView } from './components/views/WatchRoomView';
import { WatchHistoryView } from './components/views/WatchHistoryView';
import { ProfileView } from './components/views/ProfileView';

import { ContinueWatchingModal } from './components/modals/ContinueWatchingModal';
import { RoomSettingsModal } from './components/modals/RoomSettingsModal';
import { ShareRoomModal } from './components/modals/ShareRoomModal';
import { AuthModal } from './components/modals/AuthModal';

const MainAppContent = () => {
  const { activeView } = useApp();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'landing':
        return <LandingView />;
      case 'home':
        return <HomeView />;
      case 'create_room':
        return <CreateRoomView />;
      case 'join_room':
        return <JoinRoomView />;
      case 'movie_select':
        return <MovieSelectionView />;
      case 'watch_room':
        return <WatchRoomView />;
      case 'watch_history':
        return <WatchHistoryView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <LandingView />;
    }
  };

  return (
    <div className="relative min-h-screen text-white bg-[#0B0C0E] flex flex-col selection:bg-[#FF4D00] selection:text-white">
      {/* DYNAMIC AMBIENT BACKGROUND CANVAS */}
      <BackgroundCanvas />

      {/* TOP NAVIGATION BAR */}
      <Navbar onOpenAuth={() => setShowAuthModal(true)} />

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 relative z-10">
        {renderActiveView()}
      </main>

      {/* FOOTER */}
      <Footer />

      {/* MODALS & OVERLAYS */}
      <ContinueWatchingModal />
      <RoomSettingsModal />
      <ShareRoomModal />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
