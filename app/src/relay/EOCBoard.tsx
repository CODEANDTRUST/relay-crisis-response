import { useMemo, useState, useEffect, useRef } from 'react';
// Leaflet is loaded dynamically inside BoardMap's effect — importing it at
// module top would access `window` during SSR/Vike pre-render and crash the
// build. Same reason `leaflet/dist/leaflet.css` is imported via a runtime
// link element below.
import type * as LeafletType from 'leaflet';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  MapPin,
  Pencil,
  Phone,
  Plus,
  QrCode,
  Radio,
  RefreshCw,
  Search,
  Send,
  Truck,
  X,
  ChevronRight,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { SITES, TASKINGS, TICKER, INCIDENT, CATEGORIES_DEFAULT, MAP_CENTER, FLOOD_ZONES, ROAD_CLOSURES } from './data';
import type { Site, Status, Category, Tasking, TickerEvent } from './types';
import {
  RELAY_COLORS,
  StatusBadge,
  StatusDot,
  RelayButton,
  Card,
  MetaText,
  TabularNum,
  Input,
  Select,
  Label,
  relativeTime,
  absoluteTime,
  statusColor,
  statusIcon,
} from './ui';

type CardEntry = {
  site: Site;
  topStatus: Status;
  priority: number;
  reason: string;
  category?: Category;
  tasking?: Tasking;
  lastChangeAt: string;
};

function priorityRank(c: CardEntry): number {
  // Lower = higher priority
  return c.priority;
}

function siteWorstStatus(site: Site): Status {
  let worst: Status = 'Stocked';
  for (const cat of site.categories) {
    const s = site.state[cat]?.status;
    if (s === 'Out') return 'Out';
    if (s === 'Low') worst = 'Low';
  }
  return worst;
}

function siteCounts(site: Site) {
  let out = 0, low = 0, stocked = 0;
  for (const cat of site.categories) {
    const s = site.state[cat]?.status;
    if (s === 'Out') out++;
    else if (s === 'Low') low++;
    else stocked++;
  }
  return { out, low, stocked };
}

function buildCards(sites: Site[], taskings: Tasking[]): CardEntry[] {
  const now = Date.now();
  const STALE_MIN = INCIDENT.staleThresholdMins;
  const out: CardEntry[] = [];
  for (const site of sites) {
    const worst = siteWorstStatus(site);
    const counts = siteCounts(site);
    const tasking = taskings.find((t) => t.siteId === site.id && t.state !== 'resolved' && t.state !== 'recalled');
    const lastReportAt = Math.max(0, ...site.categories.map((c) => new Date(site.state[c]?.at ?? 0).getTime()));
    const stale = (now - lastReportAt) / 60_000 > STALE_MIN;
    let priority = 999;
    let reason = '';
    if (tasking?.state === 'unack') {
      priority = 1;
      reason = `Unacknowledged tasking — ${tasking.runner}`;
    } else if (worst === 'Out') {
      priority = 2;
      reason = `${counts.out} ${counts.out === 1 ? 'category' : 'categories'} OUT`;
    } else if (worst === 'Low') {
      priority = 3;
      reason = `${counts.low} ${counts.low === 1 ? 'category' : 'categories'} LOW`;
    } else if (stale) {
      priority = 4;
      reason = `No report in ${Math.round((now - lastReportAt) / 60_000 / 60)}h`;
    } else {
      priority = 5;
      reason = 'All stocked';
    }
    out.push({
      site,
      topStatus: worst,
      priority,
      reason,
      tasking,
      lastChangeAt: new Date(lastReportAt).toISOString(),
    });
  }
  return out.sort((a, b) => priorityRank(a) - priorityRank(b));
}

export type EOCTab = 'board' | 'sites' | 'handoff' | 'audit' | 'settings';

export function EOCBoard({ onOpenSubdomain, initialTab = 'board' }: { onOpenSubdomain: (s: string) => void; initialTab?: EOCTab }) {
  const [tab, setTab] = useState<EOCTab>(initialTab);
  const [drawerSite, setDrawerSite] = useState<string | null>(null);
  const [tasking, setTasking] = useState<{ siteId: string; category?: Category } | null>(null);
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [filterSector, setFilterSector] = useState<string | 'all'>('all');
  const [search, setSearch] = useState('');
  const [syncAgo, setSyncAgo] = useState(2);
  const [showStaleSync, setShowStaleSync] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSyncAgo((s) => Math.min(s + 1, 60)), 1000);
    return () => clearInterval(t);
  }, []);

  const filteredSites = useMemo(() => {
    return SITES.filter((s) => {
      if (filterSector !== 'all' && s.sector !== filterSector) return false;
      if (search && !(s.name.toLowerCase().includes(search.toLowerCase()) || s.address.toLowerCase().includes(search.toLowerCase()))) return false;
      if (filterStatus !== 'all') {
        const worst = siteWorstStatus(s);
        if (worst !== filterStatus) return false;
      }
      if (filterCategory !== 'all') {
        if (!s.categories.includes(filterCategory)) return false;
      }
      return true;
    });
  }, [filterStatus, filterCategory, filterSector, search]);

  const cards = useMemo(() => buildCards(filteredSites, TASKINGS), [filteredSites]);
  const allSiteCounts = useMemo(() => {
    let out = 0, low = 0, stocked = 0;
    for (const s of SITES) {
      const c = siteCounts(s);
      if (c.out > 0) out++;
      else if (c.low > 0) low++;
      else stocked++;
    }
    return { out, low, stocked };
  }, []);

  const activeDrawerSite = drawerSite ? SITES.find((s) => s.id === drawerSite) : null;

  return (
    <div style={{ minHeight: '100vh', background: RELAY_COLORS.ink, color: RELAY_COLORS.paper, fontFamily: 'Inter, system-ui, sans-serif', fontVariantNumeric: 'tabular-nums', display: 'flex', flexDirection: 'column' }}>
      <EOCTopBar tab={tab} onTab={setTab} syncAgo={syncAgo} onResync={() => { setSyncAgo(0); setShowStaleSync(false); }} stale={syncAgo > 30} />
      <ConnectionBanner syncAgo={syncAgo} dismissed={!showStaleSync && syncAgo < 30} onShow={() => setShowStaleSync(true)} />
      {tab === 'board' && (
        <BoardSurface
          cards={cards}
          allSiteCounts={allSiteCounts}
          onOpenSite={setDrawerSite}
          onCompose={(siteId, category) => { setDrawerSite(siteId); setTasking({ siteId, category }); }}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterSector={filterSector}
          setFilterSector={setFilterSector}
          search={search}
          setSearch={setSearch}
        />
      )}
      {tab === 'sites' && <SitesAdmin onPreviewReporter={(siteId) => onOpenSubdomain(`reporter:${siteId}`)} />}
      {tab === 'handoff' && <HandoffBrief cards={cards} allSiteCounts={allSiteCounts} />}
      {tab === 'audit' && <AuditExport />}
      {tab === 'settings' && <IncidentSettings />}

      {activeDrawerSite && (
        <SiteDrawer
          site={activeDrawerSite}
          tasking={TASKINGS.find((t) => t.siteId === activeDrawerSite.id) ?? null}
          onClose={() => { setDrawerSite(null); setTasking(null); }}
          onCompose={(category) => setTasking({ siteId: activeDrawerSite.id, category })}
          onPreviewReporter={() => onOpenSubdomain(`reporter:${activeDrawerSite.id}`)}
        />
      )}
      {tasking && activeDrawerSite && (
        <TaskingCompose site={activeDrawerSite} initialCategory={tasking.category} onClose={() => setTasking(null)} />
      )}
    </div>
  );
}

function EOCTopBar({ tab, onTab, syncAgo, onResync, stale }: { tab: string; onTab: (t: any) => void; syncAgo: number; onResync: () => void; stale: boolean }) {
  const tabs: Array<{ id: any; label: string }> = [
    { id: 'board', label: 'Board' },
    { id: 'sites', label: 'Sites' },
    { id: 'handoff', label: 'Handoff' },
    { id: 'audit', label: 'Audit' },
    { id: 'settings', label: 'Settings' },
  ];
  return (
    <header style={{ height: 56, background: RELAY_COLORS.ink, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 24, flexShrink: 0 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 6, height: 6, background: RELAY_COLORS.signal, display: 'block' }} />
        <span style={{ fontSize: 18, fontWeight: 600, color: RELAY_COLORS.paper, letterSpacing: '-0.01em' }}>Relay</span>
      </span>
      <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)' }} />
      <nav style={{ display: 'flex', gap: 4 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onTab(t.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: tab === t.id ? RELAY_COLORS.paper : 'rgba(250,250,247,0.6)',
              padding: '8px 14px',
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'inherit',
              position: 'relative',
            }}
          >
            {t.label}
            {tab === t.id && <span style={{ position: 'absolute', left: 14, right: 14, bottom: -16, height: 2, background: RELAY_COLORS.signal }} />}
          </button>
        ))}
      </nav>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onResync} title="Resync" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: stale ? RELAY_COLORS.critical : 'rgba(250,250,247,0.7)', padding: '6px 10px', borderRadius: 4, fontFamily: 'inherit', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer' }}>
          {stale ? <WifiOff size={12} strokeWidth={1.75} /> : <Wifi size={12} strokeWidth={1.75} />}
          Last sync <TabularNum>{syncAgo}s</TabularNum> ago
          <RefreshCw size={12} strokeWidth={1.75} />
        </button>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(250,250,247,0.7)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: RELAY_COLORS.go }} className="relay-stale-pulse" />
          {INCIDENT.controller}
        </span>
      </div>
    </header>
  );
}

function ConnectionBanner({ syncAgo, dismissed, onShow }: { syncAgo: number; dismissed: boolean; onShow: () => void }) {
  if (syncAgo < 30 || dismissed) return null;
  return (
    <div role="status" style={{ background: RELAY_COLORS.critical, color: RELAY_COLORS.paper, padding: '8px 24px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      <AlertOctagon size={14} strokeWidth={1.75} />
      Last sync {syncAgo}s ago — feed may be stale. Retrying.
      <button onClick={onShow} style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid rgba(255,255,255,0.35)', color: 'inherit', padding: '4px 10px', borderRadius: 4, fontFamily: 'inherit', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Dismiss</button>
    </div>
  );
}

function BoardSurface(props: {
  cards: CardEntry[];
  allSiteCounts: { out: number; low: number; stocked: number };
  onOpenSite: (id: string) => void;
  onCompose: (siteId: string, category?: Category) => void;
  filterStatus: Status | 'all';
  setFilterStatus: (s: Status | 'all') => void;
  filterCategory: Category | 'all';
  setFilterCategory: (c: Category | 'all') => void;
  filterSector: string | 'all';
  setFilterSector: (s: string | 'all') => void;
  search: string;
  setSearch: (s: string) => void;
}) {
  const sectors = Array.from(new Set(SITES.map((s) => s.sector))).sort();
  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 0, overflow: 'hidden' }}>
      {/* Map pane */}
      <div style={{ position: 'relative', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
        {/* Filter chips */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Filter size={14} strokeWidth={1.75} color="rgba(250,250,247,0.55)" />
          <FilterChip label="All sites" active={props.filterStatus === 'all'} onClick={() => props.setFilterStatus('all')} />
          <FilterChip label="Out" active={props.filterStatus === 'Out'} onClick={() => props.setFilterStatus('Out')} color={RELAY_COLORS.critical} />
          <FilterChip label="Low" active={props.filterStatus === 'Low'} onClick={() => props.setFilterStatus('Low')} color={RELAY_COLORS.watch} />
          <FilterChip label="Stocked" active={props.filterStatus === 'Stocked'} onClick={() => props.setFilterStatus('Stocked')} color={RELAY_COLORS.go} />
          <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />
          <select value={props.filterCategory} onChange={(e) => props.setFilterCategory(e.target.value as any)} style={chipSelectStyle}>
            <option value="all">All categories</option>
            {CATEGORIES_DEFAULT.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={props.filterSector} onChange={(e) => props.setFilterSector(e.target.value as any)} style={chipSelectStyle}>
            <option value="all">All sectors</option>
            {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <Search size={14} strokeWidth={1.75} color="rgba(250,250,247,0.55)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input value={props.search} onChange={(e) => props.setSearch(e.target.value)} placeholder="Search site or reporter" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, padding: '6px 10px 6px 30px', color: RELAY_COLORS.paper, fontSize: 12, fontFamily: 'inherit', width: 200 }} />
          </div>
        </div>

        <BoardMap cards={props.cards} onOpenSite={props.onOpenSite} />
      </div>

      {/* Right pane: situation + stack */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, background: RELAY_COLORS.ink }}>
        <SituationPanel allSiteCounts={props.allSiteCounts} />
        <TickerStrip events={TICKER} onOpenSite={props.onOpenSite} />
        <CardStack cards={props.cards} onOpenSite={props.onOpenSite} onCompose={props.onCompose} />
      </div>
    </div>
  );
}

const chipSelectStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: RELAY_COLORS.paper,
  borderRadius: 4,
  padding: '6px 10px',
  fontFamily: 'inherit',
  fontSize: 12,
  appearance: 'none',
};

function FilterChip({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 10px',
      borderRadius: 4,
      border: `1px solid ${active ? (color ?? RELAY_COLORS.signal) : 'rgba(255,255,255,0.12)'}`,
      background: active ? (color ? `${color}22` : 'rgba(0,102,204,0.18)') : 'transparent',
      color: active ? RELAY_COLORS.paper : 'rgba(250,250,247,0.7)',
      fontFamily: 'inherit',
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      cursor: 'pointer',
    }}>
      {color && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />}
      {label}
    </button>
  );
}

function BoardMap({ cards, onOpenSite }: { cards: CardEntry[]; onOpenSite: (id: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletType.Map | null>(null);
  const markersRef = useRef<Record<string, LeafletType.Marker>>({});
  const floodLayerRef = useRef<LeafletType.LayerGroup | null>(null);
  const closuresLayerRef = useRef<LeafletType.LayerGroup | null>(null);
  const leafletRef = useRef<typeof LeafletType | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);

  const [showFloods, setShowFloods] = useState(true);
  const [showClosures, setShowClosures] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  // Initialize the map once — Leaflet and its CSS load lazily so SSR/prerender
  // never touches `window`.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Inject the Leaflet CSS via a <link> (importing it would also pull at
      // module-load and confuse the Vike pre-render step).
      const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      if (!document.querySelector(`link[data-relay-leaflet]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = LEAFLET_CSS;
        link.setAttribute('data-relay-leaflet', '1');
        document.head.appendChild(link);
      }

      const mod = await import('leaflet');
      if (cancelled) return;
      const L = mod.default ?? (mod as unknown as typeof LeafletType);
      leafletRef.current = L;

      if (!containerRef.current || mapRef.current) {
        setLeafletReady(true);
        return;
      }
      const map = L.map(containerRef.current, {
        center: [MAP_CENTER.lat, MAP_CENTER.lng],
        zoom: MAP_CENTER.zoom,
        zoomControl: false,
        attributionControl: true,
      });
      L.control.zoom({ position: 'topright' }).addTo(map);

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
        },
      ).addTo(map);

      const labelsLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 0.85 },
      ).addTo(map);
      (map as LeafletType.Map & { __relayLabels?: LeafletType.TileLayer }).__relayLabels = labelsLayer;

      floodLayerRef.current = L.layerGroup().addTo(map);
      closuresLayerRef.current = L.layerGroup().addTo(map);

      mapRef.current = map;
      setLeafletReady(true);
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      floodLayerRef.current = null;
      closuresLayerRef.current = null;
    };
  }, []);

  // Flood overlays
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = floodLayerRef.current;
    if (!L || !map || !layer) return;
    layer.clearLayers();
    if (!showFloods) return;
    for (const zone of FLOOD_ZONES) {
      const color = zone.severity === 'major' ? RELAY_COLORS.critical : zone.severity === 'moderate' ? RELAY_COLORS.watch : RELAY_COLORS.signal;
      const fillOpacity = zone.severity === 'major' ? 0.45 : zone.severity === 'moderate' ? 0.35 : 0.25;
      const polygon = L.polygon(zone.ring, {
        color,
        weight: 1.5,
        opacity: 0.9,
        fillColor: color,
        fillOpacity,
        interactive: true,
      });
      const sev = zone.severity.toUpperCase();
      polygon.bindTooltip(
        `<div style="font-family:Inter,sans-serif;font-size:11px;line-height:1.45;max-width:240px"><div style="font-weight:600;color:${color};text-transform:uppercase;letter-spacing:0.06em;font-size:10px;margin-bottom:3px">${sev} flooding</div><div style="font-weight:600;color:${RELAY_COLORS.ink};font-size:12px">${zone.label}</div>${zone.note ? `<div style="color:${RELAY_COLORS.steel};margin-top:4px">${zone.note}</div>` : ''}</div>`,
        { sticky: true, direction: 'top', opacity: 1, className: 'relay-tooltip' },
      );
      polygon.addTo(layer);
    }
  }, [showFloods, leafletReady]);

  // Road closures
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = closuresLayerRef.current;
    if (!L || !map || !layer) return;
    layer.clearLayers();
    if (!showClosures) return;
    for (const rc of ROAD_CLOSURES) {
      const color = rc.status === 'closed' ? RELAY_COLORS.critical : RELAY_COLORS.watch;
      L.polyline(rc.line, { color: 'rgba(15,20,25,0.85)', weight: 8, opacity: 0.9 }).addTo(layer);
      L.polyline(rc.line, {
        color,
        weight: 4,
        opacity: 1,
        dashArray: rc.status === 'closed' ? '8 6' : '2 6',
        lineCap: 'round',
      })
        .bindTooltip(
          `<div style="font-family:Inter,sans-serif;font-size:11px"><div style="font-weight:600;color:${color};text-transform:uppercase;letter-spacing:0.06em;font-size:10px">${rc.status === 'closed' ? 'Road closed' : 'Caution'}</div><div style="color:${RELAY_COLORS.ink};margin-top:2px">${rc.label}</div></div>`,
          { sticky: true, direction: 'top', opacity: 1, className: 'relay-tooltip' },
        )
        .addTo(layer);
    }
  }, [showClosures, leafletReady]);

  // Labels reference toggle
  useEffect(() => {
    const map = mapRef.current as (LeafletType.Map & { __relayLabels?: LeafletType.TileLayer }) | null;
    if (!map || !map.__relayLabels) return;
    if (showLabels) map.__relayLabels.addTo(map);
    else map.__relayLabels.remove();
  }, [showLabels, leafletReady]);

  // Rebuild markers whenever cards change
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    for (const id of Object.keys(markersRef.current)) {
      markersRef.current[id]?.remove();
    }
    markersRef.current = {};

    for (const c of cards) {
      const color = statusColor(c.topStatus);
      const isCritical = c.priority <= 2;
      const sizePx = isCritical ? 18 : 14;
      const ringPx = isCritical ? 6 : 3;
      const html = `
        <div class="relay-marker ${isCritical ? 'relay-stale-pulse' : ''}" style="display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer">
          <span style="width:${sizePx}px;height:${sizePx}px;border-radius:50%;background:${color};box-shadow:0 0 0 ${ringPx}px ${color}40, 0 0 0 ${ringPx + 2}px rgba(15,20,25,0.6);display:block"></span>
          <span style="font-size:10px;color:${RELAY_COLORS.paper};font-weight:600;background:rgba(15,20,25,0.85);padding:2px 6px;border-radius:2px;white-space:nowrap;letter-spacing:0.02em;font-family:Inter,sans-serif">${c.site.name}</span>
        </div>`;
      const icon = L.divIcon({
        html,
        className: 'relay-marker-wrap',
        iconSize: [120, 32],
        iconAnchor: [60, 16],
      });
      const marker = L.marker([c.site.lat, c.site.lng], { icon, riseOnHover: true });
      marker.on('click', () => onOpenSite(c.site.id));
      marker.addTo(map);
      markersRef.current[c.site.id] = marker;
    }
  }, [cards, onOpenSite, leafletReady]);

  const floodCount = FLOOD_ZONES.length;
  const majorCount = FLOOD_ZONES.filter((z) => z.severity === 'major').length;
  const closedCount = ROAD_CLOSURES.filter((r) => r.status === 'closed').length;

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: RELAY_COLORS.ink }}>
      <style>{`
        .leaflet-container { background: ${RELAY_COLORS.ink}; font-family: Inter, sans-serif; }
        .leaflet-control-attribution { background: rgba(15,20,25,0.75) !important; color: rgba(250,250,247,0.55) !important; font-size: 10px !important; padding: 2px 6px !important; }
        .leaflet-control-attribution a { color: rgba(250,250,247,0.75) !important; }
        .leaflet-control-zoom a { background: rgba(15,20,25,0.85) !important; color: ${RELAY_COLORS.paper} !important; border: 1px solid rgba(255,255,255,0.12) !important; }
        .leaflet-control-zoom a:hover { background: rgba(0,102,204,0.6) !important; }
        .relay-marker-wrap { background: transparent !important; border: none !important; }
        .leaflet-tooltip.relay-tooltip { background: ${RELAY_COLORS.paper} !important; color: ${RELAY_COLORS.ink} !important; border: 1px solid ${RELAY_COLORS.mist} !important; border-radius: 4px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.25) !important; padding: 8px 10px !important; }
        .leaflet-tooltip.relay-tooltip:before { display: none !important; }
      `}</style>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Map title */}
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 400, fontSize: 10, color: 'rgba(250,250,247,0.65)', background: 'rgba(15,20,25,0.8)', padding: '6px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
        Sarasota County, FL · {cards.length} sites
      </div>

      {/* Overlay toggles */}
      <div style={{ position: 'absolute', top: 12, right: 60, zIndex: 400, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        <OverlayToggle
          active={showFloods}
          color={RELAY_COLORS.critical}
          label="Flood zones"
          count={`${majorCount} major · ${floodCount} total`}
          onToggle={() => setShowFloods((v) => !v)}
        />
        <OverlayToggle
          active={showClosures}
          color={RELAY_COLORS.watch}
          label="Road closures"
          count={`${closedCount} closed · ${ROAD_CLOSURES.length - closedCount} caution`}
          onToggle={() => setShowClosures((v) => !v)}
        />
        <OverlayToggle
          active={showLabels}
          color={RELAY_COLORS.signal}
          label="Street labels"
          count="Esri reference layer"
          onToggle={() => setShowLabels((v) => !v)}
        />
      </div>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 400, fontSize: 10, color: 'rgba(250,250,247,0.85)', display: 'flex', flexDirection: 'column', gap: 6, background: 'rgba(15,20,25,0.85)', padding: '8px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, color: 'rgba(250,250,247,0.55)' }}>Sites</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><StatusDot status="Out" size={8} /> Out</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><StatusDot status="Low" size={8} /> Low</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><StatusDot status="Stocked" size={8} /> Stocked</span>
        </div>
        {showFloods && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, color: 'rgba(250,250,247,0.55)' }}>Flood</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 8, background: RELAY_COLORS.critical, opacity: 0.55, display: 'inline-block', borderRadius: 1 }} /> Major</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 8, background: RELAY_COLORS.watch, opacity: 0.55, display: 'inline-block', borderRadius: 1 }} /> Moderate</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 8, background: RELAY_COLORS.signal, opacity: 0.45, display: 'inline-block', borderRadius: 1 }} /> Minor</span>
          </div>
        )}
        {showClosures && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, color: 'rgba(250,250,247,0.55)' }}>Roads</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 18, height: 0, borderTop: `3px dashed ${RELAY_COLORS.critical}`, display: 'inline-block' }} /> Closed</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 18, height: 0, borderTop: `3px dotted ${RELAY_COLORS.watch}`, display: 'inline-block' }} /> Caution</span>
          </div>
        )}
      </div>
    </div>
  );
}

function OverlayToggle({ active, color, label, count, onToggle }: { active: boolean; color: string; label: string; count: string; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: active ? 'rgba(15,20,25,0.92)' : 'rgba(15,20,25,0.7)',
        border: `1px solid ${active ? color : 'rgba(255,255,255,0.12)'}`,
        borderLeft: `3px solid ${active ? color : 'rgba(255,255,255,0.12)'}`,
        color: RELAY_COLORS.paper,
        padding: '6px 10px',
        borderRadius: 4,
        fontFamily: 'inherit',
        cursor: 'pointer',
        minWidth: 200,
        textAlign: 'left',
      }}
    >
      <span style={{ width: 14, height: 14, borderRadius: 3, background: active ? color : 'transparent', border: `1.5px solid ${active ? color : 'rgba(255,255,255,0.3)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {active && <span style={{ width: 6, height: 6, background: RELAY_COLORS.paper, borderRadius: 1 }} />}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ display: 'block', fontSize: 10, color: 'rgba(250,250,247,0.6)', marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
      </span>
    </button>
  );
}

function SituationPanel({ allSiteCounts }: { allSiteCounts: { out: number; low: number; stocked: number } }) {
  const [editing, setEditing] = useState(false);
  const [what, setWhat] = useState(INCIDENT.what);
  const incidentMins = Math.floor((Date.now() - new Date(INCIDENT.startedAt).getTime()) / 60_000);
  const hrs = Math.floor(incidentMins / 60);
  const remainMin = incidentMins % 60;
  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: 'rgba(250,250,247,0.55)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Activity size={12} strokeWidth={1.75} /> Situation
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, color: RELAY_COLORS.paper, marginTop: 4 }}>{INCIDENT.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(250,250,247,0.55)', marginTop: 2, letterSpacing: '0.04em' }}>{INCIDENT.ics} · Activated <TabularNum>{hrs}h {remainMin}m</TabularNum> ago</div>
        </div>
        <button onClick={() => setEditing(!editing)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(250,250,247,0.7)', padding: '4px 8px', borderRadius: 4, fontFamily: 'inherit', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Pencil size={11} strokeWidth={1.75} /> {editing ? 'Save' : 'Edit'}
        </button>
      </div>
      {editing ? (
        <textarea value={what} onChange={(e) => setWhat(e.target.value)} rows={3} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: RELAY_COLORS.paper, fontFamily: 'inherit', fontSize: 13, padding: 10, borderRadius: 4, resize: 'vertical', lineHeight: 1.5 }} />
      ) : (
        <p style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(250,250,247,0.85)', margin: '4px 0 8px' }}>{what}</p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
        <Metric label="Sites Out" value={allSiteCounts.out} color={RELAY_COLORS.critical} />
        <Metric label="Sites Low" value={allSiteCounts.low} color={RELAY_COLORS.watch} />
        <Metric label="All stocked" value={allSiteCounts.stocked} color={RELAY_COLORS.go} />
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: 10 }}>
      <div style={{ fontSize: 11, color: 'rgba(250,250,247,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 600, color: RELAY_COLORS.paper, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function TickerStrip({ events, onOpenSite }: { events: TickerEvent[]; onOpenSite: (id: string) => void }) {
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', maxHeight: 180, overflowY: 'auto' }}>
      <div style={{ position: 'sticky', top: 0, padding: '8px 20px', background: RELAY_COLORS.ink, fontSize: 11, color: 'rgba(250,250,247,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, zIndex: 1 }}>
        <Radio size={12} strokeWidth={1.75} /> Live ticker
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {events.slice(0, 8).map((e, i) => (
          <li
            key={e.id}
            className={i === 0 ? 'relay-row-accent relay-fade-in' : undefined}
            style={{ display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: 12, padding: '8px 20px 8px 24px', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: 12, alignItems: 'center', cursor: e.siteId ? 'pointer' : 'default' }}
            onClick={() => e.siteId && onOpenSite(e.siteId)}
          >
            <span style={{ color: 'rgba(250,250,247,0.55)', fontWeight: 500 }}>{relativeTime(e.at)}</span>
            <span style={{ color: 'rgba(250,250,247,0.9)' }}>
              {e.status && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 6, color: statusColor(e.status), fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{statusIcon(e.status, 10)}{e.status}</span>}
              {e.text}
            </span>
            {e.siteId && <ChevronRight size={14} strokeWidth={1.75} color="rgba(250,250,247,0.4)" />}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CardStack({ cards, onOpenSite, onCompose }: { cards: CardEntry[]; onOpenSite: (id: string) => void; onCompose: (siteId: string, category?: Category) => void }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 11, color: 'rgba(250,250,247,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, paddingLeft: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Priority stack · {cards.length} sites</span>
        <span>Sorted: action-needed first</span>
      </div>
      {cards.map((c, i) => <BoardCard key={c.site.id} entry={c} large={i < 3} onOpen={() => onOpenSite(c.site.id)} onCompose={() => onCompose(c.site.id)} />)}
    </div>
  );
}

function BoardCard({ entry, large, onOpen, onCompose }: { entry: CardEntry; large: boolean; onOpen: () => void; onCompose: () => void }) {
  const accent = statusColor(entry.topStatus);
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid rgba(255,255,255,${large ? 0.16 : 0.08})`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 8,
        padding: large ? 16 : 12,
        cursor: 'pointer',
        transition: 'background-color 120ms ease',
      }}
      onClick={onOpen}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: 'rgba(250,250,247,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{entry.site.sector}</span>
            {entry.tasking?.state === 'unack' && (
              <span style={{ fontSize: 10, color: RELAY_COLORS.critical, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <AlertOctagon size={10} strokeWidth={1.75} /> Unack tasking
              </span>
            )}
          </div>
          <h4 style={{ fontSize: large ? 17 : 14, fontWeight: 600, color: RELAY_COLORS.paper, margin: 0, lineHeight: 1.2 }}>{entry.site.name}</h4>
          <div style={{ fontSize: 12, color: 'rgba(250,250,247,0.7)', marginTop: 4 }}>{entry.reason}</div>
        </div>
        <StatusBadge status={entry.topStatus} size={large ? 'md' : 'sm'} />
      </div>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {entry.site.categories.map((cat) => {
          const s = entry.site.state[cat]?.status ?? 'Stocked';
          return (
            <span key={cat} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(250,250,247,0.85)' }}>
              <StatusDot status={s} size={8} />
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: 10 }}>{cat}</span>
            </span>
          );
        })}
      </div>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontSize: 11, color: 'rgba(250,250,247,0.55)' }}>
          <Clock size={11} strokeWidth={1.75} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />
          Last report {relativeTime(entry.lastChangeAt)}
        </div>
        {entry.tasking ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(250,250,247,0.85)' }}>
            <Truck size={12} strokeWidth={1.75} color={entry.tasking.state === 'unack' ? RELAY_COLORS.critical : RELAY_COLORS.signal} />
            <span style={{ fontWeight: 600 }}>{entry.tasking.runner}</span> · {entry.tasking.state === 'unack' ? 'Awaiting ack' : entry.tasking.state === 'en_route' ? `En route · ETA ${entry.tasking.eta}` : 'Acknowledged'}
          </div>
        ) : entry.priority <= 3 ? (
          <button onClick={(e) => { e.stopPropagation(); onCompose(); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: RELAY_COLORS.signal, color: RELAY_COLORS.paper, border: 'none', borderRadius: 4, padding: '6px 12px', fontFamily: 'inherit', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer' }}>
            <Send size={12} strokeWidth={1.75} /> Task
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 5.5 — Site Drawer

function SiteDrawer({ site, tasking, onClose, onCompose, onPreviewReporter }: { site: Site; tasking: Tasking | null; onClose: () => void; onCompose: (category?: Category) => void; onPreviewReporter: () => void }) {
  const [showAudit, setShowAudit] = useState(false);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,20,25,0.55)', zIndex: 40, display: 'flex', justifyContent: 'flex-end' }}>
      <aside onClick={(e) => e.stopPropagation()} style={{ width: 'min(560px, 100%)', background: RELAY_COLORS.paper, color: RELAY_COLORS.ink, display: 'flex', flexDirection: 'column', boxShadow: '-12px 0 32px rgba(0,0,0,0.25)' }}>
        <header style={{ padding: '20px 24px', borderBottom: `1px solid ${RELAY_COLORS.mist}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: RELAY_COLORS.steel, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{site.sector}</div>
            <h2 style={{ fontSize: 22, fontWeight: 600, margin: '4px 0 0', color: RELAY_COLORS.ink }}>{site.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, fontSize: 12, color: RELAY_COLORS.steel }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={12} strokeWidth={1.75} /> {site.address}</span>
              {site.poc && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Phone size={12} strokeWidth={1.75} /> {site.poc.name} · {site.poc.phone}</span>}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close drawer" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, color: RELAY_COLORS.steel }}>
            <X size={20} strokeWidth={1.75} />
          </button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Category state */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 style={{ fontSize: 12, fontWeight: 600, color: RELAY_COLORS.steel, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Categories</h3>
              <button style={{ background: 'transparent', border: 'none', color: RELAY_COLORS.signal, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add category</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {site.categories.map((c) => {
                const s = site.state[c]?.status ?? 'Stocked';
                return (
                  <div key={c} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: `1px solid ${RELAY_COLORS.mist}`, borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <StatusDot status={s} />
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: RELAY_COLORS.ink }}>{c}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: RELAY_COLORS.steel }}>by {site.state[c]?.reportedBy ?? 'unattributed'} · {relativeTime(site.state[c]?.at ?? '')}</span>
                      <StatusBadge status={s} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Active tasking */}
          {tasking && (
            <section>
              <h3 style={{ fontSize: 12, fontWeight: 600, color: RELAY_COLORS.steel, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>Active tasking</h3>
              <Card>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <Truck size={20} strokeWidth={1.75} color={RELAY_COLORS.signal} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: RELAY_COLORS.ink }}>Resupply {tasking.category} · {tasking.runner}</div>
                    <MetaText style={{ display: 'block', marginTop: 4 }}>ETA {tasking.eta} · {tasking.runnerPhone} · dispatched {relativeTime(tasking.createdAt)}</MetaText>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <RelayButton variant="outline" size="sm">Recall</RelayButton>
                      <RelayButton variant="ghost" size="sm" iconLeft={<Phone size={12} strokeWidth={1.75} />}>Call runner</RelayButton>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* History */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 style={{ fontSize: 12, fontWeight: 600, color: RELAY_COLORS.steel, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Report history</h3>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: RELAY_COLORS.steel, cursor: 'pointer' }}>
                <input type="checkbox" checked={showAudit} onChange={(e) => setShowAudit(e.target.checked)} /> Show audit trail
              </label>
            </div>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {site.reports.map((r) => (
                <li key={r.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr auto', gap: 12, padding: '10px 12px', background: RELAY_COLORS.paper, border: `1px solid ${RELAY_COLORS.mist}`, borderRadius: 4, fontSize: 13, alignItems: 'center' }}>
                  <span style={{ color: RELAY_COLORS.steel, fontSize: 12 }}>{relativeTime(r.at)}</span>
                  <span style={{ color: RELAY_COLORS.ink }}>
                    <strong style={{ fontWeight: 600 }}>{r.category}</strong>
                    <span style={{ color: RELAY_COLORS.steel }}> by {r.reporter ?? 'Guest'}</span>
                    {showAudit && r.callback && <span style={{ color: RELAY_COLORS.steel, fontSize: 11 }}> · {r.callback}</span>}
                    {r.note && <div style={{ fontSize: 12, color: RELAY_COLORS.steel, marginTop: 2 }}>{r.note}</div>}
                  </span>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ol>
          </section>

          {/* Photos placeholder */}
          <section>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: RELAY_COLORS.steel, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>Photos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ aspectRatio: '1', background: RELAY_COLORS.mist, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: RELAY_COLORS.steel }}>—</div>
              ))}
            </div>
            <MetaText style={{ display: 'block', marginTop: 8, fontSize: 11 }}>Deferred uploads from reporters appear here when bandwidth allows.</MetaText>
          </section>

          {/* QR */}
          <section>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: RELAY_COLORS.steel, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>Reporter link</h3>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <FauxQR seed={site.id} size={88} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: RELAY_COLORS.ink, wordBreak: 'break-all' }}>relay.ct/r/{site.id}?t=<span style={{ color: RELAY_COLORS.steel }}>•••</span></div>
                  <MetaText style={{ display: 'block', marginTop: 6 }}>Scan to open the field reporter. Token scoped to this site.</MetaText>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <RelayButton variant="outline" size="sm" iconLeft={<QrCode size={12} strokeWidth={1.75} />}>Print QR</RelayButton>
                    <RelayButton variant="ghost" size="sm" onClick={onPreviewReporter}>Preview reporter</RelayButton>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        </div>

        <footer style={{ padding: 16, borderTop: `1px solid ${RELAY_COLORS.mist}`, display: 'flex', gap: 8 }}>
          <RelayButton variant="primary" size="md" iconLeft={<Send size={14} strokeWidth={1.75} />} onClick={() => onCompose()}>Compose tasking</RelayButton>
          <RelayButton variant="outline" size="md">Edit categories</RelayButton>
        </footer>
      </aside>
    </div>
  );
}

// 5.6 — Tasking Compose

function TaskingCompose({ site, initialCategory, onClose }: { site: Site; initialCategory?: Category; onClose: () => void }) {
  const outCats = site.categories.filter((c) => site.state[c]?.status !== 'Stocked');
  const [category, setCategory] = useState<Category>(initialCategory ?? outCats[0] ?? site.categories[0]!);
  const [runner, setRunner] = useState('Maria Castillo');
  const [phone, setPhone] = useState('864-555-0413');
  const [eta, setEta] = useState('25m');
  const [dispatched, setDispatched] = useState(false);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,20,25,0.65)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'relay-fade-in 150ms ease-out' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: RELAY_COLORS.paper, color: RELAY_COLORS.ink, borderRadius: 8, width: 'min(520px, 100%)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 48px rgba(0,0,0,0.35)' }}>
        <header style={{ padding: '20px 24px', borderBottom: `1px solid ${RELAY_COLORS.mist}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Compose tasking</h2>
          <button onClick={onClose} aria-label="Close" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: RELAY_COLORS.steel }}><X size={20} strokeWidth={1.75} /></button>
        </header>
        {!dispatched ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: RELAY_COLORS.ink, color: RELAY_COLORS.paper, padding: '12px 16px', borderRadius: 4 }}>
              <div style={{ fontSize: 11, color: 'rgba(250,250,247,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Task</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>Resupply {category} at {site.name}</div>
            </div>

            <div>
              <Label>Category</Label>
              <Select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                {site.categories.map((c) => <option key={c} value={c}>{c} — {site.state[c]?.status ?? 'unknown'}</option>)}
              </Select>
            </div>

            <div>
              <Label>Runner</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => { setRunner('Maria Castillo'); setPhone('864-555-0413'); }} style={runnerButtonStyle(runner === 'Maria Castillo')}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: RELAY_COLORS.go }} /> Maria Castillo · self-reported available · 864-555-0413
                </button>
                <button onClick={() => { setRunner('Devon Hall'); setPhone('864-555-0464'); }} style={runnerButtonStyle(runner === 'Devon Hall')}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: RELAY_COLORS.go }} /> Devon Hall · self-reported available · 864-555-0464
                </button>
                <button onClick={() => { setRunner('Truck 4 — Riley'); setPhone('864-555-0490'); }} style={runnerButtonStyle(runner === 'Truck 4 — Riley')}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: RELAY_COLORS.go }} /> Truck 4 — Riley · mutual aid · 864-555-0490
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 8 }}>
                  <Input value={runner} onChange={(e) => setRunner(e.target.value)} placeholder="Or type a name" />
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="SMS number" inputMode="tel" />
                </div>
              </div>
            </div>

            <div>
              <Label>ETA expectation</Label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {['15m', '1h', '4h', 'Custom'].map((opt) => (
                  <button key={opt} onClick={() => setEta(opt === 'Custom' ? '' : opt)} style={{
                    minHeight: 48, borderRadius: 8, border: `1.5px solid ${(eta === opt || (opt === 'Custom' && eta === '')) ? RELAY_COLORS.signal : RELAY_COLORS.mist}`,
                    background: (eta === opt || (opt === 'Custom' && eta === '')) ? 'rgba(0,102,204,0.08)' : 'transparent',
                    color: RELAY_COLORS.ink, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer'
                  }}>{opt}</button>
                ))}
              </div>
              {eta === '' && (
                <div style={{ marginTop: 8 }}>
                  <Input value={eta} onChange={(e) => setEta(e.target.value)} placeholder="e.g. 2h 30m" />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 8 }}>
              <RelayButton variant="outline" size="md" onClick={onClose}>Cancel</RelayButton>
              <RelayButton variant="primary" size="md" iconLeft={<Send size={14} strokeWidth={1.75} />} onClick={() => setDispatched(true)}>Dispatch via SMS</RelayButton>
            </div>
          </div>
        ) : (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: RELAY_COLORS.go, fontWeight: 600 }}>
              <CheckCircle size={20} strokeWidth={1.75} /> Dispatched
            </div>
            <Card>
              <div style={{ fontSize: 13, color: RELAY_COLORS.steel, marginBottom: 4 }}>SMS sent to {phone}</div>
              <div style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12, lineHeight: 1.5, background: RELAY_COLORS.ink, color: RELAY_COLORS.paper, padding: 12, borderRadius: 4 }}>
                Relay EOC tasking: Resupply {category} at {site.name}. ETA {eta || 'custom'}. Tap to ACK: relay.ct/t/{site.id}-{category.toLowerCase()}
              </div>
              <MetaText style={{ display: 'block', marginTop: 8 }}>If unacknowledged in 5 min the card returns to the top of the stack.</MetaText>
            </Card>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <RelayButton variant="primary" size="md" onClick={onClose}>Done</RelayButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function runnerButtonStyle(active: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    border: `1.5px solid ${active ? RELAY_COLORS.signal : RELAY_COLORS.mist}`,
    background: active ? 'rgba(0,102,204,0.05)' : RELAY_COLORS.paper,
    borderRadius: 4,
    fontFamily: 'inherit',
    fontSize: 13,
    color: RELAY_COLORS.ink,
    textAlign: 'left',
    cursor: 'pointer',
  };
}

function FauxQR({ seed, size }: { seed: string; size: number }) {
  // Cheap deterministic 9x9 pixel block; visual stand-in for a QR code.
  const grid: boolean[] = [];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  for (let i = 0; i < 81; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    grid.push((h >>> 16) % 2 === 0);
  }
  // Fixed finder squares in corners for QR look
  const finder = (x: number, y: number) => (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
  return (
    <div style={{ width: size, height: size, padding: 6, background: RELAY_COLORS.paper, border: `1px solid ${RELAY_COLORS.mist}`, borderRadius: 4 }}>
      <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 1 }}>
        {grid.map((on, i) => {
          const x = i % 9, y = Math.floor(i / 9);
          const isFinder = finder(x, y);
          const fill = isFinder ? RELAY_COLORS.ink : on ? RELAY_COLORS.ink : 'transparent';
          return <div key={i} style={{ background: fill }} />;
        })}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 5.7 — Handoff Brief

function HandoffBrief({ cards, allSiteCounts }: { cards: CardEntry[]; allSiteCounts: { out: number; low: number; stocked: number } }) {
  const top5Unresolved = cards.filter((c) => c.priority <= 3).slice(0, 5);
  const top5Resolutions = TICKER.filter((e) => e.kind === 'tasking' || (e.kind === 'state' && e.status === 'Stocked')).slice(0, 5);
  const openTaskings = TASKINGS.filter((t) => t.state !== 'resolved' && t.state !== 'recalled');
  const [annotations, setAnnotations] = useState<Record<string, string>>({});
  const [shared, setShared] = useState(false);
  const incidentMins = Math.floor((Date.now() - new Date(INCIDENT.startedAt).getTime()) / 60_000);
  const hrs = Math.floor(incidentMins / 60);
  return (
    <div style={{ flex: 1, background: RELAY_COLORS.paper, color: RELAY_COLORS.ink, overflowY: 'auto' }}>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: 32 }}>
        <header style={{ borderBottom: `1px solid ${RELAY_COLORS.mist}`, paddingBottom: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: RELAY_COLORS.steel, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Shift handoff brief</div>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: '6px 0 0' }}>{INCIDENT.name}</h1>
          <div style={{ fontSize: 13, color: RELAY_COLORS.steel, marginTop: 6 }}>
            {INCIDENT.ics} · Auto-composed {new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} · Activated <TabularNum>{hrs}h</TabularNum> ago
          </div>
        </header>

        <section style={{ marginBottom: 28 }}>
          <h2 style={sectionH2}>Situation</h2>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 8px' }}>{INCIDENT.what}</p>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: RELAY_COLORS.steel }}>{INCIDENT.impact}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
            <BriefMetric label="Sites Out" value={allSiteCounts.out} color={RELAY_COLORS.critical} />
            <BriefMetric label="Sites Low" value={allSiteCounts.low} color={RELAY_COLORS.watch} />
            <BriefMetric label="All stocked" value={allSiteCounts.stocked} color={RELAY_COLORS.go} />
          </div>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={sectionH2}>Top 5 unresolved</h2>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {top5Unresolved.map((c) => (
              <li key={c.site.id} style={{ padding: 12, border: `1px solid ${RELAY_COLORS.mist}`, borderRadius: 4, borderLeft: `4px solid ${statusColor(c.topStatus)}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <strong style={{ fontSize: 14, fontWeight: 600 }}>{c.site.name}</strong>
                    <MetaText style={{ marginLeft: 8 }}>{c.reason}</MetaText>
                  </div>
                  <StatusBadge status={c.topStatus} />
                </div>
                <input
                  type="text"
                  placeholder="Add a one-line handoff note…"
                  value={annotations[c.site.id] ?? ''}
                  onChange={(e) => setAnnotations({ ...annotations, [c.site.id]: e.target.value })}
                  style={{ width: '100%', marginTop: 8, padding: '8px 10px', border: `1px solid ${RELAY_COLORS.mist}`, borderRadius: 4, fontFamily: 'inherit', fontSize: 13, color: RELAY_COLORS.ink, background: RELAY_COLORS.paper }}
                />
              </li>
            ))}
          </ol>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={sectionH2}>Open taskings</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {openTaskings.map((t) => (
              <li key={t.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px', gap: 12, padding: '10px 12px', border: `1px solid ${RELAY_COLORS.mist}`, borderRadius: 4, fontSize: 13 }}>
                <span><strong>{t.runner}</strong> · Resupply {t.category} → {SITES.find((s) => s.id === t.siteId)?.name}</span>
                <span style={{ color: RELAY_COLORS.steel }}>{t.state.replace('_', ' ')}</span>
                <span style={{ color: RELAY_COLORS.steel, textAlign: 'right' }}>ETA {t.eta}</span>
              </li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={sectionH2}>Recent resolutions</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {top5Resolutions.map((e) => (
              <li key={e.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12, padding: '8px 12px', borderBottom: `1px solid ${RELAY_COLORS.mist}`, fontSize: 13 }}>
                <span style={{ color: RELAY_COLORS.steel }}>{relativeTime(e.at)}</span>
                <span>{e.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={sectionH2}>Staffing</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, lineHeight: 1.8 }}>
            <li><strong>Outgoing:</strong> {INCIDENT.controller} — relieved 18:00</li>
            <li><strong>Incoming:</strong> Pending — confirm receipt below</li>
            <li><strong>Field:</strong> 6 self-reported runners available · 3 mutual aid units</li>
          </ul>
        </section>

        <footer style={{ display: 'flex', gap: 8, paddingTop: 16, borderTop: `1px solid ${RELAY_COLORS.mist}` }}>
          <RelayButton variant="primary" size="md" onClick={() => setShared(true)}>Generate share link</RelayButton>
          <RelayButton variant="outline" size="md">Export PDF</RelayButton>
          <RelayButton variant="ghost" size="md">Print</RelayButton>
          {shared && (
            <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: RELAY_COLORS.go, fontWeight: 500 }}>
              <CheckCircle size={16} strokeWidth={1.75} /> Link copied: relay.ct/h/2026-0512-evening
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}

const sectionH2: React.CSSProperties = { fontSize: 16, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.04em' };

function BriefMetric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ border: `1px solid ${RELAY_COLORS.mist}`, padding: 12, borderRadius: 4, borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 11, color: RELAY_COLORS.steel, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 600, marginTop: 4, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 5.9 — Sites Admin

function SitesAdmin({ onPreviewReporter }: { onPreviewReporter: (siteId: string) => void }) {
  const [adding, setAdding] = useState(false);
  return (
    <div style={{ flex: 1, background: RELAY_COLORS.paper, color: RELAY_COLORS.ink, overflowY: 'auto' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Sites</h1>
            <MetaText style={{ display: 'block', marginTop: 4 }}>{SITES.length} active · Print QR sheet for the whole incident or per-site.</MetaText>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <RelayButton variant="outline" size="md" iconLeft={<QrCode size={14} strokeWidth={1.75} />}>Print all QRs · 8.5×11 sheet</RelayButton>
            <RelayButton variant="primary" size="md" iconLeft={<Plus size={14} strokeWidth={1.75} />} onClick={() => setAdding(true)}>Add site</RelayButton>
          </div>
        </div>

        {adding && (
          <Card style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em', color: RELAY_COLORS.steel }}>New site</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><Label>Name</Label><Input placeholder="e.g. Berea High School" /></div>
              <div><Label>Sector</Label><Input placeholder="e.g. Sector C" /></div>
              <div style={{ gridColumn: '1 / -1' }}><Label>Address</Label><Input placeholder="Street, City, State" /></div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Categories</Label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {CATEGORIES_DEFAULT.map((c) => <CatToggle key={c} label={c} />)}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <RelayButton variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancel</RelayButton>
              <RelayButton variant="primary" size="sm" onClick={() => setAdding(false)}>Add site</RelayButton>
            </div>
          </Card>
        )}

        <div style={{ border: `1px solid ${RELAY_COLORS.mist}`, borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: RELAY_COLORS.mist }}>
                {['Site', 'Sector', 'Status summary', 'POC', 'Last report', 'Actions'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 600, color: RELAY_COLORS.steel, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SITES.map((s, i) => {
                const counts = siteCounts(s);
                const worst = siteWorstStatus(s);
                const lastReport = Math.max(0, ...s.categories.map((c) => new Date(s.state[c]?.at ?? 0).getTime()));
                return (
                  <tr key={s.id} style={{ borderTop: i === 0 ? 'none' : `1px solid ${RELAY_COLORS.mist}` }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <StatusDot status={worst} />
                        <div>
                          <div style={{ fontWeight: 600, color: RELAY_COLORS.ink }}>{s.name}</div>
                          <div style={{ fontSize: 12, color: RELAY_COLORS.steel }}>{s.address}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: RELAY_COLORS.steel }}>{s.sector}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                        <span style={{ color: RELAY_COLORS.critical, fontWeight: 600 }}><TabularNum>{counts.out}</TabularNum> out</span>
                        <span style={{ color: RELAY_COLORS.watch, fontWeight: 600 }}><TabularNum>{counts.low}</TabularNum> low</span>
                        <span style={{ color: RELAY_COLORS.go, fontWeight: 600 }}><TabularNum>{counts.stocked}</TabularNum> ok</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: RELAY_COLORS.steel }}>{s.poc?.name ?? '—'}</td>
                    <td style={{ padding: '12px 14px', color: RELAY_COLORS.steel }}>{relativeTime(new Date(lastReport).toISOString())}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => onPreviewReporter(s.id)} style={tableBtnStyle}><QrCode size={12} strokeWidth={1.75} /> QR</button>
                        <button style={tableBtnStyle}>Edit</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const tableBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '6px 10px',
  background: 'transparent',
  border: `1px solid ${RELAY_COLORS.mist}`,
  borderRadius: 4,
  fontFamily: 'inherit',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: RELAY_COLORS.ink,
  cursor: 'pointer',
};

function CatToggle({ label }: { label: string }) {
  const [on, setOn] = useState(true);
  return (
    <button onClick={() => setOn(!on)} style={{
      padding: '6px 12px',
      borderRadius: 4,
      border: `1.5px solid ${on ? RELAY_COLORS.signal : RELAY_COLORS.mist}`,
      background: on ? 'rgba(0,102,204,0.08)' : 'transparent',
      color: RELAY_COLORS.ink,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      fontFamily: 'inherit',
      cursor: 'pointer',
    }}>{label}</button>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 5.10 — Audit / Export

function AuditExport() {
  const [from, setFrom] = useState('2026-05-11');
  const [to, setTo] = useState('2026-05-12');
  const [format, setFormat] = useState<'csv' | 'pdf' | 'ics'>('csv');
  const [includePII, setIncludePII] = useState(false);
  const [includeCosts, setIncludeCosts] = useState(true);
  const allReports = SITES.flatMap((s) => s.reports);
  return (
    <div style={{ flex: 1, background: RELAY_COLORS.paper, color: RELAY_COLORS.ink, overflowY: 'auto' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>Audit & export</h1>
        <MetaText style={{ display: 'block', marginBottom: 24 }}>Append-only event log. Exports preserve identities where captured; redact PII for shareable copies.</MetaText>

        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: 16, alignItems: 'end' }}>
            <div><Label htmlFor="from">From</Label><Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div><Label htmlFor="to">To</Label><Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
            <div>
              <Label>Format</Label>
              <Select value={format} onChange={(e) => setFormat(e.target.value as any)}>
                <option value="csv">CSV — per-event log</option>
                <option value="pdf">PDF — SitRep timeline</option>
                <option value="ics">ICS — Tasking + SitRep + POD logs</option>
              </Select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: RELAY_COLORS.ink }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={includePII} onChange={(e) => setIncludePII(e.target.checked)} /> Include reporter PII</label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={includeCosts} onChange={(e) => setIncludeCosts(e.target.checked)} /> Include cost estimates</label>
            </div>
            <RelayButton variant="primary" size="md">Generate</RelayButton>
          </div>
          <MetaText style={{ display: 'block', marginTop: 12, fontSize: 11 }}>
            <AlertTriangle size={11} strokeWidth={1.75} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} color={RELAY_COLORS.watch} />
            Exports of an active incident produce a snapshot with "AS OF — INCIDENT ONGOING" header. Final report requires Demob.
          </MetaText>
        </Card>

        <div style={{ border: `1px solid ${RELAY_COLORS.mist}`, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', background: RELAY_COLORS.mist, fontSize: 11, color: RELAY_COLORS.steel, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Preview · {allReports.length} events
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: RELAY_COLORS.paper }}>
                {['Time', 'Site', 'Category', 'Status', 'Reporter', includePII ? 'Callback' : null].filter(Boolean).map((h) => (
                  <th key={h as string} style={{ textAlign: 'left', padding: '8px 14px', borderBottom: `1px solid ${RELAY_COLORS.mist}`, fontSize: 11, fontWeight: 600, color: RELAY_COLORS.steel, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h as string}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allReports.slice(0, 18).map((r) => {
                const site = SITES.find((s) => s.id === r.siteId);
                return (
                  <tr key={r.id} style={{ borderTop: `1px solid ${RELAY_COLORS.mist}` }}>
                    <td style={{ padding: '8px 14px', color: RELAY_COLORS.steel }}>{absoluteTime(r.at)}</td>
                    <td style={{ padding: '8px 14px' }}>{site?.name}</td>
                    <td style={{ padding: '8px 14px' }}>{r.category}</td>
                    <td style={{ padding: '8px 14px' }}><StatusBadge status={r.status} /></td>
                    <td style={{ padding: '8px 14px', color: RELAY_COLORS.steel }}>{r.reporter ?? 'Guest'}</td>
                    {includePII && <td style={{ padding: '8px 14px', color: RELAY_COLORS.steel, fontFamily: 'ui-monospace, monospace' }}>{r.callback ?? '—'}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 5.13 — Settings

function IncidentSettings() {
  const [stale, setStale] = useState(INCIDENT.staleThresholdMins);
  const [timeoutOut, setTimeoutOut] = useState(INCIDENT.taskingTimeoutOutMins);
  const [timeoutLow, setTimeoutLow] = useState(INCIDENT.taskingTimeoutLowMins);
  const [mutualAid, setMutualAid] = useState(true);
  return (
    <div style={{ flex: 1, background: RELAY_COLORS.paper, color: RELAY_COLORS.ink, overflowY: 'auto' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>Incident settings</h1>
        <MetaText style={{ display: 'block', marginBottom: 24 }}>Controller-tier configuration. Tunable per incident; calibrated post-launch.</MetaText>

        <Card style={{ marginBottom: 16 }}>
          <h3 style={settingsH3}>Thresholds</h3>
          <SettingRow label="Stale threshold" hint="Sites with no report after this many minutes pulse on the map and push up the stack.">
            <Input type="number" value={stale} onChange={(e) => setStale(parseInt(e.target.value || '0', 10))} style={{ maxWidth: 140 }} />
            <MetaText>minutes</MetaText>
          </SettingRow>
          <SettingRow label="Tasking timeout — Out" hint="Auto-reping the reporter to reconfirm a OUT request after this many minutes.">
            <Input type="number" value={timeoutOut} onChange={(e) => setTimeoutOut(parseInt(e.target.value || '0', 10))} style={{ maxWidth: 140 }} />
            <MetaText>minutes</MetaText>
          </SettingRow>
          <SettingRow label="Tasking timeout — Low" hint="Same as above but for a LOW status.">
            <Input type="number" value={timeoutLow} onChange={(e) => setTimeoutLow(parseInt(e.target.value || '0', 10))} style={{ maxWidth: 140 }} />
            <MetaText>minutes</MetaText>
          </SettingRow>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <h3 style={settingsH3}>Categories — defaults</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
            {CATEGORIES_DEFAULT.map((c) => <CatToggle key={c} label={c} />)}
          </div>
          <MetaText>New sites inherit this set. Each site can add/remove later.</MetaText>
        </Card>

        <Card>
          <h3 style={settingsH3}>Mutual aid sharing</h3>
          <SettingRow label="Allow read-access share links" hint="Spartanburg EOC, Pickens EOC, and your VOAD partners can be invited via Handoff.">
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={mutualAid} onChange={(e) => setMutualAid(e.target.checked)} />
              {mutualAid ? 'Enabled' : 'Disabled'}
            </label>
          </SettingRow>
        </Card>
      </div>
    </div>
  );
}

const settingsH3: React.CSSProperties = { fontSize: 12, fontWeight: 600, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.06em', color: RELAY_COLORS.steel };

function SettingRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24, padding: '14px 0', borderBottom: `1px solid ${RELAY_COLORS.mist}`, alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
        {hint && <MetaText style={{ display: 'block', marginTop: 4, fontSize: 12 }}>{hint}</MetaText>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{children}</div>
    </div>
  );
}
