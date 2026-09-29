// api-cliente.js — versión estática para GitHub Pages (sin PHP)
// Datos: indice.json (generado por generar-indice.js) + archivos .txt de /Canciones
// Portadas: iTunes API
const CARPETA = 'Canciones';
const ITUNES_API = 'https://itunes.apple.com/search';
const ITUNES_REGION = 'mx';

// ─────────────────────────────────────────────
// DATOS (indice.json + archivos .txt)
// ─────────────────────────────────────────────

let indicePromise = null;

function cargarIndice() {
    if (!indicePromise) {
        indicePromise = fetch('indice.json', { cache: 'no-cache' }).then(r => {
            if (!r.ok) throw new Error('No se pudo cargar indice.json');
            return r.json();
        });
    }
    return indicePromise;
}

export async function obtenerArtistas() {
    const indice = await cargarIndice();
    return indice.artistas.map(({ idA, nombreA }) => ({ idA, nombreA }));
}

export async function obtenerCanciones(idA) {
    const indice = await cargarIndice();
    const artista = indice.artistas.find(a => a.idA === idA);
    if (!artista) return [];
    return artista.canciones.map(c => ({
        ...c,
        // codificado para que caracteres como & # ? en el título no rompan la URL
        idC: encodeURIComponent(c.idC),
        // si es una versión de otro artista, ese artista tiene prioridad para la portada
        nombreA: c.nombreA || artista.nombreA
    }));
}

export async function obtenerContenidoCancion(idC) {
    const indice = await cargarIndice();
    let info = null;
    for (const a of indice.artistas) {
        info = a.canciones.find(c => c.idC === idC);
        if (info) break;
    }

    const ruta = [CARPETA, ...idC.split('/')].map(encodeURIComponent).join('/') + '.txt';
    const r = await fetch(ruta);
    if (!r.ok) return { error: `No se encontró el archivo (${r.status})` };

    return {
        idC,
        nombreC: info ? info.nombreC : idC.split('/').pop(),
        contenido: await r.text(),
        ytID: '',                     // pendiente: se definirá más adelante
        albumC: info ? info.albumC : ''
    };
}

// ─────────────────────────────────────────────
// FUNCIONES DE PORTADAS (via iTunes API)
// ─────────────────────────────────────────────

const PORTADA_FALLBACK = 'https://www.shutterstock.com/image-photo/highquality-png-analog-record-disc-600nw-2561107141.jpg';
const MAX_REINTENTOS = 3;
const CONCURRENCIA_MAX = 3; // máximo de peticiones simultáneas a iTunes
const DELAY_ENTRE_PETICIONES = 150; // ms entre cada petición

const normalizar = s => s?.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, '')
    .trim() ?? '';

// ── Caché de portadas (localStorage) ──────────
const CACHE_PREFIX = 'portada_cache_';
const CACHE_DURACION_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

// 🔧 INTERRUPTOR DE CACHÉ: pon en false para desactivar mientras pruebas cambios
const CACHE_ACTIVO = true;

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
        localStorage.setItem(CACHE_PREFIX + clave, JSON.stringify({
            url,
            timestamp: Date.now()
        }));
    } catch {
        // Si localStorage está lleno o no disponible, simplemente no cacheamos
    }
}

// ── Cola de concurrencia ──────────────────────
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

// ── Fetch con reintentos ──────────────────────
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

// ─────────────────────────────────────────────
// PORTADAS
// ─────────────────────────────────────────────

export async function obtenerPortadaArtista(nombreArtista) {
    const claveCache = `artista_${normalizar(nombreArtista)}`;
    const cacheado = obtenerDeCache(claveCache);
    if (cacheado) return cacheado;

    console.log(`[iTunes] Buscando artista: "${nombreArtista}"`);
    try {
        const query = encodeURIComponent(nombreArtista);
        const url = `${ITUNES_API}?term=${query}&country=${ITUNES_REGION}&media=music&entity=album&limit=1`;
        const datos = await fetchItunes(url, nombreArtista);
        if (datos?.results?.length > 0) {
            const portada = datos.results[0].artworkUrl100.replace('100x100', '300x300');
            guardarEnCache(claveCache, portada);
            return portada;
        }
        return PORTADA_FALLBACK;
    } catch (err) {
        console.log(`💥 Error de red/parseo:`, err);
        return PORTADA_FALLBACK;
    }
}

// nombreArtista y nombreAlbum llegan ya separados desde indice.json:
// si el archivo era "[José José - Gavilán O Paloma]", nombreArtista = "José José"
// y nombreAlbum = "Gavilán O Paloma", así que aquí ya no hay que partir el texto.
export async function obtenerPortadaAlbumCancion(nombreArtista, nombreAlbum) {
    const artistaBusqueda = nombreArtista;
    const albumBusqueda = nombreAlbum;

    // Sin álbum (o "Sencillo"): portada por defecto
    if (!albumBusqueda?.trim() || normalizar(albumBusqueda) === normalizar('Sencillo')) {
        return PORTADA_FALLBACK;
    }

    const claveCache = `album_${normalizar(artistaBusqueda)}_${normalizar(albumBusqueda)}`;
    const cacheado = obtenerDeCache(claveCache);
    if (cacheado) return cacheado;

    const etiquetaLog = `${artistaBusqueda} — ${albumBusqueda || '(sin álbum)'}`;
    console.group(`🎵 [${etiquetaLog}]`);

    // Intento 1: artista + álbum
    const terminoConArtista = albumBusqueda
        ? `${artistaBusqueda} ${albumBusqueda}`
        : artistaBusqueda;

    let resultado = await buscarYFiltrar(terminoConArtista, artistaBusqueda, albumBusqueda, ITUNES_REGION);

    // Intento 2: si falló, repetir el mismo término pero con región por defecto
    if (!resultado) {
        console.log(`🔁 Reintentando con el mismo término y región por defecto...`);
        resultado = await buscarYFiltrar(terminoConArtista, artistaBusqueda, albumBusqueda, null);
    }

    if (resultado) {
        console.groupEnd();
        guardarEnCache(claveCache, resultado);
        return resultado;
    }

    console.log(`❌ Sin coincidencias en ningún intento. Se usará el fallback.`);
    console.groupEnd();
    return PORTADA_FALLBACK;
}

// Realiza una búsqueda en iTunes con el término dado y aplica los 3 niveles de filtrado.
// Devuelve la URL de portada (300x300) o null si no hubo coincidencia.
async function buscarYFiltrar(termino, artistaBusqueda, albumBusqueda, region) {
    console.log(`📤 Enviado a iTunes: "${termino}"${region ? ` (región: ${region})` : ' (región por defecto)'}`);

    try {
        const query = encodeURIComponent(termino);
        const paramsRegion = region ? `&country=${region}` : '';
        const url = `${ITUNES_API}?term=${query}${paramsRegion}&media=music&entity=album&limit=10`;
        const datos = await fetchItunes(url, termino);

        console.log(`📥 Respuesta cruda de iTunes:`, datos?.results ?? []);

        if (!datos?.results?.length) {
            console.log(`❌ iTunes no devolvió resultados.`);
            return null;
        }

        const albumNorm  = normalizar(albumBusqueda);
        const artistaNorm = normalizar(artistaBusqueda);

        const exacto = datos.results.find(r =>
            normalizar(r.collectionName) === albumNorm &&
            normalizar(r.artistName).includes(artistaNorm)
        );
        if (exacto) {
            const portada = exacto.artworkUrl100.replace('100x100', '300x300');
            console.log(`✅ Elegido (nivel: exacto):`, exacto.collectionName, '—', exacto.artistName, '→', portada);
            return portada;
        }

        const parcial = datos.results.find(r =>
            normalizar(r.collectionName).includes(albumNorm) &&
            normalizar(r.artistName).includes(artistaNorm)
        );
        if (parcial) {
            const portada = parcial.artworkUrl100.replace('100x100', '300x300');
            console.log(`✅ Elegido (nivel: parcial):`, parcial.collectionName, '—', parcial.artistName, '→', portada);
            return portada;
        }

        const soloAlbum = datos.results.find(r =>
            normalizar(r.collectionName) === albumNorm
        );
        if (soloAlbum) {
            const portada = soloAlbum.artworkUrl100.replace('100x100', '300x300');
            console.log(`⚠️ Elegido (nivel: solo álbum, artista ignorado):`, soloAlbum.collectionName, '—', soloAlbum.artistName, '→', portada);
            return portada;
        }

        console.log(`❌ Ningún resultado coincidió en los 3 niveles.`);
        return null;
    } catch (err) {
        console.log(`💥 Error de red/parseo:`, err);
        return null;
    }
}
