// js/datos.js
// Todo lo que tiene que ver con las CANCIONES:
//   1. Nombres de archivo  → "--nombreC (artistaP) [artistaS - albumC].txt"
//   2. Base de datos       → Firebase Realtime Database (API REST) con copia local en IndexedDB
//   3. Consultas           → artistas, canciones de un artista, contenido de una canción
//
// Registro de una canción (canciones/{id}):
//   { idC, nombreC, artistaP, artistaS, albumC, albumBusqueda?, estado, contenido }
//   artistaP = artista principal: así se organizan las canciones en la página.
//   artistaS = artista secundario: solo cambia de quién se busca la carátula.

import { DATABASE_URL, CONFIGURADO } from './config.js';

export { CONFIGURADO };

// ═══════════════════════════ 1. Nombres de archivo ═══════════════════════════
//
// Guiones al inicio → estado: 0 = terminada · 1 = por revisar · 2 o más = sin terminar
// El "(artistaP)" es opcional: si falta, se usa el nombre de la carpeta que contiene al archivo.

export const ESTADOS = ['terminada', 'revisar', 'pendiente'];

export const ETIQUETA_ESTADO = {
    terminada: 'Terminada',
    revisar: 'Por revisar',
    pendiente: 'Sin terminar'
};

export const ORDEN_ESTADO = { terminada: 0, revisar: 1, pendiente: 2 };

// Minúsculas, sin acentos ni símbolos: para comparar nombres ("José José" == "jose jose")
export const normalizar = (s) => String(s ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');

// Identificador de artista para la URL (canciones.html?idA=...)
export function slugArtista(nombre) {
    const limpio = String(nombre ?? '')
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return limpio || encodeURIComponent(String(nombre ?? '').trim().toLowerCase()) || 'otros';
}

export function escaparHTML(texto) {
    return String(texto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function estadoDesdeGuiones(cantidad) {
    if (cantidad <= 0) return 'terminada';
    if (cantidad === 1) return 'revisar';
    return 'pendiente';
}

/**
 * Interpreta "--Nombre (Artista) [Artista secundario - Álbum {búsqueda}].txt".
 * Devuelve { ok:true, nombreC, artistaP, artistaS, albumC, albumBusqueda, estado } o { ok:false, error }.
 */
export function parsearNombreArchivo(nombreArchivo, carpetaArchivo = '') {
    const base = String(nombreArchivo ?? '')
        .replace(/^.*[\\/]/, '')
        .replace(/\.txt$/i, '')
        .trim();

    const guiones = base.match(/^-*/)[0].length;
    const estado = estadoDesdeGuiones(guiones);
    let resto = base.slice(guiones).trim();

    let albumC = '';
    let artistaS = '';
    let albumBusqueda = '';

    // 1) Corchetes finales: [albumC] · [artistaS - albumC] · [albumC {búsqueda}]
    const corchetes = resto.match(/\s*\[([^\[\]]*)\]\s*$/);
    if (corchetes) {
        resto = resto.slice(0, corchetes.index).trim();
        let interior = corchetes[1].trim();

        const busqueda = interior.match(/^(.*)\{([^{}]*)\}\s*$/);
        if (busqueda) {
            interior = busqueda[1].trim();
            albumBusqueda = busqueda[2].trim();
        }

        // "artistaS - albumC": se separa por el PRIMER " - " (el álbum puede llevar guiones)
        const corte = interior.indexOf(' - ');
        if (corte > -1) {
            artistaS = interior.slice(0, corte).trim();
            albumC = interior.slice(corte + 3).trim();
        } else {
            albumC = interior;
        }
    }

    // 2) Paréntesis finales: (artistaP). El título puede tener paréntesis propios: se toma el último.
    let nombreC = resto;
    let artistaP = '';
    const parentesis = resto.match(/^(.*)\(([^()]*)\)\s*$/);
    if (parentesis && parentesis[1].trim()) {
        nombreC = parentesis[1].trim();
        artistaP = parentesis[2].trim();
    }

    if (!nombreC) return { ok: false, error: 'Falta el nombre de la canción' };

    // 3) Sin "(artista)" en el nombre → el artista es la carpeta que contiene al archivo
    artistaP = artistaP || String(carpetaArchivo ?? '').trim();
    if (!artistaP) {
        return { ok: false, error: 'No trae (Artista) y no está dentro de una carpeta: no se sabe de qué artista es' };
    }

    return { ok: true, nombreC, artistaP, artistaS, albumC, albumBusqueda, estado };
}

// Quita lo que Windows no permite en nombres de archivo y los símbolos que rompen la lectura del nombre
const limpiarParaNombre = (texto, quitarSimbolos = false) => {
    let t = String(texto ?? '').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').replace(/\s+/g, ' ');
    if (quitarSimbolos) t = t.replace(/[()\[\]{}]/g, '');
    return t.trim();
};

/**
 * Nombre de archivo con el formato que acepta la subida:  --nombreC (artistaP) [artistaS - albumC].txt
 * El artista secundario solo cabe en el nombre si hay álbum (va dentro del mismo corchete).
 */
export function construirNombreArchivo({ nombreC, artistaP, artistaS, albumC, albumBusqueda, estado }) {
    const guiones = estado === 'revisar' ? '-' : estado === 'pendiente' ? '--' : '';
    let nombre = guiones + (limpiarParaNombre(nombreC) || 'Sin título');

    const principal = limpiarParaNombre(artistaP, true);
    if (principal) nombre += ` (${principal})`;

    let album = limpiarParaNombre(albumC, true);
    if (album) {
        const busqueda = limpiarParaNombre(albumBusqueda, true);
        if (busqueda) album += ` {${busqueda}}`;
        const secundario = limpiarParaNombre(artistaS, true);
        nombre += ` [${secundario ? `${secundario} - ${album}` : album}]`;
    }

    return nombre.replace(/[. ]+$/, '') + '.txt';
}

// ═══════════════════════════ 2. Base de datos ═══════════════════════════

const IDB_NOMBRE = 'cancionero-artistas';
const IDB_VERSION = 1;
const TIMEOUT_MS = 12000;
const REFRESCO_MIN_MS = 60000;      // al volver a la pestaña no se sincroniza si hace menos de 1 min
const ARTISTA_SIN_NOMBRE = 'Otros';

const comparar = (a, b) => String(a).localeCompare(String(b), 'es', { sensitivity: 'base' });

function aObjeto(crudo) {
    if (!crudo || typeof crudo !== 'object') return {};
    if (Array.isArray(crudo)) {
        const salida = {};
        crudo.forEach((v, i) => { if (v !== null && v !== undefined) salida[String(i)] = v; });
        return salida;
    }
    return crudo;
}

// Petición a la API REST de Firebase (lectura y escritura; las reglas de la base de datos deciden quién puede escribir)
async function pedir(metodo, ruta, cuerpo, consulta = '') {
    if (!CONFIGURADO) throw new Error('FIREBASE_NO_CONFIGURADO');
    if (!/^[A-Za-z0-9_\-\/]+$/.test(ruta)) throw new Error('Ruta inválida');
    if (!navigator.onLine) throw new Error('Sin conexión');

    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_MS);
    try {
        const opciones = { method: metodo, signal: controlador.signal, cache: 'no-store', credentials: 'omit' };
        if (cuerpo !== undefined) {
            opciones.headers = { 'Content-Type': 'application/json' };
            opciones.body = JSON.stringify(cuerpo);
        }
        const respuesta = await fetch(`${DATABASE_URL}/${ruta}.json${consulta}`, opciones);
        if (!respuesta.ok) {
            const error = new Error(`HTTP ${respuesta.status}`);
            error.status = respuesta.status;
            throw error;
        }
        return await respuesta.json();
    } finally {
        clearTimeout(temporizador);
    }
}

export const mensajeDeError = (err) =>
    err && (err.status === 401 || err.status === 403)
        ? 'La base de datos no permite escribir: revisa las reglas (database.rules.json).'
        : 'No se pudo completar. Revisa tu conexión e inténtalo de nuevo.';

// Solo las claves de "canciones" (sin descargar el contenido): para calcular el siguiente id
export async function obtenerIdsRemotos() {
    return Object.keys((await pedir('GET', 'canciones', undefined, '?shallow=true')) || {});
}

// Siguiente(s) id(s) numérico(s) libres: consulta justo ahora para no pisar otros cambios
export async function reservarIds(cantidad = 1) {
    let claves;
    try { claves = await obtenerIdsRemotos(); }
    catch (_) { claves = Object.keys(datosCanciones || {}); }
    let max = 0;
    claves.forEach(k => { if (/^\d+$/.test(k)) max = Math.max(max, parseInt(k, 10)); });
    return Array.from({ length: cantidad }, (_, i) => String(max + 1 + i));
}

function registroParaGuardar(c) {
    const registro = {
        idC: String(c.idC),
        nombreC: c.nombreC,
        artistaP: c.artistaP || '',
        artistaS: c.artistaS || '',
        albumC: c.albumC || '',
        estado: ESTADOS.includes(c.estado) ? c.estado : 'terminada',
        contenido: c.contenido ?? ''
    };
    if (c.albumBusqueda) registro.albumBusqueda = c.albumBusqueda;
    return registro;
}

// Crea o reemplaza una canción
export async function guardarCancion(cancion) {
    const registro = registroParaGuardar(cancion);
    await pedir('PUT', `canciones/${registro.idC}`, registro);
    await sincronizarAhora();
    return registro;
}

// Crea o reemplaza varias a la vez: { id: cancion }
export async function guardarCanciones(porId) {
    const cuerpo = {};
    for (const [id, c] of Object.entries(porId)) cuerpo[id] = registroParaGuardar({ ...c, idC: id });
    await pedir('PATCH', 'canciones', cuerpo);
}

export async function eliminarCancion(idC) {
    await pedir('DELETE', `canciones/${encodeURIComponent(idC)}`);
    await sincronizarAhora();
}

// ── Copia local (IndexedDB): las canciones se muestran al instante y se sincronizan en segundo plano ──

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
        peticion.onsuccess = () => resolver(peticion.result);
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

        salida[id] = {
            idC: id,
            nombreC,
            // Registros del formato anterior (con "carpeta"): la carpeta hace de artista si no hay otro
            artistaP: texto(c.artistaP).trim() || texto(c.carpeta).trim() || ARTISTA_SIN_NOMBRE,
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

// ── Estado de sincronización (el indicador junto al título) y avisos de datos nuevos ──

const callbacksEstado = [];
let estadoActual = 'guardando';

export function alCambiarEstadoGuardado(callback) {
    callbacksEstado.push(callback);
    callback(estadoActual);
}

function notificarEstado(nuevo) {
    if (nuevo === estadoActual) return;
    estadoActual = nuevo;
    callbacksEstado.forEach(cb => { try { cb(nuevo); } catch (_) {} });
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

// ── Carga y sincronización ──

let datosCanciones = null;       // { idC: registro }
let promesaCanciones = null;
let sincronizando = null;
let ultimaSincronizacion = 0;

function sincronizarCanciones() {
    if (sincronizando) return sincronizando;

    sincronizando = (async () => {
        const habiaDatos = !!datosCanciones && Object.keys(datosCanciones).length > 0;
        try {
            const crudo = await pedir('GET', 'canciones');
            const remotas = normalizarCanciones(crudo);
            ultimaSincronizacion = Date.now();

            // La base de datos quedó vacía a propósito: se refleja (solo si la respuesta fue válida)
            if (Object.keys(remotas).length === 0) {
                if (crudo === null && habiaDatos) {
                    datosCanciones = {};
                    await guardarCancionesLocal({});
                    notificarDatos();
                }
                notificarEstado('completado');
                return datosCanciones || {};
            }

            // Sin cambios: no se reescribe nada
            if (habiaDatos && JSON.stringify(remotas) === JSON.stringify(datosCanciones)) {
                notificarEstado('completado');
                return datosCanciones;
            }

            notificarEstado('guardando');
            datosCanciones = remotas;
            notificarDatos();
            await guardarCancionesLocal(remotas);
            notificarEstado('completado');
            return datosCanciones;
        } catch (err) {
            console.warn('No se pudo sincronizar canciones, se usa la copia local.', err && err.message);
            notificarEstado('offline');
            return datosCanciones || {};
        } finally {
            sincronizando = null;
        }
    })();

    return sincronizando;
}

function cargarCanciones() {
    if (!CONFIGURADO) return Promise.reject(new Error('FIREBASE_NO_CONFIGURADO'));

    if (!promesaCanciones) {
        promesaCanciones = (async () => {
            const local = await leerCancionesLocal();

            if (local) {
                datosCanciones = local;
                notificarEstado(navigator.onLine ? 'completado' : 'offline');
                if (navigator.onLine) sincronizarCanciones();   // sin esperar
                return datosCanciones;
            }

            if (!navigator.onLine) {
                datosCanciones = {};
                notificarEstado('offline');
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

// Fuerza una sincronización inmediata (tras subir, editar o borrar canciones)
export function sincronizarAhora() {
    return sincronizarCanciones();
}

// ═══════════════════════════ 3. Consultas ═══════════════════════════

// Versión ligera (sin el texto de la canción). La carátula se busca con artistaS si existe, si no con artistaP.
function resumen(c) {
    return {
        idC: c.idC,
        nombreC: c.nombreC,
        artistaP: c.artistaP,
        artistaS: c.artistaS,
        albumC: c.albumC,
        albumBusqueda: c.albumBusqueda,
        estado: c.estado,
        artistaCaratula: c.artistaS || c.artistaP
    };
}

export async function obtenerCanciones() {
    await cargarCanciones();
    return Object.values(datosCanciones || {}).map(resumen);
}

// Igual que obtenerCanciones, pero primero trae lo último de Firebase (para detectar canciones ya subidas)
export async function obtenerCancionesFrescas() {
    await cargarCanciones();
    await sincronizarCanciones();
    return Object.values(datosCanciones || {}).map(resumen);
}

// Con el contenido completo (para el ZIP)
export async function obtenerTodasCompletas() {
    await cargarCanciones();
    return Object.values(datosCanciones || {});
}

// Un artista con UNA sola canción se muestra dentro de "Otros" (solo en pantalla: la base de datos no cambia).
const ID_OTROS = 'otros';

function agrupador() {
    const conteos = new Map();
    for (const c of Object.values(datosCanciones || {})) {
        const idA = slugArtista(c.artistaP);
        conteos.set(idA, (conteos.get(idA) || 0) + 1);
    }
    const nombres = nombresCanonicos();
    return {
        idDe: (c) => {
            const idA = slugArtista(c.artistaP);
            return conteos.get(idA) === 1 ? ID_OTROS : idA;
        },
        nombreDe: (idA) => (idA === ID_OTROS ? 'Otros' : nombres.get(idA))
    };
}

// "Los Panchos", "los panchos" y "LOS PANCHOS" son el mismo artista (mismo idA). Para mostrarlo se usa
// la escritura que más se repite; si empatan, la de la canción más antigua.
function nombresCanonicos() {
    const grupos = new Map();   // idA -> Map(escritura -> { veces, idMin })
    for (const c of Object.values(datosCanciones || {})) {
        const idA = slugArtista(c.artistaP);
        if (!grupos.has(idA)) grupos.set(idA, new Map());
        const escrituras = grupos.get(idA);
        const num = /^\d+$/.test(c.idC) ? Number(c.idC) : Number.MAX_SAFE_INTEGER;
        const actual = escrituras.get(c.artistaP) || { veces: 0, idMin: num };
        actual.veces++;
        actual.idMin = Math.min(actual.idMin, num);
        escrituras.set(c.artistaP, actual);
    }

    const nombres = new Map();
    for (const [idA, escrituras] of grupos) {
        const mejor = [...escrituras.entries()]
            .sort((a, b) => (b[1].veces - a[1].veces) || (a[1].idMin - b[1].idMin))[0];
        nombres.set(idA, mejor[0]);
    }
    return nombres;
}

const porEstadoYNombre = (a, b) =>
    (ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado]) || comparar(a.nombreC, b.nombreC);

// Agrupa por artista principal: [{ idA, nombreA, total }] ordenado alfabéticamente
export async function obtenerArtistas() {
    await cargarCanciones();
    const { idDe, nombreDe } = agrupador();
    const totales = new Map();

    for (const c of Object.values(datosCanciones || {})) {
        const idA = idDe(c);
        totales.set(idA, (totales.get(idA) || 0) + 1);
    }

    // "Otros" siempre al final
    return [...totales.entries()]
        .map(([idA, total]) => ({ idA, nombreA: nombreDe(idA), total }))
        .sort((a, b) => (a.idA === ID_OTROS) - (b.idA === ID_OTROS) || comparar(a.nombreA, b.nombreA));
}

// Canciones de un artista: terminadas primero, luego por revisar, luego sin terminar (A-Z en cada grupo)
export async function obtenerCancionesDeArtista(idA) {
    const canciones = await obtenerCanciones();
    const { idDe, nombreDe } = agrupador();
    const nombreA = nombreDe(idA);
    return canciones
        .filter(c => idDe(c) === idA)
        .map(c => ({ ...c, nombreA }))
        .sort(porEstadoYNombre);
}

// Todas las canciones agrupadas por artista: [{ idA, nombreA, canciones: [...] }] (para el administrador)
export async function obtenerCancionesAgrupadas() {
    const canciones = await obtenerCanciones();
    const { idDe, nombreDe } = agrupador();
    const grupos = new Map();
    for (const c of canciones) {
        const idA = idDe(c);
        if (!grupos.has(idA)) grupos.set(idA, { idA, nombreA: nombreDe(idA), canciones: [] });
        grupos.get(idA).canciones.push({ ...c, idA, nombreA: nombreDe(idA) });
    }
    return [...grupos.values()]
        .map(g => ({ ...g, canciones: g.canciones.sort(porEstadoYNombre) }))
        .sort((a, b) => (a.idA === ID_OTROS) - (b.idA === ID_OTROS) || comparar(a.nombreA, b.nombreA));
}

export async function obtenerContenidoCancion(idC) {
    await cargarCanciones();
    const id = String(idC ?? '').trim();
    let c = datosCanciones ? datosCanciones[id] : null;

    // Canción más nueva que la copia local: se pide solo esa
    if (!c && navigator.onLine && /^[A-Za-z0-9_\-]+$/.test(id)) {
        try {
            const normalizada = normalizarCanciones({ [id]: await pedir('GET', `canciones/${id}`) })[id];
            if (normalizada) {
                c = normalizada;
                datosCanciones = { ...(datosCanciones || {}), [id]: c };
            }
        } catch (_) {}
    }

    if (!c) return { error: 'Canción no encontrada' };
    const { idDe, nombreDe } = agrupador();
    const idA = idDe(c);
    return { ...c, idA, nombreA: nombreDe(idA) || c.artistaP, artistaMostrar: nombresCanonicos().get(slugArtista(c.artistaP)) || c.artistaP };
}

// ═══════════════════════════ Arranque ═══════════════════════════

if (typeof window !== 'undefined') {
    const refrescar = () => { if (CONFIGURADO) sincronizarCanciones(); };

    window.addEventListener('online', refrescar);
    window.addEventListener('offline', () => notificarEstado('offline'));
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && navigator.onLine &&
            Date.now() - ultimaSincronizacion > REFRESCO_MIN_MS) {
            refrescar();
        }
    });

    if (CONFIGURADO) cargarCanciones().catch(() => {});   // precarga al iniciar
}
