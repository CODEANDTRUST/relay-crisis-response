import { CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import type { Status } from './types';

export const RELAY_COLORS = {
  ink: '#0F1419',
  paper: '#FAFAF7',
  steel: '#5C6670',
  mist: '#E4E6E3',
  signal: '#0066CC',
  signalHover: '#0052A3',
  signalPressed: '#003D7A',
  go: '#2E7D4F',
  watch: '#D97706',
  critical: '#C8312C',
};

export function statusColor(status: Status): string {
  return status === 'Stocked' ? RELAY_COLORS.go : status === 'Low' ? RELAY_COLORS.watch : RELAY_COLORS.critical;
}

export function statusIcon(status: Status, size = 12) {
  const Icon = status === 'Stocked' ? CheckCircle : status === 'Low' ? AlertTriangle : AlertOctagon;
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" />;
}

export function Wordmark({ size = 'nav' }: { size?: 'nav' | 'footer' | 'splash' }) {
  const cfg = size === 'nav'
    ? { mark: 6, gap: 8, text: 18 }
    : size === 'footer'
    ? { mark: 4, gap: 6, text: 14 }
    : { mark: 10, gap: 12, text: 32 };
  return (
    <span className="inline-flex items-center" style={{ gap: cfg.gap }}>
      <span style={{ width: cfg.mark, height: cfg.mark, background: RELAY_COLORS.signal, display: 'block' }} aria-hidden="true" />
      <span style={{ fontSize: cfg.text, fontWeight: 600, lineHeight: 1, color: RELAY_COLORS.ink, letterSpacing: '-0.01em' }}>Relay</span>
    </span>
  );
}

export function WordmarkInverse({ size = 'nav' }: { size?: 'nav' | 'footer' }) {
  const cfg = size === 'nav' ? { mark: 6, gap: 8, text: 18 } : { mark: 4, gap: 6, text: 14 };
  return (
    <span className="inline-flex items-center" style={{ gap: cfg.gap }}>
      <span style={{ width: cfg.mark, height: cfg.mark, background: RELAY_COLORS.signal, display: 'block' }} aria-hidden="true" />
      <span style={{ fontSize: cfg.text, fontWeight: 600, lineHeight: 1, color: RELAY_COLORS.paper, letterSpacing: '-0.01em' }}>Relay</span>
    </span>
  );
}

export function StatusBadge({ status, size = 'sm' }: { status: Status; size?: 'sm' | 'md' }) {
  const bg = statusColor(status);
  const pad = size === 'md' ? '6px 12px' : '4px 10px';
  const fs = size === 'md' ? 12 : 11;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: pad,
        borderRadius: 4,
        fontSize: fs,
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: RELAY_COLORS.paper,
        background: bg,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {statusIcon(status, size === 'md' ? 14 : 12)}
      {status}
    </span>
  );
}

export function StatusDot({ status, size = 10 }: { status: Status; size?: number }) {
  return (
    <span
      aria-label={status}
      style={{ width: size, height: size, borderRadius: '50%', background: statusColor(status), display: 'inline-block', flexShrink: 0 }}
    />
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'critical';
  size?: 'sm' | 'md' | 'lg' | 'field';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

export function RelayButton({ variant = 'primary', size = 'md', iconLeft, iconRight, children, style, ...rest }: ButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    border: 'none',
    cursor: rest.disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 120ms ease, color 120ms ease, border-color 120ms ease',
    fontVariantNumeric: 'tabular-nums',
  };
  const sizing: React.CSSProperties =
    size === 'field'
      ? { width: '100%', minHeight: 56, fontSize: 14, padding: '0 24px' }
      : size === 'lg'
      ? { minHeight: 56, fontSize: 14, padding: '0 32px' }
      : size === 'sm'
      ? { minHeight: 36, fontSize: 11, padding: '0 14px' }
      : { minHeight: 48, fontSize: 12, padding: '0 24px' };
  const variantStyle: React.CSSProperties =
    variant === 'primary'
      ? { background: RELAY_COLORS.signal, color: RELAY_COLORS.paper }
      : variant === 'critical'
      ? { background: RELAY_COLORS.critical, color: RELAY_COLORS.paper }
      : variant === 'outline'
      ? { background: 'transparent', color: RELAY_COLORS.ink, border: `1.5px solid ${RELAY_COLORS.ink}` }
      : { background: 'transparent', color: RELAY_COLORS.ink };
  if (rest.disabled) {
    Object.assign(variantStyle, { background: RELAY_COLORS.mist, color: RELAY_COLORS.steel });
  }
  return (
    <button {...rest} style={{ ...base, ...sizing, ...variantStyle, ...style }}>
      {iconLeft}
      <span>{children}</span>
      {iconRight}
    </button>
  );
}

export function Card({ children, padded = true, style, className }: { children: React.ReactNode; padded?: boolean; style?: React.CSSProperties; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: RELAY_COLORS.paper,
        border: `1px solid ${RELAY_COLORS.mist}`,
        borderRadius: 8,
        padding: padded ? 24 : 0,
        boxShadow: '0 1px 2px rgba(15, 20, 25, 0.04)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardInk({ children, padded = true, style }: { children: React.ReactNode; padded?: boolean; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: RELAY_COLORS.ink,
        border: `1px solid rgba(255,255,255,0.06)`,
        borderRadius: 8,
        padding: padded ? 24 : 0,
        color: RELAY_COLORS.paper,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
      <h3 style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2, color: RELAY_COLORS.steel, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{children}</h3>
      {right}
    </div>
  );
}

export function MetaText({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <span style={{ fontSize: 12, color: RELAY_COLORS.steel, fontWeight: 400, ...style }}>{children}</span>;
}

export function TabularNum({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <span style={{ fontVariantNumeric: 'tabular-nums', ...style }}>{children}</span>;
}

export function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 min ago';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function absoluteTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function RelayShell({ children, surface = 'paper' }: { children: React.ReactNode; surface?: 'paper' | 'ink' }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: surface === 'paper' ? RELAY_COLORS.paper : RELAY_COLORS.ink,
        color: surface === 'paper' ? RELAY_COLORS.ink : RELAY_COLORS.paper,
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        @keyframes relay-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes relay-pulse { 0% { opacity: 0.55; } 50% { opacity: 1; } 100% { opacity: 0.55; } }
        .relay-fade-in { animation: relay-fade-in 200ms ease-out; }
        .relay-row-accent { position: relative; }
        .relay-row-accent::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: ${RELAY_COLORS.signal}; animation: relay-fade-in 200ms ease-out; }
        .relay-stale-pulse { animation: relay-pulse 2.4s ease-in-out infinite; }
        button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.25);
          border-color: ${RELAY_COLORS.signal};
        }
        @media (prefers-reduced-motion: reduce) {
          .relay-fade-in, .relay-stale-pulse, .relay-row-accent::before { animation: none !important; }
        }
      `}</style>
      {children}
    </div>
  );
}

export function Input({ style, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      style={{
        background: RELAY_COLORS.paper,
        border: `1.5px solid ${RELAY_COLORS.mist}`,
        borderRadius: 4,
        padding: '12px 16px',
        fontFamily: 'Inter, sans-serif',
        fontSize: 16,
        fontWeight: 400,
        color: RELAY_COLORS.ink,
        minHeight: 48,
        width: '100%',
        ...style,
      }}
    />
  );
}

export function Select({ style, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      style={{
        background: RELAY_COLORS.paper,
        border: `1.5px solid ${RELAY_COLORS.mist}`,
        borderRadius: 4,
        padding: '12px 16px',
        fontFamily: 'Inter, sans-serif',
        fontSize: 16,
        fontWeight: 400,
        color: RELAY_COLORS.ink,
        minHeight: 48,
        width: '100%',
        appearance: 'none',
        ...style,
      }}
    >
      {children}
    </select>
  );
}

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} style={{ display: 'block', fontSize: 11, fontWeight: 600, color: RELAY_COLORS.steel, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
      {children}
    </label>
  );
}
