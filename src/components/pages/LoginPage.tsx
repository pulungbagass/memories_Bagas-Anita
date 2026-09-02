import React, { useState } from 'react';
import { Heart, Lock, Eye, EyeOff } from 'lucide-react';
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
      if (password === 'saya123') {
        onLoginSuccess();
      } else {
        setError('Password salah. (Petunjuk: saya123)');
        setIsLoading(false);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0b0b18]">
      <div className="w-full max-w-sm">
        <GlassCard className="p-6 sm:p-8 border-slate-800 text-center rounded-2xl">
          {/* Header Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-pink-400">
              <Heart className="w-8 h-8 fill-pink-500/80" />
            </div>
          </div>

          {/* Title & Tagline */}
          <p className="text-[11px] uppercase tracking-[0.25em] text-pink-400 font-semibold mb-1">
            Private Space
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif-display text-white tracking-tight">
            Bagas <span className="text-pink-400">&</span> Anita
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 font-normal">
            Masukkan passcode untuk membuka kenangan 🤍
          </p>

          <div className="w-10 h-0.5 bg-pink-500/40 mx-auto my-5 rounded-full" />

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-pink-400" /> Passcode
                </span>
                <span className="text-[10px] text-pink-400 font-normal">Petunjuk: saya123</span>
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
                  placeholder="Masukkan password..."
                  autoFocus
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
                {error}
              </div>
            )}

            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2 font-semibold"
            >
              Buka Album Kenangan
            </GlassButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
