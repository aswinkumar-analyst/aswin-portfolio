// Boot screen. A classic script so it runs before the bundle and covers the wait
// for it, and separate from the HTML because the CSP blocks inline scripts.
//
// It holds until four real steps are done: page (window load), then app, type
// and sky (marked by useHeroReveal). window.__boot.ready then resolves, and
// useHeroReveal calls leave() and finish() from its timeline.
(function () {
  var el = document.getElementById("loader");
  var root = document.getElementById("root");
  var STEPS = ["page", "app", "type", "sky"];
  var MIN_MS = 1500; // long enough for the hands to finish assembling
  var MIN_REPEAT_MS = 300; // reloads in the same tab
  var GIVE_UP_MS = 10000; // slow sky or fonts: open the site anyway
  var FAILED_MS = 20000; // bundle never ran: offer a reload

  // Two hands drawn in character cells, reaching for each other. They assemble
  // out of flickering glyphs, drift apart and back while the site loads, and on
  // leave() the fingertips meet and a burst of light runs out from the touch.
  // useHeroReveal then opens a hole from the screen centre (the touch point)
  // onto the sky. Stringified into a worker, so it must not touch anything
  // outside itself.
  function hands(canvas) {
    var ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return null;

    // Sampled from the reference video by scripts/extract-loader-hands.py.
    // x glyph, o white square, b blue square. Columns left of SPLIT are the
    // left hand.
    var HANDS = [
      "............................................................................................ooxx",
      "........................................................................................oxoox.xx",
      ".....................................................................................oxoxooxxxxx",
      ".................................................................................ooxxxxooxxxxxxx",
      "...............................................................................oxoxxxxxxxxxxxxxx",
      "...........................................................................oxxxxxxxx.xxxx.xxxxxx",
      "...........o.xxxxbb.o...................................................oxxxxx.xooxx.bxbxxxxxxxx",
      ".........oxxx.xxxxxxxxx.xxoooxxxo.....................................xxxoxxxxxxox.xx..xxxxxxxxx",
      ".......oxxoooxxxxxxxxxx.xxxbbxxxxx..................................xxoxxoxxxxxxxbbxxbb..bxxxxxx",
      "......oxxxooxxxxxxxxx.xxxxxxxxxxx.o..............................xoxooxxxxxxxxx...xxb.xxx.xxxxxx",
      "....oxxxxoooxxxxxxxxxxxxxxxxxxxxxxx...o....................xxxoxx.xxxxxxxxxxxxx.....xxxb........",
      ".oxxoxxxxxxxxxxxxoxxxxxxxxxxxoxoxxxxx....o.............oxxxxxxxxoxxxxbxoxxxxxx.....xb..xxbxxxxxx",
      "xoo.xxxxx.....xxxxo.oxxxxxxxxxxxxoxxxxxxx.o..........xxxxxxxxxx.xxx..xxxxxoxxx......bb....b....b",
      "oooxx.b....x...xxxooooxxxx.bx.xxxxxxxxxxxx.x.......xxxxx..xxx.xxxxxb.xxxxxxxx...................",
      "o.xxxxxb.bb.....xxxooooxxxb.xx.......xxx.xx......oxxxx....ox...xx.xxoxxx.xxxx..b......x.........",
      "xxxxxxx.xb.b....xxxxooooxxx..............xxxb.........x........o...xxxxb.xxx...................o",
      "xxxxxx.b.......xoxxxxxooooxx..o...........xxx....................xxoxxxb...b.b..................",
      ".xxx.x...........xxxxxx.oxxxx.............oxx.o................o.xxxxb.x.........x..............",
      "xx.xx..b....o.....oxxbxxxxxxxx.....o.......oxx.x..............xxoxbxbxxxxxx.....x...............",
      "xxxb.......o........o...xxxxxxxb..........o.obxo............o.oxxxx.x.xxxxxxx..o................",
      "xxb..b....b...............oxxxxxx....o......................xxoxxx.x...bxxx.....................",
      "xb...........................oxxxxx..........................x.x..xxx.ox...oo...................",
      ".b.......x....................oxx.x.o.........................xx...b.ooxx.......................",
      "b.......o......................x..x......bbx..................xxx.xx..xb.o......................",
      ".......b........................b..xx..oxoxx..................xxb.x.x.xx.o......................",
      "...............................o..............................x..xxbo.xx.o......................",
      ".....o........................................................ox.xx...oxxo......................",
      "....o..........................................................x..x....ox.......................",
      "...............................................................x..x.............................",
      ".o.............................................................x.oo.............................",
    ];
    var SPLIT = 48;
    var COLS = 96;
    var GLYPHS = "X10>";

    var BG = "#05080f";
    var INK = "#f4f2ec";
    var BLUE = "#3b6ff5";
    var GOLD = "#ffd65a";

    var INTRO = 1.3; // s, the hands assemble
    var SPARK = 0.3; // s each cell flickers before it holds
    var BREATHE = 3.6; // s, one drift apart and back while waiting
    var DRIFT = 3; // cells
    var REACH = 0.55; // s after leave(), fingertips close the gap
    var BURST = 0.9; // s, rays run out from the touch
    var GLOW = 16; // cells, how far the light runs up the arms
    var FADE_FROM = 0.85; // s after leave()
    var FADE_TO = 1.7;

    function rnd(n) {
      n = Math.sin(n * 12.9898) * 43758.5453;
      return n - Math.floor(n);
    }
    function ease(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function easeOut(t) {
      return 1 - Math.pow(1 - t, 4);
    }
    function surface(w, h) {
      return typeof OffscreenCanvas !== "undefined"
        ? new OffscreenCanvas(w, h)
        : Object.assign(document.createElement("canvas"), { width: w, height: h });
    }

    // Cells, and each fingertip as the mean of its hand's innermost column.
    var cells = [];
    var tipL = { x: -1, y: 0, n: 0 };
    var tipR = { x: COLS, y: 0, n: 0 };
    HANDS.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) {
        if (row[x] === ".") continue;
        var left = x < SPLIT;
        var i = cells.length;
        // Outer cells light first, so the hands build toward the fingertips.
        var reach = 1 - Math.abs(x + 0.5 - SPLIT) / SPLIT;
        cells.push({
          x: x,
          y: y,
          kind: row[x],
          left: left,
          delay: (0.55 * rnd(i + 1) + 0.45 * reach) * (INTRO - SPARK),
          lum: 0.55 + 0.45 * rnd(i + 7),
          glyph: Math.floor(rnd(i + 3) * 4),
          scramble: rnd(i + 5) < 0.35 ? 1 + rnd(i + 9) * 3 : 0, // changes per s
          seed: i * 31,
        });
        var tip = left ? tipL : tipR;
        if (left ? x > tip.x : x < tip.x) {
          tip.x = x;
          tip.y = y;
          tip.n = 1;
        } else if (x === tip.x) {
          tip.y = (tip.y * tip.n + y) / ++tip.n;
        }
      }
    });
    // Whole-cell offsets that bring the tips side by side, and the point where
    // they meet. That point is drawn at the centre of the screen.
    var mid = { x: (tipL.x + tipR.x) / 2, y: (tipL.y + tipR.y) / 2 };
    var touchL = { x: Math.round(mid.x - 0.5 - tipL.x), y: Math.round(mid.y - tipL.y) };
    var touchR = { x: Math.round(mid.x + 0.5 - tipR.x), y: Math.round(mid.y - tipR.y) };
    var C = {
      x: (tipL.x + touchL.x + tipR.x + touchR.x) / 2 + 0.5,
      y: (tipL.y + touchL.y + tipR.y + touchR.y) / 2 + 0.5,
    };

    var RAYS = [];
    for (var r = 0; r < 9; r++) {
      var a = (r / 9) * Math.PI * 2 - Math.PI / 2 + (rnd(r + 11) - 0.5) * 0.35;
      RAYS.push([Math.cos(a), Math.sin(a), 0.75 + rnd(r + 13) * 0.35]);
    }

    var cw = 0;
    var ch = 0;
    var u = 0; // device pixels per cell
    var inset = 0;
    var x0 = 0;
    var y0 = 0;
    var atlas;
    var grid;
    var start = 0;
    var leftAt = 0;
    var drift = 0;
    var from = null;

    function square(color, gx, gy, alpha) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillRect(x0 + gx * u + inset, y0 + gy * u + inset, u - 2 * inset, u - 2 * inset);
    }

    function frame(now) {
      if (!u) return requestAnimationFrame(frame);
      start = start || now;
      var t = (now - start) / 1000;
      var l = leftAt ? (now - leftAt) / 1000 : -1;
      if (l > FADE_TO) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, cw, ch);
        return; // nothing left to draw: let the worker idle until finish()
      }
      var tick = Math.floor(now / 50); // flicker steps at 20 Hz
      var fade = l < FADE_FROM ? 1 : 1 - (l - FADE_FROM) / (FADE_TO - FADE_FROM);
      var burst = l < REACH ? -1 : (l - REACH) / BURST;
      var flash = burst < 0 ? 0 : Math.max(0, 1 - burst * 2.5);

      if (l < 0) drift = DRIFT * (1 - Math.cos((2 * Math.PI * Math.max(0, t - INTRO)) / BREATHE)) / 2;
      else if (from === null) from = drift;
      var p = l < 0 ? 0 : ease(Math.min(l / REACH, 1));
      // Moves snap to whole cells, the way the grid in the video does.
      var Lx = Math.round(-drift * (1 - p) + touchL.x * p);
      var Ly = Math.round(touchL.y * p);
      var Rx = Math.round(drift * (1 - p) + touchR.x * p);
      var Ry = Math.round(touchR.y * p);

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, cw, ch);
      ctx.globalAlpha = (0.6 + flash * 2) * fade;
      ctx.fillStyle = grid;
      ctx.translate(x0 % u, y0 % u); // line the pattern up with the cells
      ctx.fillRect(-u, -u, cw + 2 * u, ch + 2 * u);
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      var glowR = burst < 0 ? 0 : easeOut(Math.min(burst, 1)) * GLOW;
      for (var i = 0; i < cells.length; i++) {
        var c = cells[i];
        var age = t - c.delay;
        if (l >= 0) age = Math.max(age, SPARK + l * 4); // a fast reload: fill in now
        if (age < 0 || (age < SPARK && rnd(c.seed + tick) < 0.5)) continue;
        var gx = c.x + (c.left ? Lx : Rx);
        var gy = c.y + (c.left ? Ly : Ry);
        if (glowR) {
          var d = Math.hypot(gx + 0.5 - C.x, gy + 0.5 - C.y);
          if (d < glowR) {
            square(d < glowR * 0.45 ? INK : GOLD, gx, gy, fade);
            continue;
          }
        }
        if (c.kind === "x") {
          var g = (c.glyph + Math.floor(t * c.scramble)) % 4;
          ctx.globalAlpha = c.lum * fade;
          ctx.drawImage(atlas, g * u, 0, u, u, x0 + gx * u, y0 + gy * u, u, u);
        } else {
          var twinkle = c.kind === "b" ? 0.75 + 0.25 * Math.sin(t * 3 + c.seed) : 1;
          square(c.kind === "b" ? BLUE : INK, gx, gy, c.lum * twinkle * fade);
        }
      }

      if (burst >= 0) {
        ctx.globalCompositeOperation = "lighter";
        // Core: a disc of lit cells around the touch.
        var core = glowR * 0.5;
        var cx = Math.floor(C.x);
        var cy = Math.floor(C.y);
        for (var oy = -Math.ceil(core); oy <= core; oy++) {
          for (var ox = -Math.ceil(core); ox <= core; ox++) {
            var k = Math.hypot(cx + ox + 0.5 - C.x, cy + oy + 0.5 - C.y) / core;
            if (k < 1) square(INK, cx + ox, cy + oy, (1 - k) * fade);
          }
        }
        // Rays: lines of cells, white at the root, blue along, gold at the tip.
        var reach = (Math.hypot(cw, ch) / 2 / u) * easeOut(Math.min(burst, 1));
        for (var j = 0; j < RAYS.length; j++) {
          var ray = RAYS[j];
          var len = reach * ray[2];
          for (var s = 1.5; s < len; s += 1) {
            var q = s / len;
            var rx = Math.floor(C.x + ray[0] * s);
            var ry = Math.floor(C.y + ray[1] * s);
            var alpha = (1 - q * 0.6) * fade;
            square(q > 0.78 ? GOLD : s < 4 ? INK : BLUE, rx, ry, alpha);
            if (q < 0.5) {
              // Thicker near the root.
              square(BLUE, rx + Math.round(-ray[1]), ry + Math.round(ray[0]), alpha * 0.35);
              square(BLUE, rx - Math.round(-ray[1]), ry - Math.round(ray[0]), alpha * 0.35);
            }
          }
        }
        ctx.globalCompositeOperation = "source-over";
        if (flash) {
          ctx.globalAlpha = flash * 0.14 * fade;
          ctx.fillStyle = INK;
          ctx.fillRect(0, 0, cw, ch);
        }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    return {
      resize: function (d) {
        cw = canvas.width = Math.round(d.w * d.dpr);
        ch = canvas.height = Math.round(d.h * d.dpr);
        // Full-bleed: the arms run off both edges. Never below 9 CSS px, so on a
        // phone the hands stay legible and the arms crop instead.
        u = Math.round(Math.max(d.w / COLS, 9) * d.dpr);
        inset = Math.max(1, Math.round(u * 0.12));
        x0 = Math.round(cw / 2 - C.x * u);
        y0 = Math.round(ch / 2 - C.y * u);

        atlas = surface(u * 4, u);
        var a = atlas.getContext("2d");
        a.fillStyle = INK;
        a.font = "700 " + Math.round(u * 0.92) + "px ui-monospace, Menlo, Consolas, monospace";
        a.textAlign = "center";
        a.textBaseline = "middle";
        for (var g = 0; g < 4; g++) a.fillText(GLYPHS[g], g * u + u / 2, u / 2 + u * 0.04);

        // The faint screen of empty cells behind everything.
        var tile = surface(u, u);
        var tc = tile.getContext("2d");
        tc.fillStyle = "rgba(244, 242, 236, 0.05)";
        tc.fillRect(inset, inset, u - 2 * inset, u - 2 * inset);
        grid = ctx.createPattern(tile, "repeat");
      },
      leave: function () {
        leftAt = performance.now();
      },
    };
  }

  var marks = {};
  var open;
  var finished = false;
  var send = function () {};
  var worker;

  var boot = (window.__boot = {
    ready: new Promise(function (resolve) {
      open = resolve;
    }),
    mark: function (name) {
      marks[name] = true;
      check();
    },
    leave: function () {
      send("leave");
    },
    finish: function () {
      if (finished) return;
      finished = true;
      removeEventListener("resize", resize);
      if (worker) worker.terminate();
      root.inert = false;
      el.remove();
    },
  });

  if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (el) el.remove();
    open();
    return;
  }

  var started = performance.now();
  var minMs = MIN_MS;
  try {
    if (sessionStorage.getItem("booted")) minMs = MIN_REPEAT_MS;
    sessionStorage.setItem("booted", "1");
  } catch {
    // Storage can be blocked. The only cost is the longer minimum.
  }

  function check() {
    if (!STEPS.every(function (s) { return marks[s]; })) return;
    setTimeout(open, Math.max(0, minMs - (performance.now() - started)));
  }

  root.inert = true;

  var canvas = el.querySelector("canvas");
  if (canvas.transferControlToOffscreen && window.Worker) {
    // In a worker the hands keep moving while the main thread parses the bundle.
    var source =
      "var hands=" + hands + ",api;onmessage=function(e){var d=e.data;" +
      "if(d.canvas)api=hands(d.canvas);else if(api)api[d.type](d)}";
    worker = new Worker(URL.createObjectURL(new Blob([source], { type: "text/javascript" })));
    var offscreen = canvas.transferControlToOffscreen();
    worker.postMessage({ canvas: offscreen }, [offscreen]);
    send = function (type, data) {
      worker.postMessage(Object.assign({ type: type }, data));
    };
  } else {
    var api = hands(canvas);
    if (api) send = function (type, data) {
      api[type](data);
    };
  }

  function resize() {
    send("resize", { w: innerWidth, h: innerHeight, dpr: Math.min(devicePixelRatio || 1, 2) });
  }
  addEventListener("resize", resize);
  resize();

  addEventListener("load", function () {
    boot.mark("page");
  });
  setTimeout(function () {
    if (marks.app) STEPS.forEach(boot.mark);
  }, GIVE_UP_MS);
  setTimeout(function () {
    if (!marks.app) el.querySelector("a").hidden = false;
  }, FAILED_MS);
})();
