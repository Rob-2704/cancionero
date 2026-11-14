// js/api-cliente.js
// Datos del cancionero por artista:
//   · Canciones: Firebase Realtime Database (nodo "canciones/{id}") con copia local en IndexedDB
//     (se muestran al instante y funcionan sin conexión; se sincronizan en segundo plano).
//   · Portada de artista: portadas-artistas-cache.json (Discogs) y, si falta, la de un álbum suyo.
//   · Portada de álbum: iTunes, en el navegador (con artista secundario si existe).
//
// Registro de una canción:
//   { idC, nombreC, carpeta, artistaP, artistaS, albumC, albumBusqueda, estado, contenido }
//   carpeta = dónde se organiza la canción en la página · artistaP/artistaS = solo para la carátula

import { FIREBASE_CONFIG, FIREBASE_VERSION, DATABASE_URL, CONFIGURADO } from './firebase-config.js';
import { ESTADOS, ORDEN_ESTADO, normalizar, slugArtista } from './nombre-cancion.js';

export { ESTADOS, ORDEN_ESTADO, ETIQUETA_ESTADO, slugArtista, normalizar } from './nombre-cancion.js';
export { CONFIGURADO };

const IDB_NOMBRE = 'cancionero-artistas';
const IDB_VERSION = 1;
const TIMEOUT_REST_MS = 12000;
const TIMEOUT_SDK_MS = 10000;
const REFRESCO_MIN_MS = 60000;      // al volver a la pestaña no se sincroniza si hace menos de 1 min
const ARTISTA_SIN_NOMBRE = 'Otros';

// ───────────────────────── Utilidades ─────────────────────────

export function escaparHTML(texto) {
    return String(texto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function conTimeout(promesa, ms, mensaje = 'Tiempo de espera agotado') {
    let temporizador;
    const limite = new Promise((_, rechazar) => {
        temporizador = setTimeout(() => rechazar(new Error(mensaje)), ms);
    });
    return Promise.race([promesa, limite]).finally(() => clearTimeout(temporizador));
}

function aObjeto(crudo) {
    if (!crudo || typeof crudo !== 'object') return {};
    if (Array.isArray(crudo)) {
        const salida = {};
        crudo.forEach((v, i) => { if (v !== null && v !== undefined) salida[String(i)] = v; });
        return salida;
    }
    return crudo;
}

const comparar = (a, b) => String(a).localeCompare(String(b), 'es', { sensitivity: 'base' });

// ───────────────────────── Estado de sincronización (indicador de la portada) ─────────────────────────

const callbacksEstadoGuardado = [];
let estadoActualGuardado = 'guardando';

export function alCambiarEstadoGuardado(callback) {
    callbacksEstadoGuardado.push(callback);
    callback(estadoActualGuardado);
}

function notificarEstadoGuardado(nuevoEstado) {
    if (nuevoEstado === estadoActualGuardado) return;
    estadoActualGuardado = nuevoEstado;
    callbacksEstadoGuardado.forEach(cb => { try { cb(nuevoEstado); } catch (_) {} });
}

// Las páginas se suscriben para repintarse cuando llega una versión más nueva de los datos
const callbacksDatos = [];

export function alActualizarDatos(callback) {
    callbacksDatos.push(callback);
    return () => {
        const i = callbacksDatos.indexOf(callback);
        if (i !== -1) callbacksDatos.splice(i, 1);
    };
}

function notificarDatos() {
    callbacksDatos.forEach(cb => { try { cb(); } catch (_) {} });
}

// ───────────────────────── Firebase SDK (respaldo de la lectura REST) ─────────────────────────

let promesaFirebase = null;

async function obtenerBaseDatosFirebase() {
    if (!promesaFirebase) {
        promesaFirebase = (async () => {
            const base = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/`;
            const [appModule, dbModule] = await Promise.all([
                import(`${base}firebase-app.js`),
                import(`${base}firebase-database.js`)
            ]);
            const app = appModule.getApps().length === 0
                ? appModule.initializeApp(FIREBASE_CONFIG)
                : appModule.getApps()[0];
            return { db: dbModule.getDatabase(app), dbModule };
        })();
        promesaFirebase.catch(() => { promesaFirebase = null; });
    }
    return promesaFirebase;
}

// REST directo primero (rápido y ligero); SDK de Firebase como respaldo.
async function leerRemoto(ruta) {
    if (!CONFIGURADO) throw new Error('FIREBASE_NO_CONFIGURADO');
    if (!/^[A-Za-z0-9_\-\/]+$/.test(ruta)) throw new Error('Ruta inválida');
    if (!navigator.onLine) throw new Error('Sin conexión');

    try {
        const controlador = new AbortController();
        const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_REST_MS);
        try {
            const respuesta = await fetch(`${DATABASE_URL}/${ruta}.json`, {
                signal: controlador.signal,
                cache: 'no-store',
                credentials: 'omit'
            });
            if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
            return await respuesta.json();
        } finally {
            clearTimeout(temporizador);
        }
    } catch (errorRest) {
        if (!navigator.onLine) throw errorRest;
        const { db, dbModule } = await obtenerBaseDatosFirebase();
        const snapshot = await conTimeout(dbModule.get(dbModule.ref(db, ruta)), TIMEOUT_SDK_MS);
        return snapshot.val();
    }
}

// Solo las claves de "canciones" (sin descargar el contenido): para calcular el siguiente id al subir
export async function obtenerIdsRemotos() {
    if (!CONFIGURADO) throw new Error('FIREBASE_NO_CONFIGURADO');
    const respuesta = await fetch(`${DATABASE_URL}/canciones.json?shallow=true`, {
        cache: 'no-store',
        credentials: 'omit'
    });
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    return Object.keys((await respuesta.json()) || {});
}

// ───────────────────────── IndexedDB (copia local de las canciones) ─────────────────────────

let promesaIDB = null;

function abrirIDB() {
    if (promesaIDB) return promesaIDB;
    promesaIDB = new Promise((resolver, rechazar) => {
        if (typeof indexedDB === 'undefined') { rechazar(new Error('IndexedDB no disponible')); return; }
        const peticion = indexedDB.open(IDB_NOMBRE, IDB_VERSION);
        peticion.onupgradeneeded = () => {
            const db = peticion.result;
            if (!db.objectStoreNames.contains('canciones')) db.createObjectStore('canciones', { keyPath: 'idC' });
            if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
        };
        peticion.onsuccess = () => {
            const db = peticion.result;
            db.onversionchange = () => { db.close(); promesaIDB = null; };
            resolver(db);
        };
        peticion.onerror = () => rechazar(peticion.error);
        peticion.onblocked = () => rechazar(new Error('IndexedDB bloqueada'));
    });
    promesaIDB.catch(() => { promesaIDB = null; });
    return promesaIDB;
}

// Valida y normaliza lo que llega de la base de datos (o de la copia local).
function normalizarCanciones(crudo) {
    const salida = {};
    const texto = (v) => (typeof v === 'string' ? v : (v === null || v === undefined ? '' : String(v)));

    for (const [clave, c] of Object.entries(aObjeto(crudo))) {
        if (!c || typeof c !== 'object') continue;
        const id = String(clave).trim();
        if (!/^[A-Za-z0-9_\-]+$/.test(id)) continue;

        const nombreC = texto(c.nombreC).trim();
        if (!nombreC) continue;

        const artistaP = texto(c.artistaP).trim();
        salida[id] = {
            idC: id,
            nombreC,
            // Registros sin carpeta (formato anterior): se organizan por su artista
            carpeta: texto(c.carpeta).trim() || artistaP || ARTISTA_SIN_NOMBRE,
            artistaP,
            artistaS: texto(c.artistaS).trim(),
            albumC: texto(c.albumC).trim(),
            albumBusqueda: texto(c.albumBusqueda).trim(),
            estado: ESTADOS.includes(c.estado) ? c.estado : 'terminada',
            contenido: texto(c.contenido)
        };
    }
    return salida;
}

// Escritura atómica: si algo falla la transacción se cancela y la copia anterior queda intacta.
async function guardarCancionesLocal(canciones) {
    try {
        const db = await abrirIDB();
        await new Promise((resolver, rechazar) => {
            const tx = db.transaction(['canciones', 'meta'], 'readwrite');
            const almacen = tx.objectStore('canciones');
            almacen.clear();
            Object.values(canciones).forEach(c => almacen.put(c));
            tx.objectStore('meta').put(Date.now(), 'actualizado');
            tx.oncomplete = () => resolver();
            tx.onerror = () => rechazar(tx.error);
            tx.onabort = () => rechazar(tx.error || new Error('Transacción cancelada'));
        });
    } catch (_) {
        console.warn('No se pudo guardar la copia local de canciones.');
    }
}

async function guardarUnaCancionLocal(cancion) {
    try {
        const db = await abrirIDB();
        await new Promise((resolver, rechazar) => {
            const tx = db.transaction('canciones', 'readwrite');
            tx.objectStore('canciones').put(cancion);
            tx.oncomplete = () => resolver();
            tx.onerror = () => rechazar(tx.error);
            tx.onabort = () => rechazar(tx.error);
        });
    } catch (_) {}
}

async function leerCancionesLocal() {
    try {
        const db = await abrirIDB();
        const lista = await new Promise((resolver, rechazar) => {
            const peticion = db.transaction('canciones').objectStore('canciones').getAll();
            peticion.onsuccess = () => resolver(peticion.result || []);
            peticion.onerror = () => rechazar(peticion.error);
        });
        if (lista.length > 0) {
            const mapa = {};
            lista.forEach(c => { if (c && c.idC) mapa[c.idC] = c; });
            const normalizadas = normalizarCanciones(mapa);
            if (Object.keys(normalizadas).length > 0) return normalizadas;
        }
    } catch (_) {}
    return null;
}

// ───────────────────────── Canciones: carga y sincronización ─────────────────────────

let datosCanciones = null;       // { idC: registro }
let promesaCanciones = null;
let sincronizandoCanciones = null;
let ultimaSincronizacion = 0;

function sincronizarCanciones() {
    if (sincronizandoCanciones) return sincronizandoCanciones;

    sincronizandoCanciones = (async () => {
        const habiaDatos = !!datosCanciones && Object.keys(datosCanciones).length > 0;
        try {
            const crudo = await leerRemoto('canciones');
            const remotas = normalizarCanciones(crudo);
            ultimaSincronizacion = Date.now();

            // La base de datos quedó vacía a propósito: se refleja (solo si la respuesta fue válida)
            if (Object.keys(remotas).length === 0) {
                if (crudo === null && habiaDatos) {
                    datosCanciones = {};
                    await guardarCancionesLocal({});
                    notificarDatos();
                }
                notificarEstadoGuardado('completado');
                return datosCanciones || {};
            }

            // Sin cambios: no se reescribe nada
            if (habiaDatos && JSON.stringify(remotas) === JSON.stringify(datosCanciones)) {
                notificarEstadoGuardado('completado');
                return datosCanciones;
            }

            notificarEstadoGuardado('guardando');
            datosCanciones = remotas;
            notificarDatos();
            await guardarCancionesLocal(remotas);
            notificarEstadoGuardado('completado');
            return datosCanciones;
        } catch (err) {
            console.warn('No se pudo sincronizar canciones, se usa la copia local.', err && err.message);
            notificarEstadoGuardado('offline');
            return datosCanciones || {};
        } finally {
            sincronizandoCanciones = null;
        }
    })();

    return sincronizandoCanciones;
}

function cargarCanciones() {
    if (!CONFIGURADO) return Promise.reject(new Error('FIREBASE_NO_CONFIGURADO'));

    if (!promesaCanciones) {
        promesaCanciones = (async () => {
            const local = await leerCancionesLocal();

            if (local) {
                datosCanciones = local;
                notificarEstadoGuardado(navigator.onLine ? 'completado' : 'offline');
                if (navigator.onLine) sincronizarCanciones();   // sin esperar
                return datosCanciones;
            }

            if (!navigator.onLine) {
                datosCanciones = {};
                notificarEstadoGuardado('offline');
                return datosCanciones;
            }

            await sincronizarCanciones();    // primera vez: no hay nada local que mostrar
            datosCanciones = datosCanciones || {};
            return datosCanciones;
        })();

        // Si no se obtuvo nada, se permite reintentar en la siguiente llamada
        promesaCanciones.then(d => { if (!d || Object.keys(d).length === 0) promesaCanciones = null; });
    }
    return promesaCanciones;
}

// Fuerza una sincronización inmediata (tras subir canciones o al recuperar conexión)
export function sincronizarAhora() {
    return sincronizarCanciones();
}

// ───────────────────────── Consultas ─────────────────────────

// Versión ligera (sin el texto de la canción). La portada usa artistaS si existe.
function resumen(c) {
    return {
        idC: c.idC,
        nombreC: c.nombreC,
        carpeta: c.carpeta,
        artistaP: c.artistaP,
        artistaS: c.artistaS,
        albumC: c.albumC,
        albumBusqueda: c.albumBusqueda,
        estado: c.estado,
        // La carátula se busca con el artista secundario, o el principal, o (si no hay) la carpeta
        artistaCaratula: c.artistaS || c.artistaP || c.carpeta
    };
}

export async function obtenerCanciones() {
    await cargarCanciones();
    return Object.values(datosCanciones || {}).map(resumen);
}

// Igual que obtenerCanciones, pero primero trae lo último de Firebase (para el panel de subida)
export async function obtenerCancionesFrescas() {
    await cargarCanciones();
    await sincronizarCanciones();
    return Object.values(datosCanciones || {}).map(resumen);
}

// Carpetas "Los Panchos", "los panchos" y "LOS PANCHOS" son el mismo grupo (mismo idA). Para mostrarlo se usa
// la escritura que más se repite; si empatan, la de la canción más antigua.
function nombresCanonicos() {
    const grupos = new Map();   // idA -> Map(escritura -> { veces, idMin })
    for (const c of Object.values(datosCanciones || {})) {
        const idA = slugArtista(c.carpeta);
        if (!grupos.has(idA)) grupos.set(idA, new Map());
        const escrituras = grupos.get(idA);
        const num = /^\d+$/.test(c.idC) ? Number(c.idC) : Number.MAX_SAFE_INTEGER;
        const actual = escrituras.get(c.carpeta) || { veces: 0, idMin: num };
        actual.veces++;
        actual.idMin = Math.min(actual.idMin, num);
        escrituras.set(c.carpeta, actual);
    }

    const nombres = new Map();
    for (const [idA, escrituras] of grupos) {
        const mejor = [...escrituras.entries()]
            .sort((a, b) => (b[1].veces - a[1].veces) || (a[1].idMin - b[1].idMin))[0];
        nombres.set(idA, mejor[0]);
    }
    return nombres;
}

// Agrupa por carpeta: [{ idA, nombreA, total }] ordenado alfabéticamente (nombreA = nombre de la carpeta)
export async function obtenerArtistas() {
    await cargarCanciones();
    const nombres = nombresCanonicos();
    const totales = new Map();

    for (const c of Object.values(datosCanciones || {})) {
        const idA = slugArtista(c.carpeta);
        totales.set(idA, (totales.get(idA) || 0) + 1);
    }

    return [...totales.entries()]
        .map(([idA, total]) => ({ idA, nombreA: nombres.get(idA), total }))
        .sort((a, b) => comparar(a.nombreA, b.nombreA));
}

// Canciones de un artista: terminadas primero, luego por revisar, luego sin terminar (A-Z en cada grupo).
// nombreA = nombre con el que se muestra al artista.
export async function obtenerCancionesDeArtista(idA) {
    const canciones = await obtenerCanciones();
    const nombreA = nombresCanonicos().get(idA);
    return canciones
        .filter(c => slugArtista(c.carpeta) === idA)
        .map(c => ({ ...c, nombreA }))
        .sort((a, b) => (ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado]) || comparar(a.nombreC, b.nombreC));
}

export async function obtenerContenidoCancion(idC) {
    await cargarCanciones();
    const id = String(idC ?? '').trim();
    let c = datosCanciones ? datosCanciones[id] : null;

    // Canción más nueva que la copia local: se pide solo esa
    if (!c && navigator.onLine && /^[A-Za-z0-9_\-]+$/.test(id)) {
        try {
            const normalizada = normalizarCanciones({ [id]: await leerRemoto(`canciones/${id}`) })[id];
            if (normalizada) {
                c = normalizada;
                datosCanciones = { ...(datosCanciones || {}), [id]: c };
                guardarUnaCancionLocal(c);
            }
        } catch (_) {}
    }

    if (!c) return { error: 'Canción no encontrada' };
    const idA = slugArtista(c.carpeta);
    return { ...c, idA, nombreA: nombresCanonicos().get(idA) || c.carpeta };
}

// ───────────────────────── Portadas ─────────────────────────

// Disco de vinilo dibujado en SVG: no depende de ninguna web externa y funciona sin conexión
export const PORTADA_FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
    '<rect width="200" height="200" fill="#1E1E24"/>' +
    '<circle cx="100" cy="100" r="82" fill="#0d0d0d"/>' +
    '<circle cx="100" cy="100" r="66" fill="none" stroke="#26262e" stroke-width="2"/>' +
    '<circle cx="100" cy="100" r="52" fill="none" stroke="#26262e" stroke-width="2"/>' +
    '<circle cx="100" cy="100" r="38" fill="none" stroke="#26262e" stroke-width="2"/>' +
    '<circle cx="100" cy="100" r="24" fill="#BC9731"/>' +
    '<circle cx="100" cy="100" r="4" fill="#0d0d0d"/></svg>'
);

// ── Portada de ARTISTA: portadas-artistas-cache.json (Discogs) ──

let promesaPortadasArtistas = null;

function cargarPortadasArtistas() {
    if (!promesaPortadasArtistas) {
        promesaPortadasArtistas = fetch('portadas-artistas-cache.json')
            .then(r => (r.ok ? r.json() : {}))
            .then(json => {
                const porNombre = new Map();
                for (const [nombre, url] of Object.entries(json || {})) {
                    if (nombre === '_v' || typeof url !== 'string' || !url) continue;
                    porNombre.set(normalizar(nombre), url);
                }
                return porNombre;
            })
            .catch(() => new Map());
    }
    return promesaPortadasArtistas;
}

// Foto del artista (Discogs). Si no hay, se usa la carátula de uno de sus álbumes; si tampoco, el disco.
export async function obtenerPortadaArtista(nombreA, idA) {
    const mapa = await cargarPortadasArtistas();
    const foto = mapa.get(normalizar(nombreA));
    if (foto) return foto;

    try {
        const canciones = await obtenerCancionesDeArtista(idA);
        const conAlbum = canciones
            .filter(c => c.albumC && normalizar(c.albumC) !== 'sencillo')
            .slice(0, 3);
        for (const c of conAlbum) {
            const url = await obtenerPortadaAlbumCancion(c.artistaCaratula, c.albumC, c.albumBusqueda);
            if (url !== PORTADA_FALLBACK) return url;
        }
    } catch (_) {}
    return PORTADA_FALLBACK;
}

// ── Portada de ÁLBUM: iTunes ──

const ITUNES_API = 'https://itunes.apple.com/search';
const ITUNES_REGION = 'mx';
const MAX_REINTENTOS = 3;
const CONCURRENCIA_MAX = 3;          // máximo de peticiones simultáneas a iTunes
const DELAY_ENTRE_PETICIONES = 150;  // ms entre cada petición

// Caché de portadas (localStorage)
const CACHE_PREFIX = 'portada_cache_';
const CACHE_DURACION_MS = 30 * 24 * 60 * 60 * 1000;   // 30 días
const CACHE_ACTIVO = true;                            // 🔧 pon false para probar sin caché

function obtenerDeCache(clave) {
    if (!CACHE_ACTIVO) return null;
    try {
        const item = localStorage.getItem(CACHE_PREFIX + clave);
        if (!item) return null;
        const { url, timestamp } = JSON.parse(item);
        if (Date.now() - timestamp > CACHE_DURACION_MS) {
            localStorage.removeItem(CACHE_PREFIX + clave);
            return null;
        }
        return url;
    } catch {
        return null;
    }
}

function guardarEnCache(clave, url) {
    if (!CACHE_ACTIVO) return;
    try {
        localStorage.setItem(CACHE_PREFIX + clave, JSON.stringify({ url, timestamp: Date.now() }));
    } catch {}
}

// Cola de concurrencia
let enCurso = 0;
const cola = [];

function procesarCola() {
    while (enCurso < CONCURRENCIA_MAX && cola.length > 0) {
        const { resolve, fn } = cola.shift();
        enCurso++;
        fn()
            .catch(() => null)
            .then(resultado => {
                enCurso--;
                resolve(resultado);
                procesarCola();
            });
    }
}

function encolar(fn) {
    return new Promise(resolve => {
        cola.push({ resolve, fn });
        procesarCola();
    });
}

async function fetchItunes(url, etiqueta) {
    return encolar(async () => {
        await new Promise(r => setTimeout(r, DELAY_ENTRE_PETICIONES));
        for (let i = 1; i <= MAX_REINTENTOS; i++) {
            try {
                const res = await fetch(url);
                if (res.status === 403) {
                    console.warn(`[iTunes] 403 "${etiqueta}" — reintento ${i}/${MAX_REINTENTOS}`);
                    await new Promise(r => setTimeout(r, 500 * i));
                    continue;
                }
                if (!res.ok) return null;
                return await res.json();
            } catch {
                console.warn(`[iTunes] Error de red (intento ${i}) para "${etiqueta}"`);
            }
        }
        return null;
    });
}

// nombreArtista = artista de la carátula: artistaS si existe, si no artistaP.
// terminoBusqueda (opcional, "[Álbum {Palabras}]"): se busca con esas palabras, pero solo se
// acepta un resultado cuyo álbum se llame nombreAlbum.
export async function obtenerPortadaAlbumCancion(nombreArtista, nombreAlbum, terminoBusqueda) {
    // Sin álbum (o "Sencillo"): portada por defecto
    if (!nombreAlbum?.trim() || normalizar(nombreAlbum) === normalizar('Sencillo')) {
        return PORTADA_FALLBACK;
    }
    if (!navigator.onLine) {
        return obtenerDeCache(claveCacheAlbum(nombreArtista, nombreAlbum, terminoBusqueda)) || PORTADA_FALLBACK;
    }

    const claveCache = claveCacheAlbum(nombreArtista, nombreAlbum, terminoBusqueda);
    const cacheado = obtenerDeCache(claveCache);
    if (cacheado) return cacheado;

    const terminoConArtista = `${nombreArtista} ${terminoBusqueda || nombreAlbum}`;

    // Intento 1: región México. Intento 2: región por defecto.
    let resultado = await buscarYFiltrar(terminoConArtista, nombreArtista, nombreAlbum, ITUNES_REGION);
    if (!resultado) resultado = await buscarYFiltrar(terminoConArtista, nombreArtista, nombreAlbum, null);

    if (resultado) {
        guardarEnCache(claveCache, resultado);
        return resultado;
    }
    return PORTADA_FALLBACK;
}

function claveCacheAlbum(artista, album, termino) {
    return `album_${normalizar(artista)}_${normalizar(album)}` + (termino ? `_b${normalizar(termino)}` : '');
}

// Descarta álbumes de una sola canción (suelen ser sencillos mal etiquetados) y aplica 3 niveles:
// exacto (álbum + artista) → parcial (álbum contiene + artista) → solo álbum.
async function buscarYFiltrar(termino, artistaBusqueda, albumBusqueda, region) {
    try {
        const paramsRegion = region ? `&country=${region}` : '';
        const url = `${ITUNES_API}?term=${encodeURIComponent(termino)}${paramsRegion}&media=music&entity=album&limit=10`;
        const datos = await fetchItunes(url, termino);
        if (!datos?.results?.length) return null;

        const resultados = datos.results.filter(r => r.trackCount !== 1);
        if (!resultados.length) return null;

        const albumNorm = normalizar(albumBusqueda);
        const artistaNorm = normalizar(artistaBusqueda);
        const portada = (r) => r.artworkUrl100.replace('100x100', '300x300');

        const exacto = resultados.find(r =>
            normalizar(r.collectionName) === albumNorm && normalizar(r.artistName).includes(artistaNorm));
        if (exacto) return portada(exacto);

        const parcial = resultados.find(r =>
            normalizar(r.collectionName).includes(albumNorm) && normalizar(r.artistName).includes(artistaNorm));
        if (parcial) return portada(parcial);

        const soloAlbum = resultados.find(r => normalizar(r.collectionName) === albumNorm);
        if (soloAlbum) return portada(soloAlbum);

        return null;
    } catch (err) {
        console.warn('[iTunes] Error de red/parseo:', err);
        return null;
    }
}

// ───────────────────────── Arranque ─────────────────────────

async function pedirAlmacenamientoPersistente() {
    // Evita que el navegador borre la copia local cuando falte espacio
    try {
        if (navigator.storage && navigator.storage.persist && !(await navigator.storage.persisted())) {
            await navigator.storage.persist();
        }
    } catch (_) {}
}

if (typeof window !== 'undefined') {
    const refrescar = () => { if (CONFIGURADO) sincronizarCanciones(); };

    window.addEventListener('online', refrescar);
    window.addEventListener('offline', () => notificarEstadoGuardado('offline'));
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && navigator.onLine &&
            Date.now() - ultimaSincronizacion > REFRESCO_MIN_MS) {
            refrescar();
        }
    });

    pedirAlmacenamientoPersistente();
    if (CONFIGURADO) cargarCanciones().catch(() => {});   // precarga al iniciar
}
