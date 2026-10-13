# Continuidad sin saturar los chats — Project Relight
**Adopción:** 2026-10-12, Stage 4 (ABIERTA). **Ámbito:** exclusivamente `Project-Relight-Continuity/`, no Terminal ni Cloudflare.

## Diagnóstico: conversación, contexto y evidencia son cosas distintas
- La ventana de contexto del modelo es finita y se expresa en tokens. Una conversación muy extensa, sus respuestas, herramientas y archivos grandes pueden agotar antes el espacio útil o volverla lenta. El número exacto disponible para este chat y el momento preciso de agotamiento **no son visibles ni se pueden predecir de forma fiable**.
- Un chat nuevo no hereda literalmente todo el historial, incluso si se conserva en el Proyecto. La memoria y la recuperación de chats ayudan, pero no garantizan la recuperación de cada turno ni del código exacto.
- En KGBlaze crece el volumen por duplicación de auditorías, transcripciones, grandes HTML, listados de archivos y revisión completa 0–6. La aparición de un límite en menos turnos **puede** deberse al volumen de información procesada por turno; no se ha probado que ChatGPT haya reducido específicamente su límite de mensajes.
- Diferenciar **límite de contexto**, **límite de mensajes/uso del modelo**, **fallo/rendimiento de la interfaz** y **ausencia de un archivo fuente**. No atribuirlos a una sola causa sin síntoma verificable.

## Cuatro capas de contexto (sin sustituir una por otra)
1. **Fuente técnica autoritativa:** el código y commits en `KGBlaze-Information-Center/`; pruebas y despliegue se acreditan por separado. El editor privado permanece en Biblioteca, nunca aquí.
2. **Archivo histórico profundo:** `STAGES/STAGE-01..N.md`, `DECISIONS.md`, `AUDITS/`, `SOURCES/` y `TEMPLATES/`. Conservar decisiones reemplazadas, evidencia, límites y detalles suficientes para auditoría.
3. **Punto de reanudación breve y actualizado:** `HANDOFFS/CURRENT.md` como handoff acumulativo, más los últimos bloques de la ficha del Stage actual. Evitar múltiples descripciones contradictorias; el hecho reciente prevalece con alcance delimitado.
4. **Memoria y conversaciones de ChatGPT:** fuentes auxiliares para rescatar deltas y citas originales cuando estén accesibles, nunca sustitutas de archivos o commits verificables.

## Procedimiento de trabajo en cada conversación
- **Arranque — Relight Respark:** ejecutar fases 0–6 de `INITIALIZATION.md`, leer todas las etapas y sus deltas, contrastar fuentes según procedencia, revisar auditorías existentes antes de repetir consultas caras. Evaluar cada fase, no volver a copiar en el chat todo el contenido histórico. Si nada cambió en una fuente comprobada hoy, citar la verificación previa y su fecha, marcando la actualidad no revalidada.
- **Trabajo ordinario:** modificar sólo el tema activo; actualizar incrementalmente la ficha Stage vigente, `DECISIONS.md`, `HANDOFFS/CURRENT.md` y fuentes afectadas. No iniciar Respark íntegro con cada mensaje, conforme a REL-047.
- **Micro-traspaso tras hitos significativos:** resumir en el archivo correspondiente: solicitud literal o reconstruida etiquetada, decisión y sustitución, archivos tocados, commit/SHA, pruebas sí/no, despliegue sí/no, pendientes y siguiente acción. Hacerlo al cerrar una modificación importante, tras un fallo de herramienta, al abandonar un subtema o cuando se observe degradación de un chat. No depender de una cuenta arbitraria de mensajes.
- **Nuevo chat/Stage:** un nuevo chat NO implica nueva Stage. Sólo añadir Stage N+1 si el usuario la declara o existe evidencia inequívoca. Mantener el Stage anterior ABIERTO si no hubo cierre documentado. El siguiente Respark debe rescatar retrospectivamente el último tramo.
- **Al cerrar:** `KGRP: CIERRE` es útil como instrucción explícita de traspaso, pero no es indispensable; no existe detector automático fiable de proximidad al límite. `KGRP: EMERGENCIA` rescata un corte sin cierre.

## Formato compacto de delta por operación
```text
Fecha / Stage / tema / fuente:
Pedido:
Decisión vigente (y lo reemplazado):
Cambios efectivos: archivo o recurso + commit/version + enlaces verificables
Pruebas: ejecutada / pendiente / fallida (+ evidencia)
Producción: desplegado / no desplegado / no verificable
Privacidad:
Pendiente prioritario:
Siguiente paso que no debe repetirse:
```

## Evitar repetición innecesaria
- No pegar HTML de megabytes o largas transcripciones en cada turno; conservar referencia/versión, recuperar sólo fragmentos relevantes al problema y verificar su fuente.
- No reeditar todo el historial de Stage 1..N por una única corrección menor; añadir un delta con procedencia y actualizar sólo índices pertinentes, **sin suprimir** el historial profundo.
- Mantener separado lo **SOLICITADO**, **APROBADO**, **IMPLEMENTADO**, **PROBADO** y **DESPLEGADO**; distinguir editor local, visor, Worker, D1, calendario editorial y fuentes externas.
- Privacidad: no publicar en GitHub Analytics privado, calendario personal, transcripciones no saneadas, editor local, credenciales, videos privados ni originales ajenos.
- Evitar repetir preguntas respondidas (Azur Lane 21 y 22 sin hora, demo Cake pendiente, Carrd confirmado, ICS Twitch sin cambios).

## Control de continuidad
Antes de comenzar un chat nuevo o tarea riesgosa, comprobar: (a) índice 1..N, (b) handoff reciente y SHA, (c) correcciones vigentes, (d) último tramo no archivado, (e) si los resultados provienen de código/pruebas reales o sólo de un relato, (f) qué fuente debe volver a comprobarse hoy. Si faltan herramientas u originales, documentar el bloqueo; no completar con conjeturas.

**Beneficio esperado:** menos saturación por repeticiones dentro del chat y recuperación más robusta entre chats. **No promete** ampliar el límite técnico de la conversación ni garantizar disponibilidad perpetua de herramientas/archivos.

## Estado de la adopción
Esta política se incorporó documentalmente durante Stage 4 a raíz de la solicitud explícita de Relight Respark con prevención del agotamiento acelerado de longitud de chats. No cambia por sí sola las instrucciones configuradas en ChatGPT Project ni instala automatizaciones. Para que el protocolo funcione de forma automática en toda nueva conversación, las instrucciones del Proyecto deben seguir apuntando a `INITIALIZATION.md` y a este documento.
