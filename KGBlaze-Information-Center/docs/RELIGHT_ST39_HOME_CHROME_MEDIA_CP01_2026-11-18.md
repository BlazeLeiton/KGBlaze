# Project Relight — Stage 39 · CP01 — Home chrome, audífonos y medios (18-nov-2026)

**Naturaleza:** checkpoint de evidencia **antes del código**, para revisión focal autorizada por el usuario; no implica fusión automática a main ni publicación HTTP.  
**Base:** `main` tras PR #169 (commit `716eeb7b7a5c34327ed744721724f59c86c6ed58`). Rama `relight/st39-home-chrome-media-20261118`.

## Fuentes primarias y precedencia
- Cuatro imágenes originales del usuario en Stage 39: icono de audífonos (archivo `Screenshot_20261118_075733.jpg`); captura Home `image(20261118-055354).png`; Rebel Mix `image(20261118-055717).png`; Terminal `image(20261118-055727).png`.
- Capturas finales de tres sitios; CP08 aprobatorio en rama PR #164 (rama equivocada, NO fusionar), CP16 y PR169 posteriores.
- Este cambio se limita a Home; Rebel Mix/Terminal sirven de referencia, pero sus contenidos y comportamiento no se rediseñan.

## Hallazgos verificables en el código anterior
1. `public/home.html` mezcla rail de ancho 66px y contenido `margin-left:66px` con reglas posteriores a 50px. La declaración posterior del rail se aplica por otra vía, mientras la alineación de `main,footer` depende de un bloque anterior. La captura muestra una franja clara de unos 16px entre barra y hero.
2. El CSS del Home contiene cadenas **backslash + n literales**, fuera de cadenas CSS, en los estilos de homologación. Al no ser saltos de línea reales, pueden invalidar selectores/bloques.
3. El header Home carece de caret en Música/Comunidad, su `brand`, spacing y botón Salidas no siguen la misma métrica de otros dos. Home no carga `/music/assets/typography-v1.css`, que Rebel Mix sí usa para Garnett. La fuente se sirve desde el Worker mediante extracción de la fuente original, sin redistribuir archivos.
4. Los cinco PNG sociales son los oficiales de la Terminal. Deben conservarse, con zona útil/hitbox centrada sin distorsión y espacio a lo largo del rail.
5. El icono SVG actual `kgblaze-headphones-white.svg` tiene arco geométrico rectangular y copas disociadas: no coincide con la silueta suavemente curva/continua blanca del adjunto morado. El icono correcto **no tiene micrófono**, es blanco y relleno, con arco grueso y copas inclinadas integradas.
6. Encabezados multimedia usan caracteres `▶` y `▣` en vez de PNG originales de YouTube y Twitch.
7. Twitch sólo se incrusta automáticamente si el API público marca LIVE, en un iframe de 16:9 de aproximadamente 330×185 px. Es inferior al mínimo de 400×300 indicado por la documentación oficial Twitch Developer Video & Clips: https://dev.twitch.tv/docs/embed/video-and-clips/ . El parámetro `parent` debe corresponder al dominio real; autoplay debe permanecer desactivado.

## Implementación propuesta en rama
- Corregir CSS literal y margen 50px; unificar header 58px desktop, 56px móvil, tipografía Garnett, proporciones, carets preservados durante traducción ES/EN/JA y rail fijo de 50px; barra social móvil 60px.
- Regenerar **manualmente en SVG** la silueta de audífonos a partir del PNG como referencia, sin usar imagen generada, micrófono, archivos de fuente o logotipos inventados. La semejanza exacta de curvas requiere **revisión del usuario** y no se declarará identidad de píxeles sin cotejo.
- Sustituir glifos en los encabezados YT/TW por los PNG originales ya utilizados por los enlaces sociales.
- Mantener YouTube como embed en caja y su selección de directo confirmado. Twitch: botón de reproducción local abre diálogo accesible con iframe oficial (p.ej. 640×360), parent=hostname y autoplay=false; crear iframe sólo tras acción humana y destruirlo al cerrar; no crear iframe de Twitch debajo del tamaño mínimo. En móvil angosto, conservar acceso externo a Twitch.
- Preservar enlaces, video YouTube verificado, integraciones `/api/public` de sólo lectura, colores editoriales, títulos, composición, ruta 307, 115 obras, visor y D1/cron/editor.

## Pruebas de aceptación
- Comprobaciones de cadenas: sin backslash-n en CSS; Home `main/footer` margen50 desktop; encabezado 58/56; carets persisten tras traducciones; PNG logotipos del mismo origen; icono SVG válido y sin micrófono; iframe de Twitch sólo bajo clic, parent correcto, autoplay false y tamaño >=400×300; dialog foco/ESC/cierre.
- CI y pruebas de navegador desktop/móvil; visual contra las 4 capturas; inspección pública por usuario para certificar Cloudflare. No fusionar automáticamente si faltan evidencias.
