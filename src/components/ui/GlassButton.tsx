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
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5 min-h-[36px]',
    md: 'px-4 py-2 text-sm rounded-xl gap-2 min-h-[40px]',
    lg: 'px-6 py-2.5 text-base rounded-xl gap-2.5 font-medium min-h-[44px]',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-900/30 border border-pink-400/30 hover:brightness-110 active:scale-[0.98]',
    secondary:
      'bg-[#1e1e38] text-white border border-white/10 hover:bg-[#28284c] hover:border-white/20 active:scale-[0.98]',
    ghost:
      'bg-transparent text-slate-300 hover:text-white hover:bg-white/5 active:scale-[0.98]',
    danger:
      'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 hover:text-rose-200 active:scale-[0.98]',
    amber:
      'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 hover:text-amber-200 active:scale-[0.98]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center font-medium whitespace-nowrap
        transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none cursor-pointer
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
