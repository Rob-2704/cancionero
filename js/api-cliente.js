// api-cliente.js — versión estática para GitHub Pages (sin PHP)
// Datos y portadas: indice.json (generado por generar-indice.js, que consulta Discogs)
// Letras: archivos .txt de /Canciones
const CARPETA = 'Canciones';
const PORTADA_FALLBACK = 'https://www.shutterstock.com/image-photo/highquality-png-analog-record-disc-600nw-2561107141.jpg';

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

// ─────────────────────────────────────────────
// DATOS
// ─────────────────────────────────────────────

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
// PORTADAS (ya resueltas en indice.json: clave "Artista|Álbum")
// ─────────────────────────────────────────────

export async function obtenerPortadaArtista(nombreArtista) {
    const indice = await cargarIndice();
    return indice.portadas?.[`${nombreArtista}|`] || PORTADA_FALLBACK;
}

export async function obtenerPortadaAlbumCancion(nombreArtista, nombreAlbum) {
    // Sin álbum (o "Sencillo"): portada por defecto
    if (!nombreAlbum?.trim() || nombreAlbum.trim().toLowerCase() === 'sencillo') {
        return PORTADA_FALLBACK;
    }
    const indice = await cargarIndice();
    return indice.portadas?.[`${nombreArtista}|${nombreAlbum}`] || PORTADA_FALLBACK;
}
