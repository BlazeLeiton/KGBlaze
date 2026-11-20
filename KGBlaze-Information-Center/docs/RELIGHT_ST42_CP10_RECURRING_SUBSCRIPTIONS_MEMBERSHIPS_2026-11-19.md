# Project Relight · Stage 42 CP10 — Suscripciones y membresías, no registro de espectadores

Fecha de decisión editorial: 19 de noviembre de 2026 (America/Mexico_City).

## Alcance corregido por el creador

El reconocimiento de KGBlaze no es una plataforma de registro de espectadores. Está concebido para las personas que **ya son suscriptoras o miembros mediante los sistemas nativos de una plataforma**, y para extender agradecimientos o beneficios que las plataformas ya reconocen.

Categorías elegibles, sin afirmar que todas las integraciones estén disponibles actualmente:

1. **Suscriptores de Twitch** del canal `blazeleiton`: modalidades de suscripción reconocidas por Twitch, incluidos Prime y regalos cuando correspondan; el destinatario de una suscripción regalada puede ser elegible para beneficios, pero nunca se le atribuye la compra.
2. **Miembros del canal de YouTube**: niveles y vigencia conforme a la información permitida por YouTube; no presumir acceso a Members API.
3. **Apoyos recurrentes**: membresías/suscripciones que algún día se contraten por Ko-fi u otra plataforma de suscripción, **solo cuando exista la modalidad, un miembro real y prueba de su vigencia**. La mención de Ko-fi es previsión editorial, no evidencia de membresías vendidas, de integraciones autorizadas ni de acceso a datos personales.

Quedan fuera del reconocimiento por suscripción: **espectadores, seguidores, visitantes, aportaciones puntuales, regalos materiales, compras aisladas, comisiones, donaciones únicas y apoyos que no constituyan una relación recurrente verificada**. Ko-fi/Throne y demás métodos de apoyo pueden seguir teniendo su sección comercial propia sin convertir toda contribución en membresía.

## Dos funciones relacionadas pero separadas

**A. Agradecimientos personalizados.** Pueden reflejar avisos de suscripción/renovación que el servicio ya destacó públicamente, o reconocimientos de suscriptores/miembros activos dentro de las reglas de visibilidad. No publicar listas completas de identidades privadas por el solo hecho de tener acceso a ellas. CP09 EventSub es solo una vía posible para avisos **recientes** de Twitch; su caducidad de 72 horas **no** limita la condición de miembro ni la duración de beneficios.

**B. Beneficios exclusivos.** La condición de elegibilidad es una suscripción/membresía **vigente y verificada en el proveedor**; no requerir otra compra o una segunda membresía en KGBlaze. Verificar vigencia según corresponda y revocar acceso cuando expire o se cancele. No asumir que una señal de chat basta como prueba permanente de vigencia. Distinguir membresías regaladas, suscripciones de pago o Prime únicamente cuando esa distinción sea necesaria para el beneficio ofrecido.

## Prioridades técnicas actuales

- **Twitch:** OAuth del propietario ya completado y su estado privado `ok=true`, `connected=true`, `tokenCurrent=true` confirmado por el propietario el 19-nov-2026. No se ha montado una consulta masiva de suscriptores. EventSub y su receptor HMAC aún no están integrados.
- **YouTube:** el adaptador de verificación selectiva está preparado, **sin acceso especial a Members API ni OAuth del propietario confirmado**. No sustituir autorización por una API key de agenda.
- **Ko-fi y otros:** arquitectura extensible prevista, **sin proveedor conectado, sin credenciales, sin eventos y sin datos reales de suscriptores**.
- **Home:** mantener el texto aprobado `Miembros de YouTube · Suscriptores de Twitch · Apoyos recurrentes` y sus traducciones EN/JP. La franja es informativa por ahora; no significa que ya haya una lista pública de personas.
- **Privacidad:** mostrar nombres solo a partir de información pública/autorizada adecuada a cada proveedor, con posibilidad de moderación/retiro. Los permisos que sirven para verificar beneficios no confieren automáticamente permiso para publicar un directorio externo permanente.

## Implementación de CP10

1. Revertir la reducción accidental de la franja Home que eliminaba «Apoyos recurrentes»; restaurar ES/EN/JP.
2. Actualizar la prueba de textos Home para conservar esas tres categorías y no permitir registro general de espectadores.
3. Rectificar CP09: su modelo EventSub **no define por sí solo** el conjunto de suscriptores/miembros elegibles.
4. Mantener las integraciones no listas en estado inactivo; ningún nuevo endpoint, consulta, cambio de credenciales, migración D1 o publicación de nombres.

**Criterio de cierre:** reconocimiento de **membresías/suscripciones de proveedores**, no un censo de comunidad, con Twitch+YouTube como trabajo actual y apoyos recurrentes por Ko-fi u otros servicios como ampliación futura.
