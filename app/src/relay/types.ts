export type Category =
  | 'Water'
  | 'Food'
  | 'Formula'
  | 'Diapers'
  | 'Hygiene'
  | 'Medical'
  | 'Other';

export type Status = 'Stocked' | 'Low' | 'Out';

export type Site = {
  id: string;
  name: string;
  sector: string;
  address: string;
  coords: { x: number; y: number };
  lat: number;
  lng: number;
  poc: { name: string; phone: string } | null;
  categories: Category[];
  state: Record<Category, { status: Status; reportedBy: string | null; at: string }>;
  reports: Report[];
};

export type Report = {
  id: string;
  siteId: string;
  category: Category;
  status: Status;
  reporter: string | null;
  callback: string | null;
  at: string;
  note?: string;
};

export type Tasking = {
  id: string;
  siteId: string;
  category: Category;
  runner: string;
  runnerPhone: string;
  eta: string;
  state: 'dispatched' | 'acked' | 'en_route' | 'arrived' | 'resolved' | 'recalled' | 'timed_out' | 'unack';
  createdAt: string;
};

export type TickerEvent = {
  id: string;
  at: string;
  kind: 'report' | 'tasking' | 'state' | 'system';
  siteId?: string;
  text: string;
  status?: Status;
};

export type Surface =
  | 'home'
  | 'reporter.submit'
  | 'reporter.picker'
  | 'reporter.tasking'
  | 'eoc.board'
  | 'eoc.sites'
  | 'eoc.handoff'
  | 'eoc.audit'
  | 'eoc.settings'
  | 'eoc.setup'
  | 'eoc.onboarding';
