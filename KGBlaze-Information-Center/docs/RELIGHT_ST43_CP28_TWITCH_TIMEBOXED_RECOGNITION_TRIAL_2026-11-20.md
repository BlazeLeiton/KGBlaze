# Project Relight — Stage 43 CP28: reconocimiento Twitch de prueba con fecha límite

Fecha: 20-nov-2026, America/Mexico_City. **Caducidad exacta e inmutable del ensayo: domingo 22-nov-2026, 03:00 Ciudad de México = 2026-11-22T09:00:00.000Z.**

## Resultado privado real confirmado por el propietario
SyncOk True; Refreshed True; Checked 3; Partial False; StatusOk True; Tracked 3; Active 3; Unasked 3; Approved 0; Declined 0; PublicEnabled False; TrialEnabled False; LastSuccessAt 2026-11-20T08:20:29.729Z.
Son tres suscripciones activas verificadas en la base D1. Ninguna tiene autorización permanente registrada. El propietario pidió previamente simular autorización de todos los activos para el ensayo visual y después volver a no preguntado, jamás rechazado.

## Diferenciar estado real y presentación temporal
- RECOGNITION_TWITCH_RECOGNITION_ENABLED=true: conserva la actualización privada una vez al día a las 03:00 junto a la vista previa social.
- RECOGNITION_TWITCH_PUBLIC_ENABLED=true: permite mostrar exclusivamente nombres de presentación seleccionados por el Worker, no el roster privado completo, ni ID, login, tokens, pagos, tier o gifting.
- RECOGNITION_TWITCH_TRIAL_VISIBLE=true: los miembros con suscripción válida y consentimiento real unasked pueden mostrarse temporalmente y se marcan con Prueba / Trial / テスト. Los declined no aparecen.
- RECOGNITION_TWITCH_TRIAL_UNTIL=2026-11-22T09:00:00.000Z: la comprobación del Worker expira el permiso temporal automáticamente sin escrituras ni intervención manual.
- Cada registro continúa como unasked en D1; jamás se escribe approved simulando un consentimiento. Terminado el ensayo, los unasked dejan de mostrarse. El usuario puede revisar posteriormente las autorizaciones mediante Twitch o Streamlabs sin nuevos inicios de sesión web.
- El sitio es accesible públicamente aunque solo se haya compartido con la comunidad próxima. El test no implica consentimiento general a una futura publicación permanente.

## QA, respuesta a errores y reversible
- CI y preflight exigen la fecha límite y rechazan extensiones silenciosas; máximo siete días. La prueba pública comprueba nombres de exhibición con etiqueta trial, sin IDs ni login.
- El Worker solo muestra suscripciones verificadas en las últimas 36 horas; errores del proveedor no se convierten en baja, y un estado stale se oculta provisionalmente.
- El Cron existente de 03:00 de Ciudad de México realiza la sincronización privada; YouTube continúa con su Cron separado de cinco minutos.
- Detención inmediata por despliegue: RECOGNITION_TWITCH_TRIAL_VISIBLE=false o RECOGNITION_TWITCH_PUBLIC_ENABLED=false. A la fecha límite, los no preguntados desaparecen automáticamente aun sin un redeploy.
- Antes de activar la función permanente, apagar la simulación, eliminar la fecha temporal del archivo Wrangler y conservar unasked, approved y declined sin alteración.

## Evidencia de repositorio
CP26 PR #223, CP27 PR #224, documentos de decisiones Stage 41 y Stage 42. CP28 configura únicamente la proyección visual temporal y ajusta los controles de seguridad y pruebas; no crea bots, migra D1 ni modifica OAuth de creador.