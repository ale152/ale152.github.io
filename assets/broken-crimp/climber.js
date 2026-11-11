(function () {
  "use strict";

  var CASING = "rgba(33, 38, 46, 0.902)";
  var BODY = "#D8DCE3";
  var HAIR = "#21262E";
  var LH = "#E4572E", RH = "#2E86AB", LF = "#F3A712", RF = "#3BAA57";
  var CASING_RATIO = 1.7;

  function bezier(x1, y1, x2, y2) {
    function a(p1, p2) { return 1 - 3 * p2 + 3 * p1; }
    function b(p1, p2) { return 3 * p2 - 6 * p1; }
    function c(p1) { return 3 * p1; }
    function at(t, p1, p2) { return ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t; }
    function slope(t, p1, p2) { return 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1); }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x;
      for (var i = 0; i < 8; i++) {
        var s = slope(t, x1, x2);
        if (Math.abs(s) < 1e-6) break;
        t -= (at(t, x1, x2) - x) / s;
      }
      return at(Math.min(1, Math.max(0, t)), y1, y2);
    };
  }
  var ease = bezier(0.4, 0, 0.2, 1);

  var POINTS = ["head", "neck", "pelvis", "shoulderL", "shoulderR", "elbowL", "elbowR",
    "handL", "handR", "hipL", "hipR", "kneeL", "kneeR", "footL", "footR"];

  function lerpPose(a, b, t) {
    var out = {};
    POINTS.forEach(function (k) {
      out[k] = [a[k][0] + (b[k][0] - a[k][0]) * t, a[k][1] + (b[k][1] - a[k][1]) * t];
    });
    out.headR = a.headR + (b.headR - a.headR) * t;

    out.facingViewer = t < 0.5 ? a.facingViewer : b.facingViewer;
    out.legAnchors = t < 0.5 ? a.legAnchors : b.legAnchors;
    out.grips = b.grips;
    return out;
  }

  function centreOf(pose) {
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    POINTS.forEach(function (k) {
      var p = pose[k];
      minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
      minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]);
    });
    return [(minX + maxX) / 2, (minY + maxY) / 2];
  }

  function viewScale(wall, w, h, bodyHeight) {
    var scale = Math.max(w / (wall.r - wall.l), h / (wall.b - wall.t),
      Math.min(w, h) / (MAX_VIEW_BODY_HEIGHTS * bodyHeight));
    return Math.min(scale, Math.min(w, h) / (MIN_VIEW_BODY_HEIGHTS * bodyHeight));
  }

  function camera(wall, pose, w, h, scale, at, overhang, above) {
    var c = centreOf(pose);
    function clamp(v, lo, hi) { return lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v)); }
    var hw = w / 2 / scale, hh = h / 2 / scale;
    return {
      cx: clamp(c[0] + (w / 2 - at[0]) / scale, wall.l + hw - overhang * w / scale, wall.r - hw),
      cy: clamp(c[1] + (h / 2 - at[1]) / scale, wall.t + hh - above / scale, wall.b - hh),
    };
  }

  function drawFigure(ctx, pose, toScreen, scale, bodyHeight) {
    function s(k) { return toScreen(pose[k]); }
    var core = Math.max(0.032 * bodyHeight * scale, 2.5);
    var casing = core * CASING_RATIO;
    var lines = {
      legL: ["hipL", "kneeL", "footL"], legR: ["hipR", "kneeR", "footR"],
      hips: ["hipL", "hipR"], torso: ["pelvis", "neck"],
      shoulders: ["shoulderL", "shoulderR"],
      armL: ["shoulderL", "elbowL", "handL"], armR: ["shoulderR", "elbowR", "handR"],
    };
    function poly(names, color, width) {
      ctx.strokeStyle = color; ctx.lineWidth = width;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath();
      names.forEach(function (n, i) {
        var p = s(n);
        if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
      });
      ctx.stroke();
    }

    ["legL", "legR", "hips", "torso", "shoulders", "armL", "armR"].forEach(function (k) {
      poly(lines[k], CASING, casing);
    });
    poly(lines.legL, LF, core);
    poly(lines.legR, RF, core);
    poly(lines.hips, BODY, core);
    poly(lines.torso, BODY, core);
    poly(lines.shoulders, BODY, core);
    poly(lines.armL, LH, core);
    poly(lines.armR, RH, core);

    drawHead(ctx, pose, s, pose.headR * scale, (casing - core) / 2);

    function dot(p, color) {
      ctx.fillStyle = CASING;
      ctx.beginPath(); ctx.arc(p[0], p[1], core * 1.15, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(p[0], p[1], core * 0.8, 0, 2 * Math.PI); ctx.fill();
    }
    var g = pose.grips, anchors = pose.legAnchors || ["FOOT", "FOOT"];
    if (g[0]) dot(s("handL"), LH);
    if (g[1]) dot(s("handR"), RH);
    if (g[2]) dot(s(anchors[0] === "KNEE" ? "kneeL" : "footL"), LF);
    if (g[3]) dot(s(anchors[1] === "KNEE" ? "kneeR" : "footR"), RF);
  }

  function drawHead(ctx, pose, s, r, rimW) {
    var c = s("head"), neck = s("neck"), hl = s("handL"), hr = s("handR");
    var facing = pose.facingViewer;
    ctx.fillStyle = facing ? BODY : HAIR;
    ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, 2 * Math.PI); ctx.fill();
    ctx.lineWidth = rimW * 1.7; ctx.strokeStyle = CASING; ctx.stroke();
    ctx.lineWidth = rimW; ctx.strokeStyle = BODY; ctx.stroke();
    if (!facing) return;
    var ux = c[0] - neck[0], uy = c[1] - neck[1];
    var ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;
    var sx = -uy, sy = ux;
    var gx = (hl[0] + hr[0]) / 2 - c[0], gy = (hl[1] + hr[1]) / 2 - c[1];
    var gl = Math.hypot(gx, gy);
    var lx = gl < 1e-3 ? 0 : gx / gl * r * 0.10, ly = gl < 1e-3 ? 0 : gy / gl * r * 0.10;
    var eyeR = Math.max(r * 0.19, 1.2);
    ctx.fillStyle = HAIR;
    [-1, 1].forEach(function (d) {
      ctx.beginPath();
      ctx.arc(c[0] + ux * r * 0.12 + sx * d * r * 0.30 + lx,
              c[1] + uy * r * 0.12 + sy * d * r * 0.30 + ly, eyeR, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  var MOVE_MS = 850;
  var START_MS = 700;
  var TOP_MS = 1600;
  var FADE_MS = 350;

  var MIN_VIEW_BODY_HEIGHTS = 1.2;
  var MAX_VIEW_BODY_HEIGHTS = 1.2;
  var BACKGROUND = "#191817";

  function mount(canvas) {
    var ctx = canvas.getContext("2d");
    var url = canvas.getAttribute("data-climber");
    var base = url.replace(/[^/]*$/, "");
    var data = null, photo = null, wall = null;
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var visible = true, running = false, t0 = null;

    function frame(now) {
      running = false;
      if (!data || !photo) return;
      if (t0 === null) t0 = now;
      var ticks = data.ticks, n = ticks.length;
      var climb = (n - 1) * MOVE_MS;
      var cycle = FADE_MS + START_MS + climb + TOP_MS + FADE_MS;
      var e = still ? FADE_MS + START_MS + climb : (now - t0) % cycle;
      var f = Math.min(n - 1, Math.max(0, (e - FADE_MS - START_MS) / MOVE_MS));
      var i = n < 2 ? 0 : Math.min(n - 2, Math.floor(f));
      var pose = lerpPose(ticks[i].pose, ticks[Math.min(n - 1, i + 1)].pose, n < 2 ? 0 : ease(f - i));
      var shown = Math.min(1, e / FADE_MS, (cycle - e) / FADE_MS);
      if (still) shown = 1;

      var dpr = window.devicePixelRatio || 1;
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = BACKGROUND; ctx.fillRect(0, 0, w, h);
      var scale = viewScale(wall, w, h, data.bodyHeight);
      var cam = camera(wall, pose, w, h, scale, [w / 2, h / 2], 0, 0);
      function toScreen(p) { return [(p[0] - cam.cx) * scale + w / 2, (p[1] - cam.cy) * scale + h / 2]; }
      drawPhoto(ctx, data.photo, photo, toScreen, scale);
      drawFigure(ctx, pose, toScreen, scale, data.bodyHeight);
      if (shown < 1) {
        ctx.globalAlpha = 1 - shown; ctx.fillStyle = BACKGROUND; ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
      }
      if (!still) request();
    }

    function drawPhoto(ctx, spec, img, toScreen, scale) {

      var c = toScreen([spec.centerX, spec.centerY]);
      var ww = spec.worldWidth * scale, wh = spec.worldHeight * scale;
      ctx.save();
      ctx.globalAlpha = spec.alpha;
      ctx.translate(c[0], c[1]);
      ctx.rotate(spec.rotation * Math.PI / 180);
      ctx.drawImage(img, -ww / 2, -wh / 2, ww, wh);
      ctx.restore();
    }

    function request() {
      if (!running && visible) { running = true; requestAnimationFrame(frame); }
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[entries.length - 1].isIntersecting;
        request();
      }).observe(canvas);
    }

    fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      if (!d.ticks || !d.ticks.length || !d.photo) return;
      data = d;
      var p = d.photo;
      var rad = p.rotation * Math.PI / 180;
      var ex = (Math.abs(Math.cos(rad)) * p.worldWidth + Math.abs(Math.sin(rad)) * p.worldHeight) / 2;
      var ey = (Math.abs(Math.sin(rad)) * p.worldWidth + Math.abs(Math.cos(rad)) * p.worldHeight) / 2;
      wall = { l: p.centerX - ex, r: p.centerX + ex, t: p.centerY - ey, b: p.centerY + ey };
      var img = new Image();
      img.onload = function () { photo = img; request(); };
      img.src = base + p.file;
    }).catch(function () {   });

    window.addEventListener("resize", request);
  }

  document.querySelectorAll("canvas[data-climber]").forEach(mount);
})();
