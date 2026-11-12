# Acordes & Letras – por artista

Proyecto 1 (visor, animaciones, Firebase, modo sin conexión) + proyecto 2 (artistas → canciones con portadas).

## Puesta en marcha

1. **Firebase**: crea un proyecto nuevo, activa *Realtime Database* y *Authentication → Correo/contraseña*, y crea las cuentas de los administradores.
2. Copia la configuración web del proyecto en `js/firebase-config.js` (y revisa la lista `ADMINS_PERMITIDOS`).
3. Pega `database.rules.json` en *Realtime Database → Reglas* (lectura pública de `canciones`; escritura solo para esos correos).
4. Copia del proyecto 1: la carpeta `img/` (`icono.png`, `fondo.png`) y `js/samples/` (audio de acordes).
5. Sube todo a tu hosting (GitHub Pages sirve).
6. Entra a `subir-canciones.html`, inicia sesión y sube tus `.txt`.

## Nombre de los archivos

`--nombreC (artistaP) [albumC - artistaS].txt`

- 0 guiones = terminada · 1 = por revisar · 2 = sin terminar
- `artistaP`: artista principal (la canción se guarda en su lista)
- `artistaS` (opcional): solo cambia de quién se busca la carátula del álbum
- `[albumC]` es opcional; `[albumC {palabras}]` busca la carátula con esas palabras (como en el proyecto 2)

## Datos en Firebase

`canciones/{id}` → `idC, nombreC, artistaP, artistaS, albumC, estado, contenido` (`albumBusqueda` solo si se usa).
`estado`: `terminada` · `revisar` · `pendiente`.

## Fotos de artista (opcional)

`portadas-artistas-cache.json` (Discogs) se conserva del proyecto 2. Para artistas nuevos:
`DISCOGS_TOKEN=xxxx node generar-portadas-artistas.js`. Si un artista no tiene foto, se usa la carátula de uno de sus álbumes.

## Al actualizar archivos

Sube el número de `VERSION` en `sw.js` para que los dispositivos tomen la versión nueva.
