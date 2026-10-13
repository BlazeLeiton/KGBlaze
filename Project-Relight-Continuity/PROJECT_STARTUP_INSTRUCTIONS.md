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
