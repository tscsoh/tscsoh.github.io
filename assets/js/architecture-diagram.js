/*
 * How I Architect AI Systems - D3 architecture diagram
 * Enterprise orchestration over local, self-hosted LLMs.
 * Requires D3 v7 (loaded via CDN in index.html) and
 * assets/css/architecture-diagram.css for styling.
 */
(function () {
  "use strict";

  var W = 1300, H = 620;

  // ---- palette sampled from the UX-process diagram directly below this
  // section (Discover/Define/Prototype/Design/Deliver), so the two feel
  // like one system rather than two unrelated graphics -----------------
  var PALETTE = {
    router: "#00b3b3",   // Discover  (teal)
    rag:    "#1f86ad",   // Define    (blue)
    tools:  "#d81f74",   // Prototype (pink)
    guard:  "#54269e",   // Design    (purple)
    obs:    "#c99b1f",   // Deliver   (gold, darkened slightly for text contrast)
    core:   "#c5a47e",   // site's own brand gold - ties to the rest of the page
    neutral:"#8a8a8a"
  };

  // ---- node data (fixed layout - this is a real, working reference
  // architecture, not a random graph). Every node keeps at least 20
  // logical units of clearance from the SVG/boundary edges. -----------
  var nodes = [
    { id: "web",      label: "Web App",         icon: "", x: 405, y: 55, w: 160, h: 50, type: "client", accent: PALETTE.neutral,
      desc: "Browser-based client. Talks to the orchestration layer only through the API Gateway." },
    { id: "mobile",    label: "Mobile App",      icon: "", x: 650, y: 55, w: 160, h: 50, type: "client", accent: PALETTE.neutral,
      desc: "Native iOS/Android client, same gateway contract as the web app." },
    { id: "internal",  label: "Internal Tools",  icon: "", x: 895, y: 55, w: 160, h: 50, type: "client", accent: PALETTE.neutral,
      desc: "Internal dashboards and scripts used by staff, still authenticated through the gateway." },

    { id: "gateway",   label: "API Gateway",     icon: "", sub: "AuthN/Z · Rate Limit · TLS", x: 650, y: 163, w: 225, h: 60, type: "gateway", accent: PALETTE.neutral,
      desc: "Single public entry point. Terminates TLS, authenticates callers, enforces rate limits before anything reaches the orchestrator." },

    { id: "orchestrator", label: "Orchestration Engine", icon: "", sub: "Agent Graph · Task Router · Session Ctx", x: 650, y: 282, w: 310, h: 82, type: "core", accent: PALETTE.core,
      desc: "The brain of the system: routes each request through a task graph, decides which model, tools and data sources a request needs, and assembles the final response." },

    { id: "model-router", label: "Model Router", icon: "", sub: "Routes by task, cost & latency", x: 160, y: 408, w: 210, h: 64, type: "service", accent: PALETTE.router,
      desc: "Chooses which local model serves a given request: a small fast model for simple turns, a larger model for complex reasoning." },
    { id: "rag",        label: "RAG Retrieval",  icon: "", sub: "Query rewrite · re-rank",        x: 405, y: 408, w: 210, h: 64, type: "service", accent: PALETTE.rag,
      desc: "Rewrites the user query, retrieves relevant chunks from the vector store, and re-ranks them before they're added to the model's context." },
    { id: "tools",       label: "Tool Sandbox",   icon: "", sub: "Function calling · isolation",   x: 650, y: 408, w: 210, h: 64, type: "service", accent: PALETTE.tools,
      desc: "Executes model-requested function calls in an isolated runtime with a strict allow-list of internal and external endpoints." },
    { id: "guardrails",  label: "Guardrails",     icon: "", sub: "PII redaction · policy filter",  x: 895, y: 408, w: 210, h: 64, type: "service", accent: PALETTE.guard,
      desc: "Pre- and post-processing filter: redacts sensitive data on the way in, checks policy compliance on the way out." },
    { id: "observability", label: "Observability", icon: "", sub: "Logs · Traces · Metrics",        x: 1140, y: 408, w: 210, h: 64, type: "service", accent: PALETTE.obs,
      desc: "Structured logging, distributed tracing and metrics for every step of a request, required for debugging and audit." },

    { id: "llm-a",       label: "Llama-3 70B",   icon: "", sub: "GPU A · vLLM",    x: 103, y: 524, w: 100, h: 64, type: "llm", accent: PALETTE.router, compact: true,
      desc: "Larger self-hosted model for complex reasoning, served on-prem via vLLM. No request or token ever leaves the network." },
    { id: "llm-b",       label: "Llama-3 8B",    icon: "", sub: "GPU B · fast path", x: 217, y: 524, w: 100, h: 64, type: "llm", accent: PALETTE.router, compact: true,
      desc: "Smaller, faster self-hosted model for simple/low-latency turns, served via Ollama on a second GPU node." },
    { id: "vector-db",   label: "Vector DB",     icon: "", sub: "pgvector · embeddings", x: 405, y: 524, w: 210, h: 64, type: "data", accent: PALETTE.rag,
      desc: "Stores document embeddings for retrieval-augmented generation, running as a Postgres extension inside the private network." },
    { id: "internal-api", label: "Internal APIs", icon: "", sub: "CRM · ERP · WMS", x: 592, y: 524, w: 108, h: 64, type: "data", accent: PALETTE.tools, compact: true,
      desc: "Read/write access to internal systems of record - CRM, ERP and warehouse management - called only through the tool sandbox." },
    { id: "external-api", label: "External APIs", icon: "", sub: "Allow-listed only", x: 708, y: 524, w: 108, h: 64, type: "data", accent: PALETTE.tools, compact: true,
      desc: "A narrow, explicitly allow-listed set of third-party APIs, reached through an egress proxy for auditability." },
    { id: "audit",       label: "Audit Log",     icon: "", sub: "SIEM · immutable trail", x: 895, y: 524, w: 210, h: 64, type: "data", accent: PALETTE.guard,
      desc: "Immutable, append-only record of every guardrail decision, feeding the SIEM for compliance review." },
    { id: "datastore",   label: "Redis + Postgres", icon: "", sub: "Session & conversation state", x: 1140, y: 282, w: 200, h: 64, type: "data", accent: PALETTE.core,
      desc: "Redis for short-lived session state, Postgres for durable conversation history. Both private, both inside the boundary." }
  ];

  var links = [
    { s: "web", t: "gateway" }, { s: "mobile", t: "gateway" }, { s: "internal", t: "gateway" },
    { s: "gateway", t: "orchestrator", animated: true },
    { s: "orchestrator", t: "model-router", animated: true },
    { s: "orchestrator", t: "rag", animated: true },
    { s: "orchestrator", t: "tools" },
    { s: "orchestrator", t: "guardrails" },
    { s: "orchestrator", t: "observability" },
    // Not chains - the router picks ONE of these two models per request
    // ("routes by task, cost & latency"), and the tool sandbox calls
    // EITHER an internal system or an allow-listed external API. Both
    // pairs are peer destinations, drawn side by side, each with its
    // own direct link from the parent.
    { s: "model-router", t: "llm-a", animated: true },
    { s: "model-router", t: "llm-b" },
    { s: "rag", t: "vector-db", animated: true },
    { s: "tools", t: "internal-api" },
    { s: "tools", t: "external-api" },
    { s: "guardrails", t: "audit" },
    // Session/conversation state is the orchestrator's own concern
    // (see its "Session Ctx" subtitle) - not Observability's.
    { s: "orchestrator", t: "datastore", side: true }
  ];

  var byId = {};
  nodes.forEach(function (n) { byId[n.id] = n; });

  var adjacency = {};
  nodes.forEach(function (n) { adjacency[n.id] = { nodes: {}, links: [] }; adjacency[n.id].nodes[n.id] = true; });
  links.forEach(function (l, i) {
    adjacency[l.s].nodes[l.t] = true;
    adjacency[l.t].nodes[l.s] = true;
    adjacency[l.s].links.push(i);
    adjacency[l.t].links.push(i);
  });

  function elbow(s, t) {
    var sx = s.x, sy = s.y + s.h / 2;
    var tx = t.x, ty = t.y - t.h / 2;
    var midY = sy + (ty - sy) / 2;
    return "M" + sx + "," + sy + " V" + midY + " H" + tx + " V" + ty;
  }

  // Same elbow shape, shifted sideways by `off` - used only as an
  // invisible guide path so the request pulse and the response pulse
  // each get their own lane instead of overlapping on the visible line.
  // The elbow has two orientations (vertical run, horizontal run), so
  // "sideways" means different axes for each: the two vertical segments
  // shift in x, the horizontal segment shifts in y - offsetting only x
  // (as an earlier version did) left the horizontal segment unshifted,
  // so both lanes still overlapped anywhere the link ran horizontally.
  function elbowOffset(s, t, off) {
    var sx = s.x + off, sy = s.y + s.h / 2;
    var tx = t.x + off, ty = t.y - t.h / 2;
    var midY = sy + (ty - sy) / 2 + off;
    return "M" + sx + "," + sy + " V" + midY + " H" + tx + " V" + ty;
  }

  // orchestrator → datastore runs sideways at the same height (both
  // sit in the core's row) rather than top-down like every other link,
  // so it gets its own straight horizontal path instead of elbow()'s
  // vertical-horizontal-vertical shape. `off` shifts the whole line up
  // or down, the equivalent of elbowOffset's y-shift on a horizontal run.
  function sideLink(s, t, off) {
    var sx = s.x + s.w / 2, sy = s.y + (off || 0);
    var tx = t.x - t.w / 2;
    return "M" + sx + "," + sy + " H" + tx;
  }

  function linkPath(l) {
    return l.side ? sideLink(byId[l.s], byId[l.t], 0) : elbow(byId[l.s], byId[l.t]);
  }
  function linkPathOffset(l, off) {
    return l.side ? sideLink(byId[l.s], byId[l.t], off) : elbowOffset(byId[l.s], byId[l.t], off);
  }

  var container = document.getElementById("arch-diagram");
  if (!container) { return; }
  if (typeof d3 === "undefined") { return; }

  var svg = d3.select(container).append("svg")
    .attr("viewBox", "0 0 " + W + " " + H)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("role", "img");

  // ---- soft glow filters, reused across nodes/links for a high-tech
  // but restrained look (no filter is on by default - applied via class) --
  var defs = svg.append("defs");
  [["glow-soft", 2.2], ["glow-strong", 4.5]].forEach(function (spec) {
    var f = defs.append("filter")
      .attr("id", spec[0])
      .attr("x", "-80%").attr("y", "-80%").attr("width", "260%").attr("height", "260%");
    f.append("feGaussianBlur").attr("in", "SourceGraphic").attr("stdDeviation", spec[1]).attr("result", "blur");
    var merge = f.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");
  });

  var gGlow = svg.append("g");
  var gBoundary = svg.append("g");
  var gLinks = svg.append("g");
  var gPulses = svg.append("g");
  var gNodes = svg.append("g");

  // soft ambient glow that breathes behind the orchestrator - draws the
  // eye to the hub of the system without being a distraction
  var core = byId.orchestrator;
  var coreGlow = gGlow.append("rect")
    .attr("x", core.x - core.w / 2 - 6).attr("y", core.y - core.h / 2 - 6)
    .attr("width", core.w + 12).attr("height", core.h + 12)
    .attr("rx", 13)
    .attr("fill", "none")
    .attr("stroke", PALETTE.core)
    .attr("stroke-width", 2)
    .attr("filter", "url(#glow-strong)")
    .attr("opacity", 0);

  gBoundary.append("rect")
    .attr("class", "arch-boundary")
    .attr("x", 23).attr("y", 209)
    .attr("width", 1254).attr("height", 379)
    .attr("rx", 14);
  gBoundary.append("text")
    .attr("class", "arch-boundary-label")
    .attr("x", 38).attr("y", 244)
    .text("PRIVATE NETWORK · NO DATA LEAVES PREMISES");

  function linkColor(l) {
    var t = byId[l.t];
    return (t.type === "service" || t.type === "llm" || t.type === "data") ? t.accent : "#cfcfcf";
  }

  var linkSel = gLinks.selectAll("path.arch-link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", function (l) { return "arch-link" + (l.animated ? " trunk" : ""); })
    .attr("d", linkPath)
    .attr("stroke", linkColor)
    .attr("opacity", 0);

  // line-draw reveal: each path starts fully hidden behind its own length
  // in dashes, then "draws itself" open - reads as a schematic powering on
  linkSel.each(function () {
    var len = this.getTotalLength();
    d3.select(this)
      .attr("stroke-dasharray", len + " " + len)
      .attr("stroke-dashoffset", len);
  });

  // Invisible lane paths pulses travel along: +LANE for the request
  // (source→target), -LANE for the response (target→source), so the
  // two directions sit visibly side-by-side instead of overlapping.
  var LANE = 5;
  var gGuides = svg.append("g").attr("class", "arch-guides");
  var guideFwd = [], guideRev = [];
  links.forEach(function (l) {
    guideFwd.push(gGuides.append("path")
      .attr("d", linkPathOffset(l, LANE))
      .attr("fill", "none").attr("stroke", "none").node());
    guideRev.push(gGuides.append("path")
      .attr("d", linkPathOffset(l, -LANE))
      .attr("fill", "none").attr("stroke", "none").node());
  });

  var tooltip = d3.select(container)
    .append("div")
    .attr("class", "arch-tooltip");

  var nodeSel = gNodes.selectAll("g.arch-node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", function (n) { return "arch-node " + n.type; })
    .attr("transform", function (n) { return "translate(" + n.x + "," + n.y + ") scale(0.85)"; })
    .attr("opacity", 0);

  nodeSel.append("rect")
    .attr("x", function (n) { return -n.w / 2; })
    .attr("y", function (n) { return -n.h / 2; })
    .attr("width", function (n) { return n.w; })
    .attr("height", function (n) { return n.h; })
    .attr("rx", 9)
    .attr("stroke", function (n) { return n.accent; });

  var badge = nodeSel.append("g")
    .attr("class", "arch-badge")
    .attr("transform", function (n) { return "translate(" + (-n.w / 2) + "," + (-n.h / 2) + ")"; });

  badge.append("circle")
    .attr("r", function (n) { return n.type === "core" ? 18 : (n.compact ? 12 : 15); })
    .attr("fill", function (n) { return n.accent; });

  badge.append("text")
    .attr("fill", "#ffffff")
    .attr("font-size", function (n) {
      // fa-mobile's glyph sits notably smaller within its own bounding
      // box than the other icons used here, so it needs a nudge to look
      // visually consistent alongside them.
      if (n.id === "mobile") { return 18; }
      if (n.compact) { return 11; }
      return n.type === "core" ? 17 : 14;
    })
    .text(function (n) { return n.icon; });

  // compact: true marks the narrower side-by-side pairs (the two LLMs,
  // internal/external APIs) - smaller type so their labels still fit
  // at roughly half the width of every other node.
  nodeSel.append("text")
    .attr("class", "arch-label")
    .attr("text-anchor", "middle")
    .attr("y", function (n) { return n.sub ? -8 : 6; })
    .attr("font-size", function (n) { return n.type === "core" ? 20 : (n.compact ? 13 : 17); })
    .attr("font-weight", function (n) { return n.type === "core" ? 700 : 600; })
    .text(function (n) { return n.label; });

  nodeSel.filter(function (n) { return n.sub; })
    .append("text")
    .attr("class", "arch-sub")
    .attr("text-anchor", "middle")
    .attr("y", function (n) { return n.compact ? 15 : 17; })
    .attr("font-size", function (n) { return n.compact ? 10.5 : 13.5; })
    .text(function (n) { return n.sub; });

  function clearHighlight() {
    nodeSel.classed("dim", false);
    linkSel.classed("dim", false).classed("active", false);
    tooltip.classed("show", false);
  }

  // Keeps the tooltip on-screen: flips to whichever side of the cursor
  // actually has room, instead of always anchoring bottom-right (which
  // ran the box off the container on nodes near the right/bottom edge).
  function positionTooltip(event) {
    var rect = container.getBoundingClientRect();
    var mx = event.clientX - rect.left;
    var my = event.clientY - rect.top;
    var tw = tooltip.node().offsetWidth;
    var th = tooltip.node().offsetHeight;
    var pad = 12;

    var left = mx + 16;
    if (left + tw + pad > rect.width) { left = mx - tw - 16; }
    if (left < pad) { left = pad; }

    var top = my + 12;
    if (top + th + pad > rect.height) { top = my - th - 12; }
    if (top < pad) { top = pad; }

    tooltip.style("left", left + "px").style("top", top + "px");
  }

  nodeSel
    .on("mouseenter", function (event, n) {
      var adj = adjacency[n.id];
      nodeSel.classed("dim", function (o) { return !adj.nodes[o.id]; })
        .classed("lit", function (o) { return adj.nodes[o.id]; });
      linkSel
        .classed("dim", function (l, i) { return adj.links.indexOf(i) === -1; })
        .classed("active", function (l, i) { return adj.links.indexOf(i) !== -1; });
      tooltip
        .html("<b>" + n.label + "</b><br>" + n.desc)
        .classed("show", true);
      positionTooltip(event);
    })
    .on("mousemove", positionTooltip)
    .on("mouseleave", function () {
      nodeSel.classed("lit", false);
      clearHighlight();
    });

  // Pixels of travel per millisecond, shared by every pulse on every
  // link. Duration is derived per-link from its own path length, so a
  // long link's pulse and a short link's pulse cross their line at the
  // same visible speed instead of the same fixed time (which made
  // pulses on short links crawl and pulses on long links dart).
  var PULSE_VELOCITY = 0.16;

  // Travels along pathNode (one of the offset lane guides above).
  // reverse: true walks the guide target→source instead of
  // source→target, since the response lane guide still runs the
  // same source→target direction geometrically. staggerDelay spaces
  // multiple pulses out on the same lane so they read as a stream.
  function startPulse(pathNode, color, radius, reverse, staggerDelay) {
    var length = pathNode.getTotalLength();
    var baseDuration = length / PULSE_VELOCITY;
    var duration = baseDuration * (0.9 + Math.random() * 0.2);
    var maxOpacity = reverse ? 0.6 : 1;
    var dot = gPulses.append("circle")
      .attr("class", "arch-pulse")
      .attr("r", radius)
      .attr("fill", color)
      .attr("opacity", 0);

    function cycle() {
      dot.attr("opacity", 0)
        .transition().duration(150).attr("opacity", maxOpacity)
        .transition().duration(duration).ease(d3.easeLinear)
        .attrTween("transform", function () {
          return function (t) {
            var tt = reverse ? 1 - t : t;
            var p = pathNode.getPointAtLength(tt * length);
            return "translate(" + p.x + "," + p.y + ")";
          };
        })
        .transition().duration(150).attr("opacity", 0)
        .on("end", cycle);
    }
    setTimeout(cycle, (staggerDelay || 0) + Math.random() * 200);
  }

  function breatheGlow() {
    coreGlow
      .transition().duration(1900).ease(d3.easeSinInOut).attr("opacity", 0.85)
      .transition().duration(1900).ease(d3.easeSinInOut).attr("opacity", 0.25)
      .on("end", breatheGlow);
  }

  var played = false;
  function playIn() {
    if (played) { return; }
    played = true;

    var order = { client: 0, gateway: 1, core: 2, service: 3, llm: 4, data: 4 };

    nodeSel.transition()
      .delay(function (n) { return order[n.type] * 150; })
      .duration(520)
      .ease(d3.easeCubicOut)
      .attr("opacity", 1)
      .attr("transform", function (n) { return "translate(" + n.x + "," + n.y + ") scale(1)"; });

    linkSel.each(function (l) {
      var len = this.getTotalLength();
      d3.select(this).transition()
        .delay(order[byId[l.t].type] * 150 + 140)
        .duration(560)
        .ease(d3.easeCubicInOut)
        .attr("opacity", 1)
        .attr("stroke-dashoffset", 0);
    });

    setTimeout(function () {
      coreGlow.transition().duration(700).attr("opacity", 0.5).on("end", breatheGlow);
    }, order.core * 150 + 500);

    setTimeout(function () {
      links.forEach(function (l, i) {
        var trunk = !!l.animated;
        var color = trunk ? "#f2d9a8" : linkColor(l);
        var radius = trunk ? 4.6 : 3;
        // Every link is a request/response pair, not a one-way call.
        // Request pulses run full-brightness along the +LANE guide
        // (source→target); response pulses run dimmer, smaller, along
        // the separate -LANE guide (target→source) - two lanes side by
        // side on the line instead of one dot chasing another. Several
        // pulses per direction, staggered, so each reads as a stream -
        // stagger spacing scales with this link's own travel time (its
        // length ÷ PULSE_VELOCITY) so the gaps between pulses look even
        // whether the link is short or long.
        var fwdCount = trunk ? 3 : 2;
        var revCount = trunk ? 2 : 1;
        var travelTime = guideFwd[i].getTotalLength() / PULSE_VELOCITY;
        for (var f = 0; f < fwdCount; f++) {
          startPulse(guideFwd[i], color, radius, false, f * (travelTime / fwdCount));
        }
        for (var r = 0; r < revCount; r++) {
          startPulse(guideRev[i], color, radius * 0.7, true, r * (travelTime / revCount) + 300);
        }
      });
    }, 1100);

    setTimeout(function () {
      container.classList.add("ready");
    }, order.data * 150 + 520 + 50);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { playIn(); io.disconnect(); }
      });
    }, { threshold: 0.2 });
    io.observe(container);
  } else {
    playIn();
  }

  // On phones the diagram scrolls sideways (see the mobile rule in
  // architecture-diagram.css). Open on the horizontal center rather
  // than the left edge.
  if (window.innerWidth <= 768) {
    requestAnimationFrame(function () {
      container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
    });
  }
})();
