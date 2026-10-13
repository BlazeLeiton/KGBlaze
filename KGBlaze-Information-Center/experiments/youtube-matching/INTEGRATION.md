# Terminal ↔ YouTube: integración de preflight aislado (PR #2 + PR #3)

**Estado: NO DESPLEGADO.** Este es un puente experimental entre el visor y el matcher, no una sincronización automática de la agenda.

## Componentes
- `tests/public-sync-dry-run.test.mjs` — reglas reales `resolveDisplayStatus` del visor, trasladadas del PR #2.
- `matcher.mjs` y `tests/youtube-matching.test.mjs` — emparejador conservador, trasladados del PR #3.
- `read-only-source.mjs` — lectura manual del API de YouTube: `search.list` filtrada por `channelId`, `type=video`, `eventType=upcoming/live`, seguida de `videos.list` para recuperar `snippet` y `liveStreamingDetails`.
- `preflight.mjs` — concatena evidencia de proveedor y emparejamiento para generar un **informe de propuestas**, jamás un estado público.
- `tests/youtube-integration-preflight.test.mjs` — pruebas de falsos positivos, antigüedad de evidencia, paginación y límites de datos.

## Límites obligatorios
- **Ninguna importación** de estos módulos por `src/worker.mjs` o `public/index.html`. Sin nueva ruta HTTP, Cron, polling, D1, `sync_json`, OAuth ni cambios en HTML privado.
- El adaptador no se ejecuta sin una **invocación manual explícita**, una función `fetchImpl`, ID del canal propietario y API key suministrados en memoria por quien autorice la consulta. El repositorio no contiene credenciales ni canal configurado.
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
