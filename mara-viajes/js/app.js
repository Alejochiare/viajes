/**
 * MARA VIAJES Y TURISMO
 * app.js - Lógica del home / landing page
 */

document.addEventListener('DOMContentLoaded', () => {
  Storage.init();
  initNavbar();
  renderDestacados();
  renderOfertas();
  renderTestimonios();
  initBuscador();
  initLoader();
});

/* ── Loader ── */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('hidden');
  }, 900);
}

/* ── Navbar sticky + toggle ── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  toggle?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

/* ── Render Destacados ── */
function renderDestacados() {
  const container = document.getElementById('destacados-grid');
  if (!container) return;

  const viajes = Storage.getViajes().filter(v => v.destacado).slice(0, 4);

  container.innerHTML = viajes.map(v => cardViaje(v)).join('');
  animateCards(container);
}

/* ── Render Ofertas ── */
function renderOfertas() {
  const container = document.getElementById('ofertas-grid');
  if (!container) return;

  const ofertas = Storage.getViajes().filter(v => v.oferta).slice(0, 3);

  container.innerHTML = ofertas.map(v => cardOferta(v)).join('');
}

/* ── Card Viaje ── */
function cardViaje(v) {
  const precioFinal = v.oferta ? Math.round(v.precio * (1 - v.descuento / 100)) : v.precio;
  const badge = v.oferta ? `<span class="badge-oferta">-${v.descuento}%</span>` : '';

  return `
    <article class="card-viaje" onclick="irADetalle(${v.id})">
      <div class="card-img-wrap">
        <img src="${v.imagen}" alt="${v.nombre}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80'">
        ${badge}
        <div class="card-overlay">
          <span>Ver detalles →</span>
        </div>
      </div>
      <div class="card-body">
        <div class="card-destino">${v.destino}</div>
        <h3 class="card-titulo">${v.nombre}</h3>
        <p class="card-desc">${v.descripcion.substring(0, 90)}…</p>
        <div class="card-footer-row">
          <div class="card-precio">
            ${v.oferta ? `<span class="precio-original">USD ${v.precio.toLocaleString()}</span>` : ''}
            <span class="precio-final">USD ${precioFinal.toLocaleString()}</span>
            <small>por persona</small>
          </div>
          <button class="btn-card" onclick="event.stopPropagation(); irADetalle(${v.id})">Ver más</button>
        </div>
      </div>
    </article>
  `;
}

/* ── Card Oferta ── */
function cardOferta(v) {
  const precioFinal = Math.round(v.precio * (1 - v.descuento / 100));
  return `
    <article class="card-oferta" onclick="irADetalle(${v.id})">
      <div class="oferta-img">
        <img src="${v.imagen}" alt="${v.nombre}" onerror="this.src='https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80'">
        <div class="oferta-badge">HOT DEAL -${v.descuento}%</div>
      </div>
      <div class="oferta-info">
        <span class="oferta-destino">${v.destino}</span>
        <h3>${v.nombre}</h3>
        <p>${v.descripcion.substring(0, 80)}…</p>
        <div class="oferta-precio-row">
          <div>
            <s>USD ${v.precio.toLocaleString()}</s>
            <strong>USD ${precioFinal.toLocaleString()}</strong>
          </div>
          <button class="btn-reservar-sm">Reservar</button>
        </div>
      </div>
    </article>
  `;
}

/* ── Testimonios ── */
function renderTestimonios() {
  const testimonios = [
    { nombre: 'Martina G.', avatar: 'MG', texto: 'Increíble experiencia en Punta Cana. Mara Viajes organizó todo perfecto, desde el vuelo hasta cada detalle del hotel. ¡Ya estoy planeando el próximo!', destino: 'Punta Cana', estrellas: 5 },
    { nombre: 'Familia Olimpieri', avatar: 'FO', texto: 'Viajamos con toda la familia a Punta Cana y fue mágico. La atención de Mara fue excelente, siempre disponible para cualquier consulta.', destino: 'Punta Cana', estrellas: 5 },
    { nombre: 'Bel, Anto y Ninna', avatar: 'BN', texto: 'Bayahibe nos robó el corazón. Las excursiones, el hotel, todo impecable. Gracias a Mara Viajes por hacer posible este sueño.', destino: 'Bayahibe', estrellas: 5 },
    { nombre: 'Roberto S.', avatar: 'RS', texto: 'Muy buena agencia. Serios, responsables y con precios competitivos. El paquete a Brasil superó todas mis expectativas.', destino: 'Brasil', estrellas: 5 },
  ];

  const container = document.getElementById('testimonios-grid');
  if (!container) return;

  container.innerHTML = testimonios.map(t => `
    <div class="testimonio-card">
      <div class="test-header">
        <div class="test-avatar">${t.avatar}</div>
        <div>
          <strong>${t.nombre}</strong>
          <span>${t.destino}</span>
        </div>
      </div>
      <div class="test-estrellas">${'★'.repeat(t.estrellas)}</div>
      <p>"${t.texto}"</p>
    </div>
  `).join('');
}

/* ── Buscador ── */
function initBuscador() {
  const form = document.getElementById('buscador-form');
  if (!form) return;

  // Autocomplete de destinos
  const inputDestino = document.getElementById('buscar-destino');
  const destinos = [...new Set(Storage.getViajes().map(v => v.destino))];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const destino = inputDestino.value.trim();
    const fecha = document.getElementById('buscar-fecha').value;
    const params = new URLSearchParams();
    if (destino) params.set('destino', destino);
    if (fecha) params.set('fecha', fecha);
    window.location.href = `viajes.html?${params.toString()}`;
  });
}

/* ── Helpers ── */
function irADetalle(id) {
  window.location.href = `detalle.html?id=${id}`;
}

function animateCards(container) {
  const cards = container.querySelectorAll('.card-viaje, .card-oferta');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, i * 100);
  });
}

/* ── Toast ── */
function showToast(msg, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
