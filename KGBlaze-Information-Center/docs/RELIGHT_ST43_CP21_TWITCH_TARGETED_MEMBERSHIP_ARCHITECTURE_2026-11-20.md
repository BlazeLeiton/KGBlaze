# Project Relight · Stage 43 CP21 — Reconocimiento de membresías Twitch por verificación selectiva
**Fecha:** 20-nov-2026 (America/Mexico_City)  
**Alcance:** checkpoint de diagnóstico y contrato de próxima implementación. **Documentación exclusivamente, sin cambios funcionales ni solicitudes autenticadas ejecutadas por el asistente.**

## Evidencia real recuperada, sin publicar identidades
El propietario ejecutó después de desplegar la PR #217 el POST administrativo y compartió **solo**:
```text
Ok              : False
Refreshed       :
SnapshotVersion :
Reason          : provider_total_below_observed
Phase           : first_page
TotalRecheck    : still_below
TargetedCheck   : all_confirmed
```
En la primera página de `Get Broadcaster Subscriptions`, el número de `user_id` distintos y válidos observados superó el `total` declarado. Una consulta independiente `first=1` también devolvió un recuento inferior a esos IDs; una consulta **filtrada** `user_id` a una muestra limitada confirmó todos los IDs de la muestra. La muestra puede ser menor de cinco y **no constituye un inventario exhaustivo de miembros**. No divulgar número observado, nombres, IDs, token o datos JSON de Twitch.

**Conclusión acotada:** El OAuth del propietario y las consultas filtradas se han podido usar; la sincronización de una lista global en D1 NO se ha confirmado. No adjudicar la discrepancia a cuentas eliminadas, cursors o un error definitivo de Twitch: el proveedor reconoce estos IDs en la consulta individual, pero su `total` unfiltered permanece incongruente en este caso. No hay base para declarar completa la lista ni para borrar miembros no encontrados.

## Contrato oficial y código ya disponible
- Twitch: https://dev.twitch.tv/docs/api/reference/subscriptions
- `GET /helix/subscriptions` acepta `broadcaster_id` y hasta 100 parámetros `user_id`; cuando se filtra no entrega `total` ni `pagination`. Usa el token OAuth del propietario con `channel:read:subscriptions`.
- Código vigente: `src/recognition-twitch-active-status.mjs` implementa `mode:'targeted'`; `src/recognition-twitch-connection.mjs` descifra token almacenado y permite refresh; `src/worker.mjs` expone **solo al administrador** `POST /departures/api/admin/recognition/twitch/check-subscribers` (protegido con `ADMIN_TOKEN` y la confirmación `read-subscription-status`).
- `src/recognition-private.mjs` contiene validaciones preliminares de opt-in y proyección de alias, pero sigue **sin montarse** y su adaptador anterior requería un token de entorno separado. No debe activarse directamente ni asumir que un registro consentido acredita propiedad de cuenta.
- `POST .../sync-status-cache` sigue siendo manual y conservador: su validación global contradictoria detiene la transacción de sustitución D1 **antes de borrar nada**. No reintentar repetidamente esta misma operación mientras el diagnóstico esté establecido.

## Decisión técnica CP21
**Dejar de bloquear el reconocimiento individual por el `total` global.** Implementar dos flujos independientes, sin equiparar un listado privado del propietario con autorización de publicación:

### A. Estado individual y elegibilidad para beneficios
1. Asociar la identidad del visitante con una cuenta Twitch mediante un flujo OAuth separado del OAuth del propietario. El ID de Twitch debe obtenerse y validarse en el servidor, nunca aceptarse como prueba por un campo auto-declarado. Reutilizar `KGBlaze Integrated Services` cuando el proveedor y la configuración de callback lo permitan.
2. Registrar consentimiento **específico para consultar vigencia** y ofrecer retiro sencillo. No convertir esto en un registro de todos los espectadores; solo participantes voluntarios.
3. Consultar `Get Broadcaster Subscriptions` filtrando `user_id` auténtico por la cuenta asociada; la comprobación y la sesión del visitante deben residir del lado del servidor. El token OAuth propietario nunca sale al navegador.
4. Separar los estados `active`, `not_active` (solo comprobación filtrada exitosa), `unknown` (fallo 401/429/5xx, respuesta anómala, sesión o consentimiento incompletos), y `stale` (resultado anterior cuya frescura venció). Una falla transitoria nunca revoca o afirma por sí sola una suscripción.
5. Para beneficios restringidos, revalidar al acceder o respetar TTL conservador; documentar política explícita de expiración. Nunca usar `total` global para decidir el estatus de una cuenta.

### B. Agradecimientos públicos
1. Consentimiento para **mostrar nombre/alias en KGBlaze** independiente del consentimiento de verificación; visibilidad desactivada por defecto. Exigir aprobación editorial, supresión/retiro, y nunca publicar datos obtenidos solo del roster privado.
2. Los avisos voluntarios de Twitch o EventSub solo pueden alimentar agradecimientos recientes cuando su publicación esté permitida; el anuncio de suscripción no valida vigencia indefinida.
3. Mantener la franja `Gracias a quienes hacen posible este viaje` y las categorías `Miembros de YouTube · Suscriptores de Twitch · Apoyos recurrentes` sin mostrar nombres no autorizados. La sección de métodos de apoyo sigue separada.

## Puertas de implementación antes de conectar visitantes
- Especificar e inspeccionar callback fan OAuth y permisos mínimos, aislamiento del flujo de propietario, seguridad CSRF/state, cookies de sesión Secure/HttpOnly/SameSite, revocación, expiración y no guardar tokens del fan innecesarios.
- Revisar minimización de datos y migración D1 separada antes de aplicarla; tomar punto de recuperación y exigir intervención del propietario si hay nuevas credenciales, redirecciones o migraciones.
- Montar únicamente rutas revisadas detrás de pruebas de redireccionamiento, sesión, identidad, renovación y privacidad. **No** crear ruta pública de listado de suscriptores ni añadir Cron global.
- YouTube Members API y apoyos recurrentes futuros siguen caminos propios; no considerarlos conectados por la prueba de Twitch.

## Estado y criterio de cierre
- **Confirmado:** conexión OAuth del propietario, total consultable aunque contradictorio con primera página, verificación filtrada positiva de toda la muestra.
- **No confirmado:** roster completo, primera sincronización exitosa de D1, identidad de ningún visitante, consentimiento de publicación, reconocimientos individuales activos en Home, beneficios funcionando.
- **Siguiente implementación recomendada:** preparar autenticación de identidad Twitch del visitante y verificación por ID consentido, primero inerte (no montada). El paso de habilitarla necesitará revisión de los permisos/callback y política de visibilidad, con participación del propietario.
- **Sin cambios por este checkpoint:** código funcional, D1, OAuth secreto, flags, EventSub, Cron, YouTube, Ko-fi, Home y API pública.
