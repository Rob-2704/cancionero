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