# Project Relight — Stage 38 · CP13 · Reparación V6 tras capturas de producción

**Fecha:** 2026-11-18 UTC (17-nov local America/Mexico_City). **Stage 38 continúa abierto.**
**Autoridad:** capturas reales del usuario de Home, Rebel Mix y Terminal del 18-nov, V6 de seis vistas aprobada, CP05–CP12, e instrucción explícita «haz que coincidan».
**Estado verificado:** la **PR #167** https://github.com/BlazeLeiton/KGBlaze/pull/167 está **fusionada** en `main`, commit squash `ebc92520c9fe1ede5f543de87c0890bc830c9050`. GitHub no es sinónimo de entrega HTTP por Cloudflare.

## Qué corrigió la PR167
- Home `public/home.html`:
  - Reemplaza el glifo ♫ por SVG de audífonos blancos con arco simétrico casi completo, **sin micrófono** (fuente: imagen adjunta por usuario, no imagen generada).
  - El acento de hero es sólo `#FA0073`, sin parte cian. Elimina las franjas magenta inclinadas antes de cada encabezado inferior.
  - Respeta títulos **Información de viaje / Vuela con nosotros / Métodos de apoyo disponibles**. Esta última redacción es deliberadamente afín a «Métodos de pago disponibles» de Aeroméxico y **no se acorta**.
  - Recupera 5 imágenes sociales originales desde el LOGOS de Terminal, no sustitutos tipográficos. Rail escritorio arriba; franja móvil abajo; elimina «Más» adicional para homologación actual.
  - Uniforma header desktop 58px y mobile 56px, logo KGBlaze, familia Garnett con fallback Arial; footer únicamente «KGBlaze · Project Relight» a la derecha, módulos YouTube/Twitch reales intactos. No inventa banner o vídeo nuevo. EN «Terminals A & B».
- Rebel Mix `src/music-page.mjs`: ensancha sólo la cabecera global, mueve Salidas a la derecha y alinea con Home/Terminal. **NO** modifica los 115 registros, artworks, filtros, letras, versiones, créditos, fichas o navegación directa `/music/songs/` previa a PR165. Pantalla intermedia de álbumes/lista sigue preservada en el renderer, fuera de la ruta pública mediante redirección 307.
- Terminal:
  - Descarta dependencia visual de iniciar todo mediante JS. Ahora el Worker inyecta `VIEWER_PORTAL_PREFIX` + clase `kg-portal-viewer` desde HTMLRewriter a la respuesta HTTP no embebida, añade panel «Información de vuelo», descripción de Sala de espera, **leyenda de estados ANTES de compartir visor** y barra social y footer en `VIEWER_PORTAL_SUFFIX`.
  - El JS `VIEWER_PORTAL_SSR_JS` se ocupa solamente del menú/idiomas y observa el kicker, sin suplantar el controlador de actividades, idiomas internos, actualizaciones o fichas. En móvil, el panel de consulta sigue sin leyenda ni iframe, redes inferiores fijas; en desktop el cuadrado se ajusta a la altura disponible, incluyendo 800/1024/1440px.
  - La ruta `?embed=1` y el antiguo workers.dev quedan excluidos de toda la envoltura nueva, no sólo de la inicialización cliente. Archivo original del tablero `public/index.html` preservado: blob SHA `d936c47763ac063597f29bec2532e6c725a65dd5` y tamaño 961471 caracteres. Sigue existente su botón `Cerrar ✕` y desplazamiento móvil original.

## Pruebas y límites
- CI **Project Relight — continuity and Terminal regression checks**, run #44231521503, commit de rama `51469638f0a79f46bef3bd08ce41d8a8de4e5339`: **388 pruebas aprobadas, 0 fallidas, 0 omitidas**.
- Chrome prueba `tests/viewer-portal-ssr-browser.test.mjs` desde HTML devuelto por `worker.fetch` y HTMLRewriter equivalente: escritorio 1440×900, 1024×768, 800×600; móvil 375×780; `?embed=1` sin chrome. No equivale a inspección del entorno Cloudflare público.
- Auditoría musical completa de la misma rama, run **#44231521515**: **COMPLETED / SUCCESS**. Las auditorías previas (`79efcee0` y `99361093`) también fueron exitosas; se conserva el catálogo original.
- Verificación postmerge en main confirmó los nuevos marcadores `headphones-mark`, `VIEWER_PORTAL_PREFIX` y `VIEWER_PORTAL_SSR_JS`, `VIEWER_PORTAL_LEGEND`, las imágenes de redes y el SHA idéntico del viewer original.
- Desde el entorno de ChatGPT el host `kgblaze.dpdns.org` falla resolución DNS / no es accesible (curl HTTP 000). **No afirmar Cloudflare desplegado**, ni afirmar que sigue viejo si no hay nueva captura. Debe cotejarse en el navegador del usuario después de la sincronización.

## Pendientes únicamente verificables por navegador de usuario
1. Home `/` — icono correcto, magenta puro, títulos sin rayas, medios verdaderos, iconografía/desktop/mobile, header/footer e idiomas.
2. `/music/songs/` — encabezado homologado, 115 fichas originales, filtros, Portadas/Lista y rutas de canciones.
3. `/departures/` — encabezado V6 visible encima del canvas (no viejo), tableros cuadrado íntegro sin scroll en ventanas normales, Sala de espera con leyenda y compartir, Discord únicamente social, idiomas ES/EN/JA, seleccionar/cerrar y scroll móvil.
4. `/departures/?embed=1` — el visor real solo, sin chrome; Dashboard y API funcionan.
Si hay desajustes, corregirlos en una nueva PR focal sin reactivar PR164 ni recrear el tablero o reescribir el catálogo.
