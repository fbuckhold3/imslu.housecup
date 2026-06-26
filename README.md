# SLU GIM House Cup

A points tracker for the five resident houses of the Saint Louis University
General Internal Medicine Residency Program, styled as an 1800s medical-textbook
ledger. Built as an R/Shiny app backed by REDCap, deployable to Posit Connect Cloud.

Five houses compete:

- **Walden / Valor** — anatomical heart, Prussian blue
- **Fitch / Honor** — brain, oxblood red
- **Drake / Liberty** — kidney, verdigris green
- **Slavin / Eagle** — lungs, aged ochre
- **Kinsella / Freedom** — neutrophil, aubergine purple

## Architecture

The original visual layer (a self-contained React + Babel SPA) is preserved
intact. Shiny wraps it and acts as the secure broker to REDCap — the API token
never reaches the browser.

```
Browser (React UI)  ──hc_award──▶  Shiny server (app.R)  ──redcap_write──▶  REDCap
        ▲                                  │                  "house_points" project
        └────── houseCup:state ◀───────────┘  (totals + recent history)
```

- **`index.html`** — body fragment (the page's DOM + bootstrap scripts). The
  `<head>` is built in `app.R` so Shiny injects its own jQuery + shiny.js.
- **`www/app.js`** — the React app (JSX, transpiled in-browser by Babel). Its
  persistence layer talks to the Shiny server instead of `localStorage`.
- **`www/styles.css`** — all styling (parchment, hourglasses, typography).
- **`app.R`** — Shiny server: serves the UI, validates awards, reads/writes REDCap.
- **`R/redcap.R`** — REDCap I/O (`hc_read_state`, `hc_write_event`) via `REDCapR`.
- **`redcap/HouseCup_DataDictionary.csv`** — importable REDCap data dictionary.

Points are house-level aggregates. Each award is one row in the `house_points`
instrument; a house's total is the sum of its rows, and the "Ledger of Late
Entries" shows the most recent awards. (The old localStorage "Strike All" became
a **Refresh** that re-pulls authoritative state from REDCap.)

## Features

- **Hourglass visualization**, **The Scrivener's Desk** natural-language parser
  (`50 points to Walden`, `take 10 from Drake`, `Fitch +25`), **voice commands**,
  **Quick Award** grid, **Ledger**, **leader indicator** — all unchanged from the
  original design.

## REDCap backend

The points store is a dedicated REDCap project (kept separate from the resident
milestone database so it can't pollute the rosters other apps read). Set it up:

1. Create a new empty REDCap project (e.g. "IMSLU House Cup").
2. **Project Setup → Data Dictionary → Upload** `redcap/HouseCup_DataDictionary.csv`,
   then **Commit Changes**.
3. Generate an API token (Export + Import rights).

`house_points` fields: `record_id`, `event_ts` (datetime, app-set), `house`
(dropdown 1–5), `points` (integer, negatives allowed), `source` (text/voice/desk/
button), `note` (optional).

## Environment

Set in `~/.Renviron` locally and as environment variables on Posit Connect Cloud
— never committed:

- `REDCAP_URL` — REDCap API endpoint
- `HOUSECUP_TOKEN` — API token for the House Cup project

The app runs without these (UI renders, houses at 0) but cannot read or write
points until they are configured.

## Run locally

```r
shiny::runApp(".")
```

Requires: `shiny`, `REDCapR`, `dplyr`, `tibble` (htmltools ships with shiny).
This project uses `renv` for deployment — run `renv::init()` / `renv::snapshot()`
to capture the lockfile before pushing.

## Deployment

Push to a GitHub repo connected to Posit Connect Cloud, which deploys on push to
main. Set `REDCAP_URL` and `HOUSECUP_TOKEN` as content environment variables.

## License

MIT — see [LICENSE](LICENSE).
