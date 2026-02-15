interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-20 h-20 text-4xl',
  };

  return (
    <div 
      className={`
        ${sizes[size]}
        rounded-xl bg-stone-900 text-stone-50
        flex items-center justify-center font-semibold
        ${className}
      `}
    >
      E
    </div>
  );
}
