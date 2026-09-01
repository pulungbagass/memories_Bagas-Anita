import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Lock, ArrowRight, Eye, EyeOff, Sparkles, KeyRound } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      // Hardcoded password verification
      if (password === 'saya123') {
        onLoginSuccess();
      } else {
        setError('Incorrect password. (Hint: saya123)');
        setIsLoading(false);
      }
    }, 450);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#0c0c1e]">
      {/* Immersive UI Ambient Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 sm:w-[450px] h-80 sm:h-[450px] bg-pink-900/20 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-indigo-900/30 rounded-full blur-[160px] pointer-events-none animate-pulse-glow" />

      {/* Floating Emojis */}
      <div className="absolute top-[15%] left-[18%] text-2xl opacity-30 select-none pointer-events-none animate-float-slow">✨</div>
      <div className="absolute bottom-[20%] right-[15%] text-3xl opacity-25 select-none pointer-events-none animate-float-slow" style={{ animationDelay: '2s' }}>🤍</div>

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-8 sm:p-10 border-white/10 shadow-2xl shadow-black/50 text-center rounded-3xl">
          {/* Header Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative p-4 rounded-3xl bg-pink-500/15 border border-pink-500/30 shadow-lg shadow-pink-500/20">
              <Heart className="w-10 h-10 text-pink-400 fill-pink-400/80 animate-float-slow" />
              <Sparkles className="w-4 h-4 text-amber-300 absolute top-2 right-2 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>

          {/* Title & Tagline */}
          <p className="text-xs uppercase tracking-[0.4em] text-pink-300/70 font-semibold mb-1">
            Our Private Chapter
          </p>
          <h1 className="text-3xl sm:text-4xl font-light font-serif-display text-white tracking-tight">
            Bagas <span className="text-pink-400">&</span> Anita
          </h1>
          <p className="text-white/60 text-xs mt-2 font-medium tracking-wide">
            Enter passcode to unlock our memories 🤍
          </p>
          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto mt-4 mb-6" />

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-pink-400" /> Enter Passcode
                </span>
                <span className="text-[10px] text-pink-300/70 font-normal">Passcode: saya123</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Password..."
                  autoFocus
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl glass-input text-base tracking-wider text-white placeholder-white/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-white/40 hover:text-white rounded-lg transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2"
              >
                <KeyRound className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="pt-2">
              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full justify-center py-3.5 text-base shadow-xl shadow-pink-500/30"
                icon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                {isLoading ? 'Opening Vault...' : 'Unlock Memories'}
              </GlassButton>
            </div>
          </form>

          {/* Quick Demo Autofill */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setPassword('saya123');
                setError('');
              }}
              className="text-xs text-pink-300/80 hover:text-pink-200 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Auto-fill password (saya123)</span>
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
