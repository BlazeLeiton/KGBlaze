# Project Relight · Stage 39 — CP02, homologación definitiva de chrome e integración Twitch
**Fecha:** 2026-11-18 · America/Mexico_City.
**Evidencia primaria:** tres capturas públicas del usuario (Home `image(20261118-143909).png`, Rebel Mix `image(20261118-143919).png`, Terminal `image(20261118-143926).png`), icono original suministrado (`Screenshot_20261118_075733.jpg`), PR #170 fusionada; correcciones explícitas del usuario.

## Resumen de ejecución (rama `relight/st39-crossite-language-chrome-twitch-20261118`)
1. **Home:** conserva módulos auténticos, hero grande y YouTube verificado; 58/56 px de cabecera, font 24/23 Garnett, logos nativos de cinco redes en rail 50 px y 28px de visual, 34 px de margen superior dentro del rail y separación vertical uniforme, enlace Salidas y controles ES/EN/JA según el mismo sistema exterior que Music/Terminal. Elimina diferencias menores de letras y flechas.
2. **Rebel Mix:** sólo retoque CSS de chrome: escala de marca, botones, nav, spacing y social rail. No tocar ningún dato, filtro, vista, letra, portada, versión ni autorización.
3. **Terminal:** sólo retoque CSS de chrome y puente de preferencia de idioma dentro de `VIEWER_PORTAL_SSR_JS`. **No modificar el visor original `public/index.html`**, su `setLang`, canvas 1080×1080, `?embed=1`, D1, API, cron, editor, ni selección.
4. **Idioma global:** Home deja de usar la clave aislada `kgblaze-home-lang` como autoridad y adopta la clave de Music `kgblaze.locale.v1` + cookie `kgblaze_lang` con sincronización `storage` y relectura `pageshow`. Terminal adopta la misma preferencia y ejecuta **exclusivamente el `setLang` original** para repintar canvas/visores. Los clics nativos del tablero persisten la preferencia para los otros sitios. No se crea otro controlador de tablero.
5. **Twitch:** se inserta directamente el iframe de vídeo oficial `player.twitch.tv/?channel=blazeleiton&parent=...`, `autoplay=false`, sin modal, sin reproducir automáticamente. A partir de un ancho de viewport de 480px el marco móvil tiene al menos 400px de ancho y 300px de alto. En anchuras inferiores se conserva placeholder y enlace externo, evitando infringir requisitos mínimos. El estado LIVE de /api/public **sólo cambia indicador**, no condiciona la presencia del reproductor.
6. **Audífonos:** cambio SVG manual de tres paths blancos sólidos, arco redondeado y dos almohadillas rellenas sin micrófono; invalidación de caché de recurso. **La similitud exacta con el JPG del usuario requiere verificación visual.**

## Puertas de salida
- Prueba de regresión de Terminal, Music, V25, validación HTML/JS y Chrome desktop/mobile y nuevo test de idioma + Twitch + CSS común.
- Merge sólo con CI de continuidad satisfactoria; distinguir código en GitHub del despliegue HTTP Cloudflare.
- Tras publicarse, inspeccionar Home, Rebel Mix, Terminal y función del idioma en el propio canvas. Ningún cambio adicional fuera de estas 3 envolventes.

## Fuentes Twitch
https://dev.twitch.tv/docs/embed/video-and-clips/ y https://dev.twitch.tv/docs/embed (HTTPS, parent, mínimo 400×300 para reproductor de vídeo).
