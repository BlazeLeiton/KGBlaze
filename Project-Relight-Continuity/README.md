# Project Relight — Continuidad / KGRP v3.0

**Sistema independiente para recuperar toda la historia de KGBlaze entre chats.**
Fecha de establecimiento: 2026-10-12. Zona: America/Mexico_City.

## Reglas no negociables

1. La recuperación **siempre es extensa, profunda y retrospectiva**, incluso si la solicitud dice solamente «continuemos». Nunca usar un resumen rápido como sustituto.
2. Cubrir **Stage 1, Stage 2, Stage 3 y cada Stage posterior**, sin eliminar etapas anteriores ni rellenar vacíos con conjeturas.
3. Recuperar cualquier conversación **sin cierre formal** como potencialmente **INCONCLUSA**: sus últimas instrucciones, errores, acciones a mitad de camino, archivos y tareas no verificadas tienen prioridad de revisión.
4. Si hay dudas o contradicciones, **ejecutar auditoría de evidencia y pruebas reproducibles cuando sea posible**. No dar por hecho que código/documentación implica comportamiento en producción.
5. Diferenciar SOLICITADO / APROBADO / IMPLEMENTADO / PROBADO / DESPLEGADO y REEMPLAZADO; conservar razón y procedencia.
6. Una corrección explícita reciente del usuario prevalece sobre decisiones anteriores **en el alcance afectado**.
7. **Aislamiento estricto**: este directorio no forma parte de `KGBlaze-Information-Center/` ni de su Worker, editor, frontend o D1. Documentar referencias a Terminal no convierte la documentación de continuidad en código de Terminal.
8. Los archivos del repo son **públicos**: no publicar transcripciones privadas, métricas confidenciales, secretos, editor operativo local, respaldos de administración ni credenciales.
9. No confiar en que el contexto completo o los archivos previos estén accesibles en cada conversación; declarar limitaciones, intentar fuentes alternativas y trabajar sobre evidencia comprobable.

## Activación en cualquier conversación nueva

`KGRP: REANUDAR KGBlaze — recuperación integral obligatoria, incluye Stage 1..N y chats inconclusos. Audita las dudas.`

Leer en orden:
1. `PROTOCOL.md`
2. `STAGES/index.json` → detectar el máximo Stage N existente y cualquier etapa con cierre no acreditado
3. Todos los archivos `STAGES/STAGE-XX.md` ordenados por número, **sin saltar los viejos**
4. `HANDOFFS/CURRENT.md` y registros de cambios
5. `DECISIONS.md`, `AUDIT.md` y `SOURCES.md`
6. Comparar con los archivos/commits correspondientes si el trabajo requiere verificación técnica

Los informes de recuperación deben detallar **origen, fechas, versiones, conflictos, certeza, pendientes y último mensaje o acción disponible**.

## Índice
- [Protocolo profundo](PROTOCOL.md)
- [Etapas — índice dinámico](STAGES/index.json)
- [Stage 1](STAGES/STAGE-01.md) · [Stage 2](STAGES/STAGE-02.md) · [Stage 3](STAGES/STAGE-03.md) · [Stage 4](STAGES/STAGE-04.md)
- [Traspaso actual y pendientes](HANDOFFS/CURRENT.md)
- [Decisiones y sustituciones](DECISIONS.md)
- [Auditoría y pruebas](AUDIT.md)
- [Fuentes y privacidad](SOURCES.md)
- [Plantilla de siguiente etapa](TEMPLATES/STAGE.md)
- [Plantilla de traspaso sin cierre](TEMPLATES/HANDOFF.md)

## Límite importante
Este directorio fija un procedimiento verificable, **no** da acceso mágico a conversaciones cuyo texto no esté disponible. No existe detector fiable del límite de tokens del chat. Por eso la recuperación de etapas inconclusas es **siempre** obligatoria al reanudar, aun sin `KGRP: CIERRE`.

## Comprobador local del índice (independiente de Terminal)
Desde el directorio `Project-Relight-Continuity/` de una copia del repositorio:

```bash
python scripts/kgrp.py audit
python scripts/kgrp.py add-stage --title "Título de Stage 4" --source "Enlace o evidencia de la conversación Stage 4"
```

La segunda orden **sólo se usa cuando existe una nueva etapa real**; crea automáticamente el siguiente número, el archivo, la entrada del índice y una nota en el handoff, sin sobrescribir etapas antiguas. No crea Stage 4 por ejecutar la recuperación actual. Tras agregar, se deben completar las evidencias y archivar los cambios en Git. Las pruebas de esta herramienta se ejecutaron sobre un registro temporal: índice 1..3 válido, alta de Stage 4, rechazo de fuente vacía y detección de archivo faltante.

- [Instrucciones para activar recuperación por defecto en un Proyecto ChatGPT](PROJECT_STARTUP_INSTRUCTIONS.md) — requieren pegarse en las instrucciones del Proyecto; el archivo GitHub no configura ChatGPT automáticamente.

## Recuperación más reciente
- [Informe detallado de apertura Stage 4 (12-oct-2026)](AUDITS/RECOVERY-2026-10-12-STAGE-04.md)

## Segunda auditoría (Stage 4)
- [Informe de segunda revisión y evaluación v23.11](AUDITS/SECOND-PASS-2026-10-12.md)
- [Catálogo recuperable de archivos por formato](SOURCES/FILE_REGISTRY.md)
- [Método de contrastes y métricas por enlaces directos](SOURCES/DIRECT_SOURCE_POLICY.md)
- [**Índice de plantillas existentes y reconstruidas**](TEMPLATES/README.md)

## KGRP v3.0 — ARRANQUE INTEGRAL (vigente)
La tercera auditoría consolidó historia, archivos, perfiles, publicaciones, calendario, métricas, pruebas y preguntas en un procedimiento obligatorio al comenzar cada conversación de Project Relight:
- [**INITIALIZATION.md — procedimiento completo de fases 0–6**](INITIALIZATION.md)
- [**PROJECT_STARTUP_INSTRUCTIONS.md — texto para configurar las instrucciones de ChatGPT Project**](PROJECT_STARTUP_INSTRUCTIONS.md)
- [Tercera revisión de perfiles, publicaciones y calendario](AUDITS/THIRD-PASS-2026-10-12.md)
- [Perfiles oficiales/directorios y accesibilidad](SOURCES/PUBLIC_PROFILES.md)
- [Publicaciones YouTube comprobadas por video ID](SOURCES/PUBLIC_PUBLICATIONS.md)
- [Conciliación de calendarios y jerarquía de decisiones](SOURCES/CALENDAR_RECONCILIATION.md)
- [Preguntas pendientes priorizadas](QUESTIONS.md)
- [Plantilla separada de directos](TEMPLATES/LIVE_STREAMS.md)

**Implementación efectiva:** repositorio y documentación actualizados, pero GitHub por sí solo **no instala instrucciones en ChatGPT**. El usuario debe pegar una vez el texto de `PROJECT_STARTUP_INSTRUCTIONS.md` en las instrucciones de su Proyecto. Sin ese paso, se puede invocar `KGRP: INICIALIZAR PROJECT RELIGHT` manualmente. La recuperación jamás publica originales privados ni modifica Terminal automáticamente.

## Cuarta revisión y cierre del ciclo de auditoría inicial
- [**Cuarta revisión integral de Carrd, Twitch, YouTube autenticado, archivos, métricas y vigilancia**](AUDITS/FOURTH-PASS-2026-10-12.md)
- URL Carrd verificada: https://blazeleiton.carrd.co/ ; Twitch /about y /schedule se intentaron y **no pudieron leerse**.
- El protocolo añade anexo v3.1 a `INITIALIZATION.md`, sin cambiar estructura de etapas ni software Terminal.

## Comando de recuperación «Relight Respark»
**Español:** `Ejecuta Relight Respark` · **English:** `Execute Relight Respark`. Ambas frases equivalen a ejecutar `INITIALIZATION.md` fases 0–6 y recuperar todo Stage 1..N. El comando antiguo KGRP sigue disponible como alias.

Los nuevos datos que surjan durante una conversación de Project Relight se registran incrementalmente, sin volver a ejecutar todas las auditorías ante cada comentario. Para nuevos chats, incorporar `PROJECT_STARTUP_INSTRUCTIONS.md` a las instrucciones del Proyecto o usar explícitamente el comando.

**Twitch:** el último ICS archivado es el **más reciente y sin modificaciones posteriores, confirmado por el usuario**. Q-06 no exige otro archivo actualmente; la página web `/schedule` continúa sin lectura directa.

## Preservación de contexto entre chats (Stage 4)
- [`CONTEXT-CONTINUITY.md` — política anti-saturación](CONTEXT-CONTINUITY.md): cómo mantener historia profunda y un handoff vigente sin pegar archivos enormes ni repetir auditorías en cada turno; límites reales, señales de cambio de chat y deltas verificables.
- **Relight Respark sigue siendo profundo** al invocarse o al arranque configurado. La mitigación consiste en recuperar en fuentes y mostrar síntesis con referencias; tras el arranque, integrar cambios incrementales, sin inventar un detector de límite del chat ni crear Stage N+1 por cada conversación.
