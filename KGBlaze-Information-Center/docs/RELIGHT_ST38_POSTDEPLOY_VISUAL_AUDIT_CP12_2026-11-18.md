# Project Relight Stage 38 — CP12 / Auditoría tras capturas de producción
Fecha de las capturas 2026-11-18 aproximadamente 03:04–03:05 UTC (17 nov México).
**Estado: disparidad entre V6 aprobada y superficie pública. NO hacer merge automático hasta probar el Worker realmente, y confirmar desde navegador del usuario.**
**Fuentes verificables:** tres capturas enviadas en esta conversación con páginas /music/songs/, /departures/, /; contraste con código real actual de `main` y contexto de las pestañas públicas conectadas. Base inmutable V6 CP06/07/08/10 y correcciones explícitas usuario.

## Captura de Home
- Renderiza la V5 anterior: acento magenta+cian en hero, nota musical ♫ en Rebel Mix, recuadros inclinados magenta a la izquierda de títulos, elementos sociales tipográficos, footer antiguo.
- `public/home.html` en main aún contiene exactamente estos estilos/textos. Corregir a SVG audífonos **arco completo sin micrófono** referencia adjunta anterior, acento exclusivamente magenta, quitar pseudo barra izquierda de h2, cinco logos sociales originales del visor, contrastes de tarjetas. Conservar headings aprobados: «Información de viaje», «Vuela con nosotros», «Métodos de apoyo disponibles». Tipografía Garnett; conservar bimotor relleno y avión+pista aprobados; no reemplazar video/banner verdadero con maqueta.
- Header distinto de música (anchos/posiciones); quitar duplicación de logos/franja extra si los hay; iconos sociales desktop arriba y barra móvil fija.

## Captura Rebel Mix
- `/music/songs/` muestra portadas auténticas, todos filtros originales y redes bien cargadas. No hay indicación de error de datos. Pero header no homologa Home, porque `src/music-page.mjs` restringe `.header .shell` a 1180px y centra todo el conjunto; en la captura logo KGBlaze x≈357, mientras Home logo x≈30.
- Homologar header global de ancho completo sin alterar grid de contenido/catálogo. Reducir solo desproporciones de hero si tras visual browser QA se confirma; preservar catálogo.
- No atribuir la diferencia a zoom/caché sin pruebas.

## Captura Terminal
- /departures/ muestra antiguo header dentro de `.viewer-header`, antiguo kicker KGBLAZE / CENTRO DE INFORMACIÓN, Discord independiente y NO muestra `.kg-site-header`, `.kg-exterior-hero`, social rail V6 o leyenda. El navegador conectado devuelve el mismo contenido: el V6 no se aplica en la página pública.
- Código `main` ya tiene `src/viewer-portal-chrome.mjs` y su inyección en Worker; las pruebas de Chrome originales **simularon la inyección manual** en HTML, no comprobaron el HTML efectivamente transformado por el Worker y desplegado en Cloudflare. Posibles causas: despliegue aún no actualizado, HTMLRewriter no aplica en esa ruta, o guard runtime falla. **No se ha demostrado cuál.** Detectar en entorno real o con prueba Worker/Wrangler de la ruta.
- NO editar canvas interno `public/index.html`, las fichas ni sus estados. No aplicar CSS correctivo a ciegas si el nuevo JS ni se ejecuta. Excluir `?embed=1` de chrome.
- Al observar en el navegador del usuario la versión vieja, el estado de verificación pública de PR166 es **NO CONFIRMADO** (no declarar éxito visual).
## Plan de reparación
1. Ajustes de Home y alineación Music con commits estrechos.
2. Prueba de integración sobre **Worker de verdad** con `/departures/` (no sólo HTML sintético) y verificación de entrega de CSS/JS; medir boot en Chrome. Aislar problema deploy vs runtime.
3. Capturas desktop/móvil y contraste con V6. Sólo después merge y comprobación pública.
4. No fusionar PR164; no modificar catálogo, embedded, editor/admin, D1/cron.
