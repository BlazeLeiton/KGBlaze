# Stage 5 — Primera consulta real a YouTube y diagnóstico de falsos negativos

## Estado comprobado en conversación (13-oct-2026, CDMX)

- Usuario autorizó fusionar PR #4. PR #4 fue fusionado a `main`, commit `e3835e057f76aba60bc6aefab46c638a3ba34743`; los checks GitHub y Workers Builds terminaron exitosamente. La versión de Cloudflare que reportó el check fue `5196db07-76bd-48c0-be6f-cf8f47041a64`. El usuario confirmó Production Ready y salud `/api/health`: `ok:true, database:true`.
- Usuario aportó respuesta real de `/api/public`: revisión 1, 10 eventos (6 Twitch, 4 manuales), `sync` vacío. Los eventos aptos por plataforma YouTube son cinco: Killer Chat!: Original Edition (13-oct 22:00), Azur Lane (14-oct 22:00, por confirmar), Galaxies Showcase (15-oct 13:00), Azur Lane (16-oct 22:00), y Gran Premio de la Ciudad de México 2026 (01-nov 14:00). Ninguno tiene `videoId` editorial explícito. Los otros cinco se excluyen por plataforma/descanso.
- Usuario habilitó temporalmente `YOUTUBE_PREVIEW_ENABLED=true`, verificó Production Ready y ejecutó un solo POST autenticado manual a `/api/admin/youtube-preflight` con cabecera `X-Relight-Preview-Only:ack-read-only`.
- **Respuesta real** `schema:relight-youtube-preflight-v1`, `revision:1`, `safeToApply:false`, `directSyncWrites:0`; **5 `none/no_safe_match` con `evidenceSignal:blocked` y 5 `skipped/not_youtube_departure` con `not_applicable`**. No candidate, ni review, ni escrituras.
- Esta salida **NO prueba que YouTube carezca de transmisiones**: tampoco prueba que el matcher haya fallado. La respuesta original oculta las cuentas de `search.list` y `videos.list`, de modo que `no_safe_match` incluye escenarios distintos: búsqueda sin salas upcoming/live; sala hallada sin horario, título distinto, horario lejano o canal inadecuado. No atribuir causas individuales sin evidencia.
- Usuario confirmó que volvió a cambiar `YOUTUBE_PREVIEW_ENABLED=false` y Cloudflare reportó Ready. **Estado operativo solicitado: diagnóstico desactivado; no efectuar más llamadas YouTube sin autorización nueva.**
- En la prueba PowerShell el `finally` se ejecutó en un envío distinto del `try/catch` y falló como comando; consulta sí concluyó. Se dieron instrucciones aparte para `ZeroFreeBSTR` y `Remove-Variable`. No pedir ni registrar `ADMIN_TOKEN`.

## Propuesta de PR experimental — solo reporte

- Sumar contadores agregados en `read-only-source.mjs`: `searchResults.upcoming`, `searchResults.live`, `uniqueDiscoveredVideoIds`, `explicitEditorialVideoIds`. No guardar cuerpos de API, URLs ni credenciales, ni invocar llamadas adicionales.
- Sumar `evidenceSummary` al reporte administrativo de `preflight.mjs` con esos contadores, total de `videoResources`, `ownedBroadcastResources` y `discoveryComplete`. Distinguir si `search.list` devolvió cero salas de si aparecieron recursos que no coincidieron.
- **NO modificar** el criterio `matchYouTubeEvent`, ni campos `safeToApply:false` / `directSyncWrites:0`, ni flag, Cron, D1, rutas públicas, editor/visor, estado público o credenciales.
- Revisar este PR en borrador; desplegarlo solo con autorización explícita. Una futura prueba de consulta real también requiere autorización separada, volver a activar y después desactivar flag, y respetar cuota de YouTube.
