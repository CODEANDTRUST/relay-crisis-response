import type { Site, Tasking, TickerEvent, Category, Status, Report } from './types';

const NOW = new Date('2026-05-12T15:32:00Z').getTime();
const minsAgo = (m: number) => new Date(NOW - m * 60_000).toISOString();

const CATEGORIES_DEFAULT: Category[] = ['Water', 'Food', 'Formula', 'Diapers', 'Hygiene', 'Medical', 'Other'];

function mkState(entries: Array<[Category, Status, string | null, number]>): Site['state'] {
  const state = {} as Site['state'];
  for (const [cat, status, reportedBy, mins] of entries) {
    state[cat] = { status, reportedBy, at: minsAgo(mins) };
  }
  return state;
}

function mkReports(siteId: string, entries: Array<[Category, Status, string | null, number, string?]>): Report[] {
  return entries.map(([category, status, reporter, mins, note], i) => ({
    id: `${siteId}-r${i}`,
    siteId,
    category,
    status,
    reporter,
    callback: reporter ? '941-555-0' + (100 + i) : null,
    at: minsAgo(mins),
    note,
  }));
}

// Sarasota, FL — real coordinates used directly as map markers.
// `coords.x/y` retained as normalized 0–1 values for the legacy SVG fallback;
// `lat/lng` are the source of truth for the Leaflet map.
export const MAP_CENTER: { lat: number; lng: number; zoom: number } = {
  lat: 27.3364,
  lng: -82.5307,
  zoom: 12,
};

function norm(lat: number, lng: number): { x: number; y: number } {
  // Bounding box around Sarasota for the legacy fallback grid
  const N = 27.42, S = 27.25, W = -82.60, E = -82.43;
  return {
    x: Math.min(1, Math.max(0, (lng - W) / (E - W))),
    y: Math.min(1, Math.max(0, 1 - (lat - S) / (N - S))),
  };
}

const sarasotaSites = [
  {
    id: 'riverview-hs',
    name: 'Riverview High School',
    sector: 'Sector A',
    address: '1 Ram Way, Sarasota, FL 34231',
    lat: 27.2697,
    lng: -82.4884,
    poc: { name: 'Daryl Hayes', phone: '941-555-0142' },
    categories: ['Water', 'Food', 'Formula', 'Diapers', 'Hygiene'] as Category[],
    state: mkState([
      ['Water', 'Out', 'Maria', 7],
      ['Food', 'Low', 'Maria', 7],
      ['Formula', 'Stocked', 'Daryl', 45],
      ['Diapers', 'Low', 'Daryl', 45],
      ['Hygiene', 'Stocked', null, 180],
    ]),
    reports: mkReports('riverview-hs', [
      ['Water', 'Out', 'Maria', 7, 'Pallet emptied during 2pm distribution'],
      ['Food', 'Low', 'Maria', 7],
      ['Diapers', 'Low', 'Daryl', 45],
      ['Formula', 'Stocked', 'Daryl', 45],
      ['Hygiene', 'Stocked', null, 180],
      ['Water', 'Low', 'Daryl', 220],
      ['Water', 'Stocked', 'Daryl', 480],
    ]),
  },
  {
    id: 'fs-2',
    name: 'POD 3 — Fire Station 2',
    sector: 'Sector B',
    address: '2070 Waldemere St, Sarasota, FL 34239',
    lat: 27.3270,
    lng: -82.5375,
    poc: { name: 'Lt. Park', phone: '941-555-0188' },
    categories: ['Water', 'Food', 'Hygiene', 'Medical'] as Category[],
    state: mkState([
      ['Water', 'Low', 'Park', 4],
      ['Food', 'Stocked', 'Park', 4],
      ['Hygiene', 'Stocked', 'Park', 70],
      ['Medical', 'Stocked', 'Park', 70],
    ]),
    reports: mkReports('fs-2', [
      ['Water', 'Low', 'Park', 4, 'Half pallet remaining, expecting steady walk-up'],
      ['Food', 'Stocked', 'Park', 4],
      ['Hygiene', 'Stocked', 'Park', 70],
      ['Medical', 'Stocked', 'Park', 70],
    ]),
  },
  {
    id: 'bayfront',
    name: 'Bayfront Park Pavilion',
    sector: 'Sector B',
    address: '5 Bayfront Dr, Sarasota, FL 34236',
    lat: 27.3326,
    lng: -82.5466,
    poc: { name: 'C. Whitlock', phone: '941-555-0210' },
    categories: ['Water', 'Food', 'Diapers', 'Hygiene'] as Category[],
    state: mkState([
      ['Water', 'Stocked', 'Whitlock', 22],
      ['Food', 'Stocked', 'Whitlock', 22],
      ['Diapers', 'Stocked', 'Whitlock', 22],
      ['Hygiene', 'Low', 'Whitlock', 22],
    ]),
    reports: mkReports('bayfront', [
      ['Hygiene', 'Low', 'Whitlock', 22],
      ['Water', 'Stocked', 'Whitlock', 22],
      ['Food', 'Stocked', 'Whitlock', 22],
      ['Diapers', 'Stocked', 'Whitlock', 22],
    ]),
  },
  {
    id: 'venice-fh',
    name: 'Venice Community Center',
    sector: 'Sector D',
    address: '326 S Nokomis Ave, Venice, FL 34285',
    lat: 27.0989,
    lng: -82.4548,
    poc: { name: 'Capt. Lowery', phone: '941-555-0177' },
    categories: ['Water', 'Food', 'Medical', 'Hygiene'] as Category[],
    state: mkState([
      ['Water', 'Stocked', 'Lowery', 65],
      ['Food', 'Stocked', 'Lowery', 65],
      ['Medical', 'Low', 'Lowery', 12],
      ['Hygiene', 'Stocked', 'Lowery', 65],
    ]),
    reports: mkReports('venice-fh', [
      ['Medical', 'Low', 'Lowery', 12, 'Need additional bandage kits + saline'],
      ['Water', 'Stocked', 'Lowery', 65],
      ['Food', 'Stocked', 'Lowery', 65],
      ['Hygiene', 'Stocked', 'Lowery', 65],
    ]),
  },
  {
    id: 'newtown',
    name: 'Newtown Estates Rec Center',
    sector: 'Sector A',
    address: '2800 Newtown Blvd, Sarasota, FL 34234',
    lat: 27.3617,
    lng: -82.5285,
    poc: { name: 'M. Ortega', phone: '941-555-0124' },
    categories: ['Water', 'Food', 'Formula', 'Diapers'] as Category[],
    state: mkState([
      ['Water', 'Stocked', 'Ortega', 38],
      ['Food', 'Low', 'Ortega', 38],
      ['Formula', 'Out', 'Ortega', 9],
      ['Diapers', 'Stocked', 'Ortega', 38],
    ]),
    reports: mkReports('newtown', [
      ['Formula', 'Out', 'Ortega', 9, 'No infant formula on site — 3 families waiting'],
      ['Water', 'Stocked', 'Ortega', 38],
      ['Food', 'Low', 'Ortega', 38],
      ['Diapers', 'Stocked', 'Ortega', 38],
    ]),
  },
  {
    id: 'fruitville-library',
    name: 'Fruitville Library',
    sector: 'Sector C',
    address: '100 Apex Rd, Sarasota, FL 34240',
    lat: 27.3358,
    lng: -82.4448,
    poc: { name: 'R. Bell', phone: '941-555-0263' },
    categories: ['Water', 'Food', 'Hygiene'] as Category[],
    state: mkState([
      ['Water', 'Stocked', null, 145],
      ['Food', 'Stocked', null, 145],
      ['Hygiene', 'Stocked', null, 145],
    ]),
    reports: mkReports('fruitville-library', [
      ['Water', 'Stocked', null, 145],
      ['Food', 'Stocked', null, 145],
      ['Hygiene', 'Stocked', null, 145],
    ]),
  },
  {
    id: 'siesta-key-fh',
    name: 'POD 7 — Siesta Key Fire Station',
    sector: 'Sector B',
    address: '202 Beach Rd, Sarasota, FL 34242',
    lat: 27.2682,
    lng: -82.5510,
    poc: { name: 'J. Truluck', phone: '941-555-0299' },
    categories: ['Water', 'Food', 'Diapers', 'Hygiene'] as Category[],
    state: mkState([
      ['Water', 'Stocked', 'Truluck', 18],
      ['Food', 'Stocked', 'Truluck', 18],
      ['Diapers', 'Stocked', 'Truluck', 18],
      ['Hygiene', 'Stocked', 'Truluck', 18],
    ]),
    reports: mkReports('siesta-key-fh', [
      ['Water', 'Stocked', 'Truluck', 18],
      ['Food', 'Stocked', 'Truluck', 18],
      ['Diapers', 'Stocked', 'Truluck', 18],
      ['Hygiene', 'Stocked', 'Truluck', 18],
    ]),
  },
  {
    id: 'lakewood-ranch',
    name: 'Lakewood Ranch Town Hall',
    sector: 'Sector C',
    address: '8175 Lakewood Ranch Blvd, Lakewood Ranch, FL 34202',
    lat: 27.4159,
    lng: -82.4344,
    poc: { name: 'Sgt. Doyle', phone: '941-555-0301' },
    categories: ['Water', 'Food', 'Medical'] as Category[],
    state: mkState([
      ['Water', 'Stocked', 'Doyle', 132],
      ['Food', 'Stocked', 'Doyle', 132],
      ['Medical', 'Stocked', 'Doyle', 132],
    ]),
    reports: mkReports('lakewood-ranch', [
      ['Water', 'Stocked', 'Doyle', 132],
      ['Food', 'Stocked', 'Doyle', 132],
      ['Medical', 'Stocked', 'Doyle', 132],
    ]),
  },
];

export const SITES: Site[] = sarasotaSites.map((s) => ({
  ...s,
  coords: norm(s.lat, s.lng),
}));

export const TASKINGS: Tasking[] = [
  {
    id: 't-001',
    siteId: 'riverview-hs',
    category: 'Water',
    runner: 'Maria Castillo',
    runnerPhone: '941-555-0413',
    eta: '25m',
    state: 'unack',
    createdAt: minsAgo(6),
  },
  {
    id: 't-002',
    siteId: 'newtown',
    category: 'Formula',
    runner: 'Devon Hall',
    runnerPhone: '941-555-0464',
    eta: '15m',
    state: 'en_route',
    createdAt: minsAgo(8),
  },
  {
    id: 't-003',
    siteId: 'venice-fh',
    category: 'Medical',
    runner: 'Truck 4 — Riley',
    runnerPhone: '941-555-0490',
    eta: '1h',
    state: 'acked',
    createdAt: minsAgo(11),
  },
];

export const TICKER: TickerEvent[] = [
  { id: 'e-1', at: minsAgo(2), kind: 'state', siteId: 'fs-2', text: 'Fire Station 2 went LOW (Water)', status: 'Low' },
  { id: 'e-2', at: minsAgo(7), kind: 'report', siteId: 'riverview-hs', text: "Volunteer 'Maria' reported Water OUT at Riverview HS", status: 'Out' },
  { id: 'e-3', at: minsAgo(8), kind: 'tasking', siteId: 'newtown', text: 'Truck 4 marked en route — Formula → Newtown Estates' },
  { id: 'e-4', at: minsAgo(9), kind: 'report', siteId: 'newtown', text: 'Ortega reported Formula OUT at Newtown Estates', status: 'Out' },
  { id: 'e-5', at: minsAgo(12), kind: 'state', siteId: 'venice-fh', text: 'Venice Community Center went LOW (Medical)', status: 'Low' },
  { id: 'e-6', at: minsAgo(22), kind: 'report', siteId: 'bayfront', text: 'Whitlock reported Hygiene LOW at Bayfront Park', status: 'Low' },
  { id: 'e-7', at: minsAgo(38), kind: 'report', siteId: 'newtown', text: 'Ortega reported Food LOW at Newtown Estates', status: 'Low' },
  { id: 'e-8', at: minsAgo(45), kind: 'report', siteId: 'riverview-hs', text: 'Daryl reported Diapers LOW at Riverview HS', status: 'Low' },
  { id: 'e-9', at: minsAgo(70), kind: 'system', text: 'Sector B mutual aid request accepted by Manatee County EOC' },
];

// Flood overlay zones — polygons drawn over known low-elevation / FEMA AE
// areas plus storm-surge-prone barrier islands. Tuples are [lat, lng]; the
// polygons render as translucent fills on the map. Severity drives color.
//
// These are illustrative for the demo (not authoritative inundation models).
// In production these would be fed from a NOAA NWS / NWM flood-extent feed,
// FEMA NFHL polygons clipped to current river gauges, or a partner like One
// Concern. The schema and renderer are real; the source is mocked.
export const FLOOD_ZONES: Array<{
  id: string;
  label: string;
  severity: 'minor' | 'moderate' | 'major';
  ring: Array<[number, number]>;
  note?: string;
}> = [
  {
    id: 'siesta-key',
    label: 'Siesta Key — storm surge',
    severity: 'major',
    note: 'Barrier-island inundation. Stickney Pt Bridge intermittent; N Bridge closed.',
    ring: [
      [27.2920, -82.5680],
      [27.2880, -82.5740],
      [27.2710, -82.5720],
      [27.2540, -82.5560],
      [27.2460, -82.5400],
      [27.2620, -82.5300],
      [27.2790, -82.5360],
      [27.2920, -82.5540],
    ],
  },
  {
    id: 'lido-longboat',
    label: 'Lido / Longboat — storm surge',
    severity: 'major',
    note: 'Coastal flooding north of New Pass. Ringling Bridge open, Longboat Pass closed.',
    ring: [
      [27.3640, -82.5980],
      [27.3520, -82.5990],
      [27.3290, -82.5850],
      [27.3120, -82.5780],
      [27.3160, -82.5680],
      [27.3340, -82.5740],
      [27.3520, -82.5820],
      [27.3640, -82.5900],
    ],
  },
  {
    id: 'bayfront-downtown',
    label: 'Downtown bayfront — tidal',
    severity: 'moderate',
    note: 'Sea-wall overtopping at high tide. Bayfront Dr and US-41 N curb-deep.',
    ring: [
      [27.3460, -82.5560],
      [27.3380, -82.5560],
      [27.3260, -82.5480],
      [27.3260, -82.5400],
      [27.3380, -82.5410],
      [27.3470, -82.5470],
    ],
  },
  {
    id: 'phillippi-creek',
    label: 'Phillippi Creek corridor',
    severity: 'major',
    note: 'Creek out of banks. Bahia Vista, Bee Ridge, Webber crossings impassable.',
    ring: [
      [27.3050, -82.5380],
      [27.2960, -82.5360],
      [27.2890, -82.5180],
      [27.2820, -82.4960],
      [27.2780, -82.4760],
      [27.2820, -82.4720],
      [27.2920, -82.4920],
      [27.3000, -82.5160],
      [27.3080, -82.5320],
    ],
  },
  {
    id: 'hudson-bayou',
    label: 'Hudson Bayou',
    severity: 'moderate',
    note: 'Tidal backflow into Arlington Park neighborhood.',
    ring: [
      [27.3270, -82.5360],
      [27.3210, -82.5380],
      [27.3160, -82.5300],
      [27.3210, -82.5240],
      [27.3270, -82.5280],
    ],
  },
  {
    id: 'whitaker-bayou',
    label: 'Whitaker Bayou',
    severity: 'moderate',
    note: 'Out of banks east of US-41.',
    ring: [
      [27.3680, -82.5460],
      [27.3620, -82.5480],
      [27.3580, -82.5380],
      [27.3640, -82.5280],
      [27.3720, -82.5340],
    ],
  },
  {
    id: 'celery-fields',
    label: 'Celery Fields basin',
    severity: 'minor',
    note: 'Designed stormwater retention performing; Palmer Blvd shoulder-only.',
    ring: [
      [27.3520, -82.4520],
      [27.3440, -82.4540],
      [27.3380, -82.4440],
      [27.3440, -82.4360],
      [27.3540, -82.4400],
    ],
  },
];

// Closed / impassable road segments. Polylines as [lat, lng] tuples.
// Same caveat as above — illustrative for the demo, real source would be
// FL511 / county GIS road-closure feed.
export const ROAD_CLOSURES: Array<{
  id: string;
  label: string;
  status: 'closed' | 'caution';
  line: Array<[number, number]>;
}> = [
  {
    id: 'rc-stickney',
    label: 'Stickney Pt Bridge — intermittent',
    status: 'caution',
    line: [[27.2735, -82.5495], [27.2735, -82.5560], [27.2740, -82.5630]],
  },
  {
    id: 'rc-longboat-pass',
    label: 'Longboat Pass Bridge — CLOSED',
    status: 'closed',
    line: [[27.4480, -82.6840], [27.4500, -82.6790], [27.4520, -82.6740]],
  },
  {
    id: 'rc-bahia-vista',
    label: 'Bahia Vista @ Phillippi — CLOSED',
    status: 'closed',
    line: [[27.3060, -82.5240], [27.3055, -82.5180], [27.3055, -82.5120]],
  },
  {
    id: 'rc-bee-ridge',
    label: 'Bee Ridge @ Phillippi — CLOSED',
    status: 'closed',
    line: [[27.2930, -82.5060], [27.2925, -82.5000], [27.2920, -82.4940]],
  },
  {
    id: 'rc-fruitville',
    label: 'Fruitville Rd between I-75 & Cattlemen — caution',
    status: 'caution',
    line: [[27.3360, -82.4730], [27.3360, -82.4620], [27.3360, -82.4520]],
  },
  {
    id: 'rc-us41-bayfront',
    label: 'US-41 northbound @ Bayfront — caution',
    status: 'caution',
    line: [[27.3260, -82.5440], [27.3350, -82.5470], [27.3440, -82.5510]],
  },
];

export const INCIDENT = {
  name: 'Sarasota County — Severe Flooding',
  startedAt: minsAgo(60 * 18),
  ics: 'ICS-209-2026-0512',
  what: 'Severe coastal and inland flooding across Sarasota and Venice. Storm surge along Siesta Key and Lido. PODs activated; mass care in coordination with Red Cross and Salvation Army.',
  impact: 'Approx. 4,200 displaced. 8 active sites. Power outages persisting in Sectors A & B; bridges to barrier islands intermittent.',
  controller: 'Cmdr. T. Reyes',
  shiftEndsAt: minsAgo(-(60 * 1 + 18)),
  staleThresholdMins: 120,
  taskingTimeoutOutMins: 30,
  taskingTimeoutLowMins: 90,
};

export { CATEGORIES_DEFAULT };
