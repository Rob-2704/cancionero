// js/portadas.js
// Todo lo que tiene que ver con las PORTADAS:
//   · foto del artista  → portadas-artistas-cache.json (generado con generar-portadas-artistas.js)
//   · carátula de álbum → iTunes, y como última opción Discogs
//   · disco de vinilo en SVG cuando no hay nada

import { normalizar, obtenerCancionesDeArtista } from './datos.js';
import { DISCOGS_TOKEN } from './config.js';


// Disco de vinilo dibujado en SVG: no depende de ninguna web externa y funciona sin conexión
export const PORTADA_FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
    '<rect width="200" height="200" fill="#1E1E24"/>' +
    '<circle cx="100" cy="100" r="82" fill="#0d0d0d"/>' +
    '<circle cx="100" cy="100" r="66" fill="none" stroke="#26262e" stroke-width="2"/>' +
    '<circle cx="100" cy="100" r="52" fill="none" stroke="#26262e" stroke-width="2"/>' +
    '<circle cx="100" cy="100" r="38" fill="none" stroke="#26262e" stroke-width="2"/>' +
    '<circle cx="100" cy="100" r="24" fill="#214fcf"/>' +
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

// ── Foto de ARTISTA en vivo: Discogs (igual que generar-portadas-artistas.js) ──

const CLAVE_FOTO = 'portada_artista_';
const CLAVE_SIN_FOTO = 'portada_sin_artista_';

const imagenValida = (u) => !!u && !/spacer\.gif/i.test(u);   // Discogs devuelve spacer.gif si no hay imagen

// De todas las imágenes de un artista: la principal, casi cuadrada, de mayor resolución
function mejorImagen(images) {
    const validas = (images || []).filter(i => imagenValida(i.uri));
    if (!validas.length) return '';
    const area = (i) => (i.width || 0) * (i.height || 0);
    const cuadrada = (i) => i.width && i.height && Math.abs(i.width / i.height - 1) < 0.15;
    const mejor = (arr) => [...arr].sort((a, b) => area(b) - area(a))[0];
    const primarias = validas.filter(i => i.type === 'primary');
    return (mejor(primarias.filter(cuadrada)) || mejor(validas.filter(cuadrada))
         || mejor(primarias) || mejor(validas)).uri;
}

// Devuelve { url, consultado }: consultado = true si Discogs contestó bien (aunque no hubiera foto)
async function buscarFotoArtistaDiscogs(nombre) {
    const pedirJson = (url) => encolarDiscogs(async () => {
        const res = await fetch(url);
        return res.ok ? res.json() : null;      // 401, 429, etc.: no se recuerda como "sin foto"
    });

    const busqueda = new URLSearchParams({ q: nombre, type: 'artist', per_page: '5', token: DISCOGS_TOKEN });
    const datos = await pedirJson(`${DISCOGS_API}?${busqueda}`);
    if (!datos) return { url: null, consultado: false };

    // Discogs añade "(2)", "(3)"... a artistas homónimos
    const n = normalizar(nombre);
    const r = (datos.results || []).find(x => normalizar((x.title || '').replace(/\s*\(\d+\)$/, '')) === n);
    if (!r) return { url: null, consultado: true };

    const detalle = r.resource_url && r.resource_url.startsWith('https://api.discogs.com/')
        ? await pedirJson(`${r.resource_url}?${new URLSearchParams({ token: DISCOGS_TOKEN })}`)
        : null;
    const url = (detalle && mejorImagen(detalle.images)) || (imagenValida(r.cover_image) ? r.cover_image : '');
    return { url: url || null, consultado: true };
}

// ── Foto de ARTISTA: Deezer (sin llave; JSONP porque su API no admite llamadas directas desde el navegador) ──

const DEEZER_API = 'https://api.deezer.com/search/artist';
const SIN_FOTO_DEEZER = 'portada_sin_deezer_';
let contadorJsonp = 0;
let colaDeezer = Promise.resolve();

function pedirJsonp(url, tiempoMs = 8000) {
    return new Promise((resolver, rechazar) => {
        const nombre = `__deezer_${Date.now()}_${++contadorJsonp}`;
        const script = document.createElement('script');
        const limpiar = () => { clearTimeout(timer); delete window[nombre]; script.remove(); };
        const timer = setTimeout(() => { limpiar(); rechazar(new Error('Deezer: tiempo agotado')); }, tiempoMs);
        window[nombre] = (datos) => { limpiar(); resolver(datos); };
        script.onerror = () => { limpiar(); rechazar(new Error('Deezer: error de red')); };
        script.src = `${url}&output=jsonp&callback=${nombre}`;
        document.head.appendChild(script);
    });
}

// Una consulta a la vez, con una pausa corta (Deezer permite unas 50 cada 5 s)
function encolarDeezer(fn) {
    const turno = colaDeezer.then(async () => {
        const r = await fn();
        await new Promise(res => setTimeout(res, 150));
        return r;
    });
    colaDeezer = turno.catch(() => {});
    return turno;
}

// Devuelve { url, consultado }
async function buscarFotoArtistaDeezer(nombre) {
    const datos = await encolarDeezer(() =>
        pedirJsonp(`${DEEZER_API}?${new URLSearchParams({ q: nombre, limit: '10' })}`).catch(() => null));
    if (!datos || datos.error) return { url: null, consultado: false };

    // Solo se acepta un artista con el mismo nombre (evita homónimos distintos)
    const n = normalizar(nombre);
    // Si hay varios con el mismo nombre (homónimos), el más popular (más fans)
    const r = (datos.data || [])
        .filter(x => normalizar(x.name) === n)
        .sort((a, b) => (b.nb_fan || 0) - (a.nb_fan || 0))[0];
    // Si Deezer no tiene foto, devuelve una imagen genérica con "/artist//" en la dirección
    const foto = r && [r.picture_xl, r.picture_big, r.picture_medium].find(u => u && !/\/artist\/\//.test(u));
    return { url: foto || null, consultado: true };
}

const enCursoArtista = new Map();   // evita buscar dos veces al mismo artista a la vez

// Foto del artista. Orden: copia del navegador → Deezer → portadas-artistas-cache.json → Discogs
// → carátula de uno de sus álbumes → disco de vinilo.
export function obtenerPortadaArtista(nombreA, idA) {
    const clave = normalizar(nombreA);
    if (!enCursoArtista.has(clave)) {
        enCursoArtista.set(clave, buscarPortadaArtista(nombreA, idA)
            .finally(() => enCursoArtista.delete(clave)));
    }
    return enCursoArtista.get(clave);
}

async function buscarPortadaArtista(nombreA, idA) {
    const clave = normalizar(nombreA);
    const esOtros = idA === 'otros';

    if (!esOtros) {
        // 1. Lo que ya se buscó en este navegador
        const guardada = obtenerDeCache(CLAVE_FOTO + clave);
        if (guardada) return guardada;

        // 2. Deezer en vivo (sin llave)
        if (navigator.onLine && !hayFalloReciente(SIN_FOTO_DEEZER + clave)) {
            try {
                const { url, consultado } = await buscarFotoArtistaDeezer(nombreA);
                if (url) { guardarEnCache(CLAVE_FOTO + clave, url); return url; }
                if (consultado) guardarFalloReciente(SIN_FOTO_DEEZER + clave);
            } catch (_) {}
        }

        // 3. Archivo generado con generar-portadas-artistas.js (fotos de Discogs)
        const mapa = await cargarPortadasArtistas();
        const foto = mapa.get(clave);
        if (foto) return foto;

        // 4. Discogs en vivo (solo con token, en línea y si no falló hace poco)
        if (DISCOGS_TOKEN && navigator.onLine && !hayFalloReciente(CLAVE_SIN_FOTO + clave)) {
            try {
                const { url, consultado } = await buscarFotoArtistaDiscogs(nombreA);
                if (url) { guardarEnCache(CLAVE_FOTO + clave, url); return url; }
                if (consultado) guardarFalloReciente(CLAVE_SIN_FOTO + clave);
            } catch (_) {}
        }
    }

    // 5. Carátula de uno de sus álbumes
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

    // Última opción: Discogs (solo si hay token y no falló hace poco para este mismo álbum)
    if (!resultado && DISCOGS_TOKEN && !hayFalloReciente(claveCache)) {
        const { url, consultado } = await buscarPortadaDiscogs(nombreArtista, nombreAlbum, terminoBusqueda);
        resultado = url;
        // Si Discogs respondió pero no había coincidencia, se recuerda para no volver a preguntar cada visita
        if (!url && consultado) guardarFalloReciente(claveCache);
    }

    if (resultado) {
        guardarEnCache(claveCache, resultado);
        return resultado;
    }
    return PORTADA_FALLBACK;
}

// ── Portada de ÁLBUM: Discogs (último recurso) ──

const DISCOGS_API = 'https://api.discogs.com/database/search';
const DISCOGS_DELAY_MS = 1100;                       // el límite de Discogs es de 60 peticiones por minuto
const FALLO_PREFIX = 'portada_sin_';
const FALLO_DURACION_MS = 7 * 24 * 60 * 60 * 1000;   // 7 días

function hayFalloReciente(clave) {
    try {
        const t = Number(localStorage.getItem(FALLO_PREFIX + clave));
        return !!t && Date.now() - t < FALLO_DURACION_MS;
    } catch { return false; }
}

function guardarFalloReciente(clave) {
    try { localStorage.setItem(FALLO_PREFIX + clave, String(Date.now())); } catch {}
}

// Las consultas a Discogs se hacen de una en una y espaciadas
let colaDiscogs = Promise.resolve();

function encolarDiscogs(fn) {
    const turno = colaDiscogs.then(async () => {
        const r = await fn().catch(() => null);
        await new Promise(res => setTimeout(res, DISCOGS_DELAY_MS));
        return r;
    });
    colaDiscogs = turno.catch(() => {});
    return turno;
}

const imagenDiscogsValida = (u) => !!u && !/spacer\.gif/i.test(u);

// Devuelve { url, consultado }: consultado = true si Discogs contestó bien (aunque no hubiera coincidencia)
async function buscarPortadaDiscogs(artista, album, termino) {
    const albumNorm = normalizar(album);
    const artistaNorm = normalizar(artista);

    const consultas = [
        // Con artista y título del álbum por separado, y solo álbumes "master" (uno por disco)
        { release_title: termino || album, artist: artista, type: 'master' },
        // Sin restringir el tipo
        { release_title: termino || album, artist: artista }
    ];

    let consultado = false;
    for (const params of consultas) {
        const datos = await encolarDiscogs(async () => {
            const query = new URLSearchParams({ ...params, per_page: '10', token: DISCOGS_TOKEN });
            const res = await fetch(`${DISCOGS_API}?${query}`);
            if (!res.ok) return null;            // 401, 429, etc.: no se recuerda como "sin coincidencia"
            return res.json();
        });
        if (!datos) continue;
        consultado = true;

        // Los títulos de Discogs vienen como "Artista - Álbum"
        const resultados = (datos.results || [])
            .filter(r => imagenDiscogsValida(r.cover_image) || imagenDiscogsValida(r.thumb))
            .map(r => {
                const corte = (r.title || '').indexOf(' - ');
                return {
                    artista: corte > -1 ? r.title.slice(0, corte) : '',
                    album: corte > -1 ? r.title.slice(corte + 3) : (r.title || ''),
                    imagen: imagenDiscogsValida(r.cover_image) ? r.cover_image : r.thumb
                };
            });

        // Mismos niveles que en iTunes: exacto → parcial → solo álbum
        const elegido =
            resultados.find(r => normalizar(r.album) === albumNorm && normalizar(r.artista).includes(artistaNorm)) ||
            resultados.find(r => normalizar(r.album).includes(albumNorm) && normalizar(r.artista).includes(artistaNorm)) ||
            resultados.find(r => normalizar(r.album) === albumNorm);

        if (elegido) return { url: elegido.imagen, consultado };
    }
    return { url: null, consultado };
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

// Carátula de una canción (artistaS si existe, si no artistaP)
export function obtenerPortadaCancion(c) {
    return obtenerPortadaAlbumCancion(c.artistaCaratula || c.artistaS || c.artistaP, c.albumC, c.albumBusqueda);
}
