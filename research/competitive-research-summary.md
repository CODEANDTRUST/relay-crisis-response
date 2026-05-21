# Competitor Synthesis — Crisis Response Supply Tracker

_Generated 2026-05-11. Source: 250+ reviews and posts across App Store, Google Play, Reddit for Zello, Crisis Track, CrisisCleanup, Sahana Eden, Ushahidi._

---

## Read this first — sample caveats

- **Most of these aren't direct supply-tracker competitors.** Crisis Track = damage assessment for FEMA reimbursement. CrisisCleanup = matchmaking between disaster survivors and volunteer crews. Zello = push-to-talk voice. Ushahidi = crowdsourced incident maps. Sahana Eden = open-source EOC software. The real head-to-head competitors are EOC/incident-management platforms (WebEOC by Juvare, D4H, Veoci) — none of which surface in App Store / Google Play data because they're enterprise sales. **Your product sits in a real gap: lightweight, two-screen, supply-specific, fast to spin up.**
- **Sample sizes are uneven.** Zello has 300 reviews (mostly off-target — truckers, hobbyists, family chat). Crisis Track has 9 real reviews. CrisisCleanup has 5. Sahana Eden returned essentially no usable data (the App Store match was a wrong-name app, "Eden Living"; the 3 Play reviews are for a Hebrew meditation app of the same name). Treat Zello's signal as "what people hate about a real-time field comms tool that everyone uses," not "what crisis responders want."
- **Reddit results are unfiltered keyword hits.** Many "Crisis Track" results are about Netflix's *Wednesday*, music albums, and Mazda track days. "Ushahidi" is the Swahili word for "evidence," so most hits are Maltese news articles using the word literally. The two genuinely useful Reddit threads, both surfaced via Crisis Track and Sahana Eden's results, are linked at the bottom of this doc.

---

## TL;DR — design implications for your product

If I were designing a superior product based on these reviews, the seven moves would be:

1. **Offline-first sync, prominently.** The only unambiguously-praised feature across all competitors. Field workers in disasters have no signal. CrisisCleanup users love it; Ushahidi users mention it as "easy to use & stable offline." Build for this, market on this.
2. **Self-serve onboarding in under 60 seconds.** Both Crisis Track and CrisisCleanup are gated by org-affiliation account creation. Three separate reviews are literally "where do I create an account?" If a field volunteer can't sign up and report a supply in the time it takes to walk between buildings, you've lost them.
3. **Individual-friendly, not org-only.** CrisisCleanup's strongest negative review: "geared towards coordinating with organizations and not individuals... as somebody trying to help with the cleanup in Texas, this app is utterly useless." Mutual aid / spontaneous volunteers are real users, not edge cases.
4. **No forced background presence, no UI hijacking.** Zello's recent updates are a masterclass in what not to do — persistent Dynamic Island, lock-screen overlay, can't be silenced. Hundreds of 1-star reviews calling it "intrusive." For a tool used adjacent to other emergency tools, fade into the background unless actively in use.
5. **Reliability over features.** Every competitor's top complaint is "it doesn't work when I need it." Zello: messages truncated, app crashes after iOS updates, must be open to receive. CrisisCleanup: "extremely difficult to claim jobs and close them out." Crisis Track on Android: "Many features from iOS version are missing or don't work due to broken UI." If your demo can't survive a flaky 3G connection and an OS version they didn't expect, nothing else matters.
6. **Two-screen separation is genuinely differentiated.** None of the named competitors do this cleanly. Crisis Track has a field app + a portal but the Android client is broken. WebEOC and Juvare are command-center-only. CrisisCleanup is map-and-cases for everyone. Your "field reports it, command center watches it appear live" framing is the strongest pitch in this set.
7. **Phone-number-first distribution.** This is the most surprising finding. The actual Reddit chatter during real disasters (Helene, Milton, Idalia, Ian) is people sharing the **CrisisCleanup phone hotline number**, not an app link. People in crisis don't download apps; they call numbers, fill in things on a friend's phone, or use what's already on theirs. Worth considering: SMS / phone-call intake fallback for field reports, or a no-install web client for spontaneous users.

---

## Per-competitor breakdown

### Zello — push-to-talk, the de-facto crisis-comms incumbent

**What it is.** PTT voice over IP. Used by truckers, hobbyists, first responders, churches, dispatch teams. Massive install base but mostly off-target for crisis supply tracking.

**Why it's relevant to you.** It's the comms layer your tool will live alongside in a real EOC. Whatever frustrations users have with Zello will color how they perceive yours. Also: the failure modes are instructive for any real-time tool.

**What users praise (rare):**
- "Closest thing I can find to NEXTEL" — fills a real gap when it works.
- Long-tenured loyalty: "been around since this platform was called Loudtalks."
- The 1% of reviews that mention customer support praise it warmly when it's available.

**What users hate (overwhelming theme — the 2024–2025 update destroyed goodwill):**
- **Forced Dynamic Island / lock-screen overlay**, no way to disable. Multiple reviews threaten uninstall: *"Disable Dynamic Island option and it's 5 stars... as it stands there is no way to turn it off."*
- **Battery drain** — comes up in dozens of reviews. *"App is draining my battery."*
- **Must be open to receive messages** — *"after the update it no longer works in the background... happened after iOS 18.3."* This is fatal for a comms tool.
- **Messages truncated or not delivered** — *"I'll send a 60 second message, but the recipient only gets 32 seconds of it."*
- **Volume conflicts with other apps** — *"when Zello is open and active the volume on all other apps is maximum half."*
- **Account login failures, can't sign up** — recurring.
- **iOS 18 broke playback over speaker** — a class of "OS upgrade broke us" complaints across many reviews.
- **First responder pain specifically:** *"I use this app as a first responder to augment our other tools. I have recently deleted the app even though our dispatch continues to use it. I did this because I cannot turn it off."* *"Lots of first responders are in the dark now because the app isn't working."*

**Feature requests:**
- Apple Watch support — at least a dozen distinct reviews ask for this.
- Hardware-button PTT (iPhone Action button, volume buttons, Bluetooth earbuds) — high frequency.
- Widget on home screen — multiple.
- Message auto-expiry / disappearing voice messages.
- Per-user volume control.
- Free web client (was removed) — multiple users left for this reason.
- More in-app customization (label users, private group channels).
- Bring back trending channels / discovery.

**Design takeaway for you.** The lesson isn't "build PTT." It's: **respect the user's screen and battery.** A supply tracker that runs in the background should be polite about it. Push notifications, not Dynamic Island. Background sync, not always-on. Optional persistent UI, never forced.

### Crisis Track (by Juvare) — damage assessment for FEMA reimbursement

**What it is.** Field workers do windshield surveys after a disaster, log damaged structures, and the data feeds FEMA reimbursement reports. Enterprise sale to county/state EM agencies.

**Why it's relevant to you.** It's the closest thing in the set to "field workers report into a command center." But it's damage downstream, not supplies upstream — different operational moment, different urgency profile.

**What users praise:**
- *"Awesome damage assessment tool... makes damage assessments easy."* (2 reviews from 2016/2019, both ★★★★★, both apparently from satisfied county users.)
- "FEMA damage assessment" — the recognized use case.

**What users hate:**
- **Account creation is broken.** Two separate Google Play reviews: *"Where the heck do u create an account so you can use the app?"* and *"Would be great to be able to create an account but you are not given any means to so."* App Store review: *"The first thing required is to sign in with no way to register, totally useless."* This is the #1 pain point and it's been broken for years.
- **iOS / Android parity gap.** *"Buggy experience. Many features from iOS version are missing or don't work due to broken UI."* (2024 review.) Android is the second-class citizen.
- **Free trial broken.** *"The free trial dose not work. I fill everything out and try to login and it will not let me."*
- **Not mobile-friendly.** *"Not very mobile friendly."*

**Feature requests:** none surfaced — the user base is too small / enterprise-mediated for App Store reviews to function as feedback channel.

**Design takeaway for you.** **Two-platform parity from day one.** And **make signup zero-friction.** If three of nine reviews are "how do I even create an account," the user is telling you exactly where to win. Also: Crisis Track owns the FEMA-reimbursement keyword. Don't pitch into that — pitch *pre-event* supply tracking and same-event field visibility, where they don't compete.

### CrisisCleanup — survivor-to-volunteer matchmaking

**What it is.** Disaster survivors call a hotline; volunteers (mostly faith-based / NGO crews) claim cases on a map and dispatch teams to muck out, tarp roofs, chainsaw trees. Active during every major US disaster (Helene, Milton, Ian, Ida, Idalia).

**Why it's relevant to you.** Strongest crisis-specific signal in the dataset, and the closest to a "field worker + command center" model — except the command center is the call center, and the field is volunteer crews.

**What users praise:**
- **Offline mode (★★★★★).** *"Offline mode is really helpful. Allows us to effectively go into damaged areas where there is no internet signal, view the cases that need help, add more cases, and then sync it all back up when we gain internet signal. Love it."* This is the single most-praised feature across all five competitors.
- The mission. *"A great App for a great cause."*

**What users hate:**
- **B2B-only access.** App Store ★: *"This app seems to be geared towards coordinating with organizations and not individuals. If the intent was to truly aid in crisis cleanup, then individuals would have the ability to create logins and respond to cleanup needs. As somebody who is trying to help with the cleanup in Texas, this app is utterly useless."* This is the cleanest design-opportunity quote in the entire dataset.
- **Workflow friction.** *"Excellent idea but the app just doesn't work as it should. It's extremely difficult to get it to claim jobs and close them out."*
- **Performance.** *"The App/site tends to lag and freeze a lot."*

**Distribution insight (very strong).** In every hurricane-aftermath Reddit thread (dozens), the call-to-action is the **CrisisCleanup phone number**, not the app or website. *"If you need help cleaning up damage from Hurricane Helene, call (844) 965-1386."* Repeated verbatim across r/WNC, r/asheville, r/florida, r/Austin, r/HuntsvilleAlabama, and on. **In actual disasters, the app is invisible; the hotline is everything.**

**Design takeaway for you.**
- **Lead with offline.** This is gold for field credibility.
- **Allow individuals to participate**, even if you also support orgs.
- **Plan a non-app intake path** — phone, SMS, web link — because in the real moment, downloading an app is friction nobody has time for.
- **Cleanly separate "claim" and "close" actions** — CrisisCleanup's friction here is annoying its actual users.

### Sahana Eden — open-source humanitarian platform

**What it is.** Long-running OSS project for disaster management with resource/inventory tracking, GIS, beneficiary registry. Used by humanitarian agencies and academic deployments.

**Why it's relevant to you.** Functionally it's actually the closest direct match — Sahana Eden has supply/inventory modules. But it has no real consumer surface; the dataset returned essentially nothing.

**What the dataset actually shows.** The App Store and Google Play hits are unrelated apps named "Eden." The only on-target Reddit post is a 2014 internship announcement.

**Design takeaway for you.** **Sahana Eden's invisibility in App Store data tells you something important.** Real users of disaster-management software aren't finding their tools on consumer app stores. They're getting them via agency procurement or via a deployment lead handing out a link. Your acquisition path is almost certainly going to be person-to-person ("scan this QR code"), not search-driven. Design the cold-onboarding flow assuming the user got a link from a coordinator 30 seconds before they started using it.

### Ushahidi — crowdsourced incident mapping

**What it is.** Citizens text/email/submit reports of events (violence, outages, needs); a map visualizes them. Born in Kenya post-2008 election violence, used globally for crisis mapping and election monitoring.

**Why it's relevant to you.** Similar bones to your "field reports flow to command center" model, but for incident reports, not supplies.

**What users praise:**
- *"so easy to use & stable offline"* — the one specific feature praise.

**What users hate:** nothing usable surfaced — the dataset for Ushahidi is too thin to draw conclusions.

**Interesting real-world deployment seen in another competitor's Reddit thread.** During Hurricane Helene, an aid coordinator referenced `helenehelpasheville.ushahidi.io/map` as "general map of available on-ground services" — Ushahidi-as-infrastructure for crisis maps that volunteers spin up ad hoc.

**Design takeaway for you.** *Easy + offline-stable* is the right phrase to be associated with. Ushahidi has 17 years of brand equity around "the simple thing that works in crises." Don't try to out-feature them; out-design them on speed-of-setup. If a county coordinator can spin up a supply-tracker instance in 5 minutes, you've beat Ushahidi on the part that matters.

---

## Cross-cutting themes

These show up in multiple competitors, which is what makes them load-bearing:

| Theme | Competitors where it surfaces | Direction |
|---|---|---|
| Offline-first is the single most-praised capability | CrisisCleanup ★, Ushahidi ★ | **Match it. Lead with it.** |
| Account creation / onboarding is broken everywhere | Crisis Track ×3, CrisisCleanup ×1 | **Self-serve, 60s, no email gate.** |
| B2B-only gating excludes spontaneous volunteers | CrisisCleanup ★★★ | **Allow individuals.** |
| iOS/Android parity is rare and noticed when missing | Crisis Track | **Both platforms, equal quality.** |
| Background reliability — "doesn't work when I need it" | Zello (dozens), CrisisCleanup, Crisis Track | **Reliability beats features.** |
| Forced overlays / can't disable / battery drain | Zello (overwhelming) | **Politeness in the UI layer.** |
| Real-world distribution is phone/SMS, not app | CrisisCleanup hotline shared across ~15 subs | **Non-app intake path.** |
| Workflow friction (claim/close, sign in, find thing) | CrisisCleanup, Crisis Track, Zello | **Two-tap operations.** |

## Feature requests worth stealing

From across the five competitors, requests that are realistic to incorporate into a demo-scale supply tracker:

- **Apple Watch / wearable surface** (Zello users ask constantly) — minimal, but a check-supply / report-supply complication would feel novel.
- **Hardware-button PTT analog** — for a supply tracker, the analog is "one-button last-supply-spotted-here" via Action Button or earbud click. Aggressive bet, but unique.
- **Auto-expiry for stale entries** (Zello request, applies to supplies too) — show a supply as "stale" after N hours if not re-confirmed.
- **Widget / lock-screen surface** — "supplies near you, claim one to deliver" as a widget would be genuinely useful.
- **Free / no-install web client** — Zello users left specifically because this was removed. Phone-number first, app-second.
- **Per-user-or-per-channel volume** (Zello) — analog: per-category supply notification rules.
- **In-app labeling of contributors** (Zello "easily labeling a user") — for a supply tracker: who reported this, time-stamped, with light reputation.

---

## The two Reddit threads worth reading directly

These are buried in the noise but are the gold of the entire research run.

1. **["Emergency Management/EOC Software Platforms"](https://reddit.com/r/EmergencyManagement/comments/1p52sci/emergency_managementeoc_software_platforms/)** — by SimilarOrchid8231, Nov 2025. A taxonomy of WebEOC (Juvare), Crisis Track (Juvare), D4H, Veoci, Resolver, ESRI ArcGIS. **This is the actual competitive landscape, written by an EM practitioner.** Read this before any positioning decision.
2. **["CAP - The 'not so' common alert protocol"](https://reddit.com/r/digitalsignage/comments/1544dv2/cap_the_not_so_common_alert_protocol/)** — by DigitalSignageDude, Jul 2023. Names every emergency-notification, incident-management, mass-notification, and public-safety system in active use. **Same value as #1 for understanding the stack you're sitting next to.**

---

## What I'd ask next, if you want to push further

The reviews dataset is fundamentally a consumer-app dataset, which means it's strongest where your real competitors are weakest. To go deeper into the actual head-to-head competitive set (WebEOC, D4H, Veoci, Sahana Eden), you'd want:

- G2 / Capterra / TrustRadius reviews for the enterprise platforms.
- r/EmergencyManagement and r/sysadmin threads specifically (the EM-software thread above came from r/EmergencyManagement and is gold; there are likely 20 more like it).
- GitHub issues for Sahana Eden (it's open-source — actual user complaints are tracked there).
- After-Action Reports (AARs) from real disasters where these tools were deployed — usually published by state EM agencies as PDFs.

Want me to extend the script to pull from any of those, or is this enough to drive your design decisions?
