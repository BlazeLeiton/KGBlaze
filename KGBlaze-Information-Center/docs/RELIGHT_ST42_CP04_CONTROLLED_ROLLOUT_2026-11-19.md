# Project Relight — Stage 42 · CP04 · Despliegue controlado de Twitch (PREPARACIÓN)

**Fecha:** 2026-11-19 · America/Mexico_City.  
**Repositorio:** BlazeLeiton/KGBlaze. **PR:** #197, mantener DRAFT hasta completar controles de Cloudflare.  
**Estado al generar este checkpoint:** CI y preflight offline disponibles en la rama, sin fusión ni despliegue. D1 remota, dashboard Workers Builds, valores de secrets y autorización real NO inspeccionados; no afirmar que están hechos.

## Actualización verificada de producción — 19-nov-2026

**Gate D1 cumplido:** en Cloudflare, la consola de la base `kgblaze-terminal` (binding `DB`, UUID `d48b2cf2-cb29-48f1-bb50-1d0a4f66ba37`) confirmó ejecución correcta de ambas sentencias `CREATE TABLE IF NOT EXISTS` del archivo `migrations/recognition_twitch_oauth.sql`. La consulta a `sqlite_master` devolvió exactamente `recognition_twitch_oauth_credentials` y `recognition_twitch_oauth_states`. El usuario había generado un Bookmark ID con Time Travel antes de la migración. **No se copia aquí el valor del bookmark**; su retención está limitada por Cloudflare. La consulta confirmó nombres de tablas y el SQL ejecutado coincide con el archivo; no hubo ninguna prueba de lectura/escritura de tokens reales.

**Gates todavía pendientes:** comprobación humana de estrategia Workers Builds, identificación numérica real de broadcaster, clave AES-GCM privada, revisión de riesgos/seguridad, fusión/despliegue controlados de PR #197 y autenticación OAuth. **No ejecutar de nuevo la migración de modo rutinario**; comprobar el esquema antes de cualquier futura operación. El flag de OAuth permanece sin activar conforme a la configuración observada antes de la migración.

## Continuidad que NO se reconfigura

Aplicación existente **KGBlaze Integrated Services** — Website Integration, Confidential; callback histórico **https://kgblaze.dpdns.org/twitch/oauth/callback**. Worker **kgblaze-terminal**; D1 binding **DB**, database_name **kgblaze-terminal**, database_id **d48b2cf2-cb29-48f1-bb50-1d0a4f66ba37**. Mantener TWITCH_CLIENT_ID y TWITCH_CLIENT_SECRET vigentes para Get Games / Twitch box-art; OAuth User Token es distinto del App Token.

El cron público de Terminal se conserva: `*/5 * * * *` y `0 9 * * *`. **No** agregar un cron de reconocimiento. Home, Rebel Mix, Terminal y datos de agenda no se mezclan ni se alteran por la conexión.

## CP04: auditoría de preparación sin secretos

Desde el directorio KGBlaze-Information-Center del checkout de la rama:

~~~bash
npm test
node scripts/recognition-deploy-preflight.mjs
~~~

El preflight solo lee archivos del repositorio y devuelve un JSON de revisión, nunca ejecuta Wrangler, D1 o redes. Comprueba Worker, callback exacto, métodos/allowlist, bandera de OAuth no activada en [vars], esquema D1 limitado a DOS tablas nuevas y separación de los secretos. **No prueba Cloudflare remotamente ni sustituye el control humano.**

## Gate A — Inspección MANUAL ANTES de fusionar o cambiar Cloudflare

1. En Cloudflare Workers & Pages → **kgblaze-terminal**, comprobar el despliegue actual, historial y conexión automática GitHub/Workers Builds; registrar un deployment ID (no credenciales). Fusionar PR a `main` puede iniciar un nuevo despliegue sin otro paso manual: planear la ventana de publicación.
2. Verificar en la cuenta de Cloudflare que el Worker enlaza la D1 `kgblaze-terminal` por binding `DB`, que **TWITCH_CLIENT_ID**/**TWITCH_CLIENT_SECRET** siguen configurados, y que la URI OAuth histórica está registrada en Twitch Developer Console. Solo se revisan **nombres** de secrets, nunca sus valores.
3. Confirmar que `RECOGNITION_TWITCH_OAUTH_ENABLED` está ausente o es `false`. No aprobar activación todavía.
4. Hacer una captura/snapshot seguro y revisar el plan de rollback de Worker y D1, sin copiar filas con tokens a GitHub ni chat.
5. Desde un entorno Wrangler autenticado controlado por el propietario, corroborar cuenta/proyecto y schema D1 remota **solo lectura** (el comando siguiente no cambia filas):

~~~bash
npx wrangler whoami
npx wrangler d1 execute kgblaze-terminal --remote --command="SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'recognition_twitch_oauth_%' ORDER BY name"
~~~

Si el esquema ya existe, revisar columnas y constraints antes de intentar re-aplicar la migración. `CREATE TABLE IF NOT EXISTS` no corrige esquemas antiguos.

## Gate B — Migración D1, SOLO tras aprobación y respaldo

Con cuenta y base de datos verificadas, backup/rollback aprobado, y sin nombres ni tokens aún:

~~~bash
npx wrangler d1 execute kgblaze-terminal --remote --file=./migrations/recognition_twitch_oauth.sql
npx wrangler d1 execute kgblaze-terminal --remote --command="SELECT name FROM sqlite_master WHERE type='table' AND name IN ('recognition_twitch_oauth_states','recognition_twitch_oauth_credentials') ORDER BY name"
~~~

El archivo únicamente crea tablas privadas `recognition_twitch_oauth_states` y `recognition_twitch_oauth_credentials`, sin alteraciones a `terminal_state`, `terminal_audit` ni `recognition_optins`. **Este checkpoint NO ejecutó ninguno de esos comandos en producción.**

## ID de broadcaster proporcionado durante CP04

- Cuenta pública esperada: `blazeleiton`.
- **ID numérico facilitado por el propietario: `70386764`.** Confirmado guardado como variable de producción `TWITCH_RECOGNITION_BROADCASTER_ID` en Cloudflare Settings y sincronizado en la rama de la PR #197 (`wrangler.toml`), sin activar OAuth. Cumple la forma numérica requerida, pero **aún falta confirmación cruzada con Twitch Helix Get Users** (no se han usado credenciales de app o de usuario para consultar la API).
- La autorización OAuth implementada verificará que `/oauth2/validate` devuelva exactamente este `user_id`, el Client ID original y el scope `channel:read:subscriptions`. Si Twitch devuelve otra cuenta, la autorización se rechaza sin guardar tokens.
- El ID no es secreto; **ya incluido en `wrangler.toml` con OAuth DESACTIVADO**; no cambiar otros bindings. Mantener `RECOGNITION_TWITCH_OAUTH_ENABLED` ausente/false hasta revisar las versiones y decidir cuándo desplegar.

## Gate C — Secrets y versiones, sin activar reconocimiento

- Conservar `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` y `ADMIN_TOKEN` existentes sin reemplazarlos.
- Crear/confirmar **TWITCH_RECOGNITION_BROADCASTER_ID**, el ID **numérico comprobado** de la cuenta propietaria; no inferirlo del alias ni de un usuario de prueba. Almacenar mediante Cloudflare.
- Generar fuera del repositorio 32 bytes criptográficamente aleatorios, codificarlos en Base64 y guardarlos como secreto **RECOGNITION_TWITCH_TOKEN_KEY_B64**. No enviar a ChatGPT, guardar en GitHub, archivos rastreados, logs ni comandos con el valor literal.
- **TWITCH_RECOGNITION_REDIRECT_URI** es OPCIONAL. Si se define, debe ser exactamente https://kgblaze.dpdns.org/twitch/oauth/callback; está fijada en el código desde octubre.
- **RECOGNITION_TWITCH_OAUTH_ENABLED** debe seguir AUSENTE o `false` hasta después de la migración, revisión y verificación postdespliegue.
- Cloudflare advierte que `wrangler secret put` **crea y despliega inmediatamente una nueva versión** del Worker; no tratarlo como una operación inocua de solo almacenamiento. Evaluar las opciones de `wrangler versions secret put` / despliegue escalonado o dashboard según la política actual de Workers Builds. Ningún valor secreto se distribuye por GitHub.

## Gate D — Fusionar y comprobar **con flag apagado**

Cuando el propietario confirme los gates anteriores: revisar PR #197, verificar que la CI de su HEAD está verde, y coordinar merge/control de Workers Builds. Un merge con GitHub conectado podría desplegar automáticamente.

Pruebas HTTP sin credenciales (lectura exclusivamente) sobre https://kgblaze.dpdns.org:
- `/` continúa sirviendo Home;
- `/departures/` continúa sirviendo el visor;
- `/departures/api/health` responde como **kgblaze-terminal** y D1 conectada;
- `/departures/api/public` mantiene el contrato editorial sin datos privados;
- `/twitch/oauth/callback` devuelve **404** mientras el flag siga apagado;
- `/api/admin/recognition/twitch/start` se mantiene bloqueado en el dominio raíz;
- YouTube Sync y horarios de cron conservan su funcionamiento independiente.

No comparar números editoriales con los de octubre: los eventos pueden haber cambiado.

## Gate E — Activación y autorización OWNER (solo después)

1. Confirmar D1 y secretos desde Cloudflare, callback correcto y dashboard privado; mantener publicación de alias apagada.
2. Activar expresamente `RECOGNITION_TWITCH_OAUTH_ENABLED=true` en Cloudflare **una vez listos los demás requisitos**, tratando el cambio como despliegue. **No activar con migración o secreto ausente.**
3. Desde un cliente administrativo seguro y autorizado, usar POST `/departures/api/admin/recognition/twitch/start` bajo el prefijo `/departures`, con bearer `ADMIN_TOKEN`. El servidor devuelve una URL temporal OAuth solo al administrador; abrirla en la cuenta propietaria. **No pegar la URL completa en chat**: contiene el estado CSRF.
4. Twitch solicitará `channel:read:subscriptions`; después del consentimiento, callback histórico almacena el token de usuario cifrado en D1.
5. Consultar GET `/departures/api/admin/recognition/twitch/status` con autenticación; esperar `connected:true` y `tokenCurrent:true` sin tokens visibles. Refresh es manual; aún no hay Cron de autorrenovación.
6. Verificar que **ningún** nombre ni lista de subs se filtra a `/departures/api/public` o a Home. El módulo de subs permanece inerte hasta recibir consentimientos específicos verificables.

## Emergencia / rollback

- Primero deshabilitar bandera OAuth si ocurre incidencia. Eso no borra tokens ya guardados.
- Ejecutar **POST /departures/api/admin/recognition/twitch/disconnect** con bearer de administrador y cabecera **X-Relight-Recognition-Confirm: disconnect-twitch-owner** si se desea revocar acceso y borrar credenciales locales. Mantener el endpoint disponible incluso con el flag desactivado.
- Confirmar estado desconectado, revisar en Twitch conexiones autorizadas si revocación de proveedor no confirmada. El revocation remoto implementado corresponde al ACCESS token, no garantiza purga de todos los refresh grants.
- Revertir solo el despliegue del Worker desde el historial verificado. **NO hacer DROP de las tablas D1** como acción de emergencia: pueden contener registros cifrados o respaldos; tratarlos según política de retención/rotación.
- No usar deploy automático ni escribir secrets desde una PR abierta o comentarios.

## Limitaciones de lo realizado en CP04

El asistente solo cuenta con el conector GitHub en esta conversación; **no tiene sesión Cloudflare conectada ni permiso de acceso a la D1 remota**. El endpoint público del dominio no pudo validarse con la búsqueda web disponible, por lo que NO se afirma que Home/Terminal o callback fueron probados en el despliegue actual. El preflight y CI son verificaciones de código y entorno de prueba.

Documentación oficial:
- https://developers.cloudflare.com/workers/configuration/secrets/
- https://developers.cloudflare.com/workers/wrangler/commands/d1/
- https://developers.cloudflare.com/workers/wrangler/configuration/
- https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/
