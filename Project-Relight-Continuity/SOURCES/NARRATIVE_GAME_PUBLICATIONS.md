# Catálogo recuperado — novelas visuales y juegos narrativos de Blaze Leiton

**Recuperación:** 13-oct-2026, Stage 5 de Project Relight.
**Fuente primaria:** exportación personal de YouTube Studio `Table data content.csv` (500 registros con ID de video + fila total, catálogo de publicaciones con fechas hasta el 12-sep-2026); no redistribuir el archivo ni sus analíticas privadas a este repositorio. Se anotan exclusivamente **títulos, fechas e IDs de publicaciones**, que son metadatos de videos, sin métricas.
**Límites:** el CSV no prueba lista exhaustiva de Twitch ni episodios privados, borrados o fuera del período. Los episodios #2, #3 y #4 no autorizan a inventar URLs de #1 o de episodios intermedios.

## Doki Doki Literature Club / Plus — línea recurrente

| Publicación incluida en el catálogo | Fecha de publicación mostrada por Studio | ID / enlace |
|---|---|---|
| Cuando vendimos nuestra alma por cupcakes... / Doki Doki Literature Club **#2** #OCTUBLAZE | 25-oct-2023 | https://www.youtube.com/watch?v=5xxJl_e203w |
| Pero esperen, hay más XD / Doki Doki Literature Club **Plus** | 14-feb-2024 | https://www.youtube.com/watch?v=feTktcqzPuE |
| VAMOS POR ESE FINAL FELIZ (?) / Doki Doki Literature Club **Plus #4** | 26-mar-2024 | https://www.youtube.com/watch?v=CiBBKd3nSCs |
| Doki Doki Literature Club ED – **Your Reality** – Monika / Male Cover en español (**cover, no directo**) | 15-feb-2024 | https://www.youtube.com/watch?v=sj-EaDkH4WA |

La presencia del juego desde OCTUBLAZE 2023 y el regreso con Plus en 2024 son **antecedentes verificables de decisiones narrativas/romances peligrosos**. El título del cover muestra además actividad musical relacionada. No inferir cómo reaccionó Blaze a cada personaje sin ver la transmisión.

## Needy Streamer Overload — otra serie narrativa

| Publicación incluida en el catálogo | Fecha de publicación mostrada por Studio | ID / enlace |
|---|---|---|
| Cuando la sobredosis de internet está potente / Needy Streamer Overload **- 3** | 16-ene-2023 | https://www.youtube.com/watch?v=tDNGCAiH330 |
| No hay finales felices en Internet...o sí? / Needy Streamer Overload **- 4 [Final?]** | 17-ene-2023 | https://www.youtube.com/watch?v=SkheGAkhlIM |

Esto sitúa la línea de novelas visuales y elecciones con consecuencias **como mínimo desde enero de 2023** entre las publicaciones del canal. La numeración apunta a entregas previas, pero los registros consultados **no proporcionaron IDs de los episodios 1 y 2**.

## Killer Chat! — continuidad editorial, no debut de género

- Nueva IP programada para **13-oct-2026, 22:00 CDMX**, calendario ICS Twitch UID `306ddb27-c0d3-4030-bd9f-f7689b529582`, DESCRIPTION `Killer Chat!: Original Edition`, `SUMMARY` vacío.
- Título elegido por el usuario para publicación dual: `💌 Encuentra el Amor o MUERE Intentándolo.....espera :v 🔪 | Killer Chat!`
- Descripción elegida: humor de infiltración en chat de asesinos, romance peligroso, remate `que le gustemos a la loca.... otra vez :v`, campaña `#OCTUBLAZE - Dia 13`; reglas integrales, enlaces KGBlaze y créditos generales siguen la plantilla maestra unificada.
- La referencia `otra vez` **es una alusión editorial coherente** con DDLC y Needy Streamer Overload. **NO** asignar de manera incontrovertible el chiste a Monika, Ame u otro personaje, porque el usuario no especificó su referente exacto. No recomendar eliminarla por falta de antecedentes.
- Sala YouTube suministrada por el usuario: `https://youtube.com/live/JDkg-5tZ3G0?feature=share` (identificador `JDkg-5tZ3G0` válido sintácticamente). El usuario afirma creada la sala. **No se ha podido inspeccionar el título, el canal propietario o el estado mediante una respuesta autenticada/API**. No marcar `matchConfirmed` ni publicación pública comprobada.
- Enlace Twitch del usuario: `https://www.twitch.tv/blazeleiton`. La consulta web abrió la página con **cero líneas útiles**, y /about y /schedule bloquearon consulta. **No se pudo inspeccionar chat, estado de emisión, título configurado ni metadata específica.**

## Regla editorial vinculante: títulos de stream dual (corrección usuario 13-oct-2026)

**Por norma el usuario comparte el MISMO título entre Twitch y YouTube para sus emisiones duales, salvo excepciones puntuales.** Esta regla supera la inferencia anterior que trató las discrepancias de títulos como normales. No cambiar o alinear automáticamente títulos sin revisar el evento concreto; la excepción debe ser explícita.

**Importante para Terminal:** el **calendario ICS de Twitch no garantiza transportar el título de transmisión de Twitch**. En el ICS entregado, Killer Chat trae `SUMMARY:` vacío y `DESCRIPTION:Killer Chat!: Original Edition.`. Si el parser usa `DESCRIPTION` como título editorial, el resultado `Killer Chat!: Original Edition` difiere del título compartido en Twitch/YouTube, **aunque las plataformas coincidan exactamente entre sí**.

El matcher experimental (`KGBlaze-Information-Center/experiments/youtube-matching/matcher.mjs`) exige coincidencia léxica fuerte (≥2 palabras distintivas, cobertura ≥0.80, Jaccard ≥0.60, y episodio/colab compatibles), canal confiable y tiempo ±90 min. Con el título editorial `Killer Chat!: Original Edition` y el título elegido `💌 Encuentra el Amor o MUERE Intentándolo.....espera :v 🔪 | Killer Chat!`, la coincidencia fuerte **no alcanza el umbral**; compartir títulos entre Twitch y YouTube por sí solo no corrige el ICS.

**PRUEBA COMPLETADA POR EL USUARIO (13-oct-2026):** introdujo el enlace de la sala `JDkg-5tZ3G0` en el campo opcional YouTube de Killer Chat usando **Terminal privado v24.2.1**, confirmó la edición, reimportó el ICS y volvió a editar el evento: **el enlace permaneció asociado**. Esta comprobación prueba persistencia local tras reimportación en el navegador del usuario, pero **no** valida aún exportación/importación JSON ni publicación D1. El matcher puede dar `candidate` por ID explícito **sólo si `videos.list` recupera video de broadcast perteneciente al canal autorizado**; hasta entonces ninguna observación verificada, `EN VIVO` ni `DESPEGÓ`. El diagnóstico en Cloudflare `YOUTUBE_PREVIEW_ENABLED` quedó apagado tras las pruebas; no activar sin autorización expresa.

## Regla general de continuidad

Ante un juego narrativo nuevo, consultar **este catálogo de episodios previos y covers relacionados**, además de la plantilla maestra, antes de afirmar que el género es nuevo, explicar/recortar chistes recurrentes o proponer metadata desde cero. Los títulos editoriales de publicaciones anteriores pueden tener humor, referencias a decisiones o chistes internos: no son errores SEO por defecto.

## Corrección de jerarquía: actividad antes que nombre publicitario (confirmado usuario 13-oct-2026)
La equivalencia previa implícita entre `Nombre del vuelo / actividad` y `título del directo` era **incorrecta**. El usuario primero crea bloques Twitch con el **juego/categoría/actividad**, que es más estable y útil para pasajeros, y después decide el título promocional. La coincidencia exacta de títulos Twitch↔YouTube es regla general del stream **una vez definidos**, pero es perfectamente intencional que el vuelo del ICS muestre solo `Killer Chat!: Original Edition`. No recomendar sincronizar a la fuerza el vuelo con el título promocional, ni calificar esa diferencia como anomalía. Ver [CHANNEL_CONTENT_TAXONOMY_2026-10-13.md](CHANNEL_CONTENT_TAXONOMY_2026-10-13.md).
