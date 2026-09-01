import React from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface WelcomeHeaderProps {
  partner1Name?: string;
  partner2Name?: string;
  customGreeting?: string;
  customSubtext?: string;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  partner1Name = 'Bagas',
  partner2Name = 'Anita',
  customGreeting = 'Welcome Home, My Love',
  customSubtext = 'Every second with you is my favorite memory.'
}) => {
  return (
    <div className="text-center space-y-4">
      {/* Animated Couple Badge */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-pink-500/30 shadow-lg shadow-pink-900/30"
      >
        <span className="text-sm font-semibold text-pink-200">👨‍💼 {partner1Name}</span>
        <Heart className="w-4 h-4 text-pink-400 fill-pink-400 animate-pulse" />
        <span className="text-sm font-semibold text-pink-200">🌷 {partner2Name}</span>
      </motion.div>

      {/* Main Greeting Headline */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif-display text-white tracking-tight leading-tight"
      >
        {customGreeting}
      </motion.h1>

      {/* Subtext description */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="text-pink-200/80 text-base sm:text-lg max-w-lg mx-auto font-light leading-relaxed"
      >
        {customSubtext}
      </motion.p>
    </div>
  );
};
