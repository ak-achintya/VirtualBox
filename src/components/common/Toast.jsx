import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles } from 'lucide-react';

export const Toast = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className="glass-panel px-5 py-3.5 rounded-2xl flex items-center gap-3 border border-purple-400/40 shadow-2xl backdrop-blur-3xl text-slate-100">
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300">
          <Sparkles className="w-4 h-4 animate-spin-slow" />
        </div>
        <span className="text-sm font-medium tracking-wide text-purple-100">{toastMessage}</span>
      </div>
    </div>
  );
};
