# Project Relight — Stage 43 CP27: habilitar únicamente sincronización privada de Twitch

**Fecha:** 2026-11-20 (America/Mexico_City). **Evidencia del propietario:** ejecutó la consulta SELECT de verificación `sqlite_master` en Cloudflare D1 `kgblaze-terminal`, y obtuvo exactamente los nombres de tablas `recognition_twitch_membership_meta` y `recognition_twitch_memberships`, que corresponden a la migración de Stage43 CP26. No es evidencia de filas cargadas ni de suscripciones sincronizadas.

## Alcance y límites
- Se modifica una sola variable operativa: `RECOGNITION_TWITCH_RECOGNITION_ENABLED` de false a **true** en `wrangler.toml`, tras confirmación real del propietario de las dos tablas D1.
- `RECOGNITION_TWITCH_PUBLIC_ENABLED=false` sigue apagado. `RECOGNITION_TWITCH_TRIAL_VISIBLE=false` sigue apagado, y `RECOGNITION_TWITCH_TRIAL_UNTIL` no está configurado. No se publica ningún nombre, aunque D1 contenga suscriptores verificados.
- La sincronización del creador usa `RECOGNITION_TWITCH_STATUS_ENABLED=true` y OAuth del propietario existente, sin crear cuenta para visitantes, bot de T.B., Cloudbot, EventSub o nuevas credenciales.
- La tarea diaria está en el Cron histórico `0 9 * * *` (03:00 hora de Ciudad de México) compartido con la generación de la vista previa social. La tarea Twitch de cinco minutos no existe; la sincronización YouTube de cinco minutos sigue intacta.
- La lista global de Twitch todavía tiene un `total` inconsistente. Se ignora el total como prueba de vigencia y se comprueba cada ID conocido u observado mediante filtros `user_id` en grupos de hasta 100. No se infiere una baja por paginación incompleta, fallos ni rate limits.
- Todos los suscriptores nuevos se introducen con `consent_state=unasked`; nadie obtiene `approved`/`declined` de forma implícita. Los comandos de chat están preparados pero desactivados y sin bot.

## Verificación sin revelar datos privados
1. Antes de fusionar, pasar preflight, pruebas SQLite, Chrome y validación de que un estado privado sincronizado no produce nombres públicos.
2. Después de fusionar, confirmar build Cloudflare y repetir el smoke anónimo de Home/Terminal/`/departures/api/public/recognition` que debe continuar respondiendo `{ok:true,twitch:[]}`.
3. Primera sincronización autenticada por el propietario, sin compartir el token, con POST `https://kgblaze.dpdns.org/departures/api/admin/recognition/twitch/members/sync`, Authorization `Bearer <ADMIN_TOKEN>` y `X-Relight-Recognition-Confirm: sync-daily-recognition`. La petición ESCRIBE solo en D1 PRIVADA si las verificaciones resultan válidas. No reintentar si hubo error sin diagnosticarlo.
4. Consultar metadatos privados con GET `.../members/status` y `X-Relight-Recognition-Confirm: inspect-recognition`. Solo compartir campos sanitizados `ok`, `refreshed`, `reason`, `checked`, `partial`, `counts.tracked`, `counts.active`, `counts.unasked`, `publicEnabled`, `trialEnabled` y `lastSuccessAt` si fuera necesario. No compartir cookies, token, URLs OAuth ni JSON de Twitch.
5. Si `sync` no obtiene respuesta válida, mantener el estado privado existente y no activar publicación. La compatibilidad de las columnas de D1 puede validarse posteriormente mediante un `PRAGMA table_info` si se diagnostica `recognition_schema_unavailable`.

## Siguiente puerta
Con comprobación privada de producción y contadores confirmados, el creador podrá aprobar la activación temporal y con fecha de caducidad de la publicación de `unasked`. Sin esa aprobación y sin una caducidad explícita, el público ve un banner sin nombres. Tras terminar el ensayo se apaga la simulación y la base conserva `unasked` (no `declined`).