# Project Relight — Stage 42 CP01 · ReSpark y reconocimiento privado

Fecha: 2026-11-19 · America/Mexico_City.
Estado: **preparación revisable; cero activación**. Stages 38–41 agotados por capacidad, NO cerrados por finalización.

## Continuidad recuperada y jerarquía
- Stage 38 Main Site: Home V5 (PR161), catálogo Scripta Lyrica histórico (PR160); diferencias entre Home, Rebel Mix y Terminal; no publicar reproductor/descargas musicales sin derechos.
- Stage 39 Crossite: homologación independiente; PR164/V7 es draft y NO es base autorizada; ReSpark focal del 18/nov en Biblioteca, con límites sobre capturas originales.
- Stage 40 Refinement: métodos de apoyo en Home; sin tienda ni portal adicional. No presumir que servicios de monetización no verificados estén activos.
- Stage 41 Entralink: franja después de las Terminales YouTube/Twitch (PR193), carrusel Hero inerte (PR194); texto ES definitivo «Gracias a quienes hacen posible este viaje», EN/JA pendiente (PR195); módulo Twitch privado y esquema D1 sin aplicar (PR195); reutilizar puentes Terminal (PR196).
- Prioridad: instrucción reciente del creador > evidencia original > documentación > estado verificado GitHub > conjeturas. Fusionado ≠ desplegado ≠ observado en producción.

## Investigación de API — rectificación de YouTube
- Twitch Get Broadcaster Subscriptions: token de usuario del propietario con scope channel:read:subscriptions, broadcaster_id igual al ID del token, filtro user_id repetible hasta 100. NO hacer consulta sin IDs; no usar app token de box-art.
- YouTube members.list: filterByMemberChannelId, separado por comas, **hasta 100 canales**. Permite consultas por consentimiento con part=snippet y mode=all_current; identificar por snippet.memberDetails.channelId y verificar snippet.creatorChannelId. Scope youtube.channel-memberships.creator y autorización individual del canal obligatorios. Una API key no sirve. Acceso limitado según documentación a creadores con Partner Manager / representante.
- YouTube no expone en el recurso un is_gift equivalente y fiable; nunca clasificar automáticamente como directa/recurrente. Twitch sí incluye is_gift.

Referencias:
- https://dev.twitch.tv/docs/api/reference/subscriptions
- https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/
- https://dev.twitch.tv/docs/authentication/refresh-tokens/
- https://developers.google.com/youtube/data/reference/rest/v3/members/list
- https://developers.google.com/youtube/data/reference/rest/v3/members

## CP01: módulos añadidos a RAMA (no conectados)
1. src/recognition-twitch-oauth.mjs: URL OAuth Authorization Code con estado aleatorio de 256 bits, devuelve solo hash SHA-256 para registro privado con caducidad de 10 minutos; callback HTTPS estricto, validación de client_id, broadcaster_id, scope y token; canje/refresh solo server-side. **No existe ruta HTTP**.
2. src/recognition-youtube-private.mjs: consulta selectiva de membresía de hasta 100 canales consentidos, comprueba canal creador, rechaza respuestas inconsistentes/incompletas. Exige RECOGNITION_YOUTUBE_ENABLED=true y YOUTUBE_MEMBERS_API_ACCESS_VERIFIED=true, ausentes en producción.
3. tests/st42-recognition-providers.test.mjs cubre state/CSRF, caducidad, propietario incorrecto, scope, refresh, consentimiento, filtros y canal.
4. Sin imports nuevos al Worker, rutas, Cron, bindings activos, tablas nuevas, cambios Home, nombres ni secretos.

## Para conectar Twitch realmente — pasos externos pendientes
1. Twitch Developer Console: abrir la app EXISTENTE «KGBlaze Integrated Services» y verificar Client ID y Client Type (Confidential); registrar Redirect URI HTTPS EXACTA bajo el dominio que sirve Worker. Ruta candidata: /api/admin/recognition/twitch/callback. No registrar otra app.
2. Cloudflare: confirmar secretos existentes TWITCH_CLIENT_ID y TWITCH_CLIENT_SECRET sin revelarlos. Configurar mediante panel seguro TWITCH_RECOGNITION_BROADCASTER_ID y TWITCH_RECOGNITION_REDIRECT_URI; habilitar RECOGNITION_TWITCH_OAUTH_ENABLED solo después de revisión.
3. Antes de montar callback: endpoint de inicio POST autenticado (ADMIN_TOKEN), origen restringido; guardar únicamente hash estado y timestamp; callback valida y consume hash de forma **atómica y única** en D1 antes del canje de código. Rechazar replays/mismatch/error sin logs de query/código/tokens.
4. Almacenar access/refresh token cifrados en reposo AES-GCM con clave Cloudflare Secret independiente; nunca exponer HTTP/HTML/JS/logs. Rotar tokens serializadamente y atómicamente. Validar usuario propietario/scopes. Exigir mecanismo de revocación antes de activar consultas.
5. Separar consentimiento de VERIFICAR del consentimiento de PUBLICAR y de la aprobación editorial; eliminar alias tras retirada. La migración migrations/recognition_optins.sql NO está aplicada; ajustar snake_case→camelCase y el campo withdrawn_at antes de conectarlo a validRecognitionConsent para preservar opt-out.

## Para YouTube
- Confirmar acceso especial para el canal UCRd_uwPjrsf6Z3CRXwNehEQ mediante Partner Manager/representante.
- Solo si se concede, preparar OAuth del propietario, tokens cifrados y verificación owner/scope; consultar **solo** IDs consentidos.
- Si no hay acceso, revisión manual autorizada y caducable, nunca scraping de Studio ni XP/sync de Terminal como sustituto.

## Gates siguientes
- No montar estos módulos hasta revisión de pruebas y seguridad, esquema D1, callback exacto en consola y credenciales Cloudflare.
- No confundir integración preparatoria con conexión real.
- No ejecutar migraciones D1 remotas sin autorización específica.
- Franja pública sin alias; conservar reproductores y Cron */5 * * * *.
