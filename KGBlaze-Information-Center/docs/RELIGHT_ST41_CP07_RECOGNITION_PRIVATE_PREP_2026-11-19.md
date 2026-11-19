# Project Relight — Stage 41 · CP07: reconocimiento — preparación privada

Fecha: 2026-11-19, America/Mexico_City.

## Texto editorial
**Español aprobado:** «Gracias a quienes hacen posible este viaje». Cambia la copia por defecto y el valor ES de \`recognitionTitle\` en la franja ya publicada. **Las traducciones EN/JA y el subtítulo se revisarán posteriormente**, y por tanto se mantienen en sus variantes anteriores sin afirmar que sean definitivas.

## Integración técnica: límites explícitos
Esta etapa añade un adaptador privado y verificable por pruebas: \`src/recognition-private.mjs\`. **NO está importado por el Worker**, no añade rutas, no ejecuta cron, no conecta con Twitch ni YouTube, no escribe en D1, no exige nuevas credenciales y NO publica nombres. El módulo se montará en la próxima etapa sólo después de revisar seguridad, OAuth y consentimiento.

### Twitch
- Documentación oficial: https://dev.twitch.tv/docs/api/reference/subscriptions y https://dev.twitch.tv/docs/authentication/validate-tokens/
- Necesita **User Access Token del broadcaster** con \`channel:read:subscriptions\`. El actual \`TWITCH_CLIENT_ID\`/\`TWITCH_CLIENT_SECRET\` de portadas utiliza client_credentials, que **no sirve para esta API**. Nada de tokens pegados en GitHub, registros o URLs.
- Preparar un flujo OAuth Authorization Code para obtener y renovar el token, con \`client_id\`, usuario propietario y \`broadcaster_id\` coincidentes; almacenar secretos únicamente en bindings seguros de Cloudflare. No confundir esto con autorizar una cuenta de espectador.
- \`RECOGNITION_TWITCH_ENABLED\` estará apagado (binding ausente) por defecto. El módulo solicita únicamente IDs \`user_id\` que ya autorizaron verificación, como permite la API de Twitch (hasta 100 por consulta); no descarga la lista completa ni usa \`after\`.
- Validación del token de Twitch antes de cada lectura (cubre el requisito de validación al menos horaria al enlazarse a un futuro job). Al token inválido, scope faltante, propietario incorrecto, cliente incorrecto o error de proveedor, falla cerrado SIN declarar membresías activas ni inactivas.
- Resultado privado limitado a \`active\`, \`gifted\` y \`tier\` por ID; no persiste respuestas completas, ni nombres de Twitch, ni gifter ids. Las suscripciones regaladas no se presentan como aportaciones recurrentes directas.

### Consentimiento y D1
- \`migrations/recognition_optins.sql\` es un **borrador de migración SIN aplicar**. Crea una tabla aislada para alias, ID de plataforma, consentimiento de comprobación, consentimiento expreso de publicación, aprobación de visibilidad, revocación, fecha de último chequeo y categoría de suscripción. Tabla vacía.
- Un algoritmo separado de proyección sólo entrega alias públicos cuando el creador habilita la publicación, la persona autoriza mostrar su alias, la entrada está visible y una comprobación válida y reciente (menos de 24 horas) demuestra suscripción activa. La ausencia de comprobación NO autoriza publicación.
- No añadir una consola sin reglas de autorización. La consola futura deberá permitir registrar consentimiento, corregir alias, retirarlo inmediatamente y eliminar el registro. No autorizar automáticamente por el hecho de ser miembro. Un opt-out debe prevalecer sobre comprobaciones activas.

### YouTube
- Documentación oficial: https://developers.google.com/youtube/data/reference/rest/v3/members/list
- Requiere \`youtube.channel-memberships.creator\` y habilitación específica de YouTube para canales seleccionados (acceso limitado a creadores con Partner Manager según documentación actual).
- La API Key usada en vídeos de Terminal **no es suficiente**, ni el sistema de XP del chat sustituye la lista completa de miembros.
- \`YOUTUBE_MEMBERSHIP_INTEGRATION\` declara únicamente una capacidad **bloqueada**, no hay peticiones ni endpoints al servicio hasta que el canal obtenga acceso. Alternativa posterior: verificación manual autorizada desde YouTube Studio.

## Pasos siguientes
1. Elegir mecanismo de consentimiento y alias público, y revisar/autorizar la migración D1.
2. Registrar aplicación Twitch con redirect URI HTTPS y realizar OAuth Authorization Code, con refresh y protección CSRF \`state\` y validación de identidad. **No pedir tokens en chat**.
3. Conectar sólo entonces el adaptador a un endpoint privado del Centro de Control con login y a un job programado rate-limited; auditarlos. No mover la data al cron editorial de Terminal sin especificación previa.
4. Integrar a Home una lista pública mínima de alias consentidos, con fecha de estado y fallback sin nombres, sin recargar los embeds.
5. Reevaluar si YouTube concede permiso especial, de lo contrario usar verificación manual con caducidad.

**No se introduce ninguna dependencia ni se modifica el Worker, su tabla editorial, su frecuencia cron, Terminal, Rebel Mix o reproductores.**
