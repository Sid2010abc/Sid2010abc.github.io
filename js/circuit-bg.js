/**
 * circuit-bg.js
 * Generates a Manhattan-routed circuit trace network across the viewport
 * and animates light pulses traveling along the traces, like current
 * propagating through a live board. Pure canvas, no dependencies.
 */
(function () {
  const canvas = document.getElementById('circuit-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const COLORS = {
    trace: 'rgba(198,138,76,0.30)',
    traceDim: 'rgba(198,138,76,0.14)',
    via: 'rgba(198,138,76,0.45)',
    pulse: '#9be8b4',
    pulseCore: '#eafff0'
  };

  let W = 0, H = 0, DPR = 1;
  let paths = [];   // array of { points:[{x,y}...], length, cumLen:[...] }
  let pulses = [];  // active traveling pulses
  let lastSpawn = 0;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    generateNetwork();
  }

  // ---- network generation -------------------------------------------------
  function generateNetwork() {
    paths = [];
    const cell = Math.max(42, Math.min(78, Math.floor(Math.min(W, H) / 13)));
    const cols = Math.ceil(W / cell) + 1;
    const rows = Math.ceil(H / cell) + 1;

    // jittered grid of nodes
    const nodes = [];
    for (let r = 0; r < rows; r++) {
      nodes.push([]);
      for (let c = 0; c < cols; c++) {
        const jitterX = (Math.random() - 0.5) * cell * 0.35;
        const jitterY = (Math.random() - 0.5) * cell * 0.35;
        nodes[r].push({ x: c * cell + jitterX, y: r * cell + jitterY });
      }
    }

    const density = 0.48; // fraction of possible edges drawn
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // horizontal edge
        if (c < cols - 1 && Math.random() < density) {
          addChamferedPath(nodes[r][c], nodes[r][c + 1]);
        }
        // vertical edge
        if (r < rows - 1 && Math.random() < density) {
          addChamferedPath(nodes[r][c], nodes[r][c + 1] ? nodes[r + 1][c] : nodes[r + 1][c]);
        }
      }
    }
  }

  function addChamferedPath(a, b) {
    if (!a || !b) return;
    const pts = [{ x: a.x, y: a.y }];
    const dx = b.x - a.x, dy = b.y - a.y;
    // occasionally add a 45-degree chamfered bend for authenticity
    if (Math.abs(dx) > 4 && Math.abs(dy) > 4 && Math.random() < 0.5) {
      const midX = Math.abs(dx) < Math.abs(dy) ? a.x : b.x;
      pts.push({ x: midX, y: a.y });
      pts.push({ x: midX, y: b.y });
    }
    pts.push({ x: b.x, y: b.y });

    let length = 0;
    const cumLen = [0];
    for (let i = 1; i < pts.length; i++) {
      length += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      cumLen.push(length);
    }
    if (length < 8) return;
    paths.push({ points: pts, length, cumLen });
  }

  // ---- point-along-path interpolation -------------------------------------
  function pointAt(path, t) {
    const target = t * path.length;
    const { points, cumLen } = path;
    for (let i = 1; i < cumLen.length; i++) {
      if (target <= cumLen[i]) {
        const segLen = cumLen[i] - cumLen[i - 1];
        const segT = segLen === 0 ? 0 : (target - cumLen[i - 1]) / segLen;
        const p0 = points[i - 1], p1 = points[i];
        return { x: p0.x + (p1.x - p0.x) * segT, y: p0.y + (p1.y - p0.y) * segT };
      }
    }
    return points[points.length - 1];
  }

  // ---- drawing --------------------------------------------------------------
  function drawStatic() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (const p of paths) {
      ctx.beginPath();
      ctx.moveTo(p.points[0].x, p.points[0].y);
      for (let i = 1; i < p.points.length; i++) ctx.lineTo(p.points[i].x, p.points[i].y);
      ctx.strokeStyle = COLORS.traceDim;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function drawVias() {
    ctx.fillStyle = COLORS.via;
    for (let i = 0; i < paths.length; i += 3) {
      const p = paths[i];
      const pt = p.points[0];
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function spawnPulse(now) {
    if (paths.length === 0) return;
    const path = paths[Math.floor(Math.random() * paths.length)];
    if (path.length < 40) return;
    pulses.push({
      path,
      start: now,
      duration: 1800 + Math.random() * 2600,
      trail: 0.12 + Math.random() * 0.08
    });
  }

  function drawPulses(now) {
    pulses = pulses.filter(pl => now - pl.start < pl.duration);
    for (const pl of pulses) {
      const t = (now - pl.start) / pl.duration;
      const head = pointAt(pl.path, t);
      const tail = pointAt(pl.path, Math.max(0, t - pl.trail));

      const grad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
      grad.addColorStop(0, 'rgba(155,232,180,0)');
      grad.addColorStop(1, COLORS.pulse);

      ctx.beginPath();
      ctx.moveTo(tail.x, tail.y);
      ctx.lineTo(head.x, head.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // glowing head
      ctx.beginPath();
      ctx.arc(head.x, head.y, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.pulseCore;
      ctx.shadowColor = COLORS.pulse;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function frame(now) {
    drawStatic();
    drawVias();
    drawPulses(now);

    if (!lastSpawn || now - lastSpawn > 180) {
      if (pulses.length < 38) spawnPulse(now);
      lastSpawn = now;
    }
    requestAnimationFrame(frame);
  }

  function frameStatic() {
    drawStatic();
    drawVias();
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 180);
  });

  resize();

  if (reduceMotion) {
    frameStatic();
  } else {
    requestAnimationFrame(frame);
  }
})();
