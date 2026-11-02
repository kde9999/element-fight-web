# Element Fight · Web

Sitio público independiente del repositorio privado del juego. HTML, CSS y JavaScript estáticos, compatibles con GitHub Pages.

## Desarrollo local

Ejecutar `python3 server.py` y abrir http://127.0.0.1:4173. No requiere instalar paquetes. Comprobar JavaScript con `npm run check`.

## GitHub Pages

En Settings → Pages seleccionar Deploy from a branch, rama `main`, carpeta `/ (root)` y guardar. El archivo `.nojekyll` permite servir los recursos directamente.

Dirección prevista: https://kde9999.github.io/element-fight-web/

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
