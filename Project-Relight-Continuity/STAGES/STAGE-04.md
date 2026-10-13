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
