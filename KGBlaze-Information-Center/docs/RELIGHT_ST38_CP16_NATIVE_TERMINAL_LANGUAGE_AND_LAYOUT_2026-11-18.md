# Project Relight — Stage 38 · CP16
Fecha de edición: 2026-11-18 UTC / 17 nov 2026 local MX; Stage 38 **permanece abierto**.
Autoridad: capturas públicas posteriores a PR168 enviadas por usuario: Home/Rebel Mix/Terminal, y correcciones explícitas: audífonos todavía no correctos ni rellenos; idioma de Terminal seguía inoperante con riesgo para el canvas exportable; mover botones sociales abajo y homologar encabezados/barras de los 3 sitios.

## Fusión y prueba
- **PR #169** https://github.com/BlazeLeiton/KGBlaze/pull/169, **merged** squash commit `716eeb7b7a5c34327ed744721724f59c86c6ed58`.
- CI de continuidad/Terminal **run 44243454267: COMPLETED SUCCESS, 395/395 pruebas, 0 fallos/omisiones**. Incluye Chrome en escritorio y móvil, embed sin chrome externo y variante **sin ejecución del JavaScript exterior** que verifica idioma ES→EN→JA→ES desde botones superiores y `#heading`/`#sideTitle` re-renderizados por controlador original. Prueba también visibilidad de traducción externa en hero y leyenda por html[lang].
- Auditoría musical de esa revisión **run 44243454265** seguía en progreso en la última consulta; cambios en `src/music-page.mjs` se limitaron a geometría del header y barra lateral, sin cambios en canciones, metadatos, letras, filtros, portadas o JavaScript de navegación.

## Raíz del defecto de idiomas y cambio robusto
- Captura revelaba header del portal con ES EN JP inertes. El HTML de `VIEWER_PORTAL_PREFIX` anterior creaba `button[data-site-lang]`, mientras el visor real `public/index.html` conecta exclusivamente `document.querySelectorAll('[data-lang]')` a `setLang(btn.dataset.lang)` dentro de `bind()`, y `setLang` llama `render()` para repintar canvas exportable e información. El traslado extra mediante `VIEWER_PORTAL_SSR_JS` no se había ejecutado en navegador público, aunque la simulación de test sí.
- Ahora `VIEWER_PORTAL_PREFIX` **trae directamente** `button[data-lang=es/en/ja]` desde la respuesta del Worker. Esos controles se conectan automáticamente al **bind original**, incluso aunque el inicializador externo no llegue a ejecutarse; no es proxy ni simulación del idioma. Si se ejecuta la capa exterior, aún puede mover los botones originales preservando eventos.
- Los textos del **hero/nav/leyenda/compartir** de la envolvente V6 contienen variantes ES/EN/JA y CSS sigue el atributo `html[lang]` que el render del visor original actualiza. Esta traducción no depende de la ejecución de otro JS. El kicker de Sala de espera sigue como **Información de vuelo / Flight Information / 配信情報**.
- No se alteró el motor del tablero, `public/index.html` SHA `d936c47763ac063597f29bec2532e6c725a65dd5`, sus controles internos de idioma, original `?embed=1`, `showSelectedFlight`, selección/scroll de ficha ni cierre.

## Audífonos y geometría homologada
- `public/assets/icons/kgblaze-headphones-white.svg` redibujado en código como silueta SVG **completamente blanca rellena (3 paths)**: arco de diadema casi completo, dos auriculares sólidos, sin micrófono. Visual previo SVG inspeccionado, y test de presencia/referencia real.
- Desktop **los 3**: header `58px`; logo+nav global con padding horizontal `24px`; rail lateral `50px`, parte superior a `58px`, iconos sociales comenzando a `34px` dentro del rail (18px más abajo), gap 14px; redes siguen sin nombres y con fondo `#010627`. Música corrige header desplazado: `.header{width:calc(100% + 50px);margin-left:-50px}`, sin desplazar su contenido central.
- Móvil: header `56px`, barra social inferior `60px`, se conservan iconos y menú originales. Home vídeo YouTube/Twitch, fondos, títulos y tiles; Rebel Mix contenido, catálogo y filtros; Terminal canvas 1080², estado, selector/semana, iframe escritorio y embed.
- Nota para QA: GitHub y CI comprueban el código, pero **no certifican despliegue efectivo por Cloudflare**. Es necesaria nueva captura/uso desde navegador del usuario, especialmente comprobar el repintado del tablero a inglés y japonés en `/departures/`.

## Continuidad
- No reabrir PR164 descartada ni transferir franja magenta de Home a Rebel Mix/Terminal. No generar imágenes AI; activos SVG reales; seguir reglas ReSpark con recuperación de fuente, comparación con 6 vistas V6, y evidencia pública contra código.
