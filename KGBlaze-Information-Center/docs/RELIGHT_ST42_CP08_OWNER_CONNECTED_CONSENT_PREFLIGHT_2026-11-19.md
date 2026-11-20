# Project Relight — Stage 42 CP08 · Conexión del propietario verificada

Fecha de confirmación: 19 de noviembre de 2026, zona America/Mexico_City.

## Hecho confirmado

El propietario terminó satisfactoriamente la autorización de **KGBlaze Integrated Services** en Twitch. El callback devolvió el mensaje de éxito que el Worker emite únicamente después del intercambio con Twitch, la validación de propietario/client/scope y la escritura de credenciales cifradas en D1.

Posteriormente, el propietario ejecutó el endpoint privado autenticado `GET /departures/api/admin/recognition/twitch/status` y comunicó **`ok=true`, `connected=true`, `tokenCurrent=true`**. La confirmación del usuario es válida para el momento de esa consulta; **no equivale a vigencia perpetua** del access token. No recibimos ni copiamos `ADMIN_TOKEN`, access token, refresh token, claves AES, código OAuth o URL de estado.

El flujo anterior con `TW-10` quedó resuelto por la PR #202, que sustituye `redirect:'error'` (incompatible con Cloudflare Workers) por `redirect:'manual'` en las tres llamadas OAuth. CI y smoke posteriores aprobados. No se enumeró ni publicó ningún suscriptor.

## Barrera de consentimiento independiente

Autorizar al propietario **NO autoriza** a reconocer ni publicar la identidad de los espectadores. Antes de consultar un ID concreto:
- Obtener opt-in explícito para verificar la suscripción; verificar que la persona controla el Twitch user ID mediante OAuth individual de mínimo permiso o procedimiento moderado equivalente.
- Nunca consultar una lista completa de suscriptores: el filtro `user_id` debe ser obligatorio y limitarse a IDs previamente consentidos (hasta 100).
- Usar el token de propietario ya cifrado en D1 mediante lectura y descifrado solo en el Worker, sin duplicarlo como variable de texto en `wrangler.toml`.
- Ofrecer retirada de consentimiento inmediata, mantener `verify_opt_in`, `publish_opt_in`, aprobación editorial y visibilidad **separados**. Ninguna publicación de alias por defecto.
- No aplicar todavía `migrations/recognition_optins.sql`: la tabla `recognition_optins` sigue pendiente de revisión de contrato snake_case/camelCase, control de titularidad, autorización de escritura y recuperación/rollback.
- YouTube queda independiente: requiere acceso a Members API y autorización del propietario con scope específico; una API key de Terminal no equivale a eso.

## Prevención técnica sin activación

El módulo Twitch `src/recognition-private.mjs` y el adaptador de YouTube `src/recognition-youtube-private.mjs` estaban **sin montar** y aún contenían `redirect:'error'`, el mismo error que anteriormente provocó `TW-10`. CP08 los corrige a `redirect:'manual'` y añade pruebas con redirecciones 302 rechazadas.

**No se añaden rutas HTTP, cron, esquema D1, secretos, permisos, eventos, nuevas listas o cambios a la portada.** Estos módulos no se importan en el Worker de producción. Una eventual integración requerirá un nuevo checkpoint revisable.

Documentación de referencia: https://developers.cloudflare.com/workers/runtime-apis/request/ y https://dev.twitch.tv/docs/api/reference/subscriptions .
