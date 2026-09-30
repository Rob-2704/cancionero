// modulo-transponer.js — transpone los acordes del texto crudo de una canción.
// Reutiliza la MISMA regex que modulo-acordes.js usa para pintar acordes
// (crearRegexAcordes), así que solo se transpone lo que ahí se resalta.
import { crearRegexAcordes } from './modulo-acordes.js';

const NATURAL_ESPANOL_SEMI = { DO: 0, RE: 2, MI: 4, FA: 5, SOL: 7, LA: 9, SI: 11 };
const NATURAL_INGLES_SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const SOST_INGLES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const BEMOL_INGLES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const SOST_ESPANOL = ["DO", "DO#", "RE", "RE#", "MI", "FA", "FA#", "SOL", "SOL#", "LA", "LA#", "SI"];
const BEMOL_ESPANOL = ["DO", "REb", "RE", "MIb", "MI", "FA", "SOLb", "SOL", "LAb", "LA", "SIb", "SI"];

// Analiza una raíz de acorde ("C", "C#", "Db", "DO", "SOLb"...) y devuelve su semitono,
// si estaba escrita en español y si usaba sostenido o bemol (para conservar el estilo al transponer).
function analizarRaiz(token) {
    const m = token.match(/^(DO|RE|MI|FA|SOL|LA|SI|[A-G])(#|b)?$/i);
    if (!m) return null;

    const base = m[1].toUpperCase();
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

// Transpone un acorde completo (ej: "Do#m7(b5)/SOL"), moviendo solo su raíz y,
// si tiene, la nota del bajo tras la "/". Todo lo demás (calidad, extensión,
// alteraciones entre paréntesis) se deja exactamente igual.
function transponerAcorde(acordeCompleto, semitonos) {
    if (!semitonos) return acordeCompleto;

    const mRaiz = acordeCompleto.match(/^(DO|RE|MI|FA|SOL|LA|SI|[A-G])(#|b)?/i);
    if (!mRaiz) return acordeCompleto;

    const infoRaiz = analizarRaiz(mRaiz[0]);
    if (!infoRaiz) return acordeCompleto;

    let resto = acordeCompleto.slice(mRaiz[0].length);
    const nuevaRaiz = nombreDesdeSemitono(infoRaiz.semitono + semitonos, infoRaiz.esEspanol, infoRaiz.preferirBemol);

    const mBajo = resto.match(/\/(DO|RE|MI|FA|SOL|LA|SI|[A-G])(#|b)?$/i);
    if (mBajo) {
        const infoBajo = analizarRaiz(mBajo[0].slice(1));
        if (infoBajo) {
            const nuevoBajo = nombreDesdeSemitono(infoBajo.semitono + semitonos, infoBajo.esEspanol, infoBajo.preferirBemol);
            resto = resto.slice(0, mBajo.index) + '/' + nuevoBajo;
        }
    }

    return nuevaRaiz + resto;
}

// Transpone una línea completa, ajustando los espacios que siguen a cada acorde
// cuando su longitud cambia, para no desplazar el resto de acordes/letra que
// vienen después en la misma línea (importante: el texto va en <pre>, alineado por columnas).
function transponerLinea(linea, semitonos) {
    const regex = crearRegexAcordes();
    let resultado = '';
    let ultimoIndice = 0;
    let m;

    while ((m = regex.exec(linea)) !== null) {
        const acordeOriginal = m[0];
        if (acordeOriginal.length === 0) { regex.lastIndex++; continue; }

        resultado += linea.slice(ultimoIndice, m.index);
        let nuevo = transponerAcorde(acordeOriginal, semitonos);
        const diff = nuevo.length - acordeOriginal.length;

        if (diff > 0) {
            // El acorde creció: le "quitamos" esa cantidad a los espacios que le siguen
            const restoLinea = linea.slice(m.index + acordeOriginal.length);
            const espacios = restoLinea.match(/^ */)[0];
            if (espacios.length >= diff) {
                resultado += nuevo;
                ultimoIndice = m.index + acordeOriginal.length + diff;
                regex.lastIndex += diff;
                continue;
            }
            // No hay suficientes espacios: la línea crecerá un poco (se resuelve con scroll horizontal)
        } else if (diff < 0) {
            // El acorde se acortó: rellenamos con espacios para no correr lo que sigue
            nuevo += ' '.repeat(-diff);
        }

        resultado += nuevo;
        ultimoIndice = m.index + acordeOriginal.length;
    }

    resultado += linea.slice(ultimoIndice);
    return resultado;
}

// Transpone el texto crudo completo (antes de pasarlo por procesarLetraYAcordes).
export function transponerTexto(texto, semitonos) {
    if (!texto || !semitonos) return texto;
    return texto.split(/\r?\n/).map(linea => transponerLinea(linea, semitonos)).join('\n');
}

// Detecta la tonalidad de la canción: la raíz de acorde más frecuente en el texto original.
// Devuelve un semitono (0-11) o null si no se detectó ningún acorde.
export function detectarTonalidad(texto) {
    if (!texto) return null;
    const regex = crearRegexAcordes();
    const conteo = {};
    let m;

    while ((m = regex.exec(texto)) !== null) {
        if (m[0].length === 0) { regex.lastIndex++; continue; }
        const mRaiz = m[0].match(/^(DO|RE|MI|FA|SOL|LA|SI|[A-G])(#|b)?/i);
        if (!mRaiz) continue;
        const info = analizarRaiz(mRaiz[0]);
        if (!info) continue;
        conteo[info.semitono] = (conteo[info.semitono] || 0) + 1;
    }

    let mejorSemi = null, mejorCuenta = 0;
    for (const s in conteo) {
        if (conteo[s] > mejorCuenta) { mejorCuenta = conteo[s]; mejorSemi = Number(s); }
    }
    return mejorSemi;
}

// Nombre de un semitono para mostrarlo en el círculo de tonalidad (siempre en español, con sostenidos).
export function nombreTonalidad(semitono) {
    if (semitono === null || semitono === undefined) return '—';
    return SOST_ESPANOL[((semitono % 12) + 12) % 12];
}

// Conecta los botones del panel de transposición y re-renderiza la letra en cada cambio.
// opciones: {
//   contenidoOriginal: texto crudo de la canción (sin transponer),
//   onRetransponer: (textoTranspuesto) => void   — debe volver a pintar la letra,
//   tonalidadLabelId, btnSubirTonoId, btnSubirMedioId, btnBajarMedioId, btnBajarTonoId, btnResetId,
//   btnToggleId, panelId  — para el menú expandible
// }
export function inicializarTransponer(opciones) {
    const {
        contenidoOriginal,
        onRetransponer,
        tonalidadLabelId,
        btnSubirTonoId, btnSubirMedioId, btnBajarMedioId, btnBajarTonoId, btnResetId,
        btnToggleId, panelId
    } = opciones;

    let offset = 0;
    const semitonoBase = detectarTonalidad(contenidoOriginal);
    const labelEl = document.getElementById(tonalidadLabelId);

    function actualizar() {
        if (labelEl) labelEl.textContent = semitonoBase === null ? '—' : nombreTonalidad(semitonoBase + offset);
        onRetransponer(transponerTexto(contenidoOriginal, offset));
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
            btnToggle.textContent = estaAbierto ? '▲' : '▼';
        });
    }

    actualizar();
}
