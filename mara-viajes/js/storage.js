/**
 * MARA VIAJES Y TURISMO
 * storage.js - Capa de persistencia con LocalStorage
 */

const Storage = (() => {
  const KEYS = {
    viajes: 'mara_viajes',
    admin: 'mara_admin_session',
  };

  // Datos iniciales de ejemplo
  const VIAJES_INICIALES = [
    {
      id: 1,
      nombre: 'Punta Cana – Todo Incluido',
      descripcion: 'Escapate al paraíso caribeño con playas de arena blanca, aguas cristalinas y toda la magia de República Dominicana. Incluye vuelo, hotel 5 estrellas, traslados y todas las comidas.',
      precio: 1850,
      destino: 'República Dominicana',
      imagen: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80',
      oferta: true,
      descuento: 20,
      duracion: '7 noches',
      salidas: 'Todos los viernes',
      incluye: ['Vuelo ida y vuelta', 'Hotel 5★ todo incluido', 'Traslados', 'Seguro de viaje'],
      destacado: true,
    },
    {
      id: 2,
      nombre: 'Bayahibe – Caribe Auténtico',
      descripcion: 'Descubrí el lado más auténtico del Caribe en Bayahibe. Corales naturales, excursiones en catamarán y atardeceres únicos. El destino favorito de nuestros clientes.',
      precio: 1650,
      destino: 'República Dominicana',
      imagen: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
      oferta: false,
      descuento: 0,
      duracion: '7 noches',
      salidas: 'Martes y viernes',
      incluye: ['Vuelo ida y vuelta', 'Hotel frente al mar', 'Traslados', 'Seguro de viaje'],
      destacado: true,
    },
    {
      id: 3,
      nombre: 'Brasil – Río de Janeiro',
      descripcion: 'La ciudad maravillosa te espera. Cristo Redentor, Copacabana, samba y mucho más. Una experiencia que no vas a olvidar nunca.',
      precio: 1400,
      destino: 'Brasil',
      imagen: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80',
      oferta: true,
      descuento: 15,
      duracion: '5 noches',
      salidas: 'Jueves',
      incluye: ['Vuelo ida y vuelta', 'Hotel 4★', 'City tour', 'Seguro de viaje'],
      destacado: false,
    },
    {
      id: 4,
      nombre: 'Cancún – México Mágico',
      descripcion: 'Playas turquesas, ruinas mayas y la mejor vida nocturna de América. Cancún es uno de los destinos más buscados del mundo.',
      precio: 1950,
      destino: 'México',
      imagen: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800&q=80',
      oferta: false,
      descuento: 0,
      duracion: '7 noches',
      salidas: 'Lunes y viernes',
      incluye: ['Vuelo ida y vuelta', 'Hotel 5★ todo incluido', 'Traslados aeropuerto', 'Seguro de viaje'],
      destacado: true,
    },
    {
      id: 5,
      nombre: 'Miami – El Sueño Americano',
      descripcion: 'South Beach, compras en Sawgrass Mills, los Everglades y el ambiente más cosmopolita del mundo. Miami es para vivirla.',
      precio: 2100,
      destino: 'Estados Unidos',
      imagen: 'https://images.unsplash.com/photo-1503891450247-ee5f8ec46dc3?w=800&q=80',
      oferta: false,
      descuento: 0,
      duracion: '6 noches',
      salidas: 'Miércoles y sábado',
      incluye: ['Vuelo ida y vuelta', 'Hotel en South Beach', 'Excursión Everglades', 'Seguro de viaje'],
      destacado: false,
    },
    {
      id: 6,
      nombre: 'Europa Clásica',
      descripcion: 'París, Roma, Barcelona y Amsterdam en un solo viaje. Conocé las capitales más importantes de Europa con guía en español y grupos reducidos.',
      precio: 4200,
      destino: 'Europa',
      imagen: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
      oferta: true,
      descuento: 10,
      duracion: '14 noches',
      salidas: 'Mensual',
      incluye: ['Vuelos incluidos', 'Hoteles 4★', 'Circuito en bus', 'Guía en español', 'Seguro de viaje'],
      destacado: true,
    },
    {
      id: 7,
      nombre: 'Caribe Mexicano – Riviera Maya',
      descripcion: 'Tulum, Playa del Carmen y Chichen Itza. La Riviera Maya combina naturaleza, historia y playas soñadas en un destino único.',
      precio: 1780,
      destino: 'México',
      imagen: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&q=80',
      oferta: true,
      descuento: 12,
      duracion: '7 noches',
      salidas: 'Jueves y domingo',
      incluye: ['Vuelo ida y vuelta', 'Hotel 5★ todo incluido', 'Excursión cenotes', 'Seguro de viaje'],
      destacado: false,
    },
    {
      id: 8,
      nombre: 'Dubai – Lujo del Desierto',
      descripcion: 'Burj Khalifa, desierto de Arabia, shopping de lujo y la arquitectura más impresionante del mundo. Dubai es el futuro.',
      precio: 3800,
      destino: 'Emiratos Árabes',
      imagen: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
      oferta: false,
      descuento: 0,
      duracion: '5 noches',
      salidas: 'Variable',
      incluye: ['Vuelo ida y vuelta', 'Hotel 5★', 'Safari en desierto', 'City tour', 'Seguro de viaje'],
      destacado: false,
    },
  ];

  function init() {
    if (!localStorage.getItem(KEYS.viajes)) {
      localStorage.setItem(KEYS.viajes, JSON.stringify(VIAJES_INICIALES));
    }
  }

  function getViajes() {
    init();
    return JSON.parse(localStorage.getItem(KEYS.viajes)) || [];
  }

  function getViajeById(id) {
    return getViajes().find(v => v.id === parseInt(id));
  }

  function saveViaje(viaje) {
    const viajes = getViajes();
    if (viaje.id) {
      const idx = viajes.findIndex(v => v.id === parseInt(viaje.id));
      if (idx !== -1) viajes[idx] = { ...viajes[idx], ...viaje };
      else viajes.push(viaje);
    } else {
      viaje.id = Date.now();
      viajes.push(viaje);
    }
    localStorage.setItem(KEYS.viajes, JSON.stringify(viajes));
    return viaje;
  }

  function deleteViaje(id) {
    const viajes = getViajes().filter(v => v.id !== parseInt(id));
    localStorage.setItem(KEYS.viajes, JSON.stringify(viajes));
  }

  function isAdminLogged() {
    return sessionStorage.getItem(KEYS.admin) === 'true';
  }

  function loginAdmin(user, pass) {
    if (user === 'admin' && pass === '1234') {
      sessionStorage.setItem(KEYS.admin, 'true');
      return true;
    }
    return false;
  }

  function logoutAdmin() {
    sessionStorage.removeItem(KEYS.admin);
  }

  return { getViajes, getViajeById, saveViaje, deleteViaje, isAdminLogged, loginAdmin, logoutAdmin, init };
})();
