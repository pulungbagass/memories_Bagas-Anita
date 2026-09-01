import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glow?: boolean;
  bordered?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  glow = false,
  bordered = true,
  ...props
}) => {
  return (
    <div
      className={`
        relative rounded-3xl 
        bg-white/5 backdrop-blur-xl 
        ${bordered ? 'border border-white/10 shadow-2xl shadow-black/40' : ''}
        ${hoverEffect ? 'transition-all duration-300 hover:bg-white/[0.08] hover:border-pink-500/30 hover:shadow-pink-500/10 hover:shadow-2xl hover:-translate-y-1' : ''}
        ${glow ? 'shadow-[0_0_35px_rgba(244,114,182,0.15)] border-pink-500/30' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

