// js/ui.js — helpers visuales compartidos por index.html y canciones.html

// Los iconos Material Symbols están ocultos hasta que carga la fuente; entonces aparecen con "pop"
export function activarAnimacionIconos() {
    document.fonts.ready.then(() => {
        document.querySelectorAll('.material-symbols-outlined').forEach(icono => {
            icono.classList.add('fuente-cargada');
        });
    });
}

// Indicador de sincronización (nube) junto al título
export function conectarIndicador(alCambiarEstadoGuardado) {
    const indicador = document.getElementById('indicador-guardado');
    const icono = indicador ? indicador.querySelector('.icono-estado-guardado') : null;
    if (!indicador || !icono) return;

    alCambiarEstadoGuardado((estado) => {
        indicador.className = 'indicador-guardado ' + estado;
        if (estado === 'guardando') {
            icono.textContent = 'sync';
            indicador.title = 'Sincronizando canciones...';
        } else if (estado === 'completado') {
            icono.textContent = 'cloud_done';
            indicador.title = 'Todas las canciones están guardadas en este dispositivo';
            activarAnimacionIconos();
        } else if (estado === 'offline') {
            icono.textContent = 'offline_pin';
            indicador.title = 'Modo sin conexión (usando la copia local)';
            activarAnimacionIconos();
        }
    });
}

// Número de columnas reales de la cuadrícula (para el retraso escalonado en diagonal)
function contarColumnas(grid) {
    const columnas = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
    return Math.max(1, columnas);
}

// Entrada escalonada en diagonal, igual que la lista de canciones del proyecto 1.
// Al terminar se quita la animación para que el hover (scale) funcione.
export function animarEntrada(tarjeta, indice, columnas) {
    const retraso = (Math.floor(indice / columnas) + (indice % columnas)) * 0.025;
    tarjeta.style.animationDelay = `${retraso}s`;

    const terminar = () => {
        tarjeta.style.animation = 'none';
        tarjeta.style.opacity = '1';
    };
    tarjeta.addEventListener('animationend', terminar, { once: true });
    setTimeout(terminar, retraso * 1000 + 700);   // por si el navegador no dispara animationend
}

export { contarColumnas };

// Pone la carátula cuando la imagen realmente cargó (evita parpadeos y cuadros rotos)
export function aplicarPortada(tarjeta, url) {
    const capa = tarjeta.querySelector('.tarjeta-portada');
    if (!capa) return;
    const imagen = new Image();
    imagen.onload = () => {
        capa.style.backgroundImage = `url("${url}")`;
        capa.classList.add('lista');
    };
    imagen.onerror = () => { /* se queda el fondo liso de la tarjeta */ };
    imagen.src = url;
}
