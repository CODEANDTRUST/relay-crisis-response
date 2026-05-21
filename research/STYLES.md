# Relay — Brand & Style Guide

Reference for building the Relay supply-tracker app and any related surfaces. Pair this file with `Event_Homepage_STYLES.md` when working on the Code/+/Trust ecosystem; Relay is a **sub-brand** of Code/+/Trust with its own restrained operational voice.

**Brand premise:** Relay is a two-screen realtime supply tracker for crisis response. Field workers report what they have; command center watches it appear live. The visual system should feel closer to air traffic control than to SaaS — competent, calm, operational. Not designed-feeling. Not delightful. Trust comes from restraint.

---

## 0. Quick Reference for Claude Code

When generating any UI inside the Relay app, follow these defaults unless explicitly overridden:

- **Base font:** Inter (single family, no secondary display face)
- **Background:** `#FAFAF7` (Paper) — never pure white
- **Body text:** `#0F1419` (Ink) — never pure black
- **Primary action:** `#0066CC` (Signal) — solid fill, white text
- **Status colors:** Go `#2E7D4F`, Watch `#D97706`, Critical `#C8312C` — always paired with an icon or text label, never color alone
- **Corners:** 8px on cards/buttons, 4px on inputs, no pill shapes
- **Icons:** Lucide, stroke-width 1.75px, paired with text in the field UI
- **Motion:** 200ms fade only for live updates. No bouncing, sliding, or celebration animations.
- **Minimum tap target:** 48×48px with 16px padding
- **Numbers in tables/dashboards:** use `font-variant-numeric: tabular-nums`

---

## 1. Color Palette

### Core tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `INK` | `#0F1419` | Primary text, command UI base. Near-black with a hint of blue. Easier on the eyes than pure black, especially on OLED field phones. |
| `PAPER` | `#FAFAF7` | Page background. Warm off-white. Pure white on a phone in sunlight is brutal; this reduces glare without looking dingy. |
| `STEEL` | `#5C6670` | Secondary text, borders, metadata. Mid-gray with cool undertone. Readable, recedes. |
| `MIST` | `#E4E6E3` | Dividers, disabled states, table grid lines. |
| `SIGNAL` | `#0066CC` | Primary action, "live" indicator, links. Confident operational blue. Trust, infrastructure — not corporate. |
| `GO` | `#2E7D4F` | Supply available, healthy state. Forest green. Mature, not Slack-green. |
| `WATCH` | `#D97706` | Low stock, attention needed. Amber. The warning that isn't a panic. |
| `CRITICAL` | `#C8312C` | Urgent need, stockout. **Reserved exclusively for genuine crisis states.** If everything is critical, nothing is. |

### CSS variables

```css
:root {
  /* Core surfaces */
  --color-ink:      #0F1419;
  --color-paper:    #FAFAF7;
  --color-steel:    #5C6670;
  --color-mist:     #E4E6E3;

  /* Signal & status */
  --color-signal:   #0066CC;
  --color-go:       #2E7D4F;
  --color-watch:    #D97706;
  --color-critical: #C8312C;

  /* Opacity-modulated variants for hover/disabled */
  --color-signal-hover:   #0052A3;
  --color-signal-pressed: #003D7A;
  --color-ink-faint:      rgba(15, 20, 25, 0.55);
  --color-ink-muted:      rgba(15, 20, 25, 0.7);
}
```

### Tailwind config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        ink:      '#0F1419',
        paper:    '#FAFAF7',
        steel:    '#5C6670',
        mist:     '#E4E6E3',
        signal:   { DEFAULT: '#0066CC', hover: '#0052A3', pressed: '#003D7A' },
        go:       '#2E7D4F',
        watch:    '#D97706',
        critical: '#C8312C',
      }
    }
  }
}
```

### Allowed pairings (WCAG AA verified)

| Foreground | Background | Use case |
|-----------|------------|----------|
| INK | PAPER | Primary body text, headings |
| STEEL | PAPER | Metadata, timestamps, secondary labels |
| SIGNAL | PAPER | Links, primary action labels on light surfaces |
| PAPER | INK | Inverted UI (command dashboard top bar) |
| PAPER | SIGNAL | Primary button label |
| PAPER | GO | Healthy status badge |
| PAPER | WATCH | Attention badge |
| PAPER | CRITICAL | Urgent badge (use sparingly) |

**Forbidden pairings:** any status color (GO/WATCH/CRITICAL) on its color sibling. Status colors only live on PAPER or INK surfaces.

### Color rules

1. **Red must be earned.** CRITICAL is the rarest color in the UI. If you find yourself reaching for it for emphasis, choose a different token.
2. **Color alone never carries meaning.** Every status color must be accompanied by an icon or a text label. Field workers may be colorblind; command operators may be on cheap monitors.
3. **No gradients.** Solid fills only. Gradients read as decorative and undermine the operational tone.
4. **No drop shadows on UI elements.** Cards can have a subtle elevation (see §4) but interactive elements should be flat.

---

## 2. Typography

### Font stack

```css
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
```

One typeface across both contexts. Inter, weights 400 / 500 / 600. Free, exceptional legibility at small sizes, large x-height, tabular figures available.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

### Type scale — Field worker (mobile)

| Element | Size | Weight | Line height | Notes |
|---------|------|--------|-------------|-------|
| Primary item count | 28px | 600 | 1.2 | Glanceable, glove-friendly |
| Action button label | 20px | 600 | 1.2 | Always uppercase, charSpacing 0.05em |
| Body / form labels | 17px | 500 | 1.5 | |
| Item label (e.g. WATER) | 11px | 600 | 1.2 | Uppercase, charSpacing 0.08em |
| Metadata, timestamps | 14px | 400 | 1.5 | Color: STEEL |
| Status microcopy | 12px | 400 | 1.4 | Color: STEEL |

### Type scale — Command center (desktop)

| Element | Size | Weight | Line height | Notes |
|---------|------|--------|-------------|-------|
| Page title | 24px | 600 | 1.2 | |
| Section header | 16px | 600 | 1.2 | Uppercase, charSpacing 0.04em |
| Big metric callout | 32px | 600 | 1.1 | Tabular figures **required** |
| Table header | 12px | 600 | 1.2 | Uppercase, charSpacing 0.05em, color STEEL |
| Table body | 14px | 400 | 1.5 | Tabular figures on number columns |
| Body / notes | 14px | 400 | 1.5 | |
| Timestamp, meta | 12px | 400 | 1.4 | Color: STEEL |

### Typography rules

1. **Tabular figures on for all numbers** in tables, dashboards, and supply counts. Use `font-variant-numeric: tabular-nums` or Inter's built-in `tnum` feature.
2. **Never use italic.** It reads as marketing tone.
3. **Uppercase sparingly.** Reserved for section headers, button labels, status badges, and item labels. Always pair uppercase with letter-spacing (0.04em–0.08em).
4. **Never use a second display typeface.** Resist the urge to add Bebas Neue, Space Mono, or similar. Inter only.
5. **No font weights below 400 or above 600.** Hairline weights look like dashboards from 2014; black weights feel marketing-y.

---

## 3. Layout & Spacing

### Spacing scale

```css
--space-1:  4px;   /* hairline gaps */
--space-2:  8px;   /* internal element padding */
--space-3:  12px;  /* tight grouping */
--space-4:  16px;  /* default padding, button padding */
--space-5:  24px;  /* card padding, section breaks */
--space-6:  32px;  /* section-to-section gap */
--space-8:  48px;  /* major section breaks */
--space-10: 64px;  /* page-level rhythm */
```

### Field worker UI

- **One decision per screen.** Generous whitespace.
- Container padding: 24px horizontal, 32px vertical
- Stacked item rows: 12px gap between rows
- Bottom action button: anchored, 24px from the bottom safe area, full-width minus 24px on each side

### Command center UI

- **High density with strict grouping.** Bloomberg-restraint, not consumer-dashboard sprawl.
- Top nav bar: 56px height, INK background
- Page padding: 24px
- Metric callouts: 4-up grid, 24px gap
- Activity feed rows: 8px vertical padding, 16px between time / site / message columns

---

## 4. Components

### Card

```css
background: var(--color-paper);
border: 1px solid var(--color-mist);
border-radius: 8px;
padding: 24px;
/* Optional, very subtle elevation when card sits on a non-paper surface */
box-shadow: 0 1px 2px rgba(15, 20, 25, 0.04);
```

### Primary button (Signal)

```css
background: var(--color-signal);
color: var(--color-paper);
border: none;
border-radius: 8px;
padding: 14px 24px;
font: 600 16px/1 'Inter', sans-serif;
letter-spacing: 0.04em;
text-transform: uppercase;
min-height: 48px;
cursor: pointer;
transition: background-color 120ms ease;

/* Field UI variant — full width, taller */
&.field {
  width: 100%;
  min-height: 56px;
  font-size: 14px;
}

&:hover  { background: var(--color-signal-hover); }
&:active { background: var(--color-signal-pressed); }
&:disabled { background: var(--color-mist); color: var(--color-steel); cursor: not-allowed; }
```

### Secondary button (Outline)

```css
background: transparent;
color: var(--color-ink);
border: 1.5px solid var(--color-ink);
border-radius: 8px;
padding: 12px 22px;
font: 600 16px/1 'Inter', sans-serif;
letter-spacing: 0.04em;
text-transform: uppercase;
min-height: 48px;
```

**Forbidden:** pill-shaped buttons (`border-radius: 999px`), gradient buttons, drop-shadow buttons, multi-color buttons. Anything that reads as consumer-app delight.

### Input field

```css
background: var(--color-paper);
border: 1.5px solid var(--color-mist);
border-radius: 4px;
padding: 12px 16px;
font: 400 16px/1.4 'Inter', sans-serif;
color: var(--color-ink);
min-height: 48px;

&:focus {
  outline: none;
  border-color: var(--color-signal);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.15);
}

&::placeholder { color: var(--color-steel); }
```

### Status badge

```css
display: inline-flex;
align-items: center;
gap: 6px;
padding: 4px 10px;
border-radius: 4px;
font: 600 11px/1 'Inter', sans-serif;
letter-spacing: 0.06em;
text-transform: uppercase;
color: var(--color-paper);

&.go       { background: var(--color-go); }
&.watch    { background: var(--color-watch); }
&.critical { background: var(--color-critical); }
```

Each badge MUST include an icon (Lucide: `CheckCircle`, `AlertTriangle`, `AlertOctagon`) or its uppercase label. Never empty color blocks.

### Item chip (field UI supply row)

```
┌──────────────────────────────────────┐
│ ●  WATER                       247   │
└──────────────────────────────────────┘
```

```css
display: flex;
align-items: center;
gap: 12px;
padding: 16px;
background: var(--color-paper);
border: 1px solid var(--color-mist);
border-radius: 8px;
min-height: 56px;

.status-dot { width: 10px; height: 10px; border-radius: 50%; }
.label      { flex: 1; font: 600 11px/1 'Inter'; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-ink); }
.count      { font: 600 20px/1 'Inter'; color: var(--color-ink); font-variant-numeric: tabular-nums; }
```

### Live update row (command activity feed)

```
│ JUST NOW   SITE 14 / GRID C4   200 water bottles arrived
```

- 4px-wide colored left accent bar (Signal blue for new, status color for state changes)
- Row appears with a 200ms opacity fade-in
- Accent bar fades after 3 seconds to MIST
- Order: time (mono-weight tabular), site code (mono-weight tabular bold), message (body)

---

## 5. Iconography

**Library:** [Lucide](https://lucide.dev) (`lucide-react`, `lucide-icons`, etc.). Stroke-based, consistent geometry.

**Stroke width:** 1.75px (override Lucide's default 2px for a slightly less assertive feel)

**Sizes:**
- Field UI: 24px (matches the 48px tap target with 12px padding)
- Command UI inline: 16px
- Status badge icons: 12px
- Header / nav icons: 20px

**Color:** match surrounding text color. Status icons take the status color.

**Rule:** in the field worker app, every icon must have an accompanying text label. Icons alone fail under stress. In the command UI, icon-only is acceptable for table-row affordances (sort, expand, dismiss) where the icon is supported by column context.

---

## 6. Motion

Almost none.

| Interaction | Spec |
|-------------|------|
| Button hover | 120ms ease, background-color only |
| Input focus | 120ms ease, border-color + box-shadow |
| Page transition | None. Instant. |
| New live report appears | 200ms fade-in opacity 0 → 1, with Signal-blue left accent that fades to MIST over 3 seconds |
| Status change on existing row | 200ms cross-fade of the status color |
| Modal open | 150ms fade backdrop + 150ms slide-up 8px |

**Forbidden:**
- Bouncing, springing, or elastic easing
- Slide-in animations on content load
- Confetti, sparkles, or any celebration motion
- Loading spinners on routine actions (use skeleton states instead)
- Pulsing on non-live elements

The "live" feel comes from new content *appearing*, not from existing content *moving*.

---

## 7. Wordmark & Logo

The Relay wordmark is **Inter 600 set in INK**, accompanied by a **6×6px solid square in SIGNAL blue** positioned to the left of the wordmark with 8px gap.

```
■ Relay
```

```html
<div class="wordmark">
  <span class="wordmark-mark"></span>
  <span class="wordmark-text">Relay</span>
</div>
```

```css
.wordmark { display: inline-flex; align-items: center; gap: 8px; }
.wordmark-mark { width: 6px; height: 6px; background: var(--color-signal); }
.wordmark-text { font: 600 18px/1 'Inter', sans-serif; color: var(--color-ink); letter-spacing: -0.01em; }
```

**Sizes:**
- Nav bar: 18px wordmark + 6px square
- Footer: 14px wordmark + 4px square
- Splash / loading: 32px wordmark + 10px square

**Forbidden:** logo lockups, monogram marks, illustrated mascots, abbreviations ("R"), gradients, outlines, drop shadows, animations.

---

## 8. Voice & Microcopy

The product copy should match the visual restraint.

**Do:**
- "200 water bottles at C4."
- "Stockout reported."
- "Log supply"
- "18 sites reporting"
- "2 min ago"

**Don't:**
- "Awesome! You just logged a new supply 🎉"
- "Oops, something went wrong!"
- "Welcome back, ready to make an impact?"
- "We couldn't reach the server — please try again 😔"

**Error states** are factual and actionable: "Lost connection. Reports queued locally." not "Uh oh, looks like you're offline!"

**Success states** are silent or near-silent. A logged supply doesn't earn a toast notification; the value simply appears in the count.

**Numbers**: always use digits (`247`, not `two hundred and forty-seven`). Always use thousands separators (`12,480`).

**Time**: relative for recent ("just now", "2 min ago", "4 min ago"), then absolute ("11:42", "yesterday 14:30"). Never "a while ago" or "earlier".

---

## 9. Accessibility

This is non-negotiable for a crisis tool.

1. **All text ≥ AA contrast.** Verified pairings listed in §1.
2. **All interactive elements ≥ 48×48px tap target** in the field UI.
3. **All status color carries a non-color signal** (icon, label, or position).
4. **Focus states must be visible**: 3px SIGNAL-blue ring at 15% opacity (see input field spec).
5. **All form fields have associated labels.** Placeholders are not labels.
6. **All icons have `aria-label` or are decorative with `aria-hidden="true"`.**
7. **Live regions** for command-center activity feed: `aria-live="polite"` for routine reports, `aria-live="assertive"` for CRITICAL-state changes only.
8. **Keyboard navigation**: tab order follows visual order, all actions reachable without a mouse.
9. **Reduced motion**: respect `prefers-reduced-motion: reduce` — disable the 200ms fade-in for live updates and use an instant color flash on the accent bar instead.

---

## 10. Implementation Notes for Claude Code

When building components in this project:

1. **Use CSS variables from §1, not hex codes inline.** Anything hard-coded breaks theme consistency.
2. **Default to Tailwind utilities using the extended palette in §1.** Avoid arbitrary values like `text-[#0F1419]`.
3. **For React projects:** use `lucide-react` for all icons. Don't mix icon libraries.
4. **For numbers in any data display:** wrap in a span with `font-variant-numeric: tabular-nums` or apply a `.tabular` utility class globally.
5. **Never introduce a second typeface.** If a design calls for "more personality," the answer is more white space, not a display font.
6. **Never use Tailwind's `rounded-full` (pill shape) on buttons.** Use `rounded-lg` (8px) only.
7. **Resist adding shadows, gradients, or background images.** If a surface needs distinction, use a 1px MIST border or change to PAPER on INK background.
8. **When asked for an "empty state" or "loading state":** skeleton blocks in MIST, no spinners, no illustrations.
9. **When the user asks for "delight" or "fun" in this app:** push back. Explain the brief: crisis tooling that feels designed creates alarm fatigue and undermines trust. Offer to apply that energy to a different surface (marketing site, onboarding, etc.) instead.

---

## 11. Relationship to Code/+/Trust Brand

Relay is a **sub-brand** of Code/+/Trust. Treat them as having distinct visual systems:

| Surface | Brand voice |
|---------|------------|
| `codeandtrust.com`, `events.codeandtrust.com` | Code/+/Trust house brand — deep indigo `#1A1240`, magenta `#FF3B7A`, editorial display type (Bebas Neue, Krona One), cinematic |
| Relay product UI | Restrained operational — Paper/Ink, Signal blue, single typeface, zero personality |
| Relay marketing / case study page | Code/+/Trust house brand frames Relay as content (see `Relay-Brand-System.pptx` for reference) |

**Rule of thumb:** if you're building something a user interacts with under stress, use Relay's system. If you're building something a user explores when they're calm and curious, use the Code/+/Trust house brand.

---

## 12. File & Asset Conventions

```
/public/relay/
  ├── wordmark.svg         # ■ Relay (full lockup)
  ├── mark.svg             # solid 6px square only
  ├── favicon.ico
  ├── apple-touch-icon.png
  └── og-image.png         # Paper background, wordmark centered, "A two-screen realtime supply tracker for crisis response." subtitle in Steel
```

All SVG assets use the named CSS variables for fills where possible (so they recolor automatically if Relay ever ships a dark mode — which it currently does not).

---

*Last updated: May 2026. Version 1.0.*
