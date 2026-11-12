const FORMULAS_TEORICAS = {
    "":       [0, 4, 7], "m":      [0, 3, 7], "7":      [0, 4, 7, 10], 
    "m7":     [0, 3, 7, 10], "maj7":   [0, 4, 7, 11], "dim":    [0, 3, 6], 
    "dim7":   [0, 3, 6, 9], "aug":    [0, 4, 8], "sus4":   [0, 5, 7], 
    "sus2":   [0, 2, 7], "sus":    [0, 5, 7], "5":      [0, 7], "9":      [0, 4, 7, 10, 14], 
    "11":     [0, 4, 7, 10, 14, 17], "13":     [0, 4, 7, 10, 14, 21],
    "7sus4":  [0, 5, 7, 10], "7sus2":  [0, 2, 7, 10], "7sus": [0, 5, 7, 10],
    "9sus4":  [0, 5, 7, 10, 14], "9sus": [0, 5, 7, 10, 14]
};

const GRADOS_BASE = { 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 10, 9: 14, 11: 17, 13: 21 };

const GRADOS_A_REEMPLAZAR = {
    5:  [6, 7, 8],
    9:  [13, 14, 15],
    11: [16, 17, 18],
    13: [20, 21, 22]
};

const MAPA_NOTAS = { do: 0, re: 2, mi: 4, fa: 5, sol: 7, la: 9, si: 11, c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

const MAPA_A_LATINO = {
    'C': 'DO', 'D': 'RE', 'E': 'MI', 'F': 'FA', 'G': 'SOL', 'A': 'LA', 'B': 'SI'
};

const MAPA_A_ANGLO = {
    'DO': 'C', 'RE': 'D', 'MI': 'E', 'FA': 'F', 'SOL': 'G', 'LA': 'A', 'SI': 'B'
};

export function convertirAcordeASistema(acordeStr, sistema = 'ANGLOSAJON') {
    if (!acordeStr) return acordeStr;
    
    return acordeStr.replace(/(DO|RE|MI|FA|SOL|LA|SI|[CDEFGAB])(#|b)?/g, (match) => {
        const m = match.match(/^(DO|RE|MI|FA|SOL|LA|SI|[CDEFGAB])(#|b)?/);
        if (!m) return match;
        const base = m[1];
        const alt = m[2] || '';
        
        if (sistema === 'LATINO' || sistema === 'ESPAÑOL') {
            const notaAnglo = MAPA_A_ANGLO[base] || base;
            return (MAPA_A_LATINO[notaAnglo] || base) + alt;
        } else {
            return (MAPA_A_ANGLO[base] || base) + alt;
        }
    });
}

function aplicarAlteraciones(formulaBase, textoAlteracion) {
    if (!textoAlteracion) return formulaBase;

    const contenido = textoAlteracion.replace(/[()]/g, '');
    const tokens = contenido.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    let formula = [...formulaBase];

    tokens.forEach(token => {
        const coincideAdd = token.match(/^add(\d+)$/);
        const coincideAlt = token.match(/^([#b]?)(\d+)$/);

        if (coincideAdd) {
            const grado = parseInt(coincideAdd[1]);
            const intervalo = GRADOS_BASE[grado];
            if (intervalo !== undefined && !formula.includes(intervalo)) {
                formula.push(intervalo);
            }
        } else if (coincideAlt) {
            const signo = coincideAlt[1];
            const grado = parseInt(coincideAlt[2]);
            const base = GRADOS_BASE[grado];
            if (base !== undefined) {
                let nuevoIntervalo = base;
                if (signo === '#') nuevoIntervalo = base + 1;
                if (signo === 'b') nuevoIntervalo = base - 1;

                const aReemplazar = GRADOS_A_REEMPLAZAR[grado];
                if (aReemplazar) {
                    formula = formula.filter(i => !aReemplazar.includes(i));
                }
                if (!formula.includes(nuevoIntervalo)) formula.push(nuevoIntervalo);
            }
        }
    });

    return formula;
}

// ───────────────────────── Teoría y generador de digitaciones ─────────────────────────

// Afinación estándar (cuerda 6 → 1): E2 A2 D3 G3 B3 E4, en números MIDI
const AFINACION = [40, 45, 50, 55, 59, 64];
const TRASTE_MAXIMO = 15;

export const NOMBRES_SOSTENIDOS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOMBRES_BEMOLES    = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// tones: semitonos desde la raíz · grados: etiqueta de cada nota · req: notas que no pueden faltar
// alias: cómo se suele escribir (minúsculas, sin espacios) para el buscador
export const TIPOS = [
    // Tríadas
    { id: '',       sim: '',        nombre: 'Mayor',                       grupo: 'Tríadas',  tones: [0, 4, 7],            grados: ['1', '3', '5'],               req: [0, 4, 7],      alias: ['', 'maj', 'major', 'mayor'] },
    { id: 'm',      sim: 'm',       nombre: 'Menor',                       grupo: 'Tríadas',  tones: [0, 3, 7],            grados: ['1', '♭3', '5'],              req: [0, 3, 7],      alias: ['m', 'min', 'minor', 'menor', '-'] },
    { id: 'dim',    sim: 'dim',     nombre: 'Disminuido',                  grupo: 'Tríadas',  tones: [0, 3, 6],            grados: ['1', '♭3', '♭5'],             req: [0, 3, 6],      alias: ['dim', '°', 'º', 'disminuido'] },
    { id: 'aug',    sim: 'aug',     nombre: 'Aumentado',                   grupo: 'Tríadas',  tones: [0, 4, 8],            grados: ['1', '3', '♯5'],              req: [0, 4, 8],      alias: ['aug', '+', 'aumentado', '#5'] },
    { id: 'sus2',   sim: 'sus2',    nombre: 'Suspendido 2',                grupo: 'Tríadas',  tones: [0, 2, 7],            grados: ['1', '2', '5'],               req: [0, 2, 7],      alias: ['sus2'] },
    { id: 'sus4',   sim: 'sus4',    nombre: 'Suspendido 4',                grupo: 'Tríadas',  tones: [0, 5, 7],            grados: ['1', '4', '5'],               req: [0, 5, 7],      alias: ['sus4', 'sus'] },
    { id: '5',      sim: '5',       nombre: 'Quinta (power chord)',        grupo: 'Tríadas',  tones: [0, 7],               grados: ['1', '5'],                    req: [0, 7],         alias: ['5'], minCuerdas: 3 },

    // Sextas
    { id: '6',      sim: '6',       nombre: 'Sexta',                       grupo: 'Sextas',   tones: [0, 4, 7, 9],         grados: ['1', '3', '5', '6'],          req: [0, 4, 9],      alias: ['6'] },
    { id: 'm6',     sim: 'm6',      nombre: 'Menor con sexta',             grupo: 'Sextas',   tones: [0, 3, 7, 9],         grados: ['1', '♭3', '5', '6'],         req: [0, 3, 9],      alias: ['m6', 'min6', '-6'] },
    { id: '69',     sim: '6/9',     nombre: 'Sexta con novena',            grupo: 'Sextas',   tones: [0, 4, 7, 9, 2],      grados: ['1', '3', '5', '6', '9'],     req: [0, 4, 9, 2],   alias: ['69', '6add9'] },

    // Séptimas
    { id: '7',      sim: '7',       nombre: 'Séptima (dominante)',         grupo: 'Séptimas', tones: [0, 4, 7, 10],        grados: ['1', '3', '5', '♭7'],         req: [0, 4, 10],     alias: ['7', 'dom7'] },
    { id: 'maj7',   sim: 'maj7',    nombre: 'Séptima mayor',               grupo: 'Séptimas', tones: [0, 4, 7, 11],        grados: ['1', '3', '5', '7'],          req: [0, 4, 11],     alias: ['maj7', 'major7', 'δ', 'δ7'] },
    { id: 'm7',     sim: 'm7',      nombre: 'Menor con séptima',           grupo: 'Séptimas', tones: [0, 3, 7, 10],        grados: ['1', '♭3', '5', '♭7'],        req: [0, 3, 10],     alias: ['m7', 'min7', '-7', 'menor7'] },
    { id: 'mmaj7',  sim: 'm(maj7)', nombre: 'Menor con séptima mayor',     grupo: 'Séptimas', tones: [0, 3, 7, 11],        grados: ['1', '♭3', '5', '7'],         req: [0, 3, 11],     alias: ['mmaj7', 'minmaj7', 'm#7'] },
    { id: 'dim7',   sim: 'dim7',    nombre: 'Disminuido con séptima',      grupo: 'Séptimas', tones: [0, 3, 6, 9],         grados: ['1', '♭3', '♭5', '♭♭7'],      req: [0, 3, 6, 9],   alias: ['dim7', '°7', 'º7'] },
    { id: 'm7b5',   sim: 'm7b5',    nombre: 'Semidisminuido',              grupo: 'Séptimas', tones: [0, 3, 6, 10],        grados: ['1', '♭3', '♭5', '♭7'],       req: [0, 3, 6, 10],  alias: ['m7b5', 'ø', 'ø7', 'min7b5', 'm7-5'] },
    { id: '7sus4',  sim: '7sus4',   nombre: 'Séptima suspendida',          grupo: 'Séptimas', tones: [0, 5, 7, 10],        grados: ['1', '4', '5', '♭7'],         req: [0, 5, 10],     alias: ['7sus4', '7sus'] },
    { id: '7b5',    sim: '7b5',     nombre: 'Séptima con quinta bemol',    grupo: 'Séptimas', tones: [0, 4, 6, 10],        grados: ['1', '3', '♭5', '♭7'],        req: [0, 4, 6, 10],  alias: ['7b5', '7-5'] },
    { id: '7#5',    sim: '7#5',     nombre: 'Séptima aumentada',           grupo: 'Séptimas', tones: [0, 4, 8, 10],        grados: ['1', '3', '♯5', '♭7'],        req: [0, 4, 8, 10],  alias: ['7#5', 'aug7', '7aug', '+7', '7+5'] },
    { id: 'maj7#5', sim: 'maj7#5',  nombre: 'Séptima mayor aumentada',     grupo: 'Séptimas', tones: [0, 4, 8, 11],        grados: ['1', '3', '♯5', '7'],         req: [0, 4, 8, 11],  alias: ['maj7#5', 'maj7aug', 'maj7+5'] },
    { id: 'maj7#11',sim: 'maj7#11', nombre: 'Séptima mayor con ♯11',       grupo: 'Séptimas', tones: [0, 4, 7, 11, 6],     grados: ['1', '3', '5', '7', '♯11'],   req: [0, 4, 11, 6],  alias: ['maj7#11'] },

    // Con novena
    { id: 'add9',   sim: 'add9',    nombre: 'Añadida 9 (add9)',            grupo: 'Con novena', tones: [0, 4, 7, 2],       grados: ['1', '3', '5', '9'],          req: [0, 4, 2],      alias: ['add9'] },
    { id: 'madd9',  sim: 'madd9',   nombre: 'Menor añadida 9',             grupo: 'Con novena', tones: [0, 3, 7, 2],       grados: ['1', '♭3', '5', '9'],         req: [0, 3, 2],      alias: ['madd9', 'minadd9'] },
    { id: '9',      sim: '9',       nombre: 'Novena',                      grupo: 'Con novena', tones: [0, 4, 7, 10, 2],   grados: ['1', '3', '5', '♭7', '9'],    req: [0, 4, 10, 2],  alias: ['9', 'dom9'] },
    { id: 'm9',     sim: 'm9',      nombre: 'Menor con novena',            grupo: 'Con novena', tones: [0, 3, 7, 10, 2],   grados: ['1', '♭3', '5', '♭7', '9'],   req: [0, 3, 10, 2],  alias: ['m9', 'min9', '-9'] },
    { id: 'maj9',   sim: 'maj9',    nombre: 'Novena mayor',                grupo: 'Con novena', tones: [0, 4, 7, 11, 2],   grados: ['1', '3', '5', '7', '9'],     req: [0, 4, 11, 2],  alias: ['maj9', 'major9'] },
    { id: '9sus4',  sim: '9sus4',   nombre: 'Novena suspendida',           grupo: 'Con novena', tones: [0, 5, 7, 10, 2],   grados: ['1', '4', '5', '♭7', '9'],    req: [0, 5, 10, 2],  alias: ['9sus4', '9sus'] },

    // Alterados
    { id: '7b9',    sim: '7b9',     nombre: 'Séptima con ♭9',              grupo: 'Alterados', tones: [0, 4, 7, 10, 1],    grados: ['1', '3', '5', '♭7', '♭9'],   req: [0, 4, 10, 1],  alias: ['7b9'] },
    { id: '7#9',    sim: '7#9',     nombre: 'Séptima con ♯9',              grupo: 'Alterados', tones: [0, 4, 7, 10, 3],    grados: ['1', '3', '5', '♭7', '♯9'],   req: [0, 4, 10, 3],  alias: ['7#9'] },
    { id: '7#11',   sim: '7#11',    nombre: 'Séptima con ♯11',             grupo: 'Alterados', tones: [0, 4, 7, 10, 6],    grados: ['1', '3', '5', '♭7', '♯11'],  req: [0, 4, 10, 6],  alias: ['7#11'] },
    { id: '7b13',   sim: '7b13',    nombre: 'Séptima con ♭13',             grupo: 'Alterados', tones: [0, 4, 7, 10, 8],    grados: ['1', '3', '5', '♭7', '♭13'],  req: [0, 4, 10, 8],  alias: ['7b13'] },

    // Oncenas y trecenas
    { id: '11',     sim: '11',      nombre: 'Oncena',                      grupo: 'Oncenas y trecenas', tones: [0, 4, 7, 10, 2, 5], grados: ['1', '3', '5', '♭7', '9', '11'], req: [0, 10, 5],    alias: ['11'] },
    { id: 'm11',    sim: 'm11',     nombre: 'Menor con oncena',            grupo: 'Oncenas y trecenas', tones: [0, 3, 7, 10, 2, 5], grados: ['1', '♭3', '5', '♭7', '9', '11'], req: [0, 3, 10, 5], alias: ['m11', 'min11'] },
    { id: '13',     sim: '13',      nombre: 'Trecena',                     grupo: 'Oncenas y trecenas', tones: [0, 4, 7, 10, 2, 9], grados: ['1', '3', '5', '♭7', '9', '13'], req: [0, 4, 10, 9], alias: ['13'] },
    { id: 'm13',    sim: 'm13',     nombre: 'Menor con trecena',           grupo: 'Oncenas y trecenas', tones: [0, 3, 7, 10, 2, 9], grados: ['1', '♭3', '5', '♭7', '9', '13'], req: [0, 3, 10, 9], alias: ['m13', 'min13'] },
    { id: 'maj13',  sim: 'maj13',   nombre: 'Trecena mayor',               grupo: 'Oncenas y trecenas', tones: [0, 4, 7, 11, 2, 9], grados: ['1', '3', '5', '7', '9', '13'],  req: [0, 4, 11, 9], alias: ['maj13', 'major13'] }
];

export const TIPO_POR_ID = Object.fromEntries(TIPOS.map(t => [t.id, t]));

// ───────────────────────── Generación ─────────────────────────

/**
 * Busca digitaciones para un acorde.
 * @param {number} raiz     0–11 (0 = DO)
 * @param {object} tipo     elemento de TIPOS
 * @param {number|null} bajo  nota del bajo (0–11) o null para la raíz
 * @param {number} maximo   cuántas devolver (1 = solo la más cómoda)
 * @returns {Array<{strings:string, cejilla:boolean, trasteInicio:number, cuerdasCejilla:number[]|null, trasteMin:number, abierto:boolean, dedos:number}>}
 */
export function generarDigitaciones(raiz, tipo, bajo = null, maximo = 12, relajado = false) {
    const tonos = tipo.tones.map(i => (raiz + i) % 12);
    const requeridas = tipo.req.map(i => (raiz + i) % 12);
    const pcBajo = (bajo === null || bajo === undefined) ? raiz : bajo;
    const permitidas = new Set([...tonos, pcBajo]);
    const minCuerdas = tipo.minCuerdas || 4;

    const encontradas = new Map();
    const frets = new Array(6).fill(-1);

    for (let base = 1; base + 3 <= TRASTE_MAXIMO; base++) {
        // Notas posibles por cuerda dentro de esta ventana (las cuerdas al aire solo en la primera)
        const opciones = AFINACION.map(midi => {
            const lista = [];
            if (base === 1 && permitidas.has(midi % 12)) lista.push(0);
            for (let f = base; f <= base + 3; f++) {
                if (permitidas.has((midi + f) % 12)) lista.push(f);
            }
            return lista;
        });

        // estado: 0 = aún no suena ninguna, 1 = sonando, 2 = ya terminaron las cuerdas que suenan
        const recorrer = (s, estado) => {
            if (s === 6) { evaluar(); return; }

            frets[s] = -1;
            recorrer(s + 1, estado === 1 ? 2 : estado);

            if (estado !== 2) {
                for (const f of opciones[s]) {
                    frets[s] = f;
                    recorrer(s + 1, 1);
                }
                frets[s] = -1;
            }
        };

        const evaluar = () => {
            let sonando = 0, primera = -1;
            const pcs = new Set();
            const pisadas = [];
            for (let s = 0; s < 6; s++) {
                const f = frets[s];
                if (f < 0) continue;
                sonando++;
                if (primera < 0) primera = s;
                pcs.add((AFINACION[s] + f) % 12);
                if (f > 0) pisadas.push([s, f]);
            }
            if (sonando < minCuerdas) return;
            if ((AFINACION[primera] + frets[primera]) % 12 !== pcBajo) return;
            for (const r of requeridas) if (!pcs.has(r)) return;

            const clave = frets.map(f => (f < 0 ? 'X' : f)).join(' ');
            if (encontradas.has(clave)) return;

            let trasteMin = 0, trasteMax = 0;
            if (pisadas.length) {
                trasteMin = Math.min(...pisadas.map(p => p[1]));
                trasteMax = Math.max(...pisadas.map(p => p[1]));
            }

            // Dedos: cejilla solo si hace falta (más de 4 notas pisadas)
            let dedos = pisadas.length;
            let cejilla = null;
            if (pisadas.length > 4) {
                const enMin = pisadas.filter(p => p[1] === trasteMin);
                if (enMin.length >= 2) {
                    const i0 = enMin[0][0], i1 = enMin[enMin.length - 1][0];
                    let valida = true;
                    for (let s = i0; s <= i1; s++) if (frets[s] < trasteMin) { valida = false; break; }
                    if (valida) {
                        cejilla = [i0 + 1, i1 + 1];
                        dedos = 1 + pisadas.filter(p => p[1] > trasteMin).length;
                    }
                }
            }
            if (dedos > 4) return;

            const abiertas = frets.filter(f => f === 0).length;
            const tonosCubiertos = tonos.filter(t => pcs.has(t)).length;
            const puntaje =
                dedos * 2 +
                (6 - sonando) * 1.5 +
                (trasteMax - trasteMin) * 1.0 +
                (cejilla ? 1.5 : 0) +
                trasteMin * 0.25 -
                abiertas * 0.5 -
                tonosCubiertos * 0.8;

            // Qué parte del diapasón se dibuja: si hay cejilla o pasa del traste 4, se empieza en el traste más bajo
            const trasteInicio = (cejilla || trasteMax > 4) ? Math.max(1, trasteMin) : 1;

            encontradas.set(clave, {
                strings: clave,
                cejilla: !!cejilla,
                trasteInicio,
                cuerdasCejilla: cejilla,
                trasteMin,
                abierto: abiertas > 0,
                dedos,
                puntaje
            });
        };

        recorrer(0, 0);
    }

    // Si ninguna forma cumple todo, se pide solo raíz y tercera (o su sustituto) y se permiten 3 cuerdas
    if (!encontradas.size && !relajado) {
        return generarDigitaciones(raiz, { ...tipo, req: tipo.req.slice(0, 2), minCuerdas: 3 }, bajo, maximo, true);
    }

    // Quita las versiones "recortadas": misma forma que otra, pero sin cuerdas al aire que sí podrían sonar
    const lista = [...encontradas.values()];
    const trastes = lista.map(d => d.strings.split(' ').map(x => (x === 'X' ? -1 : parseInt(x, 10))));
    const todas = lista.filter((d, i) => !lista.some((o, j) => {
        if (i === j) return false;
        const a = trastes[i], b = trastes[j];
        let extra = false;
        for (let s = 0; s < 6; s++) {
            if (a[s] >= 0 && a[s] !== b[s]) return false;      // debe conservar todas sus notas
            if (a[s] < 0 && b[s] >= 0) {
                if (b[s] !== 0) return false;                  // lo añadido solo puede ser cuerda al aire
                extra = true;
            }
        }
        return extra;
    })).sort((a, b) => a.puntaje - b.puntaje);
    if (maximo <= 1) return todas.slice(0, 1);

    // Variedad: como máximo 3 por zona del mástil
    const porZona = new Map();
    const elegidas = [];
    for (const d of todas) {
        const zona = d.abierto ? 0 : Math.floor(d.trasteMin / 3) + 1;
        const n = porZona.get(zona) || 0;
        if (n >= 3) continue;
        porZona.set(zona, n + 1);
        elegidas.push(d);
        if (elegidas.length >= maximo) break;
    }
    return elegidas.sort((a, b) => (a.abierto === b.abierto ? 0 : (a.abierto ? -1 : 1)) || a.trasteMin - b.trasteMin || a.puntaje - b.puntaje);
}

// ───────────────────────── Interpretar el nombre de un acorde ─────────────────────────

const ALIAS = new Map();
TIPOS.forEach(t => t.alias.forEach(a => { if (!ALIAS.has(a)) ALIAS.set(a, t.id); }));

function leerNota(texto) {
    const m = texto.match(/^(do|re|mi|fa|sol|la|si|[a-g])([#b])?/i);
    if (!m) return null;
    let pc = MAPA_NOTAS[m[1].toLowerCase()];
    if (m[2] === '#') pc = (pc + 1) % 12;
    if (m[2] === 'b') pc = (pc + 11) % 12;
    return { pc, resto: texto.slice(m[0].length) };
}

function normalizarSufijo(s) {
    s = s.replace(/[()\s]/g, '').replace(/♯/g, '#').replace(/♭/g, 'b');
    if (s === 'M') return '';
    if (/^M/.test(s) && !/^maj/i.test(s)) s = 'maj' + s.slice(1);
    return s.toLowerCase().replace('añadida', 'add');
}

/** Interpreta "Fa#m7", "Do/Mi", "Bbmaj7", "C6/9"… → {raiz, tipo, bajo} o null */
export function interpretarAcorde(texto) {
    if (!texto) return null;
    let t = texto.trim().replace(/♯/g, '#').replace(/♭/g, 'b').replace(/6\/9/g, '69');
    if (!t) return null;

    let textoBajo = null;
    const barra = t.lastIndexOf('/');
    if (barra > 0) { textoBajo = t.slice(barra + 1); t = t.slice(0, barra); }

    const raiz = leerNota(t);
    if (!raiz) return null;

    const idTipo = ALIAS.get(normalizarSufijo(raiz.resto));
    if (idTipo === undefined) return null;

    let bajo = null;
    if (textoBajo) {
        const nb = leerNota(textoBajo.trim());
        if (!nb || nb.resto.trim() !== '') return null;
        bajo = nb.pc;
    }
    return { raiz: raiz.pc, tipo: idTipo, bajo: bajo === raiz.pc ? null : bajo };
}

// ───────────────────────── Nombre de acorde → digitación automática ─────────────────────────

function pcDeNota(nombre) {
    const m = (nombre || '').match(/^([A-G])(#|b)?$/);
    if (!m) return -1;
    let pc = MAPA_NOTAS[m[1].toLowerCase()];
    if (m[2] === '#') pc = (pc + 1) % 12;
    if (m[2] === 'b') pc = (pc + 11) % 12;
    return pc;
}

/**
 * Separa un nombre de acorde ("Am7", "Sol#m", "C_G"…) en raíz, resto y bajo.
 * Es la misma lectura que usaba la caja emergente, ahora compartida con el generador.
 */
export function analizarNombreAcorde(nombreRaw) {
    const textoLimpio = nombreRaw.trim().replace(/[\s-\-❚❙]/g, '');
    const partes = textoLimpio.split('_');
    const estructura = partes[0];
    const bajoRaw = partes[1] || null;

    let raiz = '';
    let alteraciones = '';
    const estructuraUpper = estructura.toUpperCase();

    for (const notaLatina of Object.keys(MAPA_A_ANGLO)) {
        if (estructuraUpper.startsWith(notaLatina)) {
            raiz = MAPA_A_ANGLO[notaLatina];
            alteraciones = estructura.substring(notaLatina.length);
            break;
        }
    }
    if (!raiz) {
        raiz = estructura.substring(0, 1).toUpperCase();
        alteraciones = estructura.substring(1);
    }
    if (alteraciones.startsWith('#') || alteraciones.startsWith('b')) {
        raiz += alteraciones.substring(0, 1);
        alteraciones = alteraciones.substring(1);
    }

    let notaBajo = null;
    if (bajoRaw) {
        const bajoUpper = bajoRaw.toUpperCase();
        for (const notaLatina of Object.keys(MAPA_A_ANGLO)) {
            if (bajoUpper.startsWith(notaLatina)) {
                notaBajo = MAPA_A_ANGLO[notaLatina] + bajoUpper.substring(notaLatina.length).toLowerCase();
                break;
            }
        }
        if (!notaBajo) notaBajo = bajoRaw.substring(0, 1).toUpperCase() + bajoRaw.substring(1);
    }

    return { textoLimpio, raiz, alteraciones, notaBajo };
}

/** Para sufijos que no están en la tabla TIPOS: arma el acorde con las fórmulas teóricas. */
function tipoDesdeFormula(alteraciones) {
    const coincideParentesis = alteraciones.match(/^([^()]*)(\(.+\))?$/);
    let sufijoBase = coincideParentesis ? coincideParentesis[1] : alteraciones;
    let textoAlteracion = coincideParentesis ? coincideParentesis[2] : null;

    const matchSusAlt = sufijoBase.match(/^(sus[24]?)([#b]\d+)$/i);
    if (matchSusAlt) {
        sufijoBase = matchSusAlt[1];
        textoAlteracion = textoAlteracion ? textoAlteracion.replace(')', `, ${matchSusAlt[2]})`) : `(${matchSusAlt[2]})`;
    }

    const matchAddDirecto = sufijoBase.match(/^(.*)(add\d+)$/i);
    if (matchAddDirecto) {
        sufijoBase = matchAddDirecto[1];
        textoAlteracion = textoAlteracion ? textoAlteracion.replace(')', `, ${matchAddDirecto[2]})`) : `(${matchAddDirecto[2]})`;
    }

    const base = sufijoBase.toLowerCase();
    if (base === 'min' || base === 'm') sufijoBase = 'm';
    else if (base === 'min7' || base === 'm7') sufijoBase = 'm7';
    else if (base === 'maj') sufijoBase = '';

    const formula = aplicarAlteraciones(FORMULAS_TEORICAS[sufijoBase] || FORMULAS_TEORICAS[''], textoAlteracion);
    const tones = [...new Set(formula.map(i => i % 12))];
    // Imprescindibles: todo menos la quinta justa y, en acordes con muchas notas, la 9 y la 11
    const req = tones.filter(t => !(t === 7 && tones.length >= 4) && !((t === 2 || t === 5) && tones.length >= 5));
    return { id: '?', sim: alteraciones, nombre: alteraciones, grupo: '', tones, grados: [], req: req.length ? req : [0], alias: [] };
}

/**
 * Calcula la digitación más cómoda de un acorde que no está en el diccionario manual.
 * @param {{raiz:string, alteraciones:string, notaBajo:string|null}} analisis  resultado de analizarNombreAcorde
 */
export function digitacionAutomatica({ raiz, alteraciones, notaBajo }) {
    const pcRaiz = pcDeNota(raiz);
    if (pcRaiz < 0) return null;

    let pcBajo = notaBajo ? pcDeNota(notaBajo) : null;
    if (pcBajo !== null && pcBajo < 0) pcBajo = null;
    if (pcBajo === pcRaiz) pcBajo = null;

    let tipo = null;
    const conocido = interpretarAcorde(raiz + alteraciones);
    if (conocido && conocido.raiz === pcRaiz) tipo = TIPO_POR_ID[conocido.tipo];
    if (!tipo) tipo = tipoDesdeFormula(alteraciones);

    const mejor = generarDigitaciones(pcRaiz, tipo, pcBajo, 1)[0];
    if (!mejor) return null;
    return { strings: mejor.strings, cejilla: mejor.cejilla, trasteInicio: mejor.trasteInicio, cuerdasCejilla: mejor.cuerdasCejilla };
}

// ───────────────────────── Texto de las canciones ─────────────────────────

export function crearRegexAcordes() {
    const nucleoAcorde = `([CDEFGAB]|DO|RE|MI|FA|SOL|LA|SI)(#|b)?((?:maj|min|dim|aug|m)?)(?:(sus4|sus2|sus(?:[#b]?\\d+)?|add\\d+|5|6|7|8|9|10|11|12|13)+)?`;
    const bajoAcorde = `(\\/(([CDEFGAB]|DO|RE|MI|FA|SOL|LA|SI)(#|b)?))?`;

    const conAlteracion = `${nucleoAcorde}(\\((?:add)?[#b]?\\d+(?:\\s*,\\s*(?:add)?[#b]?\\d+)*\\))${bajoAcorde}(?![a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])`;
    const sinAlteracion = `${nucleoAcorde}${bajoAcorde}(?![a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]|\\s(?![xX]\\d)[a-záéíóúüñ])`;

    return new RegExp(`(?<![a-záéíóúüñ])(?:${conAlteracion}|${sinAlteracion})`, 'g');
}

export function procesarLetraYAcordes(textoOriginal, sistema = 'ANGLOSAJON') {
    if (!textoOriginal) return "";
    
    let textoProcesado = textoOriginal.replace(/-/g, '—');
    
    const regexBarras = /x\d+|(?<![a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])v(?![a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])|(?<![a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])X(?![a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])|(?<=[\d—])(?:p|h)\d+|(?<=[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])\d+(?![s][u][s])(?=[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])|\([Ii][Nn][Tt][Rr][Oo]\)|❙o|o❙|(?!\d—[A-ZÁÉÍÓÚÜÑ\s\r\n])(?!\/[A-ZÁÉÍÓÚÜÑ])(?!\d\/[A-ZÁÉÍÓÚÜÑ])(?:(?!❙o|o❙)[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ.,;:!?¡¿'"#()\s])*(?:(?!❙o|o❙)[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9.,;:!?¡¿'"#()\s])(?:(?!❙o|o❙)[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ.,;:!?¡¿'"#()\s])*/g;
    const regexAcordes = crearRegexAcordes();

    const envolverBarras = (fragmento) => fragmento.replace(regexBarras, (barra) => `<span class="barra-compas">${barra}</span>`);

    let matches = [];
    let match;
    regexAcordes.lastIndex = 0;
    while ((match = regexAcordes.exec(textoProcesado)) !== null) {
        matches.push({
            index: match.index,
            length: match[0].length,
            acorde: match[0]
        });
    }

    if (matches.length === 0) {
        return envolverBarras(textoProcesado);
    }

    let resultado = "";
    let cursor = 0;

    for (let i = 0; i < matches.length; i++) {
        let m = matches[i];
        
        let tramoPlano = textoProcesado.slice(cursor, m.index);
        resultado += envolverBarras(tramoPlano);

        let acordeOriginal = m.acorde;
        let idAcordeDiccionario = acordeOriginal.replace('/', '_');
        let acordeMostrar = convertirAcordeASistema(acordeOriginal, sistema);

        resultado += `<a class="acorde-link" data-acorde="${idAcordeDiccionario}">${acordeMostrar}</a>`;

        let diff = acordeMostrar.length - acordeOriginal.length;
        let finAcordeOriginal = m.index + acordeOriginal.length;

        if (diff !== 0) {
            let distanciaAlSiguiente = Infinity;
            let textoEntreAcordes = "";
            
            if (i + 1 < matches.length) {
                distanciaAlSiguiente = matches[i + 1].index - finAcordeOriginal;
                textoEntreAcordes = textoProcesado.slice(finAcordeOriginal, matches[i + 1].index);
            }

            if (distanciaAlSiguiente <= 3 && diff > 0 && textoEntreAcordes.length < diff + 1) {
                resultado += ' ';
            }

            if (distanciaAlSiguiente <= 3) {
                // Mantiene el espaciado original
            } else {
                let restoTexto = textoProcesado.slice(finAcordeOriginal);
                let matchEspacios = restoTexto.match(/^ */);
                let numEspaciosOriginales = matchEspacios ? matchEspacios[0].length : 0;

                if (diff > 0) {
                    let espaciosAComer = Math.min(numEspaciosOriginales, diff);
                    finAcordeOriginal += espaciosAComer;
                } else if (diff < 0) {
                    resultado += ' '.repeat(-diff);
                }
            }
        }

        cursor = finAcordeOriginal;
    }

    resultado += envolverBarras(textoProcesado.slice(cursor));

    return resultado;
}

export function inicializarModalAcordes(cajaId, obtenerSistema = () => 'ANGLOSAJON') {
    const caja = document.getElementById(cajaId);
    if (!caja) return;

    document.body.addEventListener('click', function(evento) {
        const link = evento.target.closest('.acorde-link');
        
        if (link) {
            evento.stopPropagation();
            evento.preventDefault();
            const nombreAcorde = link.getAttribute('data-acorde');
            const sistema = obtenerSistema();
            abrirCajaAcorde(nombreAcorde, evento, caja, sistema);
        } else if (caja.style.display === "block" && !caja.contains(evento.target)) {
            cerrarCajaAcorde(caja);
        }
    });
}

function abrirCajaAcorde(nombreAcordeRaw, evento, caja, sistema = 'ANGLOSAJON') {
    const titulo = document.getElementById('acorde-titulo');
    const badgeorigen = document.getElementById('origen-acorde-modal');
    const wrapperRender = document.getElementById('wrapper-render');

    if (!titulo || !wrapperRender) return;

    wrapperRender.style.marginTop = "4px";
    wrapperRender.style.marginBottom = "-12px";

    const analisis = analizarNombreAcorde(nombreAcordeRaw);
    const { textoLimpio, raiz, alteraciones, notaBajo } = analisis;
    const nombreFormateado = convertirAcordeASistema(textoLimpio.replace('_', '/'), sistema);

    let sufijoJson = alteraciones;
    if (alteraciones.toLowerCase() === "min" || alteraciones.toLowerCase() === "m") {
        sufijoJson = "m";
    } else if (alteraciones.toLowerCase() === "min7" || alteraciones.toLowerCase() === "m7") {
        sufijoJson = "m7";
    } else if (alteraciones.toLowerCase() === "maj") {
        sufijoJson = "";
    }

    const llaveDirectaConBajo = nombreAcordeRaw; 
    const llaveAcordeBusqueda = `${raiz}${sufijoJson}`;
    const llaveConBajoTraducido = notaBajo ? `${llaveAcordeBusqueda}_${notaBajo}` : null;

    const diccionario = window.DICCIONARIO_ACORDES || (typeof DICCIONARIO_ACORDES !== 'undefined' ? DICCIONARIO_ACORDES : null);
    let datosManuales = diccionario ? (
        diccionario[llaveDirectaConBajo]
        || (llaveConBajoTraducido && diccionario[llaveConBajoTraducido])
        || (!notaBajo && diccionario[llaveAcordeBusqueda])
    ) : null;

    caja.style.display = "block";
    caja.style.position = "fixed"; 

    if (badgeorigen) badgeorigen.textContent = "";
    titulo.textContent = nombreFormateado;

    let iconoHTML = '';
    if (datosManuales) {
        iconoHTML = `<span class="material-symbols-outlined" style="position: absolute; top: 12px; right: 12px; font-size: 18px; color: var(--accent, #bc9731);" title="Diccionario Manual">menu_book</span>`;
    } else {
        iconoHTML = `<span class="material-symbols-outlined" style="position: absolute; top: 12px; right: 12px; font-size: 18px; color: #2ec4b6;" title="Generado Automáticamente">auto_awesome</span>`;
    }

    let iconoExistente = caja.querySelector('.icono-origen-acorde');
    if (iconoExistente) iconoExistente.remove();

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = iconoHTML;
    const elIcono = tempDiv.firstElementChild;
    elIcono.classList.add('icono-origen-acorde');
    caja.appendChild(elIcono);

    if (datosManuales) {
        dibujarAcordeCanvasExpandido(wrapperRender, datosManuales);
    } else {
        let automatica = null;
        try {
            automatica = digitacionAutomatica(analisis);
        } catch (error) {
            automatica = null;
        }

        if (automatica) {
            dibujarAcordeCanvasExpandido(wrapperRender, automatica);
        } else {
            wrapperRender.innerHTML = `<div style="font-size:11px; color:#ff3333;">Error de auto-cálculo</div>`;
            wrapperRender.dataset.strings = "";
        }
    }

    const esMovil = window.innerWidth <= 600;
    const rect = caja.getBoundingClientRect();
    const padding = 12;

    if (esMovil) {
        let left = (window.innerWidth - rect.width) / 2;
        let top = evento.clientY ? (evento.clientY - rect.height - 15) : (window.innerHeight / 3);

        if (top < padding || top + rect.height > window.innerHeight - padding) {
            top = Math.max(padding, (window.innerHeight - rect.height) / 2);
        }

        caja.style.left = `${Math.max(padding, left)}px`;
        caja.style.top = `${top}px`;
    } else {
        let clientX = evento.clientX || (evento.touches && evento.touches[0].clientX) || 100;
        let clientY = evento.clientY || (evento.touches && evento.touches[0].clientY) || 100;

        let left = clientX + 15;
        let top = clientY - rect.height - 10;

        if (top < padding) top = clientY + 20;
        if (top + rect.height > window.innerHeight - padding) top = window.innerHeight - rect.height - padding;
        if (left + rect.width > window.innerWidth - padding) left = window.innerWidth - rect.width - padding;
        if (left < padding) left = padding;

        caja.style.left = `${left}px`;
        caja.style.top = `${top}px`;
    }
}

export function dibujarAcordeCanvasExpandido(wrapper, datos) {
    wrapper.innerHTML = ""; 
    wrapper.dataset.strings = datos.strings;

    const esMovil = window.innerWidth <= 600;
    const canvas = document.createElement('canvas');
    
    // Ancho optimizado para simetría perfecta en móvil
    const anchoCanvas = esMovil ? 124 : 150;
    const altoCanvas = esMovil ? 104 : 124; 
    const dpr = window.devicePixelRatio || 1;

    canvas.width = anchoCanvas * dpr;
    canvas.height = altoCanvas * dpr;
    canvas.style.width = anchoCanvas + "px";
    canvas.style.height = altoCanvas + "px";
    canvas.style.display = "block";
    canvas.style.margin = "0 auto";

    wrapper.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const trastesArr = datos.strings.trim().toUpperCase().split(/\s+/);
    const trasteBase = datos.trasteInicio || 1;

    // xInicio ajustado simétricamente para móvil y escritorio
    const xInicio = esMovil ? 30 : 32;
    const yInicio = esMovil ? 10 : 12; 
    const anchoDiapason = esMovil ? 65 : 85;
    const altoDiapason = esMovil ? 70 : 88; 
    const numCuerdas = 6, numTrastesVisibles = 4;
    
    const espacioCuerdas = anchoDiapason / (numCuerdas - 1);
    const espacioTrastes = altoDiapason / numTrastesVisibles;

    ctx.strokeStyle = "#717171";
    if (trasteBase === 1) {
        ctx.lineWidth = esMovil ? 3 : 4;
        ctx.beginPath(); ctx.moveTo(xInicio, yInicio); ctx.lineTo(xInicio + anchoDiapason, yInicio); ctx.stroke();
    } else {
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(xInicio, yInicio); ctx.lineTo(xInicio + anchoDiapason, yInicio); ctx.stroke();
        ctx.fillStyle = "#2ec4b6"; 
        ctx.font = esMovil ? "bold 8px monospace" : "bold 10px monospace"; 
        ctx.textAlign = "right";
        ctx.fillText(`Fr. ${trasteBase}`, xInicio - 6, yInicio + (espacioTrastes / 2) + 3);
    }

    ctx.lineWidth = 1; ctx.strokeStyle = "#717171";
    for (let i = 1; i <= numTrastesVisibles; i++) {
        let y = yInicio + (i * espacioTrastes);
        ctx.beginPath(); ctx.moveTo(xInicio, y); ctx.lineTo(xInicio + anchoDiapason, y); ctx.stroke();
    }

    for (let i = 0; i < numCuerdas; i++) {
        let x = xInicio + (i * espacioCuerdas);
        ctx.lineWidth = (i >= 4) ? 1.5 : 1; 
        ctx.beginPath(); ctx.moveTo(x, yInicio); ctx.lineTo(x, yInicio + altoDiapason); ctx.stroke();
    }

    if (datos.cejilla && datos.cuerdasCejilla) {
        const cuerdaInicio = datos.cuerdasCejilla[0] - 1; 
        const cuerdaFin = datos.cuerdasCejilla[1] - 1;
        const yCejilla = yInicio + (espacioTrastes / 2);

        ctx.strokeStyle = "rgba(46, 196, 182, 0.8)";
        ctx.lineWidth = esMovil ? 4 : 6; 
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(xInicio + (cuerdaInicio * espacioCuerdas), yCejilla);
        ctx.lineTo(xInicio + (cuerdaFin * espacioCuerdas), yCejilla);
        ctx.stroke();
        ctx.lineCap = "butt";
    }

    trastesArr.forEach((trasteStr, indiceCuerda) => {
        let x = xInicio + (indiceCuerda * espacioCuerdas);

        if (trasteStr === "X") {
            ctx.fillStyle = "#ff3333"; 
            ctx.font = esMovil ? "bold 8px sans-serif" : "bold 10px sans-serif"; 
            ctx.textAlign = "center";
            ctx.fillText("✕", x, yInicio - 4);
        } else if (trasteStr === "0") {
            ctx.strokeStyle = "#2ec4b6"; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.arc(x, yInicio - 6, esMovil ? 2 : 2.5, 0, Math.PI * 2); ctx.stroke();
        } else {
            let numTrasteAbsoluto = parseInt(trasteStr);
            if (!isNaN(numTrasteAbsoluto)) {
                let posicionRelativaTraste = numTrasteAbsoluto - trasteBase + 1;
                if (posicionRelativaTraste >= 1 && posicionRelativaTraste <= numTrastesVisibles) {
                    let yPoint = yInicio + (posicionRelativaTraste * espacioTrastes) - (espacioTrastes / 2);
                    ctx.fillStyle = "#ffffff";
                    ctx.strokeStyle = "#2ec4b6";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath(); 
                    ctx.arc(x, yPoint, esMovil ? 3.5 : 4.5, 0, Math.PI * 2); 
                    ctx.fill(); 
                    ctx.stroke();
                }
            }
        }
    });
}

export function cerrarCajaAcorde(caja) {
    if (caja) caja.style.display = "none";
}