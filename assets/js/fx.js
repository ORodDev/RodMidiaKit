/* RodEngine FX — grid vivo, cursor de editor, efeito de texto e abertura.
   Expõe window.FX para o app.js. Tudo respeita prefers-reduced-motion. */
(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const toRgb = (h) => { const n = parseInt(h.replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const app = document.getElementById('app');
  const viewport = document.getElementById('viewport');
  const scrollEl = document.getElementById('scroll');

  const FX = { labelFor: null };
  window.FX = FX;

  /* ================= Grid vivo ================= */
  const canvas = document.createElement('canvas');
  canvas.className = 'grid-canvas';
  document.querySelector('.scene-bg').prepend(canvas);
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1;
  function resize() {
    const r = viewport.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    if (reduced) draw(performance.now());
  }

  const mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false };
  viewport.addEventListener('pointermove', (e) => {
    const r = viewport.getBoundingClientRect();
    mouse.tx = e.clientX - r.left;
    mouse.ty = e.clientY - r.top;
    if (!mouse.active && e.pointerType === 'mouse') { mouse.x = mouse.tx; mouse.y = mouse.ty; }
    mouse.active = e.pointerType === 'mouse';
  }, { passive: true });
  viewport.addEventListener('pointerleave', () => { mouse.active = false; });

  let col = toRgb('#ff8a3d');
  let colT = col.slice();
  const ripples = [];
  const RIPPLE_LIFE = 1700;

  FX.setColor = (hex) => { colT = toRgb(hex); };
  FX.ripple = (x, y, amp = 1) => {
    if (reduced) return;
    ripples.push({ x, y, t0: performance.now(), amp });
    if (ripples.length > 5) ripples.shift();
  };
  FX.rippleAtClient = (cx, cy, amp) => {
    const r = viewport.getBoundingClientRect();
    FX.ripple(cx - r.left, cy - r.top, amp);
  };
  FX.rippleCenter = (amp) => FX.ripple(W / 2, H * 0.42, amp);

  const S = 44;          // espaçamento do grid
  const STEP = 22;       // resolução das linhas (para poderem entortar)
  const SIGMA = 150;     // raio da "lente" do cursor
  const SPEED = 0.85;    // velocidade da onda (px/ms)
  const P = [0, 0, 0];
  let now = 0;

  function displace(px, py) {
    const mx = px - mouse.x, my = py - mouse.y;
    const f = Math.exp(-(mx * mx + my * my) / (2 * SIGMA * SIGMA));
    let dx = -mx * 0.16 * f, dy = -my * 0.16 * f, glow = f;
    for (let i = 0; i < ripples.length; i++) {
      const r = ripples[i];
      const age = now - r.t0;
      const life = 1 - age / RIPPLE_LIFE;
      if (life <= 0) continue;
      const rx = px - r.x, ry = py - r.y;
      const dist = Math.sqrt(rx * rx + ry * ry) || 1;
      const off = dist - age * SPEED;
      const band = Math.exp(-(off * off) / 3200) * life * r.amp;
      dx += (rx / dist) * band * 16;
      dy += (ry / dist) * band * 16;
      glow += band * 1.3;
    }
    P[0] = px + dx; P[1] = py + dy; P[2] = glow;
  }

  function draw(t) {
    now = t;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const r = Math.round(col[0]), g = Math.round(col[1]), b = Math.round(col[2]);
    const st = scrollEl.scrollTop;
    const oy = -((st * 0.35) % S) - S;
    const ox = reduced ? 0 : -((t * 0.006) % S) - S;

    // Luz que segue o cursor
    const spot = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 340);
    spot.addColorStop(0, `rgba(${r},${g},${b},0.11)`);
    spot.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, W, H);

    // Linhas (entortam perto do cursor e nas ondas)
    const path = new Path2D();
    for (let x = ox; x <= W + S; x += S) {
      for (let y = -S; y <= H + S; y += STEP) { displace(x, y); y === -S ? path.moveTo(P[0], P[1]) : path.lineTo(P[0], P[1]); }
    }
    for (let y = oy; y <= H + S; y += S) {
      for (let x = -S; x <= W + S; x += STEP) { displace(x, y); x === -S ? path.moveTo(P[0], P[1]) : path.lineTo(P[0], P[1]); }
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(125,128,166,0.075)';
    ctx.stroke(path);
    const lineGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 260);
    lineGlow.addColorStop(0, `rgba(${r},${g},${b},0.42)`);
    lineGlow.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.strokeStyle = lineGlow;
    ctx.stroke(path);

    // Eixos da cena (X rosa, Y menta), como num editor
    const axisY = 560 - st * 0.35;
    const axisX = Math.round(W * 0.14 / S) * S + ox + S;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = -S; x <= W + S; x += STEP) { displace(x, axisY); x === -S ? ctx.moveTo(P[0], P[1]) : ctx.lineTo(P[0], P[1]); }
    ctx.strokeStyle = 'rgba(255,77,141,0.22)';
    ctx.stroke();
    ctx.beginPath();
    for (let y = -S; y <= H + S; y += STEP) { displace(axisX, y); y === -S ? ctx.moveTo(P[0], P[1]) : ctx.lineTo(P[0], P[1]); }
    ctx.strokeStyle = 'rgba(62,230,193,0.2)';
    ctx.stroke();

    // Pontos nas interseções: acendem com a cor da seção
    for (let x = ox; x <= W + S; x += S) {
      for (let y = oy; y <= H + S; y += S) {
        displace(x, y);
        const gl = Math.min(1, P[2]);
        if (gl < 0.05) {
          ctx.fillStyle = 'rgba(125,128,166,0.22)';
          ctx.fillRect(P[0] - 1, P[1] - 1, 2, 2);
        } else {
          const s = 2 + gl * 2.6;
          ctx.fillStyle = `rgba(${r},${g},${b},${(0.25 + gl * 0.75).toFixed(3)})`;
          ctx.fillRect(P[0] - s / 2, P[1] - s / 2, s, s);
        }
      }
    }
  }

  let lastT = performance.now();
  let clock = 0;
  function frame(t) {
    const dt = Math.min(50, t - lastT);
    lastT = t;
    clock += dt;
    if (!mouse.active) {
      // Sem mouse (celular ou fora da cena): a luz passeia sozinha
      mouse.tx = W * (0.5 + 0.34 * Math.sin(clock / 5200));
      mouse.ty = H * (0.42 + 0.26 * Math.sin(clock / 3700 + 1));
    }
    const k = mouse.active ? 0.16 : 0.025;
    mouse.x += (mouse.tx - mouse.x) * k;
    mouse.y += (mouse.ty - mouse.y) * k;
    for (let i = 0; i < 3; i++) col[i] += (colT[i] - col[i]) * 0.05;
    while (ripples.length && t - ripples[0].t0 > RIPPLE_LIFE) ripples.shift();
    draw(t);
    requestAnimationFrame(frame);
  }

  new ResizeObserver(resize).observe(viewport);
  resize();
  mouse.x = mouse.tx = W * 0.6;
  mouse.y = mouse.ty = H * 0.35;
  if (reduced) {
    scrollEl.addEventListener('scroll', () => requestAnimationFrame(() => { col = colT.slice(); draw(performance.now()); }), { passive: true });
    draw(performance.now());
  } else {
    requestAnimationFrame(frame);
  }

  /* ================= Efeito de texto (decode) ================= */
  const GLYPHS = '!<>-_\\/[]{}=+*^?#01ABCDEF$%&';
  FX.scramble = (el, dur = 720) => {
    if (reduced || !el || el.dataset.scrambling) return;
    const nodes = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) if (n.nodeValue.trim()) nodes.push({ n, txt: n.nodeValue });
    if (!nodes.length) return;
    el.dataset.scrambling = '1';
    const plan = nodes.map(({ txt }) => [...txt].map((ch) => ({ ch, at: dur * 0.15 + Math.random() * dur * 0.85 })));
    const start = performance.now();
    const step = (t) => {
      const e = t - start;
      let done = true;
      nodes.forEach((o, i) => {
        o.n.nodeValue = plan[i].map((p) => {
          if (p.ch === ' ' || e >= p.at) return p.ch;
          done = false;
          return GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }).join('');
      });
      if (!done) requestAnimationFrame(step);
      else { nodes.forEach((o) => { o.n.nodeValue = o.txt; }); delete el.dataset.scrambling; }
    };
    requestAnimationFrame(step);
  };

  /* ================= Cursor de editor ================= */
  if (finePointer) {
    document.documentElement.classList.add('custom-cursor');
    const cur = document.createElement('div');
    cur.className = 'cursor';
    cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<div class="cur-ring"><i></i><i></i><i></i><i></i></div><div class="cur-dot"></div><div class="cur-label"></div>';
    document.body.appendChild(cur);
    const ring = cur.querySelector('.cur-ring');
    const dot = cur.querySelector('.cur-dot');
    const label = cur.querySelector('.cur-label');
    let mx = -200, my = -200;
    let R = { x: -200, y: -200, w: 30, h: 30 };
    let mode = 'free';
    let hoverEl = null;
    let shown = false;
    let lastTarget = null;

    const colorOf = (el) => {
      const c = el && getComputedStyle(el).getPropertyValue('--c').trim();
      return c || getComputedStyle(app).getPropertyValue('--ac').trim() || '#3ee6c1';
    };
    function evaluate(target) {
      if (!target || !target.closest) return;
      lastTarget = target;
      const playing = app.classList.contains('playing');
      const typing = target.closest('input, textarea');
      cur.classList.toggle('hide', !!typing);
      const obj = !playing && target.closest('#scene [data-sel]');
      const link = target.closest('a, button, .node, .tab');
      let text = '';
      if (playing && target.closest('#scroll')) {
        mode = 'grab'; hoverEl = null; text = target.closest('.sim') ? 'arrastar' : '';
      } else if (obj && !(link && link !== obj && obj.contains(link))) {
        mode = 'obj'; hoverEl = obj;
        text = (FX.labelFor && FX.labelFor(obj.dataset.sel)) || '';
        if (obj.dataset.act === 'contact') text = 'falar comigo';
      } else if (link) {
        mode = 'link'; hoverEl = null;
        if (link.matches('a[target="_blank"]')) text = 'abrir ↗';
        else if (link.matches('a[href^="mailto:"]')) text = 'enviar e-mail';
        else if (link.dataset.act === 'copy') text = 'copiar';
        else if (link.id === 'playBtn') text = playing ? 'parar' : 'play mode';
        else if (link.dataset.act === 'pdf' || link.id === 'pdfBtn') text = 'gerar PDF';
      } else {
        mode = 'free'; hoverEl = null;
      }
      cur.dataset.mode = mode;
      label.textContent = text;
      cur.classList.toggle('has-label', !!text);
      cur.style.setProperty('--cc', colorOf(hoverEl || link || null));
    }

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!shown) { shown = true; cur.classList.add('show'); R = { x: mx - 15, y: my - 15, w: 30, h: 30 }; }
      if (e.target !== lastTarget) evaluate(e.target);
    }, { passive: true });
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) { cur.classList.remove('show'); shown = false; } });
    window.addEventListener('pointerdown', () => cur.classList.add('down'));
    window.addEventListener('pointerup', () => cur.classList.remove('down'));
    // Ao rolar ou mudar de modo, reavalia o que está embaixo do cursor
    const recheck = () => { if (shown) { lastTarget = null; evaluate(document.elementFromPoint(mx, my)); } };
    scrollEl.addEventListener('scroll', recheck, { passive: true });
    FX.recheckCursor = recheck;

    const loop = () => {
      let tx, ty, tw, th;
      if (mode === 'obj' && hoverEl && hoverEl.isConnected) {
        const r = hoverEl.getBoundingClientRect();
        tx = r.left - 8; ty = r.top - 8; tw = r.width + 16; th = r.height + 16;
      } else {
        const s = mode === 'link' ? 44 : mode === 'grab' ? 52 : 30;
        tx = mx - s / 2; ty = my - s / 2; tw = th = s;
      }
      const k = reduced ? 1 : 0.24;
      R.x += (tx - R.x) * k; R.y += (ty - R.y) * k;
      R.w += (tw - R.w) * k; R.h += (th - R.h) * k;
      ring.style.transform = `translate3d(${R.x.toFixed(1)}px, ${R.y.toFixed(1)}px, 0)`;
      ring.style.width = `${R.w.toFixed(1)}px`;
      ring.style.height = `${R.h.toFixed(1)}px`;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      label.style.transform = `translate3d(${mx + 18}px, ${my + 16}px, 0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ================= Abertura do editor ================= */
  FX.boot = (done) => {
    const el = document.getElementById('boot');
    let seen = false;
    try { seen = sessionStorage.getItem('rodengine-boot') === '1'; } catch (_) { /* sem storage */ }
    // Aba aberta em segundo plano: ninguém veria a abertura, então pula direto
    if (reduced || seen || !el || document.hidden) { el?.remove(); app.classList.remove('booting'); done(); return; }
    try { sessionStorage.setItem('rodengine-boot', '1'); } catch (_) { /* sem storage */ }
    const txt = el.querySelector('.boot-txt');
    const steps = ['importando assets…', 'compilando shaders…', 'carregando RodDev.scene…'];
    steps.forEach((s, i) => setTimeout(() => { txt.textContent = s; }, i * 260));
    setTimeout(() => el.classList.add('run'), 30);
    setTimeout(() => {
      el.classList.add('out');
      app.classList.remove('booting');
      FX.rippleCenter(1.8);
    }, 850);
    setTimeout(done, 1050);
    setTimeout(() => el.remove(), 1500);
  };
})();
