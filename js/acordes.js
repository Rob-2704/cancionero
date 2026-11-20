// js/acordes.js
// Todo lo que tiene que ver con los ACORDES: diccionario, digitaciones, transposición,
// sonido de guitarra y desplazamiento automático.

// ═══════════════════════════ DICCIONARIO ═══════════════════════════
const DICCIONARIO_ACORDES = {
    // ==========================================
    // 1. ACORDES NATURALES (VERSIONES CAGED / VARIACIONES)
    // ==========================================
    // DO (C) - 5 Versiones
    "C":      { strings: "X 3 2 0 1 0", cejilla: false, trasteInicio: 1 }, // Posición Abierta (C)
    "C_v2":   { strings: "X 3 5 5 5 3", cejilla: true,  trasteInicio: 3, cuerdasCejilla: [2, 6] }, // Posición Tipo A
    "C_v3":   { strings: "8 10 10 9 8 8", cejilla: true, trasteInicio: 8, cuerdasCejilla: [1, 6] }, // Posición Tipo E
    "C_v4":   { strings: "X X 10 9 8 8", cejilla: false, trasteInicio: 8 }, // Versión Tríada Aguda
    "C_v5":   { strings: "X 15 14 12 13 12", cejilla: false, trasteInicio: 12 }, // Versión Octava Alta (Tipo G)

    // RE (D) - 5 Versiones
    "D":      { strings: "X X 0 2 3 2", cejilla: false, trasteInicio: 1 }, // Posición Abierta (D)
    "D_v2":   { strings: "X 5 7 7 7 5", cejilla: true,  trasteInicio: 5, cuerdasCejilla: [2, 6] }, // Posición Tipo A
    "D_v3":   { strings: "10 12 12 11 10 10", cejilla: true, trasteInicio: 10, cuerdasCejilla: [1, 6] }, // Posición Tipo E
    "D_v4":   { strings: "X X 4 2 3 2", cejilla: false, trasteInicio: 2 }, // Inversión con bajo en F#
    "D_v5":   { strings: "X X 12 11 10 10", cejilla: false, trasteInicio: 10 },

    // MI (E) - 5 Versiones
    "E":      { strings: "0 2 2 1 0 0", cejilla: false, trasteInicio: 1 },
    "E_v2":   { strings: "X 7 9 9 9 7", cejilla: true,  trasteInicio: 7, cuerdasCejilla: [2, 6] },
    "E_v3":   { strings: "12 14 14 13 12 12", cejilla: true, trasteInicio: 12, cuerdasCejilla: [1, 6] },
    "E_v4":   { strings: "X X 2 1 0 0", cejilla: false, trasteInicio: 1 },
    "E_v5":   { strings: "X X 6 4 5 4", cejilla: true,  trasteInicio: 4, cuerdasCejilla: [3, 6] },

    // FA (F)
    "F":      { strings: "1 3 3 2 1 1", cejilla: true,  trasteInicio: 1, cuerdasCejilla: [1, 6] },
    "F_v2":   { strings: "X 8 10 10 10 8", cejilla: true, trasteInicio: 8, cuerdasCejilla: [2, 6] },
    
    // SOL (G)
    "G":      { strings: "3 2 0 0 0 3", cejilla: false, trasteInicio: 1 },
    "G_v2":   { strings: "3 5 5 4 3 3", cejilla: true,  trasteInicio: 3, cuerdasCejilla: [1, 6] },
    "G_v3":   { strings: "X 10 12 12 12 10", cejilla: true, trasteInicio: 10, cuerdasCejilla: [2, 6] },

    // LA (A)
    "A":      { strings: "X 0 2 2 2 0", cejilla: false, trasteInicio: 1 },
    "A_v2":   { strings: "5 7 7 6 5 5", cejilla: true,  trasteInicio: 5, cuerdasCejilla: [1, 6] },

    // SI (B)
    "B":      { strings: "X 2 4 4 4 2", cejilla: true,  trasteInicio: 2, cuerdasCejilla: [2, 6] },
    "B_v2":   { strings: "7 9 9 8 7 7", cejilla: true,  trasteInicio: 7, cuerdasCejilla: [1, 6] },


    // ==========================================
    // 2. CUALIDADES MÁSTER (maj7, m, dim, aug, sus)
    // ==========================================
    // Menores (m)
    "Cm":     { strings: "X 3 5 5 4 3", cejilla: true,  trasteInicio: 3, cuerdasCejilla: [2, 6] },
    "Dm":     { strings: "X X 0 2 3 1", cejilla: false, trasteInicio: 1 },
    "Em":     { strings: "0 2 2 0 0 0", cejilla: false, trasteInicio: 1 },
    "Fm":     { strings: "1 3 3 1 1 1", cejilla: true,  trasteInicio: 1, cuerdasCejilla: [1, 6] },
    "Gm":     { strings: "3 5 5 3 3 3", cejilla: true,  trasteInicio: 3, cuerdasCejilla: [1, 6] },
    "Am":     { strings: "X 0 2 2 1 0", cejilla: false, trasteInicio: 1 },
    "Bm":     { strings: "X 2 4 4 3 2", cejilla: true,  trasteInicio: 2, cuerdasCejilla: [2, 6] },

    // Séptimas Mayores (maj7)
    "Cmaj7":  { strings: "X 3 2 0 0 0", cejilla: false, trasteInicio: 1 },
    "Dmaj7":  { strings: "X X 0 2 2 2", cejilla: false, trasteInicio: 1 },
    "Emaj7":  { strings: "0 2 1 1 0 0", cejilla: false, trasteInicio: 1 },
    "Fmaj7":  { strings: "1 X 2 2 1 X", cejilla: false, trasteInicio: 1 },
    "Gmaj7":  { strings: "3 X 4 4 3 X", cejilla: false, trasteInicio: 3 },
    "Amaj7":  { strings: "X 0 2 1 2 0", cejilla: false, trasteInicio: 1 },
    "Bmaj7":  { strings: "X 2 4 3 4 2", cejilla: true,  trasteInicio: 2, cuerdasCejilla: [2, 6] },

    // Disminuidos (dim / dim7)
    "Cdim":   { strings: "X X 1 2 1 2", cejilla: false, trasteInicio: 1 },
    "Ddim":   { strings: "X X 0 1 0 1", cejilla: false, trasteInicio: 1 },
    "Edim":   { strings: "X X 2 3 2 3", cejilla: false, trasteInicio: 2 },
    "Fdim":   { strings: "X X 3 4 3 4", cejilla: false, trasteInicio: 3 },
    "Gdim":   { strings: "X X 2 3 2 3", cejilla: false, trasteInicio: 2 },
    "Adim":   { strings: "X X 1 2 1 2", cejilla: false, trasteInicio: 1 },
    "Bdim":   { strings: "X 2 3 1 3 X", cejilla: false, trasteInicio: 1 },

    // Aumentados (aug / +5)
    "Caug":   { strings: "X 3 2 1 1 X", cejilla: false, trasteInicio: 1 },
    "Daug":   { strings: "X X 0 3 3 2", cejilla: false, trasteInicio: 1 },
    "Eaug":   { strings: "0 3 2 1 1 0", cejilla: false, trasteInicio: 1 },
    "Gaug":   { strings: "3 2 1 0 0 3", cejilla: false, trasteInicio: 1 },
    "Aaug":   { strings: "X 0 3 2 2 1", cejilla: false, trasteInicio: 1 },

    // Suspendidos (sus4 / sus2)
    "Csus4":  { strings: "X 3 3 0 1 1", cejilla: false, trasteInicio: 1 },
    "Dsus4":  { strings: "X X 0 2 3 3", cejilla: false, trasteInicio: 1 },
    "Esus4":  { strings: "0 2 2 2 0 0", cejilla: false, trasteInicio: 1 },
    "Fsus4":  { strings: "1 3 3 3 1 1", cejilla: true,  trasteInicio: 1, cuerdasCejilla: [1, 6] },
    "Gsus4":  { strings: "3 3 0 0 3 3", cejilla: false, trasteInicio: 1 },
    "Asus4":  { strings: "X 0 2 2 3 0", cejilla: false, trasteInicio: 1 },
    "Bsus4":  { strings: "X 2 4 4 5 2", cejilla: true,  trasteInicio: 2, cuerdasCejilla: [2, 6] },


    // ==========================================
    // 3. EXTENSIONES AVANZADAS (5ta, 7ma, 11va, 13va)
    // ==========================================
    // Acordes de Quinta (Power Chords / 5)
    "C5":     { strings: "X 3 5 5 X X", cejilla: false, trasteInicio: 3 },
    "D5":     { strings: "X 5 7 7 X X", cejilla: false, trasteInicio: 5 },
    "E5":     { strings: "0 2 2 X X X", cejilla: false, trasteInicio: 1 },
    "F5":     { strings: "1 3 3 X X X", cejilla: false, trasteInicio: 1 },
    "G5":     { strings: "3 5 5 X X X", cejilla: false, trasteInicio: 3 },
    "A5":     { strings: "X 0 2 2 X X", cejilla: false, trasteInicio: 1 },
    "B5":     { strings: "X 2 4 4 X X", cejilla: false, trasteInicio: 2 },

    // Séptimas Dominantes (7)
    "C7":     { strings: "X 3 2 3 1 0", cejilla: false, trasteInicio: 1 },
    "D7":     { strings: "X X 0 2 1 2", cejilla: false, trasteInicio: 1 },
    "E7":     { strings: "0 2 0 1 0 0", cejilla: false, trasteInicio: 1 },
    "F7":     { strings: "1 3 1 2 1 1", cejilla: true,  trasteInicio: 1, cuerdasCejilla: [1, 6] },
    "G7":     { strings: "3 2 0 0 0 1", cejilla: false, trasteInicio: 1 },
    "A7":     { strings: "X 0 2 0 2 0", cejilla: false, trasteInicio: 1 },
    "B7":     { strings: "X 2 1 2 0 2", cejilla: false, trasteInicio: 1 },

    // Menores Séptima (m7)
    "Cm7":    { strings: "X 3 5 3 4 3", cejilla: true,  trasteInicio: 3, cuerdasCejilla: [2, 6] },
    "Dm7":    { strings: "X X 0 2 1 1", cejilla: false, trasteInicio: 1 },
    "Em7":    { strings: "0 2 0 0 0 0", cejilla: false, trasteInicio: 1 },
    "Fm7":    { strings: "1 3 1 1 1 1", cejilla: true,  trasteInicio: 1, cuerdasCejilla: [1, 6] },
    "Gm7":    { strings: "3 5 3 3 3 3", cejilla: true,  trasteInicio: 3, cuerdasCejilla: [1, 6] },
    "Am7":    { strings: "X 0 2 0 1 0", cejilla: false, trasteInicio: 1 },
    "Bm7":    { strings: "X 2 4 2 3 2", cejilla: true,  trasteInicio: 2, cuerdasCejilla: [2, 6] },

    // Onceavas (11 / Jazz & Funk)
    "C11":    { strings: "X 3 3 3 3 3", cejilla: true,  trasteInicio: 3, cuerdasCejilla: [2, 6] },
    "D11":    { strings: "X 5 5 5 5 5", cejilla: true,  trasteInicio: 5, cuerdasCejilla: [2, 6] },
    "E11":    { strings: "0 2 2 2 3 2", cejilla: false, trasteInicio: 1 },
    "A11":    { strings: "X 0 0 0 0 0", cejilla: false, trasteInicio: 1 },

    // Treceavas (13 / Dominantes Extendidos)
    "C13":    { strings: "8 X 8 9 10 X", cejilla: false, trasteInicio: 8 },
    "G13":    { strings: "3 X 3 4 5 X", cejilla: false, trasteInicio: 3 },
    "A13":    { strings: "5 X 5 6 7 X", cejilla: false, trasteInicio: 5 },


    // ==========================================
    // 4. ACCIDENTALES (SOSTENIDOS # Y BEMOLES b)
    // ==========================================
    // Sostenidos Mayores y sus Variantes
    // --- DO SOSTENIDO (C#) ---
    "C#":        { strings: "X 4 6 6 6 4", cejilla: true,  trasteInicio: 4, cuerdasCejilla: [2, 6] },
    "C#m":       { strings: "X 4 6 6 5 4", cejilla: true,  trasteInicio: 4, cuerdasCejilla: [2, 6] },
    "C#7":       { strings: "X 4 6 4 6 4", cejilla: true,  trasteInicio: 4, cuerdasCejilla: [2, 6] },
    "C#maj7":    { strings: "X 4 6 5 6 4", cejilla: true,  trasteInicio: 4, cuerdasCejilla: [2, 6] },
    "C#m7":      { strings: "X 4 6 4 5 4", cejilla: true,  trasteInicio: 4, cuerdasCejilla: [2, 6] },
    "C#sus4":    { strings: "X 4 6 6 7 4", cejilla: true,  trasteInicio: 4, cuerdasCejilla: [2, 6] },

    // --- RE SOSTENIDO (D#) ---
    "D#":        { strings: "X 6 8 8 8 6", cejilla: true,  trasteInicio: 6, cuerdasCejilla: [2, 6] },
    "D#m":       { strings: "X 6 8 8 7 6", cejilla: true,  trasteInicio: 6, cuerdasCejilla: [2, 6] },
    "D#7":       { strings: "X 6 8 6 8 6", cejilla: true,  trasteInicio: 6, cuerdasCejilla: [2, 6] },
    "D#maj7":    { strings: "X 6 8 7 8 6", cejilla: true,  trasteInicio: 6, cuerdasCejilla: [2, 6] },
    "D#m7":      { strings: "X 6 8 6 7 6", cejilla: true,  trasteInicio: 6, cuerdasCejilla: [2, 6] },
    "D#sus4":    { strings: "X 6 8 8 9 6", cejilla: true,  trasteInicio: 6, cuerdasCejilla: [2, 6] },

    // --- FA SOSTENIDO (F#) ---
    "F#":        { strings: "2 4 4 3 2 2", cejilla: true,  trasteInicio: 2, cuerdasCejilla: [1, 6] },
    "F#m":       { strings: "2 4 4 2 2 2", cejilla: true,  trasteInicio: 2, cuerdasCejilla: [1, 6] },
    "F#7":       { strings: "2 4 2 3 2 2", cejilla: true,  trasteInicio: 2, cuerdasCejilla: [1, 6] },
    "F#maj7":    { strings: "2 4 3 3 2 2", cejilla: true,  trasteInicio: 2, cuerdasCejilla: [1, 6] },
    "F#m7":      { strings: "2 4 2 2 2 2", cejilla: true,  trasteInicio: 2, cuerdasCejilla: [1, 6] },
    "F#sus4":    { strings: "2 4 4 4 2 2", cejilla: true,  trasteInicio: 2, cuerdasCejilla: [1, 6] },

    // --- SOL SOSTENIDO (G#) ---
    "G#":        { strings: "4 6 6 5 4 4", cejilla: true,  trasteInicio: 4, cuerdasCejilla: [1, 6] },
    "G#m":       { strings: "4 6 6 4 4 4", cejilla: true,  trasteInicio: 4, cuerdasCejilla: [1, 6] },
    "G#7":       { strings: "4 6 4 5 4 4", cejilla: true,  trasteInicio: 4, cuerdasCejilla: [1, 6] },
    "G#maj7":    { strings: "4 X 5 5 4 X", cejilla: false, trasteInicio: 4 },
    "G#m7":      { strings: "4 6 4 4 4 4", cejilla: true,  trasteInicio: 4, cuerdasCejilla: [1, 6] },
    "G#sus4":    { strings: "4 6 6 6 4 4", cejilla: true,  trasteInicio: 4, cuerdasCejilla: [1, 6] },

    // --- LA SOSTENIDO (A#) ---
    "A#":        { strings: "X 1 3 3 3 1", cejilla: true,  trasteInicio: 1, cuerdasCejilla: [2, 6] },
    "A#m":       { strings: "X 1 3 3 2 1", cejilla: true,  trasteInicio: 1, cuerdasCejilla: [2, 6] },
    "A#7":       { strings: "X 1 3 1 3 1", cejilla: true,  trasteInicio: 1, cuerdasCejilla: [2, 6] },
    "A#maj7":    { strings: "X 1 3 2 3 1", cejilla: true,  trasteInicio: 1, cuerdasCejilla: [2, 6] },
    "A#m7":      { strings: "X 1 3 1 2 1", cejilla: true,  trasteInicio: 1, cuerdasCejilla: [2, 6] },
    "A#sus4":    { strings: "X 1 3 3 4 1", cejilla: true,  trasteInicio: 1, cuerdasCejilla: [2, 6] },

    // Bemoles Mayores y sus Variantes (Equivalentes a los Sostenidos)
    "Bb":        { strings: "X 1 3 3 3 1", cejilla: true,  trasteInicio: 1, cuerdasCejilla: [2, 6] },
    "Bbm":       { strings: "X 1 3 3 2 1", cejilla: true,  trasteInicio: 1, cuerdasCejilla: [2, 6] },
    "Bb7":       { strings: "X 1 3 1 3 1", cejilla: true,  trasteInicio: 1, cuerdasCejilla: [2, 6] },
    "Eb":        { strings: "X 6 8 8 8 6", cejilla: true,  trasteInicio: 6, cuerdasCejilla: [2, 6] },
    "Ebm":       { strings: "X 6 8 8 7 6", cejilla: true,  trasteInicio: 6, cuerdasCejilla: [2, 6] },
    "Ab":        { strings: "4 6 6 5 4 4", cejilla: true,  trasteInicio: 4, cuerdasCejilla: [1, 6] },
    "Db":        { strings: "X 4 6 6 6 4", cejilla: true,  trasteInicio: 4, cuerdasCejilla: [2, 6] },


    // ==========================================
    // 5. SLASH CHORDS / INVERSIONES (TIPO DO/FA, DO/SOL)
    // ==========================================
    // El formato del código mapeará las barras diagonales convirtiendo "C/F" en "C_F"
    "C_F":    { strings: "1 3 2 0 1 0", cejilla: false, trasteInicio: 1 }, // Do con bajo en Fa
    "C_G":    { strings: "3 3 2 0 1 0", cejilla: false, trasteInicio: 1 }, // Do con bajo en Sol
    "D_F#":   { strings: "2 0 0 2 3 2", cejilla: false, trasteInicio: 1 }, // Re con bajo en Fa#
    "D_A":    { strings: "X 0 0 2 3 2", cejilla: false, trasteInicio: 1 }, // Re con bajo en La
    "E_G#":   { strings: "4 2 2 1 0 0", cejilla: false, trasteInicio: 1 }, // Mi con bajo en Sol#
    "G_B":    { strings: "0 2 0 0 0 3", cejilla: false, trasteInicio: 1 }, // Sol con bajo en Si
    "Am_G":   { strings: "3 0 2 2 1 0", cejilla: false, trasteInicio: 1 }, // Lam con bajo en Sol
};

// ═══════════════════════════ ACORDES ═══════════════════════════
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

    const diccionario = DICCIONARIO_ACORDES;
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
    // offsetWidth/Height: no les afecta la animación de entrada (transform: scale)
    const rect = { width: caja.offsetWidth, height: caja.offsetHeight };
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

// ═══════════════════════════ TRANSPONER ═══════════════════════════
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

// ═══════════════════════════ AUDIO ═══════════════════════════
// Afinación estándar (cuerda 6 → 1): E2 A2 D3 G3 B3 E4, en números MIDI
const MIDI_CUERDAS_AIRE = [40, 45, 50, 55, 59, 64];

// Rango de notas grabadas disponibles: E2 (40) … D5 (74)
const MIDI_MIN = 40;
const MIDI_MAX = 74;
const NOMBRES_ARCHIVO = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];

// Carpeta de muestras: samples/guitar/ (junto a index.html, un nivel arriba de js/)
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

// ═══════════════════════════ AUTOSCROLL ═══════════════════════════
let intervaloScroll = null;
let estaScrolleando = false;

export function inicializarAutoscroll(btnPlayId, sliderId) {
    const btnPlayScroll = document.getElementById(btnPlayId);
    const sliderVelocidad = document.getElementById(sliderId);

    if(!btnPlayScroll || !sliderVelocidad) return;

    btnPlayScroll.addEventListener('click', () => {
        if (estaScrolleando) {
            detenerAutoscroll(btnPlayScroll);
        } else {
            iniciarAutoscroll(btnPlayScroll, sliderVelocidad);
        }
    });

    sliderVelocidad.addEventListener('input', () => {
        if (estaScrolleando) {
            iniciarAutoscroll(btnPlayScroll, sliderVelocidad); 
        }
    });
}

export function iniciarAutoscroll(btnPlay, slider) {
    if (intervaloScroll) clearTimeout(intervaloScroll);
    estaScrolleando = true;
    btnPlay.textContent = "pause";
    btnPlay.classList.add('activo');

    function realizarScroll() {
        if (!estaScrolleando) return;

        const velocidadSlider = parseInt(slider.value);
        const delay = 200 - (velocidadSlider * 10); 

        window.scrollBy(0, 1);

        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight) {
            detenerAutoscroll(btnPlay);
            return;
        }

        intervaloScroll = setTimeout(realizarScroll, delay);
    }

    realizarScroll();
}

export function detenerAutoscroll(btnPlay) {
    estaScrolleando = false;
    if (intervaloScroll) clearTimeout(intervaloScroll);
    if(btnPlay) {
        btnPlay.textContent = "play_arrow";
        btnPlay.classList.remove('activo');
    }
}

