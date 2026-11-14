// js/nombre-cancion.js
// Utilidades compartidas: interpretar el nombre de archivo de una canción y normalizar nombres.
//
// Formato del archivo .txt:
//   --nombreC (artistaP) [albumC].txt
//   --nombreC (artistaP) [artistaS - albumC].txt
//   --nombreC (artistaP) [albumC {palabras de búsqueda}].txt   ← opcional (heredado del proyecto 2)
//
// Guiones al inicio → estado:
//   0 guiones = terminada · 1 guion = por revisar · 2 guiones = sin terminar
//
// La CARPETA que contiene al archivo define dónde se organiza la canción en la página.
// artistaP (artista principal) y artistaS (secundario) SOLO sirven para buscar la carátula del álbum
// (se busca con artistaS si existe; si no, con artistaP; si tampoco, con el nombre de la carpeta).

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

// Identificador de carpeta para la URL (canciones.html?idA=...)
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
 * Interpreta "--Nombre (Artista) [Artista secundario - Álbum].txt" dentro de una carpeta.
 *
 *   carpeta  → grupo donde se organiza la canción en la página (la carpeta que contiene al archivo)
 *   artistaP / artistaS → SOLO sirven para buscar la carátula del álbum
 *
 * El "(Artista)" es opcional. Si el archivo no está en ninguna carpeta, se organiza por su "(Artista)".
 * Devuelve { ok:true, nombreC, carpeta, artistaP, albumC, artistaS, albumBusqueda, estado }
 *        o { ok:false, error }.
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

    // 2) Paréntesis finales: (artistaP), opcional. El título puede tener paréntesis propios: se toma el último.
    let nombreC = resto;
    let artistaP = '';
    const parentesis = resto.match(/^(.*)\(([^()]*)\)\s*$/);
    if (parentesis && parentesis[1].trim()) {
        nombreC = parentesis[1].trim();
        artistaP = parentesis[2].trim();
    }

    if (!nombreC) return { ok: false, error: 'Falta el nombre de la canción' };

    // 3) Carpeta de organización (si no hay carpeta, se usa el artista principal)
    const carpeta = String(carpetaArchivo ?? '').trim() || artistaP;
    if (!carpeta) {
        return { ok: false, error: 'No está dentro de una carpeta y no trae (Artista): no se sabe dónde organizarla' };
    }

    return { ok: true, nombreC, carpeta, artistaP, albumC, artistaS, albumBusqueda, estado };
}

// Quita lo que Windows no permite en nombres de archivo y los símbolos que rompen la lectura del nombre
const limpiarParaNombre = (texto, quitarSimbolos = false) => {
    let t = String(texto ?? '').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').replace(/\s+/g, ' ');
    if (quitarSimbolos) t = t.replace(/[()\[\]{}]/g, '');
    return t.trim();
};

/**
 * Nombre de archivo con el formato que acepta la página de subida:
 *   --nombreC (artistaP) [artistaS - albumC].txt
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
