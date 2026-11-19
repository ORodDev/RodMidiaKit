/* RodEngine — app do media kit.
   Renderiza a cena a partir de window.KIT (data.js), cuida de Hierarchy, Inspector,
   Console, Play Mode (física via Matter.js, carregado sob demanda) e Build PDF. */
(() => {
  'use strict';

  const K = window.KIT;
  const t0 = performance.now();
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const app = $('#app');
  const scroll = $('#scroll');
  const scene = $('#scene');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileMQ = matchMedia('(max-width: 860px)');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n, dec) => n.toFixed(dec).replace('.', ',');

  const ICON = {
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14 3c.4 2.6 2.2 4.4 5 4.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>',
    copy: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    mail: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4z M4 7l8 6 8-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    ext: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 16 16 8m0 0H9m7 0v7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    download: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  const SECTIONS = [
    { id: 'rod', name: 'RodDev', color: 'orange', comp: 'Player' },
    { id: 'numeros', name: 'Números', color: 'amber', comp: '// all time · YouTube + TikTok' },
    { id: 'plataformas', name: 'Plataformas', color: 'pink', comp: '// 3 redes conectadas' },
    { id: 'audiencia', name: 'Audiência', color: 'violet', comp: '// quem assiste' },
    { id: 'jogos', name: 'Meus jogos', color: 'mint', comp: '// feitos por mim' },
    { id: 'marcas', name: 'Marcas', color: 'amber', comp: '// quem já confiou' },
    { id: 'contato', name: 'Contato', color: 'orange', comp: '// bora conversar' },
  ];
  const SEC = Object.fromEntries(SECTIONS.map((s) => [s.id, s]));

  /* ---------- Registro de objetos selecionáveis ---------- */
  // key -> { label, sec, color, summary: [k, v], comps: [...], type }
  const OBJ = {};
  const reg = (key, o) => { OBJ[key] = { type: 'GameObject', comps: [], ...o }; };

  const cnt = (c, display) =>
    `<span class="cnt" data-to="${c.to}" data-dec="${c.dec}" data-suf="${esc(c.suf)}">${esc(display)}</span>`;

  const secHead = (s) =>
    `<header class="sec-h phys" data-sel="sec:${s.id}"><span class="sq"></span><h2>${esc(s.name)}</h2><span class="comp">${esc(s.comp)}</span></header>`;

  const metric = (key, color, label, valueHtml, note) =>
    `<div class="card phys c-${color}" data-sel="${key}"><div class="k">${esc(label)}</div><div class="v">${valueHtml}</div>${note ? `<div class="note">${esc(note)}</div>` : ''}</div>`;

  /* ---------- Render ---------- */
  function renderHero() {
    const p = K.profile;
    const T = K.totals;
    reg('rod', {
      label: 'RodDev', sec: 'rod', color: 'orange', type: 'Player · Prefab', img: p.photo,
      summary: ['Player', 'RodDev'],
      comps: [
        { t: 'Perfil', f: [['Tag', 'Creator'], ['Layer', 'Games · Tech · Dev'], ['Idioma', 'Português'], ['Base', 'Brasil']] },
        { t: 'Alcance', color: 'amber', f: [['Views', T.views.display], ['Seguidores', T.followers.display], ['Horas assistidas', T.hours.display]] },
        { t: 'Jogos', color: 'mint', f: [['Downloads', K.games.downloads.display], ['Wishlists Steam', K.games.wishlists.display]] },
        { t: 'Contato', color: 'orange', f: [['E-mail', K.email]] },
      ],
    });
    reg('kpi:views', { label: 'Views', sec: 'rod', color: 'amber', summary: ['Views', T.views.display], comps: [{ t: 'Views', f: [['Total', T.views.display], ...K.viewsSplit.map((v) => [v.name, v.display])] }] });
    reg('kpi:followers', { label: 'Seguidores', sec: 'rod', color: 'pink', summary: ['Seguidores', T.followers.display], comps: [{ t: 'Seguidores', f: K.platforms.map((pl) => [pl.name, pl.main]) }] });
    reg('kpi:downloads', { label: 'Downloads', sec: 'rod', color: 'mint', summary: ['Downloads', K.games.downloads.display], comps: [{ t: 'Meus jogos', f: [['Downloads', K.games.downloads.display], ['Wishlists Steam', K.games.wishlists.display], ['Conversão', `${K.games.conversion}%`]] }] });

    return `
    <section class="sec c-orange" id="rod" aria-label="Sobre o RodDev">
      <div class="hero">
        <div class="photo-wrap phys" data-sel="rod">
          <img class="photo" src="${esc(p.photo)}" alt="Foto do RodDev" width="520" height="650" fetchpriority="high">
          <span class="axis axis-y"></span><span class="axis axis-x"></span><span class="axis axis-o"></span>
          <div class="prefab">RodDev<span>.prefab</span></div>
        </div>
        <div class="hero-txt">
          <div class="hello phys">// oi, eu sou o</div>
          <h1 class="name phys" data-sel="rod">${esc(p.first)}<span>${esc(p.last)}</span></h1>
          <div class="role phys">${esc(p.role)}</div>
          <p class="lead phys">${esc(p.bio)}</p>
          <div class="chips">${p.tags.map(([t, c]) => `<span class="chip phys c-${c}">${esc(t)}</span>`).join('')}</div>
          <div class="kpis">
            ${metric('kpi:views', 'amber', T.views.label, cnt(T.views.count, T.views.display)).replace('class="card', 'class="card kpi')}
            ${metric('kpi:followers', 'pink', T.followers.label, cnt(T.followers.count, T.followers.display)).replace('class="card', 'class="card kpi')}
            ${metric('kpi:downloads', 'mint', 'downloads dos jogos', cnt(K.games.downloads.count, K.games.downloads.display)).replace('class="card', 'class="card kpi')}
          </div>
          <div class="ctas">
            <button class="btn btn-primary phys" type="button" data-act="contact">${ICON.mail}Falar comigo</button>
            <button class="btn btn-ghost phys" type="button" data-act="pdf">${ICON.download}Baixar media kit (PDF)</button>
          </div>
        </div>
      </div>
    </section>`;
  }

  function renderNumbers() {
    const T = K.totals;
    const s = SEC.numeros;
    reg('views', { label: 'Views', sec: 'numeros', color: 'amber', summary: ['Views', T.views.display], comps: [{ t: 'Views', f: [['Total', T.views.display], ...K.viewsSplit.map((v) => [v.name, v.display])] }, { t: 'Fonte', text: T.views.note }] });
    reg('followers', { label: 'Seguidores', sec: 'numeros', color: 'pink', summary: ['Seguidores', T.followers.display], comps: [{ t: 'Seguidores', f: K.platforms.map((pl) => [pl.name, pl.main]) }] });
    reg('hours', { label: 'Horas assistidas', sec: 'numeros', color: 'mint', summary: ['Horas', T.hours.display], comps: [{ t: 'Watch time', f: [['Total', T.hours.display], ['YouTube', '3,1M'], ['Em segundos', '≈ 16 bilhões']] }] });
    reg('impressions', { label: 'Impressões', sec: 'numeros', color: 'violet', summary: ['Impressões', T.impressions.display], comps: [{ t: 'YouTube', f: [['Impressões', T.impressions.display], ['CTR médio', T.ctr.display]] }] });
    reg('ctr', { label: 'CTR médio', sec: 'numeros', color: 'orange', summary: ['CTR', T.ctr.display], comps: [{ t: 'CTR médio', f: [['YouTube', T.ctr.display]], bar: 63.6, text: 'de cada 100 pessoas que veem a thumbnail, mais de 6 clicam.' }] });

    const total = K.viewsSplit.reduce((a, v) => a + v.value, 0);
    return `
    <section class="sec c-${s.color}" id="numeros">
      ${secHead(s)}
      <div class="card big phys c-amber" data-sel="views">
        <div class="k">visualizações combinadas</div>
        <div class="v">${cnt(T.views.count, T.views.display)} <span style="font-size:.4em;color:var(--white);letter-spacing:0">views</span></div>
        <div class="note">${esc(T.views.note)}</div>
        <div class="split">
          <div class="split-bar">${K.viewsSplit.map((v) => `<span class="c-${v.color}" style="flex:${v.value} 1 0"></span>`).join('')}</div>
          <div class="split-legend">${K.viewsSplit.map((v) => `<span class="c-${v.color}"><span class="dot"></span>${esc(v.name)} <b>${esc(v.display)}</b> · ${Math.round((v.value / total) * 100)}%</span>`).join('')}</div>
        </div>
      </div>
      <div class="cards">
        ${metric('followers', 'pink', T.followers.label, cnt(T.followers.count, T.followers.display), T.followers.note)}
        ${metric('hours', 'mint', T.hours.label, cnt(T.hours.count, T.hours.display), T.hours.note)}
        ${metric('impressions', 'violet', T.impressions.label, cnt(T.impressions.count, T.impressions.display), T.impressions.note)}
        ${metric('ctr', 'orange', T.ctr.label, cnt(T.ctr.count, T.ctr.display), T.ctr.note)}
      </div>
    </section>`;
  }

  function renderPlatforms() {
    const s = SEC.plataformas;
    const cards = K.platforms.map((pl) => {
      reg(pl.id, {
        label: pl.name, sec: 'plataformas', color: pl.color, type: 'Plataforma',
        summary: [pl.name, pl.main],
        comps: [{ t: pl.name, f: [['Handle', pl.handle], [cap(pl.mainLabel), pl.main], ...pl.stats] }, { t: 'Link', f: [['URL', pl.url.replace('https://www.', '')]] }],
      });
      return `
      <article class="card plat phys c-${pl.color}" data-sel="${pl.id}">
        <div class="plat-top">
          <div class="plat-ico">${ICON[pl.id]}</div>
          <div><div class="plat-name">${esc(pl.name)}</div><div class="plat-handle">${esc(pl.handle)}</div></div>
        </div>
        <div><div class="v">${cnt(pl.count, pl.main)}</div><div class="k">${esc(pl.mainLabel)}</div></div>
        <dl class="plat-stats">${pl.stats.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        <a class="btn visit" href="${esc(pl.url)}" target="_blank" rel="noopener noreferrer">Visitar ${ICON.ext}</a>
      </article>`;
    }).join('');
    return `
    <section class="sec c-${s.color}" id="plataformas">
      ${secHead(s)}
      <div class="cards plats">${cards}</div>
      <p class="total-line phys">Somando as três redes: <b>${esc(K.totals.followers.display)} seguidores</b>.</p>
    </section>`;
  }

  function renderAudience() {
    const s = SEC.audiencia;
    const A = K.audience;
    reg('ages', { label: 'Faixa etária', sec: 'audiencia', color: 'violet', summary: ['18–24', `${A.ages[0][1]}%`], comps: [{ t: 'Faixa etária (% views)', bars: A.ages }] });
    reg('geo', { label: 'Geografia', sec: 'audiencia', color: 'mint', summary: ['Base', A.geo.map((g) => g[0]).join(' · ')], comps: [{ t: 'Geografia', f: A.geo.map(([, n, t]) => [n, t]) }, { t: 'Perfil', text: A.profile }] });
    return `
    <section class="sec c-${s.color}" id="audiencia">
      ${secHead(s)}
      <div class="aud">
        <div class="card phys c-violet" data-sel="ages">
          <div class="card-h">Faixa etária · % das views</div>
          ${A.ages.map(([l, p], i) => `<div class="bar-row${i === A.ages.length - 1 ? ' dim' : ''}"><div class="bar-label"><span>${esc(l)}</span><b>${p}%</b></div><div class="bar"><span style="--w:${p}%"></span></div></div>`).join('')}
        </div>
        <div class="card phys c-mint" data-sel="geo">
          <div class="card-h">Onde a audiência está</div>
          <div class="geo">${A.geo.map(([cc, n, t]) => `<div class="geo-item"><span class="cc">${esc(cc)}</span><div><div class="geo-name">${esc(n)}</div><div class="geo-tag">${esc(t)}</div></div></div>`).join('')}</div>
        </div>
      </div>
      <p class="lead aud-note phys">${esc(A.profile)}</p>
    </section>`;
  }

  function renderGames() {
    const s = SEC.jogos;
    const G = K.games;
    const C = 2 * Math.PI * 50;
    reg('downloads', { label: 'Downloads', sec: 'jogos', color: 'mint', summary: ['Downloads', G.downloads.display], comps: [{ t: 'Meus jogos', f: [['Downloads', G.downloads.display]] }] });
    reg('wishlists', { label: 'Wishlists', sec: 'jogos', color: 'amber', summary: ['Wishlists', G.wishlists.display], comps: [{ t: 'Steam', f: [['Wishlists', G.wishlists.display]] }] });
    reg('conversion', { label: 'Conversão', sec: 'jogos', color: 'mint', summary: ['Conversão', `≈${G.conversion}%`], comps: [{ t: 'Inscrito → jogador', f: [['Taxa', `≈ ${G.conversion}%`]], bar: G.conversion, text: G.conversionNote }] });
    return `
    <section class="sec c-${s.color}" id="jogos">
      ${secHead(s)}
      <p class="lead phys">${esc(G.intro)}</p>
      <div class="games">
        ${metric('downloads', 'mint', 'downloads totais', cnt(G.downloads.count, G.downloads.display))}
        ${metric('wishlists', 'amber', 'wishlists na Steam', cnt(G.wishlists.count, G.wishlists.display))}
        <div class="card conv phys c-mint" data-sel="conversion">
          <div class="ring" role="img" aria-label="${G.conversion}% de conversão">
            <svg viewBox="0 0 120 120"><circle class="track" cx="60" cy="60" r="50"/><circle class="fill" cx="60" cy="60" r="50" stroke-dasharray="${C.toFixed(2)}" style="stroke-dashoffset:${(C * (1 - G.conversion / 100)).toFixed(2)}"/></svg>
            <b>${G.conversion}%</b>
          </div>
          <div class="conv-txt">
            <div class="k">Conversão inscrito → jogador</div>
            <p>Com <b>658,9K inscritos</b> e <b>400K+ downloads</b>, é como se cerca de <b>${G.conversion}% dos inscritos</b> tivesse baixado um jogo meu.</p>
            <div class="note">${esc(G.conversionNote)}</div>
          </div>
        </div>
      </div>
      <blockquote class="quote phys">“${esc(G.quote)}”</blockquote>
    </section>`;
  }

  const SECTOR_COLOR = { Energia: 'amber', Food: 'orange', Tech: 'mint', Games: 'violet', Hardware: 'pink', 'Negócios': 'amber' };
  function renderBrands() {
    const s = SEC.marcas;
    K.brands.forEach(([n, c], i) => reg(`brand:${i}`, { label: n, sec: 'marcas', color: SECTOR_COLOR[c] || 'amber', type: 'Parceiro', summary: [n, c], comps: [{ t: 'Parceria', f: [['Marca', n], ['Setor', c]] }] }));
    reg('brand:next', { label: 'Sua marca', sec: 'marcas', color: 'amber', type: 'Prefab vazio', summary: ['Próxima', 'Sua marca'], comps: [{ t: 'Slot livre', text: 'Esse espaço tá esperando a sua marca. Clique para falar comigo.' }] });
    return `
    <section class="sec c-${s.color}" id="marcas">
      ${secHead(s)}
      <p class="lead phys" style="margin-bottom:18px">Marcas que já confiaram no meu trabalho para chegar até a minha audiência.</p>
      <div class="brands">
        ${K.brands.map(([n, c], i) => `<div class="brand phys c-${SECTOR_COLOR[c] || 'amber'}" data-sel="brand:${i}"><div class="brand-n">${esc(n)}</div><div class="brand-c">${esc(c)}</div></div>`).join('')}
        <button class="brand next phys c-amber" type="button" data-sel="brand:next" data-act="contact"><div class="brand-n">+ Sua marca</div><div class="brand-c">próxima parceria</div></button>
      </div>
      <p class="sectors phys">Experiência em <b>${esc(K.brandSectors)}</b></p>
    </section>`;
  }

  function renderContact() {
    const s = SEC.contato;
    const colors = ['orange', 'pink', 'mint', 'amber', 'violet'];
    reg('email', { label: 'E-mail comercial', sec: 'contato', color: 'orange', type: 'Component', summary: ['E-mail', K.email], comps: [{ t: 'Contato comercial', f: [['E-mail', K.email], ['Resposta', 'direto comigo']] }] });
    reg('formats', { label: 'Formatos', sec: 'contato', color: 'mint', summary: ['Formatos', String(K.formats.length)], comps: [{ t: 'Formatos disponíveis', f: K.formats.map((f, i) => [String(i + 1).padStart(2, '0'), f]) }] });
    const subject = encodeURIComponent('Parceria com o RodDev');
    return `
    <section class="sec c-${s.color}" id="contato">
      ${secHead(s)}
      <div class="contact-hero phys" style="display:inline-block">Bora criar algo <span>juntos?</span></div>
      <p class="lead">Pronto para conectar sua marca a <b>mais de 356 milhões de views</b> e a uma audiência jovem apaixonada por tech e games? Me chama no e-mail comercial.</p>
      <div class="card mail phys c-orange" data-sel="email">
        <div><div class="k">e-mail comercial</div><div class="mail-addr">${esc(K.email)}</div></div>
        <div class="mail-actions">
          <button class="btn" type="button" data-act="copy">${ICON.copy}Copiar</button>
          <a class="btn btn-primary" href="mailto:${esc(K.email)}?subject=${subject}">${ICON.mail}Enviar e-mail</a>
        </div>
      </div>
      <div class="sub-h phys">Formatos disponíveis</div>
      <div class="chips">${K.formats.map((f, i) => `<span class="chip phys c-${colors[i % colors.length]}" data-sel="formats">${esc(f)}</span>`).join('')}</div>
      <div class="socials">
        ${K.platforms.map((pl) => `<a class="social phys c-${pl.color}" href="${esc(pl.url)}" target="_blank" rel="noopener noreferrer">${ICON[pl.id]}<b>${esc(pl.name)}</b><span>${esc(pl.handle)}</span></a>`).join('')}
      </div>
    </section>`;
  }

  // Seções: resumo no Inspector a partir dos filhos
  function regSections() {
    SECTIONS.forEach((s) => {
      if (s.id === 'rod') return;
      const kids = children(s.id);
      reg(`sec:${s.id}`, {
        label: s.name, sec: s.id, color: s.color, type: 'GameObject',
        summary: [s.name, ''],
        comps: [{ t: 'Filhos', f: kids.map((k) => OBJ[k].summary) }],
      });
    });
  }
  const children = (secId) => Object.keys(OBJ).filter((k) => OBJ[k].sec === secId && !k.startsWith('sec:') && !k.startsWith('kpi:') && k !== 'rod');
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  scene.innerHTML = [renderHero(), renderNumbers(), renderPlatforms(), renderAudience(), renderGames(), renderBrands(), renderContact()].join('');
  regSections();
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Hierarchy + tabs ---------- */
  const tree = $('#tree');
  const tabs = $('#tabs');
  const userOpen = new Set();
  tree.innerHTML = SECTIONS.map((s) => {
    const kids = s.id === 'rod' ? [] : children(s.id);
    return `<li class="c-${s.color}" data-li="${s.id}">
      <button class="node" type="button" data-go="${s.id}"><span class="caret">${kids.length ? '▸' : ''}</span><span class="sq"></span>${esc(s.name)}</button>
      ${kids.length ? `<ul>${kids.map((k) => `<li class="c-${OBJ[k].color}"><button class="node child" type="button" data-child="${k}"><span class="sq"></span>${esc(OBJ[k].label)}</button></li>`).join('')}</ul>` : ''}
    </li>`;
  }).join('');
  tabs.innerHTML = SECTIONS.map((s) => `<button class="tab c-${s.color}" type="button" data-go="${s.id}"><span class="sq"></span>${esc(s.name)}</button>`).join('');

  tree.addEventListener('click', (e) => {
    const node = e.target.closest('.node');
    if (!node) return;
    if (node.dataset.child) {
      const el = $(`[data-sel="${node.dataset.child}"]`, scene);
      if (el) { scrollToEl(el, 'center'); select(node.dataset.child, el); }
      return;
    }
    const id = node.dataset.go;
    const li = node.parentElement;
    if (e.target.closest('.caret') && li.querySelector('ul')) {
      li.classList.toggle('open');
      li.classList.contains('open') ? userOpen.add(id) : userOpen.delete(id);
      return;
    }
    go(id);
    const head = $(`[data-sel="sec:${id}"]`, scene) || $(`[data-sel="${id}"]`, scene);
    if (head) select(head.dataset.sel, head, false);
  });
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (b) go(b.dataset.go);
  });

  function scrollToEl(el, block = 'start') {
    const sr = scroll.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    let top = er.top - sr.top + scroll.scrollTop - 12;
    if (block === 'center') top -= (sr.height - er.height) / 2 - 12;
    scroll.scrollTo({ top: Math.max(0, top), behavior: reduced ? 'auto' : 'smooth' });
  }
  function go(id) {
    const sec = document.getElementById(id);
    if (sec) scrollToEl(sec);
  }

  /* ---------- Scrollspy + parallax ---------- */
  const secEls = SECTIONS.map((s) => document.getElementById(s.id));
  const bokeh = $('#bokeh');
  const progress = $('#vpProgress');
  let active = null;
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const st = scroll.scrollTop;
      if (!reduced) bokeh.style.transform = `translate3d(0, ${-st * 0.06}px, 0)`;
      progress.style.transform = `scaleX(${(st / Math.max(1, scroll.scrollHeight - scroll.clientHeight)).toFixed(4)})`;
      const line = st + scroll.clientHeight * 0.38;
      let cur = SECTIONS[0].id;
      secEls.forEach((el, i) => { if (el.offsetTop <= line) cur = SECTIONS[i].id; });
      if (st + scroll.clientHeight >= scroll.scrollHeight - 4) cur = SECTIONS[SECTIONS.length - 1].id;
      setActive(cur);
    });
  }
  const HEX = { orange: '#ff8a3d', amber: '#ffc857', mint: '#3ee6c1', pink: '#ff4d8d', violet: '#a99dff' };
  const crumb = $('#crumb');
  function setActive(id) {
    if (id === active) return;
    const first = active === null;
    active = id;
    // A cena "troca de cor" a cada seção: grid, cursor, barra de progresso e breadcrumb
    const hex = HEX[SEC[id].color];
    app.style.setProperty('--ac', hex);
    if (window.FX) { FX.setColor(hex); if (!first && booted) FX.rippleCenter(1); }
    if (crumb) { crumb.textContent = SEC[id].name; crumb.style.color = hex; }
    $$('.node[data-go]', tree).forEach((n) => n.classList.toggle('active', n.dataset.go === id));
    $$('li[data-li]', tree).forEach((li) => li.classList.toggle('open', li.dataset.li === id || userOpen.has(li.dataset.li)));
    $$('.tab', tabs).forEach((t) => {
      const on = t.dataset.go === id;
      t.classList.toggle('active', on);
      if (on && mobileMQ.matches) tabs.scrollTo({ left: t.offsetLeft - tabs.clientWidth / 2 + t.offsetWidth / 2, behavior: reduced ? 'auto' : 'smooth' });
    });
  }
  scroll.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Reveal + count-up ---------- */
  const SEC_LOG = {
    numeros: ['info', `${K.totals.views.display} views somando YouTube e TikTok`],
    plataformas: ['info', `3 plataformas conectadas · ${K.totals.followers.display} seguidores`],
    audiencia: ['info', `${K.audience.ages[0][1]}% do público tem entre 18 e 24 anos`],
    jogos: ['rod', `meus jogos já passaram de ${K.games.downloads.display} downloads. sim, eu que fiz.`],
    marcas: ['info', `${K.brands.length} marcas parceiras carregadas`],
    contato: ['rod', 'curtiu? me manda um e-mail que eu respondo.'],
  };
  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const final = el.textContent;
    const to = parseFloat(el.dataset.to);
    const dec = +el.dataset.dec;
    const suf = el.dataset.suf;
    if (reduced) return;
    const dur = 1100;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = p < 1 ? fmt(to * e, dec) + suf : final;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  /* Coreografia: cada seção entra de um jeito diferente.
     Tipos (CSS em style.css): rise, flip, pop, slide-l, slide-r, wipe, iris, blur, scan, scramble. */
  const HEADER = [['.sec-h .sq', 'pop'], ['.sec-h h2', 'scramble'], ['.sec-h .comp', 'wipe']];
  const CHOREO = {
    rod: [['.photo-wrap', 'scan'], ['.hello', 'wipe'], ['.name', 'scramble'], ['.role', 'wipe'], ['.hero .lead', 'blur'], ['.hero .chip', 'pop'], ['.kpi', 'rise'], ['.ctas .btn', 'rise']],
    numeros: [['.big', 'wipe'], ['.cards .card', 'rise']],
    plataformas: [['.plat', 'flip'], ['.total-line', 'wipe']],
    audiencia: [['[data-sel="ages"]', 'slide-l'], ['[data-sel="geo"]', 'slide-r'], ['.geo-item', 'slide-r'], ['.aud-note', 'blur']],
    jogos: [['.lead', 'blur'], ['.games > .card', 'pop'], ['.quote', 'wipe']],
    marcas: [['.lead', 'blur'], ['.brand', 'iris'], ['.sectors', 'wipe']],
    contato: [['.contact-hero', 'scramble'], ['.lead', 'blur'], ['.mail', 'pop'], ['.sub-h', 'wipe'], ['.chip', 'pop'], ['.social', 'rise']],
  };
  secEls.forEach((sec) => {
    let i = 0;
    [...HEADER, ...(CHOREO[sec.id] || [])].forEach(([sel, type]) => {
      $$(sel, sec).forEach((el) => {
        if (el.dataset.rv) return;
        el.classList.add('rv');
        el.dataset.rv = type;
        el.style.setProperty('--i', Math.min(i++, 14));
      });
    });
  });

  function reveal(sec) {
    if (sec.dataset.seen) return;
    sec.dataset.seen = '1';
    $$('.cnt', sec).forEach(countUp);
    if (!reduced) {
      sec.classList.add('revealing');
      $$('.rv[data-rv="scramble"]', sec).forEach((el) => {
        setTimeout(() => window.FX && FX.scramble(el), (+el.style.getPropertyValue('--i') || 0) * 65);
      });
      setTimeout(() => sec.classList.remove('revealing'), 2400);
    }
    requestAnimationFrame(() => requestAnimationFrame(() => sec.classList.remove('pre-anim')));
    const l = SEC_LOG[sec.id];
    if (l) log(l[0], esc(l[1]));
  }
  function revealAll() {
    secEls.forEach((s) => { s.dataset.seen = '1'; s.classList.remove('pre-anim', 'revealing'); });
    $$('.cnt', scene).forEach((el) => { el.dataset.done = '1'; });
  }
  if (!reduced) secEls.forEach((s) => s.classList.add('pre-anim'));
  let booted = false;
  const pending = [];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      booted ? reveal(en.target) : pending.push(en.target);
    });
  }, { root: scroll, threshold: 0.18 });
  secEls.forEach((s) => io.observe(s));

  /* ---------- Seleção + Inspector ---------- */
  const insp = $('#inspBody');
  let selKey = null;
  let selEl = null;
  function clearSelection() {
    if (selEl) { selEl.classList.remove('sel'); $('.gizmo', selEl)?.remove(); }
    selEl = null;
  }
  function select(key, el, doLog = true) {
    if (!OBJ[key] || !el) return;
    const changed = key !== selKey;
    clearSelection();
    selKey = key;
    selEl = el;
    el.classList.add('sel');
    const g = document.createElement('span');
    g.className = 'gizmo';
    g.innerHTML = '<i></i><i></i><i></i><i></i>';
    el.appendChild(g);
    $$('.node.child', tree).forEach((n) => n.classList.toggle('selected', n.dataset.child === key));
    renderInspector(key, el);
    if (changed && doLog) log('select', `${esc(OBJ[key].label)} <span style="color:var(--muted)">selecionado</span>`);
  }
  function renderInspector(key, el) {
    const o = OBJ[key];
    const sr = scene.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const tr = { x: Math.round(r.left - sr.left), y: Math.round(r.top - sr.top), w: Math.round(r.width), h: Math.round(r.height) };
    const head = o.img
      ? `<img src="${esc(o.img)}" alt="">`
      : '<span class="sq"></span>';
    const field = ([k, v]) => `<div class="field"><span>${esc(k)}</span><span>${esc(v)}</span></div>`;
    const comps = o.comps.map((c) => `
      <div class="comp-box c-${c.color || o.color}">
        <div class="comp-title">${esc(c.t)}</div>
        ${(c.f || []).map(field).join('')}
        ${c.bars ? c.bars.map(([l, p]) => `${field([l, `${p}%`])}<div class="ibar"><span style="width:${p}%"></span></div>`).join('') : ''}
        ${c.bar != null ? `<div class="ibar"><span style="width:${c.bar}%"></span></div>` : ''}
        ${c.text ? `<div class="insp-text">${esc(c.text)}</div>` : ''}
      </div>`).join('');
    insp.innerHTML = `
      <div class="insp-head c-${o.color}">${head}<div><div class="insp-name">${esc(o.label)}</div><div class="insp-type">${esc(o.type)}</div></div></div>
      <div class="comp-box c-${o.color}">
        <div class="comp-title">Transform</div>
        <div class="field"><span>Position</span><span class="xyz"><em>X <b>${tr.x}</b></em><em>Y <b>${tr.y}</b></em></span></div>
        <div class="field"><span>Size</span><span class="xyz"><em>W <b>${tr.w}</b></em><em>H <b>${tr.h}</b></em></span></div>
      </div>
      ${comps}
      <div class="insp-hint">clique em qualquer objeto da cena para inspecionar</div>`;
  }

  scene.addEventListener('click', (e) => {
    if (playing) return;
    if (window.FX) FX.rippleAtClient(e.clientX, e.clientY, 0.6);
    const selTarget = e.target.closest('[data-sel]');
    if (selTarget) select(selTarget.dataset.sel, selTarget);
    const act = e.target.closest('[data-act]');
    if (act) runAct(act.dataset.act);
  });

  /* ---------- Ações ---------- */
  function runAct(a) {
    if (a === 'contact') contact();
    else if (a === 'pdf') buildPdf();
    else if (a === 'copy') copyEmail();
  }
  function contact() {
    go('contato');
    const el = $('[data-sel="email"]', scene);
    setTimeout(() => select('email', el, false), reduced ? 0 : 450);
    log('rod', `meu e-mail comercial é <code>${esc(K.email)}</code>`);
  }
  async function copyEmail() {
    let ok = false;
    try { await navigator.clipboard.writeText(K.email); ok = true; } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = K.email; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
      ta.remove();
    }
    if (ok) { toast('E-mail copiado'); log('info', `e-mail copiado: <code>${esc(K.email)}</code>`); }
    else log('erro', `não consegui copiar. o e-mail é <code>${esc(K.email)}</code>`);
  }
  function buildPdf() {
    if (playing) stopPlay(true);
    revealAll();
    log('build', 'compilando media kit… escolha <code>Salvar como PDF</code> no destino.');
    setTimeout(() => window.print(), 120);
  }
  window.addEventListener('beforeprint', revealAll);
  window.addEventListener('afterprint', () => log('build', 'build finalizado.'));

  $('#pdfBtn').addEventListener('click', buildPdf);
  $('#contactBtn').addEventListener('click', contact);
  $('#logoLink').addEventListener('click', (e) => { e.preventDefault(); go('rod'); });

  let toastT;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 1800);
  }

  /* ---------- Console ---------- */
  const logEl = $('#log');
  const lastEl = $('#consoleLast');
  const pad = (n) => String(n).padStart(2, '0');
  function log(tag, html) {
    const d = new Date();
    const line = document.createElement('div');
    line.className = 'line';
    line.innerHTML = `<time>${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}</time><span class="tag t-${tag}">[${tag}]</span><span class="msg">${html}</span>`;
    logEl.appendChild(line);
    while (logEl.children.length > 80) logEl.firstChild.remove();
    logEl.scrollTop = logEl.scrollHeight;
    lastEl.innerHTML = `<span class="tag t-${tag}">[${tag}]</span> <span class="msg">${html}</span>`;
  }
  const consoleToggle = $('#consoleToggle');
  function setConsole(open) {
    app.classList.toggle('console-closed', !open);
    consoleToggle.setAttribute('aria-expanded', String(open));
    if (open) logEl.scrollTop = logEl.scrollHeight;
  }
  consoleToggle.addEventListener('click', () => setConsole(app.classList.contains('console-closed')));
  setConsole(!mobileMQ.matches);

  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const SEC_ALIAS = { rod: 'rod', sobre: 'rod', inicio: 'rod', home: 'rod', numeros: 'numeros', plataformas: 'plataformas', redes: 'plataformas', audiencia: 'audiencia', publico: 'audiencia', jogos: 'jogos', games: 'jogos', marcas: 'marcas', parceiros: 'marcas', contato: 'contato' };
  const CMDS = {
    help: () => log('info', 'comandos: ' + ['numeros', 'plataformas', 'audiencia', 'jogos', 'marcas', 'contato', 'email', 'pdf', 'play', 'stop', 'youtube', 'tiktok', 'instagram', 'clear'].map((c) => `<code>${c}</code>`).join(' ')),
    ajuda: () => CMDS.help(),
    email: () => copyEmail(),
    pdf: () => buildPdf(),
    build: () => buildPdf(),
    play: () => startPlay(),
    stop: () => (playing ? stopPlay() : log('info', 'o Play Mode já está parado.')),
    clear: () => { logEl.innerHTML = ''; },
    limpar: () => { logEl.innerHTML = ''; },
    oi: () => log('rod', 'oi! tudo certo? se quiser fechar uma parceria, digite <code>contato</code>.'),
    ola: () => CMDS.oi(),
    hello: () => CMDS.oi(),
    sudo: () => log('erro', 'boa tentativa. aqui quem tem root sou eu.'),
  };
  K.platforms.forEach((pl) => { CMDS[pl.id] = () => { window.open(pl.url, '_blank', 'noopener'); log('info', `abrindo ${esc(pl.name)}…`); }; });

  $('#cmdForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#cmd');
    const raw = input.value;
    input.value = '';
    if (!raw.trim()) return;
    log('cmd', `&gt; ${esc(raw)}`);
    const c = norm(raw).split(/\s+/)[0];
    if (SEC_ALIAS[c]) {
      const id = SEC_ALIAS[c];
      if (id === 'contato') return contact();
      go(id);
      const head = $(`[data-sel="sec:${id}"]`, scene) || $(`[data-sel="${id}"]`, scene);
      if (head) setTimeout(() => select(head.dataset.sel, head, false), reduced ? 0 : 400);
      return;
    }
    if (CMDS[c]) return CMDS[c]();
    log('erro', `comando <code>${esc(c)}</code> não encontrado. digite <code>help</code>.`);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && playing) { stopPlay(); return; }
    const typing = /input|textarea/i.test(document.activeElement?.tagName || '');
    if (e.key === '/' && !typing) {
      e.preventDefault();
      setConsole(true);
      $('#cmd').focus();
    }
  });

  /* ---------- Play Mode (Matter.js sob demanda) ---------- */
  const MATTER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
  let matterP = null;
  function loadMatter() {
    if (window.Matter) return Promise.resolve(window.Matter);
    if (!matterP) {
      matterP = new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = MATTER_URL;
        s.async = true;
        s.onload = () => res(window.Matter);
        s.onerror = () => { matterP = null; rej(new Error('matter')); };
        document.head.appendChild(s);
      });
    }
    return matterP;
  }

  const playBtn = $('#playBtn');
  let playing = null;
  playBtn.addEventListener('click', () => (playing ? stopPlay() : startPlay()));

  async function startPlay() {
    if (playing) return;
    let M;
    try { M = await loadMatter(); } catch (_) { log('erro', 'não consegui carregar a física. confere a conexão e tenta de novo.'); return; }
    if (playing) return;
    clearSelection();
    // Termina as transições de entrada já iniciadas antes da física assumir os transforms
    secEls.forEach((s) => { if (s.dataset.seen) s.classList.remove('revealing', 'pre-anim'); });
    const vr = scroll.getBoundingClientRect();
    const W = vr.width;
    const H = vr.height;
    const els = $$('.phys', scene).filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top >= vr.top - 1 && r.bottom <= vr.bottom + 1;
    });
    if (!els.length) { log('aviso', 'nenhum objeto visível pra simular. rola um pouco e tenta de novo.'); return; }
    // Objetos cortados pela borda ficam fora da física: some com eles para não ficarem por cima
    const ghosts = $$('.phys', scene).filter((el) => !els.includes(el));
    els.forEach((el) => el.classList.add('sim'));
    ghosts.forEach((el) => el.classList.add('ghost'));

    const engine = M.Engine.create();
    engine.gravity.y = 1.1;
    const T = 400;
    const wall = { isStatic: true, friction: 0.3 };
    M.Composite.add(engine.world, [
      M.Bodies.rectangle(W / 2, H + T / 2, W * 3, T, wall),
      M.Bodies.rectangle(W / 2, -T / 2, W * 3, T, wall),
      M.Bodies.rectangle(-T / 2, H / 2, T, H * 3, wall),
      M.Bodies.rectangle(W + T / 2, H / 2, T, H * 3, wall),
    ]);
    const items = els.map((el) => {
      const r = el.getBoundingClientRect();
      const x0 = r.left - vr.left + r.width / 2;
      const y0 = r.top - vr.top + r.height / 2;
      const body = M.Bodies.rectangle(x0, y0, r.width, r.height, {
        restitution: 0.3, friction: 0.35, frictionAir: 0.01, density: 0.0012,
        chamfer: { radius: Math.min(10, r.width / 4, r.height / 4) },
      });
      M.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);
      M.Body.setVelocity(body, { x: (Math.random() - 0.5) * 3, y: -Math.random() * 2 });
      return { el, body, x0, y0 };
    });
    const bodies = items.map((i) => i.body);
    M.Composite.add(engine.world, bodies);

    // Arrastar e arremessar
    let drag = null;
    const pt = (e) => ({ x: e.clientX - vr.left, y: e.clientY - vr.top });
    const down = (e) => {
      const p = pt(e);
      const hit = M.Query.point(bodies, p)[0];
      if (!hit) return;
      e.preventDefault();
      drag = M.Constraint.create({ pointA: p, bodyB: hit, pointB: { x: p.x - hit.position.x, y: p.y - hit.position.y }, stiffness: 0.18, damping: 0.08, length: 0 });
      M.Composite.add(engine.world, drag);
      scroll.setPointerCapture?.(e.pointerId);
      grabs++;
    };
    const move = (e) => { if (drag) drag.pointA = pt(e); };
    const up = () => { if (drag) { M.Composite.remove(engine.world, drag); drag = null; } };
    const block = (e) => { e.preventDefault(); e.stopPropagation(); };
    scroll.addEventListener('pointerdown', down);
    scroll.addEventListener('pointermove', move);
    scroll.addEventListener('pointerup', up);
    scroll.addEventListener('pointercancel', up);
    scroll.addEventListener('click', block, true);

    let grabs = 0;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const STEP = 1000 / 60;
    const tick = (now) => {
      acc += Math.min(100, now - last);
      last = now;
      while (acc >= STEP) { M.Engine.update(engine, STEP); acc -= STEP; }
      for (const it of items) {
        const { x, y } = it.body.position;
        it.el.style.transform = `translate(${(x - it.x0).toFixed(1)}px, ${(y - it.y0).toFixed(1)}px) rotate(${it.body.angle.toFixed(4)}rad)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const hintT = setTimeout(() => { if (playing && !grabs) log('dica', 'clica e arrasta qualquer objeto. dá pra arremessar.'); }, 3500);
    const onResize = () => stopPlay();
    window.addEventListener('resize', onResize);

    playing = {
      items,
      stop() {
        cancelAnimationFrame(raf);
        clearTimeout(hintT);
        scroll.removeEventListener('pointerdown', down);
        scroll.removeEventListener('pointermove', move);
        scroll.removeEventListener('pointerup', up);
        scroll.removeEventListener('pointercancel', up);
        window.removeEventListener('resize', onResize);
        setTimeout(() => scroll.removeEventListener('click', block, true), 0);
        M.Engine.clear(engine);
        els.forEach((el) => el.classList.remove('sim'));
        ghosts.forEach((el) => el.classList.remove('ghost'));
      },
    };
    app.classList.add('playing');
    playBtn.setAttribute('aria-pressed', 'true');
    $('.play-label', playBtn).textContent = 'Stop';
    log('play', `Play Mode iniciado · ${items.length} objetos com física`);
    if (window.FX) { FX.rippleCenter(2.2); FX.recheckCursor?.(); }
  }

  function stopPlay(instant = false) {
    if (!playing) return;
    const { items } = playing;
    playing.stop();
    playing = null;
    app.classList.remove('playing');
    playBtn.setAttribute('aria-pressed', 'false');
    $('.play-label', playBtn).textContent = 'Play';
    items.forEach(({ el }) => {
      if (!instant && !reduced) el.style.transition = 'transform .75s cubic-bezier(.2,.8,.2,1)';
      el.style.transform = '';
    });
    setTimeout(() => items.forEach(({ el }) => { el.style.transition = ''; }), instant ? 0 : 800);
    log('aviso', 'Play Mode encerrado. as alterações feitas no Play Mode foram descartadas.');
    window.FX?.recheckCursor?.();
  }

  /* ---------- Boot ---------- */
  setActive('rod');
  select('rod', $('.photo-wrap', scene), false);
  const ms = Math.max(1, Math.round(performance.now() - t0));
  log('rod', 'e aí! bem-vindo à minha cena. pode rolar a página normal ou clicar em qualquer objeto.');
  log('info', `RodDev.scene carregada em ${ms}ms · ${$$('.phys', scene).length} objetos`);
  log('dica', mobileMQ.matches ? 'aperta <code>Play</code> lá em cima pra ver uma coisa.' : 'aperta <code>Play</code> lá em cima pra ver uma coisa. ou digite <code>help</code> aqui embaixo.');

  if (window.FX) FX.labelFor = (key) => OBJ[key]?.label;
  const afterBoot = () => {
    booted = true;
    pending.splice(0).forEach(reveal);
  };
  if (window.FX) FX.boot(afterBoot); else { app.classList.remove('booting'); afterBoot(); }

  // Pré-carrega a física quando o navegador estiver ocioso
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 2500));
  idle(() => loadMatter().catch(() => {}));
})();
