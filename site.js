/* Shared script for every page */

/* Footer year */
document.querySelectorAll(".year-now").forEach(el => { el.textContent = new Date().getFullYear(); });

/* Home page hero: greigite slab + water + CO2, jiggling like an MD run.
   Only runs on pages that have <canvas id="slab">. */
(function () {
  const c = document.getElementById("slab");
  if (!c || !c.getContext) return;
  const ctx = c.getContext("2d");
  const still = window.matchMedia("(prefers-reduced-motion: reduce)");
  const dark = window.matchMedia("(prefers-color-scheme: dark)");
  let W, H, surface, atoms, waters, co2, col, running = false;

  const rand = (a, b) => a + Math.random() * (b - a);
  const v = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  function setup() {
    const dpr = window.devicePixelRatio || 1;
    W = c.clientWidth; H = c.clientHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    col = { s: v("--sulfur"), fe: v("--iron"), w: v("--water"), o: v("--oxygen"), ink: v("--ink") };

    const a = 26, layers = 4, dy = a * 0.72;   // atom spacing, slab thickness
    surface = H - layers * dy - 4;
    atoms = [];
    for (let l = 0; l < layers; l++) {
      const y = surface + l * dy + dy / 2, off = (l % 2) * a / 2;
      for (let x = -a + off; x < W + a; x += a) {
        atoms.push({ x0: x, y0: y, dx: 0, dy: 0, r: 6.5, c: "s" });
        if ((Math.round((x - off) / a) + l) % 2 === 0) {
          atoms.push({ x0: x + a / 2, y0: y + dy / 2, dx: 0, dy: 0, r: 4.2, c: "fe" });
        }
      }
    }

    waters = [];
    const n = Math.max(10, Math.round(W * (surface - 10) / 1400)); // smaller divisor = more water
    for (let i = 0; i < n; i++) {
      waters.push({ x: rand(0, W), y: rand(10, surface - 12), vx: 0, vy: 0, t: rand(0, 6.28), vt: 0 });
    }
    co2 = { x: W * 0.62, y: surface - 26, vx: 0, vy: 0, t: 0.25, vt: 0 };
  }

  function step() {
    for (const p of atoms) {                    // 0.45 = jiggle strength
      p.dx = p.dx * 0.86 + rand(-0.45, 0.45);
      p.dy = p.dy * 0.86 + rand(-0.45, 0.45);
    }
    for (const m of waters) {
      m.vx = m.vx * 0.97 + rand(-0.06, 0.06);
      m.vy = m.vy * 0.97 + rand(-0.06, 0.06);
      m.vt = m.vt * 0.95 + rand(-0.01, 0.01);
      m.x += m.vx; m.y += m.vy; m.t += m.vt;
      if (m.x < -8) m.x += W + 16;
      if (m.x > W + 8) m.x -= W + 16;
      if (m.y < 8 || m.y > surface - 10) { m.vy *= -1; m.y = Math.min(Math.max(m.y, 8), surface - 10); }
    }
    co2.vx = co2.vx * 0.98 + rand(-0.03, 0.03);
    co2.vy = co2.vy * 0.98 + rand(-0.03, 0.03);
    co2.vt = co2.vt * 0.96 + rand(-0.004, 0.004);
    co2.x += co2.vx; co2.y += co2.vy; co2.t += co2.vt;
    if (co2.x < 30 || co2.x > W - 30) co2.vx *= -1;
    if (co2.y < surface - 60 || co2.y > surface - 16) co2.vy *= -1;
  }

  function dot(x, y, r, fill, alpha) {
    ctx.globalAlpha = alpha; ctx.fillStyle = fill;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const m of waters) {
      const hx = 4.6;
      dot(m.x + Math.cos(m.t + 0.92) * hx, m.y + Math.sin(m.t + 0.92) * hx, 1.9, col.w, 0.55);
      dot(m.x + Math.cos(m.t - 0.92) * hx, m.y + Math.sin(m.t - 0.92) * hx, 1.9, col.w, 0.55);
      dot(m.x, m.y, 3.3, col.w, 0.75);
    }
    for (const p of atoms) dot(p.x0 + p.dx, p.y0 + p.dy, p.r, p.c === "s" ? col.s : col.fe, 1);
    const d = 7.5, cx = Math.cos(co2.t) * d, cy = Math.sin(co2.t) * d;
    dot(co2.x - cx, co2.y - cy, 4, col.o, 1);
    dot(co2.x + cx, co2.y + cy, 4, col.o, 1);
    dot(co2.x, co2.y, 3.8, col.ink, 1);
    ctx.globalAlpha = 1;
  }

  function loop() {
    if (!running) return;
    step(); draw();
    requestAnimationFrame(loop);
  }

  function start() {
    setup();
    if (still.matches) { running = false; for (let i = 0; i < 30; i++) step(); draw(); }
    else if (!running) { running = true; requestAnimationFrame(loop); }
  }

  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(start, 150); });
  if (still.addEventListener) still.addEventListener("change", start);
  if (dark.addEventListener) dark.addEventListener("change", start);
  start();
})();
