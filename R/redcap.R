# -------------------------------------------------------------------------
# REDCap I/O for the SLU GIM House Cup
#
# Backing store: a dedicated REDCap project ("IMSLU House Cup") with a single
# instrument `house_points`, one record per award event. See
# redcap/HouseCup_DataDictionary.csv for the field definitions.
#
# All functions take the token + url explicitly so the app can choose test
# vs. prod at startup. Nothing here reads Sys.getenv() directly.
# -------------------------------------------------------------------------

library(REDCapR)
library(dplyr)
library(tibble)

# House id (used by the front-end) <-> REDCap coded value (1-5)
hc_house_levels <- c(
  "1" = "walden",
  "2" = "fitch",
  "3" = "drake",
  "4" = "slavin",
  "5" = "kinsella"
)

hc_house_names <- c(
  walden   = "Walden",
  fitch    = "Fitch",
  drake    = "Drake",
  slavin   = "Slavin",
  kinsella = "Kinsella"
)

# Source tag <-> REDCap coded value (matches the app's source tags)
hc_source_levels <- c("1" = "text", "2" = "voice", "3" = "desk", "4" = "button")

hc_code_to_house  <- function(code) unname(hc_house_levels[as.character(code)])
hc_house_to_code  <- function(id)   names(hc_house_levels)[match(id, hc_house_levels)]
hc_code_to_source <- function(code) unname(hc_source_levels[as.character(code)])
hc_source_to_code <- function(src)  names(hc_source_levels)[match(src, hc_source_levels)]

# Academic year (July 1 – June 30) containing a given date, as "YYYY-YYYY".
# e.g. 2026-06-30 -> "2025-2026"; 2026-07-01 -> "2026-2027". Vectorized.
hc_acad_year <- function(date = Sys.Date()) {
  date  <- as.Date(date)
  y     <- as.integer(format(date, "%Y"))
  m     <- as.integer(format(date, "%m"))
  start <- ifelse(m >= 7, y, y - 1L)
  sprintf("%d-%d", start, start + 1L)
}

# Empty state: every house at zero, no history, current academic year.
hc_empty_state <- function() {
  pts <- as.list(stats::setNames(rep(0L, length(hc_house_names)), names(hc_house_names)))
  list(points = pts, history = list(), acadYear = hc_acad_year())
}

# Convert a stored event_ts into epoch milliseconds (what the front-end's
# formatTimeAgo() expects). We write timestamps as America/Chicago wall-clock,
# but REDCapR hands them back as POSIXct parsed as UTC (it mislabels the zone).
# So: recover the original wall-clock digits (formatting in UTC, which is how
# REDCapR tagged them) and re-interpret them as Central — DST-safe, and works
# whether REDCapR returns POSIXct or a plain character string.
hc_ts_to_epoch_ms <- function(ts) {
  wall   <- format(as.POSIXct(ts, tz = "UTC"), "%Y-%m-%d %H:%M:%S", tz = "UTC")
  parsed <- as.POSIXct(wall, format = "%Y-%m-%d %H:%M:%S", tz = "America/Chicago")
  as.numeric(parsed) * 1000
}

# Read all award events and fold them into the state object the front-end uses:
#   list(points = list(house_id = total, ...), history = list(entry, ...))
# history is newest-first; the UI shows the top 5.
hc_read_state <- function(token, url) {
  res <- REDCapR::redcap_read(
    redcap_uri = url,
    token      = token,
    fields     = c("record_id", "event_ts", "house", "points", "source", "note"),
    verbose    = FALSE
  )

  if (!isTRUE(res$success) || nrow(res$data) == 0) {
    return(hc_empty_state())
  }

  # Only the current academic year counts — this is the automatic July 1 reset.
  # Each event's year is derived from its own timestamp (using the wall-clock
  # date, immune to the UTC mislabeling), so prior years stay in REDCap but
  # drop out of the live totals.
  current_ay <- hc_acad_year()
  d <- res$data |>
    dplyr::mutate(
      house_id = hc_code_to_house(.data$house),
      points   = suppressWarnings(as.integer(.data$points)),
      ev_date  = as.Date(format(as.POSIXct(.data$event_ts, tz = "UTC"), "%Y-%m-%d", tz = "UTC")),
      ev_ay    = hc_acad_year(.data$ev_date)
    ) |>
    dplyr::filter(!is.na(.data$house_id), !is.na(.data$points), .data$ev_ay == current_ay)

  if (nrow(d) == 0) return(hc_empty_state())

  # Totals per house, defaulting any house with no events to 0.
  totals <- d |>
    dplyr::group_by(.data$house_id) |>
    dplyr::summarise(total = sum(.data$points), .groups = "drop")

  pts <- hc_empty_state()$points
  for (i in seq_len(nrow(totals))) {
    pts[[totals$house_id[i]]] <- as.integer(totals$total[i])
  }

  # History entries, newest first (highest record_id = most recent award).
  hist_df <- d |>
    dplyr::arrange(dplyr::desc(suppressWarnings(as.integer(.data$record_id))))

  history <- lapply(seq_len(nrow(hist_df)), function(i) {
    row <- hist_df[i, ]
    list(
      id        = as.character(row$record_id),
      timestamp = hc_ts_to_epoch_ms(row$event_ts),
      amount    = as.integer(row$points),
      houseId   = row$house_id,
      houseName = unname(hc_house_names[row$house_id]),
      source    = hc_code_to_source(row$source),
      raw       = if (is.na(row$note) || row$note == "") NULL else as.character(row$note)
    )
  })

  list(points = pts, history = history, acadYear = current_ay)
}

# Append one award event as a new record. Returns the new record_id (character)
# on success, or stops with an informative error on failure.
# Timestamps are written AND read as America/Chicago wall-clock so "time ago"
# stays correct regardless of the server's timezone (Connect Cloud runs UTC).
hc_write_event <- function(token, url, house_id, points, source, note = NULL,
                           ts = format(Sys.time(), "%Y-%m-%d %H:%M:%S", tz = "America/Chicago")) {
  next_id <- REDCapR::redcap_next_free_record_name(
    redcap_uri = url, token = token, verbose = FALSE
  )

  row <- tibble::tibble(
    record_id = next_id,
    event_ts  = ts,
    house     = hc_house_to_code(house_id),
    points    = as.integer(points),
    source    = hc_source_to_code(source),
    note      = if (is.null(note)) NA_character_ else as.character(note)
  )

  res <- REDCapR::redcap_write(
    ds_to_write = row,
    redcap_uri  = url,
    token       = token,
    verbose     = FALSE
  )

  if (!isTRUE(res$success)) {
    stop(sprintf("REDCap write failed: %s", res$outcome_message))
  }
  next_id
}

# -------------------------------------------------------------------------
# Yearly champion (auto-crown)
#
# Winners live in the `house_cup_winners` instrument (one record per year).
# `hc_crown_pending_winners()` is idempotent: it finds completed academic years
# that have point events but no winner record yet, computes each year's leader,
# and records it. Called at app startup; can also be called from a scheduled
# job (pass `current_ay` to simulate a date).
# -------------------------------------------------------------------------

hc_ay_start <- function(ay) as.integer(substr(ay, 1, 4))

# Academic years already crowned (character vector of "YYYY-YYYY").
# Returns empty if the winners instrument doesn't exist yet.
hc_read_winners <- function(token, url) {
  res <- tryCatch(
    REDCapR::redcap_read(
      redcap_uri = url, token = token,
      fields = c("record_id", "win_acad_year"), verbose = FALSE
    ),
    error = function(e) list(success = FALSE)
  )
  if (!isTRUE(res$success) || is.null(res$data) || nrow(res$data) == 0 ||
      !"win_acad_year" %in% names(res$data)) {
    return(character(0))
  }
  v <- as.character(res$data$win_acad_year)
  v[!is.na(v) & nzchar(v)]
}

# Record one champion as a new record in house_cup_winners. house_id may be NA
# for a tie (leave the winning-house blank, describe it in the note).
hc_write_winner <- function(token, url, acad_year, house_id, points, note = NULL,
                            recorded = format(Sys.time(), "%Y-%m-%d %H:%M:%S",
                                              tz = "America/Chicago")) {
  next_id <- REDCapR::redcap_next_free_record_name(
    redcap_uri = url, token = token, verbose = FALSE
  )
  row <- tibble::tibble(
    record_id     = next_id,
    win_acad_year = acad_year,
    win_house     = if (is.na(house_id)) NA_character_ else hc_house_to_code(house_id),
    win_points    = as.integer(points),
    win_recorded  = recorded,
    win_note      = if (is.null(note)) NA_character_ else as.character(note)
  )
  res <- REDCapR::redcap_write(
    ds_to_write = row, redcap_uri = url, token = token, verbose = FALSE
  )
  if (!isTRUE(res$success)) {
    stop(sprintf("Winner write failed: %s", res$outcome_message))
  }
  next_id
}

# Crown any completed academic year that has events but no winner on record.
# Returns the years crowned (character vector), invisibly.
hc_crown_pending_winners <- function(token, url, current_ay = hc_acad_year()) {
  res <- REDCapR::redcap_read(
    redcap_uri = url, token = token,
    fields = c("record_id", "event_ts", "house", "points"), verbose = FALSE
  )
  if (!isTRUE(res$success) || nrow(res$data) == 0) return(invisible(character(0)))

  ev <- res$data |>
    dplyr::mutate(
      house_id = hc_code_to_house(.data$house),
      points   = suppressWarnings(as.integer(.data$points)),
      ev_date  = as.Date(format(as.POSIXct(.data$event_ts, tz = "UTC"), "%Y-%m-%d", tz = "UTC")),
      ev_ay    = hc_acad_year(.data$ev_date)
    ) |>
    dplyr::filter(!is.na(.data$house_id), !is.na(.data$points))
  if (nrow(ev) == 0) return(invisible(character(0)))

  # Completed years = strictly before the current academic year.
  completed <- unique(ev$ev_ay[hc_ay_start(ev$ev_ay) < hc_ay_start(current_ay)])
  if (length(completed) == 0) return(invisible(character(0)))
  todo <- setdiff(completed, hc_read_winners(token, url))
  if (length(todo) == 0) return(invisible(character(0)))

  crowned <- character(0)
  for (ay in todo) {
    sub    <- ev[ev$ev_ay == ay, ]
    totals <- tapply(sub$points, sub$house_id, sum)
    totals <- totals[!is.na(totals)]
    if (length(totals) == 0) next
    top     <- max(totals)
    leaders <- names(totals)[totals == top]

    # Re-check immediately before writing to shrink the double-crown race window.
    if (ay %in% hc_read_winners(token, url)) next

    if (length(leaders) == 1) {
      hc_write_winner(token, url, ay, leaders[1], top, note = NULL)
    } else {
      tie_names <- paste(unname(hc_house_names[leaders]), collapse = ", ")
      hc_write_winner(token, url, ay, NA, top,
                      note = paste0("Tie at ", top, ": ", tie_names))
    }
    crowned <- c(crowned, ay)
  }
  invisible(crowned)
}
