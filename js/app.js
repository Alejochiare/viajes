/**
 * app.js — Lógica de la landing de MARA Viajes y Turismo
 * ========================================================
 * Cursor personalizado, animaciones editoriales, CRUD display,
 * búsqueda en tiempo real, modal dramático, paginación.
 */
'use strict';

const PER_PAGE = 6;

const State = {
  filter: 'all',
  sort: 'default',
  query: '',
  page: 1,
};

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNav();
  initHamburger();
  initSearch();
  initFilters();
  initSort();
  renderTrips();
  renderOffers();
  renderTestimonials();
  initContactForm();
  initModal();
  initScrollAnimations();
  initTickerPause();
});

/* ── CURSOR PERSONALIZADO ── */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const dot    = document.getElementById('cursor-dot');
  if (!cursor || window.matchMedia('(pointer:coarse)').matches) return;

  let mx=0, my=0, cx=0, cy=0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx+'px';
    dot.style.top  = my+'px';
  });

  function animCursor() {
    cx += (mx-cx)*.12;
    cy += (my-cy)*.12;
    cursor.style.left = cx+'px';
    cursor.style.top  = cy+'px';
    requestAnimationFrame(animCursor);
  }
  animCursor();

  // Expandir sobre links y botones
  document.querySelectorAll('a, button, .trip-card, .offer-strip').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('expand'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
  });
}

/* ── NAVBAR ── */
function initNav() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  const links = document.querySelectorAll('.nl');
  const sections = document.querySelectorAll('section[id]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.nl[href="#${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { rootMargin:'-40% 0px -40% 0px' });
  sections.forEach(s => io.observe(s));
}

function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  if (!btn) return;
  btn.addEventListener('click', () => {
    links.classList.toggle('open');
    btn.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    btn.classList.remove('open');
  }));
}

/* ── BÚSQUEDA ── */
function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;
  input.addEventListener('input', () => {
    State.query = input.value.trim().toLowerCase();
    State.page  = 1;
    renderTrips();
  });
}

/* ── FILTROS ── */
function initFilters() {
  document.getElementById('filters')?.addEventListener('click', e => {
    const btn = e.target.closest('.fb');
    if (!btn) return;
    document.querySelectorAll('.fb').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    State.filter = btn.dataset.filter;
    State.page   = 1;
    renderTrips();
  });
}

/* ── SORT ── */
function initSort() {
  document.getElementById('price-sort')?.addEventListener('change', e => {
    State.sort = e.target.value;
    State.page = 1;
    renderTrips();
  });
}

/* ── HELPER: FILTRAR ── */
function getFiltered() {
  let t = DataStore.getAll();
  if (State.filter !== 'all') t = t.filter(x => x.destination === State.filter);
  if (State.query) t = t.filter(x =>
    x.name.toLowerCase().includes(State.query) ||
    x.description.toLowerCase().includes(State.query) ||
    x.destination.toLowerCase().includes(State.query)
  );
  if (State.sort === 'asc')  t.sort((a,b) => a.price - b.price);
  if (State.sort === 'desc') t.sort((a,b) => b.price - a.price);
  return t;
}

/* ── RENDER VIAJES (LAYOUT MASONRY EDITORIAL) ── */
function renderTrips() {
  const grid  = document.getElementById('trips-grid');
  const count = document.getElementById('results-count');
  if (!grid) return;

  const filtered = getFiltered();
  const total    = filtered.length;
  const totalPages = Math.ceil(total / PER_PAGE) || 1;
  State.page = Math.min(State.page, totalPages);
  const start = (State.page-1) * PER_PAGE;
  const page  = filtered.slice(start, start+PER_PAGE);

  if (count) count.textContent = `${total} viaje${total!==1?'s':''}`;

  if (!page.length) {
    grid.innerHTML = `<div class="empty-state">
      <p>Sin resultados para "${State.query || State.filter}"</p>
      <button onclick="State.query='';State.filter='all';document.getElementById('search-input').value='';document.querySelectorAll('.fb').forEach(b=>b.classList.remove('active'));document.querySelector('.fb').classList.add('active');renderTrips()">Limpiar filtros</button>
    </div>`;
    renderPagination(0,1);
    return;
  }

  // Layout alternado: cards grandes + medianas + small
  grid.innerHTML = page.map((trip, i) => createCard(trip, i)).join('');

  // Animación de entrada escalonada
  grid.querySelectorAll('.trip-card').forEach((card, i) => {
    card.style.setProperty('--delay', `${i*0.08}s`);
    card.classList.add('card-reveal');
  });

  grid.querySelectorAll('.btn-ver').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.id));
  });

  // Re-init cursor hover
  grid.querySelectorAll('.trip-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.getElementById('cursor')?.classList.add('expand'));
    el.addEventListener('mouseleave', () => document.getElementById('cursor')?.classList.remove('expand'));
  });

  renderPagination(total, totalPages);
}

/** Genera una card con variación de tamaño según posición */
function createCard(trip, idx) {
  const isBig  = idx === 0;
  const isMed  = idx === 1 || idx === 4;
  const cls    = isBig ? 'tc-big' : isMed ? 'tc-med' : 'tc-sm';
  const final  = trip.isOffer ? Math.round(trip.price * (1 - trip.discount/100)) : trip.price;
  const destColor = destColors[trip.destination] || '#a3e635';
  const stars  = '★'.repeat(Math.round(trip.rating||4));

  return `
  <article class="trip-card ${cls}" data-dest="${trip.destination}">
    <div class="tc-img" style="background-image:url('${trip.image}')" role="img" aria-label="${trip.name}">
      ${trip.isOffer ? `<span class="tc-badge">-${trip.discount}%</span>` : ''}
      <span class="tc-dest-pill" style="--dc:${destColor}">${destLabel(trip.destination)}</span>
    </div>
    <div class="tc-body">
      <div class="tc-top">
        <span class="tc-stars">${stars}</span>
        <span class="tc-dur">${trip.duration||'7 noches'}</span>
      </div>
      <h3 class="tc-name">${trip.name}</h3>
      ${isBig||isMed ? `<p class="tc-desc">${trip.description.slice(0,100)}…</p>` : ''}
      <div class="tc-foot">
        <div class="tc-price">
          ${trip.isOffer?`<s>USD ${trip.price.toLocaleString()}</s>`:''}
          <strong>USD ${final.toLocaleString()}</strong>
        </div>
        <button class="btn-ver" data-id="${trip.id}">Ver →</button>
      </div>
    </div>
  </article>`;
}

const destColors = { caribe:'#fb923c', europa:'#a3e635', america:'#f472b6', asia:'#34d399', crucero:'#60a5fa' };
function destLabel(d) {
  return { caribe:'Caribe', europa:'Europa', america:'América', asia:'Asia', crucero:'Crucero' }[d] || d;
}

/* ── PAGINACIÓN ── */
function renderPagination(total, totalPages) {
  const el = document.getElementById('pagination');
  if (!el || totalPages <= 1) { if(el) el.innerHTML=''; return; }

  let h = `<button class="pb" ${State.page===1?'disabled':''} data-page="${State.page-1}">←</button>`;
  for (let i=1; i<=totalPages; i++) {
    h += `<button class="pb ${i===State.page?'active':''}" data-page="${i}">${i}</button>`;
  }
  h += `<button class="pb" ${State.page===totalPages?'disabled':''} data-page="${State.page+1}">→</button>`;
  el.innerHTML = h;

  el.querySelectorAll('.pb:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      State.page = parseInt(btn.dataset.page);
      renderTrips();
      document.getElementById('destinos').scrollIntoView({behavior:'smooth'});
    });
  });
}

/* ── OFERTAS — TIRAS DRAMÁTICAS ── */
function renderOffers() {
  const grid = document.getElementById('offers-grid');
  if (!grid) return;
  const offers = DataStore.getAll().filter(t => t.isOffer).slice(0,5);

  if (!offers.length) {
    grid.innerHTML = '<p class="no-offers">No hay ofertas activas.</p>';
    return;
  }

  grid.innerHTML = offers.map((t,i) => {
    const final = Math.round(t.price*(1-t.discount/100));
    const big   = i === 0;
    return `
    <div class="offer-strip ${big?'os-big':''}" data-id="${t.id}">
      <div class="os-img" style="background-image:url('${t.image}')"></div>
      <div class="os-content">
        <div class="os-tag">${destLabel(t.destination)}</div>
        <h3>${t.name}</h3>
        ${big?`<p>${t.description.slice(0,90)}…</p>`:''}
        <div class="os-prices">
          <s>USD ${t.price.toLocaleString()}</s>
          <strong>USD ${final.toLocaleString()}</strong>
          <span class="os-save">Ahorrás USD ${(t.price-final).toLocaleString()}</span>
        </div>
      </div>
      <div class="os-pct">-${t.discount}%<span>OFF</span></div>
      <button class="os-btn btn-ver" data-id="${t.id}">Consultar →</button>
    </div>`;
  }).join('');

  grid.querySelectorAll('.btn-ver, .offer-strip').forEach(el => {
    el.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id || e.currentTarget.closest('[data-id]')?.dataset.id;
      if (id) openModal(id);
    });
  });
}

/* ── TESTIMONIOS ── */
function renderTestimonials() {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;
  grid.innerHTML = TESTIMONIALS.map((t,i) => `
    <div class="testi-card ${i===0?'tc-featured':''}">
      <div class="tc-rating">${'★'.repeat(t.rating)}</div>
      <blockquote>"${t.text}"</blockquote>
      <footer>
        <div class="tca">${t.initials}</div>
        <div>
          <strong>${t.name}</strong>
          <span>${t.location} · ${t.trip}</span>
        </div>
      </footer>
    </div>`
  ).join('');
}

/* ── MODAL ── */
function initModal() {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', e => { if(e.target===overlay) closeModal(); });
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });
}

function openModal(id) {
  const trip = DataStore.getById(id);
  if (!trip) return;
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  const final   = trip.isOffer ? Math.round(trip.price*(1-trip.discount/100)) : trip.price;
  const inc     = (trip.includes||[]).map(i=>`<li>${i}</li>`).join('');

  content.innerHTML = `
    <div class="modal-img" style="background-image:url('${trip.image}')">
      ${trip.isOffer?`<span class="modal-badge">-${trip.discount}% OFF</span>`:''}
    </div>
    <div class="modal-info">
      <span class="modal-dest-tag" style="--dc:${destColors[trip.destination]||'#a3e635'}">${destLabel(trip.destination)}</span>
      <h2>${trip.name}</h2>
      <div class="modal-meta">
        <span>⭐ ${trip.rating||4.9}</span>
        <span>⏱ ${trip.duration||'7 noches'}</span>
      </div>
      <p>${trip.description}</p>
      ${inc?`<ul class="modal-inc">${inc}</ul>`:''}
      <div class="modal-price-row">
        <div>
          ${trip.isOffer?`<s>USD ${trip.price.toLocaleString()}</s>`:''}
          <strong class="modal-price-final">USD ${final.toLocaleString()}</strong>
          <span>por persona</span>
        </div>
        <a href="https://wa.me/5493564688545?text=Hola!%20Me%20interesa%20el%20viaje%20${encodeURIComponent(trip.name)}" 
           target="_blank" class="btn-modal-wa">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Consultar por WhatsApp
        </a>
      </div>
    </div>`;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}
window.closeModal = closeModal;

/* ── FORMULARIO DE CONTACTO ── */
function initContactForm() {
  document.getElementById('contact-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const name    = document.getElementById('cf-name').value.trim();
    const contact = document.getElementById('cf-contact').value.trim();
    const message = document.getElementById('cf-message').value.trim();
    const fb      = document.getElementById('cf-feedback');

    if (!name || !contact || !message) {
      fb.textContent = 'Completá los campos obligatorios.';
      fb.className   = 'cf-feedback error';
      return;
    }

    fb.textContent = '✅ ¡Mensaje enviado! Te contactamos en breve.';
    fb.className   = 'cf-feedback success';
    e.target.reset();
    setTimeout(() => { fb.textContent=''; fb.className='cf-feedback'; }, 5000);
  });
}

/* ── ANIMACIONES SCROLL ── */
function initScrollAnimations() {
  const targets = document.querySelectorAll('.section, .about-split, .contact-layout, .testi-card, .offer-strip');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
    });
  }, { threshold: 0.07 });
  targets.forEach(t => io.observe(t));
}

/* ── PAUSA EL TICKER EN HOVER ── */
function initTickerPause() {
  const bar = document.querySelector('.ticker-bar');
  if (!bar) return;
  bar.addEventListener('mouseenter', () => bar.style.setProperty('--play','paused'));
  bar.addEventListener('mouseleave', () => bar.style.setProperty('--play','running'));
}

/* ── TOAST ── */
function showToast(msg, type='ok') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => t.classList.remove('show'), 3000);
}
window.showToast = showToast;
