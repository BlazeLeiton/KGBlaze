# Dudas pendientes y preguntas dirigidas (Stage 4 — tercera auditoría)

No preguntar de nuevo decisiones históricas explícitas ya confirmadas. Preguntar **sólo** lo necesario para resolver conflictos, mantener la agenda e integrar nuevas fuentes.

| Prioridad | ID | Pregunta a hacer, si no surge evidencia nueva | Razón / estado |
|---|---|---|---|
| Resuelta | Q-01 | **RESPONDIDA 12-oct:** mantener ambas reservas Azur 21 y 22, sin hora | Confirmación explícita; la futura confirmación de transmisión sigue siendo un asunto distinto |
| Respondida; ejecución pendiente | Q-02 | **RESPONDIDA 12-oct:** demo vocal de Cake Song sigue pendiente | No grabada/enviada según último dato. Mantener pendiente de producción; no preguntar otra vez hasta nueva revisión de progreso |
| Media | Q-03 | ¿Quedó definitivamente confirmado o descartado el Azur del 14/oct a las 22:00 tras el compromiso externo? | Reserva Twitch ≠ confirmación editorial |
| Resuelta | Q-04 | **RESPONDIDA 12-oct:** URL exacta https://blazeleiton.carrd.co/ , abierta directamente | Se resuelve identidad/URL; sólo la disparidad entre snapshots del contenido queda pendiente como Q-09 |
| Media | Q-05 | Para auditar **X** por enlace real sin búsquedas indexadas, ¿puedes facilitar enlaces de publicaciones recientes o acceso a una exportación autorizada? | X directo 403 |
| Suficiente por ahora | Q-06 | El ICS archivado **ya es el más reciente** y no se han hecho cambios; no se necesita nueva exportación | CONFIRMADO_USUARIO. Twitch `/schedule` sigue sin lectura web directa, pero el archivo actual basta para la conciliación hasta que existan cambios |
| Baja | Q-07 | ¿Se conserva la estrategia de perfiles «cerrados salvo revisión lore/imagen»? | Sólo preguntar si usuario solicita cambios, no reabrir por defecto |
| Baja | Q-08 | ¿Se eligió ya el formato/plataforma y permisos de una posible cobertura del GP México? | Plan opcional, no anunciar sin decisión |

No exigir responder todo antes de continuar con otros trabajos. Priorizar un par de preguntas relacionadas con la acción activa; mantener el resto documentado como pendientes y auditar nuevas fuentes antes de preguntarlas.

## Actualización de resolución — 2026-10-12 · confirmación explícita del usuario (Stage 4)
Q-01 y Q-02 ya no deben plantearse como dudas sin respuesta. Para Azur 21/22 sólo faltaría decisión **posterior** sobre hora y confirmación editorial si se quiere anunciar. Para Cake Song la decisión está clara (demo pendiente); el **trabajo** sigue sin completarse. Conservar Q-03 a Q-08 sin modificación ni inferencia.

## Cuarta auditoría — preguntas añadidas (12-oct-2026)
| Prioridad | ID | Pregunta | Por qué importa |
|---|---|---|---|
| Resuelta | Q-09 | **RESPONDIDA por el usuario:** el Carrd actualmente visible en su navegador muestra «Acercando a México y al mundo», **con Instagram** | Priorizar esta observación directa sobre snapshots automatizados discordantes; no modificar perfil |

**Q-01/Q-02 y Q-04 resueltas/respondidas.** No volver a preguntar sobre ambas reservas Azur 21/22, demo Cake ni URL Carrd. Q-06 es la solicitud principal para prueba de Twitch. Q-09 es una aclaración menor de caché; no suspender otros proyectos por ella.

## Aclaración final del ciclo de cuarta auditoría — Stage 4, 12-oct-2026
- **Q-09 RESUELTA (CONFIRMADO_USUARIO):** Carrd en navegador del usuario = «Acercando a México y al mundo», **con Instagram**. El otro snapshot queda archivado como observación histórica de caché, no alternativa vigente ni error por corregir.
- **Q-06 APLAZADA A PETICIÓN DEL USUARIO:** el `.ics` o enlace reciente del calendario de Twitch se abordará **después**, sin recordatorio ni solicitud insistente en este punto. La verificación externa de Twitch sigue incompleta. No interpretar «después» como cancelación de directos, ausencia de programación ni autorización para actualizar horarios.
- Sin cambios de perfiles, Terminal, calendario editorial, archivos privados o automatizaciones; Stage 4 sigue ABIERTA.

## Rectificación de la solicitud de ICS y comando — 12-oct-2026 (PREVALECE)
El usuario precisó que **el ICS archivado es el más reciente; no se ha modificado la programación desde su exportación**. Q-06 queda **CERRADA POR SUFICIENCIA DE LA FUENTE EXISTENTE**, no meramente «pospuesta» ni «pendiente de que aporte uno nuevo». En futuras revisiones usar el ICS conocido sin pedir exportación nueva; reabrir sólo si el usuario avisa de un cambio o existe evidencia posterior que lo contradice. `/schedule` en Twitch sigue sin verificarse en vivo mediante herramienta.

Q-09 Carrd permanece RESUELTA; Q-01 ambas reservas Azur 21/22 sin hora; Q-02 demo Cake Song pendiente. No reinterpretar ninguna de ellas.

Se establecieron `Ejecuta Relight Respark` y `Execute Relight Respark` como comandos equivalentes para iniciar KGRP íntegro. Nuevos descubrimientos de la sesión se documentan incrementalmente sin necesidad de reactivar toda la auditoría.

## Stage 5 — verificaciones técnicas (sin reabrir preguntas editoriales)
- **Q-10 · API pública:** verificar desde navegador `/api/public` en lectura con revisión 1 y 6 orígenes `twitch` + 4 `manual`. Último acceso externo con herramientas `NO_VERIFICABLE`. No requiere credenciales ni nueva publicación.
- **Q-11 · Match YouTube:** por resolver en simulación con fixtures: coincidencia de canal/video, título similar, colaboraciones, stream reprogramado y múltiples candidatos. Ninguna pregunta al usuario necesaria antes de crear pruebas aisladas.
