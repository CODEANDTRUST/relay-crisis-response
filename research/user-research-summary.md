# Crisis supply tracker — research synthesis

A 10-minute distillation of 1,780 Reddit posts and 108 YouTube transcripts. Source: `user-research-long.md` (same folder). For Victoria, designing a two-screen realtime supply tracker (field reporter + EOC viewer).

---

## The eight things to walk away with

### 1. The status board IS the product. Don't bury it.

WebEOC, the dominant tool in this market, is essentially a glorified SharePoint of "status boards" — flat tables the EOC stares at all day. What practitioners actually want is a wall they can read at a glance. Everything else (forms, workflows, integrations) is in service of that wall.

> "Why does it look non user friendly? Why can't you have drop down menus on the dashboard to easily change values instead of going into edit and doing it there?"
> — r/EmergencyManagement, /u/JKisMe123, 39 comments — a self-described "tech guy seeing WebEOC for the first time"

A vendor demo describes the same product affectionately, accidentally revealing what's missing:

> "Once the incident is active personnel use the status board as a real-time display... resource requests can be submitted in the field through any mobile device. The EOC receives those requests instantly..."
> — YouTube: Intermedix, "WebEOC - A Disaster Response Story," 25.6K views

The vendor pitch *is* "field submits, EOC sees it instantly." That's Victoria's product. The opportunity is to be the version of that promise that doesn't require a 16-week admin certification to configure.

### 2. Practitioners default to Google Sheets. Beat sheets, not WebEOC.

Across every disaster and every role, the tool that actually appears is a spreadsheet — usually shared, often a public Google Doc with 50+ editors.

> "Currently using a spreadsheet and its proven not to be working well, for various reasons."
> — r/ems, /u/Appropriate-Bird007, "Vehicle inventory" — a paramedic asking how anyone else does rig inventory

> "Currently we are using our inherited (and antiquated) paper form system for all of these. Which creates a lot of crew/unit downtime."
> — r/ems, /u/Wisdomkills (Paramedic FTO), listing daily supply ordering, apparatus inspections, missing/damaged equipment forms, maintenance requests, and stock-use tracking — five workflows held together with paper

> "I've been using a simple tracker in excel, but there are too many organizations we're using and we keep losing track of who uses what. We have to keep going back and counting every single resource/referral we give out."
> — r/EmergencyManagement, /u/hoboalien, "Resource Tracker," working FEMA unmet needs

Helene crystallized this pattern in real time. A civilian built a Google Map of help requests that became the de facto coordination layer for federal SAR:

> "I made the map so people could find each other. I did not know that it would become a valuable resource to local residents, SAR crews, and people from out of town. Around the middle of last week, I got looped in with a TON of volunteer crews... flying helicopters, fixed wing aircraft, and running ground crews for SAR and supplies. I was able to get these folks into daily calls so different groups could know what the hell they were each doing."
> — r/asheville, /u/dontspeaksoftly, "Update from the person who made the map"

**Implication:** the bar isn't WebEOC's feature parity. It's "Google Sheets, but field can update from a phone without a login, and it has a map."

### 3. The EOC seat is reading. The field seat is typing. Two products, one database.

EOC personnel describe themselves drowning in incoming data, frantically rekeying numbers from radios:

> "I currently work for my county's Office of Emergency Services EOC under the Logs section... It's essentially doing warehousing and courier work supporting the county covid test/vaccination sites... my team and I aren't involved in any meetings etc; we literally just move boxes."
> — r/EmergencyManagement, /u/ashfrmpkmn — describing what "EM Logistics" actually looks like

> "What's the most frustrating part of your workflow during an incident? What information do you find yourself constantly hunting for or asking others about? Where do things typically break down — communication, resource tracking, documentation, handoffs?"
> — r/EmergencyManagement, /u/IcyPerspective9151, "What are the biggest pain points during actual incidents?" — the questions are the answers

In the field, the reverse: the reporter goes silent, EOC goes blind.

> "The idea of sending critical formal messages back to the EOC from damage assessment teams 'ground truth' gets a lot of the EMCOM folks out of bed in the morning."
> — r/amateurradio, /u/NY9D

**Implication:** the EOC screen is a glance. The field screen is a thumb. Not mirror permissions — two products that share a database.

### 4. "We don't know who anyone is" is the unsolved problem. Lean into it.

Spontaneous volunteers are the only reason anything gets done in the first 72 hours AND the controller's biggest unsolved problem:

> "There is no dearth of well-meaning individuals who want to help when their neighbors are in need. If you've ever coordinated a large scale incident, you know this can become a hindrance. Does anyone have any ideas, best practices, or words of wisdom dealing with this issue?"
> — r/EmergencyManagement, /u/B-dub31 (Retired EM Director), "So let's talk about spontaneous volunteers..."

In Helene the Cajun Navy, totalflight.com, JAARS, Carolina ERT Operation Rotor Blade (12 helicopters) — none were on a state list. They showed up:

> "Saturday: We organized the residents of River Mills (Biltmore Village), cooked and distributed leftover food, and provided Starlink Internet and generator power... Sunday: We were joined by our very capable friend who brought two chainsaws... We found a wrecked semi truck in the woods in Swananoa full of bottled water! We took six cases (thanks Ingles...)"
> — r/asheville, /u/LightningSkyDepot, "I have a generator and Starlink satellite. Where can I bring it to be the most helpful?"

**Implication:** don't make people register. Make accountability post-hoc and optional. The T-card / Salamander accountability tradition exists *because* the controller can't verify identity in real time; your product makes that fine.

### 5. The reporter is on a borrowed device with 12% battery.

Across every Helene thread: someone typing on a stranger's iPhone, on the only cell tower working, at 11pm.

> "I'm writing this on my last 12% of phone battery and connected via cell phone service."
> — r/preppers, /u/Banner248, NY ice storm

> "Asheville and surrounding area does not have cell service, Internet, or comms. I am on public wifi outside Moxy on Biltmore Ave. Hopefully your friends / family here are safe but we have no way to let you know."
> — r/asheville, /u/paul_caspian, 285 comments

A bandwidth-aware civilian essentially wrote half your product spec in a PSA:

> "PLAIN TEXT SMS (normal text messages)... utilizes dedicated cellular channels often functional even when data/internet is down. SMS messages are miniscule compared to screenshots or website links, and bandwidth is very limited right now. A single screenshot can be 20+ MB compared to text which is a few kilobytes."
> — r/asheville, /u/AnticitizenPrime, 43 comments

**Implication:** field side works offline. No app install. No login. Lets someone hand the phone to a stranger mid-shift without surrendering an identity. Minimum bytes per submission.

### 6. Quantities barely exist. Locations are everything.

When you read what people actually need vs. send, the granularity is gut-level, not SKU-level. Buncombe County's briefing transcripts list water, MREs, baby formula, diapers, dog food, masks, hygiene kits, "non-poplar water" (potable vs. flushing) — never SKUs, never expirations:

> "Water and MRE's will continue to be provided at the four distribution sites from noon to 4PM. Please bring your own containers for water. Don't bring donations to the distributions sites. Email helenedonations@buncombecounty.org to donate. BeLoved is distributing water, food, diapers, and baby formula at 32 Old Charlotte Hwy."
> — r/asheville, /u/neverdoubtedyou, official 4PM 10/1 briefing

What matters obsessively is *where*. Every briefing is a litany of street addresses:

> "William W. Estes Elementary School: 275 Overlook Road, Asheville / Sand Hill Elementary: 154 Sand Hill School Road / North Windy Ridge Intermediate School: 20 Doan Road, Weaverville..."
> — same source, repeated daily

**Implication:** "tomato soup, 12 cans" is the wrong default schema. "Water — Estes Elementary — out as of 3pm — restocked 7pm" is the right one. Your unit of inventory is *site × category × status*, not item × quantity.

### 7. The vocabulary is ICS — and ICS is the trojan horse for credibility.

Field practitioners speak fluent NIMS/ICS. You either learn the vocabulary or you're a toy. The good news: it's a small vocabulary.

- **EOC** Emergency Operations Center
- **IC / IMT** Incident Commander / Incident Management Team
- **ICS 213** the general message form
- **T-card / tac board / status board** physical tag and the wall it hangs on
- **SitRep** situation report
- **IAP** Incident Action Plan
- **COP** Common Operating Picture — the holy grail
- **Strike team** typed group of resources
- **Duty officer** on-call person
- **POD** Point of Distribution
- **POC** Point of Contact
- **Mutual aid** neighboring agency sends resources
- **AAR** After-Action Report
- **Activation** the moment EOC "stands up"

Don't say "task" — say "tasking." Don't say "checked in" — say "logged via 213."

### 8. Vendor demos are dry as toast. That dryness is the opportunity.

I watched 90+ minutes of WebEOC vendor video. The pitches read like SOX compliance:

> "Transition to SAS with web EOC Nexus today and empower your business with the tools it needs to succeed in a fast-paced ever evolving world... enjoy peace of mind with our four-way database copies providing geographically disperate storage locations for fault tolerance and data residency compliance..."
> — YouTube: Juvare, "The Power of WebEOC Nexus SaaS," 386K views, **5 likes**

> "Imagine a world where every essential service operates seamlessly from schools to Emergency Management power plants to First Responders..."
> — YouTube: Juvare, "WebEOC Transforming Safety and Efficiency," 185K views, **11 likes**

That 386K-views / 5-likes ratio is real. Practitioners watch these because the boss is evaluating vendors. They don't like them. The demos never show a frustrated volunteer at 11pm on a borrowed phone — they show an actor in a clean shirt clicking a polished button labeled "Activate Incident."

The same cycle has been running since 2017:

> "I have yet to meet an EM office that does not use WebEOC. I'm both an EM and a tech guy, what is lacking technology wise? What is their pricing?"
> — r/EmergencyManagement, /u/montecarlo1, "Is there room for a competitor to WebEOC?"

Eight years later the answer is still yes.

**Implication:** show real photos of disasters, real handwriting on T-cards, real Google Sheets being abandoned. Don't out-Juvare Juvare on stock-photo gloss. The contrast will sell itself.

---

## The controller's seat

Mid-career, often dual-hatted (mitigation/recovery/response), often 20–30 years in from fire/EMS/military, working from a windowless room in a basement:

> "I have visited a dozen different EOCs and they always seem to stick the emergency management department in some industrial area or in the basement. I get that we need somewhere secure to handle logistics, store equipment, etc but come on! It's like windows are illegal."
> — r/EmergencyManagement, /u/Humble_Desk8940

The day is staring at radar, refreshing a half-dozen browser tabs, and writing things down. One EOC's actual stack:

> "ESRI provided by the county GIS Dept / Survey123 / WeatherSentry DTN / GoogleSheets for Road Closures, EOC Login and Status Board for Major Events/Daily Ops (non-sensitive information) / Tempest Weather Stations (12) / NWS Flood/River Gauges / CodeRed Reverse 911 / Active(911) Alert / State provided WebEOC/ESRI (Display Only) / iNWS for Weather Alerts / NWS provided Slack / In-House Server"
> — r/EmergencyManagement, /u/SimilarOrchid8231 — twelve separate tools

The biggest fear is missing something. Helene's Buncombe County PIO, on the air, explaining why they have *no official count* of missing people:

> "First, search and rescue continues now for a seventh day. We're continuing to find people. We know we have pockets of people who are isolated due to landslides and bridges out. So they are disconnected but not missing. Power, Wi-Fi, and phone coverage remains a barrier to connections."
> — r/asheville, /u/No-Catch6733, transcribing PIO Stacey Wood, 10/3/2024

A senior controller's product brief, in his own words:

> "For sake of simplicity in setting up multiple workstations, is there any generic or simple browser based product that allows basic IM functionality and posting text updates with multiple users in a shared space?"
> — r/EmergencyManagement, /u/thecbrnguis, "Free Browser based alternates to Web EOC?"

That sentence is the spec.

---

## The volunteer's seat

The volunteer arrives at a parking lot, a church, a community center. No idea what's been delivered. Phone (maybe charged), gloves (if they remembered), vest if lucky.

> "I have been an intern for about 11 months. I live in Florida and so far, our county has been activated for Hurricane Debby and now Hurricane Milton. My emergency role when being activated is being a Supply Runner. For Hurricane Debby, I was doing a bunch of supply runs before and after the hurricane hit. I absolutely enjoy doing supply runs and I have no problem working 12-16 hour days. So far, for Hurricane Milton, I have been sitting around the vast majority of the time."
> — r/EmergencyManagement, /u/Only_Chloe6 — the most honest description of "supply runner" we have

They want to be useful. Specifically, they want the receiving site to know what they have:

> "I'm up on a small mountain near Concord/Williams and it's day 10 without power and well water. But we have food, water and safety. Spent the day at Beloved Asheville in the Highland warehouse loading and unloading and I feel good. The situation is still terrible, but I've never seen more braver, kinder people in my whole life."
> — r/asheville, /u/telkinsjr, "Evening thread check in"

The volunteer reports to command not through a system but through a person — and often, by *giving* command the system:

> "Met with the fire chief who told us their only form of communication was handheld radios and they were worried the tower would collapse taking even that out. We had a Starlink available so we gave it to them so now they have at least internet. National Guard is on the ground but no one else can get anywhere safe or with power. Helicopters are landing in the church parking lot."
> — r/asheville, /u/Eastern_Cake_4823, Swannanoa during Helene

And reporting *up* via informal channels:

> "Hi all, My family has limited access to internet so I've been texting them transcripts of the daily Buncombe County meetings. Hope this is helpful to others."
> — r/asheville, /u/No-Catch6733 — citizen who hand-transcribed every official briefing because their family couldn't watch the stream

---

## Manual workarounds in the wild

The vocabulary you should be stealing from is here.

**Paper, whiteboards, T-cards:**

> "Anyone know where I can lay my hands on a NIMS Typing .csv or excel document? Working on integrating NIMS typing into a Public Works Maintenance Log in WebEOC..."
> — r/EmergencyManagement, /u/TallyAlex (County EM/911) — bolting NIMS typing into WebEOC by hand

> "Does anyone have any free google sheets templates or document builders for IAPs, SitReps, COPs? I would really prefer not to have to make these from scratch."
> — r/EmergencyManagement, /u/hoboalien

T-cards (laminated 4x6 tags hung on a velcro board, moved as crews enter/exit) are foundational. A vendor sells the literal physical object:

> "Eagle Engraving Fire Velcro Accountability System"
> — YouTube, Eagle Engraving channel, 6.0K views

**This is the user's existing mental model for supply tracking.** Match it.

**The real Helene stack:**

> "Map of useful information: helenehelpasheville.ushahidi.io/map / Misc Resource Map: docs.google.com/... / [User Created Discord Server] / Request a wellness check: docs.google.com/forms/... / Crowd-Sourced Asheville Flood Relief Resources for Helene: ashevillerelief.com — A mega wiki organized by State, County, City, and neighborhood..."
> — r/asheville, mod-pinned resource list

That's the actual Common Operating Picture for the largest hurricane in WNC history. None of it is WebEOC. All of it is free consumer software.

**"We built our own":**

> "I am trying to make a Power Bi connection to webeoc and since none exist I'm trying to make a Python or C# program that can automatically go into WebEOC and export what I need."
> — r/EmergencyManagement, /u/JKisMe123 — same guy who two months earlier asked: "I have a database in WebEOC and a dashboard in PowerBI. I want to be able to automatically update the PowerBI dashboard with the WebEOC data, but I can't find a way to do that."

He's frustrated enough to write a screen-scraper.

**The most damning workaround story:**

> "Ham radio served as a crucial link between Buncombe County EOC and FM radio broadcasters when every other form of communication utterly failed. The previously established emergency lines of communication were web based, so the experienced ham operators ended up taking command and deploying themselves to each location to set up base stations for point to point relays."
> — r/asheville, /u/Groundhog_on_Mars, "Thank You WNC Ham Radio Operators!"

When the WebEOC-of-the-world failed, the actual COP was 73-year-olds with 1980s Yaesus.

---

## What's broken about WebEOC, D4H, Crisis Track, Salamander, Veoci

**WebEOC** dominates. Nobody really likes it. The complaints cluster:

- Not user-friendly. ("Why does it look non user friendly?" — repeated constantly)
- No public API. You can't get data out without scraping.
- Needs a dedicated admin (NYC EM has a literal job posting: "Incident Management Systems Program Manager").
- Expensive enough that small agencies can't afford it: "We can't afford WebEOC so we're using Microsoft Teams." — /u/5-0prolene
- Hasn't materially improved in 20 years. "Is WebEOC being replaced?" posts appear every year since 2017.
- An MS Teams add-on (TEOC) is being built as a free alternative; reviews are lukewarm: "I was not impressed during a short demo I saw recently." — /u/IcyCalmMrSteele

**D4H** is the shiny modern alternative — better marketing, slick demos:

> "...build out your own pre-plans in advance so you can launch them with a single click and automatically run the appropriate incident Action plans checklists tasks status boards Library documents and pre-filled ICS forms..."
> — YouTube: D4H, "What is D4H? A quick overview from our CEO," 9.1K views, 13 likes

Six product surfaces in one breath. Even D4H's evaluators don't know what they're buying:

> "Obviously D4H does what it says on the tin. My reservations are due to our not having first determined what it is we need, rather than the product specifically."
> — r/EmergencyManagement, /u/DigitalPlumberNZ

**Crisis Track**, **Salamander** (barcode-badge scanner), **Veoci**, **Everbridge**, **Buffalo Computer Graphics**, **Motorola Solutions**, **Orion** — every one of these appears as "we demo'd it, was OK, expensive, did anyone use it?" None has lock-in.

The "new entrant" pattern repeats every couple years:

> "I previously worked as an IT Manager for an Emergency Operations Center... That experience pushed me to build Command Bridge: emergency management software designed to be powerful, responder-focused, and simple to use — with the kind of intuitive UI people are used to seeing in other industries."
> — r/EmergencyManagement, /u/CommandBridge, "Command Bridge - New Software," 0 score

The market is wide open. Lousy with attempts. Solved by none.

---

## Low-connectivity reality

Helene is the canonical recent test case. Order: cellular dies first, hams come up, civilians fill the gap, official systems are last.

> "**ALL CELL SERVICE PROVIDERS HAVE STARTED DISASTER ROAMING, MEANING ANY WORKING CELL TOWER WILL PROVIDE SERVICE NO MATTER WHAT CARRIER YOU HAVE**"
> — r/asheville, /u/TennyBoy

> "We just launched a [text-only version of our live blog](https://text.bpr.org/) designed to load way faster for folks with slow internet access and cell service. there are no ads or photos, just updates."
> — r/asheville, /u/Ok___Culture, Blue Ridge Public Radio

Starlink became de facto field comms within 48 hours. When EOC needed internet, civilians often brought it. The pattern is universal — Alberta floods:

> "I departed my workplace at 1400h and arrived at the EOC approximately 1630h faced by several road closures and hampered by clogged and failed cellular networks... Upon my arrival the Town of High River's sewer systems were offline and water was being drawn from the reservoir. Phone lines were down and Telus cellular was offline but for the few of us who had Rogers it was fine. Occasionally we'd get a bit of propagation and our cellphones would perk up to life for a second only to disappear for hours again."
> — r/amateurradio, /u/VE6LK, "We don't need no stinkin' Field Day"

**Implication:** field-side submission must work offline, queue, and retry. Assume connectivity is intermittent and the page is loaded once at the start of the shift.

---

## Vocabulary cheatsheet (UI copy)

Drop these in verbatim. They make controller and volunteer trust the product on first glance.

**State words:** Activated / standing up / standing down · Logged / cleared / closed / outstanding · Open / Available / Committed / OOS (out of service) · Type 1 / Type 2 / Type 3

**Verbs (ICS-correct):** Request → Order → Resource (not "ask for") · Stage → Deploy → Demob (not "send/recall") · Tasking → Assignment (not "job") · Brief → Debrief (not "meeting")

**Nouns on screen:** POD = Point of Distribution · POC = Point of Contact (a named human with cell) · Site = fixed location with name + address + category · Strike Team / Task Force = group of resources moving together · SitRep = periodic snapshot

**Quantity language:** people say "we have water," "we're out of formula," "running low on diapers." They don't say "12 cases, 19,200 oz." Embrace fuzzy: **Stocked / Low / Out / Restocked**.

**Time language:** "as of 3pm 9/29 — restocked as of 7pm 9/29" — timestamps appear inline with status, not in a metadata column.

---

## Direct design implications for Victoria

1. **No login. Field side starts from a QR code or SMS short-link.** You don't have time to provision identities. The accountability lives in the audit trail, not the door.

2. **Default to one-tap status pills, not text fields.** Stocked / Low / Out is the schema. Zero keystrokes for the default tap.

3. **The EOC screen is a tac board, not a database view.** Cards on a wall, color-coded by status, ordered by recency. Every site is a magnet on a fridge — not a row.

4. **Map first, list second.** Locations are everything. The Helene Google Map was the actual COP. Open on a map, sites as colored dots.

5. **Time appears inline.** "Water at Estes — out as of 3pm — restocked 7pm" is one row, not three columns. Mimic the briefing-transcript voice.

6. **Bandwidth budget: ~5 KB per submission.** The reporter is on the only cell tower working. No JSON blob with thumbnail. Photos upload-when-able, never blocking.

7. **The EOC screen shows what just changed, not what's the same.** A live feed of "POD 3 went LOW four minutes ago." Like a Twitter timeline of inventory.

8. **Use ICS vocabulary everywhere.** Tasking. SitRep. POD. POC. Activated. Demob. T-card. The user trusts the product in 10 seconds if you sound like one of them.

9. **Don't ask "what supplies do you have." Ask "what are people asking for that you don't have."** Signal is shortage, not abundance. Flip from "inventory in" to "demand out."

10. **Sharing is one-tap, and the system assumes mutual aid.** Onboarding is 10 seconds on someone else's phone, during the briefing.

---

The product Victoria is sketching has been wanted, out loud, on Reddit, by named professionals, for at least a decade. The pieces that exist are too expensive, too slow, or too generic. The user-friendly ones are designed for adjacent problems — Slack for everyday work; D4H for credentialing; Salamander for accountability scans. Nobody is shipping a focused, fast, no-login, ICS-fluent, map-first realtime supply tracker.

This is what to build.
