/**
 * data.js — Store centralizado de datos para MARA Viajes y Turismo
 * ================================================================
 * Gestiona localStorage con datos reales de la agencia.
 */
'use strict';

/* ── DATOS SEED (12 viajes representativos de Mara Viajes) ── */
const SEED_TRIPS = [
  {
    id:'mv-001', name:'Punta Cana Todo Incluido',
    description:'La joya del Caribe te espera. Playas de arena blanca, aguas cristalinas y resorts de lujo todo incluido. Ideal para familias, parejas y grupos.',
    price:1650, image:'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=900&q=80',
    destination:'caribe', isOffer:true, discount:18, rating:4.9, duration:'7 noches', includes:['Vuelo directo','Hotel 5★ todo incluido','Traslados','Seguro de viaje']
  },
  {
    id:'mv-002', name:'Bayahibe — Caribe Secreto',
    description:'El destino menos masivo del Caribe dominicano. Buceo, snorkel y playas vírgenes en un ambiente más íntimo y natural.',
    price:1480, image:'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&q=80',
    destination:'caribe', isOffer:true, discount:12, rating:4.8, duration:'7 noches', includes:['Vuelo','Hotel todo incluido','Traslados']
  },
  {
    id:'mv-003', name:'Cancún & Riviera Maya',
    description:'El mega destino mexicano: playas de Tulum, cenotes, ruinas mayas y la fiesta de Cancún. Todo en un solo viaje.',
    price:1890, image:'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=900&q=80',
    destination:'caribe', isOffer:false, discount:0, rating:4.7, duration:'8 noches', includes:['Vuelo','Hotel 4★','Traslados','Tour cenotes']
  },
  {
    id:'mv-004', name:'Europa Clásica',
    description:'Madrid, París, Roma y Amsterdam en un circuito diseñado para vivir Europa sin apuros. Guía en español desde Buenos Aires.',
    price:3800, image:'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&q=80',
    destination:'europa', isOffer:true, discount:10, rating:4.9, duration:'15 días', includes:['Vuelo internacional','Hoteles 4★','Guía en español','Desayunos']
  },
  {
    id:'mv-005', name:'París + Amsterdam',
    description:'Dos ciudades únicas conectadas por tren de alta velocidad. La Torre Eiffel, Versalles y los canales de Amsterdam.',
    price:2900, image:'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=900&q=80',
    destination:'europa', isOffer:false, discount:0, rating:4.8, duration:'10 días', includes:['Vuelo','Hotel boutique','Tren interurbano','City tours']
  },
  {
    id:'mv-006', name:'Crucero por el Mediterráneo',
    description:'Embarcate desde Barcelona y recorré Italia, Grecia y Croacia en un crucero 5 estrellas. La experiencia definitiva.',
    price:4200, image:'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=900&q=80',
    destination:'crucero', isOffer:true, discount:15, rating:5.0, duration:'12 noches', includes:['Vuelo a Barcelona','Crucero todo incluido','Puerto a Puerto','Excursiones']
  },
  {
    id:'mv-007', name:'Crucero por el Caribe',
    description:'Saliendo desde Miami o Cartagena, recorré Jamaica, Islas Caimán, Cozumel y Bahamas en un solo viaje.',
    price:2600, image:'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&q=80',
    destination:'crucero', isOffer:false, discount:0, rating:4.7, duration:'10 noches', includes:['Vuelo','Crucero todo incluido','Traslados']
  },
  {
    id:'mv-008', name:'Disney World — Familia Total',
    description:'El parque más mágico del mundo. Paquetes para familias con niños con Hotel en Disney, pases y transfers incluidos.',
    price:2200, image:'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=900&q=80',
    destination:'america', isOffer:true, discount:8, rating:4.9, duration:'7 noches', includes:['Vuelo a Orlando','Hotel en Disney Resort','Park Pass 5 días','Traslados']
  },
  {
    id:'mv-009', name:'Brasil — Río y Foz de Iguazú',
    description:'Las cataratas más imponentes del mundo y la magia de Río de Janeiro. Copacabana, el Pan de Azúcar y la selva.',
    price:1350, image:'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=900&q=80',
    destination:'america', isOffer:false, discount:0, rating:4.6, duration:'8 días', includes:['Vuelo','Hoteles 4★','Cataratas','City tours']
  },
  {
    id:'mv-010', name:'Luna de Miel — Maldivas',
    description:'El destino más romántico del planeta. Bungalows sobre el agua, snorkel con mantas raya y atardeceres de película.',
    price:5800, image:'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=900&q=80',
    destination:'asia', isOffer:true, discount:5, rating:5.0, duration:'8 noches', includes:['Vuelo internacional','Water Bungalow','Desayuno y cena','Snorkel y buceo']
  },
  {
    id:'mv-011', name:'Bali — Isla de los Dioses',
    description:'Templos entre arrozales, yoga al amanecer, playas de arena negra y la gastronomía más vibrante del sudeste asiático.',
    price:2400, image:'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=80',
    destination:'asia', isOffer:false, discount:0, rating:4.8, duration:'10 noches', includes:['Vuelo','Villa privada','Desayuno','Tour templos']
  },
  {
    id:'mv-012', name:'Cuba Auténtica',
    description:'La Habana, Trinidad, Varadero. Autos del 50, música en vivo, mojitos y una cultura única en el mundo.',
    price:1750, image:'https://images.unsplash.com/photo-1551009175-8a68da93d5f9?w=900&q=80',
    destination:'caribe', isOffer:true, discount:20, rating:4.7, duration:'9 días', includes:['Vuelo','Hotel + Casa Particular','Traslados','City tour La Habana']
  },
];

const TESTIMONIALS = [
  { name:'Fabi, Mary y el grupo', location:'San Francisco', text:'¡Increíble organización! El viaje a Punta Cana con todo incluido fue perfecto. Mara se encargó de cada detalle y nosotros solo disfrutamos.', rating:5, initials:'FM', trip:'Punta Cana' },
  { name:'Lau, Adri, Vane, Vero y Nati', location:'San Francisco', text:'El crucero por el Mediterráneo superó todas nuestras expectativas. Ver Barcelona, Roma y Santorini en un solo viaje es algo que no olvidaremos jamás.', rating:5, initials:'LV', trip:'Crucero Mediterráneo' },
  { name:'Familia Giampieri', location:'Córdoba', text:'Punta Cana con los chicos fue un sueño. El hotel era increíble y los traslados perfectos. Todo coordinado por Mara desde San Francisco.', rating:5, initials:'FG', trip:'Punta Cana' },
  { name:'Micaela y Lorenzo', location:'San Francisco', text:'Luna de miel en Bayahibe. Solo puedo decir que fue el mejor viaje de nuestras vidas. Gracias Mara por hacerlo tan especial.', rating:5, initials:'ML', trip:'Bayahibe' },
  { name:'Moni, Belu, Anto y Ninno', location:'Córdoba', text:'Ya es nuestra tercera vez viajando con Mara. Siempre todo impecable: vuelos, hotel, traslados. Una agencia de confianza total.', rating:5, initials:'MB', trip:'Bayahibe' },
];

/* ── DATA STORE ── */
const DataStore = {
  KEY: 'mara_trips_v2',
  init() {
    if (!localStorage.getItem(this.KEY)) {
      localStorage.setItem(this.KEY, JSON.stringify(SEED_TRIPS));
    }
  },
  getAll() {
    this.init();
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch { return []; }
  },
  getById(id) { return this.getAll().find(t => t.id === id) || null; },
  add(trip) {
    const trips = this.getAll();
    trip.id = 'mv-' + Date.now();
    trips.push(trip);
    localStorage.setItem(this.KEY, JSON.stringify(trips));
    return trip;
  },
  update(id, data) {
    const trips = this.getAll();
    const idx = trips.findIndex(t => t.id === id);
    if (idx === -1) return null;
    trips[idx] = { ...trips[idx], ...data };
    localStorage.setItem(this.KEY, JSON.stringify(trips));
    return trips[idx];
  },
  delete(id) {
    localStorage.setItem(this.KEY, JSON.stringify(this.getAll().filter(t => t.id !== id)));
  },
  stats() {
    const all = this.getAll();
    return {
      total: all.length,
      offers: all.filter(t => t.isOffer).length,
      avgPrice: all.length ? Math.round(all.reduce((s,t)=>s+t.price,0)/all.length) : 0,
      destinations: [...new Set(all.map(t=>t.destination))].length,
    };
  }
};
