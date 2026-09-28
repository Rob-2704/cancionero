// Uso: node generar-indice.js
// Recorre Canciones/<Artista>/<cancion>.txt y crea indice.json en la raíz.

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, 'Canciones');
const orden = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' });

function leerCabecera(archivo) {
    const texto = fs.readFileSync(archivo, 'utf8').replace(/^\uFEFF/, '');
    const meta = {};
    for (const linea of texto.split(/\r?\n/)) {
        const m = linea.match(/^@(\w+)\s*:\s*(.*)$/);
        if (!m) break;
        meta[m[1].toLowerCase()] = m[2].trim();
    }
    return meta;
}

const artistas = fs.readdirSync(RAIZ, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort(orden)
    .map(nombreA => {
        const dir = path.join(RAIZ, nombreA);
        const canciones = fs.readdirSync(dir)
            .filter(f => f.toLowerCase().endsWith('.txt'))
            .sort(orden)
            .map(f => {
                const nombreC = f.replace(/\.txt$/i, '');
                const meta = leerCabecera(path.join(dir, f));
                return {
                    idC: `${nombreA}/${nombreC}`,
                    nombreC,
                    albumC: meta.album || '',
                    terminada: ['1', 'true', 'si', 'sí'].includes((meta.terminada || '').toLowerCase())
                };
            });
        return { idA: nombreA, nombreA, canciones };
    });

fs.writeFileSync(path.join(__dirname, 'indice.json'), JSON.stringify({ artistas }, null, 2));
console.log(`indice.json listo: ${artistas.length} artistas, ${artistas.reduce((n, a) => n + a.canciones.length, 0)} canciones`);
