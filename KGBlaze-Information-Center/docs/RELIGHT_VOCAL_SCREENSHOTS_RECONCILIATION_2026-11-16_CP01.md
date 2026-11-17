# Relight — Control de las dos capturas de división vocal (16-nov-2026)

**Estado:** checkpoint de investigación y correcciones propuestas. **NO equivale a cambios de letras implementados.** El código de producción sigue en PR #150 / main hasta que se autorice o ejecute el parche de atribuciones. Project Relight continúa abierto; no asignar un nuevo Stage sólo por esta nota.

## Evidencia inspeccionada

El creador adjuntó en la conversación (21:09 hora CDMX, 16-nov-2026) dos capturas de páginas Ameblo:

1. `Screenshot_20261116_210930.jpg`: Ruteshi Kisuki Shiteru, `https://ameblo.jp/love-live-kasi/entry-11934034550.html`.
2. `Screenshot_20261116_211019.jpg`: Let's be ONE, `https://ameblo.jp/lilla-part/entry-12870249699.html`.

Ambas capturas se inspeccionaron directamente el 16-nov; también se contrastó el texto accesible de esas dos páginas. Son **transcripciones de aficionados con asignación visual por color**, no documentación oficial de cada línea. No sustituir las capturas por un resumen previo; conservar su orden, separaciones y asignación visual como la fuente que el creador seleccionó. Los archivos originales siguen siendo adjuntos de conversación y **no se han añadido como binarios al repositorio**.

## Estado verificado de código / GitHub

- PR #150 `b99402128641d14559b8e3ca951501ca432428a8` integrada y verificada previamente. Sus cambios restauraron `colorLegend`, `colorStanzas`, los nueve diálogos de Ruteshi coloreados sin subtítulo, y el sistema de nombres ES/EN vs JA. Los paréntesis al comienzo de líneas se permiten **exclusivamente en los nueve diálogos hablados** de Ruteshi.
- `src/music-line-attributions.mjs` de main conserva las estructuras de voz previamente asignadas. **No contiene aún una reconciliación minuciosa del contenido de estas dos capturas posteriores**, especialmente en líneas españolas que reúnen turnos consecutivos en Let's be ONE.
- Letras españolas propiedad/adaptación del creador: **no alterar ni reescribir la letra** por esta investigación. Corregir únicamente la división por voz mediante fragmentos `{text,voice}` por línea, con concatenación idéntica al texto de origen.

## Ruteshi — revisión por estrofas (índices base 0; texto ES actual)

La mayor parte de la asignación registrada coincide con la imagen:
- Estrofa 0: `Todos` y la respuesta entre paréntesis de Nozomi; estrofa 1: 3 líneas Umi–Rin–Hanayo, 2 Honoka–Eli–Maki; estrofa 2: Kotori–Nico–Nozomi; estrofa 3: Nozomi (interjección).
- Estrofa 4: coro de todos; estrofa 5: todos y la respuesta **Umi–Rin**, no Hanayo; estrofa 6: Honoka–Eli–Maki → Kotori–Nico–Nozomi; estrofa 7: Umi–Rin–Hanayo; estrofa 8: **dos apartes distintos** (Kotori «Chun Chun» y Nico «Love Nico»).
- Estrofa 9: coro de todos, seguido INMEDIATAMENTE de los nueve diálogos hablados: original **Maki, Honoka, Eli, Umi, Rin, Hanayo, Nico, Kotori, Nozomi**; en el cover del creador **Leon Live☆Heart, Valeria Osorio, Blaze Leiton, Lanti Keeki, Glaze Reyna, Doraimonuwu, CamininaVT, Misao Chan, V.A.F.M.O.**, respectivamente. Cada diálogo mantiene `(Participante)` y su color de personaje original. Sin encabezado independiente.
- Estrofa 10: primeras dos líneas Nozomi, líneas 3 y 4 Kotori–Nico, resto de todos; estrofa 11: remate general. La coletilla final japonesa que aparece sin etiqueta individual explícita no autoriza inventar una voz en la adaptación ES.
- Resultado de reconciliación: **no sustituir masivamente lo que ya coincide**. Revisar visualmente el remate y confirmar el manejo de voces simultáneas/frases en un renglón; conservar contenido de letra intacto.

## Let's be ONE — correcciones pendientes de división, por índices de estrofa ES

La implementación anterior `lineAttributions['lets-be-one'].lines` trata varios **turnos secuenciales** como si fueran **coros simultáneos** porque todos se condensan en una sola línea española. Eso es lo principal que debe corregirse:

| Estrofa/renglón 0-based | Resumen de línea actual | Corrección del reparto en secuencia según la imagen |
|---|---|---|
| 1/0 | «Es sólo un palpitar… / trote…» | Kinako → Sumire (NO dúo continuo) |
| 1/2 | «Es sólo este amor… sueños» | Tomari → Sumire + Kinako + Margarete + Tomari |
| 2/1 | «Es por eso que… inquebrantable…» | Keke → Shiki → Keke + Shiki |
| 3/0 | «El brillo… / valor…» | Mei → Natsumi |
| 4/1 | «Pues seguramente… unidos…» | Keke + Shiki → Sumire + Kinako → Keke + Sumire + Kinako + Shiki |
| 4/2 | «No te dejo… aún si este momento…» | Todas → Ren + Mei |
| 4/3 | «(¡Canta para todos!)» | 3.ª generación: Margarete + Tomari |
| 4/4 | «Esta promesa…» | Chisato + Natsumi → Kanon |
| 7/1 | «Pues el mismo sueño…» | Mei + Tomari → Ren + Natsumi → Ren + Mei + Natsumi + Tomari |
| 7/2 | «No te dejo ir… mano…» | Todas → Kanon + Chisato |
| 9/2 | «Qué significa… unidad» | Kanon + Kinako → Kanon + Kinako + Margarete → Todas |
| 10/0 | «De mi corazón esta risa…» | Kanon en solitario, no `Todas` |
| 10/1 | «Pues seguramente, ya te he conocido…» | **3.ª generación → 2.ª generación → 1.ª generación**, NO once a la vez |
| 10/2–5 | Desenlace | Todas, según las etiquetas y continuación que enseña la fuente |

Lo que ya coincide en bloque: estrofa 0 (Kanon / Kanon+Kinako+Margarete / todas), solos principales de 5 y 6, primer verso de la 8 (Chisato), y parte inicial de 9 (Margarete / Kanon+Margarete). Ajustes de corte exacto de sílabas requerirán revisión editorial porque el español condensa japonés; **no inventar cortes fonéticos**.

**Formato técnico futuro:** cada línea de `colorStanzas` admite varios segmentos `{text, voice}` consecutivos, y los grupos simultáneos muestran puntos de colores. Concatenar los fragmentos debe reproducir exactamente el renglón actual. Etiquetar NO con paréntesis en versos cantados. Referenciar colores de la web oficial de Love Live! extraídos en recopilaciones; no llamar «HEX oficial normativo» a una muestra extraída por aficionados. Mantener leyendas romaji ES/EN y caracteres JA.

## Otras dos canciones — fuentes textuales para que el creador inspeccione

### Gimi Gimi — Mayonaka Punch
- [Uta-Net letra japonesa](https://www.uta-net.com/song/357149/)
- [UtaTen letra/furigana](https://utaten.com/lyric/hw24071203/)
- [Uta-Net romaji/kanji](https://www.uta-net.com/global/en/lyric/357149/)
- [Sitio oficial de personajes con ilustraciones individuales para captura](https://mayopan.jp/character/)
- [Materiales visuales oficiales (descargas y pautas de uso)](https://mayopan.jp/special/supporter02.html/)
- [Música / elenco y cinco solos oficiales](https://mayopan.jp/news/20240805_01.html)

Las fuentes de texto confirman **letra**, no atribución individual de versos. La paleta editorial actualmente guardada NO tiene certificación HEX oficial: Live `#EF96C8` rosa, Ichiko `#F5D45D` amarillo, Fu `#88D7B5` verde menta, Tokage `#A894E5` lila, Yuki `#B96582` vino. Cotejarla visualmente con los retratos oficiales; si no es fiable, pedir al creador capturas de esos retratos, antes de afirmar exactitud. Full y TV permanecen diferenciadas.

### Halloween Night! — hololive
- [UtaTen letra japonesa y furigana](https://utaten.com/lyric/rq21031317/)
- [JOYSOUND letra japonesa original](https://www.joysound.com/web/search/song/859643)
- [Uta-Net Bouquet ver., más larga: no asumir igualdad con cover abreviado](https://www.uta-net.com/global/en/lyric/301044/)
- [Ficha oficial hololive: reparto original de 4](https://hololive.hololivepro.com/music/%E4%BB%8A%E5%AE%B5%E3%81%AFhalloween-night/)

Las fuentes de texto confirman **letra**, no división cantada por las cuatro personas. Mantener el selector **Padoru / original**: Padoru conserva los 8 colores propios; original usa Mel, Shion, Choco y Rushia y se asignarán solos sólo con fuente verificable. Buscar primero texto, wikis y sitios con colores, y dejar video como recurso posterior.

## Estado y restricción

Esta nota **sí queda guardada**, pero **las correcciones de colores y turnos en las letras no se ejecutan** con este checkpoint documental. No declarar corregida una canción porque se documentó su trabajo pendiente. Si se implementa, ejecutar tests de igualdad exacta del texto, 9 diálogos, leyendas y fragmentos secuenciales, y visual ES/EN/JA × escritorio/móvil.
