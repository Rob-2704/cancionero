import { crearRegexAcordes, convertirAcordeASistema } from './modulo-acordes.js';

const NATURAL_ESPANOL_SEMI = { DO: 0, RE: 2, MI: 4, FA: 5, SOL: 7, LA: 9, SI: 11 };
const NATURAL_INGLES_SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const SOST_INGLES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const BEMOL_INGLES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const SOST_ESPANOL = ["DO", "DO#", "RE", "RE#", "MI", "FA", "FA#", "SOL", "SOL#", "LA", "LA#", "SI"];
const BEMOL_ESPANOL = ["DO", "REb", "RE", "MIb", "MI", "FA", "SOLb", "SOL", "LAb", "LA", "SIb", "SI"];

// Analiza una raíz de acorde exigiendo estrictamente MAYÚSCULAS
function analizarRaiz(token) {
    const m = token.match(/^(DO|RE|MI|FA|SOL|LA|SI|[A-G])(#|b)?$/);
    if (!m) return null;

    const base = m[1];
    const alt = m[2] ? m[2].toLowerCase() : '';
    const esEspanol = base in NATURAL_ESPANOL_SEMI;
    const tabla = esEspanol ? NATURAL_ESPANOL_SEMI : NATURAL_INGLES_SEMI;
    if (!(base in tabla)) return null;

    let semitono = tabla[base];
    if (alt === '#') semitono = (semitono + 1) % 12;
    if (alt === 'b') semitono = (semitono + 11) % 12;

    return { semitono, esEspanol, preferirBemol: alt === 'b' };
}

function nombreDesdeSemitono(semitono, esEspanol, preferirBemol) {
    semitono = ((semitono % 12) + 12) % 12;
    if (esEspanol) return preferirBemol ? BEMOL_ESPANOL[semitono] : SOST_ESPANOL[semitono];
    return preferirBemol ? BEMOL_INGLES[semitono] : SOST_INGLES[semitono];
}

// alteracion: 'SOSTENIDO' | 'BEMOL' | null (null = respetar cómo está escrito cada acorde)
function transponerAcorde(acordeCompleto, semitonos, alteracion = null) {
    if (!semitonos && !alteracion) return acordeCompleto;

    const mRaiz = acordeCompleto.match(/^(DO|RE|MI|FA|SOL|LA|SI|[A-G])(#|b)?/);
    if (!mRaiz) return acordeCompleto;

    const infoRaiz = analizarRaiz(mRaiz[0]);
    if (!infoRaiz) return acordeCompleto;

    const bemolDe = (info) => alteracion ? alteracion === 'BEMOL' : info.preferirBemol;

    let resto = acordeCompleto.slice(mRaiz[0].length);
    const nuevaRaiz = nombreDesdeSemitono(infoRaiz.semitono + semitonos, infoRaiz.esEspanol, bemolDe(infoRaiz));

    const mBajo = resto.match(/\/(DO|RE|MI|FA|SOL|LA|SI|[A-G])(#|b)?$/);
    if (mBajo) {
        const infoBajo = analizarRaiz(mBajo[0].slice(1));
        if (infoBajo) {
            const nuevoBajo = nombreDesdeSemitono(infoBajo.semitono + semitonos, infoBajo.esEspanol, bemolDe(infoBajo));
            resto = resto.slice(0, mBajo.index) + '/' + nuevoBajo;
        }
    }

    return nuevaRaiz + resto;
}

function transponerLinea(linea, semitonos, alteracion = null) {
    const regex = crearRegexAcordes();
    let resultado = '';
    let ultimoIndice = 0;
    let m;

    while ((m = regex.exec(linea)) !== null) {
        const acordeOriginal = m[0];
        if (acordeOriginal.length === 0) { regex.lastIndex++; continue; }

        resultado += linea.slice(ultimoIndice, m.index);
        let nuevo = transponerAcorde(acordeOriginal, semitonos, alteracion);
        const diff = nuevo.length - acordeOriginal.length;

        const restoLinea = linea.slice(m.index + acordeOriginal.length);
        const matchEspacios = restoLinea.match(/^ */);
        const numEspacios = matchEspacios ? matchEspacios[0].length : 0;

        if (numEspacios === 1) {
            resultado += nuevo;
            ultimoIndice = m.index + acordeOriginal.length;
        } else if (diff > 0) {
            if (numEspacios >= diff) {
                resultado += nuevo;
                ultimoIndice = m.index + acordeOriginal.length + diff;
                regex.lastIndex += diff;
            } else {
                resultado += nuevo;
                ultimoIndice = m.index + acordeOriginal.length;
            }
        } else if (diff < 0) {
            if (numEspacios > 1) {
                nuevo += ' '.repeat(-diff);
            }
            resultado += nuevo;
            ultimoIndice = m.index + acordeOriginal.length;
        } else {
            resultado += nuevo;
            ultimoIndice = m.index + acordeOriginal.length;
        }
    }

    resultado += linea.slice(ultimoIndice);
    return resultado;
}

export function transponerTexto(texto, semitonos, alteracion = null) {
    if (!texto || (!semitonos && !alteracion)) return texto;
    return texto.split(/\r?\n/).map(linea => transponerLinea(linea, semitonos, alteracion)).join('\n');
}

// Si la canción solo usa bemoles se muestra con bemoles; en cualquier otro caso, con sostenidos.
function detectarAlteracion(texto) {
    if (!texto) return 'SOSTENIDO';
    const regex = crearRegexAcordes();
    let sostenidos = 0, bemoles = 0, m;

    while ((m = regex.exec(texto)) !== null) {
        if (m[0].length === 0) { regex.lastIndex++; continue; }
        const r = m[0].match(/^(DO|RE|MI|FA|SOL|LA|SI|[A-G])(#|b)?/);
        if (!r) continue;
        if (r[2] === '#') sostenidos++;
        else if (r[2] === 'b') bemoles++;
    }
    return bemoles > sostenidos ? 'BEMOL' : 'SOSTENIDO';
}

const CLAVE_ALTERACION = 'preferenciaAlteracion';

// Preferencia ♯/♭ guardada por el usuario ('SOSTENIDO' | 'BEMOL'), o null si nunca la eligió.
export function leerAlteracionGuardada() {
    try {
        const v = localStorage.getItem(CLAVE_ALTERACION);
        return v === 'BEMOL' || v === 'SOSTENIDO' ? v : null;
    } catch (_) { return null; }
}

function guardarAlteracion(valor) {
    try { localStorage.setItem(CLAVE_ALTERACION, valor); } catch (_) {}
}

// ---------------------------------------------------------------------------
// Detección de tonalidad (mayor / menor)
// Cada acorde se clasifica por raíz y calidad (M, m, d, D = dominante 7, p = neutro).
// Para las 24 tonalidades posibles se suma cuánto encaja cada acorde en su campo
// armónico; la tónica, el primer acorde, el último acorde y la dominante (V / V7)
// pesan más. Devuelve { semitono, menor } o null si no hay acordes.
// ---------------------------------------------------------------------------
const CAMPO_MAYOR = { 0: ['M'], 2: ['m'], 4: ['m'], 5: ['M'], 7: ['M'], 9: ['m'], 11: ['d'] };
// Menor natural + armónica (V mayor y vii° incluidos)
const CAMPO_MENOR = { 0: ['m'], 2: ['d'], 3: ['M'], 5: ['m'], 7: ['m', 'M'], 8: ['M'], 10: ['M'], 11: ['d'] };

const TONICA_MAYOR = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const TONICA_MENOR = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];

function clasificarAcorde(texto) {
    const m = texto.match(/^(DO|RE|MI|FA|SOL|LA|SI|[A-G])(#|b)?(.*)$/);
    if (!m) return null;
    const info = analizarRaiz(m[1] + (m[2] || ''));
    if (!info) return null;

    const resto = m[3].replace(/\/.*$/, ''); // sin el bajo
    let calidad = 'M';
    if (/^(dim|°|ø|m7b5)/.test(resto)) calidad = 'd';
    else if (/^(m(?!aj)|min)/.test(resto)) calidad = 'm';
    else if (/^(7|9|11|13)/.test(resto)) calidad = 'D';
    else if (/^(5|sus|2|4|aug|\+)/.test(resto)) calidad = 'p';

    return { semitono: info.semitono, calidad };
}

function puntuarTonalidad(acordes, tonica, menor) {
    const campo = menor ? CAMPO_MENOR : CAMPO_MAYOR;
    const calidadTonica = menor ? 'm' : 'M';
    const ultimo = acordes.length - 1;
    let total = 0;

    acordes.forEach((ac, i) => {
        const g = (ac.semitono - tonica + 12) % 12;
        const permitidas = campo[g];
        let p;

        if (ac.calidad === 'p') {
            p = permitidas ? 0.5 : -0.5;
        } else if (ac.calidad === 'D') {
            if (g === 7) p = 1.2;                                        // V7
            else if (permitidas && permitidas.includes('M')) p = 0.2;    // I7, IV7...
            else p = campo[(g + 5) % 12] ? 0.3 : -0.8;                   // dominante secundaria
        } else if (permitidas) {
            p = permitidas.includes(ac.calidad) ? 1 : -0.5;
        } else {
            p = -1;
        }

        const esTonica = g === 0 && (ac.calidad === calidadTonica || (!menor && ac.calidad === 'D'));
        if (esTonica) {
            p += 0.8;
            if (i === 0) p += 2;
            if (i === ultimo) p += 3;
        }
        total += p;
    });

    return total;
}

export function detectarTonalidad(texto) {
    if (!texto) return null;
    const regex = crearRegexAcordes();
    const acordes = [];
    let m;

    // El regex descarta un acorde si tras el salto de línea viene una minúscula;
    // un espacio antes de cada salto evita perder el último acorde de cada línea.
    texto = texto.replace(/\r?\n/g, ' \n');

    while ((m = regex.exec(texto)) !== null) {
        if (m[0].length === 0) { regex.lastIndex++; continue; }
        const ac = clasificarAcorde(m[0]);
        if (ac) acordes.push(ac);
    }
    if (acordes.length === 0) return null;

    let mejor = null, mejorPuntaje = -Infinity;
    for (const menor of [false, true]) {
        for (let tonica = 0; tonica < 12; tonica++) {
            const puntaje = puntuarTonalidad(acordes, tonica, menor);
            if (puntaje > mejorPuntaje) {
                mejorPuntaje = puntaje;
                mejor = { semitono: tonica, menor };
            }
        }
    }
    return mejor;
}

// ton = { semitono, menor } (resultado de detectarTonalidad).
// alteracion: 'SOSTENIDO' → "LA#", 'BEMOL' → "SIb"; null → ambos nombres "LA#/SIb".
// Las tonalidades naturales ("LA", "LAm") no cambian.
export function nombreTonalidad(ton, sistema = 'LATINO', alteracion = null) {
    if (!ton || typeof ton.semitono !== 'number') return '—';
    const i = ((ton.semitono % 12) + 12) % 12;
    const sufijo = ton.menor ? 'm' : '';
    const sostenido = SOST_INGLES[i] + sufijo;
    const bemol = BEMOL_INGLES[i] + sufijo;
    let nombre;
    if (sostenido === bemol) nombre = sostenido;
    else if (alteracion === 'SOSTENIDO') nombre = sostenido;
    else if (alteracion === 'BEMOL') nombre = bemol;
    else nombre = `${sostenido}/${bemol}`;
    return convertirAcordeASistema(nombre, sistema);
}

export function inicializarTransponer(opciones) {
    const {
        contenidoOriginal,
        onRetransponer,
        tonalidadLabelId,
        btnSubirTonoId, btnSubirMedioId, btnBajarMedioId, btnBajarTonoId, btnResetId,
        btnToggleId, panelId,
        btnAlteracionId,
        obtenerSistema = () => 'LATINO'
    } = opciones;

    let offset = 0;
    let alteracion = leerAlteracionGuardada() || detectarAlteracion(contenidoOriginal);
    const tonalidadBase = detectarTonalidad(contenidoOriginal);
    const labelEl = document.getElementById(tonalidadLabelId);
    const btnAlteracion = btnAlteracionId ? document.getElementById(btnAlteracionId) : null;

    function actualizarBotonAlteracion() {
        if (!btnAlteracion) return;
        const esBemol = alteracion === 'BEMOL';
        btnAlteracion.textContent = esBemol ? '♯' : '♭';
        btnAlteracion.title = esBemol
            ? 'Usar sostenidos (♯)'
            : 'Usar bemoles (♭)';
    }

    function actualizar() {
        if (labelEl) {
            labelEl.textContent = tonalidadBase === null
                ? '—'
                : nombreTonalidad(
                    { semitono: tonalidadBase.semitono + offset, menor: tonalidadBase.menor },
                    obtenerSistema(),
                    alteracion
                );
        }
        actualizarBotonAlteracion();
        onRetransponer(transponerTexto(contenidoOriginal, offset, alteracion));
    }

    if (btnAlteracion) {
        btnAlteracion.addEventListener('click', () => {
            alteracion = alteracion === 'BEMOL' ? 'SOSTENIDO' : 'BEMOL';
            guardarAlteracion(alteracion);
            actualizar();
        });
    }

    const conectar = (id, delta) => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', () => { offset += delta; actualizar(); });
    };
    conectar(btnSubirTonoId, 2);
    conectar(btnSubirMedioId, 1);
    conectar(btnBajarMedioId, -1);
    conectar(btnBajarTonoId, -2);

    const btnReset = document.getElementById(btnResetId);
    if (btnReset) btnReset.addEventListener('click', () => { offset = 0; actualizar(); });

    const btnToggle = document.getElementById(btnToggleId);
    const panel = document.getElementById(panelId);
    if (btnToggle && panel) {
        btnToggle.addEventListener('click', () => {
            const estaAbierto = panel.style.display !== 'none';
            panel.style.display = estaAbierto ? 'none' : 'flex';
            btnToggle.classList.toggle('abierto', !estaAbierto);
        });
    }

    actualizar();

    return { actualizar };
}