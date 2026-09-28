// Variable interna del módulo para rastrear la instancia activa del reproductor
let reproductorYTInstance = null;

/**
 * Inicializa o destruye e inyecta el reproductor de YouTube oficial 
 * o muestra un botón de búsqueda en caso de que no exista ID enlazado.
 * * @param {string} selectorContenedor - Selector CSS del wrapper del iframe (ej: '.wrapper-iframe')
 * @param {string} ytID - ID del video de YouTube enviado desde la base de datos
 * @param {Object} contexto - Datos adicionales de la canción { nombreA, nombreC, albumC }
 */
export function inyectarReproductor(selectorContenedor, ytID, contexto) {
    const contenedorVideo = document.querySelector(selectorContenedor);
    if (!contenedorVideo) return;

    // 1. Destruir de forma segura instancias previas activas para que no queden audios flotando
    if (reproductorYTInstance) {
        try { 
            reproductorYTInstance.destroy(); 
        } catch (e) {
            console.warn("No se pudo destruir la instancia previa de YT:", e);
        }
        reproductorYTInstance = null;
    }

    // 2. Resetear estilos del contenedor por si venían modificados del estado 'Auto' (sin ID)
    contenedorVideo.style.height = "0";
    contenedorVideo.style.paddingTop = "56.25%"; // Forzar relación de aspecto 16:9
    contenedorVideo.innerHTML = `<div id="reproductor-youtube"></div>`;

    // 3. Evaluar si la canción cuenta con un ID válido en la Base de Datos
    if (ytID && ytID.trim() !== "") {
        
        const inicializarReproductorDirecto = () => {
            reproductorYTInstance = new window.YT.Player('reproductor-youtube', {
                height: '100%',
                width: '100%',
                videoId: ytID.trim(),
                playerVars: {
                    'autoplay': 0,
                    'rel': 0,
                    'modestbranding': 1,
                    'origin': window.location.origin
                },
                events: {
                    'onReady': function(event) {
                        event.target.setVolume(5); // Volumen inicial moderado
                        
                        // Truco del dominio seguro (Esencial para servidores proxy o InfinityFree)
                        const iframeYt = document.getElementById('reproductor-youtube');
                        if (iframeYt && iframeYt.src) {
                            iframeYt.src = iframeYt.src.replace('youtube.com', 'youtube-nocookie.com');
                        }
                    }
                }
            });
        };

        // Comprobar si la API de YouTube de la ventana global ya terminó su carga diferida
        if (typeof window.YT !== 'undefined' && window.YT.loaded) {
            inicializarReproductorDirecto();
        } else {
            window.onYouTubeIframeAPIReady = inicializarReproductorDirecto;
        }

    } else {
        // --- MULTI-ENTORNO: FALLBACK CON BOTÓN DE BÚSQUEDA ---
        const nombreArtista = contexto.nombreA || '';
        const nombreCancion = contexto.nombreC || '';
        const nombreAlbum = (contexto.albumC && !contexto.albumC.includes("Otros") && !contexto.albumC.includes("Sencillo")) ? contexto.albumC : '';
        
        const terminoBusqueda = `${nombreArtista} ${nombreCancion} ${nombreAlbum}`.trim();

        // Rompemos el padding-top del contenedor para ajustar el bloque estético de alerta
        contenedorVideo.style.height = "auto";
        contenedorVideo.style.paddingTop = "0";
        contenedorVideo.innerHTML = `
            <div style="background:#1a1a1a; color:#ccc; padding:20px; font-family:sans-serif; text-align:center; border: 1px dashed #555; border-radius:8px;">
                <b style="font-size:13px; color:#aaa;">Video no enlazado</b><br>
                <p style="font-size:11px; margin: 6px 0 12px 0;">Esta canción aún no tiene un ID de YouTube configurado en la base de datos.</p>
                <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(terminoBusqueda)}" target="_blank" 
                   style="display:inline-block; background:#333; color:#fff; text-decoration:none; padding:8px 14px; font-size:12px; font-weight:bold; border-radius:4px; border: 1px solid #444;">
                    🔍 Buscar en YouTube
                </a>
            </div>
        `;
    }
}