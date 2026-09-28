// Uso: node generar-indice.js
// Recorre Canciones/<Artista>/<Título (Autor) [Álbum]>.txt y crea indice.json en la raíz.
//
// Formato del nombre de archivo:
//   Título (Autor) [Álbum].txt
//   Título (Autor) [Artista de la versión - Álbum].txt
//   ---Título (Autor) [Álbum].txt      ← el prefijo --- indica que NO está terminada
//
// Portadas (Discogs): si existe la variable de entorno DISCOGS_TOKEN, busca las portadas
// que falten y las guarda en portadas-cache.json, así solo consulta lo nuevo.
//   REFRESCAR=1  → ignora la caché y vuelve a buscar todo

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, 'Canciones');
const CACHE_FILE = path.join(__dirname, 'portadas-cache.json');
const TOKEN = process.env.DISCOGS_TOKEN || '';
const REFRESCAR = process.env.REFRESCAR === '1';
const DELAY_MS = Number(process.env.DISCOGS_DELAY_MS) || 1200;   // límite: 60 peticiones/min
const USER_AGENT = 'CancioneroPersonal/1.0 +https://rob-2704.github.io/cancionero/';

const orden = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' });
const dormir = ms => new Promise(r => setTimeout(r, ms));
const normalizar = s => (s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '').trim();

// ─────────────────────────────────────────────
// Nombres de archivo
// ─────────────────────────────────────────────

function parsearNombre(base, carpeta) {
    const m = base.match(/^(.*?)\s*(?:\(([^()]*)\))?\s*(?:\[([^\[\]]*)\])?\s*$/);
    let nombreC = base, autor = carpeta, album = '', version = '';
    if (m) {
        nombreC = m[1].trim() || base;
        autor = (m[2] || '').trim() || carpeta;
        const alb = (m[3] || '').trim();
        const i = alb.indexOf(' - ');
        if (i > -1) {
            version = alb.slice(0, i).trim();
            album = alb.slice(i + 3).trim();
        } else {
            album = alb;
        }
    }
    return { nombreC, autor, album, version };
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
                    const { nombreC, autor, album, version } = parsearNombre(limpio, carpeta);
                    return {
                        idC: `${carpeta}/${base}`,
                        nombreC,
                        autor,
                        nombreA: version || carpeta,   // artista usado para buscar la portada
                        albumC: album,
                        terminada
                    };
                });
            return { idA: carpeta, nombreA: carpeta, canciones };
        });
}

// ─────────────────────────────────────────────
// Discogs
// ─────────────────────────────────────────────

// Devuelve el JSON, o undefined si falló (para no guardar el fallo en la caché)
async function discogs(params) {
    const url = 'https://api.discogs.com/database/search?' + new URLSearchParams(params);
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

// Discogs devuelve "spacer.gif" cuando no hay imagen
const imagenValida = u => !!u && !/spacer\.gif/i.test(u);

// Mismos 3 niveles de filtrado que usaba la versión de iTunes
function elegirAlbum(results, artista, album) {
    const albumN = normalizar(album), artN = normalizar(artista);
    const items = results.filter(r => imagenValida(r.cover_image)).map(r => {
        const t = r.title || '';
        const i = t.indexOf(' - ');
        return { url: r.cover_image, art: normalizar(i > -1 ? t.slice(0, i) : ''), alb: normalizar(i > -1 ? t.slice(i + 3) : t) };
    });
    return items.find(p => p.alb === albumN && p.art.includes(artN))?.url          // exacto
        || items.find(p => p.alb.includes(albumN) && p.art.includes(artN))?.url    // parcial
        || items.find(p => p.alb === albumN)?.url                                  // solo álbum
        || '';
}

async function buscarAlbum(artista, album) {
    for (const type of ['master', 'release']) {
        const datos = await discogs({ type, artist: artista, release_title: album, per_page: 10 });
        if (datos === undefined) return undefined;
        const url = elegirAlbum(datos.results || [], artista, album);
        if (url) return url;
    }
    return '';
}

async function buscarArtista(nombre) {
    const datos = await discogs({ q: nombre, type: 'artist', per_page: 5 });
    if (datos === undefined) return undefined;
    const n = normalizar(nombre);
    // Discogs añade "(2)" a artistas homónimos
    const r = (datos.results || []).find(r => normalizar((r.title || '').replace(/\s*\(\d+\)$/, '')) === n);
    return r && imagenValida(r.cover_image) ? r.cover_image : '';
}

async function resolverPortadas(artistas) {
    let cache = {};
    try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch (_) {}

    // clave "Artista|Álbum"  (álbum vacío = portada del artista)
    const claves = new Map();
    for (const a of artistas) {
        claves.set(`${a.nombreA}|`, { artista: a.nombreA, album: '' });
        for (const c of a.canciones) {
            if (c.albumC && normalizar(c.albumC) !== 'sencillo') {
                claves.set(`${c.nombreA}|${c.albumC}`, { artista: c.nombreA, album: c.albumC });
            }
        }
    }

    const pendientes = [...claves].filter(([k]) => REFRESCAR || !(k in cache));
    if (pendientes.length && !TOKEN) {
        console.warn(`⚠ Faltan ${pendientes.length} portadas pero no hay DISCOGS_TOKEN: se omiten.`);
    } else if (pendientes.length) {
        console.log(`Buscando ${pendientes.length} portadas en Discogs (~${Math.ceil(pendientes.length * DELAY_MS / 60000)} min)...`);
        try {
            let n = 0;
            for (const [k, { artista, album }] of pendientes) {
                const url = album ? await buscarAlbum(artista, album) : await buscarArtista(artista);
                n++;
                if (url === undefined) { console.log(`[${n}/${pendientes.length}] ✖ error  ${k}`); continue; }
                cache[k] = url;
                console.log(`[${n}/${pendientes.length}] ${url ? '✔' : '·'} ${k}`);
            }
        } catch (e) {
            console.error(e.message === 'TOKEN_INVALIDO' ? '✖ Token de Discogs inválido (401).' : e);
        }
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

    const portadas = {};
    for (const k of claves.keys()) if (cache[k]) portadas[k] = cache[k];
    // Artista sin imagen propia: usa la portada de alguno de sus álbumes
    for (const a of artistas) {
        const kA = `${a.nombreA}|`;
        if (portadas[kA]) continue;
        const c = a.canciones.find(c => portadas[`${c.nombreA}|${c.albumC}`]);
        if (c) portadas[kA] = portadas[`${c.nombreA}|${c.albumC}`];
    }
    return portadas;
}

// ─────────────────────────────────────────────

(async () => {
    const artistas = leerCanciones();
    const portadas = await resolverPortadas(artistas);
    fs.writeFileSync(path.join(__dirname, 'indice.json'), JSON.stringify({ artistas, portadas }, null, 2));
    console.log(`indice.json listo: ${artistas.length} artistas, ${artistas.reduce((n, a) => n + a.canciones.length, 0)} canciones, ${Object.keys(portadas).length} portadas`);
})();
