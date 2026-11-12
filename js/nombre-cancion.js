// js/nombre-cancion.js
// Utilidades compartidas: interpretar el nombre de archivo de una canción y normalizar nombres.
//
// Formato del archivo .txt:
//   --nombreC (artistaP) [albumC].txt
//   --nombreC (artistaP) [albumC - artistaS].txt
//   --nombreC (artistaP) [albumC {palabras de búsqueda}].txt   ← opcional (heredado del proyecto 2)
//
// Guiones al inicio → estado:
//   0 guiones = terminada · 1 guion = por revisar · 2 guiones = sin terminar
//
// artistaP = artista principal (la canción se guarda en su lista).
// artistaS = artista secundario: SOLO cambia de quién se busca la carátula del álbum.

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

export function estadoDesdeGuiones(cantidad) {
    if (cantidad <= 0) return 'terminada';
    if (cantidad === 1) return 'revisar';
    return 'pendiente';
}

/**
 * Interpreta "--Nombre (Artista) [Álbum - Artista secundario].txt".
 * Devuelve { ok:true, nombreC, artistaP, albumC, artistaS, albumBusqueda, estado }
 *        o { ok:false, error }.
 */
export function parsearNombreArchivo(nombreArchivo) {
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

    // 1) Corchetes finales: [albumC] · [albumC - artistaS] · [albumC {búsqueda}]
    const corchetes = resto.match(/\s*\[([^\[\]]*)\]\s*$/);
    if (corchetes) {
        resto = resto.slice(0, corchetes.index).trim();
        let interior = corchetes[1].trim();

        const busqueda = interior.match(/^(.*)\{([^{}]*)\}\s*$/);
        if (busqueda) {
            interior = busqueda[1].trim();
            albumBusqueda = busqueda[2].trim();
        }

        // "albumC - artistaS": se separa por el ÚLTIMO " - " (el álbum puede llevar guiones)
        const corte = interior.lastIndexOf(' - ');
        if (corte > -1) {
            albumC = interior.slice(0, corte).trim();
            artistaS = interior.slice(corte + 3).trim();
        } else {
            albumC = interior;
        }
    }

    // 2) Paréntesis finales: (artistaP). El título puede tener paréntesis propios: se toma el último.
    const parentesis = resto.match(/^(.*)\(([^()]*)\)\s*$/);
    if (!parentesis) {
        return { ok: false, error: 'Falta el artista principal entre paréntesis: Nombre (Artista)' };
    }

    const nombreC = parentesis[1].trim();
    const artistaP = parentesis[2].trim();

    if (!nombreC) return { ok: false, error: 'Falta el nombre de la canción' };
    if (!artistaP) return { ok: false, error: 'El artista principal está vacío' };

    return { ok: true, nombreC, artistaP, albumC, artistaS, albumBusqueda, estado };
}
