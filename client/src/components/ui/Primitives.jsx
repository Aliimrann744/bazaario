import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { initials } from '../../lib/format';

export function Spinner({ className = '' }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function Avatar({ src, name = '', size = 40, className = '' }) {
  if (src) {
    return <img src={src} alt={name} width={size} height={size} className={`rounded-full object-cover ring-2 ring-white ${className}`} style={{ width: size, height: size }} />;
  }
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-brand-gradient font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(name) || '?'}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-white px-6 py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {subtitle && <p className="mt-1 max-w-sm text-sm text-muted">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Tag({ children, className = '' }) {
  return <span className={`badge bg-slate-100 text-slate-600 ${className}`}>{children}</span>;
}

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

export function MotionItem({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
