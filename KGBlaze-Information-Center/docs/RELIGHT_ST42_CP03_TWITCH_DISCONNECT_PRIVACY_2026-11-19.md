# Project Relight — Stage 42 · CP03 · Desconexión y privacidad Twitch

Fecha: 2026-11-19 · America/Mexico_City.
Estado: código en borrador PR #197. **NO fusionado, NO desplegado, D1 remota sin migraciones aplicadas; no hay conexiones reales ni secretos configurados por esta etapa.**

## Fuente y continuidad
La aplicación existente **KGBlaze Integrated Services**, Website Integration / Confidential y callback histórico `https://kgblaze.dpdns.org/twitch/oauth/callback` se mantienen. El token `client_credentials` de Helix Get Games sigue ajeno a la autorización de suscriptores. No se abre otra aplicación ni se crea interfaz pública de participantes.

## Cambios CP03

- **Desconexión administrativa voluntaria**: `POST /departures/api/admin/recognition/twitch/disconnect`; requiere ADMIN_TOKEN, origen válido y cabecera `X-Relight-Recognition-Confirm: disconnect-twitch-owner`. No hay botón público ni operación programada.
- **Limpieza local prioritaria**: elimina (1) el estado CSRF OAuth pendiente y (2) los access/refresh tokens cifrados mediante `DB.batch([...])`. Cloudflare documenta que `D1Database.batch` ejecuta el lote en una transacción; no se presenta éxito si la transacción falla. Idempotente en ausencia de credenciales.
- **Sin bloqueo por flag/clave**: aun con `RECOGNITION_TWITCH_OAUTH_ENABLED=false` o secreto AES ausente, un administrador autenticado puede retirar credenciales locales. Si no es posible descifrarlas, no se reclama que se revocaron ante Twitch.
- **Revocación externa limitada**: tras asegurar eliminación local, se intenta `POST https://id.twitch.tv/oauth2/revoke` con Client ID y el **access token** descifrado, nunca el Client Secret. El código clasifica `providerRevocation` como `access_token_revoked` (HTTP 200), `unconfirmed` (proveedor caído/clave ausente/error) o `not_applicable` (sin credenciales). **Revocar un access token no permite afirmar que TODOS los refresh grants históricos de la aplicación fueron anulados.** Un administrador puede revisar las conexiones autorizadas en Twitch y retirar la aplicación si necesita confirmación de revocación completa.
- **Protección frente a callback tardío**: la inserción cifrada en D1 se hace con una condición SQL que exige que el estado consumido siga existiendo y no esté expirado. Una desconexión que borra esa fila impide que un canje tardío inserte nuevas credenciales. Un refresh en vuelo tampoco puede restaurarlas después de la eliminación, porque sus `UPDATE` son condicionales sobre la fila ya eliminada.
- **No es borrado de respaldos**: la eliminación de filas actuales no garantiza purga inmediata de snapshots, WAL, backups o sistemas de retención del proveedor. Nunca se declara supresión irrecuperable.
- **Aislamiento**: no se accede a lista de suscriptores, no se importan aliases al Worker, no se modifica la agenda de Terminal, Home, Rebel Mix, cron, ni YouTube.

## Validación
- Tests con D1 simulado: eliminación local aunque falte bandera/clave, fallo de proveedor, errores D1 cerrados, doble desconexión, callback tardío vs desconexión, refresh simultáneo vs desconexión, método no permitido, ausencia de ADMIN_TOKEN/cabecera de confirmación, origen externo y no fuga de tokens.
- Tests con **SQLite real en memoria usando la migración exacta** `migrations/recognition_twitch_oauth.sql`: integridad de inserción cifrada, eliminación atómica, rechazo de callback tardío, rollback por error SQL, renovación con lock. Son tests locales, **NO** pruebas en D1 remoto.

## Puertas siguientes
1. Verificar CI completo; revisión humana del riesgo de revocación simultánea y políticas de tokens.
2. Aprobar formalmente PR #197 y despliegue controlado en etapa posterior, no por este checkpoint.
3. Aprobar/aplicar la migración D1 de OAuth aislada, verificar backups/retención según Cloudflare.
4. Generar/registrar secretos en Cloudflare y realizar OAuth con el propietario en Twitch.
5. Registrar consentimiento verificable individual y permiso explícito independiente para publicar alias, con borrado y revocación propios.
6. YouTube sigue pendiente de habilitación especial y conexión OAuth independiente.

Referencias oficiales:
- https://dev.twitch.tv/docs/authentication/revoke-tokens/
- https://dev.twitch.tv/docs/authentication/refresh-tokens/
- https://developers.cloudflare.com/d1/worker-api/d1-database/
