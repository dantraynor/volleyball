// court.js — SVG court renderer and animation engine (jQuery)
// viewBox: 0 0 1000 500
// Net: vertical line at x=500. Our team: left half (x=0..500). Opponent: right half (x=500..1000).

$(function () {
  const $svg = $("svg.court-svg");
  if (!$svg.length) return;

  const diagram = $svg.data("diagram");
  if (!diagram || !diagram.players) return;

  renderCourtBackground($svg);

  const $defs = $(svgEl("defs"));
  $defs.append(makeArrowMarker("arrowhead", "#2244CC"));
  $defs.append(makeArrowMarker("arrowhead-alt", "#9933CC"));
  $svg.prepend($defs);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  $.each(diagram.players, function (_, p) {
    $svg.append(makePlayer(p));
  });

  if (diagram.opponent) {
    const conf = diagram.opponent;
    const pos = Array.isArray(conf) ? conf : conf.from;
    const $opp = makeOpponent(pos);
    $svg.append($opp);
    if (!Array.isArray(conf) && diagram.mode === "animated") {
      if (reduced)
        $opp.attr("transform", `translate(${conf.to[0]},${conf.to[1]})`);
      else animatePlayer($opp, conf);
    }
  }

  if (diagram.ball) {
    const conf = diagram.ball;
    const pos = Array.isArray(conf) ? conf : conf.from;
    const $ball = makeBall(pos);
    $svg.append($ball);
    if (!Array.isArray(conf) && diagram.mode === "animated") {
      if (reduced)
        $ball.attr("transform", `translate(${conf.to[0]},${conf.to[1]})`);
      else animatePlayer($ball, conf);
    }
  }

  if (diagram.zones) {
    $.each(diagram.zones, function (_, zone) {
      const pos = [zone[0], zone[1]];
      const playerPos = [zone[0] + 60, zone[1]]; // offset so ball doesn't cover player
      const lessonId = zone[2];
      // P player rendered first so ball sits in front of it
      const $opp = makeOpponent(playerPos);
      const $ball = makeBall(pos);
      if (lessonId) {
        const handler = function () {
          window.location.href = "/learn/" + lessonId;
        };
        $opp.addClass("zone-link").on("click", handler);
        $ball.addClass("zone-link").on("click", handler);
      }
      $svg.append($opp).append($ball);
    });
  }

  if (diagram.mode === "arrows") {
    $.each(diagram.players, function (_, p) {
      if (p.from && p.to && !p.hideArrow)
        $svg.append(makeArrow(p, "arrowhead"));
    });
  }

  if (diagram.balls) {
    const mainPos = diagram.balls[0];

    $.each(diagram.balls, function (i, pos) {
      if (i === 0) return;
      $svg.append(makeBall(pos));
      $svg.append(
        $(svgEl("line")).attr({
          x1: mainPos[0],
          y1: mainPos[1],
          x2: pos[0],
          y2: pos[1],
          stroke: "#9933CC",
          "stroke-width": 2.5,
          "marker-end": "url(#arrowhead-alt)",
        }),
      );
    });

    const $mainBall = makeBall(diagram.ballFrom || mainPos);
    $svg.append($mainBall);
    if (diagram.ballFrom && diagram.mode === "animated") {
      if (reduced) {
        $mainBall.attr("transform", `translate(${mainPos[0]},${mainPos[1]})`);
      } else {
        animatePlayer($mainBall, {
          from: diagram.ballFrom,
          to: mainPos,
          duration: diagram.ballDuration || 700,
          path: diagram.ballPath || "straight",
          control: diagram.ballControl,
          delay: diagram.ballDelay || 0,
        });
      }
    }
  }

  if (diagram.mode === "animated") {
    $.each(diagram.players, function (_, p) {
      if (!p.from || !p.to) return;
      const $g = $svg.find('[data-player="' + p.id + '"]');
      if (reduced) {
        $g.attr("transform", "translate(" + p.to[0] + "," + p.to[1] + ")");
      } else {
        animatePlayer($g, p);
      }
    });
  }
});

// ── SVG helpers ────────────────────────────────────────────────────────────

function svgEl(tag) {
  return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

const RADIUS = 46;
const BALL_R = 32;

function renderCourtBackground($svg) {
  $(svgEl("rect"))
    .attr({ x: 0, y: 0, width: 1000, height: 500, fill: "#44BBAA" })
    .appendTo($svg);
  $(svgEl("rect"))
    .attr({
      x: 16,
      y: 16,
      width: 968,
      height: 468,
      fill: "none",
      stroke: "white",
      "stroke-width": 4,
    })
    .appendTo($svg);
  $(svgEl("rect"))
    .attr({ x: 20, y: 20, width: 960, height: 460, fill: "#E87070" })
    .appendTo($svg);
  // Attack lines — 1/3 of each half from the net
  $(svgEl("line"))
    .attr({
      x1: 340,
      y1: 20,
      x2: 340,
      y2: 480,
      stroke: "white",
      "stroke-width": 2,
    })
    .appendTo($svg);
  $(svgEl("line"))
    .attr({
      x1: 660,
      y1: 20,
      x2: 660,
      y2: 480,
      stroke: "white",
      "stroke-width": 2,
    })
    .appendTo($svg);
  // Net
  $(svgEl("line"))
    .attr({
      x1: 500,
      y1: 16,
      x2: 500,
      y2: 484,
      stroke: "#111",
      "stroke-width": 6,
    })
    .appendTo($svg);
}

function makePlayer(p) {
  const pos = p.at || p.from;
  const $g = $(svgEl("g"))
    .addClass("player " + (p.role || ""))
    .attr({
      "data-player": p.id,
      transform: "translate(" + pos[0] + "," + pos[1] + ")",
    });
  $(svgEl("circle")).attr({ cx: 0, cy: 0, r: RADIUS }).appendTo($g);
  $(svgEl("text"))
    .attr({ x: 0, y: 0 })
    .text(p.label || p.id)
    .appendTo($g);
  return $g;
}

function makeOpponent(pos) {
  const $g = $(svgEl("g"))
    .addClass("player opponent")
    .attr({ transform: "translate(" + pos[0] + "," + pos[1] + ")" });
  $(svgEl("circle")).attr({ cx: 0, cy: 0, r: RADIUS }).appendTo($g);
  $(svgEl("text")).attr({ x: 0, y: 0 }).text("P").appendTo($g);
  return $g;
}

function makeBall(pos) {
  const r = BALL_R;
  const $g = $(svgEl("g")).attr({
    transform: "translate(" + pos[0] + "," + pos[1] + ")",
  });
  $(svgEl("image"))
    .attr({
      href: "/static/images/volleyball.png",
      x: -r,
      y: -r,
      width: r * 2,
      height: r * 2,
    })
    .appendTo($g);
  return $g;
}

function makeArrowMarker(id, color) {
  const $m = $(svgEl("marker")).attr({
    id,
    markerWidth: 8,
    markerHeight: 6,
    refX: 7,
    refY: 3,
    orient: "auto",
  });
  $(svgEl("polygon"))
    .attr({ points: "0 0, 8 3, 0 6", fill: color })
    .appendTo($m);
  return $m;
}

function makeArrow(p, markerId) {
  const d =
    p.path === "curve" && p.control
      ? `M${p.from[0]},${p.from[1]} Q${p.control[0]},${p.control[1]} ${p.to[0]},${p.to[1]}`
      : `M${p.from[0]},${p.from[1]} L${p.to[0]},${p.to[1]}`;
  return $(svgEl("path")).attr({
    d,
    class: "move-arrow",
    "marker-end": "url(#" + markerId + ")",
  });
}

// ── Animation ──────────────────────────────────────────────────────────────

function bezier(t, from, ctrl, to) {
  const u = 1 - t;
  return [
    u * u * from[0] + 2 * u * t * ctrl[0] + t * t * to[0],
    u * u * from[1] + 2 * u * t * ctrl[1] + t * t * to[1],
  ];
}

function animatePlayer($g, p) {
  const { from, to, control: ctrl } = p;
  const dur = p.duration || 900;
  const delay = p.delay || 0;
  const proxy = { t: 0 };
  $(proxy)
    .delay(delay)
    .animate(
      { t: 1 },
      {
        duration: dur,
        easing: "swing",
        step(t) {
          const pos =
            p.path === "curve" && ctrl
              ? bezier(t, from, ctrl, to)
              : [
                  from[0] + (to[0] - from[0]) * t,
                  from[1] + (to[1] - from[1]) * t,
                ];
          $g.attr(
            "transform",
            `translate(${pos[0].toFixed(1)},${pos[1].toFixed(1)})`,
          );
        },
        complete() {
          $g.attr("transform", `translate(${to[0]},${to[1]})`);
        },
      },
    );
}
