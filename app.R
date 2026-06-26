# -------------------------------------------------------------------------
# SLU GIM House Cup — Shiny app
#
# Serves the (unchanged) parchment/React front-end and acts as the secure
# broker to a dedicated REDCap project ("IMSLU House Cup"). The REDCap API
# token never reaches the browser.
#
# Front-end <-> server contract (Shiny custom messages / input values):
#   IN  input$hc_request_init : client asks for current authoritative state
#   IN  input$hc_award        : {houseId, delta, source, raw, nonce}
#   OUT "houseCup:state"      : {points:{house:total}, history:[entry,...]}
#   OUT "houseCup:ready"      : connection established
#   OUT "houseCup:writeError" : {message}
#
# Environment (set in ~/.Renviron locally, and on Posit Connect Cloud):
#   REDCAP_URL      REDCap API endpoint
#   HOUSECUP_TOKEN  API token for the "IMSLU House Cup" project
# -------------------------------------------------------------------------

library(shiny)

source("R/redcap.R", local = TRUE)

MAX_POINTS <- 10000L

# Resolve REDCap connection from the environment.
redcap_url   <- Sys.getenv("REDCAP_URL")
redcap_token <- Sys.getenv("HOUSECUP_TOKEN")

config_ok <- nzchar(redcap_url) && nzchar(redcap_token)
if (!config_ok) {
  warning("HOUSECUP: REDCAP_URL and/or token not set — the app will run but ",
          "cannot read or write points until they are configured.")
}

# Auto-crown: when the app starts, record the champion of any completed academic
# year that hasn't been crowned yet. This is what fires the "year-end winner" the
# first time the app boots on/after July 1 (Connect Cloud cold-starts idle apps).
# Idempotent and best-effort — never block startup on it.
if (config_ok) {
  tryCatch({
    crowned <- hc_crown_pending_winners(redcap_token, redcap_url)
    if (length(crowned)) {
      message("HOUSECUP: crowned champion(s) for ", paste(crowned, collapse = ", "))
    }
  }, error = function(e) {
    warning("HOUSECUP: winner crowning skipped — ", conditionMessage(e))
  })
}

# The <head> is built here (rather than in the template) so that Shiny wraps
# the body fragment in a full page and injects its own jQuery + shiny.js —
# which is what exposes window.Shiny to the front-end. We deliberately avoid
# Bootstrap/fluidPage so nothing fights the custom parchment CSS.
error_handler_js <- "
  // Visible error handler — surface any error on the page itself
  window.addEventListener('error', function (e) {
    var root = document.getElementById('root');
    if (!root) return;
    var box = document.createElement('div');
    box.style.cssText = 'position:fixed;top:10px;left:10px;right:10px;padding:14px 18px;background:#f5ead0;color:#8b2a1a;border:2px solid #8b2a1a;font:14px/1.4 monospace;z-index:9999;white-space:pre-wrap;border-radius:4px;box-shadow:0 4px 20px rgba(0,0,0,0.3);max-height:60vh;overflow:auto';
    box.textContent = 'Error: ' + e.message + '\\n\\nat ' + (e.filename || '?') + ':' + (e.lineno || '?');
    root.appendChild(box);
  });
"

app_head <- tags$head(
  tags$meta(charset = "UTF-8"),
  tags$meta(name = "viewport",
            content = "width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no"),
  tags$meta(name = "apple-mobile-web-app-capable", content = "yes"),
  tags$meta(name = "mobile-web-app-capable", content = "yes"),
  tags$meta(name = "apple-mobile-web-app-status-bar-style", content = "black-translucent"),
  tags$meta(name = "apple-mobile-web-app-title", content = "GIM House Cup"),
  tags$meta(name = "theme-color", content = "#e9d9b3"),
  tags$title("SLU General Internal Medicine House Cup"),

  tags$link(rel = "preconnect", href = "https://fonts.googleapis.com"),
  tags$link(rel = "preconnect", href = "https://fonts.gstatic.com", crossorigin = ""),
  tags$link(rel = "stylesheet",
            href = paste0("https://fonts.googleapis.com/css2?",
                          "family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC&",
                          "family=IM+Fell+DW+Pica:ital@0;1&",
                          "family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap")),
  tags$link(rel = "stylesheet", href = "styles.css?v=7"),

  # React + in-browser JSX transpilation (pinned, from CDN)
  tags$script(crossorigin = "", src = "https://unpkg.com/react@18.3.1/umd/react.production.min.js"),
  tags$script(crossorigin = "", src = "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"),
  tags$script(src = "https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"),

  tags$script(HTML(error_handler_js))
)

ui <- tagList(app_head, htmlTemplate("index.html"))

server <- function(input, output, session) {

  # Per-session authoritative state, seeded from REDCap and appended in memory.
  state <- reactiveVal(hc_empty_state())

  push_state <- function() {
    session$sendCustomMessage("houseCup:state", state())
  }

  # Pull fresh state from REDCap (used on connect and on manual refresh).
  load_from_redcap <- function() {
    if (!config_ok) {
      session$sendCustomMessage(
        "houseCup:writeError",
        list(message = "Server is not configured for REDCap (missing URL/token).")
      )
      return(invisible(NULL))
    }
    st <- tryCatch(
      hc_read_state(redcap_token, redcap_url),
      error = function(e) {
        session$sendCustomMessage("houseCup:writeError",
                                  list(message = paste("REDCap read failed:", conditionMessage(e))))
        hc_empty_state()
      }
    )
    state(st)
    push_state()
  }

  # Client asks for current state once its websocket is connected.
  observeEvent(input$hc_request_init, {
    load_from_redcap()
    session$sendCustomMessage("houseCup:ready", list())
  })

  # An award was made in the UI: validate, clamp against authoritative total,
  # write one REDCap row, then echo the corrected state back.
  observeEvent(input$hc_award, {
    ev <- input$hc_award
    req(ev$houseId, ev$delta)

    house_id <- ev$houseId
    delta    <- suppressWarnings(as.integer(ev$delta))
    source   <- if (is.null(ev$source)) "manual" else ev$source
    raw      <- ev$raw

    validate(
      need(house_id %in% names(hc_house_names), "Unknown house."),
      need(!is.na(delta) && delta != 0, "No change to record.")
    )

    if (!config_ok) {
      session$sendCustomMessage("houseCup:writeError",
                                list(message = "Server is not configured for REDCap (missing URL/token)."))
      return(invisible(NULL))
    }

    st  <- state()
    cur <- st$points[[house_id]]
    nxt <- max(0L, min(MAX_POINTS, cur + delta))
    actual <- nxt - cur
    if (actual == 0L) return(invisible(NULL))  # clamped to no-op

    tryCatch({
      rid <- hc_write_event(redcap_token, redcap_url, house_id, actual, source, raw)

      # Update in-memory authoritative state and echo it back.
      st$points[[house_id]] <- nxt
      entry <- list(
        id        = as.character(rid),
        timestamp = as.numeric(Sys.time()) * 1000,
        amount    = as.integer(actual),
        houseId   = house_id,
        houseName = unname(hc_house_names[house_id]),
        source    = source,
        raw       = if (is.null(raw) || identical(raw, "")) NULL else raw
      )
      st$history <- c(list(entry), st$history)
      state(st)
      push_state()
    }, error = function(e) {
      session$sendCustomMessage("houseCup:writeError",
                                list(message = paste("Could not save award:", conditionMessage(e))))
      push_state()  # resync client to last-known authoritative state
    })
  })
}

shinyApp(ui, server)
