// Uso: node generar-portadas-artistas.js
//
// Busca en Discogs la foto de cada artista que exista en la base de datos de Firebase y la guarda
// en portadas-artistas-cache.json (index.html la lee de ahí). Solo consulta los artistas que falten.
// Es opcional: si un artista no tiene foto aquí, index.html usa la carátula de uno de sus álbumes.
//
//   DISCOGS_TOKEN=xxxx node generar-portadas-artistas.js
//   REFRESCAR=1        → ignora la caché y vuelve a buscar todas
//   DATABASE_URL=...   → por defecto se lee de js/firebase-config.js
//
// Requiere Node 18 o superior (usa fetch).

const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'portadas-artistas-cache.json');
const TOKEN = process.env.DISCOGS_TOKEN || '';
const REFRESCAR = process.env.REFRESCAR === '1';
const DELAY_MS = Number(process.env.DISCOGS_DELAY_MS) || 1200;   // límite: 60 peticiones/min
const USER_AGENT = 'CancioneroPersonal/1.0';
const VERSION_CACHE = 1;

const dormir = ms => new Promise(r => setTimeout(r, ms));
const normalizar = s => (s || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '').trim();

function leerDatabaseUrl() {
    if (process.env.DATABASE_URL) return process.env.DATABASE_URL.replace(/\/$/, '');
    const config = fs.readFileSync(path.join(__dirname, 'js', 'firebase-config.js'), 'utf8');
    const m = config.match(/databaseURL:\s*"([^"]+)"/);
    if (!m || /TU-PROYECTO/.test(m[1])) throw new Error('Configura js/firebase-config.js (o define DATABASE_URL).');
    return m[1].replace(/\/$/, '');
}

// Nombres de artista principal (artistaP) distintos que hay en la base de datos
async function leerArtistasDeFirebase() {
    const res = await fetch(`${leerDatabaseUrl()}/canciones.json`);
    if (!res.ok) throw new Error(`No se pudo leer Firebase (HTTP ${res.status})`);
    const canciones = Object.values((await res.json()) || {});
    const nombres = new Set();
    for (const c of canciones) {
        const nombre = c && typeof c.artistaP === 'string' ? c.artistaP.trim() : '';
        if (nombre) nombres.add(nombre);
    }
    return [...nombres].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}

// ─────────────────────────────────────────────
// Discogs (fotos de artista) — igual que en el proyecto 2
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// Discogs (solo fotos de artista, para index.html)
// ─────────────────────────────────────────────

const buscarURL = p => 'https://api.discogs.com/database/search?' + new URLSearchParams(p);
const esApiDiscogs = u => typeof u === 'string' && u.startsWith('https://api.discogs.com/');
const imagenValida = u => !!u && !/spacer\.gif/i.test(u);   // Discogs devuelve spacer.gif si no hay imagen

// Devuelve el JSON, o undefined si falló (para no guardar el fallo en la caché)
async function discogs(url) {
    for (let i = 1; i <= 3; i++) {
        await dormir(DELAY_MS);
        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': USER_AGENT, Authorization: `Discogs token=${TOKEN}` }
            });
            if (res.status === 401) throw new Error('TOKEN_INVALIDO');
            if (res.status === 429) {
                console.warn('  429 (límite de peticiones): esperando 60 s...');
                await dormir(60000);
                continue;
            }
            if (!res.ok) { console.warn(`  HTTP ${res.status}, reintento ${i}/3`); continue; }
            return await res.json();
        } catch (e) {
            if (e.message === 'TOKEN_INVALIDO') throw e;
            console.warn(`  error de red (${e.message}), reintento ${i}/3`);
        }
    }
    return undefined;
}

// De todas las imágenes de un artista: la principal, casi cuadrada, de mayor resolución
function mejorImagen(images) {
    const validas = (images || []).filter(i => imagenValida(i.uri));
    if (!validas.length) return '';
    const area = i => (i.width || 0) * (i.height || 0);
    const cuadrada = i => i.width && i.height && Math.abs(i.width / i.height - 1) < 0.15;
    const mejor = arr => [...arr].sort((a, b) => area(b) - area(a))[0];
    const primarias = validas.filter(i => i.type === 'primary');
    return (mejor(primarias.filter(cuadrada)) || mejor(validas.filter(cuadrada))
         || mejor(primarias) || mejor(validas)).uri;
}

async function buscarArtista(nombre) {
    const datos = await discogs(buscarURL({ q: nombre, type: 'artist', per_page: 5 }));
    if (datos === undefined) return undefined;
    const n = normalizar(nombre);
    // Discogs añade "(2)", "(3)"... a artistas homónimos
    const r = (datos.results || []).find(r => normalizar((r.title || '').replace(/\s*\(\d+\)$/, '')) === n);
    if (!r || !esApiDiscogs(r.resource_url)) return '';

    const det = await discogs(r.resource_url);
    if (det === undefined) return undefined;
    return mejorImagen(det.images) || (imagenValida(r.cover_image) ? r.cover_image : '');
}

async function resolverPortadasArtistas(nombres) {
    let cache = {};
    try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch (_) {}
    if (cache._v !== VERSION_CACHE) cache = {};

    const pendientes = nombres.filter(n => REFRESCAR || !(n in cache));

    if (pendientes.length && !TOKEN) {
        console.warn(`⚠ Faltan ${pendientes.length} fotos de artista pero no hay DISCOGS_TOKEN: se omiten.`);
    } else if (pendientes.length) {
        console.log(`Buscando ${pendientes.length} fotos de artista en Discogs (~${Math.ceil(pendientes.length * DELAY_MS * 2 / 60000)} min)...`);
        try {
            let i = 0;
            for (const nombre of pendientes) {
                i++;
                const url = await buscarArtista(nombre);
                if (url === undefined) { console.log(`[${i}/${pendientes.length}] ✖ error  ${nombre}`); continue; }
                cache[nombre] = url;
                console.log(`[${i}/${pendientes.length}] ${url ? '✔' : '·'} ${nombre}`);
            }
        } catch (e) {
            console.error(e.message === 'TOKEN_INVALIDO' ? '✖ Token de Discogs inválido (401).' : e);
        }
    }

    cache._v = VERSION_CACHE;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    return Object.keys(cache).filter(k => k !== '_v' && cache[k]).length;
}

(async () => {
    const nombres = await leerArtistasDeFirebase();
    console.log(`${nombres.length} artistas en la base de datos.`);
    const conFoto = await resolverPortadasArtistas(nombres);
    console.log(`portadas-artistas-cache.json listo: ${conFoto} fotos de artista.`);
})().catch(e => { console.error('✖', e.message); process.exit(1); });
