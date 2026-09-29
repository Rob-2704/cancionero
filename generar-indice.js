// Uso: node generar-indice.js
// Recorre Canciones/<Artista>/<Título (Autor) [Álbum]>.txt y crea indice.json en la raíz.
//
// Formato del nombre de archivo:
//   Título (Autor) [Álbum].txt
//   Título (Autor) [Artista de la versión - Álbum].txt
//   ---Título (Autor) [Álbum].txt      ← el prefijo --- indica que NO está terminada

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, 'Canciones');
const orden = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' });

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

const artistas = fs.readdirSync(RAIZ, { withFileTypes: true })
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

fs.writeFileSync(path.join(__dirname, 'indice.json'), JSON.stringify({ artistas }, null, 2));
console.log(`indice.json listo: ${artistas.length} artistas, ${artistas.reduce((n, a) => n + a.canciones.length, 0)} canciones`);
