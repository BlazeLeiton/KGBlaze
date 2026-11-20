# Project Relight — Stage 42 · CP02 · Twitch OAuth dentro de Terminal

**Fecha:** 19-nov-2026 · America/Mexico_City.
**Estado:** preparación en borrador, sin aplicar migraciones, habilitar secretos, obtener consentimiento real ni publicar alias.

## Continuidad histórica

- Se reutiliza KGBlaze Integrated Services, categoría Website Integration y Client Type Confidential (octubre). **No registrar otra aplicación ni pedir esos parámetros otra vez.**
- URI OAuth histórica y ya definida: **https://kgblaze.dpdns.org/twitch/oauth/callback**. El parámetro Redirect URI no es una credencial.
- El Worker/Terminal ya usa TWITCH_CLIENT_ID y TWITCH_CLIENT_SECRET para app-token Helix Get Games. Ese token NO concede channel:read:subscriptions.
- Stage 41 CP07/CP08: adaptador de consulta selectiva por IDs consentidos sigue inerte; la migración recognition_optins.sql permanece sin aplicar; YouTube Members API es independiente y sigue pendiente de acceso especial.

## CP02: rutas privadas preparadas

| Dirección | Método | Protección | Comportamiento |
| --- | --- | --- | --- |
| /departures/api/admin/recognition/twitch/start | POST | ADMIN_TOKEN, Origin mismo host o ausente, flag y clave AES | Estado CSRF aleatorio 256-bit, únicamente hash SHA-256 en D1 y URL temporal devuelta al administrador |
| /twitch/oauth/callback | GET | Host HTTPS histórico, state one-use atómico, plazo de 10 min, propietario/client/scope | Canje de código Twitch, tokens cifrados AES-256-GCM en D1, respuesta genérica sin tokens |
| /departures/api/admin/recognition/twitch/status | GET | ADMIN_TOKEN y flag | Booleanos connected/tokenCurrent y fecha de actualización, NUNCA credenciales |
| /departures/api/admin/recognition/twitch/refresh | POST | ADMIN_TOKEN y flag | Refresh manual de token de usuario, almacenamiento cifrado con nuevo nonce y bloqueo D1 contra rotaciones simultáneas |

El router del dominio permite SOLO esas rutas adicionales; /api/admin/* raíz permanece denegado. La configuración wrangler.toml incorpora la callback exacta entre los recursos servidos primero por Worker, sin abrir otro patrón público. El código detecta scopes incorrectos, estado expirado o repetido, cuenta o aplicación equivocada, denegación de permiso, credencial ausente y respuestas de proveedor inválidas.

La migración nueva migrations/recognition_twitch_oauth.sql está **SIN APLICAR** y aislada de terminal_state. Contiene un único estado pendiente para CSRF y una fila de credenciales cifradas para propietario. Los tokens NO se entregan al navegador, no se insertan en fuentes, no se guardan como cookies ni se registran en logs. El cifrado AES-GCM utiliza nonces separados y datos autenticados para owner y tipo de token.

## Condiciones necesarias para conectar de verdad

1. Aprobar revisión de código y ejecución de migración D1 separada, sin afectar la agenda Terminal.
2. Confirmar los secretos existentes del Worker sin revelar valores. La redirect URI fija histórica no requiere registrar otra dirección.
3. Resolver ID NUMÉRICO del propietario y agregar TWITCH_RECOGNITION_BROADCASTER_ID como binding privado.
4. Generar 32 bytes aleatorios EN LOCAL, Base64, y guardarlos como secreto RECOGNITION_TWITCH_TOKEN_KEY_B64 en Cloudflare. No copiarlo a GitHub ni chat.
5. Tras despliegue revisado y migración lista, habilitar RECOGNITION_TWITCH_OAUTH_ENABLED=true. Sin esa bandera todas las operaciones sensibles fallan cerrado y la callback devuelve 404.
6. Desde administrador, ejecutar POST start con bearer ADMIN_TOKEN, abrir URL temporal y autenticar al propietario en Twitch para conceder exclusivamente channel:read:subscriptions. Comprobar estado GET.
7. Antes de consultar subs, implementar revocación efectiva, pruebas D1 reales y el registro de consentimiento individual verificado; publicar alias requiere permiso SEPARADO.

No hay Cron nuevo, lectura automática de suscripciones, cambios de Home ni nombres publicados. El módulo YouTube sigue sin integración con OAuth de miembros.

Referencias: https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/ ; https://dev.twitch.tv/docs/authentication/refresh-tokens/ ; https://dev.twitch.tv/docs/api/reference/subscriptions ; https://developers.cloudflare.com/d1/worker-api/prepared-statements/ ; https://developers.cloudflare.com/workers/runtime-apis/web-crypto/
