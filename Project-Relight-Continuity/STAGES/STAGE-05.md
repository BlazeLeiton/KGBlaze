# Stage 5 — Conciliación de Terminal y simulaciones de estados

**Identidad:** conversación histórica denominada «Stage 5», posterior a Stage 4, reconocida por el historial de Project Relight y por el usuario en Relight Respark del 12-oct-2026. **Estado de conversación:** ABIERTA / cierre formal no acreditado. **Zona:** America/Mexico_City. Los eventos de GitHub pueden figurar como 13-oct en UTC.

## Línea de continuidad y procedencia
- Stage 4 había quedado **ABIERTA** como conversación sin cierre formal. No se marca cerrada retroactivamente. Stage 5 retoma técnicamente la sincronización de estados que se nombró «Stage 4 — Sincronización de estados»; esa etiqueta designa el hilo de trabajo heredado, no prueba cierre de Stage 4.
- El usuario confirma que el ICS Twitch es el mismo más reciente y no ha tenido cambios. No pedir nueva exportación ni inventar eventos.
- Circuito confirmado por el usuario: HTML operativo privado v24 → Worker `kgblaze-terminal` → D1 → visor de sólo lectura. Primera publicación: revisión `1`, `10` salidas (6 IDs `tw:` del ICS + 4 `man:` manuales); 7 correspondían a 12–18 oct, 2 a 19–25 oct y 1 a 26 oct–1 nov. La fuente directa del total es la respuesta pública aportada previamente por el usuario; la API workers.dev no se pudo abrir desde el navegador de herramientas.

## Error de origen Twitch y resolución
- Defecto identificado en el snapshot de revisión 1: `origin:'tw'` generado por el editor ICS se interpretaba como `manual` en `core.mjs`. No invalida la publicación editorial pero sí la clasificación y parte de la guardia contra el ICS de ejemplo.
- Editor privado corregido en `Terminal_Operativo_v24_1.html` (v24.1), **fuera de GitHub**. El usuario validó «6 eventos · ICS actualizado» y autorizó integrar el parche.
- PR #1 fusionado mediante squash a `main`: `2ff5af0d1a2af2f19f19617de92ac5ab762bdfbb`. `normalizeEventOrigin` acepta `tw`/`twitch` y reconoce IDs heredados `tw:` mal etiquetados como manuales; `publicAgenda` corrige la representación **sin mutar D1 ni incrementar revision**. GitHub Actions: `21/21` tests, workflow `38346824463`. Cloudflare Workers Builds fue comunicado `success` para este commit.
- La lectura posterior de producción `/api/public` aún NO está comprobada por las herramientas. Verificación de navegador pendiente: `"revision":1` una vez; `"origin":"twitch"` seis veces; `"origin":"manual"` cuatro veces. Sólo consulta GET; **no republicar** para probar el parche.

## Simulaciones del visor, PR #2
- PR en borrador **#2**: https://github.com/BlazeLeiton/KGBlaze/pull/2 , rama `test/terminal-sync-dry-run`, archivo añadido exclusivamente `KGBlaze-Information-Center/tests/public-sync-dry-run.test.mjs`.
- Lee y evalúa el bloque existente `resolveDisplayStatus` del visor con fixtures en memoria, sin llamadas reales, tokens, secretos, escritura D1 o actualización editorial.
- Prueba YouTube `live`, `upcoming`, `completed` con `lifeCycleStatus:'complete'`, reprogramaciones, expiración de verificaciones, prioridad YouTube sobre Twitch, fallback sólo si corresponde, Twitch con gracia de 15 minutos, cancelaciones/descansos/escala/HIATUS manuales, plataformas autorizadas y ausencia de mutación.
- Workflow https://github.com/BlazeLeiton/KGBlaze/actions/runs/38347977143: **SUCCESS, 31/31 pruebas (21 existentes + 10 nuevas)**. El PR sigue `draft:true`, `merged:false`. El run confirma pruebas, **no** despliegue.
- `wrangler.toml` mantiene el Cron comentado y `src/worker.mjs` deja `scheduled()` como stub. No hay consultas automáticas a YouTube o Twitch.

## Punto exacto de interrupción
1. Comprobar manualmente en navegador la API pública `https://kgblaze-terminal.drago68575.workers.dev/api/public` y confirmar los conteos sin pulsar Publicar.
2. Desarrollar y probar **matcher conservador de YouTube sólo con fixtures/datos públicos, sin credenciales, sin tocar D1, sin cambiar agenda ni activar Cron**. Debe manejar títulos parecidos, colaboraciones, canales ajenos, salas duplicadas y transmisiones reprogramadas; incertidumbre implica sin match confirmado.
3. Inspeccionar resultados y decidir separadamente cuándo y cómo autorizar consultas reales. No fusionar PR #2 ni desplegar un matcher por el mero Respark.

## Restricciones vigentes y evidencia
- Software: **Terminal**; identidad pública ES «Terminales A y B», EN «Terminals A & B», JA «ターミナルA・B». Preservar tests de encabezado.
- Operativo privado y secretos no se almacenan en repositorio público.
- La publicación revisión 1 se conserva; ningún hecho en este documento autoriza modificación de producción.
- La recuperación textual íntegra de todos los mensajes de Stage 5 no está disponible: `TRUNCAMIENTO_POSIBLE`. El último tramo aportado por el usuario y el estado del GitHub son el punto de reanudación confiable.
- Fuentes: `HANDOFFS/CURRENT.md`, PR #1/#2, GitHub Actions runs citados, `src/core.mjs`, `src/worker.mjs`, `public/index.html`, `wrangler.toml`.

## YouTube Matching — Dry Run, implementación aislada (12-oct-2026 CDMX)
- **Rama experimental:** `test/terminal-youtube-match-dry-run`, **PR #3** https://github.com/BlazeLeiton/KGBlaze/pull/3, **DRAFT, sin fusionar**.
- Archivos nuevos exclusivamente en el directorio de producto, pero no importados por runtime: `experiments/youtube-matching/matcher.mjs`, `experiments/youtube-matching/README.md`, `tests/youtube-matching.test.mjs`. No se modifican Worker, visor, API, D1, Cron, editor privado ni agenda revision 1.
- Matcher puro: exige `ownedChannelId` de configuración confiable; ID de YouTube opcional explícito en editor con prioridad, verificación de propiedad de canal, naturaleza live de recurso, título distintivo y hora `America/Mexico_City`; 90 min ventana conservadora, >90 min hasta 48 h `review` por reprogramación. Episodios incompatibles, colaboraciones no declaradas, publicaciones normales, canales externos, duplicados y reclamos múltiples se descartan o señalan para revisión.
- El resultado es sólo `candidate`/`review`/`none`/`skipped`; **nunca** construye observaciones con `verified` ni `matchConfirmed`. No hay consulta HTTP ni sincronización real.
- Local 27/27; **GitHub Actions PR #3** https://github.com/BlazeLeiton/KGBlaze/actions/runs/38349473729 = SUCCESS, **48 tests, 48 pass, 0 fail** (21 previos en main + 27 nuevos). PR #2 sigue separado en borrador, 31/31 pruebas sobre su propia rama. No sumar los 10 de PR #2 al CI del PR #3: aún no fusionados.
- API de producción `/api/public` aún no accesible desde herramienta web; lectura navegador `revision=1`, `twitch=6`, `manual=4` sigue pendiente. El workflow del PR #3 no prueba estado real de Cloudflare/D1.
- Próximo paso: revisar posibles falsos negativos y garantías de matching con datos reales **únicamente cuando haya una fuente confiable y autorización separada**; no activar API ni escribir estados por la mera existencia de un candidato.

## Comprobación de origen en producción y composición manual — 12-oct-2026 CDMX
- **Confirmación explícita del usuario desde su navegador:** `/api/public` devuelve **6 eventos `origin:"twitch"` y 4 eventos `origin:"manual"`**, para la revisión 1 ya publicada. Ya no pedir comprobación de conteos de origen; es `CONFIRMADO_USUARIO_EN_NAVEGADOR`, no un GET ejecutado desde las herramientas del asistente (Workers.dev continúa inaccesible desde ellas).
- Reconstrucción contrastada con el **JSON original de revisión 1 aportado por el usuario** (`Pasted text(3).txt`, archivo privado/Biblioteca): de los cuatro IDs con prefijo `man:`, dos son `DESCANSO` (12-oct y 18-oct); otro es **Collab Padoru** (17-oct, `POR CONFIRMAR`, sin plataformas), y el cuarto es **Formula 1 Gran Premio de la Ciudad de México 2026** (1-nov, 14:00 CDMX, `A TIEMPO`, plataformas yt/tw/dc).
- El usuario esperaba que los manuales correspondieran a descansos y México GP; **Collab Padoru** es el cuarto elemento concreto y no debe ocultarse ni reclasificarse sin una instrucción expresa. `origin:"manual"` no es `status:"DESCANSO"`: origen y estado son campos independientes.
- La copia original del JSON es anterior a la corrección de origen y allí los seis `tw:` aparecen temporalmente con `origin:"manual"`. **No confundir ese defecto histórico con la respuesta posterior del Worker verificada por usuario.**
- Ninguna escritura D1, republicación, modificación de evento, cambio de PR ni despliegue fue necesaria.

## Aclaración editorial confirmada — Collab Padoru (12-oct-2026 CDMX)
- El usuario confirmó expresamente: **«Sí, esa fue confusión mía, la collab sí es un evento manual»**. Queda resuelta la duda sobre el cuarto evento de origen `manual`.
- Clasificación vigente y sin cambios: 6 eventos de origen `twitch`; 4 de origen `manual`: DESCANSO (12-oct), Collab Padoru (17-oct, `POR CONFIRMAR`), DESCANSO (18-oct), México GP (1-nov, 14:00, `A TIEMPO`).
- La aclaración **no** confirma realización, hora ni plataforma de la colaboración; conserva `POR CONFIRMAR` sin plataformas en la publicación revisión 1. No reabrir Q-12 por este motivo.
- Solo se actualizó continuidad documental; no se publicó revisión 2, ni se editó D1, visor, Worker o PR #2/#3.

## Stage 5 — integración progresiva de YouTube, PR #4 (12-oct-2026 CDMX)
- Usuario indicó **«Sigue con la integración»** tras confirmar 6 Twitch y 4 manuales (incluida Collab Padoru) y conocer la existencia de PR #2/#3. La implementación avanza en **rama aislada en borrador**, sin interpretar el mandato como autorización de deploy, polling o escritura automática.
- Rama `integration/terminal-youtube-readonly-preflight`, PR **#4** https://github.com/BlazeLeiton/KGBlaze/pull/4, `draft:true`, `merged:false`. Importa los 10 tests de simulaciones PR #2 y los 27 tests/matcher de PR #3; ambos PR previos permanecen DRAFT sin merge.
- Nuevo código `experiments/youtube-matching/read-only-source.mjs`: lector manual YouTube Data API v3 `search.list` de upcoming/live filtrado al ID de canal propio y `videos.list` para recursos completos; `preflight.mjs` combina matcher, metadata y controles de origen/timestamp/ambigüedad, devolviendo propuestas de sólo lectura.
- **Integración preparada pero OFF por defecto en PR #4:** `src/worker.mjs` implementa `POST /api/admin/youtube-preflight` tras autenticación `ADMIN_TOKEN`, `YOUTUBE_PREVIEW_ENABLED='true'`, `X-Relight-Preview-Only: ack-read-only`, y secretos privados `YOUTUBE_CHANNEL_ID`/`YOUTUBE_API_KEY`. Flag y secretos **no configurados** en `wrangler.toml`. La ruta sólo lee D1 y metadatos de YouTube; nunca escribe `sync_json`, editorial, vistas previas ni auditoría. El cuerpo de POST no se aplica.
- CI GitHub Actions **https://github.com/BlazeLeiton/KGBlaze/actions/runs/38350968478: SUCCESS, 84/84 pruebas** (21 baseline +10 PR2 +27 PR3 +20 integration +6 rutas privadas Worker). Son simulaciones/HTTP mock; **no son prueba de acceso real a YouTube ni de despliegue**.
- Diferencia API crítica: `videos.list` pública proporciona `liveStreamingDetails.actualStartTime/actualEndTime` pero no `liveBroadcasts.status.lifeCycleStatus`. Por ello ningún `candidate`, señal `live_unverified` o `ended_unverified` se eleva a `verified`, `matchConfirmed`, `EN VIVO` o `DESPEGÓ` con esta etapa.
- Protección deliberada: ante paginación incompleta, muestra envejecida (>5min), canal distinto, salas duplicadas o metadatos incoherentes, se degrada a revisión. Búsqueda upcoming/live no garantiza hallar completados; se requiere asociación estable de videoId para etapa posterior.
- Quota/safety: cada uso manual puede incurrir en **dos llamadas de costo elevado `search.list`**; el endpoint aún carece de rate limit distribuido y **no debe habilitarse en producción** sin presupuestos de cuota y autorización expresa. Ninguna consulta real ejecutada ni token insertado. Sin Cron ni modificación D1 de producción. No merge del PR #4.
- Las 4 entradas manuales permanecen: 12-oct y 18-oct DESCANSO, 17-oct Collab Padoru POR CONFIRMAR sin plataformas, 1-nov México GP A TIEMPO. No se añade ni modifica nada del calendario.
- **Próximo corte:** revisar alcance de datos reales, canal verificado y cuota, y aprobar independientemente fusión/despliegue, credenciales y lectura real. Activar sincronización (escritura) requiere fase futura separada; Stage 4 y Stage 5 continúan formalmente abiertas.

## Preparación de la primera lectura real (12-oct-2026 CDMX; aún no ejecutada)
- Se recuperaron del **historial Stage 1** tanto el `YouTube Channel ID` **`UCRd_uwPjrsf6Z3CRXwNehEQ`** de `@BlazeLeiton` como el hecho de que el usuario ya creó una clave de YouTube Data API. **No** se dispone del valor privado de esa clave en este entorno ni está probada su instalación como secreto Cloudflare.
- El intento de consultar el canal mediante el conector TubeAlfred no se ejecutó por **0 créditos**; páginas YouTube públicas rechazadas por throttling. Ningún dato externo de API YouTube se ha leído con éxito, por lo que **NO afirmar realización de primera consulta real**.
- PR #4 borrador conserva el canal canónico como comprobación fija de seguridad: cualquier `YOUTUBE_CHANNEL_ID` distinto produce `YOUTUBE_CHANNEL_MISMATCH` (503). Añade requisito obligatorio `YOUTUBE_PREVIEW_LIMITER` de Cloudflare: si no hay binding, devuelve `YOUTUBE_RATE_LIMIT_NOT_CONFIGURED` (503); limitador denegado = 429; excepción = 503; jamás llama YouTube si falla el guard. Binding NO agregado a `wrangler.toml` ni desplegado.
- API oficial de cuotas actualizada 2026: `search.list` tiene **100 consultas diarias por proyecto en cupo separado**, **1 unidad/call**; las dos búsquedas por diagnóstico consumen dos llamadas de ese cupo, no 200 unidades del cupo general. `videos.list` ~1 unidad de cupo general por llamada. Fuentes oficiales: https://developers.google.com/youtube/v3/determine_quota_cost y https://developers.google.com/youtube/v3/docs/search/list .
- Rate Limiting API Cloudflare usa límite por ubicación (ejemplo 1 llamada / 60 segundos), no impone por sí misma un presupuesto global diario; proponer **máximo operativo 5 diagnósticos manuales diarios**, no afirmar enforcement global implementado. Fuente: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/ .
- GitHub Actions https://github.com/BlazeLeiton/KGBlaze/actions/runs/38351522933 confirma **88/88 pruebas PASS** (84 anteriores + 4 tests canal confiable y fail-closed del rate limiter). Prueba mocks, NO acceso real API ni despliegue.
- **Pendientes:** configurar cuota global en Google Cloud, binding Cloudflare rate limit, clave como secreto y primer GET controlado; el asistente carece de acceso a secretos o panel Cloudflare para efectuar la consulta. `wrangler secret put` **despliega inmediatamente**; no ejecutarlo sin ventana/autoridad de producción. Mantener PR #4 DRAFT, no merge, no cron, no `sync_json` ni D1 writes. 6 twitch / 4 manuales de rev1 sin cambios.

## Cloudflare Rate Limiter guardado en Dashboard y sincronizado en PR #4 (12-oct-2026 CDMX)
- El usuario confirmó que **guardó** el binding Cloudflare Rate Limiter desde `Settings > Bindings > Add binding > Rate Limiter`, siguiendo los valores propuestos: `YOUTUBE_PREVIEW_LIMITER`, `namespace_id=1001`, `limit=1`, `period=60`. Al cerrar el panel faltaba comprobación visual independiente de la fila; esta confirmación es del usuario. No equivale a deploy.
- El usuario anteriormente confirmó en el Dashboard: `ADMIN_TOKEN` como secreto, `YOUTUBE_CHANNEL_ID` variable `UCRd_uwPjrsf6Z3CRXwNehEQ`, `YOUTUBE_API_KEY` almacenada como secreto por Save. No leer/copiar valores secretos ni afirmar que estén activos en versión desplegada.
- `wrangler.toml` fue actualizado **solamente en rama** `integration/terminal-youtube-readonly-preflight`/PR #4 con `[[ratelimits]] name="YOUTUBE_PREVIEW_LIMITER", namespace_id="1001", [ratelimits.simple] limit=1, period=60`. Los valores de la variable pública `YOUTUBE_CHANNEL_ID` ya estaban sincronizados en PR #4. No colocar `YOUTUBE_API_KEY` ni `ADMIN_TOKEN` en Wrangler.
- Pruebas CI en GitHub https://github.com/BlazeLeiton/KGBlaze/actions/runs/38356151146 **90/90 PASS, 0 failures** (88 previas +2 pruebas de configuración Wrangler); corroborado en job logs. El PR #4 sigue **DRAFT / NO MERGED / NO DEPLOYED**, flag de preflight ausente (off), Cron desactivado, D1 y revisión 1 intactos.
- **SIGUIENTE PASO INMEDIATO:** confirmar en Cloudflare Dashboard que el nuevo binding aparece en la tabla `Bindings` del Worker junto a D1, sin pulsar Deploy; posteriormente revisar requisitos de activación/despliegue independiente.

## Integración Stage 5 — catálogo narrativo, playlists y semántica de la actividad (13-oct-2026)

El usuario volvió a precisar una decisión de Stage 2 que había sido omitida en la recuperación: **el nombre de vuelo/actividad del ICS es el juego/categoría**, decidido en el primer paso de agendar Twitch, ANTES de redactar títulos de stream o preparar metadata. Cuando el directo es dual, YouTube y Twitch habitualmente comparten el **título final**, pero éste es **distinto del nombre de vuelo**, intencionalmente. No pedir que el campo de actividad de Killer Chat! refleje `💌 Encuentra el Amor o MUERE Intentándolo.....espera :v 🔪 | Killer Chat!`: `Killer Chat!: Original Edition` es el valor editorial correcto del vuelo y mejor identificador para pasajeros. Distinción documental en `../SOURCES/CHANNEL_CONTENT_TAXONOMY_2026-10-13.md`.

**Prueba de usuario completada en HTML privado v24.2.1:** insertar URL sala YouTube `JDkg-5tZ3G0` → confirmar evento Killer Chat → reimportar ICS real → reabrir edición → URL persistente. `USER_BROWSER_VALIDATED_PERSISTENCE_AFTER_REIMPORT`. No certificar aún JSON roundtrip, publicación ni sync. Issue #7.

**Auditoría de catálogo ampliada:** 500 registros con ID en CSV privado de Studio (subconjunto, no universo), líneas de series de Azur, Doki Doki, Needy Streamer Overload, HoloCure, Pokémon/covers, F1, Civilization y otros juegos; la búsqueda pública de /streams y /playlists devuelve bloqueo de YouTube. **Playlists sin nombres/URLs verificables** y solo agrupaciones exploratorias por títulos; no fabricar IDs. HoloList publica clasificación general gaming/voice acting, no lista de playlists. vidIQ conectado a ID correcto pero sin créditos disponibles hasta renovación informada el 20-oct; TubeAlfred tampoco disponible por créditos. Informe analítico numérico guardado **solo** en Biblioteca privada; el documento público `../SOURCES/CHANNEL_CONTENT_TAXONOMY_2026-10-13.md` conserva únicamente ejemplos e implicaciones sin métricas privadas.

**Estado de despliegue:** NO hubo cambios en Worker, Cloudflare, flag, D1, ni agenda pública; PR #8 en DRAFT/no merge.

