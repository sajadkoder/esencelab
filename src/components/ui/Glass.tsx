import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'indigo' | 'cyan' | 'emerald' | 'amber' | 'rose';
}

const colorClasses = {
  indigo: 'bg-indigo-500/20 text-indigo-400',
  cyan: 'bg-cyan-500/20 text-cyan-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
  amber: 'bg-amber-500/20 text-amber-400',
  rose: 'bg-rose-500/20 text-rose-400',
};

export function StatCard({ label, value, icon: Icon, trend, color = 'indigo' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{label}</p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold gradient-text"
          >
            {value}
          </motion.p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = true }: GlassCardProps) {
  return (
    <div className={`glass-card ${hover ? 'hover:translate-y-[-2px]' : ''} ${className}`}>
      {children}
    </div>
  );
}

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantClasses = {
  primary: 'gradient-bg text-white hover:opacity-90',
  secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10',
  ghost: 'text-slate-300 hover:text-white hover:bg-white/10',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 rounded-xl',
  lg: 'px-6 py-3 rounded-xl text-lg',
};

export function GlassButton({ variant = 'primary', size = 'md', children, className = '', ...props }: GlassButtonProps) {
  return (
    <button
      className={`font-medium transition-all ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function GlassInput({ label, className = '', ...props }: GlassInputProps) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm text-slate-300">{label}</label>}
      <input
        className={`w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function GlassSelect({ label, options, className = '', ...props }: GlassSelectProps) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm text-slate-300">{label}</label>}
      <select
        className={`w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50 transition-colors ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-800">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function GlassTextarea({ label, className = '', ...props }: GlassTextareaProps) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm text-slate-300">{label}</label>}
      <textarea
        className={`w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none ${className}`}
        {...props}
      />
    </div>
  );
}

interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

const badgeVariants = {
  default: 'bg-white/10 text-slate-300',
  success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  error: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
  info: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
};

export function GlassBadge({ children, variant = 'default' }: GlassBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeVariants[variant]}`}>
      {children}
    </span>
  );
}

interface GlassProgressProps {
  value: number;
  max?: number;
  color?: 'indigo' | 'cyan' | 'emerald' | 'amber';
}

const progressColors = {
  indigo: 'bg-indigo-500',
  cyan: 'bg-cyan-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
};

export function GlassProgress({ value, max = 100, color = 'indigo' }: GlassProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`h-full ${progressColors[color]} rounded-full`}
      />
    </div>
  );
}
