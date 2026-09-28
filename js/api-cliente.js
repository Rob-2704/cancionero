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
        ytID: '',
        albumC: info ? info.albumC : ''
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
