import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  onClick?: () => void;
}

export default function Card({ children, className = '', hoverable = true, title, subtitle, action, onClick }: CardProps) {
  const baseClass = hoverable ? 'glass-card cursor-pointer' : 'glass-card-no-hover';
  return (
    <div
      className={`${baseClass} overflow-hidden ${className}`}
      onClick={onClick}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div>
            {title && <h3 className="text-xl font-semibold text-primary">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-secondary">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
