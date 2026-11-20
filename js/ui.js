// js/ui.js — helpers visuales compartidos por todas las páginas

import { alCambiarEstadoGuardado } from './datos.js';

// Los iconos Material Symbols están ocultos hasta que carga la fuente; entonces aparecen con "pop".
// Vuelve a llamarla después de crear iconos dinámicamente.
export function activarIconos() {
    document.fonts.ready.then(() => {
        document.querySelectorAll('.material-symbols-outlined:not(.fuente-cargada)').forEach(icono => {
            icono.classList.add('fuente-cargada');
        });
    });
}

// Indicador de sincronización (nube) junto al título
export function conectarIndicador() {
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
            activarIconos();
        } else if (estado === 'offline') {
            icono.textContent = 'offline_pin';
            indicador.title = 'Modo sin conexión (usando la copia local)';
            activarIconos();
        }
    });
}

// Número de columnas reales de la cuadrícula (para el retraso escalonado en diagonal)
export function contarColumnas(grid) {
    const columnas = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
    return Math.max(1, columnas);
}

// Entrada escalonada en diagonal. Al terminar se quita la animación para que el hover (scale) funcione.
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

// Pone la carátula cuando la imagen realmente cargó (evita parpadeos y cuadros rotos)
export function aplicarPortada(tarjeta, url) {
    const capa = tarjeta.querySelector('.tarjeta-portada');
    if (!capa) return;
    const imagen = new Image();
    imagen.onload = () => {
        capa.style.backgroundImage = `url("${url}")`;
        capa.classList.add('lista');
    };
    imagen.src = url;
}

// Pide la portada solo cuando la tarjeta está por verse (así no se lanzan cientos de búsquedas de golpe)
let observador = null;
export function portadaAlVer(tarjeta, pedirUrl) {
    const cargar = () => pedirUrl().then(url => aplicarPortada(tarjeta, url)).catch(() => {});
    if (!('IntersectionObserver' in window)) { cargar(); return; }
    if (!observador) {
        observador = new IntersectionObserver((entradas) => {
            for (const e of entradas) {
                if (!e.isIntersecting) continue;
                observador.unobserve(e.target);
                e.target._cargarPortada?.();
            }
        }, { rootMargin: '300px' });
    }
    tarjeta._cargarPortada = cargar;
    observador.observe(tarjeta);
}

// Tarjeta cuadrada con carátula: sirve para artistas, canciones y el administrador
//   { href, titulo, nombre, estado?, extra? }
export function crearTarjeta({ href, titulo, nombre, estado, extra }) {
    const tarjeta = document.createElement(href ? 'a' : 'div');
    tarjeta.className = 'tarjeta';
    if (href) tarjeta.href = href;
    if (titulo) tarjeta.title = titulo;

    const portada = document.createElement('div');
    portada.className = 'tarjeta-portada';

    const etiqueta = document.createElement('div');
    etiqueta.className = 'icono-flotante';
    etiqueta.textContent = nombre;

    tarjeta.append(portada, etiqueta);
    if (estado) {
        const punto = document.createElement('div');
        punto.className = `indicador-estado ${estado}`;
        tarjeta.appendChild(punto);
    }
    if (extra) tarjeta.appendChild(extra);
    return tarjeta;
}

// Mensaje centrado dentro de una cuadrícula/contenedor
export function mostrarMensaje(contenedor, texto, error = false) {
    contenedor.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'cargando' + (error ? ' error' : '');
    div.textContent = texto;
    contenedor.appendChild(div);
}

// Aviso flotante breve
export function mostrarToast(texto, tipo = 'ok') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = texto;
    toast.className = 'toast ' + tipo + ' visible';
    clearTimeout(mostrarToast._t);
    mostrarToast._t = setTimeout(() => toast.classList.remove('visible'), 3200);
}
