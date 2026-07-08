(function () {
  "use strict";

  var canvas = document.getElementById("dot-field");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  var SPACING = 34;
  var DOT_RADIUS = 1.5;
  var REPEL_RADIUS = 130;
  var REPEL_STRENGTH = 30;
  var EASE = 0.12;
  var DOT_COLOR = "rgba(245, 245, 247, 0.16)";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  var dots = [];
  var mouse = { x: -9999, y: -9999 };
  var width = 0;
  var height = 0;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var rafId = null;

  function buildDots() {
    dots = [];
    var cols = Math.ceil(width / SPACING) + 1;
    var rows = Math.ceil(height / SPACING) + 1;
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        var x = i * SPACING;
        var y = j * SPACING;
        dots.push({ ox: x, oy: y, x: x, y: y });
      }
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildDots();
    if (reduceMotion) drawStatic();
  }

  function drawStatic() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = DOT_COLOR;
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      ctx.beginPath();
      ctx.arc(d.ox, d.oy, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function setMouse(clientX, clientY) {
    mouse.x = clientX;
    mouse.y = clientY;
  }

  function onMouseMove(e) {
    setMouse(e.clientX, e.clientY);
  }

  function onTouchMove(e) {
    if (e.touches && e.touches.length) {
      setMouse(e.touches[0].clientX, e.touches[0].clientY);
    }
  }

  function onLeave() {
    mouse.x = -9999;
    mouse.y = -9999;
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = DOT_COLOR;

    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      var dx = d.ox - mouse.x;
      var dy = d.oy - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      var targetX = d.ox;
      var targetY = d.oy;

      if (dist < REPEL_RADIUS) {
        var force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
        var angle = Math.atan2(dy, dx);
        targetX = d.ox + Math.cos(angle) * force;
        targetY = d.oy + Math.sin(angle) * force;
      }

      d.x += (targetX - d.x) * EASE;
      d.y += (targetY - d.y) * EASE;

      ctx.beginPath();
      ctx.arc(d.x, d.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = window.requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("mouseleave", onLeave);
  window.addEventListener("touchmove", onTouchMove, { passive: true });
  window.addEventListener("touchend", onLeave);

  resize();

  if (!reduceMotion) {
    rafId = window.requestAnimationFrame(tick);
  }
})();
