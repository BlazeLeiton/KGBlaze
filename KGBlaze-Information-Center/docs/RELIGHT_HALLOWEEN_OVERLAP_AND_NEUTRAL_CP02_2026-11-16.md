# Relight / Scripta Lyrica — Halloween Night: Todas neutro + estructura Padoru y superposiciones

**Fecha editorial:** 16 noviembre 2026 (CDMX). **Alcance:** corrección incremental de la PR #154 y los checkpoints #152/#153. No crea otro Stage ni cierra Project Relight.

## Instrucción vinculante del creador

- La closed caption **naranja** del MV corto de `今宵はHalloween Night!` significa **las cuatro cantantes juntas**, pero el **color que Scripta Lyrica debe usar para Todas es neutro**, no naranja. Mantener `sharedColor: #F0F3FF`, con los indicadores multicolor de los cuatro miembros y sus nombres localizados.
- El remate **«Ah ah»** es **Todas**, confirmado editorialmente por el creador. No mantenerlo como neutro sin voz ni asignarlo por cambio de plano.
- La opción **División Padoru** sigue siendo distinta de la **División original**: Padoru conserva ocho colores/personas por línea. No reemplazar sus cantantes por integrantes de hololive, ni reescribir versos.

## División original después de revisar las captions

El orden de las cinco estrofas ES se mantiene idéntico al de `music-lyrics.mjs` (10 / 9 / 5 / 7 / 9 líneas), pero las atribuciones de `colorDivisionFromReference` se actualizan:
- Estrofa 0: dos Rushia, dos Choco, Mel, Shion, Mel, Rushia, dos Shion.
- Estrofa 1: **9/9 Todas**, texto neutro. El montaje de cámara no autoriza solos cuando la caption es naranja.
- Estrofa 2: Choco, Rushia, Mel, Rushia, Shion.
- Estrofa 3: Todas, Todas, Choco→Todas en la respuesta `(hallow)`, Todas, Todas, Todas, Todas→Shion en el remate `(tataritarira)`.
- Estrofa 4: Todas, Todas, Todas, Shion→Todas en `(volar)`, Rushia→Todas en `(bailar)`, Todas en `Está, a punto de empezar`, Todas en `FunnyHalloweennight`, Todas en `¡Crazy night!`, **Todas en `Ah ah`**.
- Los segmentos secundarios se marcan tipográficamente como tales, sin preceder las líneas cantadas por nombres entre paréntesis ni añadir explicaciones al sitio.

## Comprobación de la estructura Padoru y su orden de actuación

**Fuente verificable:** objeto `lyricsBySong['halloween-night'].es` en `src/music-lyrics.mjs` y video original/captions del usuario `1000099176.mp4`. El video original ayuda a alinear la música, **pero no es una grabación del cover Padoru**; la interpretación en audio propia de Padoru no fue verificada aisladamente. La estructura propuesta respeta el guion de Team Padoru como se conservaba en el repositorio.

Antes: cinco bloques 10 / 9 / 5 / 7 / 9. El bloque 2 `Voces superpuestas` se dibujaba después de todo el estribillo, de forma que cinco llamadas se leían como si ocurrieran al terminar la estrofa principal. El creador exige orden correcto de lectura y respuestas como en Kenka/Ain't Backing Down.

Ahora: **mismas cinco estrofas y 40 renglones en los datos originales, mismos fragmentos de colores individuales, mismas letras**. El renderizador `overlapDisplayStanzas` arma **cuatro bloques visuales** con 10 / 14 / 7 / 9 líneas:
- Estrofa Padoru 0: sin cambios (10).
- Estrofas Padoru 1 y 2: intercaladas (14 líneas) en el orden:
  `1/0 → 2/0 → 1/1 → 2/1 → 1/2 → 2/2 → 1/3 → 2/3 → 1/4 → 2/4 → 1/5 → 1/6 → 1/7 → 1/8`.
- Estrofas Padoru 3 y 4: sin cambio de orden (7 y 9).
- Desaparece el subtítulo público `Voces superpuestas`, que ya no es una sección musical separada.
- Las cinco líneas de respuesta quedan visualmente **como intervenciones secundarias**, con margen e itálicas. Sus intérpretes originales y colores siguen intactos. Las frases de varios intérpretes mantienen los puntos de colores de cada voz en lugar del antiguo mosaico de caracteres que impedía leer una respuesta como unidad.

**Contraste de formato:** `Kenka` y `Ain't Backing Down` ya distinguían `main` y `secondary` con itálicas. El mismo formato de respuesta separada se aplica de modo reutilizable al renderizado `colorRole:'overlap'`, sin alterar sus letras ni cambiar el orden que ya tenían.

## Verificaciones

- 40/40 líneas Padoru aparecen exactamente una vez en el orden visual intercalado; texto del objeto fuente, palabras, caracteres, colores de los ocho miembros y `colorStanzas` no se modifican. La división original utiliza las mismas posiciones visuales con su paleta propia de cuatro.
- No aparece la antigua etiqueta pública `Voces superpuestas`.
- Los segmentos originales de Kenka y Ain't Backing Down siguen exactamente iguales; sólo se homologa el estilo visual de líneas secundarias.
- Los fragmentos entre paréntesis conservan sus caracteres y colores de participante/indicadores de voces múltiples; el texto cantado nunca recibe `(Nombre)`.
- Node suite + prueba de navegador ES/EN/JA y móvil/escritorio + comprobación HTTP real tras merge.

**Límite:** la correspondencia temporal de las cinco respuestas de Padoru sigue la estructura del MV original y del registro del cover. Si en el audio publicado de Padoru alguna respuesta entra antes/después, modificar únicamente `overlapTimeline.responseAfter`, no reescribir ni recolorear el guion.
