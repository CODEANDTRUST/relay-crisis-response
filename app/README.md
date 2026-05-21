# Relay

A two-screen realtime supply tracker for crisis response.

Field volunteers tap one of three pills — **Stocked / Low / Out** — at any supply site, on any borrowed phone, with no app to install. The EOC sees it appear instantly on a priority-ordered tac board, over a real satellite map of the affected area, with flood zones and road closures overlaid.

Demo scenario: severe flooding in Sarasota County, Florida.

## Run it

```bash
npm install
npm run dev
```

Open <http://127.0.0.1:5173/>.

You'll land on a role picker. Two paths:

- **Open as field reporter** — the three-pill submission screen (§5.1), site picker (§5.2), and tasking inbox (§5.3).
- **Open EOC tac board** — the controller surface (§5.4): satellite map of Sarasota, priority-ordered card stack, situation panel, live ticker, site drawer (§5.5), tasking compose (§5.6), handoff brief (§5.7), sites admin (§5.9), audit/export (§5.10), and settings (§5.13).

Everything else is reachable from the landing-page surface index at the bottom.

## What's mocked

- **The data.** Sites, reports, taskings, ticker events, and the incident itself are static seed data in `src/relay/data.ts`. Nothing is persisted; reloading resets state.
- **The flood overlays and road closures.** Drawn against real Sarasota geography but not from a live model. In production these would feed from NOAA's National Water Model inundation forecasts, FEMA NFHL polygons clipped to current river-gauge readings, and the FL511 / county GIS road-closure feed.
- **SMS dispatch.** The compose modal shows what the outbound SMS would look like and lets the controller flow through it, but no SMS is actually sent. Production wires Twilio Programmable SMS with a webhook for inbound acknowledgments.

## What's real

- The map. **Esri World Imagery** satellite tiles (no API key required, attribution embedded), Leaflet renderer, real lat/lng for every site.
- The information architecture. Reporter is single-page-per-link with no navigation; EOC is a single Board with drawers over it and a top bar for the administrative surfaces.
- The Relay style system. Inter only, Paper/Ink/Signal palette, status colors paired with icons, 8px corners, no pill shapes, no gradients, 200ms motion ceiling.

## File map

```
src/
├── main.tsx              # entry — renders <Relay /> into #root
└── relay/
    ├── index.tsx         # Landing + routing between surfaces; Onboarding (§5.11); Incident Setup (§5.8)
    ├── types.ts          # Site, Report, Tasking, TickerEvent, Surface
    ├── data.ts           # SITES, TASKINGS, TICKER, INCIDENT, FLOOD_ZONES, ROAD_CLOSURES, MAP_CENTER
    ├── ui.tsx            # Shared primitives: RelayShell, Wordmark, StatusBadge, RelayButton, Card, Input, etc.
    ├── Reporter.tsx      # §5.1 status submit, §5.2 site picker, §5.3 tasking inbox
    └── EOCBoard.tsx      # §5.4 board, §5.5 drawer, §5.6 tasking compose, §5.7 handoff,
                          #  §5.9 sites admin, §5.10 audit/export, §5.13 settings
```

## Design source

The product thesis, primary user goals, non-goals, screen inventory, information architecture, functionality prioritization, technical integration notes, and competitive differentiation table all live in a separate design document (`../research/design-plan.md`). This codebase implements §4 (User flows), §5 (Screen inventory), §6 (Information architecture), and §7 (Must-have functionality for v1) of that plan.
