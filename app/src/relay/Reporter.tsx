import { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Camera,
  User,
  WifiOff,
  CheckCircle,
  X,
  HelpCircle,
  Search,
  Navigation,
  Inbox,
  ArrowRight,
  Truck,
  Hourglass,
} from 'lucide-react';
import { SITES } from './data';
import type { Category, Status, Tasking } from './types';
import {
  RELAY_COLORS,
  Wordmark,
  StatusBadge,
  StatusDot,
  RelayButton,
  Card,
  MetaText,
  TabularNum,
  Input,
  Label,
  relativeTime,
  statusColor,
  statusIcon,
} from './ui';

const PILLS: Status[] = ['Stocked', 'Low', 'Out'];

type Submitted = { category: Category; status: Status; at: string };

export function ReporterStatusSubmit({ siteId, onSwitch }: { siteId: string; onSwitch: (surface: 'picker' | 'tasking') => void }) {
  const site = useMemo(() => SITES.find((s) => s.id === siteId) ?? SITES[0]!, [siteId]);
  const [name, setName] = useState<string>(() => localStorage.getItem('relay.reporter.name') ?? '');
  const [callback, setCallback] = useState<string>(() => localStorage.getItem('relay.reporter.callback') ?? '');
  const [showIdentity, setShowIdentity] = useState(false);
  const [recent, setRecent] = useState<Submitted[]>([]);
  const [queued, setQueued] = useState(0);
  const [online, setOnline] = useState(true);
  const [explainerOpen, setExplainerOpen] = useState(false);

  useEffect(() => {
    if (name) localStorage.setItem('relay.reporter.name', name);
  }, [name]);
  useEffect(() => {
    if (callback) localStorage.setItem('relay.reporter.callback', callback);
  }, [callback]);

  function submit(category: Category, status: Status) {
    const at = new Date().toISOString();
    setRecent((r) => [{ category, status, at }, ...r].slice(0, 6));
    if (!online) setQueued((q) => q + 1);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ReporterChrome onWordmarkClick={() => onSwitch('picker')} />

      {/* Offline / queued banner */}
      {(!online || queued > 0) && (
        <div
          role="status"
          style={{
            background: !online ? RELAY_COLORS.ink : RELAY_COLORS.signal,
            color: RELAY_COLORS.paper,
            padding: '10px 24px',
            fontSize: 13,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {!online ? <WifiOff size={16} strokeWidth={1.75} /> : <Hourglass size={16} strokeWidth={1.75} />}
          <span>
            {!online ? 'Working offline — ' : ''}
            <TabularNum>{queued}</TabularNum> {queued === 1 ? 'submission' : 'submissions'} queued. Will send when online.
          </span>
        </div>
      )}

      <main style={{ flex: 1, padding: '32px 24px 24px', maxWidth: 560, width: '100%', margin: '0 auto' }}>
        {/* Site banner */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <MapPin size={14} strokeWidth={1.75} color={RELAY_COLORS.steel} />
            <MetaText>{site.sector}</MetaText>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.15, margin: 0, color: RELAY_COLORS.ink }}>{site.name}</h1>
          <button
            onClick={() => onSwitch('picker')}
            style={{ background: 'none', border: 'none', color: RELAY_COLORS.signal, fontSize: 13, fontWeight: 500, padding: 0, marginTop: 6, cursor: 'pointer' }}
          >
            Wrong site? Pick another →
          </button>
        </div>

        {/* Category rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {site.categories.map((cat) => (
            <CategoryRow
              key={cat}
              category={cat}
              current={site.state[cat]?.status}
              onTap={(status) => submit(cat, status)}
              recent={recent.find((r) => r.category === cat)}
            />
          ))}
        </div>

        {/* Recent submissions */}
        {recent.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <Label>Just sent</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recent.map((r, i) => (
                <div key={i} className="relay-fade-in" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: RELAY_COLORS.paper, border: `1px solid ${RELAY_COLORS.mist}`, borderRadius: 4, fontSize: 13 }}>
                  <CheckCircle size={14} strokeWidth={1.75} color={RELAY_COLORS.go} />
                  <span style={{ color: RELAY_COLORS.ink, fontWeight: 500 }}>{r.category}</span>
                  <span style={{ color: RELAY_COLORS.steel }}>—</span>
                  <span style={{ color: statusColor(r.status), fontWeight: 600, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.06em' }}>{r.status}</span>
                  <span style={{ marginLeft: 'auto', color: RELAY_COLORS.steel, fontSize: 12 }}>{relativeTime(r.at)}</span>
                  <span style={{ color: RELAY_COLORS.steel, fontSize: 12 }}>· {name ? `as ${name}` : 'as Guest'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Identity (optional, persisted) */}
        <div style={{ marginTop: 28 }}>
          {!showIdentity ? (
            <button
              onClick={() => setShowIdentity(true)}
              style={{ background: 'none', border: `1.5px dashed ${RELAY_COLORS.mist}`, borderRadius: 8, padding: '14px 16px', width: '100%', textAlign: 'left', cursor: 'pointer', color: RELAY_COLORS.steel, fontSize: 14, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <User size={16} strokeWidth={1.75} />
              {name ? <>I'm <span style={{ color: RELAY_COLORS.ink, fontWeight: 600 }}>{name}</span> — change?</> : <>Add my name (optional)</>}
            </button>
          ) : (
            <Card>
              <Label htmlFor="rname">Your name (optional, stays on this phone)</Label>
              <Input id="rname" value={name} onChange={(e) => setName(e.target.value)} placeholder="First name or initials" />
              <div style={{ height: 12 }} />
              <Label htmlFor="rphone">Callback number (optional)</Label>
              <Input id="rphone" value={callback} onChange={(e) => setCallback(e.target.value)} placeholder="864-555-0123" inputMode="tel" />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <RelayButton variant="ghost" size="sm" onClick={() => setShowIdentity(false)}>Done</RelayButton>
              </div>
            </Card>
          )}
        </div>

        {/* Auxiliary actions */}
        <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button style={auxBtnStyle}>
            <Camera size={14} strokeWidth={1.75} /> Attach photo
          </button>
          <button style={auxBtnStyle} onClick={() => setOnline((v) => !v)}>
            <WifiOff size={14} strokeWidth={1.75} /> {online ? 'Simulate offline' : 'Back online'}
          </button>
        </div>
      </main>

      <footer style={{ padding: '16px 24px', borderTop: `1px solid ${RELAY_COLORS.mist}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: RELAY_COLORS.steel }}>
        <button onClick={() => onSwitch('picker')} style={footerLinkStyle}>Wrong site?</button>
        <button onClick={() => setExplainerOpen(true)} style={footerLinkStyle}>
          <HelpCircle size={12} strokeWidth={1.75} /> What is this?
        </button>
        <button onClick={() => onSwitch('tasking')} style={footerLinkStyle}>My taskings</button>
      </footer>

      {explainerOpen && (
        <Modal onClose={() => setExplainerOpen(false)}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 12px', color: RELAY_COLORS.ink }}>What is this?</h2>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: RELAY_COLORS.ink, margin: 0 }}>
            Relay is how the EOC sees what's happening at supply sites in real time. Tap a pill to say whether a category is stocked, low, or out at this site. No account. Nothing to install. The EOC sees it instantly.
          </p>
          <div style={{ marginTop: 16 }}>
            <RelayButton variant="primary" size="md" onClick={() => setExplainerOpen(false)}>Got it</RelayButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

const auxBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 12px',
  background: 'transparent',
  border: `1px solid ${RELAY_COLORS.mist}`,
  borderRadius: 4,
  color: RELAY_COLORS.steel,
  fontSize: 12,
  fontWeight: 500,
  fontFamily: 'inherit',
  cursor: 'pointer',
};

const footerLinkStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: RELAY_COLORS.steel,
  fontSize: 12,
  fontFamily: 'inherit',
  cursor: 'pointer',
  padding: 0,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
};

function CategoryRow({ category, current, onTap, recent }: { category: Category; current?: Status; onTap: (s: Status) => void; recent?: Submitted }) {
  const [flashed, setFlashed] = useState<Status | null>(null);
  function tap(s: Status) {
    setFlashed(s);
    onTap(s);
    setTimeout(() => setFlashed(null), 400);
  }
  return (
    <div style={{ background: RELAY_COLORS.paper, border: `1px solid ${RELAY_COLORS.mist}`, borderRadius: 8, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {current && <StatusDot status={current} />}
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: RELAY_COLORS.ink }}>{category}</span>
        </div>
        <MetaText style={{ fontSize: 11 }}>
          {recent ? <>just sent</> : current ? <>now: {current}</> : <>no data</>}
        </MetaText>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {PILLS.map((s) => (
          <button
            key={s}
            onClick={() => tap(s)}
            aria-label={`Mark ${category} ${s}`}
            style={{
              minHeight: 56,
              borderRadius: 8,
              border: `1.5px solid ${statusColor(s)}`,
              background: flashed === s || recent?.status === s ? statusColor(s) : 'transparent',
              color: flashed === s || recent?.status === s ? RELAY_COLORS.paper : statusColor(s),
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontFamily: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'background-color 120ms ease, color 120ms ease',
            }}
          >
            {statusIcon(s, 16)} {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReporterSitePicker({ onPick, onBack }: { onPick: (siteId: string) => void; onBack: () => void }) {
  const [q, setQ] = useState('');
  const filtered = SITES.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()) || s.sector.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ReporterChrome onWordmarkClick={onBack} />
      <main style={{ flex: 1, padding: '32px 24px 24px', maxWidth: 560, width: '100%', margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0, color: RELAY_COLORS.ink }}>Pick your site</h1>
        <MetaText style={{ marginTop: 6, display: 'block', fontSize: 13 }}>Showing the 10 nearest active sites.</MetaText>

        <div style={{ position: 'relative', marginTop: 20 }}>
          <Search size={16} strokeWidth={1.75} color={RELAY_COLORS.steel} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by site or sector" style={{ paddingLeft: 40 }} />
        </div>

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => onPick(s.id)}
              style={{ textAlign: 'left', background: RELAY_COLORS.paper, border: `1px solid ${RELAY_COLORS.mist}`, borderRadius: 8, padding: '14px 16px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <Navigation size={16} strokeWidth={1.75} color={RELAY_COLORS.steel} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: RELAY_COLORS.ink }}>{s.name}</div>
                <div style={{ fontSize: 12, color: RELAY_COLORS.steel, marginTop: 2 }}>{s.sector} · {s.address}</div>
              </div>
              <ArrowRight size={16} strokeWidth={1.75} color={RELAY_COLORS.steel} />
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: RELAY_COLORS.steel, fontSize: 14 }}>
              No active sites near you. <button style={{ background: 'none', border: 'none', color: RELAY_COLORS.signal, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Request to add one?</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export function ReporterTaskingInbox({ tasking, onAccept, onDecline, onResolve, onBack }: { tasking: Tasking; onAccept: () => void; onDecline: () => void; onResolve: () => void; onBack: () => void }) {
  const site = SITES.find((s) => s.id === tasking.siteId);
  const [stage, setStage] = useState<'pending' | 'enRoute' | 'arrived' | 'resolved'>('pending');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ReporterChrome onWordmarkClick={onBack} />
      <main style={{ flex: 1, padding: '32px 24px 24px', maxWidth: 560, width: '100%', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: RELAY_COLORS.ink, color: RELAY_COLORS.paper, borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <Inbox size={12} strokeWidth={1.75} /> Tasking · {tasking.eta}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: '12px 0 6px', color: RELAY_COLORS.ink }}>
          Resupply <span style={{ color: RELAY_COLORS.critical }}>{tasking.category}</span> at {site?.name}
        </h1>
        <MetaText style={{ display: 'block', fontSize: 13 }}>Dispatched by EOC {relativeTime(tasking.createdAt)}. ETA expectation: {tasking.eta}.</MetaText>

        <Card style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <RowKV k="Site" v={site?.name ?? ''} />
            <RowKV k="Address" v={site?.address ?? ''} />
            <RowKV k="POC" v={site?.poc ? `${site.poc.name} · ${site.poc.phone}` : '—'} />
            <RowKV k="Category" v={<StatusBadge status="Out" />} />
          </div>
        </Card>

        {stage === 'pending' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
            <RelayButton variant="primary" size="field" iconLeft={<Truck size={16} strokeWidth={1.75} />} onClick={() => { setStage('enRoute'); onAccept(); }}>Accept</RelayButton>
            <RelayButton variant="outline" size="field" iconLeft={<X size={16} strokeWidth={1.75} />} onClick={onDecline}>Decline</RelayButton>
          </div>
        )}
        {stage === 'enRoute' && (
          <RelayButton variant="primary" size="field" style={{ marginTop: 20 }} onClick={() => setStage('arrived')}>I've arrived</RelayButton>
        )}
        {stage === 'arrived' && (
          <div style={{ marginTop: 20 }}>
            <MetaText style={{ display: 'block', marginBottom: 8 }}>Update the status now you're on site:</MetaText>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {PILLS.map((s) => (
                <button key={s} onClick={() => { setStage('resolved'); onResolve(); }} style={{ minHeight: 56, borderRadius: 8, border: `1.5px solid ${statusColor(s)}`, background: 'transparent', color: statusColor(s), fontWeight: 600, fontSize: 14, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {statusIcon(s, 16)} {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {stage === 'resolved' && (
          <Card style={{ marginTop: 20, background: RELAY_COLORS.ink, color: RELAY_COLORS.paper, border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle size={20} strokeWidth={1.75} color={RELAY_COLORS.go} />
              <strong style={{ fontWeight: 600 }}>Logged.</strong>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>EOC has been notified.</span>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

function RowKV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 12, alignItems: 'baseline' }}>
      <div style={{ fontSize: 11, color: RELAY_COLORS.steel, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em' }}>{k}</div>
      <div style={{ fontSize: 14, color: RELAY_COLORS.ink, fontWeight: 500 }}>{v}</div>
    </div>
  );
}

function ReporterChrome({ onWordmarkClick }: { onWordmarkClick: () => void }) {
  return (
    <header style={{ padding: '14px 24px', borderBottom: `1px solid ${RELAY_COLORS.mist}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: RELAY_COLORS.paper }}>
      <button onClick={onWordmarkClick} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} aria-label="Relay home">
        <Wordmark size="nav" />
      </button>
      <MetaText style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Field reporter</MetaText>
    </header>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 20, 25, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 50, animation: 'relay-fade-in 150ms ease-out' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: RELAY_COLORS.paper, borderRadius: 8, padding: 24, maxWidth: 440, width: '100%' }}>{children}</div>
    </div>
  );
}

export { ReporterChrome };
