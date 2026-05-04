/**
 * MARA VIAJES Y TURISMO
 * viajes.js - Listado, filtros y búsqueda de viajes
 */

let todosLosViajes = [];
let filtrosActivos = { destino: '', oferta: false, precioMax: 9999, orden: 'precio-asc' };

document.addEventListener('DOMContentLoaded', () => {
  Storage.init();
  todosLosViajes = Storage.getViajes();
  initNavbar();
  leerParamsURL();
  popularFiltros();
  renderViajes();
  initFiltros();
  initBuscadorRealTime();
  initLoader();
});

function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  setTimeout(() => loader.classList.add('hidden'), 600);
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

function leerParamsURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('destino')) {
    filtrosActivos.destino = params.get('destino');
    const input = document.getElementById('filtro-busqueda');
    if (input) input.value = params.get('destino');
  }
  if (params.get('oferta') === 'true') {
    filtrosActivos.oferta = true;
    const chk = document.getElementById('filtro-oferta');
    if (chk) chk.checked = true;
  }
}

function popularFiltros() {
  const selectDestino = document.getElementById('filtro-destino');
  if (!selectDestino) return;
  const destinos = [...new Set(todosLosViajes.map(v => v.destino))].sort();
  destinos.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    if (filtrosActivos.destino === d) opt.selected = true;
    selectDestino.appendChild(opt);
  });

  const maxPrecio = Math.max(...todosLosViajes.map(v => v.precio));
  const slider = document.getElementById('filtro-precio');
  if (slider) {
    slider.max = maxPrecio + 500;
    slider.value = slider.max;
    filtrosActivos.precioMax = parseInt(slider.max);
    document.getElementById('precio-label').textContent = `Hasta USD ${slider.max.toLocaleString()}`;
  }
}

function initFiltros() {
  const selectDestino = document.getElementById('filtro-destino');
  const chkOferta = document.getElementById('filtro-oferta');
  const slider = document.getElementById('filtro-precio');
  const selectOrden = document.getElementById('filtro-orden');
  const btnReset = document.getElementById('btn-reset-filtros');

  selectDestino?.addEventListener('change', () => {
    filtrosActivos.destino = selectDestino.value;
    renderViajes();
  });

  chkOferta?.addEventListener('change', () => {
    filtrosActivos.oferta = chkOferta.checked;
    renderViajes();
  });

  slider?.addEventListener('input', () => {
    filtrosActivos.precioMax = parseInt(slider.value);
    document.getElementById('precio-label').textContent = `Hasta USD ${parseInt(slider.value).toLocaleString()}`;
    renderViajes();
  });

  selectOrden?.addEventListener('change', () => {
    filtrosActivos.orden = selectOrden.value;
    renderViajes();
  });

  btnReset?.addEventListener('click', () => {
    filtrosActivos = { destino: '', oferta: false, precioMax: 99999, orden: 'precio-asc' };
    selectDestino.value = '';
    chkOferta.checked = false;
    slider.value = slider.max;
    selectOrden.value = 'precio-asc';
    document.getElementById('precio-label').textContent = `Hasta USD ${parseInt(slider.max).toLocaleString()}`;
    document.getElementById('filtro-busqueda').value = '';
    renderViajes();
  });
}

function initBuscadorRealTime() {
  const input = document.getElementById('filtro-busqueda');
  if (!input) return;
  input.addEventListener('input', () => {
    filtrosActivos.textoBusqueda = input.value.toLowerCase();
    renderViajes();
  });
}

function aplicarFiltros(viajes) {
  return viajes
    .filter(v => {
      const matchDestino = !filtrosActivos.destino || v.destino === filtrosActivos.destino;
      const matchOferta = !filtrosActivos.oferta || v.oferta;
      const precioBruto = v.oferta ? Math.round(v.precio * (1 - v.descuento / 100)) : v.precio;
      const matchPrecio = precioBruto <= filtrosActivos.precioMax;
      const matchTexto = !filtrosActivos.textoBusqueda ||
        v.nombre.toLowerCase().includes(filtrosActivos.textoBusqueda) ||
        v.destino.toLowerCase().includes(filtrosActivos.textoBusqueda) ||
        v.descripcion.toLowerCase().includes(filtrosActivos.textoBusqueda);
      return matchDestino && matchOferta && matchPrecio && matchTexto;
    })
    .sort((a, b) => {
      const pa = a.oferta ? Math.round(a.precio * (1 - a.descuento / 100)) : a.precio;
      const pb = b.oferta ? Math.round(b.precio * (1 - b.descuento / 100)) : b.precio;
      if (filtrosActivos.orden === 'precio-asc') return pa - pb;
      if (filtrosActivos.orden === 'precio-desc') return pb - pa;
      if (filtrosActivos.orden === 'nombre') return a.nombre.localeCompare(b.nombre);
      return 0;
    });
}

function renderViajes() {
  const container = document.getElementById('viajes-grid');
  const countEl = document.getElementById('resultado-count');
  if (!container) return;

  const filtrados = aplicarFiltros(todosLosViajes);

  if (countEl) countEl.textContent = `${filtrados.length} viaje${filtrados.length !== 1 ? 's' : ''} encontrado${filtrados.length !== 1 ? 's' : ''}`;

  if (filtrados.length === 0) {
    container.innerHTML = `
      <div class="no-resultados">
        <div class="no-resultados-icon">✈️</div>
        <h3>No encontramos viajes con esos filtros</h3>
        <p>Intentá con otros criterios o explorá todos nuestros destinos.</p>
        <button onclick="document.getElementById('btn-reset-filtros').click()" class="btn-primary">Ver todos los viajes</button>
      </div>`;
    return;
  }

  container.innerHTML = filtrados.map(v => cardViajeListado(v)).join('');

  // Animate in
  const cards = container.querySelectorAll('.card-listado');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, i * 80);
  });
}

function cardViajeListado(v) {
  const precioFinal = v.oferta ? Math.round(v.precio * (1 - v.descuento / 100)) : v.precio;
  const badge = v.oferta ? `<span class="badge-oferta-list">-${v.descuento}%</span>` : '';

  return `
    <article class="card-listado" onclick="irADetalle(${v.id})">
      <div class="card-listado-img">
        <img src="${v.imagen}" alt="${v.nombre}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80'">
        ${badge}
      </div>
      <div class="card-listado-body">
        <div class="card-listado-top">
          <span class="tag-destino">${v.destino}</span>
          <span class="tag-duracion">⏱ ${v.duracion}</span>
        </div>
        <h3>${v.nombre}</h3>
        <p>${v.descripcion.substring(0, 120)}…</p>
        <div class="card-listado-incluye">
          ${(v.incluye || []).slice(0, 3).map(i => `<span>✓ ${i}</span>`).join('')}
        </div>
      </div>
      <div class="card-listado-precio">
        <div class="salidas-label">Salidas: <strong>${v.salidas}</strong></div>
        ${v.oferta ? `<div class="precio-tachado">USD ${v.precio.toLocaleString()}</div>` : ''}
        <div class="precio-grande">USD ${precioFinal.toLocaleString()}</div>
        <small>por persona</small>
        <button class="btn-ver-detalle" onclick="event.stopPropagation(); irADetalle(${v.id})">Ver viaje →</button>
      </div>
    </article>
  `;
}

function irADetalle(id) {
  window.location.href = `detalle.html?id=${id}`;
}
