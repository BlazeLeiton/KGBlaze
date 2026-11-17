# Relight — Divisiones vocales (continuidad posterior al agotamiento de Stages 26–36)

Fecha editorial: 16 de noviembre de 2026, America/Mexico_City.

## Regla de procedencia

Las editoras, discográficas y canales oficiales documentan **quiénes cantan** en una grabación. No equivale a que publiquen un reparto oficial de cada verso. Separar *reparto original confirmado*, *transcripción de aficionados* y *distribución real del cover*. No asignar un solista por intuición ni llamar «oficial» a las asignaciones de foros y blogs.

- **Ruteshi Kisuki Shiteru** (μ's): dos partituras de aficionados detalladas y coincidentes (LYRUCA, https://lyruca.com/song/37487 y μ's パート分け https://ameblo.jp/love-live-kasi/entry-11934034550.html). Atribución verso a verso en etiqueta visible `(Nombre)`, en grupos o «Todos»; versión original con Nozomi y tríos. Las nueve frases habladas aparecen **inmediatamente después de «En 10 segundos lo sabré», antes de la última repetición de «Dale vuelta»**, no al final.
- **Reparto Padoru Ruteshi:** por el orden exacto que confirmó el creador a partir de su video: Leon Live☆Heart, Valeria Osorio (sin canal de creadora), Blaze Leiton (rol del propio creador, **no duplicar en créditos de invitados**), Lanti Keeki, Glaze Reyna (rol de guion), Doraimonuwu (https://www.twitch.tv/doraimonuwu), CamininaVT (https://www.twitch.tv/camininavt), Misao Chan, V.A.F.M.O. Correspondencia con las voces habladas originales: Maki, Honoka, Eli, Umi, Rin, Hanayo, Nico, Kotori, Nozomi. Las voces/roles de guion «se supone» se registran como referencia del creador, no como verificación auditiva de la toma. Mantener `Blaze Leiton feat. V.A.F.M.O.` como interpretación musical.
- **Let's be ONE** (Liella!): reparto de 11 cantantes del grupo y mapeo basado en https://ameblo.jp/lilla-part/entry-12870249699.html (fuente de aficionados). Algunas líneas de la adaptación de Blaze combinan varias frases japonesas; sus etiquetas incluyen varias intérpretes donde corresponde. El sello confirma a Liella!, no cada línea (https://www.lovelive-anime.jp/yuigaoka/music/detail.php?p=01_4749). Mantener `Let's be ONE` sin evento de 1,000 suscriptores.
- **Gimi Gimi** (Mayonaka Punch): elenco original de cinco personas confirmado en https://mayopan.jp/music/ (りぶ, 苺子, 譜風, 十景, ゆき). No se encontró desglose oficial de versos individuales para la pista de conjunto; se muestra **Mayopan** en cada línea, y no se fabrica una asignación específica. Se aplica en Full y TV Size conservando su contenido.
- **Koyoi wa Halloween Night!**: hololive confirma a Yozora Mel, Murasaki Shion, Yuzuki Choco y Uruha Rushia (https://hololive.hololivepro.com/music/%E4%BB%8A%E5%AE%B5%E3%81%AFhalloween-night/), sin desglose oficial por verso recuperado. Selector **División Padoru / División original**: la primera usa los ocho integrantes y la asignación multicolor previamente aprobada; la segunda muestra el reparto original confirmado como grupo sin afirmar solos individuales no demostrados. No mezclar ni sobrescribir la distribución Padoru con una especulación original.

## Implementación

Los metadatos de referencia viven en `src/music-line-attributions.mjs`; las 9 voces habladas se preservan en `src/music-lyrics.mjs` con `originalRole`. La vista `src/music-page.mjs` añade etiquetas entre paréntesis **antes** de cada línea y separa ambas divisiones de Halloween mediante inputs radio sin alterar el texto o los colores originales. La integración debe pasar Node, auditoría visual ES/EN/JA móvil/escritorio, conservación de portadas y prueba HTTP tras merge.

No tocar audiovisuales originales, audios privados, álbumes planeados, Terminal, Pokémon P1–P3 ni Stage25/R17. La reconciliación no declara concluidos Project Relight ni Scripta Lyrica.
