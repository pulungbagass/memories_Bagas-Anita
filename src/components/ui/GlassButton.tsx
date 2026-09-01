import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  children,
  icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-2xl gap-2.5 font-medium',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-pink-500/85 via-rose-500/85 to-amber-500/80 text-white shadow-lg shadow-pink-500/25 border border-white/25 hover:brightness-110 hover:shadow-pink-500/40 active:scale-[0.98]',
    secondary:
      'bg-white/10 text-white border border-white/15 hover:bg-white/20 hover:border-white/30 active:scale-[0.98]',
    ghost:
      'bg-transparent text-slate-300 hover:text-white hover:bg-white/5 active:scale-[0.98]',
    danger:
      'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 hover:text-rose-200 active:scale-[0.98]',
    amber:
      'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 hover:text-amber-200 active:scale-[0.98]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center font-medium whitespace-nowrap backdrop-blur-md
        transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
