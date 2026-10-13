# Terminal ↔ YouTube: integración de preflight aislado (PR #2 + PR #3)

**Estado actual (Stage 6): preflight de sólo lectura desplegado y probado contra YouTube real; mejora de matching por categoría aislada en PR.** El texto histórico de PR #2/#3 más abajo documenta su fase previa, no el estado vigente. Sigue sin existir sincronización automática de la agenda.

## Componentes
- `tests/public-sync-dry-run.test.mjs` — reglas reales `resolveDisplayStatus` del visor, trasladadas del PR #2.
- `matcher.mjs` y `tests/youtube-matching.test.mjs` — emparejador conservador, trasladados del PR #3.
- `read-only-source.mjs` — lectura manual del API de YouTube: `search.list` filtrada por `channelId`, `type=video`, `eventType=upcoming/live`, seguida de `videos.list` para recuperar `snippet` y `liveStreamingDetails`.
- `preflight.mjs` — concatena evidencia de proveedor y emparejamiento para generar un **informe de propuestas**, jamás un estado público.
- `tests/youtube-integration-preflight.test.mjs` — pruebas de falsos positivos, antigüedad de evidencia, paginación y límites de datos.

## Límites obligatorios
- **Única integración propuesta en Worker (rama DRAFT, todavía no desplegada):** ruta administrativa `POST /api/admin/youtube-preflight`, protegida por `ADMIN_TOKEN`, `YOUTUBE_PREVIEW_ENABLED='true'`, cabecera `X-Relight-Preview-Only: ack-read-only`, y configuraciones privadas `YOUTUBE_CHANNEL_ID` / `YOUTUBE_API_KEY`. El valor por defecto del flag es desactivado porque no aparece en `wrangler.toml`. Ninguna ruta pública nueva de YouTube; **sin** Cron, polling, escritura D1, `sync_json`, OAuth o cambios en HTML privado. El visor sigue sin importar estos módulos.
- El adaptador no se ejecuta sin una **invocación POST autenticada y reconocida**, un ID del canal propietario y una API key configurados como secretos del entorno. El repositorio no contiene valores de credenciales ni canal; todas las pruebas usan respuestas ficticias. **No establecer el flag ni los secretos en producción en esta fase.** El endpoint ignora cuerpo de POST y responde con informe solamente.
- Una coincidencia `candidate` es una **hipótesis**. La salida tiene `safeToApply:false` y `directSyncWrites:0`, nunca `verified`, `matchConfirmed` ni un `status` listo para el visor.
- Un snapshot mayor de 5 minutos, canal ajeno, paginación incompleta, dos salas posibles, estado inconsistente, cambio de horario o identidad incierta se **bloquea o deriva a revisión**, no a publicación.
- **YouTube `videos.list` no incluye `liveBroadcasts.status.lifeCycleStatus`.** Los campos `actualStartTime` y `actualEndTime` no autorizan por sí solos a declarar `DESPEGÓ`. Para un canal sin sala identificada tampoco se puede inferir que Twitch terminó.
- La búsqueda cubre upcoming/live; una transmisión terminada puede desaparecer. Para mantener identidad después de terminar hará falta persistencia autorizada de videoId, resolución de ciclo de vida, y plan de reintentos.
- Quedan protegidos los eventos reales de la revisión 1: dos `DESCANSO`, `Collab Padoru` manual `POR CONFIRMAR` con plataformas vacías, y México GP manual con las plataformas yt/tw/dc. **Origen manual no equivale a descanso ni prohíbe un posible match de YouTube.**
- Cada ejecución manual realiza dos llamadas `search.list`, que tienen coste considerable de cuota, además de `videos.list`. No se llama automáticamente.

## Próximas autorizaciones distintas
1. Revisión de CI y análisis de sesgos/falsos negativos, sobre todo títulos reales y reprogramaciones.
2. El identificador de canal **ya estaba verificado en Stage 1 (30-sep-2026)**: `UCRd_uwPjrsf6Z3CRXwNehEQ` de `@BlazeLeiton`. El usuario **ya creó una API key** para YouTube Data en esa etapa, pero no la compartió ni consta instalada en Cloudflare. La ruta **rechaza configuraciones para cualquier otro channelId**.
3. Diseñar una fuente confiable que produzca **observaciones verificadas** sin permitir a clientes fabricar `verified`.
4. Aprobar por separado merge y deploy, consumo de API real, tareas programadas y escrituras `sync_json`.

Fuentes: https://developers.google.com/youtube/v3/docs/videos ; https://developers.google.com/youtube/v3/docs/search/list ; https://developers.google.com/youtube/v3/live/docs/liveBroadcasts .

Pruebas: `cd KGBlaze-Information-Center && npm test`.

## Estado del punto de integración administrativa
- La ruta `POST /api/admin/youtube-preflight` es un **preparativo**, no una autorización de explotación. Sólo se podrá llamar cuando se activen manualmente flag y secretos en el entorno **después** de aprobación.
- Sin cabecera de confirmación explícita la ruta responde `PREVIEW_ACK_REQUIRED`; sin feature flag responde `YOUTUBE_PREFLIGHT_DISABLED`; sin secretos `YOUTUBE_PREFLIGHT_NOT_CONFIGURED`. Los fallos externos se convierten en `YOUTUBE_PREFLIGHT_UNAVAILABLE`, sin divulgar URL, clave o respuesta de proveedor.
- Sólo se leen metadatos públicos de YouTube y estado editorial de D1; **no hay métodos de escritura** en ese recorrido. La consulta de la agenda por GET sigue intacta.
- **CORRECCIÓN 2026:** la documentación actual de Google establece `search.list` con **100 llamadas diarias por proyecto** en un cupo separado, con **1 unidad del cupo Search Queries por llamada** (no 100 unidades por llamada). Dos `search.list` consumen **2 llamadas** de ese cupo, más `videos.list` (1 unidad por petición en el cupo general). Revisar en Google Cloud Console los cupos reales del proyecto. El Worker exige ahora el binding `YOUTUBE_PREVIEW_LIMITER` y falla cerrado si no está configurado; el limitador Cloudflare cubre solicitudes por ubicación, no sustituye el máximo global diario de Google.
- Los tests de seguridad del endpoint viven en `tests/youtube-worker-preflight.test.mjs`.

## Corte adicional: verificación de canal, cuotas y control de acceso (12-oct-2026 CDMX)
- **ID estable, público, recuperado de Stage 1:** `UCRd_uwPjrsf6Z3CRXwNehEQ`. No se inventa ni se obtiene de un candidato coincidente. `YOUTUBE_CHANNEL_ID` del entorno debe ser idéntico o la ruta devuelve `YOUTUBE_CHANNEL_MISMATCH`.
- API key creada previamente por el usuario en Google Cloud; no se ha visto ni instalado su valor desde herramientas. **No pedir copiarla al chat ni meterla en git**. Cloudflare recomienda Variables and Secrets → Add Secret; **`wrangler secret put` despliega una versión inmediatamente**, por lo que no ejecutarlo hasta una autorización explícita de producción. Fuente: https://developers.cloudflare.com/workers/configuration/secrets/
- **Freno nuevo de Cloudflare en código DRAFT:** `env.YOUTUBE_PREVIEW_LIMITER.limit({key:'terminal-youtube-manual-preview'})` para peticiones POST autenticadas. Sin binding → `YOUTUBE_RATE_LIMIT_NOT_CONFIGURED` (503); denegado → `YOUTUBE_RATE_LIMITED` (429); fallo externo → `YOUTUBE_RATE_LIMIT_UNAVAILABLE` (503). Nunca consultar Google si falla alguno de estos controles.
- Configuración ilustrativa de Cloudflare `wrangler.toml` **NO APLICADA** (el `namespace_id` debe ser único en la cuenta y se validará antes de habilitar):
  ```toml
  [[ratelimits]]
  name = "YOUTUBE_PREVIEW_LIMITER"
  namespace_id = "<IDENTIFICADOR_NUMERICO_UNICO_DE_LA_CUENTA>"

    [ratelimits.simple]
    limit = 1
    period = 60
  ```
  La API de Rate Limiting en Workers es **por ubicación de Cloudflare**, no garantiza una sola llamada global al día ni el presupuesto de Google. Fuente: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
- **Presupuesto de arranque propuesto:** una verificación manual puntual, con un máximo operativo de **5 ejecuciones por día** de esta herramienta hasta medir consumo real. Con dos búsquedas por ejecución: 10 de las 100 llamadas diarias predeterminadas en `search.list`, más los `videos.list` que procedan. El número es una política conservadora sugerida, **no un límite distribuido implementado**. Las cotas efectivas deben verificarse y ajustarse en Google Cloud Console.
- Fuente de cuotas: https://developers.google.com/youtube/v3/determine_quota_cost . A 12-oct-2026 indica **1 unidad por `search.list` del cupo 100 búsquedas diarias**, no 100 unidades por llamada; corregir cualquier handoff anterior que use el modelo antiguo.
- **Primera consulta real no efectuada todavía**: conector TubeAlfred agotó sus créditos (0 disponibles); intento sin API key a páginas públicas de YouTube falló por throttling. No hay herramienta Cloudflare autenticada disponible para instalar la clave ya existente. **No afirmar que existe un reporte real o que se activaron permisos**.
- Sin efecto sobre D1, editor privado, Cron, revisión 1, PR #2/#3 o el visor público. PR #4 sigue en borrador, sin merge ni deploy.

## Stage 6 — Primer preflight real positivo y ensayo de match por categoría (13-oct-2026)

- **Evidencia real suministrada por el usuario desde PowerShell**: revisión 2, upcoming:1, live:0, 1 videoId descubierto, 1 videoId editorial, 1 video del canal, discoveryComplete:true. Killer Chat! produjo candidate / explicit_editorial_video_id / JDkg-5tZ3G0 / upcoming_unverified. safeToApply:false y directSyncWrites:0. Esta prueba funciona con un ID manual y no demuestra emparejamiento autónomo.
- **Brecha siguiente:** la actividad editorial Killer Chat!: Original Edition no es el título creativo en YouTube (💌 Encuentra el Amor o MUERE Intentándolo.....espera :v 🔪 | Killer Chat!).
- **Prueba aislada propuesta:** categoría de Twitch como un segmento completo delimitado del título del video, con exigencia de categoría distintiva. Eliminar sólo sufijos de edición previamente identificados, sin convertir Azur Lane: Crosswave en Azur Lane. No se hace fuzzy matching de palabras sueltas.
- **Controles vigentes:** ID editorial explícito conserva prioridad absoluta; propietario, broadcast, hora, episodios, colaboraciones, ambigüedad y paginación continúan verificados. Nueva razón de diagnóstico para un match por categoría: unique_channel_category_time; es sólo candidate, no verified, matchConfirmed ni publicación de estados.
- **Flujo simplificado:** el usuario prefiere no alternar true/false ni escribir ready en cada prueba. Conservar feature flag y mecanismos de seguridad del Worker, pero no solicitar cambios manuales repetitivos; esta rama no modifica ajustes Cloudflare.
- **Sin despliegue en esta fase:** las pruebas GitHub no suponen fusión a main, cambios de D1, polling, Cron, escrituras ni llamadas nuevas a YouTube real.
- **Diagnóstico paralelo sin tocar D1:** el preflight de la rama puede devolver autónomamente un objeto autonomousProbe dentro de la propuesta de una salida que ya tenga videoId editorial. Simula el matching con ese ID omitido **sólo en memoria**, restringe candidatos a IDs efectivamente vistos por search.list (no sólo cargados por videos.list gracias al enlace editorial), y reutiliza las mismas respuestas de YouTube sin gastar solicitudes adicionales. Si no hay origen de búsqueda verificable, página completa, evidencia reciente o propiedad del canal, no emite candidato limpio. Si aparece otra sala distinta de la fijada manualmente, marca autonomous_editorial_id_conflict como review.
- La propiedad autonomousProbe es diagnóstica y no autoriza sincronización. Para probarla con YouTube real sólo será necesario repetir la consulta de preflight **después de integrar la mejora**; jamás limpiar el videoId ya publicado ni editar la agenda.

## Stage 7 — Motor de observaciones comprobables, separado de Preview (13-oct-2026)

- **Evidencia real previa confirmada por el usuario:** revision 2, upcoming 1, live 0, un video del canal, Killer Chat! con `candidate / explicit_editorial_video_id` Y `autonomousProbe: candidate / unique_channel_category_time / JDkg-5tZ3G0`. YouTube fue consultado correctamente y el descubrimiento autónomo es real.
- **La siguiente capa está en módulo independiente, bajo tests:** `trusted-sync.mjs` convierte exclusivamente observaciones de `youtube/v3/videos.list` que coincidan con canal propio, identidad de evento, ausencia de duplicados, evidencia completa/reciente y metadatos coherentes de transmisión en `verified:true + matchConfirmed:true`, estados `upcoming` o `live`.
- **Nunca marca `completed` ni `DESPEGÓ` a partir de `videos.list`; el cierre irreversible necesita `liveBroadcasts.list` autenticado con OAuth del propietario. La caída de YouTube deja envejecer los datos y no fabrica un cierre.**
- `src/youtube-sync.mjs` contiene el futuro ejecutor periódico, **inactivo a menos que `YOUTUBE_SYNC_ENABLED=true`**. Independiente de `YOUTUBE_PREVIEW_ENABLED`. Descubre con 2 búsquedas/hora (máximo 48 consultas Search/day antes de previews), mientras las revisiones intermedias de videos ya vinculados usan sólo `videos.list`. No consulta plataformas si no hay eventos YouTube en ventana de 24h antes a 8h después.
- El ejecutor hace escritura `sync_json` con compare-and-swap por revisión editorial **y valor anterior de sync**; preserva otros proveedores, protege D1 contra carreras y escribe auditoría de plataforma sin datos secretos. Sin API HTTP pública para ejecutar escrituras.
- **Este PR no conecta ni habilita el handler `scheduled` del Worker ni modifica los triggers de Wrangler.** No hay polling real ni escrituras en producción aún. Hacer tests y revisar antes de desplegar/pasar a fase de activación. No tocar flags de Preview ni pedir repetir true/false/ready.
