import React from 'react';
import { motion } from 'motion/react';
import { Heart, ArrowRight } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import confetti from 'canvas-confetti';

interface ContinueButtonProps {
  onContinue: () => void;
  buttonLabel?: string;
}

export const ContinueButton: React.FC<ContinueButtonProps> = ({
  onContinue,
  buttonLabel = 'Enter Our Universe ✨'
}) => {
  const handleClick = () => {
    // Confetti effect
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f472b6', '#fb7185', '#fbbf24', '#fbcfe8', '#ffffff']
      });
    } catch {
      // fallback if canvas blocked
    }
    onContinue();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="flex justify-center pt-2"
    >
      <GlassButton
        variant="primary"
        size="lg"
        onClick={handleClick}
        className="px-8 py-4 text-base sm:text-lg shadow-2xl shadow-pink-500/40 rounded-full group cursor-pointer"
        icon={<Heart className="w-5 h-5 text-white fill-white/80 group-hover:scale-125 transition-transform" />}
      >
        <span>{buttonLabel}</span>
        <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
      </GlassButton>
    </motion.div>
  );
};
