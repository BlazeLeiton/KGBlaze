# Terminal ↔ YouTube: integración de preflight aislado (PR #2 + PR #3)

**Estado: NO DESPLEGADO.** Este es un puente experimental entre el visor y el matcher, no una sincronización automática de la agenda.

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
2. Confirmar el identificador del canal YouTube por fuente oficial (no autoinferirlo de los candidatos) y elegir cómo guardar credenciales fuera de GitHub.
3. Diseñar una fuente confiable que produzca **observaciones verificadas** sin permitir a clientes fabricar `verified`.
4. Aprobar por separado merge y deploy, consumo de API real, tareas programadas y escrituras `sync_json`.

Fuentes: https://developers.google.com/youtube/v3/docs/videos ; https://developers.google.com/youtube/v3/docs/search/list ; https://developers.google.com/youtube/v3/live/docs/liveBroadcasts .

Pruebas: `cd KGBlaze-Information-Center && npm test`.

## Estado del punto de integración administrativa
- La ruta `POST /api/admin/youtube-preflight` es un **preparativo**, no una autorización de explotación. Sólo se podrá llamar cuando se activen manualmente flag y secretos en el entorno **después** de aprobación.
- Sin cabecera de confirmación explícita la ruta responde `PREVIEW_ACK_REQUIRED`; sin feature flag responde `YOUTUBE_PREFLIGHT_DISABLED`; sin secretos `YOUTUBE_PREFLIGHT_NOT_CONFIGURED`. Los fallos externos se convierten en `YOUTUBE_PREFLIGHT_UNAVAILABLE`, sin divulgar URL, clave o respuesta de proveedor.
- Sólo se leen metadatos públicos de YouTube y estado editorial de D1; **no hay métodos de escritura** en ese recorrido. La consulta de la agenda por GET sigue intacta.
- No hay limitador de cuota entre múltiples instancias de Worker: **NO habilitar** la función de Cloudflare antes de decidir un presupuesto e implementar limitación de consultas. Dos `search.list` por petición podrían consumir unas 200 unidades, aparte de `videos.list` (consultar documentación oficial actual).
- Los tests de seguridad del endpoint viven en `tests/youtube-worker-preflight.test.mjs`.
