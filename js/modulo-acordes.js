// Constantes musicales para el cálculo automático (Fallback)
const FORMULAS_TEORICAS = {
    "":       [0, 4, 7], "m":      [0, 3, 7], "7":      [0, 4, 7, 10], 
    "m7":     [0, 3, 7, 10], "maj7":   [0, 4, 7, 11], "dim":    [0, 3, 6], 
    "dim7":   [0, 3, 6, 9], "aug":    [0, 4, 8], "sus4":   [0, 5, 7], 
    "sus2":   [0, 2, 7], "sus":    [0, 5, 7], "5":      [0, 7], "9":      [0, 4, 7, 10, 14], 
    "11":     [0, 4, 7, 10, 14, 17], "13":     [0, 4, 7, 10, 14, 21],
    "7sus4":  [0, 5, 7, 10], "7sus2":  [0, 2, 7, 10], "7sus": [0, 5, 7, 10],
    "9sus4":  [0, 5, 7, 10, 14], "9sus": [0, 5, 7, 10, 14]
};

// Intervalo base (en semitonos) de cada grado, usado para calcular alteraciones entre paréntesis
const GRADOS_BASE = { 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 10, 9: 14, 11: 17, 13: 21 };

// Para cada grado "alterable", qué intervalos existentes debe reemplazar una alteración
const GRADOS_A_REEMPLAZAR = {
    5:  [6, 7, 8],
    9:  [13, 14, 15],
    11: [16, 17, 18],
    13: [20, 21, 22]
};

// Aplica las alteraciones entre paréntesis (b5, #9, add9, etc.) a una fórmula base de intervalos.
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

const AFINACION_GUITARRA = [4, 9, 2, 7, 11, 4]; 
const NOMBRES_NOTAS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const EQUIVALENCIAS_BEMOLES = { "Db":"C#", "Eb":"D#", "Gb":"F#", "Ab":"G#", "Bb":"A#" };
const traductorAcordes = {
    'DO': 'C', 'RE': 'D', 'MI': 'E', 'FA': 'F', 'SOL': 'G', 'LA': 'A', 'SI': 'B'
};

export function crearRegexAcordes() {
    const nucleoAcorde = `([CDEFGAB]|DO|RE|MI|FA|SOL|LA|SI)(#|b)?((?:maj|min|m|dim|aug)?)(5|6|7|8|9|10|11|12|13)?(sus4|sus2|sus)?`;
    const bajoAcorde = `(\\/(([CDEFGAB]|DO|RE|MI|FA|SOL|LA|SI)(#|b)?))?`;

    const conAlteracion = `${nucleoAcorde}(\\((?:add)?[#b]?\\d+(?:\\s*,\\s*(?:add)?[#b]?\\d+)*\\))${bajoAcorde}(?![a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])`;
    const sinAlteracion = `${nucleoAcorde}${bajoAcorde}(?![a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]|\\s(?![xX]\\d)[a-záéíóúüñ])`;

    return new RegExp(`(?<![a-záéíóúüñ])(?:${conAlteracion}|${sinAlteracion})`, 'g');
}

export function procesarLetraYAcordes(textoOriginal) {
    if (!textoOriginal) return "";
    
    let textoProcesado = textoOriginal.replace(/-/g, '—');
    
    const regexBarras = /x\d+|(?<![a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])v(?![a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])|(?<![a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])X(?![a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])|(?<=[\d—])(?:p|h)\d+|(?<=[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])\d+(?![s][u][s])(?=[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])|\([^)]+\)|❙o|o❙|(?!\d—[A-ZÁÉÍÓÚÜÑ\s\r\n])(?!\/[A-ZÁÉÍÓÚÜÑ])(?!\d\/[A-ZÁÉÍÓÚÜÑ])(?:(?!❙o|o❙)[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ.,;:!?¡¿'"#\s])*(?:(?!❙o|o❙)[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9.,;:!?¡¿'"#\s])(?:(?!❙o|o❙)[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ.,;:!?¡¿'"#\s])*/g;
    const regexAcordes = crearRegexAcordes();

    const envolverBarras = (fragmento) => fragmento.replace(regexBarras, (barra) => `<span class="barra-compas">${barra}</span>`);

    let resultado = "";
    let ultimoIndice = 0;
    let coincidencia;

    regexAcordes.lastIndex = 0;
    while ((coincidencia = regexAcordes.exec(textoProcesado)) !== null) {
        const tramoPlano = textoProcesado.slice(ultimoIndice, coincidencia.index);
        resultado += envolverBarras(tramoPlano);

        const acorde = coincidencia[0];
        const idAcordeDiccionario = acorde.replace('/', '_');
        resultado += `<a class="acorde-link" data-acorde="${idAcordeDiccionario}">${acorde}</a>`;

        ultimoIndice = coincidencia.index + acorde.length;

        if (acorde.length === 0) regexAcordes.lastIndex++;
    }

    resultado += envolverBarras(textoProcesado.slice(ultimoIndice));

    return resultado;
}

export function inicializarModalAcordes(cajaId) {
    const caja = document.getElementById(cajaId);
    if (!caja) return;

    document.body.addEventListener('click', function(evento) {
        const link = evento.target.closest('.acorde-link');
        
        if (link) {
            evento.stopPropagation();
            evento.preventDefault();
            const nombreAcorde = link.getAttribute('data-acorde');
            abrirCajaAcorde(nombreAcorde, evento, caja);
        } else if (caja.style.display === "block" && !caja.contains(evento.target)) {
            cerrarCajaAcorde(caja);
        }
    });
}

function abrirCajaAcorde(nombreAcordeRaw, evento, caja) {
    const titulo = document.getElementById('acorde-titulo');
    const badgeorigen = document.getElementById('origen-acorde-modal');
    const wrapperRender = document.getElementById('wrapper-render');

    if (!titulo || !wrapperRender) return;

    let textoLimpio = nombreAcordeRaw.trim().replace(/[\s-\-❚❙]/g, '');        
    titulo.textContent = textoLimpio.replace('_', '/');

    let partesBajo = textoLimpio.split('_');
    let acordeEstructura = partesBajo[0];
    let notaBajoRaw = partesBajo[1] || null;
    let notaBajo = null;

    let raiz = "";
    let alteraciones = "";
    let acordeEstructuraUpper = acordeEstructura.toUpperCase();

    for (const notaLatina of Object.keys(traductorAcordes)) {
        if (acordeEstructuraUpper.startsWith(notaLatina)) {
            raiz = traductorAcordes[notaLatina]; 
            alteraciones = acordeEstructura.substring(notaLatina.length); 
            break;
        }
    }

    if (!raiz) {
        raiz = acordeEstructura.substring(0, 1).toUpperCase();
        alteraciones = acordeEstructura.substring(1);
    }

    if (alteraciones.startsWith('#') || alteraciones.startsWith('b')) {
        raiz += alteraciones.substring(0, 1);
        alteraciones = alteraciones.substring(1);
    }

    if (notaBajoRaw) {
        let notaBajoUpper = notaBajoRaw.toUpperCase();
        for (const notaLatina of Object.keys(traductorAcordes)) {
            if (notaBajoUpper.startsWith(notaLatina)) {
                let altBajo = notaBajoUpper.substring(notaLatina.length);
                notaBajo = traductorAcordes[notaLatina] + altBajo;
                break;
            }
        }
        if (!notaBajo) notaBajo = notaBajoUpper; 
    }

    let sufijoJson = alteraciones;
    if (alteraciones.toLowerCase() === "min" || alteraciones.toLowerCase() === "m") {
        sufijoJson = "m";
    } else if (alteraciones.toLowerCase() === "min7" || alteraciones.toLowerCase() === "m7") {
        sufijoJson = "m7";
    } else if (alteraciones.toLowerCase() === "maj") {
        sufijoJson = "";
    }

    const coincideParentesis = alteraciones.match(/^([^()]*)(\(.+\))?$/);
    let sufijoBase = coincideParentesis ? coincideParentesis[1] : alteraciones;
    const textoAlteracion = coincideParentesis ? coincideParentesis[2] : null;

    if (sufijoBase.toLowerCase() === "min" || sufijoBase.toLowerCase() === "m") {
        sufijoBase = "m";
    } else if (sufijoBase.toLowerCase() === "min7" || sufijoBase.toLowerCase() === "m7") {
        sufijoBase = "m7";
    } else if (sufijoBase.toLowerCase() === "maj") {
        sufijoBase = "";
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

    // --- RENDERIZADO Y PREPARACIÓN ---
    caja.style.display = "block";
    caja.style.position = "fixed"; 

    if (datosManuales) {
        if (badgeorigen) badgeorigen.textContent = "Diccionario (Manual)";
        dibujarAcordeCanvasExpandido(wrapperRender, datosManuales);
    } else {
        try {
            if (badgeorigen) badgeorigen.textContent = "Armonía Inteligente (Auto)";

            let notaRaizNormalizada = EQUIVALENCIAS_BEMOLES[raiz] || raiz;
            let semitonoRaiz = NOMBRES_NOTAS.indexOf(notaRaizNormalizada);
            if (semitonoRaiz === -1) semitonoRaiz = 0;

            let formulaBase = FORMULAS_TEORICAS[sufijoBase] || FORMULAS_TEORICAS[""];
            let formula = aplicarAlteraciones(formulaBase, textoAlteracion);
            let notasAcorde = formula.map(intervalo => (semitonoRaiz + intervalo) % 12);

            let semitonoBajo = null;
            if (notaBajo) {
                let bajoNormalizado = EQUIVALENCIAS_BEMOLES[notaBajo] || notaBajo;
                semitonoBajo = NOMBRES_NOTAS.indexOf(bajoNormalizado);
            }

            let trastesCalculados = [];
            let trasteMinimo = 24, trasteMaximo = 0;

            for (let i = 0; i < 6; i++) {
                let notaCuerdaAlAire = AFINACION_GUITARRA[i];
                let trasteOptimo = "X";

                for (let traste = 0; traste <= 12; traste++) {
                    let notaEnTraste = (notaCuerdaAlAire + traste) % 12;
                    
                    if (i === 0 && semitonoBajo !== null) {
                        if (notaEnTraste === semitonoBajo) {
                            trasteOptimo = traste;
                            break;
                        }
                    } else {
                        if (notasAcorde.includes(notaEnTraste)) {
                            trasteOptimo = traste;
                            break;
                        }
                    }
                }

                if (trasteOptimo !== "X" && trasteOptimo > 0) {
                    if (trasteOptimo < trasteMinimo) trasteMinimo = trasteOptimo;
                    if (trasteOptimo > trasteMaximo) trasteMaximo = trasteOptimo;
                }
                trastesCalculados.push(trasteOptimo);
            }

            let requiereCejilla = false;
            let trasteInicioDibujo = 1;
            if (trasteMaximo - trasteMinimo <= 3 && trasteMinimo !== 24 && trasteMinimo > 2) {
                trasteInicioDibujo = trasteMinimo;
                requiereCejilla = true;
            }

            const objetoAcordeDinamico = {
                strings: trastesCalculados.join(" "),
                cejilla: requiereCejilla,
                trasteInicio: trasteInicioDibujo,
                cuerdasCejilla: requiereCejilla ? [1, 6] : null
            };

            dibujarAcordeCanvasExpandido(wrapperRender, objetoAcordeDinamico);

        } catch (error) {
            wrapperRender.innerHTML = `<div style="font-size:11px; color:#ff3333;">Error de auto-cálculo</div>`;
        }
    }

    // --- POSICIONAMIENTO UNIVERSAL PARA MÓVILES Y COMPUTADORAS ---
    const esMovil = window.innerWidth <= 600;
    const rect = caja.getBoundingClientRect();
    const padding = 12;

    if (esMovil) {
        // En celulares: centrar horizontalmente usando el ancho ajustado y colocar cerca del toque
        let left = (window.innerWidth - rect.width) / 2;
        let top = evento.clientY ? (evento.clientY - rect.height - 15) : (window.innerHeight / 3);

        // Si se sale arriba o abajo en la pantalla del celular, centrar verticalmente
        if (top < padding || top + rect.height > window.innerHeight - padding) {
            top = Math.max(padding, (window.innerHeight - rect.height) / 2);
        }

        caja.style.left = `${Math.max(padding, left)}px`;
        caja.style.top = `${top}px`;
    } else {
        // En PC: flotante dinámico junto al cursor
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

function dibujarAcordeCanvasExpandido(wrapper, datos) {
    wrapper.innerHTML = ""; 

    const esMovil = window.innerWidth <= 600;
    const canvas = document.createElement('canvas');
    
    // Dimensiones dinámicas según el dispositivo
    const anchoCanvas = esMovil ? 110 : 140;
    const altoCanvas = esMovil ? 120 : 150;
    
    canvas.width = anchoCanvas; 
    canvas.height = altoCanvas;
    canvas.style.display = "block";
    canvas.style.margin = "0 auto";

    wrapper.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const trastesArr = datos.strings.trim().toUpperCase().split(/\s+/);
    const trasteBase = datos.trasteInicio || 1;

    // Márgenes y proporciones escaladas
    const xInicio = esMovil ? 20 : 25;
    const yInicio = esMovil ? 20 : 25;
    const anchoDiapason = esMovil ? 65 : 85;
    const altoDiapason = esMovil ? 80 : 105;
    const numCuerdas = 6, numTrastesVisibles = 4;
    
    const espacioCuerdas = anchoDiapason / (numCuerdas - 1);
    const espacioTrastes = altoDiapason / numTrastesVisibles;

    // Dibujar cejilla superior o traste de inicio
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
        ctx.fillText(`Fr. ${trasteBase}`, xInicio - 4, yInicio + (espacioTrastes / 2) + 3);
    }

    // Dibujar líneas de trastes horizontales
    ctx.lineWidth = 1; ctx.strokeStyle = "#717171";
    for (let i = 1; i <= numTrastesVisibles; i++) {
        let y = yInicio + (i * espacioTrastes);
        ctx.beginPath(); ctx.moveTo(xInicio, y); ctx.lineTo(xInicio + anchoDiapason, y); ctx.stroke();
    }

    // Dibujar cuerdas verticales
    for (let i = 0; i < numCuerdas; i++) {
        let x = xInicio + (i * espacioCuerdas);
        ctx.lineWidth = (i >= 4) ? 1.5 : 1; 
        ctx.beginPath(); ctx.moveTo(x, yInicio); ctx.lineTo(x, yInicio + altoDiapason); ctx.stroke();
    }

    // Dibujar barra de cejilla física si aplica
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

    // Dibujar posiciones de los dedos (puntos)
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