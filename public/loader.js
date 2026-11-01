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
  var MIN_MS = 1200;
  var MIN_REPEAT_MS = 300; // reloads in the same tab
  var GIVE_UP_MS = 10000; // slow sky or fonts: open the site anyway
  var FAILED_MS = 20000; // bundle never ran: offer a reload

  // A cube of 9 x 9 x 9 dots, drawn by the GPU. Face-on the layers line up into a
  // flat grid; mid-turn they fan into a hexagon, and the moire comes from that
  // depth. Red, green and blue use slightly different angles, so they add up to
  // white at rest and split apart in motion. Stringified into a worker, so it
  // must not touch anything outside itself.
  function cube(canvas) {
    var gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false });
    if (!gl) return null;

    function shader(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }
    var program = gl.createProgram();
    gl.attachShader(
      program,
      shader(
        gl.VERTEX_SHADER,
        "attribute vec3 p;uniform float yaw,pitch,gap,size;uniform vec2 res;void main(){" +
          "float c=cos(yaw),s=sin(yaw),x=p.x*c+p.z*s,z=p.z*c-p.x*s,y=p.y*cos(pitch)-z*sin(pitch);" +
          "gl_Position=vec4(2.*x*gap/res.x,.06-2.*y*gap/res.y,0.,1.);gl_PointSize=size;}",
      ),
    );
    gl.attachShader(
      program,
      shader(
        gl.FRAGMENT_SHADER,
        "precision mediump float;uniform vec3 color;void main(){" +
          "gl_FragColor=vec4(color*smoothstep(.5,.36,length(gl_PointCoord-.5)),1.);}",
      ),
    );
    gl.bindAttribLocation(program, 0, "p");
    gl.linkProgram(program);
    gl.useProgram(program);

    var N = 9;
    var points = [];
    for (var i = 0; i < N * N * N; i++)
      points.push(i % N, Math.floor(i / N) % N, Math.floor(i / (N * N)));
    points = new Float32Array(points.map(function (v) {
      return v - (N - 1) / 2;
    }));
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    var u = {};
    ["yaw", "pitch", "gap", "size", "res", "color"].forEach(function (name) {
      u[name] = gl.getUniformLocation(program, name);
    });
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.clearColor(8 / 255, 31 / 255, 54 / 255, 1);

    var TURN_MS = 2200;
    var HOLD = 0.2; // share of each turn resting face-on
    var TILT = 0.6155; // radians to look down the diagonal: the hexagon
    var SPLIT = 0.05;
    var EXIT_MS = 1000;
    var CHANNELS = [[0.97, 0, 0, -1], [0, 0.97, 0, 0], [0, 0, 0.95, 1]];
    var unit = 0;
    var dpr = 1;
    var start = 0;
    var leftAt = 0;

    function frame(now) {
      start = start || now;
      var turn = (now - start) / TURN_MS;
      var whole = Math.floor(turn);
      var t = Math.min((turn - whole) / (1 - HOLD), 1);
      var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      var bulge = Math.sin(Math.PI * e);
      var out = leftAt ? Math.pow(Math.min((now - leftAt) / EXIT_MS, 1), 4) : 0;

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(u.pitch, TILT * bulge);
      gl.uniform1f(u.gap, unit * 0.04 * (1 + out * out * 11) * dpr);
      gl.uniform1f(u.size, Math.max(2, unit * 0.0084) * (1 + out * 4) * dpr);
      for (var c = 0; c < 3; c++) {
        var k = CHANNELS[c];
        gl.uniform1f(u.yaw, (whole + e) * (Math.PI / 2) + k[3] * SPLIT * bulge);
        gl.uniform3f(u.color, k[0] * (1 - out), k[1] * (1 - out), k[2] * (1 - out));
        gl.drawArrays(gl.POINTS, 0, points.length / 3);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    return {
      resize: function (d) {
        canvas.width = d.w * d.dpr;
        canvas.height = d.h * d.dpr;
        dpr = d.dpr;
        unit = Math.min(d.w, d.h);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(u.res, canvas.width, canvas.height);
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
    // In a worker the cube keeps turning while the main thread parses the bundle.
    var source =
      "var cube=" + cube + ",api;onmessage=function(e){var d=e.data;" +
      "if(d.canvas)api=cube(d.canvas);else if(api)api[d.type](d)}";
    worker = new Worker(URL.createObjectURL(new Blob([source], { type: "text/javascript" })));
    var offscreen = canvas.transferControlToOffscreen();
    worker.postMessage({ canvas: offscreen }, [offscreen]);
    send = function (type, data) {
      worker.postMessage(Object.assign({ type: type }, data));
    };
  } else {
    var api = cube(canvas);
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
