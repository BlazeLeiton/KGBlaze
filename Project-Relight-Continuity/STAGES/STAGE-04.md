# Stage 4 — Recuperación profunda y continuidad de Project Relight

**Inicio confirmado por el usuario:** 2026-10-12 (America/Mexico_City).
**Estado:** ABIERTA / `closure_verified: false`.
**Fuente:** conversación actual, instrucción explícita «ejecuta la recuperación y vamos a comenzar con esta conversación como Stage 4». Sin URL privada archivada en repo público.

## Misión
Ejecutar el protocolo profundo KGRP v2: reconstruir Stage 1–3 incluyendo sus temas inconclusos; contrastar archivos/commits; auditar dudas, sin mezclar este registro de continuidad con `KGBlaze-Information-Center/` (Terminal). Cada Stage futuro se añade sin borrar anteriores.

## Auditoría inicial (primera recuperación)
Se leyeron las fichas Stage 1/2/3, el índice, el handoff, registro de decisiones, protocolo y auditoría. Se consultó contexto recuperable anterior y documentos GitHub.
- Stage 1: auditoría externa YouTube/Twitch reportada completada por el usuario; estrategia `IP puerta → Blaze hogar`; siete paneles eran seis originales más uno opcional, **no declarar los siete publicados**.
- Stage 2: editor privado con JSON, importación arrastrable, limpieza de campos, limpiar semana distinto de HIATUS, .ics, PNG/GIF y ES/EN/JA. Se recuperaron evidencias de variantes v13 y v23.5 y referencia histórica a v23.1.
- Stage 3: visor público versionado, API Worker y D1 configurados. Código publicado en GitHub, pero README actual dice sin desplegar y sin consultas YouTube/Twitch. El cron está intencionalmente desactivado.
- Decisión matizada: se había rechazado el uso de sincronización en un **póster/horario estático**; luego se acordó un **visor público dinámico**, distinto del editor y de la tarjeta PNG. El cambio visual `POR CONFIRMAR → A TIEMPO` requiere match YouTube fiable, sin mutar el editor privado. No inferir que fue implementado ni desplegado.
- Prioridad por plataforma: Twitch-only consulta Twitch; YouTube-only consulta YouTube; dual prioriza YouTube. EN VIVO conduce a la plataforma correspondiente. `complete` de YouTube confirma cierre; Twitch-only usa 15 min de gracia tras fin confirmado, nunca ante fallo de red.
- Restricciones por fecha/hora: eventos futuros admiten todos los estados; tras 4 h no admitir POR CONFIRMAR ni A TIEMPO; CANCELADO sólo por el editor. Detalles completos y pruebas: `AUDITS/RECOVERY-2026-10-12-STAGE-04.md`.
- Corrección nominal vigente: **Terminal**, sin letras. La base física `kgblaze-terminal` conserva nombre técnico.
- Versiones de editor privado: v23.5 aprobada como base en un punto anterior; el registro documenta v23.9 y referencia v23.11 local. No inferir superioridad funcional de la última sin archivos y pruebas comparadas.

## Criterios de evidencia
`HISTORICO_RECUPERADO` para contexto de chats/recuerdos; `VERIFICADO_CODIGO` para rutas inspeccionadas en repositorio; `DOCUMENTADO_NO_DESPLEGADO` para estado de Cloudflare en README; `NO_COMPROBADO` para comportamiento del editor privado o servicio remoto no observado.

## Última solicitud registrada al abrir
«Ok, por favor ejecuta la recuperación y vamos a comenzar con esta conversación como Stage 4».

## Pendientes heredados y aún sin cierre comprobado
- Completar transcripciones originales y últimos mensajes de los tres chats si posteriormente están disponibles; no repetir como pendiente el trabajo de auditoría externa históricamente completado.
- Localizar y comparar binarios/HTML locales autorizados v23.5, v23.9 y v23.11 si fuera necesario; sin exponerlos al repositorio público.
- Auditar ajuste visual POR CONFIRMAR/A TIEMPO por contexto y versión, más el estado real de las funciones de plataforma.
- No ejecutar el despliegue Cloudflare ni manipular D1 mientras no haya autorización para esa tarea.
- No tratar conversación anterior de creación de KGRP como Stage nuevo; es sesión auxiliar que precede Stage 4.

## Próximo traspaso
Actualizar esta ficha con último mensaje, cambios reales y resultados de pruebas. Si el chat se corta, Stage 4 permanece ABIERTA y su último tramo debe recuperarse retrospectivamente.

## Recuperación adicional — identidad, prioridades y estado de publicaciones
- Se recuperó reporte previo de **siete paneles Twitch publicados con capturas**; clasificación `HISTORICO_RECUPERADO`, aún sin comprobación pública actual. Corrige la posible lectura de que el séptimo permaneció meramente opcional.
- El proyecto más amplio no se reduce a Terminal: ya estaba establecido el orden **métricas internas YouTube/Twitch → estrategia X/Twitter → Pokémon Journey en noviembre de 2026**. El aplazamiento de Pokémon desde octubre sustituye agendas anteriores.
- Octubre/Octublaze mantenía bloques flexibles para MiSide, Azur y reservas como Parasocial o The Closing Shift según capacidad y prioridades; los calendarios anteriores deben compararse con versiones más recientes antes de usarse como agenda actual.
- Stage 1 fue **reportada como fase de trabajo cerrada**; falta la transcripción íntegra del cierre formal del chat. Son estados distintos, no contradictorios.

## Segunda auditoría archivística — 12 octubre 2026
- Revisadas todas las familias: 49 HTML, 8 CSV, 21 XLSX, 4 PPTX con duplicados, 3 PDF con duplicado, 2 DOCX, más de 100 imágenes (paginación pendiente).
- Inspección de v23.11 comparada con v23.10/v23.9: compatibilidad de cabecera `X-Terminal-Week`, migración de clave local, prioridad y cierre conservador. Falta prueba navegable y publicación.
- Hojas operativas y conciliación diferenciaron completadas vs programadas. Plantillas de siete paneles, covers, X, calendario y medición añadidas al índice.
- Cifras públicas obtenidas mediante ID canal/video; diferencias con CSV privado permanecen NO COMPARABLES cuando cambian ventana y universo.
- Materialización de HTML originales a copia binaria falló; la Biblioteca sigue siendo fuente única de los bytes.
- Referencia: `../AUDITS/SECOND-PASS-2026-10-12.md`; próximo arranque debe ejecutar ambas pasadas.

## Tercera revisión — perfiles, publicaciones y agenda (12-oct-2026)
- Se contrastaron vía identificadores directos videos públicos de Octublaze, Connect, mumei; perfil Instagram con bio y 12 reels; páginas Ko-fi, HoloList, vTubie y Bācharu. X/Twitch/Discord no permitieron validación directa plena.
- Créditos corregidos por publicaciones reales: Connect atribuye adaptación principal Sekai025, ajustes de Glorylé y voz/mix/video a Blaze; mumei atribuye voz/adaptación/subtítulos a Blaze, obras originales a sus respectivos autores. `TEMPLATES/COVERS.md` aclarado.
- Descripción de directos separada y documentada como `TEMPLATES/LIVE_STREAMS.md`; `TEMPLATES/SOCIAL.md` distingue posts de conversación de promociones, sin asumir comprobación directa de X.
- Agenda: ocho directos del ciclo con video YouTube disponible; 13 Killer Chat, 14 Azur condicionado, 15 Galaxies, 16 Azur tema por confirmar, 20 MiSide provisional, 21/22 reservas Azur contradictorias entre chat/libro, 23 MiSide histórico programado. Cake Song demo sin confirmación posterior, fecha límite del 31; Malfoid no realizado 10/11; Pokémon Journey sin estreno confirmado hasta noviembre.
- `INITIALIZATION.md` consolida las fases de recuperación histórica, archivo, fuentes públicas, calendario, auditoría, preguntas y persistencia. Stage 4 **continúa abierto**. No se crearon copias de originales privados ni cambió Terminal.
- Informe: `../AUDITS/THIRD-PASS-2026-10-12.md`; preguntas `../QUESTIONS.md`.
