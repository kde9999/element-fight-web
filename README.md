# Element Fight · Web

Sitio público independiente del repositorio privado del juego. HTML, CSS y JavaScript estáticos, compatibles con GitHub Pages.

## Desarrollo local

Ejecutar `python3 server.py` y abrir http://127.0.0.1:4173. No requiere instalar paquetes. Comprobar JavaScript con `npm run check`.

## GitHub Pages

En Settings → Pages seleccionar Deploy from a branch, rama `main`, carpeta `/ (root)` y guardar. El archivo `.nojekyll` permite servir los recursos directamente.

Dominio preparado: https://elementfight.cl/

Activación pendiente de delegar el DNS en NIC Chile y verificar HTTPS en GitHub Pages.

Para cambiar de dominio ejecutar `python3 scripts/configure_public_url.py https://DOMINIO/`.

## Archivos

- `index.html`, `styles.css`, `app.js`: presentación e interacción.
- `characters.json`: catálogo del plantel.
- `assets/`: imágenes optimizadas, videos y fuentes para publicación.
- `scripts/configure_public_url.py`: configuración de canonical, sitemap y robots.

Los enlaces de descarga permanecen desactivados hasta el lanzamiento. Política de privacidad y página de soporte pendientes de incorporar.

## Derechos

El código, personajes, ilustraciones y videos de Element Fight se conservan bajo los derechos de su titular. La publicación de este repositorio no concede una licencia general de reutilización. Las fuentes Barlow y Barlow Condensed conservan sus licencias incluidas en `assets/`.

Este proyecto comienza con un historial nuevo y no contiene código Swift, originales de arte, grabaciones de trabajo ni historial del juego.

## Video de combate · 2 de noviembre de 2026

«Ver el combate» abre un montaje nativo de Jorge contra Alonso en el Santuario de la Tormenta: técnicas direccionales, combos, carga estática, marea de retorno, poderes, ultras completos y dominios. Los dominios despliegan sus escenarios propios. Duración aproximada: 61 segundos; MP4 H.264 de 960×540, 30 fps, con inicio progresivo, de unos 5,5 MB. El video no se precarga al entrar a la portada. Música: Epic Boss Battle, Juhani Junkala (SubspaceAudio), CC0. Los originales de captura y el master se conservan fuera del sitio público.
