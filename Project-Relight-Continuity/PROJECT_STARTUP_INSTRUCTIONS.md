# Instrucciones persistentes de recuperación para el proyecto Project Relight

Este texto está preparado para copiar a las instrucciones del Proyecto en ChatGPT **si el propietario quiere activarlo como comportamiento por defecto**. Guardarlo en GitHub por sí solo no cambia la configuración de ChatGPT.

## Regla general

Ante CUALQUIER nueva conversación, continuación de una etapa o solicitud de recuperar contexto sobre KGBlaze/Project Relight, comienza recuperando de forma **extensa, profunda y retrospectiva** el historial disponible de todas las etapas Stage 1..N, sin excepción por antigüedad. Lee el protocolo independiente `BlazeLeiton/KGBlaze/Project-Relight-Continuity/PROTOCOL.md`, el índice `STAGES/index.json`, las fichas de etapas, el handoff actual y el registro de decisiones. Integra las instrucciones más recientes sin borrar las antiguas.

No existe cierre automático fiable por límite de tokens. Al abrir cualquier conversación nueva, considera **inconclusos** todos los chats que no tengan cierre formal verificable. Recupera sus mensajes finales, peticiones pendientes, herramientas a mitad, versiones entregadas, decisiones no ejecutadas y errores; no esperes a que el usuario haya pedido un cierre.

Si existen contradicciones, incertidumbre técnica, discrepancias de versiones o evidencia incompleta, realiza auditoría con fuentes y pruebas cuando sea posible. Separa SOLICITADO, APROBADO, IMPLEMENTADO, PROBADO, DESPLEGADO. Deja pruebas imposibles como NO EJECUTADAS, con motivo.

Cuando haya una nueva etapa real Stage N+1, agréguela al registro preservando Stage 1..N y ajustando el handoff. Nunca inventes etapas ni cierres. La recuperación no debe mezclarse con el desarrollo de `kgblaze-terminal`: todo el conocimiento de continuidad se archiva en `Project-Relight-Continuity/`, independiente del aplicativo `KGBlaze-Information-Center/`.

Al terminar la recuperación, devuelve el mapa histórico, pendientes inconclusos, pruebas realizadas, dudas y siguiente punto ejecutable; luego continúa la tarea activa. No digas que conoces todos los chats si sólo se dispone de resúmenes.

## Comando manual de rescate
`KGRP: REANUDAR KGBlaze — todas las etapas Stage 1..N, conversaciones inconclusas y auditorías obligatorias ante dudas.`

## Regla de arranque vigente — KGRP v3.0 (prioritaria)
**ATENCIÓN: esta sección amplía y prevalece sobre cualquier versión resumida anterior.**
Al iniciar **cualquier nueva conversación** dentro de Project Relight, aun sin comando manual, consulta:
`https://github.com/BlazeLeiton/KGBlaze/blob/main/Project-Relight-Continuity/INITIALIZATION.md`
y ejecuta **todas** sus fases 0–6: integridad y custodia; historia completa Stage 1..N y últimas intervenciones inconclusas; originales/plantillas; contraste de perfiles y publicaciones por enlace/ID directo; calendario editorial contra emisiones verificadas; métricas internas vs públicas comparables; auditorías/pruebas; preguntas necesarias; persistencia de conclusiones.

Consulta también `STAGES/index.json`, todas las fichas Stage, `HANDOFFS/CURRENT.md`, `DECISIONS.md`, `QUESTIONS.md`, `TEMPLATES/README.md`, `SOURCES/CALENDAR_RECONCILIATION.md` y el informe `AUDITS/THIRD-PASS-2026-10-12.md`.

Nunca inventes acceso a plataformas bloqueadas, cumplimiento de créditos, estado de transmisiones ni archivo materializado. No reabras perfiles cerrados sin motivo/orden. Respeta el nombre de producto `Terminal`, pero mantén todo el sistema de recuperación separado del código de Terminal y excluye datos privados del repositorio público.

Si la conversación actual NO ha sido designada Stage N+1 por el usuario o no existe evidencia de nueva etapa, considérala una sesión del Stage en curso; no avances índice automáticamente por cambiar de chat. Sólo registrar una nueva etapa real.

**No bloquear la tarea solicitada por una recuperación interminable:** ejecutar toda fase aplicable con evidencia disponible, informar vacíos, pedir sólo preguntas esenciales y continuar. No se puede cambiar la configuración real del Proyecto desde GitHub; para aplicar esta regla automáticamente hay que pegarla en las instrucciones del Proyecto dentro de ChatGPT.

Comando alternativo de emergencia:
`KGRP: INICIALIZAR PROJECT RELIGHT — ejecutar las fases 0–6 de INITIALIZATION.md y recuperar Stage 1..N, chats inconclusos, plantillas, perfiles, calendario, métricas y auditorías.`

## Activación por frase — Relight Respark (regla vigente)
Si el usuario escribe **«Ejecuta Relight Respark»** o **«Execute Relight Respark»**, activar inmediatamente el KGRP integral de `INITIALIZATION.md`, fases 0–6, sin pedir que repita el procedimiento ni el comando antiguo. Ambas fórmulas son sinónimas; registrar evidencia, límites y pendientes, y continuar el trabajo actual.

En conversaciones habituales de Project Relight, cualquier información nueva que aparezca y sea importante para la continuidad debe añadirse de modo incremental al protocolo/documentos de GitHub accesibles. No volver a ejecutar todo el análisis con cada comentario cotidiano.

El ICS Twitch archivado sigue siendo **el más reciente, sin cambios posteriores según confirmación del usuario**; no pedir otro como condición de inicio. Conservar separadas esa confirmación editorial y la imposibilidad de abrir `/schedule` directamente. No tocar Terminal ni otros sistemas sin solicitud explícita.

**Nota de configuración:** copiar este texto a las instrucciones de Project Relight en ChatGPT habilita su interpretación en nuevos chats; un commit de GitHub no cambia esas instrucciones automáticamente.
