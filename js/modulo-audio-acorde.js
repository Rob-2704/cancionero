// Afinación estándar (cuerda 6 → 1): E2 A2 D3 G3 B3 E4, en números MIDI
const MIDI_CUERDAS_AIRE = [40, 45, 50, 55, 59, 64];

// Rango de notas grabadas disponibles: E2 (40) … D5 (74)
const MIDI_MIN = 40;
const MIDI_MAX = 74;
const NOMBRES_ARCHIVO = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];

// La carpeta se resuelve relativa a este módulo: js/samples/guitar/
const BASE_MUESTRAS = new URL('../samples/guitar/', import.meta.url).href;

const RETARDO_RASGUEO = 0.045; // segundos entre cuerdas
const VOLUMEN_MAESTRO = 0.7;

let audioCtx = null;
let salidaActual = null;
const cacheMuestras = new Map();

function obtenerContexto() {
    if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function midiAFrecuencia(midi, la4 = 440) {
    return la4 * Math.pow(2, (midi - 69) / 12);
}

function nombreArchivo(midi) {
    const octava = Math.floor(midi / 12) - 1;
    return `${NOMBRES_ARCHIVO[midi % 12]}${octava}`;
}

function decodificar(ctx, datos) {
    return new Promise((resolver, rechazar) => {
        const p = ctx.decodeAudioData(datos, resolver, rechazar);
        if (p && typeof p.catch === 'function') p.catch(rechazar);
    });
}

function cargarMuestra(ctx, midiMuestra) {
    const nombre = nombreArchivo(midiMuestra);
    if (!cacheMuestras.has(nombre)) {
        const promesa = fetch(`${BASE_MUESTRAS}${nombre}.mp3`)
            .then(r => {
                if (!r.ok) throw new Error(`No se pudo cargar ${nombre}.mp3 (${r.status})`);
                return r.arrayBuffer();
            })
            .then(datos => decodificar(ctx, datos));
        promesa.catch(() => cacheMuestras.delete(nombre));
        cacheMuestras.set(nombre, promesa);
    }
    return cacheMuestras.get(nombre);
}

/** Precarga las notas de un acorde sin tocarlas (opcional). */
export function precargarAcorde(stringsStr) {
    const ctx = obtenerContexto();
    if (!ctx) return;
    notasDeAcorde(stringsStr).forEach(midi => {
        cargarMuestra(ctx, Math.min(Math.max(midi, MIDI_MIN), MIDI_MAX)).catch(() => {});
    });
}

function notasDeAcorde(stringsStr) {
    if (!stringsStr) return [];
    const midis = [];
    stringsStr.trim().toUpperCase().split(/\s+/).forEach((t, i) => {
        if (t === 'X' || i >= 6) return;
        const traste = parseInt(t, 10);
        if (isNaN(traste)) return;
        midis.push(MIDI_CUERDAS_AIRE[i] + traste);
    });
    return midis;
}

function crearSalida(ctx) {
    // Si había un acorde sonando, se apaga suavemente antes del nuevo
    if (salidaActual) {
        const { nodo, ctxSalida } = salidaActual;
        try {
            nodo.gain.cancelScheduledValues(ctxSalida.currentTime);
            nodo.gain.setValueAtTime(nodo.gain.value, ctxSalida.currentTime);
            nodo.gain.linearRampToValueAtTime(0.0001, ctxSalida.currentTime + 0.08);
        } catch (e) {}
    }

    const maestro = ctx.createGain();
    maestro.gain.value = VOLUMEN_MAESTRO;

    const compresor = ctx.createDynamicsCompressor();
    compresor.threshold.value = -18;
    compresor.ratio.value = 4;

    maestro.connect(compresor);
    compresor.connect(ctx.destination);

    salidaActual = { nodo: maestro, ctxSalida: ctx };
    return maestro;
}

/**
 * Toca un acorde a partir de la cadena de trastes, p. ej. "X 3 2 0 1 0"
 * (cuerda 6 → cuerda 1, "X" = cuerda silenciada).
 */
export async function reproducirAcorde(stringsStr) {
    const ctx = obtenerContexto();
    if (!ctx) return;

    const midis = notasDeAcorde(stringsStr);
    if (!midis.length) return;

    let buffers;
    try {
        buffers = await Promise.all(
            midis.map(m => cargarMuestra(ctx, Math.min(Math.max(m, MIDI_MIN), MIDI_MAX)))
        );
    } catch (error) {
        console.warn('Muestras de guitarra no disponibles, usando síntesis:', error);
        reproducirSintetizado(ctx, midis);
        return;
    }

    const salida = crearSalida(ctx);
    const ahora = ctx.currentTime + 0.02;

    midis.forEach((midi, n) => {
        const midiMuestra = Math.min(Math.max(midi, MIDI_MIN), MIDI_MAX);
        const buffer = buffers[n];

        const fuente = ctx.createBufferSource();
        fuente.buffer = buffer;
        fuente.playbackRate.value = Math.pow(2, (midi - midiMuestra) / 12);

        // Pequeña variación humana en el momento y la fuerza de cada cuerda
        const inicio = ahora + n * RETARDO_RASGUEO + Math.random() * 0.006;
        const volumen = 0.8 + Math.random() * 0.2;
        const fin = inicio + Math.min(buffer.duration / fuente.playbackRate.value, 4);

        const ganancia = ctx.createGain();
        ganancia.gain.setValueAtTime(volumen, inicio);
        ganancia.gain.setValueAtTime(volumen, Math.max(inicio, fin - 0.6));
        ganancia.gain.linearRampToValueAtTime(0.0001, fin);

        fuente.connect(ganancia);
        ganancia.connect(salida);
        fuente.start(inicio);
        fuente.stop(fin + 0.05);
    });
}

/**
 * Toca una sola nota (número MIDI) con las mismas grabaciones de guitarra que los acordes.
 * Lo usa el afinador como nota de referencia. Las grabaciones están afinadas en LA = 440 Hz;
 * `la4` desplaza el tono (p. ej. 432) con playbackRate.
 * Devuelve la duración aproximada (s) de lo que sonará, o 0 si no se pudo reproducir.
 */
export async function reproducirNota(midi, la4 = 440) {
    const ctx = obtenerContexto();
    if (!ctx) return 0;

    const midiMuestra = Math.min(Math.max(midi, MIDI_MIN), MIDI_MAX);
    let buffer;
    try {
        buffer = await cargarMuestra(ctx, midiMuestra);
    } catch (error) {
        console.warn('Muestras de guitarra no disponibles, usando síntesis:', error);
        reproducirSintetizado(ctx, [midi], la4);
        return 2.4;
    }

    const salida = crearSalida(ctx);
    const inicio = ctx.currentTime + 0.02;

    const fuente = ctx.createBufferSource();
    fuente.buffer = buffer;
    fuente.playbackRate.value = Math.pow(2, (midi - midiMuestra) / 12) * (la4 / 440);

    const duracion = Math.min(buffer.duration / fuente.playbackRate.value, 4);
    const fin = inicio + duracion;

    const ganancia = ctx.createGain();
    ganancia.gain.setValueAtTime(1, inicio);
    ganancia.gain.setValueAtTime(1, Math.max(inicio, fin - 0.6));
    ganancia.gain.linearRampToValueAtTime(0.0001, fin);

    fuente.connect(ganancia);
    ganancia.connect(salida);
    fuente.start(inicio);
    fuente.stop(fin + 0.05);
    return duracion;
}

/** Precarga la grabación de una nota (opcional). */
export function precargarNota(midi) {
    const ctx = obtenerContexto();
    if (!ctx) return;
    cargarMuestra(ctx, Math.min(Math.max(midi, MIDI_MIN), MIDI_MAX)).catch(() => {});
}

// ───────── Respaldo: síntesis de cuerda pulsada (Karplus-Strong) ─────────

function crearBufferCuerda(ctx, frecuencia, duracion = 3) {
    const sr = ctx.sampleRate;
    const periodo = Math.max(2, Math.round(sr / frecuencia));
    const total = Math.floor(sr * duracion);
    const buffer = ctx.createBuffer(1, total, sr);
    const datos = buffer.getChannelData(0);

    const anillo = new Float32Array(periodo);
    let previo = 0;
    for (let i = 0; i < periodo; i++) {
        const ruido = Math.random() * 2 - 1;
        previo = previo * 0.85 + ruido * 0.15;
        anillo[i] = previo;
    }

    const amortiguacion = 0.993;
    let idx = 0;
    for (let i = 0; i < total; i++) {
        const sig = (idx + 1) % periodo;
        datos[i] = anillo[idx];
        anillo[idx] = (anillo[idx] + anillo[sig]) * 0.5 * amortiguacion;
        idx = sig;
    }

    return { buffer, tasa: frecuencia / (sr / periodo) };
}

function reproducirSintetizado(ctx, midis, la4 = 440) {
    const maestro = crearSalida(ctx);
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 2200;
    filtro.Q.value = 0.5;
    maestro.disconnect();
    maestro.connect(filtro);
    filtro.connect(ctx.destination);

    const ahora = ctx.currentTime + 0.02;
    midis.forEach((midi, n) => {
        const { buffer, tasa } = crearBufferCuerda(ctx, midiAFrecuencia(midi, la4));
        const fuente = ctx.createBufferSource();
        fuente.buffer = buffer;
        fuente.playbackRate.value = tasa;

        const inicio = ahora + n * 0.055;
        const ganancia = ctx.createGain();
        ganancia.gain.setValueAtTime(0.0001, inicio);
        ganancia.gain.linearRampToValueAtTime(0.4, inicio + 0.012);
        ganancia.gain.exponentialRampToValueAtTime(0.0001, inicio + 2.4);

        fuente.connect(ganancia);
        ganancia.connect(maestro);
        fuente.start(inicio);
        fuente.stop(inicio + 2.8);
    });
}

/**
 * Conecta el botón de reproducir. Los trastes se leen de wrapper.dataset.strings,
 * que dibujarAcordeCanvasExpandido actualiza cada vez que se muestra un acorde.
 */
export function inicializarReproductorAcorde(botonId, wrapperId) {
    const boton = document.getElementById(botonId);
    const wrapper = document.getElementById(wrapperId);
    if (!boton || !wrapper) return;

    boton.addEventListener('click', (e) => {
        e.stopPropagation();
        reproducirAcorde(wrapper.dataset.strings);
    });
}