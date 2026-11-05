/* Shared script for every page */

/* Footer year */
document.querySelectorAll(".year-now").forEach(function (el) { el.textContent = new Date().getFullYear(); });

/* Home page banner: plays each animation through, then moves to the next.
   Clicking a dot or arrow jumps to that one and keeps it looping.
   Only runs on pages that have a .reel. */
(function () {
  var reel = document.querySelector(".reel");
  if (!reel) return;
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stage = reel.querySelector(".reel-stage");
  var vids = Array.prototype.slice.call(stage.querySelectorAll("video"));
  var cap = reel.querySelector(".reel-caption");
  var dotsBox = reel.querySelector(".reel-dots");
  var pauseBtn = reel.querySelector(".reel-pause");
  var i = 0, manual = false, paused = still;

  var dots = vids.map(function (v, k) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Show animation " + (k + 1) + " of " + vids.length);
    b.addEventListener("click", function () { show(k, true); });
    dotsBox.appendChild(b);
    return b;
  });

  function setPauseIcon() {
    pauseBtn.innerHTML = paused ? "&#9654;" : "&#10074;&#10074;";
    pauseBtn.setAttribute("aria-label", paused ? "Play" : "Pause");
  }
  function playCurrent() {
    if (paused) return;
    var p = vids[i].play();
    if (p && p.catch) p.catch(function () {});
  }
  function show(n, byUser) {
    if (byUser) manual = true;
    vids[i].pause();
    vids[i].classList.remove("on");
    i = (n + vids.length) % vids.length;
    var v = vids[i];
    v.classList.add("on");
    v.loop = manual;
    v.preload = "auto";
    try { v.currentTime = 0; } catch (e) {}
    stage.style.backgroundColor = v.dataset.bg || "";
    cap.innerHTML = v.dataset.caption || "";
    dots.forEach(function (d, k) { d.setAttribute("aria-current", k === i ? "true" : "false"); });
    // start loading the next one in the background
    var next = vids[(i + 1) % vids.length];
    if (next !== v && next.preload === "none") next.preload = "metadata";
    playCurrent();
  }
  vids.forEach(function (v, k) {
    v.addEventListener("ended", function () { if (!manual && k === i) show(i + 1, false); });
  });
  reel.querySelector(".reel-prev").addEventListener("click", function () { show(i - 1, true); });
  reel.querySelector(".reel-next").addEventListener("click", function () { show(i + 1, true); });
  pauseBtn.addEventListener("click", function () {
    paused = !paused; manual = true; vids[i].loop = true; setPauseIcon();
    if (paused) vids[i].pause(); else playCurrent();
  });

  setPauseIcon();
  show(0, false);
})();
