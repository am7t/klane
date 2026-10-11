# Klane: two-minute demo

0:00–0:12 — Start on the large globe. Switch Guest → John Adam to show saved roofing and Raleigh chips. Explain: “Klane remembers a contractor’s business, then finds the buyers behind public project signals.”

0:12–0:30 — Enter a trade and city, or use Speak and stop recording. Submit. Show the rotating globe and map arrival. Research continues in the background toward five results, within three batches; it can finish with fewer when evidence is insufficient. For recording, cut waiting time transparently instead of implying instant research.

0:30–0:52 — Open a real buyer. Show its dated project indicators, address and original evidence links. Explain why a developer, property operator or institution is relevant to the trade. Show project and buying-team research; distinguish published professional contacts from missing contact details. Never promise every buyer has an email or that a public signal proves they want a contractor.

0:52–1:15 — Open Economics. Show the proposed work package, editable assumptions, material/labor/equipment costs, contribution, break-even bid and staffing-based installation timeline. Say: “These are planning assumptions for this job, not a verified customer budget or a local quote.” Switch to Intelligence or Sources to show the imported City of Raleigh permit activity chart, original records and declared whole-project values. Economics stays focused on the work-package estimate. Its completed-job price section appears only when actual matched paid-job evidence is sufficient; scope is inferred from the proposed work package, without an inactive scope dropdown. Explain that these are public permit valuations, not contractor unit prices. For Durham/Cary, Raleigh coverage is explicitly labeled a nearby-market reference. Paid-job rate comparisons still require genuine completed-job records.

1:15–1:35 — Ask a question in the territory or company chat. Show Find more places and save a prospect. Click Brief me for ElevenLabs narration. Words brighten using ElevenLabs character alignment mapped to word timing. Playback-percentage progress is a fallback if alignment is absent.

1:35–1:50 — Show a recorded/live iMessage exchange with Klane via Photon. Ask for electrical in Durham even from John’s roofing account: explicit trade overrides the default. The messaging agent can discover opportunities directly; it does not require a website scan first. Review outreach drafts before sending.

1:50–2:00 — Open Connections. Explain the data path: Gemini grounded discovery → Tiger Data operational memory → Snowflake warehouse analytics. End: “From public project evidence to a practical next conversation, on the web or in the field.”

# What the integrations actually do

- Gemini / Vertex AI: bounded grounded web research, evidence extraction, account-aware questions and proposed estimate assumptions. Up to three discovery batches, two model calls per batch, maximum five buyers per job, with at least two distinct linked source documents for each. A bounded run may return fewer than five. Dossier/estimate work is on demand. Cache grounded research for 15 minutes; duplicate simultaneous requests share one call. Project dossiers are cached per account, trade and company and reused by follow-up chat. Model thinking budget is disabled and output sizes are capped. This searches indexed public sources; it is not a complete crawler of every municipal database.
- Tiger Data / Tiger Cloud: Postgres/Timescale operational persistence for profiles, discovered companies and signal observations, conversation history, outreach receipts and the warehouse sync outbox. It lets web and Photon conversations use the same account context; signal history reads time-series observations. A browser favorite remains browser-local in the current demo.
- Snowflake: receives signal events from the Tiger outbox and aggregates research coverage and market signal analytics. The comparable-job table supports quartile/median rates by locality, trade, unit and scope when at least eight verified records exist. It also stores 2,000 real City of Raleigh permit reference records imported through the official ArcGIS feed (latest records within a 180-day cutoff, capped at 2,000). Trade classification uses explicit description keywords and excludes “no HVAC” wording. It exposes counts by issue week, whole-project declared valuations, status, coverage dates and original record links. The import uses no LLM tokens; rerun `npm run permits:import` to refresh. These records do not establish available contracts or paid contractor prices. It does not generate market prices. In the demo, show the Sources analytics / Intelligence market pulse, plus actual warehouse query results if needed.
- ElevenLabs: server-side text-to-speech for company briefings; Scribe v2 converts bounded microphone clips into editable search text. Voice clips are limited to 30 seconds / 2 MB. Browser permission and the account’s STT access are required.
- Photon / Spectrum: an authenticated iMessage agent with saved contractor context, history, explicit trade/location overrides, fresh discovery and reviewed outreach. It is not an autonomous bulk-messaging tool.

# Before recording

Use one recently researched buyer with relevant original sources and a clear project story. Keep the services running. Confirm all connections. Rehearse with the exact trade/city; warm caches improve consistency without fabricating results. Your Snowflake network policy currently allows your present public IP: verify it on the recording/demo network or use a deployed backend with stable allowed egress. Keep credentials out of the video. Do not show synthetic economics as sourced pricing.

## Optional Snowflake proof shot

Run this in the KLANE.PUBLIC SQL workspace and show the actual result for a second or two; it proves the warehouse received real observations without implying an exhaustive market census.

```sql
SELECT SERVICE, COUNT(DISTINCT COMPANY_ID) AS RESEARCHED_SITES,
       COUNT(DISTINCT SIGNAL_ID) AS SIGNALS
FROM KLANE.PUBLIC.KLANE_SIGNAL_EVENTS
WHERE ACCOUNT_ID = 'john'
GROUP BY SERVICE;
```

Discovery separates dated indicators from undated corroborating documents. Each published buyer needs at least one dated indicator and two distinct linked documents in total. Addresses are geocoded, but a public source is not confirmation of buying intent. Professional names and roles in the report remain research leads; clickable scraped emails are limited to organization pages and published domain-matching addresses. Municipal contacts require government domains.

Grounding redirect links are resolved to original publisher URLs when accessible. Tracking parameters are removed, and future source IDs use the resolved URL so repeated collection does not create a new signal merely because Google generated a different redirect link. The default bounded search targets five buyers; live verification runs sometimes produced one qualifying buyer. Do not promise five confirmed opportunities or exhaustive municipal coverage.

Discovery uses trade-specific query routes across the three batches. Incomplete findings are carried forward for address/source follow-up. Extraction retains alternate candidates before validation, and each claim uses the grounding citation statements attached to its source. Successful identical searches can reuse a completed job for ten minutes; empty extraction results are not cached.

The local price panel now checks Snowflake automatically when opened and displays the matching record count. A successful connection with zero matches is an empty dataset, not a service failure. Background job polling has a separate request allowance so it does not consume the user-action allowance. User-action throttles include an explicit retry delay.

## Warehouse data proof

Run in Snowsight with KLANE.PUBLIC selected:

```sql
SELECT COUNT(*) AS IMPORTED_RECORDS,
       COUNT(DISTINCT RECORD_ID) AS UNIQUE_RECORDS,
       MIN(ISSUED_AT) AS FIRST_ISSUE, MAX(ISSUED_AT) AS LATEST_ISSUE
FROM KLANE.PUBLIC.KLANE_PERMIT_REFERENCE;
SELECT ISSUED_AT, RECORD_ID, DESCRIPTION, STATUS, DECLARED_VALUE, SOURCE_URL
FROM KLANE.PUBLIC.KLANE_PERMIT_REFERENCE
WHERE ARRAY_CONTAINS(TO_VARIANT('Roofing'), SERVICES)
ORDER BY ISSUED_AT DESC LIMIT 5;
```

The current import covers Raleigh only, across residential and commercial projects and multiple scope sizes. It is a bounded reference sample, not all permits in the Triangle. KLANE_JOB_COMPARABLES remains dedicated to actual paid/completed job data, with known units and comparable scopes. Never turn a building’s whole permit valuation into a roofing/HVAC per-unit price.

## Current opportunity gate

New discovery checks availability status, a dated current project source, and any published deadline. At least one actionable indicator must be within 180 days; old documents can only provide background. Closed, awarded and expired packages are rejected. Separate current packages need separate dated evidence. Cached/stored leads are also filtered for currentness in the web map and messaging context. An expired submission deadline is not proof that a contract was awarded.

## Tiger Data walkthrough

Klane writes configured profiles to `klane_accounts`, discovered buyer payloads to `klane_companies`, and dated signals to the Timescale hypertable `klane_signal_events`. Chat turns are stored in `klane_messages`, scoped by account and session. Photon resolves a linked sender to an account, loads that saved profile, and the agent loads that account’s discovered buyers when no companies were passed with the message. It can also run a fresh scan for an explicitly requested trade and location.

Signal-history charts use Timescale’s `time_bucket` on the observed source date. Each newly inserted signal event queues a warehouse outbox entry in the same transaction. Snowflake synchronization then marks the outbox row synced only after the warehouse MERGE succeeds; repeats are deduplicated by event ID. Delivery/message receipts help avoid handling the same incoming message or sending the same reviewed outreach twice. Browser favorites still live in browser storage in this demo.

The public permit import writes directly to `KLANE.PUBLIC.KLANE_PERMIT_REFERENCE` through Snowflake’s SQL API; it does not pass through Tiger. `KLANE_JOB_COMPARABLES` is a separate completed-job table and currently has no rows. Economics hides the unavailable price-range panel and shows a short planning-rate basis instead.

## Live dictation and evidence labels

The entry microphone now uses ElevenLabs Scribe v2 Realtime through the browser SDK, loaded only when the microphone is clicked. The API creates a temporary single-use connection token; the permanent ElevenLabs key stays on the server. Partial transcripts update the existing search field immediately, revised partials replace earlier words, and committed segments are retained once. Stopping mutes the microphone while waiting briefly for the final segment; navigating away closes the audio connection. Each dictation is capped at 30 seconds. Human microphone capture still needs a browser permission grant and a spoken check; automated tests cover partial/committed events, stop, provider failure, and unmount cleanup.

Evidence cards show a document label, source category, and destination URL. Labels use collected document metadata where supplied; otherwise a related signal claim or readable URL path is used. These fallback labels are descriptions, not asserted publisher headlines.

The company chart is now called “Evidence by source week.” Tiger groups distinct recorded signals for that buyer by the source date over the past 90 days. It does not describe collection activity, automatic monitoring, new job creation, or demand growth. A month-only date uses its first day for database grouping; its original precision is retained in the event payload.

## Program flow

- Typed query → React search state. Microphone → Node token endpoint → ElevenLabs realtime audio connection → partial/committed text → the same search state. Optional brief → bounded Gemini summary → user-supplied search context.
- Search text + selected account preferences → Node API → account-scoped discovery job → bounded Gemini/Vertex Google Search grounding across public news, city/planning/permit/procurement documents and company announcements → structured candidates → trade/customer, source corroboration, freshness/deadline and radius validation → Census address geocoder → Tiger profiles/buyers/signal events → React polls results → MapLibre globe-to-map transition and buyer markers. Three batches maximum, aiming for two first and up to five total; validation can return fewer.
- Click buyer → on-demand Gemini dossier + original public-page contact extraction → overview/evidence/contact links. Economics → sourced scope plus explicitly labeled planning assumptions → deterministic shared estimate formulas → cost, contribution, crew days and schedule.
- Tiger inserted signal → transactional warehouse outbox → Snowflake SQL MERGE → mark synced only after success → Snowflake territory signal aggregates → Intelligence/Sources. Separately: Raleigh official ArcGIS permit feed → bounded import/upsert → Snowflake permit reference table → SQL filters/aggregates → permit activity cards. This import currently contains 2,000 records; it is not a full Triangle dataset.
- Completed-job CSV, if supplied → validated import → Snowflake paid-job comparables → matching city/trade/unit/scope SQL → publish price quartiles only with at least eight qualifying records. Current completed-job table: zero rows. Economics therefore uses planning assumptions and does not display a verified local price range.
- Incoming iMessage → Photon/Spectrum → sender/account mapping → Tiger saved profile, buyers and recent session messages → shared agent (fresh discovery if requested) → plain-text reply → Photon → phone; chat memory is written to Tiger. Outreach drafts require review of the exact recipient/body before sending.
- Brief me → Node → ElevenLabs Flash text-to-speech with word alignment → audio playback and word-progress highlighting.

The stack is React 19 + TypeScript + Vite, custom CSS and Lucide icons, MapLibre GL with CARTO/OpenStreetMap mapping, a Node.js ES-module HTTP API with Zod validation, Gemini 2.5 Flash on Vertex AI (configurable model), ElevenLabs realtime Scribe/Flash speech, Photon Spectrum iMessage, Tiger Cloud PostgreSQL/TimescaleDB, and Snowflake SQL API. Vitest tests the backend, shared calculations, and live-dictation behavior.

## Discovery reliability update

Research now reads a bounded NC State facilities WordPress feed (up to six posts, four retained original documents, within the 180-day source window) before the Google-grounded search. It caches that public feed for 15 minutes and does not add model calls. Every source still passes trade, buying-window and site validation. Design-stage announcements are upcoming construction prospects, not open installation bids. Window/wall projects mentioning roof access alone do not establish roofing scope.

The structured extraction normalizes percentage confidence (90 → 0.90), validates signals individually, preserves distinct scope/budget/timing facts from the same document with unique IDs, and removes long redirect URLs from intermediate model text. Census geocoding falls back to exact Wake County address points for campus/private roads. County coordinates require an exact street match and count as an independently sourced location record.

Search jobs retain per-batch diagnostics and errors. Recent account-scoped, current, adequately corroborated research from Tiger can appear while remaining batches run; sample records and legacy leads without a current availability record are excluded. Incomplete result sets are eligible for additional research rather than being cached as a finished five-result search. One failed provider or cloud-save operation no longer discards already researched buyers. Renamed duplicates at the same site merge their facts; different projects at the same institution remain distinct. Results display data-point and linked-document counts.

HVAC discovery also reads Raleigh’s official upcoming-project pipeline and facility directories before grounded research. Pipeline dates remain anticipated posting dates, not confirmed open bids. Closed university prequalification notices are excluded from direct-feed seeds; research batches carry rejected closed project names forward to avoid cycling through them. This adds bounded public HTTP reads without additional model rounds.
