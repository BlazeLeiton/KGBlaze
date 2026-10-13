# Recuperación Stage 1/2: Find Love or Die Trying, novelas visuales y catálogo Steam × YouTube

**Corte documental:** 13-oct-2026. **Tipo:** reconciliación de auditoría previa, exportación YouTube Studio parcial y bibliotecas Steam originales. **Privacidad:** no incluir ni redistribuir horas de juego, ID de cuentas familiares, lista privada de juegos, estadísticas analíticas individuales o wishlist. El cruce íntegro está guardado **sólo en Biblioteca personal**: `/Project Relight/Relight - Cruce Steam y YouTube Stage 1-2 - 2026-10-13.md`.

## Hallazgo principal — referencia identificada y corregida

La metadata aprobada para Killer Chat! incluía:
- Título: `💌 Encuentra el Amor o MUERE Intentándolo.....espera :v 🔪 | Killer Chat!`
- Descripción: `...que le gustemos a la loca.... otra vez :v`.

**Ambas formulaciones remiten a un antecedente ESPECÍFICO del canal:** la serie **Find Love or Die Trying**. En Stage 1, el usuario y el análisis del catálogo original habían identificado el título **«Le gusto a la loca, el Reality | Find Love or Die Trying (COMPLETA)»**, no visto en el subconjunto reciente del CSV.

**Playlist ya documentada en Stage 1:** https://www.youtube.com/playlist?list=PLEnd6SFhXSllP2CSY41GvJ-NJ0ixqFmam . El identificador proviene de la recuperación de mensajes del 30-sep y 09-oct, **no de acceso público nuevo de YouTube a 13-oct**.

**Otra evidencia pública independiente:** la página de Steam Community de Find Love or Die Trying (https://steamcommunity.com/app/1714320/) indexó un video titulado **«12 Corazones versión Omae wa mou Shindeiru | Find Love or Die Trying #2»**, atribuido a **Blaze Leiton**. Este hallazgo respalda la existencia del formato/serie; no aporta directamente el ID del VOD.

**Corrección prevalente:** atribuir la referencia `otra vez` únicamente a DDLC o Needy Streamer Overload era **incompleto y demasiado genérico**. Esos juegos siguen siendo antecedentes reales de novelas visuales, pero el *guiño directo* de Killer Chat! corresponde a **Find Love or Die Trying**.

## Otros juegos narrativos recuperados de Stage 1/2 y cruce 09-oct

| Obra | Evidencia documental y contenido subido |
|---|---|
| **Find Love or Die Trying** | Playlist de la serie con ID anterior, título `Le gusto a la loca, el Reality ... (COMPLETA)`, segundo título `12 Corazones ... #2` indexado en Steam Community. |
| **Kill or Love** | Se archivaron **dos directos** del creador: https://www.youtube.com/watch?v=TDBEEBTwmGE y https://www.youtube.com/watch?v=sWYqF6iovZY |
| **missed messages.** | Se recuperó el episodio **#2**: https://www.youtube.com/watch?v=aOBo-0cjbGg |
| **Doki Doki Literature Club! / Plus** | Ya documentados episodios y cover Your Reality, ver `NARRATIVE_GAME_PUBLICATIONS.md`. |
| **NEEDY STREAMER OVERLOAD** | Episodios #3 y #4, ya documentados en `NARRATIVE_GAME_PUBLICATIONS.md`. |
| **Superliminal** | El usuario ya lo incluyó entre obras narrativas subidas en Stage 1; **sin URL recuperada de forma suficientemente directa** en este cruce. |
| **Love Live! Nijigasaki TOKIMEKI ROADMAP** | En el CSV parcial apareció `Usa pyon da pyon~ | Love Live Nijigasaki TOKIMEKI ROADMAP #02`: https://www.youtube.com/watch?v=12tcEGCLPvA . No es una VN romántica de terror, pero sí narrativa/interactiva. |
| **KinitoPET** | Conversación Stage 2/09-oct lo registra como **ya transmitido y no terminado**; no se reconstruyó un ID de YouTube a partir de este CSV. |
| **MiSide** | En el contexto de Stage 1 se preparó el contenido pero **NO se había subido**; reservarlo para planificación posterior, no inventar VOD pasado. |

Los archivos Steam consultados contienen en la biblioteca **propia** Find Love or Die Trying, su continuación **Til Death Do Us Part**, Kill or Love, missed messages., Doki Doki, NEEDY STREAMER OVERLOAD, Superliminal, Love Live Nijigasaki, KinitoPET y MiSide. En **bibliotecas compartidas** figura Find Love or Die Trying y, en otra, Killer Chat! - Original Edition. La aparición de un juego en biblioteca **no demuestra** publicación o emisión: la prueba de upload depende de una URL, playlist/episodio auditado o confirmación explícita del usuario.

La secuela `Find Love or Die Trying: Til Death Do Us Part` en Steam **no** se ha comprobado como video del canal.

## Fuente YouTube Studio incompleta — no confundir ausencia del CSV con ausencia del canal

La exportación privada `Table data content.csv` tiene 501 filas distintas de `Total`, pero una es el aviso `Showing top 500 results`; **no abarca el universo del canal**. Varias obras que Stage 1 sí identificó mediante playlist/videos no aparecen textualmente allí: Find Love or Die Trying, Kill or Love y missed messages. Por tanto, la auditoría anterior se equivocó al considerar DDLC/Needy los únicos referentes recuperados.

**Estadísticas y horas personales:** archivadas exclusivamente en la Biblioteca, no en este documento público.

## Estado de sala YouTube y verificación oficial Terminal

Sala declarada por el usuario: https://youtube.com/live/JDkg-5tZ3G0?feature=share, ID `JDkg-5tZ3G0`. Comprobada **solo sintaxis y procedencia del enlace facilitado por el usuario**.

La consulta por YouTube **NO fue completada**: sitio/oEmbed rechazaron las lecturas automáticas; vidIQ conectado a canal exacto pero 0 créditos disponibles hasta renovación informada 20-oct-2026; TubeAlfred, sin créditos; no hay acceso a API key privada del Worker en esta sesión. `YOUTUBE_PREVIEW_ENABLED` permanece `false` por última confirmación y la ruta actual `POST /api/admin/youtube-preflight` devuelve `YOUTUBE_PREFLIGHT_DISABLED` cuando está apagada. Esta ruta usa los `videoId` de la agenda **publicada** de D1; el ID de sala ha sido validado **solo en editor HTML privado** por usuario después de reimportar ICS, NO publicado en D1.

**No marcar canal propietario, hora programada, broadcast status, matchConfirmed o sincronización como verificados** sin respuesta oficial `videos.list` y pruebas de identidad/estado. No alterar flag, Cloudflare, agenda pública ni secretos sin nueva autorización concreta.

## Persistencia aprobada del flujo editorial de Terminal

- **Actividad ICS**: juego/categoría programada en Twitch con antelación, no metadata del título final.
- **Título stream dual**: normalmente el mismo en Twitch/YouTube, elegido después de programación.
- **Sala YouTube**: asociada en editor v24.2.1 y conservada tras reimportar ICS, **PRUEBA LOCAL COMPLETADA por usuario**.

La relación entre el título de Killer Chat! y Find Love or Die Trying es **contexto editorial**, no motivo para forzar un cambio del matcher, del nombre de vuelo o de cualquier título público.
