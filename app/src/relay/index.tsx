import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Inbox,
  MapPin,
  QrCode,
  Radio,
  Send,
  Smartphone,
  Wifi,
} from 'lucide-react';
import { SITES, TASKINGS, INCIDENT, CATEGORIES_DEFAULT } from './data';
import type { Surface, Category } from './types';
import {
  RELAY_COLORS,
  Wordmark,
  RelayShell,
  Card,
  CardInk,
  RelayButton,
  Input,
  Label,
  MetaText,
  TabularNum,
  SectionHeader,
} from './ui';
import { ReporterStatusSubmit, ReporterSitePicker, ReporterTaskingInbox } from './Reporter';
import { EOCBoard, type EOCTab } from './EOCBoard';

// Metadata kept for reference — the parent monorepo uses this to register the
// app under a subdomain. Standalone, the metadata is informational only.
export const definition = {
  id: 'relay',
  name: 'Relay',
  subtitle: 'Field-to-EOC Disaster Coordination',
  description:
    'Two-screen realtime supply tracker for crisis response — field reporters tap three pills, EOC controllers watch the tac board. QR or SMS in, no login, no install.',
  subdomain: 'relay',
  visibility: 'internal',
  icon: 'Radio',
  labels: ['demo'],
  sortOrder: 61,
} as const;

export function Component() {
  const [surface, setSurface] = useState<Surface>('home');
  const [reporterSite, setReporterSite] = useState<string>(SITES[0]!.id);
  const [onboarded, setOnboarded] = useState<boolean>(() => localStorage.getItem('relay.onboarded') === '1');

  function gotoReporter(siteId?: string) {
    if (siteId) setReporterSite(siteId);
    setSurface('reporter.submit');
  }

  // Subdomain-protocol routing used by the in-drawer "Preview reporter" buttons
  function handleOpenSubdomain(s: string) {
    if (s.startsWith('reporter:')) {
      const siteId = s.split(':')[1] || SITES[0]!.id;
      gotoReporter(siteId);
    }
  }

  if (surface === 'home') return <Landing onPick={setSurface} onboarded={onboarded} gotoReporter={gotoReporter} />;

  if (surface === 'reporter.submit')
    return (
      <RelayShell surface="paper">
        <BackToHome onBack={() => setSurface('home')} />
        <ReporterStatusSubmit
          siteId={reporterSite}
          onSwitch={(s) => setSurface(s === 'picker' ? 'reporter.picker' : 'reporter.tasking')}
        />
      </RelayShell>
    );

  if (surface === 'reporter.picker')
    return (
      <RelayShell surface="paper">
        <BackToHome onBack={() => setSurface('home')} />
        <ReporterSitePicker onPick={(id) => { setReporterSite(id); setSurface('reporter.submit'); }} onBack={() => setSurface('reporter.submit')} />
      </RelayShell>
    );

  if (surface === 'reporter.tasking')
    return (
      <RelayShell surface="paper">
        <BackToHome onBack={() => setSurface('home')} />
        <ReporterTaskingInbox
          tasking={TASKINGS[0]!}
          onAccept={() => {}}
          onDecline={() => setSurface('reporter.submit')}
          onResolve={() => setTimeout(() => setSurface('reporter.submit'), 1200)}
          onBack={() => setSurface('home')}
        />
      </RelayShell>
    );

  if (surface === 'eoc.onboarding')
    return (
      <RelayShell surface="paper">
        <BackToHome onBack={() => setSurface('home')} />
        <ControllerOnboarding onDone={() => { localStorage.setItem('relay.onboarded', '1'); setOnboarded(true); setSurface('eoc.board'); }} />
      </RelayShell>
    );

  if (surface === 'eoc.setup')
    return (
      <RelayShell surface="paper">
        <BackToHome onBack={() => setSurface('home')} />
        <IncidentSetup onDone={() => setSurface('eoc.board')} />
      </RelayShell>
    );

  // All EOC tabs (board/sites/handoff/audit/settings) share one shell.
  const tabFor: Record<string, EOCTab> = {
    'eoc.board': 'board',
    'eoc.sites': 'sites',
    'eoc.handoff': 'handoff',
    'eoc.audit': 'audit',
    'eoc.settings': 'settings',
  };
  const initialTab = tabFor[surface] ?? 'board';
  return (
    <>
      <BackToHomeInverse onBack={() => setSurface('home')} />
      <EOCBoard key={initialTab} initialTab={initialTab} onOpenSubdomain={handleOpenSubdomain} />
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Landing — the "this is a prototype, pick your role" entry point.
// This screen exists only because we're embedding both surfaces in a single
// SPA build for demo purposes. In production reporters arrive via QR and never
// see this; controllers arrive via a bookmarked URL on the EOC desktop.

function Landing({ onPick, onboarded, gotoReporter }: { onPick: (s: Surface) => void; onboarded: boolean; gotoReporter: (siteId?: string) => void }) {
  return (
    <RelayShell surface="paper">
      {/* Top bar */}
      <header style={{ borderBottom: `1px solid ${RELAY_COLORS.mist}`, padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Wordmark size="nav" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: RELAY_COLORS.steel }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: RELAY_COLORS.go }} className="relay-stale-pulse" />
            <TabularNum>{SITES.length}</TabularNum> sites reporting
          </span>
          <span>·</span>
          <span>{INCIDENT.ics}</span>
        </div>
      </header>

      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '48px 32px' }}>
        {/* Hero */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: RELAY_COLORS.steel, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Field-to-EOC disaster coordination</div>
          <h1 style={{ fontSize: 40, fontWeight: 600, lineHeight: 1.1, margin: '12px 0 16px', color: RELAY_COLORS.ink, maxWidth: 780, letterSpacing: '-0.01em' }}>
            A digital T-card board. Site × category × status. <span style={{ color: RELAY_COLORS.steel }}>Zero login. Zero keystrokes. The URL is the form.</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: RELAY_COLORS.ink, margin: 0, maxWidth: 720 }}>
            Field volunteers tap one of three pills — Stocked, Low, Out — at any supply site, on any borrowed phone, with no app to install. The EOC sees it appear instantly on a priority-ordered tac board: red first, action-needed cards larger, live ticker below the situation panel.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <RelayButton variant="primary" size="lg" iconLeft={<Smartphone size={16} strokeWidth={1.75} />} onClick={() => gotoReporter()}>
              Open as field reporter
            </RelayButton>
            <RelayButton variant="outline" size="lg" iconLeft={<Radio size={16} strokeWidth={1.75} />} onClick={() => onPick(onboarded ? 'eoc.board' : 'eoc.onboarding')}>
              Open EOC tac board
            </RelayButton>
          </div>
        </section>

        {/* Two-surface preview */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 48 }}>
          <Card>
            <SectionHeader right={<MetaText style={{ fontSize: 11 }}>5.1 / 5.2 / 5.3</MetaText>}>
              Reporter — Field
            </SectionHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Feature icon={<QrCode size={16} strokeWidth={1.75} />} title="QR or SMS short-link" body="Printed at the POD, taped to a folding table. No app install. No login. Ever." />
              <Feature icon={<CheckCircle size={16} strokeWidth={1.75} />} title="Three pills per category" body="Stocked / Low / Out. Tap one, see confirmation, walk on. ≤ 5 KB submission." />
              <Feature icon={<Wifi size={16} strokeWidth={1.75} />} title="Offline-first" body="IndexedDB queue. Submissions persist across browser close and battery death." />
            </div>
            <div style={{ marginTop: 18 }}>
              <RelayButton variant="primary" size="md" iconRight={<ArrowRight size={14} strokeWidth={1.75} />} onClick={() => gotoReporter()}>Open reporter</RelayButton>
            </div>
          </Card>
          <Card>
            <SectionHeader right={<MetaText style={{ fontSize: 11 }}>5.4 / 5.5 / 5.6</MetaText>}>
              Controller — EOC tac board
            </SectionHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Feature icon={<MapPin size={16} strokeWidth={1.75} />} title="Map first, list second" body="60/40 default split. Color-coded site dots, click for the drawer — never lose ticker visibility." />
              <Feature icon={<Inbox size={16} strokeWidth={1.75} />} title="Priority-ordered stack" body="Unacked tasking · OUT · LOW · stale · clean. Top three cards are larger. Action-needed first, not chronological." />
              <Feature icon={<Send size={16} strokeWidth={1.75} />} title="Tasking in four taps" body="One drawer. SMS round-trip. Runner accepts → en route → arrived → resolved. The loop is the schema." />
            </div>
            <div style={{ marginTop: 18 }}>
              <RelayButton variant="primary" size="md" iconRight={<ArrowRight size={14} strokeWidth={1.75} />} onClick={() => onPick(onboarded ? 'eoc.board' : 'eoc.onboarding')}>Open tac board</RelayButton>
            </div>
          </Card>
        </section>

        {/* The wedge */}
        <section style={{ marginBottom: 48 }}>
          <SectionHeader>The wedge</SectionHeader>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <WedgeCard kpi="< 5s" label="Time-to-first-tap" body="QR scan to submission. Three buttons. No login wall." />
            <WedgeCard kpi="≤ 5 KB" label="Submission payload" body="Loads on the only cell tower working at 11pm with 12% battery." />
            <WedgeCard kpi="0" label="Accounts for reporters" body="Identity is captured per-submission, not at the gate. Audit trail is the floor." />
            <WedgeCard kpi="ICS" label="Vocabulary throughout" body="POD, POC, Tasking, SitRep, Demob. The trojan horse for credibility." />
          </div>
        </section>

        {/* All surfaces */}
        <section style={{ marginBottom: 48 }}>
          <SectionHeader>All surfaces</SectionHeader>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <SurfacePill onClick={() => gotoReporter()} num="5.1" label="Reporter — Status Submit" />
            <SurfacePill onClick={() => onPick('reporter.picker')} num="5.2" label="Reporter — Site Picker" />
            <SurfacePill onClick={() => onPick('reporter.tasking')} num="5.3" label="Reporter — Tasking Inbox" />
            <SurfacePill onClick={() => onPick('eoc.board')} num="5.4" label="EOC — Board" />
            <SurfacePill onClick={() => onPick('eoc.board')} num="5.5" label="EOC — Site Drawer" hint="click any card on the board" />
            <SurfacePill onClick={() => onPick('eoc.board')} num="5.6" label="EOC — Tasking Compose" hint="drawer → Compose tasking" />
            <SurfacePill onClick={() => onPick('eoc.handoff')} num="5.7" label="EOC — Handoff Brief" />
            <SurfacePill onClick={() => onPick('eoc.setup')} num="5.8" label="EOC — Incident Setup" />
            <SurfacePill onClick={() => onPick('eoc.sites')} num="5.9" label="EOC — Sites Admin" />
            <SurfacePill onClick={() => onPick('eoc.audit')} num="5.10" label="EOC — Audit / Export" />
            <SurfacePill onClick={() => onPick('eoc.onboarding')} num="5.11" label="Onboarding — Controller" />
            <SurfacePill onClick={() => onPick('eoc.settings')} num="5.13" label="Settings — Incident" />
          </div>
        </section>

        {/* Differentiation strip */}
        <section style={{ marginBottom: 48 }}>
          <SectionHeader>What we don't do</SectionHeader>
          <CardInk>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
              <NoGo title="No SKU-level inventory" body="Site × category × status is the atomic unit. We will not chase Google Sheets into the granular weeds." />
              <NoGo title="No citizen-facing intake" body="We serve coordinators and volunteers, not the affected public. Revisit post-v1." />
              <NoGo title="No push-to-talk / voice" body="Zello does this. Radios exist. Voice is unstructured state; we are structured-state." />
              <NoGo title="No 'Activate Incident' button" body="A site can be reported before an incident formally exists. The incident is inferred." />
              <NoGo title="No persistent reporter accounts" body="Identity per-submission, in the audit trail. We will not chase Salamander credentialing." />
              <NoGo title="No AI-generated SitReps in v1" body="Translation yes. Generated narratives no — the credibility cost of one hallucinated casualty count is unrecoverable." />
            </div>
          </CardInk>
        </section>
      </main>

      <footer style={{ borderTop: `1px solid ${RELAY_COLORS.mist}`, padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: RELAY_COLORS.steel }}>
        <Wordmark size="footer" />
        <span>A sub-brand of Code/+/Trust · Field-to-EOC tac board · v0.1 demo</span>
      </footer>
    </RelayShell>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 12, alignItems: 'start' }}>
      <span style={{ color: RELAY_COLORS.signal, marginTop: 2 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: RELAY_COLORS.ink }}>{title}</div>
        <div style={{ fontSize: 13, color: RELAY_COLORS.steel, marginTop: 2, lineHeight: 1.5 }}>{body}</div>
      </div>
    </div>
  );
}

function WedgeCard({ kpi, label, body }: { kpi: string; label: string; body: string }) {
  return (
    <Card>
      <div style={{ fontSize: 32, fontWeight: 600, color: RELAY_COLORS.ink, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{kpi}</div>
      <div style={{ fontSize: 11, color: RELAY_COLORS.steel, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginTop: 8 }}>{label}</div>
      <div style={{ fontSize: 13, color: RELAY_COLORS.ink, marginTop: 10, lineHeight: 1.5 }}>{body}</div>
    </Card>
  );
}

function SurfacePill({ num, label, onClick, hint }: { num: string; label: string; onClick: () => void; hint?: string }) {
  return (
    <button onClick={onClick} style={{
      textAlign: 'left',
      padding: '14px 16px',
      background: RELAY_COLORS.paper,
      border: `1px solid ${RELAY_COLORS.mist}`,
      borderRadius: 8,
      cursor: 'pointer',
      fontFamily: 'inherit',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      transition: 'border-color 120ms ease',
    }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: RELAY_COLORS.signal, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}>§{num}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: RELAY_COLORS.ink }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: RELAY_COLORS.steel, marginTop: 2 }}>{hint}</div>}
      </div>
      <ArrowRight size={14} strokeWidth={1.75} color={RELAY_COLORS.steel} />
    </button>
  );
}

function NoGo({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: RELAY_COLORS.paper }}>{title}</div>
      <div style={{ fontSize: 13, color: 'rgba(250,250,247,0.7)', marginTop: 4, lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 5.8 — Incident Setup

function IncidentSetup({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState(INCIDENT.name);
  const [ics, setIcs] = useState(INCIDENT.ics);
  const today = new Date().toLocaleDateString('en-US', { dateStyle: 'long' } as any);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES_DEFAULT);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '18px 32px', borderBottom: `1px solid ${RELAY_COLORS.mist}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Wordmark size="nav" />
        <MetaText style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>5.8 · Incident setup</MetaText>
      </header>
      <main style={{ flex: 1, maxWidth: 640, width: '100%', margin: '0 auto', padding: '48px 32px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 4px', color: RELAY_COLORS.ink }}>Start watching</h1>
        <MetaText style={{ display: 'block', marginBottom: 24 }}>Lightweight scaffolding. No "Activate Incident" ceremony — the incident is already inferred from the first submission.</MetaText>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <Label htmlFor="iname">Incident name</Label>
              <Input id="iname" value={name} onChange={(e) => setName(e.target.value)} />
              <MetaText style={{ display: 'block', marginTop: 6 }}>Default: County — Date. You can rename later.</MetaText>
            </div>
            <div>
              <Label htmlFor="ics">ICS designation (optional)</Label>
              <Input id="ics" value={ics} onChange={(e) => setIcs(e.target.value)} placeholder="ICS-209-YYYY-MMDD" />
            </div>
            <div>
              <Label>Categories</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {CATEGORIES_DEFAULT.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategories((cs) => cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c])}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 4,
                      border: `1.5px solid ${categories.includes(c) ? RELAY_COLORS.signal : RELAY_COLORS.mist}`,
                      background: categories.includes(c) ? 'rgba(0,102,204,0.08)' : 'transparent',
                      color: RELAY_COLORS.ink,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                    }}
                  >{c}</button>
                ))}
              </div>
            </div>
            <div style={{ background: RELAY_COLORS.mist, padding: 12, borderRadius: 4, fontSize: 12, color: RELAY_COLORS.ink, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={14} strokeWidth={1.75} color={RELAY_COLORS.steel} />
              Incident clock starts on first submission · today, {today}
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <RelayButton variant="ghost" size="md" onClick={onDone}>Skip</RelayButton>
          <RelayButton variant="primary" size="md" iconRight={<ArrowRight size={14} strokeWidth={1.75} />} onClick={onDone}>Start watching</RelayButton>
        </div>
      </main>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 5.11 — Onboarding (Controller, first run)

function ControllerOnboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState(INCIDENT.name);
  const [sites, setSites] = useState<string[]>(['Estes Elementary', 'POD 3 — Cherrydale', 'Mauldin Rec Center']);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '18px 32px', borderBottom: `1px solid ${RELAY_COLORS.mist}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Wordmark size="nav" />
        <MetaText style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>5.11 · First run · Step {step} of 3</MetaText>
      </header>

      <main style={{ flex: 1, maxWidth: 720, width: '100%', margin: '0 auto', padding: '48px 32px' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[1, 2, 3].map((n) => (
            <span key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: step >= n ? RELAY_COLORS.signal : RELAY_COLORS.mist }} />
          ))}
        </div>

        {step === 1 && (
          <>
            <h1 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 8px' }}>Name your incident</h1>
            <MetaText style={{ display: 'block', marginBottom: 24, fontSize: 14 }}>You can change this anytime. The clock starts when the first submission lands.</MetaText>
            <Card>
              <Label htmlFor="oname">Incident name</Label>
              <Input id="oname" value={name} onChange={(e) => setName(e.target.value)} />
            </Card>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <RelayButton variant="primary" size="md" iconRight={<ArrowRight size={14} strokeWidth={1.75} />} onClick={() => setStep(2)}>Next</RelayButton>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 8px' }}>Add 1–3 sites</h1>
            <MetaText style={{ display: 'block', marginBottom: 24, fontSize: 14 }}>Paste a list or add by hand. You can add more later, or paste a CSV.</MetaText>
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sites.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8 }}>
                    <Input value={s} onChange={(e) => { const ns = [...sites]; ns[i] = e.target.value; setSites(ns); }} />
                    <button onClick={() => setSites(sites.filter((_, j) => j !== i))} style={{ background: 'transparent', border: `1px solid ${RELAY_COLORS.mist}`, color: RELAY_COLORS.steel, padding: '0 14px', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>Remove</button>
                  </div>
                ))}
                {sites.length < 5 && (
                  <button onClick={() => setSites([...sites, ''])} style={{ alignSelf: 'flex-start', background: 'transparent', border: `1.5px dashed ${RELAY_COLORS.mist}`, color: RELAY_COLORS.signal, padding: '10px 14px', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}>+ Add another site</button>
                )}
              </div>
            </Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <RelayButton variant="ghost" size="md" onClick={() => setStep(1)}>Back</RelayButton>
              <RelayButton variant="primary" size="md" iconRight={<ArrowRight size={14} strokeWidth={1.75} />} onClick={() => setStep(3)}>Next</RelayButton>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 8px' }}>Print or share QR codes</h1>
            <MetaText style={{ display: 'block', marginBottom: 24, fontSize: 14 }}>One QR per site. Tape them to folding tables; reporters scan with any phone.</MetaText>
            <Card>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {sites.filter(Boolean).map((s, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 12, border: `1px solid ${RELAY_COLORS.mist}`, borderRadius: 4 }}>
                    <FauxQRBlock seed={s} />
                    <div style={{ fontSize: 12, fontWeight: 600, color: RELAY_COLORS.ink, textAlign: 'center' }}>{s}</div>
                    <div style={{ fontSize: 10, color: RELAY_COLORS.steel, fontFamily: 'ui-monospace, monospace' }}>relay.ct/r/{slug(s)}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <RelayButton variant="outline" size="md" iconLeft={<QrCode size={14} strokeWidth={1.75} />}>Print 8.5×11 sheet</RelayButton>
                <RelayButton variant="ghost" size="md">Email to team</RelayButton>
              </div>
            </Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <RelayButton variant="ghost" size="md" onClick={() => setStep(2)}>Back</RelayButton>
              <RelayButton variant="primary" size="md" onClick={() => setStep(4)}>Done</RelayButton>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: RELAY_COLORS.go, fontWeight: 600, fontSize: 18 }}>
              <CheckCircle size={24} strokeWidth={1.75} /> Your board is live.
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: RELAY_COLORS.ink, marginTop: 16, maxWidth: 540 }}>
              Share this link with your team:
            </p>
            <Card style={{ marginTop: 8, maxWidth: 540 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ flex: 1, fontFamily: 'ui-monospace, monospace', fontSize: 13, color: RELAY_COLORS.ink, padding: '10px 12px', background: RELAY_COLORS.mist, borderRadius: 4 }}>relay.ct/eoc/{slug(name)}</span>
                <RelayButton variant="primary" size="sm">Copy</RelayButton>
              </div>
              <MetaText style={{ display: 'block', marginTop: 8 }}>The first submission starts the incident clock automatically.</MetaText>
            </Card>
            <div style={{ marginTop: 24 }}>
              <RelayButton variant="primary" size="lg" iconRight={<ArrowRight size={16} strokeWidth={1.75} />} onClick={onDone}>Open the board</RelayButton>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function FauxQRBlock({ seed }: { seed: string }) {
  // Same logic as in EOC drawer, smaller
  const grid: boolean[] = [];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  for (let i = 0; i < 81; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    grid.push((h >>> 16) % 2 === 0);
  }
  const finder = (x: number, y: number) => (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
  return (
    <div style={{ width: 96, height: 96, padding: 4, background: RELAY_COLORS.paper, border: `1px solid ${RELAY_COLORS.mist}`, borderRadius: 4 }}>
      <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 1 }}>
        {grid.map((on, i) => {
          const x = i % 9, y = Math.floor(i / 9);
          const fill = finder(x, y) ? RELAY_COLORS.ink : on ? RELAY_COLORS.ink : 'transparent';
          return <div key={i} style={{ background: fill }} />;
        })}
      </div>
    </div>
  );
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ────────────────────────────────────────────────────────────────────────────
// Shared: "back to demo home" — only shows in the prototype harness

function BackToHome({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 100,
        padding: '8px 12px',
        background: RELAY_COLORS.ink,
        color: RELAY_COLORS.paper,
        border: 'none',
        borderRadius: 4,
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
      aria-label="Back to demo home"
    >
      ← Demo home
    </button>
  );
}

function BackToHomeInverse({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 100,
        padding: '8px 12px',
        background: RELAY_COLORS.paper,
        color: RELAY_COLORS.ink,
        border: 'none',
        borderRadius: 4,
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
      aria-label="Back to demo home"
    >
      ← Demo home
    </button>
  );
}
