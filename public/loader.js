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
  var MIN_MS = 1900; // long enough for the hands to finish assembling
  var MIN_REPEAT_MS = 300; // reloads in the same tab
  var GIVE_UP_MS = 10000; // slow sky or fonts: open the site anyway
  var FAILED_MS = 20000; // bundle never ran: offer a reload

  // Two hands drawn as luminance-mapped ASCII on a grid of character cells,
  // reaching for each other. Blue accents light first, then the white
  // highlights, then glyphs from bright to dim, cell by cell in the order of
  // the reference. A dot grid fades up, and the hands drift apart along their
  // arms and back while the site loads. On leave() the fingertips meet and
  // light bursts from the touch: a white star, blue rays rimmed in yellow, and
  // a wash of white cells across the screen. useHeroReveal then opens a hole
  // from the screen centre (the touch point) onto the sky. Stringified into a
  // worker, so it must not touch anything outside itself.
  function hands(canvas) {
    var ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return null;

    // Sampled from a reference video.
    // HANDS: 1 dim, 2 mid and 3 bright glyph, o white block, b blue block.
    // ONSET: when each cell first lights, in tenths of a second, base 36.
    // Columns left of SPLIT are the left hand.
    var HANDS = [
      "............................................................................................oo22",
      "........................................................................................o3oo2.23",
      ".....................................................................................o2o2oo22323",
      ".................................................................................oo3332oo2323332",
      "...............................................................................o2o22232233232333",
      "...........................................................................o32232222.33321222233",
      "...........o.2321bb1o...................................................o22223.2oo311b1b11122332",
      ".........o223.322122222.13ooo222o.....................................323o222222o2.111111.212322",
      ".......o22ooo2322122333.221bb11233..................................22o32o2222232bb31bb1.b212222",
      "......o332oo223232223.333333232221o..............................2o2oo3222232321.111b1122.122221",
      "....o2332ooo2223322233222323222232.111o....................222o32.3232232322231..11112.b11111111",
      ".o32o322222223332o23332222332o2o323111111o.............o22232232o2222b2o22223211..11b1111b111112",
      "2oo.22111111112332o.o233222122222o23133211o..........2322332323.2211122332o23211...1bb1..1b1..1b",
      "ooo231b.11.11..233oooo2222.b.12.333333322..2.......222321111.112223b.2232.2321.11...111.1111.111",
      "o.33111b1bb11..1233oooo333b11111....1222.221.....o23311...o2..111121o222112211.b111...211111..11",
      "222121111b.b....2232oooo2221.11.111...1.1232b.....1.1.3........o...2221b12111111...............o",
      "2322111b1......2o12233oooo21.1o11..11....1132...................112o21.b111b1b1.................",
      ".321111..1...1...223132.o2211...1.........o131o................o.2222b.1.11.1....2..............",
      "32.1111b....o.....o32b22233232..11.o1..1...o2212..............32o3b1b223111.....3...............",
      "32.b1111.1.o........o.1.2222222b..1.......o.ob1o............o1o221.121233.13..1o................",
      "31b11b11..b...............o2233211...o......................23o12113.1.b121.1...................",
      "1b11111......................o22211...1......................2.21.2211o31..oo...................",
      "1b1111...3....................o22131o.........................131.1b.oo31.......................",
      "b1111.1.o......................1.13.1....bb1..................231.21..2b.o......................",
      "1.11...b.......................1b1.31..o1o11..................22b.213.31.o......................",
      "11111.1........................o1.............................11.22bo..21o......................",
      "1...1o........................................................o2.111..o23o......................",
      "..1.o..........................................................21.11...o3.......................",
      ".1.............................................................21..1............................",
      ".o.............................................................2.oo.............................",
    ];
    var ONSET = [
      "............................................................................................66ie",
      "........................................................................................6e66a.ae",
      ".....................................................................................6i6a66aaeae",
      ".................................................................................66ieea66aeaeeea",
      "...............................................................................6e6aaaeaaeeieieee",
      "...........................................................................6eiieaaaa.eeeimiiiiee",
      "...........6.ieam22q6...................................................6iaaae.a66emq2m2mmmiieei",
      ".........6iie.eiimiiiii.me666aii6.....................................eae6aaaiia6a.mmqqmm.imieii",
      ".......6ie666aeiimiieee.iim22mmiee..................................ia6ea6aaaiiei22em22q.2imiiii",
      "......6eea66aaeaeiiie.eeeeeeeeiiiq6..............................a6a66eiaaaeaeiq.qmm2qmii.miiiim",
      "....6ieea666aeaeeaiieeaaaeaeaaaaei.qqq6....................aaa6ea.eaeaieaeaaaem..qqqmi.2qqqqqqqq",
      ".6ea6eiiiiiiieeea6aeeeaaaaeea6a6eaemmqqqq6.............6iiieiiea6aiii2i6aeaaeiqq..qm2qqmm2mmmmmi",
      "a66.aimmmqqqqqieea6.6aeeaiimiiaaa6aemeiimq6..........aeaieeaeie.aamqqiaeei6aeiqq...q22q..q2q..q2",
      "666aem2.qq.mq..iee6666aiii.2.mi.eeeeeeeai..i.......iaieiqqmm.qmaiae2.aaei.aeim.qq...qqq.qqqq.qqq",
      "6.eimmm2q22qq..qiee6666eee2qmmqq....qiii.aiq.....6ieemq...6i..qmmqim6aaiqmiimq.2qqq...iqqqqq..qq",
      "aaimimmqm2.2....iiea6666aeiq.qq.qqq...q.qaei2.....q.q.e........6...aaam2qimmqqqq...............6",
      "aeiimmq2q......i6miiee6666im.q6qq..qq....qmei...................mma6am.2qqq2q2q.................",
      ".eimqmq..q...q...iiimei.6aamm...q.........6meq6................6.iaii2.m.qq.q....a..............",
      "ei.mmqq2....6.....6ii2iiaeeiei..qq.6q..q...6iiqi..............ei6e2m2iaemmm.....e...............",
      "ei.2qqqq.q.6........6.q.iiiaaai2..q.......6.62m6............6m6aim.qiqaee.me..q6................",
      "im2qq2qq..2...............6iieeimq...6......................ae6mamqe.q.2mim.q...................",
      "m2qqqqq......................6iiimm...q......................i.eq.iamq6eq..66...................",
      "q2qqqq...e....................6iiqeq6.........................meq.q2.66em.......................",
      "2qqqq.q.6......................m.qe.q....22m..................iem.im..e2.6......................",
      "q.qq...2.......................q2q.im..6m6mm..................ie2.iqe.em.6......................",
      "qqqqq.q........................6m.............................mq.ii26..iq6......................",
      "q...q6........................................................6i.mmq..6ie6......................",
      "..q.6..........................................................eq.mq...6e.......................",
      ".q.............................................................im..q............................",
      ".6.............................................................a.66.............................",
    ];
    var SPLIT = 48;
    var COLS = 96;
    // Glyphs by tone, brightest first, as in the reference: X 0 1 bright,
    // x 1 > mid, $ > dim. One atlas holds them all.
    var GLYPHS = "X01x>$";
    var TONES = { 3: [0, 1, 2], 2: [2, 3, 4], 1: [5, 4] };
    var TONE_ALPHA = { 3: 0.95, 2: 0.62, 1: 0.36 };

    var BG = "#060609";
    var INK = "#f1f0ea";
    var BLUE = "#2d6cf0";
    var YELLOW = "#e4f05a";

    var BUILD = 0.65; // the reference builds over 2.6s; play it at this speed
    var SPARK = 0.16; // s each cell flickers before it holds
    var BUILT = 2.6 * BUILD + SPARK; // s, the last cell holds
    var BREATHE = 4.2; // s, one drift apart and back while waiting
    var DRIFT = 3; // cells, along the arms
    var REACH = 0.55; // s after leave(), fingertips close the gap
    var BURST = 1.2; // s, the light front reaches the screen corners
    var WASH = [0.8, 1.4]; // s into the burst, white cells cover everything

    function rnd(n) {
      n = Math.sin(n * 12.9898) * 43758.5453;
      return n - Math.floor(n);
    }
    function clamp01(t) {
      return t < 0 ? 0 : t > 1 ? 1 : t;
    }
    function ease(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }
    function surface(w, h) {
      return typeof OffscreenCanvas !== "undefined"
        ? new OffscreenCanvas(w, h)
        : Object.assign(document.createElement("canvas"), { width: w, height: h });
    }
    function at(x, y) {
      var row = HANDS[y];
      return row && x >= 0 && x < COLS ? row[x] : null;
    }

    // Cells, and each fingertip as the mean of its hand's innermost column.
    var cells = [];
    var tipL = { x: -1, y: 0, n: 0 };
    var tipR = { x: COLS, y: 0, n: 0 };
    HANDS.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) {
        var kind = row[x];
        if (kind === ".") continue;
        var left = x < SPLIT;
        var i = cells.length;
        var tone = kind === "o" || kind === "b" ? 0 : +kind;
        cells.push({
          x: x,
          y: y,
          kind: kind,
          tone: tone,
          left: left,
          // Lit cells with an empty neighbour outline the hand. Off the grid
          // counts as filled, so the cropped arms don't get a rim.
          edge: [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)].indexOf(".") >= 0,
          delay: (parseInt(ONSET[y][x], 36) / 10) * BUILD + rnd(i + 1) * 0.05,
          glyph: tone ? Math.floor(rnd(i + 3) * TONES[tone].length) : 0,
          scramble: rnd(i + 5) < 0.3 ? 0.6 + rnd(i + 9) * 2.2 : 0, // changes per s
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
    // Each arm's direction, wrist to tip, so the hands breathe along it.
    var armL = { x: 1, y: -0.32 };
    var armR = { x: -1, y: 0.36 };

    // Rays of the burst: angle, half-width (rad), and a fixed width in cells.
    // Strong vertical and diagonal rays, as in the reference, plus a few thin.
    var RAYS = [-90, -58, -24, 8, 36, 64, 90, 118, 150, 184, 212, 238].map(function (deg, k) {
      return [(deg + (rnd(k + 11) - 0.5) * 10) * (Math.PI / 180), 0.02 + rnd(k + 13) * 0.045, 0.6 + rnd(k + 17) * 0.8];
    });

    var cw = 0;
    var ch = 0;
    var u = 0; // device pixels per cell
    var inset = 0;
    var dot = 0;
    var x0 = 0;
    var y0 = 0;
    var gx0 = 0; // the visible grid, in cells relative to the hands
    var gy0 = 0;
    var gcols = 0;
    var grows = 0;
    var maxR = 0;
    var slots; // during the burst, which hand cell sits at each visible grid cell
    var atlas;
    var vignette;
    var glow;
    var gctx;
    var start = 0;
    var leftAt = 0;
    var drift = 0;
    var done = false; // the last frame has been drawn
    var idle = false; // and the loop has stopped

    function square(color, gx, gy, alpha) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillRect(x0 + gx * u + inset, y0 + gy * u + inset, u - 2 * inset, u - 2 * inset);
    }

    // How strongly a direction lies on a ray, 0..1, at distance r.
    function rayAt(a, r) {
      var best = 0;
      for (var j = 0; j < RAYS.length; j++) {
        var d = Math.abs(((a - RAYS[j][0] + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
        var k = 1 - (d * r) / (RAYS[j][1] * r + RAYS[j][2]);
        if (k > best) best = k;
      }
      return best;
    }

    // The light at one grid cell, or null where it is dark. b is seconds into
    // the burst, front the radius it has reached, hand the cell drawn there.
    function light(gx, gy, b, front, hand) {
      var dx = gx + 0.5 - C.x;
      var dy = gy + 0.5 - C.y;
      var r = Math.sqrt(dx * dx + dy * dy);
      if (r > front + 1) return null;
      var a = Math.atan2(dy, dx);
      var ray = rayAt(a, r);
      // The wash follows the rays out, and its edge dissolves cell by cell.
      var wash = (maxR + 4) * 1.3 * easeOut(clamp01((b - WASH[0]) / (WASH[1] - WASH[0]))) * (0.8 + 0.3 * Math.max(0, ray));
      if (r < wash - 4 || (r < wash && rnd(gx * 7.1 + gy * 13.7) < (wash - r) / 4)) return [INK, 1];
      // The core is a star: it reaches further along each ray.
      var core = (1.5 + front * 0.17) * (1 + 1.5 * Math.max(0, rayAt(a, 4)));
      var out = r - core;
      var fall = 1 - r / (front + 1);
      if (out < 0) return [INK, 1];
      if (out < 1) return [YELLOW, 0.95];
      if (out < 3.5) return [BLUE, 0.9 - out * 0.12];
      if (ray > 0) return [ray < 0.3 ? YELLOW : BLUE, (0.55 + ray * 0.45) * (0.35 + fall * 0.65)];
      if (hand) {
        // The hands keep their tones, lit: highlights white, rims yellow.
        if (hand.kind === "o" || hand.tone === 3) return [INK, 1];
        if (hand.edge) return [YELLOW, 0.9];
        return [BLUE, hand.tone === 1 ? 0.45 : 0.85];
      }
      // Ripples spread out behind the core edge.
      var ring = (out - b * 9) % 7;
      if (ring > 0 && ring < 1.4 && fall > 0.2) return [ring < 0.4 ? YELLOW : BLUE, 0.7 * fall];
      return null;
    }

    function frame(now) {
      if (!u) return requestAnimationFrame(frame);
      start = start || now;
      var t = (now - start) / 1000;
      var l = leftAt ? (now - leftAt) / 1000 : -1;
      var tick = Math.floor(now / 50); // flicker steps at 20 Hz
      var b = l < REACH ? -1 : l - REACH;
      if (b > WASH[1]) {
        if (done) return (idle = true); // white and still: idle until finish()
        done = true;
      }

      if (l < 0) {
        var s = clamp01((t - BUILT) / 0.4); // ease the first drift in
        drift = s * DRIFT * (1 - Math.cos((2 * Math.PI * Math.max(0, t - BUILT)) / BREATHE)) / 2;
      }
      var p = l < 0 ? 0 : ease(clamp01(l / REACH));
      // Moves snap to whole cells, the way the grid in the reference does.
      var Lx = Math.round(-armL.x * drift * (1 - p) + touchL.x * p);
      var Ly = Math.round(-armL.y * drift * (1 - p) + touchL.y * p);
      var Rx = Math.round(-armR.x * drift * (1 - p) + touchR.x * p);
      var Ry = Math.round(-armR.y * drift * (1 - p) + touchR.y * p);

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, cw, ch);

      // The faint dot at the centre of every cell, up once the hands are built.
      var dots = l >= 0 ? 1 : clamp01((t - BUILT + 0.3) / 0.6);
      if (dots > 0) {
        ctx.globalAlpha = 0.13 * dots;
        ctx.fillStyle = INK;
        var o = (u - dot) / 2;
        for (var yy = gy0; yy < gy0 + grows; yy++) {
          for (var xx = gx0; xx < gx0 + gcols; xx++) ctx.fillRect(x0 + xx * u + o, y0 + yy * u + o, dot, dot);
        }
      }

      var front = b < 0 ? 0 : maxR * easeOut(clamp01(b / BURST));
      var lit = b >= 0;
      if (lit) slots.fill(0);
      for (var i = 0; i < cells.length; i++) {
        var c = cells[i];
        var age = t - c.delay;
        if (l >= 0) age = Math.max(age, SPARK + l * 4); // a fast reload: fill in now
        if (age < 0 || (age < SPARK && rnd(c.seed + tick) < 0.5)) continue;
        var gx = c.x + (c.left ? Lx : Rx);
        var gy = c.y + (c.left ? Ly : Ry);
        if (lit) {
          var k = (gy - gy0) * gcols + (gx - gx0);
          if (gx >= gx0 && gx < gx0 + gcols && k >= 0 && k < slots.length) slots[k] = i + 1;
          continue; // the burst pass below draws every cell
        }
        if (c.tone) {
          var set = TONES[c.tone];
          // While sparking, any glyph; once held, its tone's glyphs only.
          var g = age < SPARK ? Math.floor(rnd(c.seed + tick * 7) * 6) : set[(c.glyph + Math.floor(t * c.scramble)) % set.length];
          ctx.globalAlpha = age < SPARK ? 0.5 : TONE_ALPHA[c.tone];
          ctx.drawImage(atlas, g * u, 0, u, u, x0 + gx * u, y0 + gy * u, u, u);
        } else {
          var twinkle = c.kind === "b" ? 0.8 + 0.2 * Math.sin(t * 3 + c.seed) : 1;
          square(c.kind === "b" ? BLUE : INK, gx, gy, twinkle);
        }
      }

      if (lit) {
        // One pass over the visible grid: light where it reaches, the hands
        // as they were where it hasn't yet.
        for (var y = gy0; y < gy0 + grows; y++) {
          for (var x = gx0; x < gx0 + gcols; x++) {
            var n = slots[(y - gy0) * gcols + (x - gx0)];
            var hand = n ? cells[n - 1] : null;
            var f = light(x, y, b, front, hand);
            if (f) square(f[0], x, y, f[1]);
            else if (hand) {
              if (hand.tone) {
                ctx.globalAlpha = TONE_ALPHA[hand.tone];
                ctx.drawImage(atlas, TONES[hand.tone][hand.glyph] * u, 0, u, u, x0 + x * u, y0 + y * u, u, u);
              } else square(hand.kind === "b" ? BLUE : INK, x, y, 1);
            }
          }
        }
        var flash = Math.max(0, 1 - b * 6);
        if (flash) {
          ctx.globalAlpha = flash * 0.08;
          ctx.fillStyle = INK;
          ctx.fillRect(0, 0, cw, ch);
        }
      }

      // Bloom: a small blurred copy added back on top, stronger in the burst.
      gctx.globalAlpha = 1;
      gctx.drawImage(canvas, 0, 0, glow.width, glow.height);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = b < 0 ? 0.32 : 0.32 + 0.18 * Math.min(1, b * 2);
      ctx.drawImage(glow, 0, 0, cw, ch);
      ctx.globalCompositeOperation = "source-over";

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
        dot = Math.max(1, Math.round(u * 0.12));
        x0 = Math.round(cw / 2 - C.x * u);
        y0 = Math.round(ch / 2 - C.y * u);
        gx0 = Math.floor(-x0 / u);
        gy0 = Math.floor(-y0 / u);
        gcols = Math.ceil(cw / u) + 1;
        grows = Math.ceil(ch / u) + 1;
        maxR = Math.hypot(cw, ch) / 2 / u + 2;
        slots = new Int32Array(gcols * grows);
        done = false;
        if (idle) {
          // Resizing cleared the canvas: draw the last frame again.
          idle = false;
          requestAnimationFrame(frame);
        }

        atlas = surface(u * GLYPHS.length, u);
        var a = atlas.getContext("2d");
        a.fillStyle = INK;
        a.font = "600 " + Math.round(u * 0.86) + "px ui-monospace, Menlo, Consolas, monospace";
        a.textAlign = "center";
        a.textBaseline = "middle";
        for (var g = 0; g < GLYPHS.length; g++) a.fillText(GLYPHS[g], g * u + u / 2, u / 2 + u * 0.04);

        // A soft lift behind the hands, the screen darker at its edges.
        vignette = ctx.createRadialGradient(cw / 2, ch / 2, 0, cw / 2, ch / 2, Math.hypot(cw, ch) / 2);
        vignette.addColorStop(0, "rgba(46, 54, 78, 0.22)");
        vignette.addColorStop(1, "rgba(0, 0, 0, 0)");

        glow = surface(Math.max(1, Math.round(cw / 8)), Math.max(1, Math.round(ch / 8)));
        gctx = glow.getContext("2d");
        gctx.imageSmoothingQuality = "high";
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
