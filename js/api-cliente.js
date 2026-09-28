// api-cliente.js — versión estática para GitHub Pages (sin PHP)
// Lee indice.json (generado por generar-indice.js) y los .txt de /Canciones

const CARPETA = 'Canciones';
const PORTADA_DEFECTO = 'https://www.shutterstock.com/image-photo/highquality-png-analog-record-disc-600nw-2561107141.jpg';

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

// Cabecera opcional al inicio del .txt:
//   @yt: dQw4w9WgXcQ
//   @album: Nombre del álbum
//   @terminada: 1
//   ---
function separarCabecera(texto) {
    const lineas = texto.replace(/^\uFEFF/, '').split(/\r?\n/);
    const meta = {};
    let i = 0;
    while (i < lineas.length) {
        const m = lineas[i].match(/^@(\w+)\s*:\s*(.*)$/);
        if (!m) break;
        meta[m[1].toLowerCase()] = m[2].trim();
        i++;
    }
    if (i > 0 && (lineas[i] || '').trim() === '---') i++;
    return { meta, contenido: lineas.slice(i).join('\n') };
}

export async function obtenerArtistas() {
    const indice = await cargarIndice();
    return indice.artistas.map(({ idA, nombreA }) => ({ idA, nombreA }));
}

export async function obtenerCanciones(idA) {
    const indice = await cargarIndice();
    const artista = indice.artistas.find(a => a.idA === idA);
    if (!artista) return [];
    return artista.canciones.map(c => ({ ...c, nombreA: artista.nombreA }));
}

export async function obtenerContenidoCancion(idC) {
    // idC = "Artista/Nombre de la canción" (sin .txt)
    const ruta = [CARPETA, ...idC.split('/')].map(encodeURIComponent).join('/') + '.txt';
    const r = await fetch(ruta);
    if (!r.ok) return { error: `No se encontró el archivo (${r.status})` };

    const { meta, contenido } = separarCabecera(await r.text());
    return {
        idC,
        nombreC: idC.split('/').pop(),
        contenido,
        ytID: meta.yt || meta.ytid || '',
        albumC: meta.album || ''
    };
}

// ---------- Portadas (iTunes), con caché en localStorage ----------

async function buscarPortada(term, clave) {
    const cacheKey = 'portada:' + clave;
    try {
        const guardada = localStorage.getItem(cacheKey);
        if (guardada) return guardada;
    } catch (_) {}

    try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=album&limit=1`;
        const r = await fetch(url);
        const data = await r.json();
        const art = data.results?.[0]?.artworkUrl100;
        if (art) {
            const grande = art.replace('100x100', '600x600');
            try { localStorage.setItem(cacheKey, grande); } catch (_) {}
            return grande;
        }
    } catch (_) {}
    return PORTADA_DEFECTO;
}

export function obtenerPortadaArtista(nombreArtista) {
    return buscarPortada(nombreArtista, 'a:' + nombreArtista.toLowerCase());
}

export function obtenerPortadaAlbumCancion(nombreArtista, album) {
    if (!album) return obtenerPortadaArtista(nombreArtista);
    return buscarPortada(`${nombreArtista} ${album}`, `c:${nombreArtista}|${album}`.toLowerCase());
}
