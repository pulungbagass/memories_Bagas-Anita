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
        relative rounded-2xl 
        bg-[#131328]
        ${bordered ? 'border border-white/10 shadow-lg shadow-black/30' : ''}
        ${hoverEffect ? 'transition-all duration-200 hover:bg-[#181832] hover:border-pink-500/30' : ''}
        ${glow ? 'border-pink-500/40 shadow-md shadow-pink-500/10' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
