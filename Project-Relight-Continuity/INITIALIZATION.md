# Arranque integral obligatorio — KGRP / Project Relight

**Versión:** KGRP v3.2 — 2026-10-12. Sustituye el antiguo uso de «REANUDAR rápido». Se aplica al inicio de **cada nueva conversación del Proyecto** al solicitar trabajo sobre Project Relight, Stage N, Blaze/ KGBlaze. No confundir etapas con módulos ni sesiones auxiliares.

## Principio
Revisión profunda **siempre**, pero sin bloquear indefinidamente una tarea urgente ni afirmar conocimiento literal de chats inaccesibles. Entregar diagnóstico completo basado en evidencia y avanzar con la petición activa. Documentar etapas que no tengan cierre formal, incluso si el usuario no pidió `KGRP: CIERRE`.

## Fase 0 — Identidad, integridad y privacidad
- Leer `STAGES/index.json` y verificar 1..N, ficheros, estado abierto, SHA GitHub. Determinar si la conversación actual es una **etapa nueva explícita** (no inventar Stage N+1).
- La recuperación ocupa **`Project-Relight-Continuity/`**; nunca modificar código o D1 en `KGBlaze-Information-Center/` sin solicitud separada.
- Repo público: sólo documentos saneados y enlaces. No publicar analíticas de ingresos, archivos privados, datos personales de agendas o material externo protegido.
- Última instrucción del usuario, limitaciones de permisos y tareas en curso tienen prioridad de rescate.

## Fase 1 — Historia exhaustiva de Stage 1..N
- Leer `PROTOCOL.md`, todas las fichas `STAGES/STAGE-XX.md`, `HANDOFFS/CURRENT.md`, `DECISIONS.md`, `QUESTIONS.md`, historial accesible y `AUDIT.md`.
- Extraer decisiones, por qué se tomaron, en qué ámbito, revisiones, instrucciones que las sustituyen, versiones y archivos. No confundir «fase terminada» con «chat con último tramo archivado».
- Por cada chat sin cierre, tratarlo como **INCONCLUSO EN EVIDENCIA**, buscar último mensaje, herramienta o solicitud realmente concluida; etiquetar `TRUNCADO` si sólo hay resumen.

## Fase 2 — Archivo y plantillas
- Consultar `SOURCES/FILE_REGISTRY.md` y `TEMPLATES/README.md`; buscar originales en Biblioteca, Project files y documentos autorizados.
- Inventariar HTML/CSV/XLSX/PPTX/PDF/DOCX/PNGs, versiones, fechas, formatos, duplicados, límites y copias realmente autorizadas.
- Comparar v23.11 con maestro previo si la tarea afecta Terminal; nunca confundir `EXISTE`, `LEÍDO`, `PROBADO`, `DESPLEGADO`.
- Clasificar plantilla como `MAESTRO_ORIGINAL`, `RECONSTRUIDA`, `HISTÓRICA`, `VERIFICADA_EN_PUBLICACIÓN`, `REEMPLAZADA`.
- Preservar créditos, permisos, atribución y materiales de terceros fuera de repositorio público.

## Fase 3 — Verificación pública por fuentes DIRECTAS
- Abrir URL exacta/ID confirmado del canal, video, perfil, stream, reel, post o invitación; **no usar búsqueda indexada como sustituto de una URL conocida**.
- Si un portal bloquea acceso, consultar un proveedor con ID exacto permitido y registrar `TERCERO` con fecha; marcar `BLOQUEADO` sin inventar actividad. Fuentes agregadoras pueden ser antiguas.
- Revisar YouTube Videos / Streams / Shorts / Playlists, descripciones y créditos; Twitch perfil/calendario/VODs/links; X posts conocidos, Instagram posts/reels/bio, Ko-fi, Discord, HoloList, vTubie, Carrd cuando exista URL comprobada.
- Comparar publicación real con plantillas de covers, directos, X y paneles; no reabrir perfiles previamente cerrados salvo evidencia grave o autorización del usuario.
- Para números y CTR usar `SOURCES/DIRECT_SOURCE_POLICY.md`: ventana, unidad, tipo de contenido y snapshot; si son incompatibles reportar **NO COMPARABLE**.

## Fase 4 — Conciliación temporal y de decisiones
- Abrir `SOURCES/CALENDAR_RECONCILIATION.md`, comparar ICS, editor, XLSX de distintas fechas, última instrucción y evidencias públicas por ID.
- Matriz `REALIZADO / PUBLICADO / PROGRAMADO / RESERVADO / PROVISIONAL / CANCELADO / DESCONOCIDO` con fecha de corte, plataforma, enlaces y nivel de prueba.
- Un evento programado no es emitido. Un video publicado no demuestra por sí mismo horario de Twitch ni cierre final en vivo.
- Respetar privacidad de calendario; no incorporar compromisos personales al visor público.
- Identificar qué tareas concluyeron, cuáles siguen abiertas, riesgos de deadlines, blockers y conflictos.
- Confrontar prioridades históricas: Cake Song plazo, contenido editorial de X, Pokémon Journey noviembre, entrega externa cerrada, no reabrir lo aprobado sin razón.

## Fase 5 — Auditorías y pruebas de contradicciones
- Ejecutar pruebas de índices, regresiones y consistencia que no requieran secreto; contrastar SHA y cambios reales vs resúmenes.
- Si hay dudas, reproducir / probar. Cuando falten navegador/HTML binario, OAuth o permisos, dejar prueba `NO EJECUTADA`, motivo y mínima vía de resolución.
- Controlar false positives por identidad de otros creadores, fechas UTC vs CDMX, caches, cambios de definición de YouTube Analytics, duplicados de Biblioteca y material de terceros.

## Fase 6 — Entrega y persistencia
Generar informe con:
1. Cronología Stage 1..N y último tramo potencialmente inconcluso.
2. Tabla de decisiones vigentes/sustituidas y fuentes.
3. Inventario de archivos, versiones y plantillas.
4. Verificación pública de perfiles/publicaciones con URL/ID y limitaciones.
5. Calendario reconciliado y pendientes clasificados.
6. Métricas comparables/no comparables y metodología.
7. Hallazgos/pruebas y **preguntas pertinentes** (consultar `QUESTIONS.md`).
8. Estado GitHub, próximos pasos y acción actual continuada.

Guardar informe de nueva pasada, actualizar `HANDOFFS/CURRENT.md`, `DECISIONS.md`, archivos de etapas y control de pruebas, sin copiar material privado al repositorio.

## Al terminar cada chat
Intentar registrar delta de instrucciones y cambios, pero no depender de detectar límite de tokens. En el chat siguiente **reconstruir retrospectivamente** cualquiera que no tenga cierre comprobable.

## Verificación mínima
Las fases 0–6 **deben evaluarse en cada nuevo chat**. Si una etapa depende de una herramienta inaccesible se marca `BLOQUEADA` con fuente alternativa intentada, no se omite en silencio. El informe puede ser conciso al usuario tras ejecutarse en profundidad, pero no debe ser superficial en la investigación.

## Activador literal
`KGRP: INICIALIZAR PROJECT RELIGHT — Stage 1..N, chats inconclusos, auditoría histórica+archivística+pública+calendario, métricas y plantillas por fuentes directas, comprobaciones y preguntas pertinentes; continuar desde último punto comprobado.`

## Anexo v3.1 — mejoras tras cuarta auditoría (12-oct-2026)
- **Antes de concluir inaccesibilidad:** abrir exactamente las rutas específicas facilitadas por el usuario, p. ej. `twitch.tv/blazeleiton/about`, `/schedule`, `/videos`. Si el sitio devuelve HTML vacío/bloqueo, no inventar datos ni confundir falta de contenido con ausencia de streams. Registrar lista de URL/ruta efectivamente intentadas.
- Identificar perfiles por enlaces verificados: Carrd canónica `https://blazeleiton.carrd.co/` (YA RESUELTA); comprobar que contenido cacheado pueda variar y no marcar un enlace ausente en un snapshot como defecto vigente sin verificación estable.
- En YouTube, si acceso a cuenta autorizado, usar metadatos `actualStartTime`/`actualEndTime` para afirmar transmisión; distinguirlos de `scheduledStartTime` y `publishedAt`. No usar video privado como evidencia pública ni divulgar su ID.
- La comparación de Analytics compara **dos ventanas explícitas con unidades y formato** (Video, Live, Shorts, engagedViews y watch time); se pueden normalizar métricas por día para evitar tamaños desiguales, pero no atribuir causas a corto plazo.
- Revisar tareas automáticas existentes **en lectura**, cuando se requiera comprobar si el monitoreo sigue funcionando; no duplicar, modificar horarios ni habilitar notificaciones/email por defecto.
- En archivo Steam cruzar seis CSV personal/wishlist/familia, disponibilidad real y precios MXN; no recomendar compra duplicada, ni tratar juegos transmitidos como terminados.
- Releer `AUDITS/FOURTH-PASS-2026-10-12.md` junto a las tres pasadas anteriores en futuras Stage. No volver a preguntar Q-01/Q-02/Q-04.

## Disparador canónico v3.2 — Relight Respark (2026-10-12)
**Ejecuta Relight Respark** y **Execute Relight Respark** son comandos equivalentes. Se aceptan indistintamente en español o inglés, sin necesidad de la cadena larga `KGRP: INICIALIZAR PROJECT RELIGHT`, que se conserva como alias legado.

Al recibir cualquiera de las dos frases de forma inequívoca, **ejecutar** las fases 0–6 de este archivo; recuperar Stage 1..N, chats inconclusos, decisiones, originales y plantillas, fuentes públicas directas, métricas comparables, calendarios, pruebas, preguntas pendientes y último handoff. No basta con explicar el comando: debe aplicarse a la tarea activa y documentar bloqueos.

Durante el trabajo cotidiano, **no lanzar por defecto toda la auditoría profunda por cada mensaje**: incorporar de manera incremental cualquier nuevo hallazgo, modificación, confirmación o corrección al protocolo, registro de decisiones, etapa y handoff cuando el dato sea material y los permisos lo permitan. Preservar histórico y citar evidencia, sin modificar código, cuentas, perfiles, calendarios operativos ni automatizaciones salvo encargo autorizado.

Si el Proyecto está configurado para inicialización automática, se mantiene esa política al abrir una nueva conversación. El comando manual sirve para solicitar una nueva ejecución integral en cualquier momento; **la documentación GitHub por sí sola no cambia la configuración de ChatGPT Project**.

**Aclaración prevalente Twitch:** el usuario confirma que el archivo ICS disponible de 10-oct es el **más reciente y no ha sido modificado**. No solicitar otro, salvo noticia de un cambio, necesidad concreta o decisión posterior del usuario. Su vigencia editorial confirmada por el usuario NO constituye una lectura nueva de `twitch.tv/blazeleiton/schedule`, que sigue inaccesible.
