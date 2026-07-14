# Vault demo recording guide

Silent screen recording only. No voiceover. Add music in post if you want.

Target length: **under 3 minutes** (aim for 90–150 seconds of finished footage).

---

## 0. What is still running in the background

If a terminal still has a process open, it is almost always the Vite dev server:

```text
npm run dev  →  http://127.0.0.1:5173/
```

Keep it running while you record. Stop it later with `Ctrl+C` if you want.

You do **not** need `npm install` again unless `node_modules` is missing or dependencies changed.

---

## 1. What only you still need to do (outside the app)

| # | Task | Required? |
| --- | --- | --- |
| 1 | Public GitHub repo (MIT already in project) | Yes |
| 2 | Push this project (exclude `node_modules` / `dist`) | Yes |
| 3 | Record demo video under 3 minutes | Yes |
| 4 | Submit on DoraHacks (repo + video) | Yes |
| 5 | Optional: logo, favicon, player photos | No |
| 6 | Optional: background music in the edit | No |

---

## 2. Pre-record checklist

### Environment

- [ ] Project folder opens and `npm run dev` works
- [ ] Browser at `http://127.0.0.1:5173/` or `http://localhost:5173/`
- [ ] Hard refresh once (`Ctrl+Shift+R`)
- [ ] Window ~1920×1080, zoom 100%
- [ ] Hide bookmarks bar; close extra tabs
- [ ] Mute system notifications
- [ ] Recorder ready (OBS, Game Bar, Loom, etc.)
- [ ] Cursor visible and not too large

### Clean first-run state (recommended)

DevTools → Application → Local Storage → clear keys starting with:

- `vault.wallet.session`
- `vault.squad.`
- `vault.trades.`

Then refresh. Fresh connect + first agent cycle looks better on camera.

### Functional checks (do before pressing record)

1. **Landing**
   - [ ] Hero video plays
   - [ ] Ticker scrolls in the top bar
   - [ ] Scroll: sections blur/lift in
   - [ ] **Live trade proof** adds a new row every few seconds (not frozen)
   - [ ] Squad intelligence shows a player tile with radar

2. **Connect**
   - [ ] **Connect wallet and enter demo** → lands on `/app`
   - [ ] Sidebar shows `0x...` address and USDt balance

3. **Agent cycle**
   - [ ] Auto cycle runs, or **Run agent cycle** works
   - [ ] Agent panel steps change (evaluating / negotiating / settling)
   - [ ] New trade row slides in; settled amount counts up
   - [ ] USDt balance updates after settlement

4. **Other pages**
   - [ ] Squad: full grid of player tiles
   - [ ] Agent: reasoning log entries
   - [ ] Trades: table with sort + date filters
   - [ ] Disconnect returns to landing

5. **Build**
   - [ ] `npm run build` exits 0 (submission hygiene)

---

## 3. Shot list (what to record, in order)

Record in one continuous take if you can. Pause between beats only if you need to cut later.

### Shot A · Landing hero (8–12s)

1. Start on `/` with the hero filling the frame.
2. Hold 2–3 seconds so the background video is obvious.
3. Slowly move the cursor across the top bar so the **scrolling ticker** is readable.
4. Do **not** click connect yet.

**Show:** product name, cinematic hero, live ticker, Connect CTA.

---

### Shot B · Landing scroll (20–30s)

Scroll smoothly, pause briefly on each block so a judge can read the headings.

1. **The agent loop** — all three steps (01 / 02 / 03) in frame.
2. **Live trade proof** — stop scrolling and **hold 8–12 seconds**.
   - Wait until at least **one new trade row** slides in.
   - Cursor can hover a row once so the hover state shows.
3. **Squad intelligence** — player tile + radar in frame.
4. **Track fit** — QVAC and WDK cards both visible.

**Show:** how the product works, live proof motion, same UI language as the app, dual-track fit.

---

### Shot C · Connect into the app (8–12s)

1. Scroll to a Connect button (hero or closing CTA).
2. Click **Connect wallet and enter demo**.
3. Keep recording through the short “Creating WDK wallet...” state.
4. Land on the **Dashboard** and pause 1–2 seconds.

**Show:** one-click entry, real wallet creation, app shell.

---

### Shot D · Dashboard + live settlement (35–50s) — main shot

Frame: KPI strip + trade feed + right-hand **Agent** panel all visible if possible (wide browser window).

1. Point (cursor, no click) at each KPI briefly:
   - Squad value
   - Agent status
   - Open trades
   - USDt balance
2. Point at the **Agent** panel: current step + live reasoning.
3. If a cycle is not already running, click **Run agent cycle**.
4. Hold while status moves through evaluate → negotiate → settle.
5. Watch a **new trade row** enter the feed from the top.
6. Watch the settlement amount **count up**.
7. Glance cursor at the USDt balance so the change is obvious.

**Show:** full agent loop and the settlement moment. This is the core of the video.

---

### Shot E · Agent log (10–15s)

1. Click **Agent** in the sidebar (or “Open full reasoning log”).
2. Scroll slowly through 2–4 log entries.
3. Pause so evaluate / propose / negotiate / settle labels are readable.

**Show:** decisions are written down and auditable.

---

### Shot F · Trades history (8–12s)

1. Click **Trades**.
2. Click one column header (e.g. Time or Value) to show sorting.
3. Optional: set a date filter then clear it.

**Show:** full settlement table, not only the live feed.

---

### Shot G · Squad grid (10–15s)

1. Click **Squad**.
2. Slow scroll across the grid.
3. Hover one player tile (radar + value trend + strengths/style).

**Show:** players as data, not collectible cards.

---

### Shot H · End card frame (5–8s)

1. Click **Dashboard** again.
2. Hold on trade feed + agent panel together.
3. Stop recording.

Optional end card in the editor (text only, no voice):

```text
Vault
On-device agent · WDK USDt settlement
QVAC + WDK · Tether Developers Cup
```

---

## 4. Short cut (if you need under 60s)

Use only these shots, in order:

| Time | Shot |
| --- | --- |
| 0–8s | A hero |
| 8–20s | B proof section only (hold for a new row) |
| 20–28s | C connect |
| 28–50s | D agent cycle + settlement |
| 50–60s | E agent log (one scroll) then stop on Dashboard |

Skip F and G if tight on time.

---

## 5. Editing notes (music, no speech)

- Keep cuts clean; prefer long holds over fast jump cuts on the settlement shot.
- Music: low, steady, not lyrical if possible so UI text stays the focus.
- Duck music slightly under the settlement moment if levels fight the UI motion.
- Burn in captions only if you want (optional). Do **not** rely on voiceover.
- Export 1080p, H.264, under platform size limits.

---

## 6. If something breaks while recording

| Problem | Fix |
| --- | --- |
| Connect stuck | Hard refresh, clear `vault.wallet.session`, reconnect |
| No new trade | Click **Run agent cycle**, wait ~4s |
| Proof feed static | Hard refresh landing; wait 5s on that section |
| Port busy | `npm run dev -- --port 5174` |
| Hero video black | Confirm `public/vault-hero-bg.mp4`, hard refresh |
| Styles missing | Wait for Vite optimize, hard refresh |

---

## 7. Submission package

- [ ] Public GitHub repo
- [ ] MIT license visible
- [ ] README with `npm install` + `npm run dev`
- [ ] Demo video under 3 minutes (this guide)
- [ ] DoraHacks form + **QVAC** and **WDK** tracks
- [ ] Optional social posts from `MARKETING.md`

---

## 8. One-line product line (for README / form, not spoken)

Vault is an on-device fantasy football agent that negotiates trades with other agents and settles in USDt through WDK, with no cloud reasoning path and no manual trade approval.
