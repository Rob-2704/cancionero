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