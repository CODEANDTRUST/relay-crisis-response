# Design Document: Field-to-EOC Disaster Coordination App
Working title: TacBoard (placeholder — the product is a tac board you can carry)

## 1. Product thesis

Emergency Operations Centers go blind the moment volunteers in the field stop reporting, because every existing tool assumes a credentialed user, a charged device, a stable network, and the patience to fill out a form — and field reality is "a stranger's iPhone, on the only cell tower working, at 11pm, with 12% battery" (user notes). Practitioners already vote with their feet: they default to Google Sheets and Google Maps, build DIY tools, and ask publicly for "any generic browser product that allows basic IM and posting text updates with multiple users in a shared space" (u/thecbrnguis). The competitive wedge — missed by WebEOC (login-walled, form-heavy), Crisis Cleanup (case-management mindset, not real-time supply), Ushahidi (citizen-report bias, not site-status), Juvare (enterprise procurement cycle), and Zello (voice only, no structured state) — is to make the site × category × status the atomic unit, accept submissions with zero login and zero keystrokes via QR / SMS short-link, and render the EOC view as a glance-able tac board ordered by what changed and what needs a response. We are building the digital T-card board, not another incident-management suite.

## 2. Primary user goals

Ranked. Five maximum.

1. Report a site's supply status in under 5 seconds, on a borrowed device, with no account. Segment: field volunteers / supply runners. Frequency: daily during an activation, several times per shift per site.
2. See, at a glance, every site that needs action right now. Segment: EOC controllers. Frequency: continuous during an activation — this is their screen.
3. Respond to an unmet-demand request and close the loop back to the field. Segment: EOC controllers + dispatched runners. Frequency: dozens of times per shift.
4. Hand off the operation to a relief shift or mutual-aid partner without losing state. Segment: controllers, IC. Frequency: every 12 hours (shift change) and occasionally cross-jurisdiction.
5. Reconstruct what happened, for the after-action report and reimbursement. Segment: controllers, finance/recovery staff. Frequency: post-incident, occasional — but the data must be captured continuously to exist later.

The fifth goal is included because the audit trail is what lets us deliver goal #1 without a login — a critical dependency.

## 3. Non-goals

- No SKU-level inventory. The unit is site × category × status, not item × quantity. "Tomato soup, 12 cans" is explicitly the wrong schema (user notes). Competitors that go granular here will keep being beaten by Google Sheets; we will not chase them.
- No citizen-facing intake in v1. Ushahidi's crowd-sourced model invites volume we can't triage in an activation. We serve coordinators and volunteers, not the affected public. Revisit post-v1.
- No push-to-talk / voice channel. Zello already does this and radios already exist. Voice is unstructured state; we are a structured-state product. We integrate with voice (timestamped text capture during a radio call) but do not replace it.
- No incident-creation ceremony. No "Activate Incident" button as the front door. Demos that open with that flow are the problem (user notes). A site can be reported before an incident formally exists; the incident is inferred from activity.
- No persistent user accounts for field reporters. Identity is captured per-submission (name + callback number, optional) and lives in the audit trail. We will not chase the Salamander/T-card credentialing market.
- No native desktop app for EOC. Browser-only. Controllers already juggle a dozen tabs; we will not be the thirteenth install.
- No AI-generated narrative summaries in v1. Translation, yes (see §7). Generated SitReps, no — the credibility cost of one hallucinated casualty count is unrecoverable.
- No financial / accounting back-end in v1. Captured in the audit trail for later export; not built into the product. (User notes flagged this as "bonus" — bonus is not must-have.)

## 4. User flows

### Flow A — Field reporter submits a status update (Goal 1)

**Entry points:**

- QR code physically posted at the site (printed by EOC, taped to a folding table at the POD).
- SMS short-link forwarded by another volunteer ("text STATUS to 88888").
- Direct URL pasted into a browser.
- No app install. No login screen. Ever.

**Steps:**

1. User opens link. Page loads under 5 KB. Geolocation requested but not required; if the QR encoded the site, location is irrelevant.
2. Page shows: site name (pre-filled from QR), three large status pills — Stocked / Low / Out — per category already active at that site (Water, Food, Formula, Diapers, Hygiene, Medical, Other).
3. User taps one pill. Submission is local-queued and sent. Confirmation: "Got it. Water at Estes — Low — 3:14pm. — Submitted as Guest."
4. Optional second tap: "I'm —" → typed name persists in localStorage for that device only. Optional callback number. Both stored against the submission, not against an account.
5. If offline: submission held in IndexedDB, retried with backoff, surfaced as "Queued (3)" badge. User can keep submitting; the queue drains when bandwidth returns.

**Decision points and chosen defaults:**

- Anonymous vs. named submission? Default anonymous. Named is one tap. Defended because the alternative — forcing identity up front — is the exact failure mode of every competitor.
- Which categories appear? Default to the categories already opened at that site by EOC; "Other (type one word)" is always last. Controller curates the list, not the reporter.
- Photo attachment? Optional, deferred upload. Never blocks submission. Bandwidth budget ~5 KB per text submission; photos upload when able.

**Failure states and recovery:**

- No network. Submission queues locally; user sees "Saved — will send when online." Queue persists across browser close.
- Dead battery mid-submit. Last-keystroke draft persists in localStorage; another volunteer can pick up the borrowed phone, re-open the link, and finish in one tap.
- Wrong site QR. "This isn't where I am" link in the footer → site picker by GPS or name search.
- Conflicting reports (two people report Water at the same site within 60s): both stored, latest displayed, both visible in the audit trail. We do not ask the user to reconcile.

Where competitors lose the user: WebEOC requires login → drops the volunteer at "Username." Crisis Cleanup requires case creation → drops them at a 12-field form. Survey123 works but requires advance configuration and a credentialed account. Our mechanism preventing that: the entire form is three buttons, the URL is the form, and identity is captured in the audit trail asynchronously rather than at the gate.
Success criteria: Time-to-first-tap < 5 seconds from QR scan. ≥90% of submissions completed (vs. abandoned). Submissions per active reporter per shift > 1 (proves repeated use, not one-and-done).

### Flow B — Controller monitors the tac board (Goal 2)

**Entry points:**

- Bookmarked URL on the EOC desktop, opened at shift start.
- Hand-off link from outgoing shift controller (Flow D).

**Steps:**

1. Load the Board view. Default layout: map on left (60%), tac-card stack on right (40%). Map shows every site as a colored dot — red (Out), amber (Low), green (Stocked), grey (no recent report).
2. Tac-card stack is ordered by what needs a response first, not by recency alone. Order rule: (a) Unanswered requests, (b) sites that went Out or Low in the last 15 minutes, (c) sites with no report in > 2 hours during an active incident, (d) everything else. Visual weight follows the order — the top three cards are larger.
3. Top-right: situation summary panel — what happened, current impact (sites Out / Low / Stocked counts), incident clock, last update timestamp. Editable by IC; read-only to others.
4. Live ticker below the situation panel: "POD 3 went LOW four minutes ago. Volunteer 'Maria' reported Water Out at Estes 7m ago. Mutual aid Truck 4 marked en route 11m ago."
5. Controller clicks a card → site detail drawer slides in (does not navigate away). Drawer shows full history, attached photos, current POC, all reports in chronological order, "Tasking" action.

**Decision points and chosen defaults:**

- Map first or list first? Map first, on load. Practitioners told us a Google Map of help requests is the backbone (user notes); we mirror what already works.
- What "stale" means. Default: no report in 2 hours during an active incident triggers grey-pulse on the map and pushes the card up the stack. Configurable per incident, not per user.
- Sorting. Action-needed first, not chronological. Defended in §6 against the obvious alternative.

**Failure states and recovery:**

- Map tile server down. Fall back to list-only with a banner; site dots render against a coordinate grid showing relative positions.
- Real-time feed lag. "Last sync 47s ago" indicator; manual refresh button. Never silently stale.
- Browser tab pinned but laptop slept. On wake, the feed replays missed events as a compressed "while you were away" summary at the top of the ticker.

Where competitors lose the user: WebEOC's dashboard has, per user research, "all equal weight visually" — open tickets, approved, awaiting feedback, tasks all stacked the same. The controller has to scan to find what matters. Our mechanism: explicit priority ordering, larger cards at the top, color and motion reserved for state changes. The board tells the controller where to look.
Success criteria: Controller can answer "what's the worst-off site right now?" in under 3 seconds from cold open. Time-from-Out-report to controller-acknowledgment < 5 minutes during an active incident.

### Flow C — Controller dispatches a response and closes the loop (Goal 3)

**Entry points:**

- Tap a red/amber card on the Board → Tasking action in the drawer.
- Live ticker → tap an event → drawer opens with Tasking pre-filled.

**Steps:**

1. Drawer shows "Task: Resupply Water at Estes Elementary." Controller picks a responder from a list of self-reported available runners (anyone who hit "I'm available" on their reporter link) or types a name.
2. Controller sets ETA expectation (15 min / 1 hr / 4 hr / custom) and taps Dispatch. System generates an SMS to the runner's callback number with a one-tap acknowledgment link.
3. Runner taps Accept on phone → card on board flips to "En route — Maria — ETA 25m." Runner taps Arrived → "On site." Runner taps the same Status pills as Flow A → card resolves.
4. If runner doesn't acknowledge in 5 min, card escalates back to top of stack with "Unacknowledged tasking — Maria" badge.

**Decision points and chosen defaults:**

- Auto-timeout for unconfirmed requests. User notes asked about this; default is 90 minutes for a Low, 30 minutes for an Out. After timeout, request re-pings the original reporter via SMS to reconfirm.
- Who can task whom? Anyone on a controller-tier session can task. No multi-tier approval workflow in v1. We absorb the complexity of permissioning rather than asking the controller to build a role tree mid-incident.

**Failure states and recovery:**

- Runner SMS doesn't deliver. System retries 3x over 10 min, then flags to controller with "Comms failure — try voice."
- Runner arrives, site has already been resupplied by someone else. Runner taps "Already handled" → card closes, audit trail notes both reports.
- Mistaken dispatch. Recall action on the card; runner gets "Stand down — recalled by EOC."

Where competitors lose the user: Juvare and WebEOC require the request, the approval, and the assignment to be separate records in separate screens. Our mechanism: one drawer, four taps, SMS round-trip — the same loop a controller would run on radio, instrumented.
Success criteria: ≥80% of taskings acknowledged within 5 minutes. Median time-from-Out-report to On-site-resolution measurably shorter than the same activation's previous-shift baseline (we capture this so controllers can prove the ROI internally).

### Flow D — Shift handoff (Goal 4)

Entry points: Outgoing controller hits "Handoff" 15 min before shift end.

**Steps:**

1. System generates a Handoff Brief — auto-composed from: situation summary panel, top 5 unresolved cards, top 5 recent resolutions, all open taskings, current staffing. Markdown, exportable to PDF or printed.
2. Outgoing controller annotates each open card with a one-line note ("Estes runner Maria, last contact 18:42, expected back by 20:00").
3. System generates a single share link with view+act access scoped to the incident. Sent to incoming controller via SMS / email / Slack.
4. Incoming controller opens link, sees the same board with a yellow "Handoff in progress" banner. Confirms receipt → banner clears, outgoing controller's session is marked relieved (not logged out — they can still observe).

**Decision points and chosen defaults:**

- Mutual-aid sharing. The same Handoff mechanism is how a neighboring county gets read access. One tap, scoped, time-bound. No "create a partner account" flow.

Failure states: Incoming controller doesn't show up at shift change → board does not lock; outgoing controller stays primary, system pings IC.
Where competitors lose the user: Handoff in WebEOC is "email a spreadsheet"; in Crisis Cleanup it's "re-explain over the phone." Our mechanism: the brief is always already written, because the board's state is the brief.
Success criteria: Handoff completes in under 5 minutes. Incoming controller does not ask "what's the situation?" verbally — they read it.

### Flow E — After-action export (Goal 5)

Entry points: Post-incident, controller or finance staff opens Incident → Export.

**Steps:**

1. Pick date range (default: incident duration). Pick format: CSV (per-event log), PDF SitRep timeline, or ICS-flavored summary (Tasking log, SitRep log, POD log).
2. Optional: include cost estimates per supply category (user notes asked about this — captured in v1 export, not displayed live in v1).
3. Generated file is downloadable and emailable. Audit trail preserved indefinitely; reporter identities included where captured.

Failure states: Export of a still-active incident produces a snapshot with "AS OF [timestamp] — INCIDENT ONGOING" header. Cannot generate an "official" final report until incident is marked Demobilized.
Where competitors lose the user: Post-incident reporting is usually a separate product. Our mechanism: the operational data and the reporting data are the same data.
Success criteria: AAR meeting opens with the exported PDF on screen, not a spreadsheet rebuilt from memory.

## 5. Screen inventory

Surfaces. Flat list. Every one has a defined empty/loading/error state.

### 5.1 Reporter — Status Submit (Field)

Purpose: The three-pill submission page reached via QR or SMS short-link. Must-have functionality:

- Site name banner (from QR payload or geolocation match).
- Per-category pill rows: Stocked / Low / Out. Tap = submit.
- Persistent "I'm —" name field (optional, localStorage).
- Optional callback number field (one tap to expand).
- Optional photo attach (deferred upload).
- Offline queue indicator with count.
- Footer: "Wrong site?" link, "What is this?" link (one-paragraph explainer).

Key data displayed: Site name, active categories (pulled from EOC site config), last reported status per category (so the reporter knows they're not duplicating). Primary actions: Tap pill → submit. Tap "Wrong site" → site picker. Empty state: No site context (link opened without QR) → site picker by GPS or name. Never a dead end. Loading state: Pills render immediately from cache; status sync indicator in corner. Submission shows local "Sent" instantly with a "Confirming…" subtext until ACK. Error state: Submission failure → "Saved locally — will send when online." Never "Try again." Serves goals: 1.

### 5.2 Reporter — Site Picker

Purpose: Fallback when QR is wrong or absent. Must-have functionality: Map with nearest 10 sites; text search; "My site isn't listed → request add" link that creates a Pending Site for controller approval. Empty state: No sites within 50 mi → "No active sites near you. Request to add one?" Loading state: Map placeholder with text list rendered first. Error state: GPS denied → text search only, no apology. Serves goals: 1.

### 5.3 Reporter — Tasking Inbox

Purpose: When a controller dispatches a runner, this is the page the SMS link opens. Must-have functionality: Task card (what / where / by when), Accept / Decline buttons, en-route → arrived → status pills (same as 5.1). Empty state: No assigned task → redirect to 5.1 for the runner's last-known site. Loading/error: As in 5.1. Serves goals: 1, 3.

### 5.4 EOC — Board (the tac board)

Purpose: The controller's whole world during an activation. Must-have functionality:

- Map pane (60% default, resizable) with color-coded site dots; click-through to drawer.
- Card stack (40%), priority-ordered, top three visually larger.
- Situation summary panel (top right): what / impact / clock / last update.
- Live event ticker.
- Filter chips: by category, by status, by sector.
- Search by site or reporter name.

Key data displayed: All sites for the active incident, their latest status per category, who reported, when, all open taskings, situation summary. Primary actions: Click card → drawer (5.5). Click ticker event → drawer pre-scrolled to that event. Click situation panel → edit modal (IC only). Click site dot → drawer. Empty state: No incident active → "No active incident. Start watching →" with a low-ceremony "watch" action (not "Activate Incident"). The incident is inferred from the first submission, not declared. Loading state: Skeleton cards render with last cached state; "Reconnecting…" in ticker. Error state: Feed disconnect → red banner "Last sync 47s ago — retrying" with manual refresh. Serves goals: 2, 3, 4.

### 5.5 EOC — Site Drawer

Purpose: Full history and action panel for one site, opens from the Board without losing context. Must-have functionality:

- Site header with name, POC, address, coordinates.
- Per-category status with full history (reverse chronological).
- Photo strip (deferred-uploaded photos).
- Tasking action (compose tasking → 5.6).
- Edit categories (add/remove what this site tracks).
- Audit trail toggle.

Empty state: Newly added site with no reports → "Awaiting first report. Share QR ↓" with one-tap printable QR. Loading/error: As in 5.4. Serves goals: 2, 3, 5.

### 5.6 EOC — Tasking Compose

Purpose: Small modal inside the drawer to dispatch a runner. Must-have functionality: Pick responder (from self-reported available runners or free type), set ETA expectation, Dispatch button. SMS round-trip happens server-side. Empty state: No available runners → free-text name + SMS number field. Error state: SMS gateway failure → "Couldn't send SMS — copy text to send manually" with the message pre-formatted. Serves goals: 3.

### 5.7 EOC — Handoff Brief

Purpose: Auto-composed shift handoff document. Must-have functionality: Generated brief preview, per-card annotation field, generate share link, mark handoff complete. Empty state: Brand-new incident, nothing to hand off → "Nothing to brief yet" with a back button. Error state: Share link generation failure → fallback to copy-paste brief text. Serves goals: 4.

### 5.8 EOC — Incident Setup

Purpose: Lightweight incident scaffolding, accessed once at activation start (or auto-created on first submission). Must-have functionality: Incident name (default: "[County] — [Date]"), incident clock start, ICS designation (optional), category set (default: Water, Food, Formula, Diapers, Hygiene, Medical, Other), share/invite link. Empty state: N/A (this is itself the empty-state of the system). Serves goals: 2, 4.

### 5.9 EOC — Sites Admin

Purpose: Add, edit, deactivate sites. Print QRs. Must-have functionality: Site list with status summary, add-site form (name, address, categories), bulk-print QR sheet (8.5×11 grid). Empty state: No sites → onboarding row "Add your first site → or paste a list." Serves goals: 2.

### 5.10 EOC — Audit / Export

Purpose: After-action and ongoing accountability. Must-have functionality: Filter by date range, category, site, reporter. Export CSV / PDF / ICS-summary. Empty state: No data in range → "No events in this window." Serves goals: 5.

### 5.11 Onboarding — Controller (first run)

Purpose: First-time setup for a new EOC. Must-have functionality: Three steps — name your incident, add 1-3 sites, print/share QRs. No more. Success state: "Your board is live. Share this link with your team." Serves goals: 2.

### 5.12 Onboarding — Reporter

Purpose: None as a screen. The QR is the onboarding. If a reporter ever sees an onboarding screen, we failed. The one-paragraph "What is this?" link on 5.1 is the only allowed surface. Serves goals: 1.

### 5.13 Settings — Incident

Purpose: Controller-tier config for an active incident. Must-have functionality: Stale-threshold (default 2h), tasking timeout (default 30m Out / 90m Low), category defaults, mutual-aid share toggles. Serves goals: 2, 4.

### 5.14 Error — Offline (global)

Purpose: Banner/state when network is gone. Must-have functionality: "Working offline — X actions queued." Never modal, never blocks input. Serves goals: 1, 2.

### 5.15 Error — Permission denied

Purpose: When a session lacks scope (e.g., reporter link opened against the EOC URL). Must-have functionality: "This link is for field reporting. Open the EOC board? →" with a soft redirect, not a 403. Serves goals: All.

## 6. Information architecture

Two distinct interfaces, one data model.

- Reporter surface: No navigation. Single-page-per-link. Each QR/SMS link lands on exactly one screen (Status Submit, Tasking Inbox, or Site Picker). No tabs, no menus, no back-button traps. The URL is the navigation.
- EOC surface: Single primary screen — the Board (5.4). Everything else is either a drawer that slides over the Board (5.5, 5.6) or a secondary tab accessed via a top bar: Board / Sites / Handoff / Audit / Settings. The drawer pattern means the controller never loses sight of the live ticker while drilling in.

Defense against the obvious alternative — a traditional sidebar drawer with Dashboard / Requests / Tasks / Resources / Reports / Settings (the WebEOC / Juvare pattern): Sidebar nav forces controllers to context-switch between equal-weight screens, which is exactly the failure mode user research identified — "the interface should really prioritize requests that you have not responded to yet" (user notes). A sidebar implies equal modes. The Board is not a mode; it is the view. Sites, Handoff, Audit, and Settings are administrative surfaces accessed rarely; they live in a top bar precisely because they're not where the controller's attention lives. The drawer pattern over the Board also means a state change in the live ticker is still visible while the controller is mid-task — sidebars hide that.

## 7. Functionality prioritization

Must-have (v1, blocks launch)

- QR-link Status Submit (5.1) with three-pill status, optional name, optional callback, offline queue.
- Site Picker fallback (5.2).
- EOC Board (5.4) with map, priority-ordered card stack, situation panel, live ticker.
- Site Drawer (5.5) with full history.
- Tasking Compose + SMS round-trip + Runner Tasking Inbox (5.3, 5.6).
- Incident Setup (5.8).
- Sites Admin with bulk QR print (5.9).
- Offline-first reporter with IndexedDB queue, ≤5 KB submissions.
- Audit trail (data layer); CSV export (5.10).
- ICS vocabulary throughout (POD, POC, Tasking, SitRep, Demob).
- Dark mode for the Board (controllers work in windowless rooms; Crisis Cleanup's dark UI was specifically called out positively).
- Shift Handoff (5.7).

Every item above traces to a specific user need: QR-no-login → "do not make anyone register"; three pills → "default to one-tap status pills, zero keystrokes"; map first → "a Google Map of help requests has become the backbone"; priority-ordered stack → "the interface should really prioritize requests that you have not responded to yet"; ICS vocabulary → "the trojan horse for credibility"; ≤5 KB → "SMS messages take up a lot less cell bandwidth"; handoff → "We have visited a dozen different EOCs… windows are illegal" (long shifts, frequent rotation); dark mode → Crisis Cleanup precedent + windowless rooms.
Should-have (v1.1, defined trigger)

- SMS-only intake path (text STATUS to short code, parse free-text submission). Trigger: v1 reporters successfully complete >90% on a borrowed phone; SMS path then captures the remaining no-data-plan tail.
- Live language translation on submission text. Trigger: multilingual incident logged in production (any submission flagged as non-English by language detection).
- Photo upload / map overlay showing site photos and flood imagery on the map. Trigger: v1 incidents accumulate >100 deferred photos awaiting a viewer.
- Smartwatch quick-submit (Apple Watch / Wear OS one-tap status). Trigger: runner segment requests it in feedback — currently speculative.
- Push notifications to runners with active taskings. Trigger: SMS round-trip ack rate falls below 80% (suggests SMS isn't enough).
- Mutual-aid cross-jurisdiction shared boards. Trigger: two adjacent v1 deployments request shared visibility on the same incident.

Won't-have-yet (deliberately deferred)

- Citizen-facing intake. Condition to revisit: v1 demonstrates operational stability across 5+ incidents with no false-signal floods.
- SKU-level inventory. Condition: a v1 customer demands it and shows we'd lose the contract without it — and even then, evaluate whether to lose the contract instead.
- AI-generated SitRep narratives. Condition: a verifiable hallucination rate <0.1% on closed-domain emergency data, plus a controller-in-the-loop edit step that doesn't slow the brief below the current auto-compose speed.
- Voice / push-to-talk. Condition: integration request from a Zello/radio deployment; we'd embed, not rebuild.
- Accounting/cost back-end as a live feature. Condition: post-AAR customer demand from finance staff with documented dollar-recovery use case. Captured in audit trail in v1 regardless.
- Native iOS/Android apps. Condition: a measured friction with the PWA path on a specific OS version we cannot work around. Browser-first is a defining commitment.
- T-card / Salamander identity integration. Condition: a specific customer where credentialing is a procurement gate.

## 8. Technical integration notes

QR-link Status Submit (5.1)

- Data sources / APIs: Internal site-config API; submissions POST to /api/v1/submissions with a signed token derived from the QR payload (site_id + incident_id + HMAC). Token grants scope=submit on that site only; never grants read of the Board.
- Auth / permissions / privacy: No user auth. Token-scoped. Reporter name and callback number, if provided, are personal data — stored encrypted at rest, exported in the audit trail, deletable per-incident on Demob.
- Sync / offline / conflict-resolution: IndexedDB queue with at-least-once delivery; server deduplicates on client-generated UUID. Conflicting reports on the same site within 60s: both stored, latest displayed. Vector clock on category-level state; last-writer-wins with full history retained.
- Third-party dependencies: Twilio (or equivalent) for SMS short-link generation and inbound parsing. Mapbox or MapLibre + OSM tiles for the map. No analytics SDK in the reporter bundle — bundle budget is sacred.
- Non-obvious risks: A QR code printed on Day 1 must remain valid on Day 14 of an incident; token cannot expire mid-activation. Tradeoff: a leaked QR is abusable for the incident duration. Mitigation: per-site rate limit, controller can revoke + reprint.
- What could go wrong in production: A telecom carrier rate-limits our SMS short-code during a real incident because volume looks spam-like — we lose the SMS path exactly when we need it most.

EOC Board (5.4)

- Data sources / APIs: WebSocket subscription /api/v1/incident/:id/stream; REST fallback polling every 10s. Authoritative store is the event log; the Board renders a projection.
- Auth / permissions / privacy: Magic-link auth for controllers (email/SMS); session persists 12 hours, refresh on activity. No password. IC-tier permissions for situation-panel edits.
- Sync / offline / conflict-resolution: Board is read-mostly; the only writes are tasking and edits. Conflicts on edit (two controllers editing situation panel) → optimistic lock with merge prompt.
- Third-party dependencies: Same map provider as reporter. No tracking/analytics on the EOC surface either.
- Non-obvious risks: WebSocket connections die silently behind corporate proxies common in government EOCs. Must heartbeat and surface staleness aggressively.
- What could go wrong in production: EOC's network policy blocks WebSocket and we silently fall back to slow polling; controller believes the board is live when it isn't. Mitigation: explicit "Last sync 47s ago" indicator, never hidden.

Tasking + SMS round-trip (5.6, 5.3)

- Data sources / APIs: Twilio Programmable SMS for outbound; webhook for inbound replies. Tasking state machine: dispatched → acked → en_route → arrived → resolved | recalled | timed_out.
- Auth / permissions / privacy: Inbound SMS matched against a one-time tasking token; reply doesn't require app open. PII (phone numbers) stored per-tasking, purged on Demob + retention window.
- Sync / offline: Outbound SMS retried with exponential backoff; inbound has no offline concept (carrier handles).
- Third-party dependencies: Twilio. This is a single point of failure. A secondary provider (e.g., MessageBird) wired behind a circuit breaker is a v1.1 should-have.
- Non-obvious risks: SMS delivery in disaster zones is exactly when carrier networks are most degraded. Mitigation: app-channel push (when reporter has the link open) bypasses SMS entirely.
- What could go wrong in production: Twilio outage during an actual disaster.

Audit trail / Export (5.10)

- Data sources / APIs: Append-only event log; export job reads from log, generates artifact, signs with incident-scoped key.
- Auth / permissions / privacy: Exports include PII (reporter names, callbacks). Export gated to IC-tier; download URLs are short-lived and signed.
- Sync / offline: Export is a server-side batch job; user is notified when ready, never blocks UI.
- Third-party dependencies: PDF rendering library (server-side). No external dependency.
- Non-obvious risks: AAR exports may be FOIA-requested. Schema must be stable across versions so old exports remain reproducible.
- What could go wrong in production: A controller emails an export containing volunteer phone numbers to a public mailing list. Mitigation: PII-redact toggle, default off for internal export, default on for shareable export.

Cross-cutting

- Bundle size: Reporter HTML+JS+CSS budget 50 KB gzipped. Hard ceiling. Map is lazy-loaded only if needed.
- Browser support: Last 3 versions of mobile Safari and Chrome. iOS Safari is the long pole because it's "the only cell tower working at 11pm" device of choice.
- Hosting: Multi-region with geographic failover. Static reporter assets on a CDN with long-cache + content-hashed filenames.
- Observability: Aggressive logging of submission latency, SMS delivery, WebSocket reconnects. Surface a public status page during incidents.

## 9. Differentiation table

| Must-have feature | WebEOC | Crisis Cleanup | Juvare / Ushahidi / Zello | TacBoard |
|---|---|---|---|---|
| Field submission entry | Login wall, full form | Case creation with multi-field form | Juvare: licensed user; Ushahidi: SMS but citizen-oriented; Zello: voice only | QR or SMS short-link, three taps, no login, ≤5 KB payload |
| Status granularity | Free-form text fields | Case status (open/closed/in-progress) | Juvare: SKU-level; Ushahidi: free-form | Site × Category × Stocked/Low/Out — gut-level, not SKU |
| EOC overview | Customizable boards, all equal weight | Map of cases, list view | Juvare: dashboards; Ushahidi: map | Priority-ordered tac board: action-needed cards larger; map+stack default |
| Tasking & loop closure | Separate request / approval / assignment screens | Case assignment flow | Juvare: workflow engine | One drawer, four taps, SMS round-trip with stateful acknowledgment |
| Offline / low-bandwidth | Browser-dependent, no first-class offline | Mobile app cache | Ushahidi has SMS path; Zello degrades on bandwidth | IndexedDB queue + ≤5 KB submits + SMS fallback as v1.1 |
| Vocabulary | ICS-aware but enterprise-gated | NGO/volunteer vocabulary | Juvare: enterprise/ICS; Ushahidi: humanitarian | ICS throughout (POD, POC, Tasking, SitRep, Demob) — credibility wedge |
| Shift handoff | Email a spreadsheet | Verbal / informal | Juvare: workflow but heavyweight | Auto-composed brief from board state; one-tap scoped share link |
| Onboarding to use | Customer-success training | Org sign-up + training | Juvare: months; Zello: install + channel | Reporter: 0 seconds. Controller: 3 steps, under 2 minutes |
| Dark mode for EOC | No / limited | Yes (called out positively in user notes) | Varies | Yes, default in low-light environments |
| Audit trail / export | Yes, but locked into platform | Case export | Yes | Append-only log; CSV/PDF/ICS export; FOIA-aware schema |

No row's "better" column is weak. The wedge in every row is the same: we cut ceremony at the input, we re-prioritize at the output, we keep the schema honest to how practitioners actually talk.

## 10. Open questions and assumptions

Blocking

1. Procurement model. Is the buyer the county EOC (B2G, slow sales cycle, RFP) or an NGO partner like a VOAD chapter (faster, lower ACV)? Assumed: NGO/VOAD as the first wedge, with county adoption following from joint activations. Affects pricing, support model, and compliance burden (CJIS? StateRAMP?). Need an answer before build because data-residency requirements differ.
2. SMS short-code provisioning. Short-code approval (US carriers) takes 8–12 weeks. Assumed: we start with a 10DLC long code for v1 and pursue short-code in parallel. Need to confirm that 10DLC throughput is sufficient for a county-scale activation (rough estimate: 1,000 SMS / hour peak).
3. Identity capture floor. Some jurisdictions may legally require credentialed volunteer identity for liability/insurance. Assumed: the audit trail (name + callback per submission, immutable log) satisfies most jurisdictions; where it doesn't, the customer accepts the limitation or we cut them. Need legal review before pitching the first government customer.
4. Map provider licensing. Mapbox commercial terms vs. self-hosted MapLibre + OSM. Assumed: MapLibre + OSM for cost and resilience. Need to verify offline tile-caching is permitted under OSM license at our usage scale.

Non-blocking

5. What counts as an "active incident" automatically? Assumed: first submission to a non-archived site within 4 hours of the previous submission starts an incident clock; controller can rename and formalize. Revisable after first activation observation.
6. Default stale-threshold of 2 hours. Assumed from "no report in 2 hours" as a reasonable proxy. Tunable per incident; will be calibrated post-launch.
7. Tasking timeout values (30m Out / 90m Low). Assumed. Same calibration plan.
8. Photo retention. Assumed: 90 days post-Demob unless customer requests longer. Storage cost is non-trivial at scale.
9. Whether to support a single account holding multiple incidents. Assumed yes for a county-level controller; each incident is its own board. Trivial to extend.
10. Smartwatch UX details. Deferred to v1.1; assumption is that a watch is a glance + one-tap surface mirroring the three pills.
11. Translation provider. Deferred to v1.1; assumption is a managed service (DeepL / Google Cloud Translate) with the caveat that translation is advisory, never authoritative — the original-language submission is the source of truth in the audit trail.
12. Cost-of-supplies capture in audit trail. Assumed we capture controller-entered cost estimates as optional metadata on supply categories per site, exported but not displayed in the live UI. User notes flagged this as bonus; we honor that framing.
