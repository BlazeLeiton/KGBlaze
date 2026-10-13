# Auditoría de catálogo y taxonomía del canal — 13 oct 2026

**Propósito:** recuperar qué se ha transmitido realmente antes de interpretar novelas visuales, series, campañas OCTUBLAZE, títulos y agrupaciones en YouTube/Twitch. **No es un censo total de playlists**.

## Procedencia y límites

- **Canal canónico:** `https://www.youtube.com/@BlazeLeiton`, ID `UCRd_uwPjrsf6Z3CRXwNehEQ`.
- **Fuente interna primaria:** CSV privado exportado de YouTube Studio `Table data content.csv`, con 500 registros de video identificables en esta extracción y fila total, y fecha de publicación más reciente entre las filas **12-sep-2026**. **No es historial completo a 13-oct-2026** ni muestra todas las publicaciones; omitir números de métricas privadas en GitHub público. La validación de fechas/duración/IDs no prueba accesibilidad pública actual de cada pieza.
- **Búsqueda pública 13-oct:** se intentó abrir `/@BlazeLeiton/streams`, `/@BlazeLeiton/playlists`, `/channel/UCRd_uwPjrsf6Z3CRXwNehEQ/playlists` y video individual; el acceso de YouTube devolvió throttle/disabled. Búsquedas por handle, títulos exactos y playlists no devolvieron identificadores verificables de playlists. **PLAYLISTS: NO COMPROBADAS**. Los grupos de series que siguen son *agrupaciones inferidas del catálogo por título*, **no nombres reales de playlists**, y no se inventan IDs `PL...`.
- **Proveedores:** vidIQ está conectado por OAuth al canal correcto, pero la cuenta tenía 0 créditos disponibles a 13-oct; reinicio informado para 20-oct-2026. TubeAlfred devolvió error de créditos insuficientes. No se realizaron consultas costosas con datos actuales ni se accedió a playlists mediante estos proveedores.
- **Terceros:** HoloList clasifica públicamente al creador como `Gaming` y `Voice Acting` y confirma handle/canal: `https://hololist.net/blaze-leiton/`. Esa taxonomía externa general **no sustituye** la organización real de playlists del propio YouTube.

## Líneas temáticas acreditadas por títulos/IDs del CSV

| Línea editorial | Evidencia de publicaciones / ejemplos |
|---|---|
| **Azur Lane** | Gran número de sesiones de historia/eventos y gacha, coberturas oficiales, colaboraciones, noticias, aniversario, Crosswave. Ejemplos del calendario Sept 2026: `https://youtu.be/dKHC8H-0SQo` y `https://youtu.be/8fhiHplUL8Q`; intercaladas con otros formatos y covers. |
| **Novelas visuales/romance oscuro** | **Needy Streamer Overload** #3/#4 (enero 2023), **Doki Doki Literature Club** #2 de OCTUBLAZE 2023 y DDLC Plus (feb/mar 2024), cover `Your Reality` asociado. Documentadas individualmente en [NARRATIVE_GAME_PUBLICATIONS.md](NARRATIVE_GAME_PUBLICATIONS.md). **Killer Chat! es una nueva IP dentro de esta línea; no debut del formato.** |
| **Gaming de terror/OCTUBLAZE** | Little Nightmares #1 OCTUBLAZE 2022, Doki Doki #2 OCTUBLAZE 2023, Content Warning y Phasmophobia OCTUBLAZE 2024, entre otros. No afirmar que todos son novelas visuales. |
| **Gaming de estrategia** | Sid Meier's Civilization VI con mods de Azur Lane (OCTUBLAZE 2023), Civilization VII (feb 2025), juegos de estrategia y progresión. |
| **F1 / reacción en vivo** | Watchalongs de Grandes Premios de 2023–2024, por ejemplo México 2024 `https://youtu.be/e6I2AS1f-QA`. No confundir cobertura/reacción con derechos de retransmitir señal deportiva. |
| **HoloCure / Hololive** | Directos y collabs de HoloCure 2022–2024, además de covers relacionados con Hololive; son **formatos distintos**. |
| **Pokémon** | Covers, karaoke y contenidos del universo Pokémon; no inferir abundancia de streams regulares de Pokémon a partir de covers. `Pokémon Journey` pospuesto a noviembre 2026. |
| **Música/VSinger** | Covers musicales, karaokes, adaptaciones de anime/VTubers. No mezclar videos musicales cortos con directos largos al comparar vistas/duración. |
| **Variedad y comunidad** | Among Us, Fortnite, VRChat, Tower of Fantasy, Fortnite, Lethal Company, Phasmophobia, Party Animals, charlas `A solas de noche`, aniversarios y colaboraciones. |
| **Series recurrentes tardías** | Yu-Gi-Oh Master Duel, Hogwartscraft, Cobblepals, Civilization VII, combinados con Azur y música, documentados en publicaciones del catálogo 2025–2026. |

**Interpretación:** el canal funciona como catálogo de **series por IP**, campañas temporales (OCTUBLAZE), música/covers, directos narrativos, colaboraciones y eventos. Una misma publicación puede pertenecer a más de una agrupación; **no existe una única partición exhaustiva deducible de palabras del título**.

## Relación con títulos y actividad ICS

**Corrección expresa del usuario el 13-oct-2026:**
- Se agenda primero **qué actividad/categoría/juego** se hará en Twitch, cuando todavía NO existe necesariamente un título creativo final.
- El campo de Terminal `Nombre del vuelo / actividad` representa **el juego o actividad reconocible para pasajeros**, y así debe permanecer. El `SUMMARY` de Twitch ICS puede estar vacío, mientras `DESCRIPTION` contiene la categoría o juego (p. ej. `Killer Chat!: Original Edition.`).
- Más tarde se decide **cómo** presentar el directo (título, descripción, miniatura y etiquetas); para directos duales, **normalmente se comparte el mismo título** en Twitch y YouTube. Es **intencional** que este título difiera del nombre del vuelo/actividad del ICS.
- **No considerar ni defectuoso ni desactualizado el campo de actividad por no coincidir con el título de stream**. No cambiar el editor/visor para sustituirlo con el título publicitario.
- El emparejamiento conservador de Terminal debe combinar título/categoría como señal contextual con **canal, hora e ID de sala**, sin elevar una coincidencia léxica débil a prueba de identidad.

## Prueba local del usuario — v24.2.1

Killer Chat! 13-oct-2026, 22:00 CDMX: sala indicada por usuario `https://youtube.com/live/JDkg-5tZ3G0?feature=share` (ID `JDkg-5tZ3G0`). **Secuencia validada por usuario:** agregar URL en edición de Killer Chat → confirmar edición → reimportar el ICS de 7 eventos → abrir edición de Killer Chat otra vez → comprobar que la asociación con la sala sigue presente.

**Estado:** `USER_BROWSER_VALIDATED_PERSISTENCE_AFTER_REIMPORT` (conservación del override, prueba completada). No equivale a export/import JSON probado por usuario, ni publicación de revisión Terminal, ni verificación YouTube del canal propietario, ni `matchConfirmed`. La flag de diagnóstico de YouTube en Cloudflare permanece deshabilitada, último estado confirmado; no activar sin permiso.

## Próximas pruebas y fuentes faltantes

1. **Playlists YouTube existentes:** en cuanto haya proveedor legible o exportación de IDs, consultar playlists.list/items por el ID canónico; preservar nombres, URL, descripción, número de videos, visibilidad, pertenencia de videos y fecha comprobación. No confundir *grupos inferidos* con playlists verificadas.
2. **vidIQ:** el 20-oct tras renovación de créditos, poder consultar videos públicos/privados de la cuenta (según límites del proveedor), tags, categorías, directos y metadatos; el proveedor disponible **no ofreció aquí una acción directa de listado de playlists**. Si hay gasto de créditos, consultar antes cuál análisis tiene prioridad.
3. **CSV**: comparación de formatos homogéneos por duración + serie + ventana y métricas compatibles. Guardar resultados privados de visualizaciones/horas/CTR fuera del repo.
4. **Terminal:** asociar localmente v24.2.1 **ya VALIDADO**; siguiente validación independiente en Worker es otro paso y requiere aprobación antes de cambiar flag/producción.

**No se modifica software ni agenda desde esta auditoría documental.**
