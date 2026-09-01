import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Quote } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface LoveQuoteCardProps {
  quote?: string;
  authorSignature?: string;
}

export const LoveQuoteCard: React.FC<LoveQuoteCardProps> = ({
  quote = '"In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine."',
  authorSignature = 'Bagas & Anita'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.45 }}
      className="w-full max-w-xl mx-auto"
    >
      <GlassCard className="p-6 sm:p-8 border-white/10 relative overflow-hidden text-center rounded-3xl">
        <div className="absolute top-2 right-4 text-6xl font-serif italic opacity-10 select-none pointer-events-none">
          “
        </div>
        <div className="relative z-10">
          <p className="font-serif italic text-lg sm:text-xl text-white/90 leading-relaxed">
            {quote}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-pink-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>— {authorSignature}</span>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};
