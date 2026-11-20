# Project Relight — Stage 43 CP26: reconocimiento Twitch generalizado y revisión diaria
**Fecha:** 20-nov-2026, America/Mexico_City. **Alcance confirmado por propietario:** reconocer a TODOS los miembros activos encontrados, no exactamente dos; dos era solo una estimación de suscripciones actuales. Mantener datos y autorizaciones diferenciados. Preparar comandos, pero NO ligar aún Twitch, T.B. ni Streamlabs Cloudbot.

## Diagnóstico de D1
- El propietario ejecutó una SELECT de sqlite_master sobre las tablas CP25 y obtuvo «This query returned no data». Una SELECT no crea tablas; en la DB consultada no se localizaron las dos tablas antiguas.
- CP25 estaba limitado a exactamente dos y cinco minutos; su SQL, código y tests se retiraron antes de aplicarse. No ejecutar la antigua migración.
- NUEVA migración pendiente de aprobación y backup: migrations/recognition_twitch_membership_v1.sql; tablas recognition_twitch_membership_meta y recognition_twitch_memberships. No toca tablas previas CP15/CP16 ni datos de Terminal. No aplicada por el asistente.

## Datos y autorizaciones
- Cada identidad (ID, nombre de login y nombre mostrado) procede del OAuth del creador, leído desde Helix. Twitch total global es contradictorio (CP19/CP20), por lo que se ignora para decidir estatus y eliminación.
- La exploración paginada tiene un límite de seguridad alto de 3000 usuarios y 30 páginas de 100: NO son dos. Si se supera el presupuesto, la operación falla sin reemplazos y debe extenderse la paginación; no se afirma completitud. Se comprueban los IDs observados y conocidos por grupos filtrados de 100. Una respuesta exitosa de 'no encontrado' para un ID concreto permite bajar su estado activo; un fallo 429/401/5xx no modifica ningún estado.
- Estados independientes: unasked (no preguntado), approved (autorizado), declined (rechazado). El alta automática deja unasked y source none. La única forma de approved/declined es una actualización administrativa autenticada/atestada o, en una etapa posterior, el evento de chat verificado por Twitch. El estado declined nunca se muestra, ni en la simulación.
- SIMULACIÓN temporal: RECOGNITION_TWITCH_TRIAL_VISIBLE=true más una fecha de caducidad RECOGNITION_TWITCH_TRIAL_UNTIL (máximo siete días futuros), además de la flag de consulta y la de publicación, permite exhibir temporalmente unasked activos. Se etiquetan en el banner como Prueba/Trial/テスト. En D1 siguen unasked (NO se escribe approved). Desactivar la flag o alcanzar la caducidad restablece inmediatamente la presentación sin fingir un rechazo. Los approved auténticos seguirán autorizados y los declined no se mostrarán.
- Solo el nombre mostrado de cada miembro elegible sale por GET /departures/api/public/recognition. No se exportan IDs, logins, tokens, donantes, tiers, mensajes ni el roster completo. Es un sitio accesible por URL pública aunque no compartido: revisar conscientemente activar nombres simulados.
- El resultado verificable tiene TTL público de 36 horas; una caída prolongada oculta el nombre por falta de evidencia fresca, sin confundirlo con baja real. Una consulta diaria implica cambios efectivos potencialmente hasta la comprobación siguiente.

## Programación
- Fuente inspeccionada: src/social-preview.mjs, SOCIAL_PREVIEW_CRON='0 9 * * *'. La imagen social diaria del visor se genera a 09:00 UTC, equivalente a las 03:00 de CDMX (UTC-6). La sincronización de Twitch ahora usa ese mismo disparador; corre en paralelo e independiente del render social.
- La comprobación Twitch se elimina por completo del Cron '*/5 * * * *', que continúa exclusivamente con YouTube. Sincronización Twitch diaria + botón administrativo manual (force), nunca polling de cinco minutos. El mínimo diario de 20h evita reintentos repetidos. Twitch Ratelimit headers y HTTP 429 son límites por bucket/endpoint, por ello la decisión conservadora es una solicitud por ciclo (exploración+grupos) sin loops de reintento rápido.

## Funciones de autorización preparadas pero NO conectadas a Twitch
- Parser puro: !kgblaze si / !kgblaze sí / !kgblaze autorizar → approved; !kgblaze no / !kgblaze retirar / !kgblaze baja → declined. Se exige un remitente Twitch autenticado por un adaptador futuro; no aceptar un ID declarado desde el navegador.
- API administrativa de consentimiento: POST /departures/api/admin/recognition/twitch/members/consent con ADMIN_TOKEN, header X-Relight-Recognition-Confirm: change-recognition-consent, JSON {"login":"nombre","state":"approved|declined|unasked","attested":true}. El estado unasked borra la fuente de consentimiento. La API NO está abierta anónimamente.
- GET .../members/status exige confirmación inspect-recognition y devuelve contadores y fecha de última sincronización, sin identidades.
- POST .../members/sync exige confirmación sync-daily-recognition y ejecuta comprobación privada manual de los IDs disponibles.
- No hay bot de T.B., Twitch EventSub, Cloudbot, registro web, nueva aplicación OAuth ni permisos de chat activados. Tampoco se consulta YouTube Members API con este componente.

## Despliegue y puertas de activación
1. CI completa, Workers build y smoke anónimo con todas las flags OFF. Nadie se publica ni se consulta automáticamente.
2. Propietario crea D1 Time Travel bookmark/recovery point, revisa/aplica recognition_twitch_membership_v1.sql en kgblaze-terminal y confirma dos nombres de tabla en SELECT sqlite_master.
3. Activar SOLO RECOGNITION_TWITCH_RECOGNITION_ENABLED=true vía PR revisada; hacer POST privado /members/sync (o esperar 03:00); verificar /members/status (recuento sin nombres). No compartir ADMIN_TOKEN ni un roster.
4. Aprobar explícitamente el ensayo de publicación: RECOGNITION_TWITCH_PUBLIC_ENABLED=true, TRIAL_VISIBLE=true y TRIAL_UNTIL=ISO corto; los no preguntados aparecen con marca de prueba, los rechazados nunca.
5. Probar cambio de estados approved/declined/unasked, desaparición al desactivar el piloto, y sincronización con verificación filtrada real. Tras prueba desactivar trial visible; permanecerán unasked.

## Referencias verificadas
- Código del sitio: src/social-preview.mjs y src/worker.mjs (Cron 03:00 y YouTube 5 min).
- Twitch Get Broadcaster Subscriptions https://dev.twitch.tv/docs/api/reference/subscriptions; Twitch API rate limit https://dev.twitch.tv/docs/api/guide/
- PR #222 precedente queda corregida por CP26; no implementar límite a dos miembros, no desplegar jamás la migración retirada.