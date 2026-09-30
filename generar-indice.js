// Uso: node generar-indice.js
// Recorre Canciones/<Artista>/<Título (Autor) [Álbum]>.txt y crea indice.json en la raíz.
//
// Formato del nombre de archivo:
//   Título (Autor) [Álbum].txt
//   Título (Autor) [Artista de la versión - Álbum].txt
//   Título (Autor) [Álbum (Año)].txt                      ← para desambiguar álbumes repetidos
//   Título (Autor) [Artista de la versión - Álbum (Año)].txt
//   ---Título (Autor) [Álbum].txt      ← el prefijo --- indica que NO está terminada
//
// Portadas de ARTISTA (solo para index.html), vía Discogs:
// si existe la variable de entorno DISCOGS_TOKEN, busca las que falten y las
// guarda en portadas-artistas-cache.json, así solo consulta lo nuevo.
//   REFRESCAR=1  → ignora la caché y vuelve a buscar todas

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, 'Canciones');
const CACHE_FILE = path.join(__dirname, 'portadas-artistas-cache.json');
const TOKEN = process.env.DISCOGS_TOKEN || '';
const REFRESCAR = process.env.REFRESCAR === '1';
const DELAY_MS = Number(process.env.DISCOGS_DELAY_MS) || 1200;   // límite: 60 peticiones/min
const USER_AGENT = 'CancioneroPersonal/1.0 +https://rob-2704.github.io/cancionero/';
const VERSION_CACHE = 1;

const orden = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' });
const dormir = ms => new Promise(r => setTimeout(r, ms));
const normalizar = s => (s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '').trim();

// ─────────────────────────────────────────────
// Nombres de archivo → artistas y canciones
// ─────────────────────────────────────────────

function parsearNombre(base, carpeta) {
    const m = base.match(/^(.*?)\s*(?:\(([^()]*)\))?\s*(?:\[([^\[\]]*)\])?\s*$/);
    let nombreC = base, autor = carpeta, album = '', version = '', anio = '';
    if (m) {
        nombreC = m[1].trim() || base;
        autor = (m[2] || '').trim() || carpeta;
        let alb = (m[3] || '').trim();

        // Año al final del corchete: "Álbum (1972)" → separa el año para desambiguar álbumes repetidos
        const ay = alb.match(/^(.*)\((\d{4})\)\s*$/);
        if (ay) {
            alb = ay[1].trim();
            anio = ay[2];
        }

        const i = alb.indexOf(' - ');
        if (i > -1) {
            version = alb.slice(0, i).trim();
            album = alb.slice(i + 3).trim();
        } else {
            album = alb;
        }
    }
    return { nombreC, autor, album, version, anio };
}

function leerCanciones() {
    return fs.readdirSync(RAIZ, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)
        .sort(orden)
        .map(carpeta => {
            const dir = path.join(RAIZ, carpeta);
            const canciones = fs.readdirSync(dir)
                .filter(f => f.toLowerCase().endsWith('.txt'))
                .sort(orden)
                .map(f => {
                    const base = f.replace(/\.txt$/i, '');
                    const limpio = base.replace(/^-{3}\s*/, '');   // quita el prefijo ---
                    const terminada = limpio === base;
                    const { nombreC, autor, album, version, anio } = parsearNombre(limpio, carpeta);
                    return {
                        idC: `${carpeta}/${base}`,
                        nombreC,
                        autor,
                        nombreA: version || autor,   // artista para portada: el de [Artista - Álbum] o, si no hay, el de (Autor)
                        albumC: album,
                        albumAnio: anio,              // opcional: para desambiguar álbumes con el mismo nombre
                        terminada
                    };
                });
            return { idA: carpeta, nombreA: carpeta, canciones };
        });
}

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

async function resolverPortadasArtistas(artistas) {
    let cache = {};
    try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch (_) {}
    if (cache._v !== VERSION_CACHE) cache = {};

    const nombres = [...new Set(artistas.map(a => a.nombreA))];
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

    const portadas = {};
    for (const n of nombres) if (cache[n]) portadas[n] = cache[n];
    return portadas;
}

// ─────────────────────────────────────────────

(async () => {
    const artistas = leerCanciones();
    const portadasArtistas = await resolverPortadasArtistas(artistas);
    fs.writeFileSync(path.join(__dirname, 'indice.json'), JSON.stringify({ artistas, portadasArtistas }, null, 2));
    console.log(`indice.json listo: ${artistas.length} artistas, ${artistas.reduce((n, a) => n + a.canciones.length, 0)} canciones, ${Object.keys(portadasArtistas).length} fotos de artista`);
})();
