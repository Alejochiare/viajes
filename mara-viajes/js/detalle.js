/**
 * MARA VIAJES Y TURISMO
 * detalle.js - Página de detalle de viaje
 */

document.addEventListener('DOMContentLoaded', () => {
  Storage.init();
  initNavbar();
  cargarDetalle();
  initLoader();
});

function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  setTimeout(() => loader.classList.add('hidden'), 700);
}

function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
  toggle?.addEventListener('click', () => navLinks.classList.toggle('open'));
}

function cargarDetalle() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    window.location.href = 'viajes.html';
    return;
  }

  const viaje = Storage.getViajeById(id);

  if (!viaje) {
    document.getElementById('detalle-content').innerHTML = `
      <div style="text-align:center; padding: 100px 20px;">
        <div style="font-size:3rem; margin-bottom:16px">😕</div>
        <h2>Viaje no encontrado</h2>
        <p style="margin: 12px 0 24px; color: var(--gris-80)">El viaje que buscás no existe o fue eliminado.</p>
        <a href="viajes.html" class="btn-primary">Ver todos los viajes</a>
      </div>`;
    return;
  }

  document.title = `${viaje.nombre} – Mara Viajes y Turismo`;
  renderDetalle(viaje);
  renderMasViajes(viaje.id, viaje.destino);
}

function renderDetalle(v) {
  const precioFinal = v.oferta ? Math.round(v.precio * (1 - v.descuento / 100)) : v.precio;
  const ahorro = v.oferta ? (v.precio - precioFinal) : 0;

  const container = document.getElementById('detalle-content');

  container.innerHTML = `
    <!-- Hero -->
    <div class="detalle-hero">
      <img class="detalle-hero-img" src="${v.imagen}" alt="${v.nombre}" onerror="this.src='https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920&q=70'">
      <div class="detalle-hero-overlay"></div>
      <div class="detalle-hero-content">
        <div class="detalle-hero-text">
          <div class="detalle-breadcrumb">
            <a href="index.html">Inicio</a> › 
            <a href="viajes.html">Destinos</a> › 
            <span>${v.nombre}</span>
          </div>
          <div class="tag-destino-hero">${v.destino}</div>
          <h1>${v.nombre}</h1>
        </div>
        ${v.oferta ? `<div class="detalle-badge-oferta">🔥 Oferta -${v.descuento}%</div>` : ''}
      </div>
    </div>

    <!-- Layout -->
    <div class="detalle-layout">

      <!-- Contenido -->
      <div class="detalle-main">
        <div class="detalle-meta">
          <div class="meta-item">✈️ <strong>Destino:</strong>&nbsp;${v.destino}</div>
          ${v.duracion ? `<div class="meta-item">⏱ <strong>Duración:</strong>&nbsp;${v.duracion}</div>` : ''}
          ${v.salidas ? `<div class="meta-item">📅 <strong>Salidas:</strong>&nbsp;${v.salidas}</div>` : ''}
        </div>

        <div class="detalle-section">
          <h2>Descripción</h2>
          <p class="detalle-desc">${v.descripcion}</p>
        </div>

        ${v.incluye && v.incluye.length > 0 ? `
        <div class="detalle-section">
          <h2>¿Qué incluye?</h2>
          <div class="incluye-grid">
            ${v.incluye.map(i => `<div class="incluye-item">${i}</div>`).join('')}
          </div>
        </div>
        ` : ''}

        <div class="detalle-section">
          <h2>¿Por qué elegirnos?</h2>
          <div class="incluye-grid">
            <div class="incluye-item">Atención personalizada</div>
            <div class="incluye-item">Agencia oficial habilitada</div>
            <div class="incluye-item">Precios competitivos</div>
            <div class="incluye-item">Más de 500 familias viajadas</div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="detalle-sidebar">
        <div class="precio-card">
          <div class="precio-card-label">Precio por persona</div>
          ${v.oferta ? `<div class="precio-card-original">USD ${v.precio.toLocaleString()}</div>` : ''}
          <div class="precio-card-final">USD ${precioFinal.toLocaleString()}</div>
          <div class="precio-card-pp">por persona / ida y vuelta</div>
          ${v.oferta ? `
          <div class="precio-ahorro">
            🎉 Ahorrás USD ${ahorro.toLocaleString()} por persona
          </div>` : ''}

          <a href="https://wa.me/5493564688545?text=${encodeURIComponent(`Hola Mara! Me interesa el viaje a ${v.nombre} (${v.destino}). ¿Podés darme más información?`)}" target="_blank" rel="noopener" class="btn-reservar-whatsapp">
            💬 Consultar por WhatsApp
          </a>
          <a href="tel:035640498375" class="btn-consultar">
            📞 Llamar: (03564) 498375
          </a>

          <div class="precio-card-info">
            ${v.duracion ? `<div class="info-row"><span>Duración</span><span>${v.duracion}</span></div>` : ''}
            ${v.salidas ? `<div class="info-row"><span>Salidas</span><span>${v.salidas}</span></div>` : ''}
            <div class="info-row"><span>Destino</span><span>${v.destino}</span></div>
          </div>
          <div class="precio-garantia">🔒 Agencia oficial habilitada · E.V.T. Leg. 13.989</div>
        </div>
      </aside>
    </div>
  `;
}

function renderMasViajes(idActual, destino) {
  const container = document.getElementById('mas-viajes-grid');
  if (!container) return;

  const otros = Storage.getViajes()
    .filter(v => v.id !== parseInt(idActual))
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  container.innerHTML = otros.map(v => {
    const precioFinal = v.oferta ? Math.round(v.precio * (1 - v.descuento / 100)) : v.precio;
    return `
      <article class="card-viaje" onclick="window.location.href='detalle.html?id=${v.id}'">
        <div class="card-img-wrap">
          <img src="${v.imagen}" alt="${v.nombre}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80'">
          ${v.oferta ? `<span class="badge-oferta">-${v.descuento}%</span>` : ''}
          <div class="card-overlay"><span>Ver detalles →</span></div>
        </div>
        <div class="card-body">
          <div class="card-destino">${v.destino}</div>
          <h3 class="card-titulo">${v.nombre}</h3>
          <div class="card-footer-row">
            <div class="card-precio">
              ${v.oferta ? `<span class="precio-original">USD ${v.precio.toLocaleString()}</span>` : ''}
              <span class="precio-final">USD ${precioFinal.toLocaleString()}</span>
            </div>
            <button class="btn-card">Ver más</button>
          </div>
        </div>
      </article>`;
  }).join('');
}
