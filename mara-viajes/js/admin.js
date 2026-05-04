/**
 * MARA VIAJES Y TURISMO
 * admin.js - Panel de administración completo
 */

let editandoId = null;
let vistaActual = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
  Storage.init();
  checkAuth();
  initLogin();
});

/* ── Auth ── */
function checkAuth() {
  if (Storage.isAdminLogged()) {
    mostrarPanel();
  } else {
    mostrarLogin();
  }
}

function mostrarLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-panel').style.display = 'none';
}

function mostrarPanel() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'grid';
  initPanel();
}

function initLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const btn = form.querySelector('button[type="submit"]');

    btn.textContent = 'Verificando…';
    btn.disabled = true;

    setTimeout(() => {
      if (Storage.loginAdmin(user, pass)) {
        mostrarPanel();
      } else {
        showAdminToast('Usuario o contraseña incorrectos', 'error');
        btn.textContent = 'Ingresar';
        btn.disabled = false;
        document.getElementById('login-pass').value = '';
      }
    }, 600);
  });
}

/* ── Panel ── */
function initPanel() {
  initSidebar();
  navigateTo('dashboard');
}

function initSidebar() {
  const items = document.querySelectorAll('.sidebar-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      navigateTo(item.dataset.view);
    });
  });

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    Storage.logoutAdmin();
    mostrarLogin();
  });
}

function navigateTo(view) {
  vistaActual = view;
  const views = document.querySelectorAll('.admin-view');
  views.forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${view}`)?.classList.add('active');

  document.querySelectorAll('.sidebar-item').forEach(i => {
    i.classList.toggle('active', i.dataset.view === view);
  });

  if (view === 'dashboard') renderDashboard();
  if (view === 'viajes') renderAdminViajes();
  if (view === 'nuevo') abrirFormNuevo();
}

/* ── Dashboard ── */
function renderDashboard() {
  const viajes = Storage.getViajes();
  const ofertas = viajes.filter(v => v.oferta);
  const precioPromedio = viajes.length ? Math.round(viajes.reduce((s, v) => s + v.precio, 0) / viajes.length) : 0;
  const masBarato = viajes.length ? Math.min(...viajes.map(v => v.precio)) : 0;

  document.getElementById('stat-total').textContent = viajes.length;
  document.getElementById('stat-ofertas').textContent = ofertas.length;
  document.getElementById('stat-promedio').textContent = `USD ${precioPromedio.toLocaleString()}`;
  document.getElementById('stat-minimo').textContent = `USD ${masBarato.toLocaleString()}`;

  // Gráfico por destino (barras SVG)
  const destinos = {};
  viajes.forEach(v => {
    destinos[v.destino] = (destinos[v.destino] || 0) + 1;
  });

  const chartContainer = document.getElementById('chart-destinos');
  if (!chartContainer) return;

  const entries = Object.entries(destinos).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(e => e[1]));

  chartContainer.innerHTML = entries.map(([dest, count]) => `
    <div class="chart-bar-row">
      <span class="chart-label">${dest}</span>
      <div class="chart-bar-wrap">
        <div class="chart-bar" style="width: ${(count / max) * 100}%">
          <span>${count}</span>
        </div>
      </div>
    </div>
  `).join('');

  // Lista reciente
  const recentContainer = document.getElementById('viajes-recientes');
  if (recentContainer) {
    recentContainer.innerHTML = viajes.slice(-3).reverse().map(v => `
      <div class="viaje-reciente-item">
        <img src="${v.imagen}" alt="${v.nombre}" onerror="this.src='https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400'">
        <div>
          <strong>${v.nombre}</strong>
          <span>${v.destino} · USD ${v.precio.toLocaleString()}</span>
        </div>
        ${v.oferta ? '<span class="badge-mini">OFERTA</span>' : ''}
      </div>
    `).join('');
  }
}

/* ── Lista de Viajes Admin ── */
function renderAdminViajes(busqueda = '') {
  const container = document.getElementById('admin-viajes-grid');
  if (!container) return;

  let viajes = Storage.getViajes();
  if (busqueda) {
    viajes = viajes.filter(v =>
      v.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.destino.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  if (viajes.length === 0) {
    container.innerHTML = `<div class="no-resultados"><p>No hay viajes cargados aún.</p></div>`;
    return;
  }

  container.innerHTML = viajes.map(v => cardAdminViaje(v)).join('');

  // Buscador admin
  const buscadorAdmin = document.getElementById('admin-busqueda');
  if (buscadorAdmin && !buscadorAdmin.dataset.init) {
    buscadorAdmin.dataset.init = 'true';
    buscadorAdmin.addEventListener('input', () => renderAdminViajes(buscadorAdmin.value));
  }
}

function cardAdminViaje(v) {
  const precioFinal = v.oferta ? Math.round(v.precio * (1 - v.descuento / 100)) : v.precio;
  return `
    <div class="admin-card ${v.oferta ? 'admin-card-oferta' : ''}">
      <div class="admin-card-img">
        <img src="${v.imagen}" alt="${v.nombre}" onerror="this.src='https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400'">
        ${v.oferta ? `<div class="admin-badge-oferta">-${v.descuento}%</div>` : ''}
      </div>
      <div class="admin-card-body">
        <div class="admin-card-destino">${v.destino}</div>
        <h3>${v.nombre}</h3>
        <p>${v.descripcion.substring(0, 80)}…</p>
        <div class="admin-card-precio">
          ${v.oferta ? `<s>USD ${v.precio.toLocaleString()}</s>` : ''}
          <strong>USD ${precioFinal.toLocaleString()}</strong>
        </div>
      </div>
      <div class="admin-card-actions">
        <button class="btn-edit" onclick="abrirFormEditar(${v.id})">✏️ Editar</button>
        <button class="btn-toggle-oferta" onclick="toggleOferta(${v.id})">
          ${v.oferta ? '🔴 Quitar oferta' : '🟢 Marcar oferta'}
        </button>
        <button class="btn-delete" onclick="confirmarEliminar(${v.id}, '${v.nombre.replace(/'/g, "\\'")}')">🗑️ Eliminar</button>
      </div>
    </div>
  `;
}

/* ── Formulario Viaje ── */
function abrirFormNuevo() {
  editandoId = null;
  document.getElementById('form-title').textContent = 'Nuevo Viaje';
  document.getElementById('viaje-form').reset();
  document.getElementById('form-id').value = '';
  document.getElementById('preview-imagen').src = '';
  document.getElementById('preview-imagen').style.display = 'none';
  document.getElementById('oferta-fields').style.display = 'none';
}

function abrirFormEditar(id) {
  const v = Storage.getViajeById(id);
  if (!v) return;
  editandoId = id;
  navigateTo('nuevo');

  setTimeout(() => {
    document.getElementById('form-title').textContent = 'Editar Viaje';
    document.getElementById('form-id').value = v.id;
    document.getElementById('form-nombre').value = v.nombre;
    document.getElementById('form-descripcion').value = v.descripcion;
    document.getElementById('form-precio').value = v.precio;
    document.getElementById('form-destino').value = v.destino;
    document.getElementById('form-imagen').value = v.imagen;
    document.getElementById('form-duracion').value = v.duracion || '';
    document.getElementById('form-salidas').value = v.salidas || '';
    document.getElementById('form-incluye').value = (v.incluye || []).join('\n');
    document.getElementById('form-oferta').checked = v.oferta;
    document.getElementById('form-descuento').value = v.descuento || 0;
    document.getElementById('form-destacado').checked = v.destacado || false;
    document.getElementById('oferta-fields').style.display = v.oferta ? 'block' : 'none';
    actualizarPreviewImagen(v.imagen);
  }, 50);
}

function actualizarPreviewImagen(url) {
  const preview = document.getElementById('preview-imagen');
  if (url) {
    preview.src = url;
    preview.style.display = 'block';
    preview.onerror = () => { preview.style.display = 'none'; };
  } else {
    preview.style.display = 'none';
  }
}

function initFormViaje() {
  const form = document.getElementById('viaje-form');
  if (!form || form.dataset.init) return;
  form.dataset.init = 'true';

  const chkOferta = document.getElementById('form-oferta');
  chkOferta?.addEventListener('change', () => {
    document.getElementById('oferta-fields').style.display = chkOferta.checked ? 'block' : 'none';
  });

  const inputImagen = document.getElementById('form-imagen');
  inputImagen?.addEventListener('input', () => actualizarPreviewImagen(inputImagen.value));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    guardarViaje();
  });
}

function guardarViaje() {
  const incluye = document.getElementById('form-incluye').value
    .split('\n')
    .map(i => i.trim())
    .filter(Boolean);

  const viaje = {
    id: editandoId || null,
    nombre: document.getElementById('form-nombre').value.trim(),
    descripcion: document.getElementById('form-descripcion').value.trim(),
    precio: parseFloat(document.getElementById('form-precio').value),
    destino: document.getElementById('form-destino').value.trim(),
    imagen: document.getElementById('form-imagen').value.trim(),
    duracion: document.getElementById('form-duracion').value.trim(),
    salidas: document.getElementById('form-salidas').value.trim(),
    incluye,
    oferta: document.getElementById('form-oferta').checked,
    descuento: parseFloat(document.getElementById('form-descuento').value) || 0,
    destacado: document.getElementById('form-destacado').checked,
  };

  if (!viaje.nombre || !viaje.precio || !viaje.destino) {
    showAdminToast('Completá los campos obligatorios', 'error');
    return;
  }

  Storage.saveViaje(viaje);
  showAdminToast(editandoId ? '✅ Viaje actualizado' : '✅ Viaje creado exitosamente');
  navigateTo('viajes');
}

function toggleOferta(id) {
  const v = Storage.getViajeById(id);
  if (!v) return;
  v.oferta = !v.oferta;
  if (!v.oferta) v.descuento = 0;
  else v.descuento = 10;
  Storage.saveViaje(v);
  showAdminToast(v.oferta ? '🟢 Marcado como oferta' : '🔴 Oferta removida');
  renderAdminViajes();
}

function confirmarEliminar(id, nombre) {
  const modal = document.getElementById('modal-confirmar');
  const msgEl = document.getElementById('modal-msg');
  msgEl.textContent = `¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`;
  modal.classList.add('open');

  document.getElementById('btn-confirmar-si').onclick = () => {
    Storage.deleteViaje(id);
    modal.classList.remove('open');
    showAdminToast('🗑️ Viaje eliminado');
    renderAdminViajes();
  };
  document.getElementById('btn-confirmar-no').onclick = () => {
    modal.classList.remove('open');
  };
}

/* ── Toast Admin ── */
function showAdminToast(msg, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `admin-toast admin-toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Init form when view loads
const observer = new MutationObserver(() => {
  if (document.getElementById('viaje-form')) {
    initFormViaje();
  }
});
observer.observe(document.body, { childList: true, subtree: true });
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initFormViaje, 200);
});
