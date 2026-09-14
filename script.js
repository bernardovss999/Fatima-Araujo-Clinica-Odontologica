/* =========================================================
   Fátima Araújo — Clínica Odontológica
   Interações do site. Sem dependências externas.
   ========================================================= */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

/* ---------------------------------------------------------
   CONTEÚDO DO MURAL DE DEPOIMENTOS
   Para acrescentar uma avaliação real, basta copiar um bloco
   { tipo:'review', ... } e colar na lista abaixo.
   --------------------------------------------------------- */
const MURAL = [
  { tipo:'score' },
  { tipo:'review', nome:'Regis Cesar R.', fonte:'Avaliação no Google', nota:5,
    texto:'Clínica extremamente confortável, com profissionais de alto nível e atendimento totalmente humanizado. Referência em várias especialidades odontológicas — o melhor custo-benefício de Niterói. Fechei para mim, minha esposa e meu filho.' },
  { tipo:'review', nome:'Maria da Graça R.', fonte:'Avaliação no Google', nota:5,
    texto:'Muito satisfeita com o atendimento. Maravilhoso desde a recepção, equipe super gentil e ambiente acolhedor. Super indico.' },
  { tipo:'cta' },
  { tipo:'fact', titulo:'Desde 2002', linha:'Mais de duas décadas atendendo o mesmo bairro' },
  { tipo:'fact', titulo:'Seis especialidades', linha:'Do check-up de rotina à reabilitação completa' },
  { tipo:'fact', titulo:'Icaraí, Niterói', linha:'Rua Álvares de Azevedo, 252 — a poucos passos da praia' },
  { tipo:'fact', titulo:'Seg a sex · 9h–18h', linha:'Agenda confirmada diretamente com a recepção' },
  { tipo:'fact', titulo:'A consulta começa ouvindo', linha:'Medo, histórico e expectativa entram no plano' },
  { tipo:'fact', titulo:'Plano por inteiro', linha:'Etapas, tempo estimado e valores antes de começar' }
];

const WA = 'https://wa.me/5521964075922';
const GOOGLE_REVIEWS = 'https://www.google.com/maps/place/F%C3%81TIMA+ARAUJO+CLINICA+ODONTOL%C3%93GICA+LTDA/@-22.8996434,-43.1112065,17z/data=!4m6!3m5!1s0x9983ab9a8b00d9:0x269f2baebf61691!8m2!3d-22.9004538!4d-43.1103053!16s%2Fg%2F1ptwfx_s6';


/* ---------- 1. TEMA ---------- */
(function theme(){
  const root = document.documentElement;
  const btn = $('#themeBtn');
  const saved = (() => { try { return localStorage.getItem('fa-theme'); } catch { return null; } })();
  const system = window.matchMedia('(prefers-color-scheme: dark)');

  const apply = (t) => {
    root.setAttribute('data-theme', t);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#14100E' : '#6D1F23');
  };

  apply(saved || (system.matches ? 'dark' : 'light'));
  system.addEventListener('change', (e) => { if (!localStorage.getItem('fa-theme')) apply(e.matches ? 'dark' : 'light'); });

  btn?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('fa-theme', next); } catch {}
  });
})();


/* ---------- 2. TÍTULO POR CARACTERE ---------- */
function splitText(el){
  let i = 0;
  const walk = (node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((token) => {
          if (!token) return;
          if (/^\s+$/.test(token)) { frag.appendChild(document.createTextNode(' ')); return; }
          const word = document.createElement('span');
          word.className = 'word';
          Array.from(token).forEach((c) => {
            const wrap = document.createElement('span');
            wrap.className = 'ch';
            const inner = document.createElement('i');
            inner.textContent = c;
            inner.style.setProperty('--d', (i++ * 22) + 'ms');
            wrap.appendChild(inner);
            word.appendChild(wrap);
          });
          frag.appendChild(word);
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1) {
        walk(child);
      }
    });
  };
  walk(el);
}

$$('[data-split]').forEach(splitText);


/* ---------- 3. REVELAÇÃO AO ROLAR ---------- */
(function reveal(){
  const items = $$('.reveal, [data-split], .step');
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  items.forEach((el) => io.observe(el));
})();


/* ---------- 4. CABEÇALHO, PROGRESSO E VOLTAR AO TOPO ---------- */
(function chrome(){
  const head = $('#head');
  const bar = $('#progressBar');
  const top = $('#toTop');
  let last = window.scrollY, ticking = false;

  const run = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    head?.classList.toggle('is-stuck', y > 24);
    if (!$('#mega')?.classList.contains('is-open') && !$('#drawer')?.classList.contains('is-open')) {
      head?.classList.toggle('is-hidden', y > 420 && y > last + 4);
    }
    top?.classList.toggle('is-on', y > 700);
    last = y;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(run); }
  }, { passive: true });
  run();

  top?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
})();


/* ---------- 5. MEGA MENU ---------- */
(function mega(){
  const btn = $('#megaBtn'), panel = $('#mega');
  if (!btn || !panel) return;
  let timer = null, open = false;

  const set = (state) => {
    if (state === open) return;
    open = state;
    btn.setAttribute('aria-expanded', String(state));
    if (state) {
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add('is-open'));
    } else {
      panel.classList.remove('is-open');
      setTimeout(() => { if (!open) panel.hidden = true; }, 320);
    }
  };

  btn.addEventListener('click', (e) => { e.preventDefault(); set(!open); });

  if (finePointer) {
    const enter = () => { clearTimeout(timer); set(true); };
    const leave = () => { clearTimeout(timer); timer = setTimeout(() => set(false), 180); };
    [btn, panel].forEach((el) => { el.addEventListener('mouseenter', enter); el.addEventListener('mouseleave', leave); });
  }

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { set(false); btn.focus(); } });
  document.addEventListener('click', (e) => {
    if (open && !panel.contains(e.target) && !btn.contains(e.target)) set(false);
  });

  $$('[data-go]', panel).forEach((a) => {
    a.addEventListener('click', () => {
      set(false);
      window.dispatchEvent(new CustomEvent('spec:go', { detail: Number(a.dataset.go) }));
    });
  });
})();


/* ---------- 6. MENU MOBILE ---------- */
(function drawer(){
  const burger = $('#burger'), panel = $('#drawer');
  if (!burger || !panel) return;
  let open = false;

  const set = (state) => {
    open = state;
    burger.setAttribute('aria-expanded', String(state));
    burger.setAttribute('aria-label', state ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('is-locked', state);
    if (state) {
      panel.hidden = false;
      requestAnimationFrame(() => {
        panel.classList.add('is-open');
        $$('a', panel).forEach((a, i) => { a.style.transitionDelay = (60 + i * 45) + 'ms'; });
      });
    } else {
      panel.classList.remove('is-open');
      $$('a', panel).forEach((a) => { a.style.transitionDelay = '0ms'; });
      setTimeout(() => { if (!open) panel.hidden = true; }, 380);
    }
  };

  burger.addEventListener('click', () => set(!open));
  $$('a', panel).forEach((a) => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { set(false); burger.focus(); } });
})();


/* ---------- 7. SEÇÃO ATIVA NO MENU ---------- */
(function spy(){
  const links = $$('[data-spy]');
  if (!links.length || !('IntersectionObserver' in window)) return;
  const map = new Map(links.map((l) => [l.dataset.spy, l]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const link = map.get(e.target.id);
      if (link) link.classList.toggle('is-active', e.isIntersecting);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
})();


/* ---------- 8. CONTADORES ---------- */
(function counters(){
  const nums = $$('.num');
  if (!nums.length) return;

  const format = (el, v) => {
    if (el.dataset.plain) return String(Math.round(v));
    if (el.dataset.dec) return v.toFixed(Number(el.dataset.dec)).replace('.', ',');
    const n = Math.round(v);
    return (el.dataset.pad && n < 10 ? '0' + n : String(n)) + (el.dataset.suffix || '');
  };

  const animate = (el) => {
    const target = parseFloat(el.dataset.count);
    if (reduced) { el.textContent = format(el, target); return; }
    const dur = 1500, t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(el, target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (reduced || !('IntersectionObserver' in window)) { nums.forEach(animate); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); } });
  }, { threshold: .6 });
  nums.forEach((n) => io.observe(n));
})();


/* ---------- 9. ESPECIALIDADES ---------- */
(function specs(){
  const tabs = $$('.spec-row');
  const panels = $$('.spec-panel');
  if (!tabs.length) return;
  let current = 0;

  const show = (i) => {
    current = i;
    tabs.forEach((t, n) => {
      const on = n === i;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p, n) => { p.hidden = n !== i; if (n === i) p.classList.add('is-on'); else p.classList.remove('is-on'); });
  };

  const nudge = (el) => {
    const list = el.parentElement;
    if (list.scrollWidth > list.clientWidth + 4) {
      list.scrollTo({ left: el.offsetLeft - 16, behavior: reduced ? 'auto' : 'smooth' });
    }
  };

  // um clique manda: o hover fica suspenso por um instante para não brigar
  let travado = 0;
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => {
      travado = Date.now() + 700;
      show(i); nudge(t);
    });
    if (finePointer) t.addEventListener('mouseenter', () => {
      if (Date.now() < travado) return;
      show(i);
    });
    t.addEventListener('keydown', (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (keys[e.key]) {
        e.preventDefault();
        const next = (current + keys[e.key] + tabs.length) % tabs.length;
        show(next); tabs[next].focus();
      }
      if (e.key === 'Home') { e.preventDefault(); show(0); tabs[0].focus(); }
      if (e.key === 'End') { e.preventDefault(); show(tabs.length - 1); tabs[tabs.length - 1].focus(); }
    });
  });

  window.addEventListener('spec:go', (e) => {
    const i = e.detail;
    if (Number.isInteger(i) && tabs[i]) { show(i); setTimeout(() => tabs[i].focus({ preventScroll: true }), 500); }
  });
})();


/* ---------- 10. LINHA DA JORNADA ---------- */
(function journey(){
  const steps = $('#steps'), fill = $('#stepsFill');
  if (!steps || !fill) return;
  if (reduced) { fill.style.width = '100%'; return; }
  let ticking = false;

  const run = () => {
    const r = steps.getBoundingClientRect();
    const start = window.innerHeight * .85;
    const span = r.height + start - window.innerHeight * .25;
    const p = Math.min(Math.max((start - r.top) / span, 0), 1);
    fill.style.width = (p * 100) + '%';
    ticking = false;
  };

  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
  window.addEventListener('resize', run);
  run();
})();


/* ---------- 10b. RETRATO DO HERO ----------
   Salve a foto da Dra. Fátima como assets/dra-fatima.jpg.
   Sem o arquivo, entra automaticamente a foto da recepção.            */
(function retrato(){
  const img = $('#heroPortrait');
  if (!img) return;
  const cair = () => {
    if (img.dataset.fallback) return;
    img.dataset.fallback = '1';
    img.src = 'assets/marca-parede.jpg';
    img.alt = 'Recepção da Fátima Araújo Clínica Odontológica, em Icaraí';
    img.style.objectPosition = '50% 42%';
  };
  img.addEventListener('error', cair);
  if (img.complete && img.naturalWidth === 0) cair();
})();


/* ---------- 10c. ATALHOS DAS ESPECIALIDADES NO HERO ---------- */
$$('.hero-serv a[data-go]').forEach((a) => {
  a.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('spec:go', { detail: Number(a.dataset.go) }));
  });
});


/* ---------- 11. PARALAXE DO HERO ---------- */
(function parallax(){
  const bg = $('#heroBg'), card = $('#heroCard'), hero = $('#inicio');
  if (!hero || reduced) return;
  let ticking = false;

  const run = () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.4) {
      if (bg) bg.style.setProperty('--py', (y * .16).toFixed(1) + 'px');
      if (card) card.style.setProperty('--cy', (y * -.07).toFixed(1) + 'px');
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
  run();

  // inclinação 3D do cartão conforme o ponteiro
  if (card && finePointer) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg');
      card.style.setProperty('--rx', (-y * 5).toFixed(2) + 'deg');
    });
    hero.addEventListener('pointerleave', () => {
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--rx', '0deg');
    });
  }
})();


/* ---------- 12. MURAL DE DEPOIMENTOS 3D ---------- */
(function wall(){
  const stage = $('#wallStage');
  if (!stage) return;

  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
  const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const card = (item) => {
    const el = document.createElement('article');
    el.className = 'tcard';
    if (item.tipo === 'score') {
      el.className += ' is-score';
      el.innerHTML = `<span class="big">4,7</span>
        <div class="stars" aria-hidden="true">${stars(5)}</div>
        <p>Média de mais de 170 avaliações públicas de pacientes no Google</p>`;
    } else if (item.tipo === 'review') {
      el.innerHTML = `<div class="stars" aria-hidden="true">${stars(item.nota)}</div>
        <blockquote>“${item.texto}”</blockquote>
        <div class="who"><span class="av" aria-hidden="true">${initials(item.nome)}</span>
          <div><b>${item.nome}</b><span>${item.fonte}</span></div></div>`;
    } else if (item.tipo === 'fact') {
      el.className += ' is-fact';
      el.innerHTML = `<span class="kicker"><i aria-hidden="true"></i>A clínica</span>
        <blockquote>${item.titulo}</blockquote>
        <div class="who"><div><span>${item.linha}</span></div></div>`;
    } else {
      el.innerHTML = `<blockquote>Leia as avaliações de quem já passou por aqui.</blockquote>
        <div class="who"><div><a href="${GOOGLE_REVIEWS}" target="_blank" rel="noopener"><b>Ver no Google →</b></a>
        <span>Perfil público da clínica</span></div></div>`;
    }
    return el;
  };

  const cols = 3;
  const speeds = [16, 21, 18];
  const flatQuery = window.matchMedia('(max-width: 900px)');

  const build = () => {
    const flat = flatQuery.matches;
    stage.innerHTML = '';
    stage.parentElement.classList.toggle('is-flat', flat);

    if (flat) {
      const col = document.createElement('div');
      col.className = 'wall-col';
      // duas voltas para o laço horizontal ficar contínuo
      MURAL.concat(MURAL).forEach((item) => col.appendChild(card(item)));
      if (reduced) col.style.animation = 'none';
      stage.appendChild(col);
      return;
    }

    for (let c = 0; c < cols; c++) {
      const col = document.createElement('div');
      col.className = 'wall-col' + (c === 1 ? ' rev' : '');
      col.style.setProperty('--dur', speeds[c] + 's');
      col.setAttribute('aria-hidden', c > 0 ? 'true' : 'false');
      // reparte os cartões entre as colunas: nenhum aparece duas vezes ao mesmo tempo
      let own = MURAL.filter((_, i) => i % cols === c);
      while (own.length < 4) own = own.concat(own);
      own.concat(own).forEach((item) => col.appendChild(card(item)));
      if (reduced) col.style.animation = 'none';
      stage.appendChild(col);
    }
  };

  build();
  flatQuery.addEventListener('change', build);
})();


/* ---------- 13. GALERIA COM LIGHTBOX ---------- */
(function gallery(){
  const figs = $$('.bento .b');
  const dlg = $('#lightbox');
  if (!figs.length || !dlg || !dlg.showModal) return;

  const img = $('#lbImg'), cap = $('#lbCap');
  const shots = figs.map((f) => ({ src: $('img', f).src, alt: $('img', f).alt, cap: $('figcaption span', f)?.textContent || '' }));
  let idx = 0;

  const paint = () => {
    const s = shots[idx];
    img.src = s.src; img.alt = s.alt; cap.textContent = s.cap;
  };
  const open = (i) => { idx = i; paint(); dlg.showModal(); };
  const step = (d) => { idx = (idx + d + shots.length) % shots.length; paint(); };

  figs.forEach((f, i) => {
    f.setAttribute('tabindex', '0');
    f.setAttribute('role', 'button');
    f.setAttribute('aria-label', 'Ampliar foto: ' + shots[i].cap);
    f.addEventListener('click', () => open(i));
    f.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
  });

  $('#lbClose')?.addEventListener('click', () => dlg.close());
  $('#lbPrev')?.addEventListener('click', () => step(-1));
  $('#lbNext')?.addEventListener('click', () => step(1));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
})();


/* ---------- 14. AGENDAMENTO VIA WHATSAPP ---------- */
(function booking(){
  const form = $('#bookForm');
  if (!form) return;
  const nome = $('#fNome'), esp = $('#fEsp'), obs = $('#fObs'), out = $('#previewMsg');
  const btn = $('#slotBtn'), painel = $('#slotPanel'), rotulo = $('#slotLabel');
  const caixaDias = $('#slotDays'), caixaHoras = $('#slotTimes');

  const DIAS = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
  const ABREV = ['dom','seg','ter','qua','qui','sex','sáb'];
  const dois = (n) => String(n).padStart(2, '0');

  let diaSel = null, horaSel = null, aberto = false;

  // próximos 12 dias úteis
  const dias = [];
  const d = new Date(); d.setHours(0, 0, 0, 0);
  while (dias.length < 12) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) dias.push(new Date(d));
  }

  const horas = [];
  for (let h = 9; h <= 17; h++) { horas.push(h + ':00'); if (h < 17) horas.push(h + ':30'); }

  dias.forEach((dia, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'slot-day';
    b.innerHTML = `<i>${ABREV[dia.getDay()]}</i><b>${dois(dia.getDate())}/${dois(dia.getMonth() + 1)}</b>`;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      diaSel = i;
      $$('.slot-day', caixaDias).forEach((o, n) => {
        o.classList.toggle('is-on', n === i);
        o.setAttribute('aria-pressed', String(n === i));
      });
    });
    caixaDias.appendChild(b);
  });

  horas.forEach((h) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'slot-time'; b.textContent = h.replace(':', 'h');
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      horaSel = h;
      $$('.slot-time', caixaHoras).forEach((o) => {
        const on = o === b;
        o.classList.toggle('is-on', on);
        o.setAttribute('aria-pressed', String(on));
      });
    });
    caixaHoras.appendChild(b);
  });

  const abrir = (estado) => {
    aberto = estado;
    btn.setAttribute('aria-expanded', String(estado));
    if (estado) painel.hidden = false;
    else painel.hidden = true;
  };

  btn.addEventListener('click', () => abrir(!aberto));

  $('#slotOk')?.addEventListener('click', () => {
    if (diaSel === null || !horaSel) { toast('Escolha um dia e um horário.'); return; }
    btn.classList.add('is-set');
    rotulo.textContent = textoHorario();
    abrir(false);
    paint();
  });

  $('#slotClear')?.addEventListener('click', () => {
    diaSel = null; horaSel = null;
    $$('.slot-day', caixaDias).forEach((o) => { o.classList.remove('is-on'); o.setAttribute('aria-pressed', 'false'); });
    $$('.slot-time', caixaHoras).forEach((o) => { o.classList.remove('is-on'); o.setAttribute('aria-pressed', 'false'); });
    btn.classList.remove('is-set');
    rotulo.textContent = 'Escolher horário';
    paint();
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && aberto) { abrir(false); btn.focus(); } });

  function textoHorario(){
    if (diaSel === null || !horaSel) return '';
    const dia = dias[diaSel];
    return `${DIAS[dia.getDay()]}, ${dois(dia.getDate())}/${dois(dia.getMonth() + 1)}, às ${horaSel.replace(':', 'h')}`;
  }

  const build = () => {
    const n = nome.value.trim();
    const e = esp.value;
    const o = obs.value.trim();
    const linhas = ['Olá! Vim pelo site da clínica.'];
    linhas.push(n ? `Meu nome é ${n}.` : 'Gostaria de agendar uma consulta.');
    linhas.push(e ? `Tenho interesse em: ${e}.` : 'Gostaria de uma avaliação geral.');
    linhas.push(textoHorario()
      ? `Queria verificar a disponibilidade para ${textoHorario()}.`
      : 'Ainda não escolhi um horário — pode me sugerir as opções livres?');
    if (o) linhas.push(o);
    return linhas.join(String.fromCharCode(10));
  };

  const paint = () => { out.textContent = build(); };
  ['input', 'change'].forEach((ev) => form.addEventListener(ev, paint));
  paint();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (nome.value.trim().length < 2) {
      nome.classList.add('is-bad');
      nome.focus();
      toast('Digite seu nome para continuar.');
      return;
    }
    nome.classList.remove('is-bad');
    const url = `${WA}?text=${encodeURIComponent(build())}`;
    const win = window.open(url, '_blank', 'noopener');
    if (!win) window.location.href = url;
  });

  nome.addEventListener('input', () => nome.classList.remove('is-bad'));
})();


/* ---------- 15. COPIAR DADOS DE CONTATO ---------- */
let toastTimer = null;
function toast(msg){
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), 2600);
}

$$('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = 'copiado';
      toast('Copiado para a área de transferência.');
      setTimeout(() => { btn.textContent = 'copiar'; }, 2000);
    } catch {
      toast('Não foi possível copiar automaticamente.');
    }
  });
});


/* ---------- 16. MAPA SOB DEMANDA ---------- */
(function map(){
  const btn = $('#loadMap'), card = $('#mapCard'), facade = $('#mapFacade');
  if (!btn || !card) return;
  btn.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = 'https://maps.google.com/maps?q=F%C3%A1tima%20Ara%C3%BAjo%20Cl%C3%ADnica%20Odontol%C3%B3gica%2C%20Rua%20%C3%81lvares%20de%20Azevedo%2C%20252%2C%20Icara%C3%AD%2C%20Niter%C3%B3i%20-%20RJ&z=17&output=embed';
    frame.title = 'Mapa com a localização da clínica em Icaraí, Niterói';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    card.appendChild(frame);
    facade?.remove();
  });
})();


/* ---------- 17. BOTÕES MAGNÉTICOS ---------- */
if (finePointer && !reduced) {
  $$('.btn-primary').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .14;
      const y = (e.clientY - r.top - r.height / 2) * .22;
      btn.style.transform = `translate(${x.toFixed(1)}px, ${(y - 2).toFixed(1)}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
}


/* ---------- 18. DETALHES ---------- */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// rolagem suave respeitando o cabeçalho fixo
$$('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const head = document.getElementById('head');
    const offset = (head && getComputedStyle(head).position === 'sticky') ? head.offsetHeight + 10 : 12;
    const top = target.getBoundingClientRect().top + window.scrollY - (target.id === 'inicio' ? 0 : offset);
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  });
});

// apenas uma pergunta aberta por vez
const faq = $('#faq');
faq?.addEventListener('toggle', (e) => {
  const d = e.target;
  if (d.tagName === 'DETAILS' && d.open) {
    $$('details', faq).forEach((o) => { if (o !== d) o.open = false; });
  }
}, true);

})();
