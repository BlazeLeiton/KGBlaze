# Stage 43 CP25 — Piloto de reconocimiento: dos suscriptores Twitch que consintieron
**Fecha:** 20 de noviembre de 2026, America/Mexico_City. **Alcance:** dos cuentas que el creador confirma han autorizado previamente participar en pruebas. T.B., bots, Streamlabs Cloudbot, comandos del chat y YouTube se dejan para después.

## Decisiones originales recuperadas (Stage 41–42)
- Mostrar nombres temporalmente en el banner original «Gracias a quienes hacen posible este viaje» cuando Twitch confirma que la suscripción está activa, sin exigir al visitante login en KGBlaze ni anuncio de renovación en chat.
- Los tres rótulos originales ES/EN/JA, miembros de YouTube, suscriptores Twitch y apoyos recurrentes, permanecen. No se publica el listado general privado del canal.
- Se reutiliza solo el OAuth del propietario y el filtro Helix user_id. El total global contradictorio no se usa para dar bajas.
- Por privacidad, este piloto reconoce EXCLUSIVAMENTE los dos logins cuya autorización pública el propietario atesta, no a todos los suscriptores.

## Infraestructura preparada (desactivada de origen)
- Migración aislada: migrations/recognition_twitch_two_consent_pilot.sql (no aplicada). Dos tablas D1 privadas con cascada al desconectar OAuth del propietario.
- Resolver privado: GET Helix /users?login=... para dos cuentas y GET Helix /subscriptions con dos user_id. Requiere que AMBOS estén activos antes de escribir D1. Sin secret/identidades ajenas en respuesta pública.
- Alta administrativa en lote transaccional: POST /departures/api/admin/recognition/twitch/pilot/enroll; JSON exacto: {"logins":["login1","login2"],"consentConfirmed":true}. Encabezado X-Relight-Recognition-Confirm: enroll-two-consented-twitch-members; autenticación ADMIN_TOKEN.
- Consulta privada de piloto: GET .../pilot/status, confirmación inspect-two-person-pilot. Revisión forzada: POST .../pilot/refresh, confirmación refresh-consented-twitch-pilot. Retirada de todo el piloto: POST .../pilot/clear, confirmación clear-consented-twitch-pilot.
- API Home pública GET /departures/api/public/recognition: sin login de visitantes; retorna solo displayName de hasta dos personas autorizadas y actualmente verificadas, nunca Twitch ID, tier, gifting ni token; lista vacía si falta cualquier condición.
- Cron existente de 5 min: tras activación revalida exclusivamente los dos IDs; controles anti-concurrencia/antirreintento; expiración pública después de 30 min sin verificación exitosa. Un error de Twitch no marca baja; solo una consulta válida puede comprobar pérdida de suscripción.
- Flags separadas, ambas OFF: RECOGNITION_TWITCH_PILOT_ENABLED=false (lecturas/alta/cron) y RECOGNITION_TWITCH_PILOT_PUBLIC_ENABLED=false (nombres visibles). Ambas configuradas por PR revisada, sin nuevos secretos.

## Puertas de activación: aquí sí depende del propietario
1. Pasar CI, build y smoke anónimo. Verificar que Home no revele nombres sin alta aprobada.
2. Revisar punto de recuperación D1 y aplicar migración aislada en la DB kgblaze-terminal con credenciales propias del creador; no tocar tablas CP15 de roster ni Terminal editorial.
3. Activar SOLO la flag privada mediante PR; propietario introduce los dos logins localmente en el POST de enroll. No necesita compartir usernames ni ADMIN_TOKEN con ChatGPT.
4. Verificar piloto desde administración y su vigencia con /pilot/refresh; confirmar ausencia de otras personas.
5. Tras confirmación explícita, activar segunda flag PUBLIC mediante PR; verificar nombres y baja controlada. La retirada inmediata de todo el piloto se ejecuta por /pilot/clear y también es posible desactivar la flag pública.
6. En una etapa posterior, implementar autorización/revocación autogestionada a través de Twitch/Streamlabs/T.B., sin crear otra cuenta web.

## Seguridad
- Solo dos cuentas con consentimiento individual previamente confirmado por el propietario; no convertir esta excepción de prueba en publicación automática de la lista completa.
- El piloto no obtiene nombres mediante EventSub; las renovaciones compartidas no son necesarias para mantener el estado activo.
- La inexactitud del total global permanece abierta. No afirmar instantaneidad, ni que cada cancelación se refleje antes de la siguiente verificación exitosa.
- No iniciar scripts que publiquen nombres hasta migración + alta privada + autorización del propietario de activar publicación.