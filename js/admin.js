/**
 * admin.js — Panel de administración MARA Viajes y Turismo
 */
'use strict';

const CREDS = { user:'admin', pass:'1234' };
const AS = { section:'dashboard', editId:null, deleteId:null, query:'', dest:'all' };

document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  if (sessionStorage.getItem('mara_admin')==='1') showPanel();
});

/* ── LOGIN ── */
function initLogin() {
  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const u = document.getElementById('l-user').value.trim();
    const p = document.getElementById('l-pass').value;
    const err = document.getElementById('login-err');
    if (u===CREDS.user && p===CREDS.pass) {
      sessionStorage.setItem('mara_admin','1');
      err.textContent='';
      showPanel();
    } else {
      err.textContent='Usuario o contraseña incorrectos.';
      document.getElementById('l-pass').value='';
    }
  });
  document.getElementById('btn-logout').addEventListener('click', () => {
    sessionStorage.removeItem('mara_admin');
    document.getElementById('admin-shell').style.display='none';
    document.getElementById('login-wrap').style.display='';
  });
}

function showPanel() {
  document.getElementById('login-wrap').style.display='none';
  document.getElementById('admin-shell').style.display='';
  initPanel();
}

/* ── PANEL ── */
function initPanel() {
  initSidebar();
  initConfirm();
  initTripForm();
  initViajesSearch();
  initOfertasAdmin();
  goTo('dashboard');
}

function initSidebar() {
  document.querySelectorAll('.sbn').forEach(btn => {
    btn.addEventListener('click', () => goTo(btn.dataset.sec));
  });
  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => goTo(btn.dataset.goto));
  });
  const menuBtn = document.getElementById('menu-btn');
  const sidebar = document.getElementById('sidebar');
  menuBtn?.addEventListener('click', () => sidebar.classList.toggle('open'));
}

function goTo(sec) {
  AS.section = sec;
  document.querySelectorAll('.asec').forEach(s => s.style.display='none');
  const target = document.getElementById(`sec-${sec}`);
  if (target) target.style.display='';
  document.querySelectorAll('.sbn').forEach(b => b.classList.toggle('active', b.dataset.sec===sec));
  const titles = { dashboard:'Dashboard', viajes:'Gestión de Viajes', ofertas:'Ofertas', nuevo: AS.editId?'Editar Viaje':'Nuevo Viaje' };
  const atb = document.getElementById('atb-title');
  if(atb) atb.textContent = titles[sec]||sec;
  document.getElementById('sidebar')?.classList.remove('open');

  switch(sec) {
    case 'dashboard': renderDashboard(); break;
    case 'viajes':    renderViajes();    break;
    case 'ofertas':   renderOfertas();   break;
    case 'nuevo':     renderForm();      break;
  }
}

/* ── DASHBOARD ── */
function renderDashboard() {
  const s = DataStore.stats();
  document.getElementById('dash-stats').innerHTML = [
    { label:'Viajes totales', val:s.total, icon:'✈', color:'#a3e635' },
    { label:'Ofertas activas', val:s.offers, icon:'🔥', color:'#fb923c' },
    { label:'Precio promedio', val:`USD ${s.avgPrice.toLocaleString()}`, icon:'💰', color:'#f472b6' },
    { label:'Destinos', val:s.destinations, icon:'🌍', color:'#34d399' },
  ].map(i=>`
    <div class="ds-card" style="--accent:${i.color}">
      <span class="ds-icon">${i.icon}</span>
      <strong>${i.val}</strong>
      <span>${i.label}</span>
    </div>`).join('');

  const recent = DataStore.getAll().slice(-4).reverse();
  document.getElementById('recent-cards').innerHTML = recent.map(t=>`
    <div class="rc-card">
      <div class="rc-img" style="background-image:url('${t.image}')">
        ${t.isOffer?`<span class="rc-badge">-${t.discount}%</span>`:''}
      </div>
      <div class="rc-info">
        <strong>${t.name}</strong>
        <span>${destLabelAdmin(t.destination)} · USD ${t.price.toLocaleString()}</span>
      </div>
      <div class="rc-actions">
        <button class="rca-edit" data-id="${t.id}">Editar</button>
        <button class="rca-del"  data-id="${t.id}">✕</button>
      </div>
    </div>`).join('');

  document.querySelectorAll('.rca-edit').forEach(b => b.addEventListener('click', () => startEdit(b.dataset.id)));
  document.querySelectorAll('.rca-del').forEach(b  => b.addEventListener('click', () => askDelete(b.dataset.id)));
}

/* ── VIAJES ── */
function initViajesSearch() {
  document.getElementById('vt-search')?.addEventListener('input', e => {
    AS.query = e.target.value.trim().toLowerCase();
    if(AS.section==='viajes') renderViajes();
  });
  document.getElementById('vt-filter')?.addEventListener('change', e => {
    AS.dest = e.target.value;
    if(AS.section==='viajes') renderViajes();
  });
}

function renderViajes() {
  let trips = DataStore.getAll();
  if (AS.dest !== 'all') trips = trips.filter(t=>t.destination===AS.dest);
  if (AS.query) trips = trips.filter(t=>t.name.toLowerCase().includes(AS.query)||t.destination.toLowerCase().includes(AS.query));

  document.getElementById('viajes-list').innerHTML = trips.map(t=>`
    <div class="vl-item">
      <div class="vli-img" style="background-image:url('${t.image}')">
        ${t.isOffer?`<span class="vli-badge">-${t.discount}%</span>`:''}
      </div>
      <div class="vli-info">
        <strong>${t.name}</strong>
        <div class="vli-meta">
          <span class="vli-dest">${destLabelAdmin(t.destination)}</span>
          <span>USD ${t.price.toLocaleString()}</span>
          <span>${t.duration||'7 noches'}</span>
        </div>
      </div>
      <div class="vli-actions">
        <button class="va-btn va-edit" data-id="${t.id}">Editar</button>
        <button class="va-btn va-offer ${t.isOffer?'active':''}" data-id="${t.id}" title="${t.isOffer?'Quitar oferta':'Marcar oferta'}">
          ${t.isOffer?'✦ Oferta':'+ Oferta'}
        </button>
        <button class="va-btn va-del" data-id="${t.id}">Eliminar</button>
      </div>
    </div>`).join('') || '<p class="empty-msg">Sin resultados</p>';

  document.querySelectorAll('.va-edit').forEach(b=>b.addEventListener('click',()=>startEdit(b.dataset.id)));
  document.querySelectorAll('.va-del').forEach(b=>b.addEventListener('click',()=>askDelete(b.dataset.id)));
  document.querySelectorAll('.va-offer').forEach(b=>b.addEventListener('click',()=>toggleOffer(b.dataset.id)));
}

/* ── OFERTAS ── */
function initOfertasAdmin() {}

function renderOfertas() {
  const all = DataStore.getAll();
  document.getElementById('ofertas-grid').innerHTML = all.map(t=>`
    <div class="og-card ${t.isOffer?'is-offer':''}">
      <div class="ogc-img" style="background-image:url('${t.image}')"></div>
      <div class="ogc-body">
        <strong>${t.name}</strong>
        <span>${destLabelAdmin(t.destination)} · USD ${t.price.toLocaleString()}</span>
        ${t.isOffer?`
          <div class="ogc-disc">
            <label>Descuento:</label>
            <input type="number" class="disc-inp" data-id="${t.id}" value="${t.discount}" min="1" max="99"/>
            <span>%</span>
          </div>`:'' }
      </div>
      <label class="tog-switch">
        <input type="checkbox" class="offer-tog" data-id="${t.id}" ${t.isOffer?'checked':''}/>
        <span class="tog-slider"></span>
      </label>
    </div>`).join('');

  document.querySelectorAll('.offer-tog').forEach(chk=>chk.addEventListener('change',()=>toggleOffer(chk.dataset.id)));
  document.querySelectorAll('.disc-inp').forEach(inp=>inp.addEventListener('change',()=>{
    const v = parseInt(inp.value);
    if(v>=1&&v<=99){ DataStore.update(inp.dataset.id,{discount:v}); adminToast('Descuento actualizado ✓'); }
  }));
}

/* ── FORMULARIO ── */
function initTripForm() {
  const isOffer = document.getElementById('f-offer');
  const discFg  = document.getElementById('disc-fg');
  const imgInp  = document.getElementById('f-img');
  const prevWrap= document.getElementById('img-prev-wrap');
  const prev    = document.getElementById('img-prev');

  isOffer?.addEventListener('change',()=>{
    discFg.style.display = isOffer.checked ? '' : 'none';
  });

  let imgTimer;
  imgInp?.addEventListener('input',()=>{
    clearTimeout(imgTimer);
    imgTimer = setTimeout(()=>{
      const url = imgInp.value.trim();
      if(url){ prev.src=url; prevWrap.style.display=''; prev.onerror=()=>{ prevWrap.style.display='none'; }; }
      else prevWrap.style.display='none';
    },500);
  });

  document.getElementById('btn-cancel')?.addEventListener('click',()=>{
    AS.editId=null;
    resetForm();
    goTo('viajes');
  });

  document.getElementById('trip-form')?.addEventListener('submit', e=>{
    e.preventDefault();
    if(!validateForm()) return;
    const data = {
      name:        document.getElementById('f-name').value.trim(),
      description: document.getElementById('f-desc').value.trim(),
      price:       parseInt(document.getElementById('f-price').value),
      image:       document.getElementById('f-img').value.trim(),
      destination: document.getElementById('f-dest').value,
      isOffer:     document.getElementById('f-offer').checked,
      discount:    document.getElementById('f-offer').checked ? parseInt(document.getElementById('f-disc').value||0) : 0,
      rating: 4.8, duration:'7 noches', includes:['Vuelo incluido','Hotel','Traslados'],
    };
    if(AS.editId) {
      DataStore.update(AS.editId, data);
      adminToast('✅ Viaje actualizado');
    } else {
      DataStore.add(data);
      adminToast('✅ Viaje creado');
    }
    AS.editId=null; resetForm(); goTo('viajes');
  });
}

function renderForm() {
  const title = document.getElementById('form-title');
  const sub   = document.getElementById('form-subtitle');
  const btn   = document.getElementById('btn-save');
  if(AS.editId) {
    const t = DataStore.getById(AS.editId);
    if(!t){ goTo('viajes'); return; }
    title.textContent='EDITAR VIAJE';
    sub.textContent='Modificá los datos del destino';
    btn.textContent='Guardar cambios →';
    document.getElementById('f-id').value    = t.id;
    document.getElementById('f-name').value  = t.name;
    document.getElementById('f-desc').value  = t.description;
    document.getElementById('f-price').value = t.price;
    document.getElementById('f-img').value   = t.image;
    document.getElementById('f-dest').value  = t.destination;
    document.getElementById('f-offer').checked = t.isOffer;
    document.getElementById('f-disc').value  = t.discount||0;
    document.getElementById('disc-fg').style.display = t.isOffer?'':'none';
    const prev=document.getElementById('img-prev'); prev.src=t.image;
    document.getElementById('img-prev-wrap').style.display='';
  } else {
    title.textContent='NUEVO VIAJE';
    sub.textContent='Cargá los datos del destino';
    btn.textContent='Guardar viaje →';
    resetForm();
  }
}

function resetForm() {
  document.getElementById('trip-form')?.reset();
  document.getElementById('f-id').value='';
  document.getElementById('img-prev-wrap').style.display='none';
  document.getElementById('disc-fg').style.display='none';
  clearErrors();
}

function validateForm() {
  clearErrors(); let ok=true;
  const v = (id,eid,msg)=>{ if(!document.getElementById(id).value.trim()){ document.getElementById(eid).textContent=msg; ok=false; } };
  v('f-name','e-name','Requerido');
  if(!document.getElementById('f-dest').value){ document.getElementById('e-dest').textContent='Requerido'; ok=false; }
  if(!document.getElementById('f-price').value||isNaN(document.getElementById('f-price').value)){ document.getElementById('e-price').textContent='Precio inválido'; ok=false; }
  v('f-img','e-img','Requerido');
  v('f-desc','e-desc','Requerido');
  return ok;
}
function clearErrors() {
  ['e-name','e-dest','e-price','e-img','e-desc'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.textContent='';
  });
}

/* ── EDITAR / ELIMINAR / TOGGLE OFERTA ── */
function startEdit(id) { AS.editId=id; goTo('nuevo'); }

function askDelete(id) {
  AS.deleteId=id;
  document.getElementById('confirm-overlay').style.display='';
}
function initConfirm() {
  document.getElementById('btn-confirm-del').addEventListener('click',()=>{
    if(AS.deleteId){ DataStore.delete(AS.deleteId); AS.deleteId=null; closeConfirm(); adminToast('🗑 Viaje eliminado','err');
      if(AS.section==='viajes') renderViajes();
      if(AS.section==='dashboard') renderDashboard();
    }
  });
  document.getElementById('btn-confirm-cancel').addEventListener('click',()=>{ AS.deleteId=null; closeConfirm(); });
}
function closeConfirm(){ document.getElementById('confirm-overlay').style.display='none'; }

function toggleOffer(id) {
  const t = DataStore.getById(id);
  if(!t) return;
  if(!t.isOffer){
    const d = prompt('Descuento (%) para la oferta:','15');
    if(d===null) return;
    const n=parseInt(d);
    if(isNaN(n)||n<1||n>99){ adminToast('Descuento inválido','err'); return; }
    DataStore.update(id,{isOffer:true,discount:n});
    adminToast(`🔥 ${t.name} marcado como oferta -${n}%`);
  } else {
    DataStore.update(id,{isOffer:false,discount:0});
    adminToast(`${t.name} ya no es oferta`);
  }
  if(AS.section==='viajes')  renderViajes();
  if(AS.section==='ofertas') renderOfertas();
  if(AS.section==='dashboard') renderDashboard();
}

/* ── TOAST ── */
function adminToast(msg, type='ok') {
  const t = document.getElementById('admin-toast');
  t.textContent=msg; t.className=`toast show ${type}`;
  setTimeout(()=>t.classList.remove('show'),3000);
}

function destLabelAdmin(d) {
  return { caribe:'Caribe', europa:'Europa', america:'América', asia:'Asia', crucero:'Crucero' }[d]||d;
}
