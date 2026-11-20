# Project Relight · Stage 42 CP09 — Reconocimiento Twitch basado en suscripciones anunciadas

Fecha de revisión: 19-nov-2026, America/Mexico_City.

## Aclaración vinculante CP10 — suscripciones y membresías, no espectadores

**CP09 solo define un mecanismo auxiliar de agradecimiento a eventos recientes anunciados en Twitch; NO define todas las personas elegibles para reconocimiento o beneficios.**

El sistema completo **no es un registro de espectadores**. Su objetivo es reconocer suscripciones y membresías reales: **suscriptores de Twitch**, **miembros de YouTube** y **apoyos recurrentes de Ko-fi u otros servicios de suscripción**, cuando dichas modalidades existan y puedan verificarse. La franja «Apoyos recurrentes» en Home se conserva precisamente para ese supuesto futuro. No incluye automáticamente seguidores, visitantes, espectadores, donaciones puntuales ni compras aisladas.

Una suscripción/membresía activa puede dar acceso a beneficios exclusivos sin que el titular tenga que adquirir otra membresía en KGBlaze. **La comprobación privada de vigencia es distinta de publicar nombre o alias**: no construir automáticamente una lista permanente en el dominio a partir de datos de acceso restringido. Las posibilidades de reconocimiento en público deberán ser proporcionales a lo que cada plataforma comunica y al permiso/visibilidad correspondiente; Ko-fi no se asumirá conectado ni con suscriptores actuales.

Los avisos de 72 horas CP09 solo sirven como un formato de agradecimiento reciente de Twitch. **No limitan** el reconocimiento de suscriptores activos, miembros de YouTube ni futuros apoyos recurrentes verificados. YouTube `members.list` requiere acceso especial del canal y OAuth del creador: ese acceso aún no se ha acreditado. Véase `RELIGHT_ST42_CP10_RECURRING_SUBSCRIPTIONS_MEMBERSHIPS_2026-11-19.md`.

## Corrección de alcance del creador

El propósito del módulo de agradecimiento personalizado en KGBlaze es reconocer a **suscriptores de Twitch** y las renovaciones que Twitch **ya destaca en el chat**. No se pretende crear un registro general de espectadores, exigir que cada sub abra una cuenta en KGBlaze o recopilar un censo completo de personas con suscripción activa.

Esta ruta de EventSub se refiere **solo al carrusel de avisos recientes**; no sustituye la verificación privada de suscripciones activas cuando se necesite comprobar beneficios, y no define el reconocimiento de miembros de YouTube. No elimina la capacidad de verificaciones privadas selectivas cuando estas sean necesarias para otras funciones.

## Señales oficiales adecuadas

| Señal | Significado | Decisión del primer alcance |
|---|---|---|
| `channel.subscribe` | Nueva suscripción; Twitch **no** incluye renovaciones aquí | Sí, **solo** si `is_gift=false` |
| `channel.subscription.message` | Renovación compartida por el usuario mediante aviso de chat | Sí; permite mostrar meses acumulados si se proporcionan |
| `channel.subscription.gift` | Uno o varios regalos; el donante puede ser anónimo | No en el primer alcance; nunca atribuir regalos anónimos |
| `channel.subscription.end` | Caducidad de una suscripción | No es un agradecimiento |
| `Get Broadcaster Subscriptions` | Consulta del estado actual de suscriptores, incluidos quienes no anunciaron renovaciones | **No** para llenar la banda pública |
| `channel.chat.notification` | Avisos que aparecen en chat (requiere permisos diferentes: `user:read:chat`) | No montar ahora; el scope de propietario actual `channel:read:subscriptions` alcanza para los dos primeros eventos |

Referencias oficiales:
- https://dev.twitch.tv/docs/eventsub/reference/channel#channel-subscribe
- https://dev.twitch.tv/docs/eventsub/reference/channel#channel-subscription-message
- https://dev.twitch.tv/docs/eventsub/reference/channel#channel-subscription-gift
- https://help.twitch.tv/s/article/guide-to-custom-messages?language=en_US
- https://dev.twitch.tv/docs/eventsub/reference/chat#channel-chat-notification

**Importante:** la renovación automática **no equivale** a una publicación voluntaria en chat. Si una persona no comparte el aviso, no aparece en el carrusel de agradecimientos de este modelo. Una mención en Twitch y mantener un directorio permanente en un dominio externo tampoco son necesariamente lo mismo. Esta fase propone **agradecimientos recientes** con caducidad (72 horas), no una base de datos histórica ni un ranking; ampliaciones de permanencia requerirán definición editorial específica.

## Contrato del modelo unmounted CP09

`src/recognition-twitch-public-announcements.mjs` normaliza únicamente eventos de Twitch **que un receptor EventSub de confianza ya verificó**. El flag `verifiedEvent=true` **NO** es un mecanismo de autenticación: un futuro receptor debe verificar la firma HMAC, timestamp, deduplicación del ID de mensaje y el usuario broadcaster antes de pasarlo al adaptador. No debe permitir que clientes públicos elijan este flag.

- Requiere `broadcaster_user_id=70386764`, tipos `channel.subscribe` o `channel.subscription.message`, versión 1, estado enabled, un Twitch user ID numérico y un display name seguro.
- Para renovaciones, requiere el objeto `message`, ya que representa aviso compartido. **Nunca almacena ni reproduce el texto libre del mensaje** en la web.
- Omite destinatarios de regalos; no inventa donantes o nombres cuando el evento fue anónimo.
- Evita usar `subscription.created_at` como hora del evento: esa marca pertenece al registro EventSub, no al acto del espectador. Usa la hora del mensaje autenticada proporcionada por un transporte futuro.
- Exposición mínima en Home: nombre público, `nueva suscripción` / `renovación compartida` y, cuando esté indicado, meses acumulados. Ningún token, User ID, nivel/Tier, racha privada, mensaje personalizado o información de cobro.
- Caduca después de 72 horas; debe ofrecer exclusión/manual removal por moderación si se monta una persistencia futura.
- No crea rutas HTTP, no hace peticiones a Twitch, no ejecuta cron, no consulta listas de suscriptores y no modifica D1.

## Siguiente fase de integración EventSub

1. Crear receptor webhook en ruta propia, estrictamente separada del callback OAuth histórico, y nuevo **secreto HMAC dedicado** en Cloudflare. Validar firmas, timestamp y replay antes de leer un evento; devolver el challenge de alta únicamente tras verificarlo.
2. Registrar dos tipos EventSub mediante Twitch API usando autorización de propietario ya concedida; el registro debe ser administrado y auditado. No suponer que la aprobación OAuth crea automáticamente suscripciones EventSub.
3. Definir almacenamiento mínimo/expirable y deduplicación con acceso administrativo de eliminación. Ningún escaneo de la lista completa.
4. Montar la banda `Gracias a quienes hacen posible este viaje` con contenido real, sin publicar identificadores si no existen eventos autorizados; conservar independencia de la información de otros métodos de apoyo previamente definida para Home.
5. Pruebas de firma incorrecta, replay, expiración, regalos, renovación no compartida, moderación, accesibilidad e idiomas ES/EN/JP. Activar solo después de QA y smoke.

## Lo que NO afirma este checkpoint

No afirma que los nombres ya estén apareciendo, que EventSub esté registrado ni que el receptor webhook esté desplegado. No reautoriza Twitch y no modifica el token ya cifrado. CP09 es una preparación técnica sin efectos públicos.
