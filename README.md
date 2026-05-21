# Relay

**A two-screen, real-time supply tracker for crisis response.**

Field volunteers tap one of three pills — **Stocked / Low / Out** — at any supply site, on any borrowed phone, with no app to install and no account to create. The Emergency Operations Center (EOC) sees it appear instantly on a priority-ordered tac board, over a real satellite map of the affected area, with flood zones and road closures overlaid.

Relay was built at [Code and Trust](https://codeandtrust.com) as a short design-and-build exercise: ground a product in real practitioner pain, then ship a working front-end demo. This repository is open-sourced so others can study, reuse, or build on both the front-end code and the UX research behind it.

> **Note on naming.** The design document in `research/` carries the working title *TacBoard*. The product was later named **Relay** — "it captures the core mechanic, the handoff between field and command, and it survives radio chatter." The two names refer to the same product.

## What's in this repository

The repo has two halves — the front-end demo, and the research it was built on.

```
relay/
├── app/        The Relay front-end — a Vite + React + TypeScript demo
└── research/   The UX research and design documents that informed it
```

You can take either half on its own: clone `app/` to run or fork the interface, or read `research/` as a worked example of evidence-led product design.

## app/ — the front-end

A working front-end demo of both Relay surfaces: the field **Reporter** and the **EOC tac board**. The demo scenario is severe flooding in Sarasota County, Florida.

```bash
cd app
npm install
npm run dev
```

Then open <http://127.0.0.1:5173/>. You'll land on a role picker with two paths — *Open as field reporter* and *Open EOC tac board* — and a surface index for everything else.

The data is mocked (static seed data; nothing is persisted, reloading resets state). What's **real** is the satellite map (Esri World Imagery tiles, no API key required), the information architecture, and the Relay design system. See [`app/README.md`](app/README.md) for the full surface-by-surface walkthrough and file map.

Built with React 19, TypeScript, Vite, and Leaflet.

## research/ — the research and design

The research half is a complete, evidence-led design package. Every design implication traces back to a verbatim quote from a real user.

| File | What it is |
|---|---|
| [`design-plan.md`](research/design-plan.md) | The full design document — product thesis, user goals, non-goals, user flows, screen inventory, information architecture, prioritization, technical notes, and a competitor differentiation table. |
| [`design-the-app-prompt.txt`](research/design-the-app-prompt.txt) | The master prompt used to generate the design document from raw research notes. |
| [`STYLES.md`](research/STYLES.md) | The Relay brand and style guide — color, type, components, motion. |
| [`competitive-research-summary.md`](research/competitive-research-summary.md) | Synthesis of 250+ App Store, Google Play, and Reddit reviews across five competitors. |
| [`competitive-research-long/`](research/competitive-research-long) | The per-competitor deep dives behind that synthesis: Crisis Track, CrisisCleanup, Sahana Eden, Ushahidi, Zello. |
| [`user-research-summary.md`](research/user-research-summary.md) | A 10-minute distillation of practitioner needs, drawn from 1,780 Reddit posts and 108 YouTube transcripts. |
| [`user-research-long.md`](research/user-research-long.md) | The full raw research corpus the summary was distilled from. All source material is public. |

See [`research/README.md`](research/README.md) for a guided reading order.

## The short version of the findings

The research surfaced a real, underserved gap. None of the obvious "competitors" actually do real-time supply tracking — Crisis Track is FEMA damage assessment, CrisisCleanup matches survivors to volunteer crews, Zello is push-to-talk voice, Ushahidi is incident mapping. The real incumbents are enterprise EOC platforms (WebEOC, D4H, Veoci) that field volunteers never touch. Practitioners fall back to shared Google Sheets.

Seven things the user voices said to build for: offline-first sync, self-serve onboarding in under 60 seconds, support for individuals (not just orgs), no UI hijacking, reliability over features, a clean two-screen field/command split, and distribution by phone number rather than an app-store link. Relay's design is a direct response to those seven.

## License

Released under the [MIT License](LICENSE). You're free to use, modify, and distribute this code and research, including commercially, with attribution. The research corpus quotes publicly posted reviews and forum content; those quotes remain the work of their original authors.

## Credits

Designed and built by Vicky at Code and Trust.
