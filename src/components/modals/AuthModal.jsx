import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Lock, Mail, X, LogIn, UserPlus, Sparkles } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { handleLogin, handleRegister, authError } = useApp();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegisterMode) {
        await handleRegister(username, email, password);
      } else {
        await handleLogin(email || username, password);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border-purple-400/40 shadow-2xl space-y-6">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400 flex items-center justify-center mx-auto text-purple-200">
            {isRegisterMode ? <UserPlus className="w-6 h-6 text-purple-300" /> : <LogIn className="w-6 h-6 text-purple-300" />}
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {isRegisterMode ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-slate-300 text-xs">
            {isRegisterMode ? 'Register your Virtual Box cinema profile' : 'Sign in to access your watch rooms'}
          </p>
        </div>

        {authError && (
          <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs text-center font-medium">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegisterMode && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="CinemaHost"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isRegisterMode ? 'Email Address' : 'Username or Email'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@virtualbox.app"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glass-button-primary w-full py-3.5 rounded-xl text-white font-extrabold text-xs uppercase tracking-wider"
          >
            {loading ? 'Authenticating...' : isRegisterMode ? 'Register Account' : 'Sign In'}
          </button>

        </form>

        <div className="text-center pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
            }}
            className="text-xs text-purple-300 hover:underline font-semibold"
          >
            {isRegisterMode ? 'Already have an account? Sign In' : 'Need an account? Register Now'}
          </button>
        </div>

      </div>
    </div>
  );
};
