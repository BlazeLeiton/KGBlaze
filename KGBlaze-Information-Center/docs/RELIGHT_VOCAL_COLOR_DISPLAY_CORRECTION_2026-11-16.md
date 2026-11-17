# Relight / Scripta Lyrica — Corrección visual de división vocal

**Fecha:** 16 noviembre de 2026 (America/Mexico_City).  
**Prioridad:** instrucción expresa del creador prevalece ante la introducción errónea de prefijos de PR #148. Esta nota es incremental; no concluye Project Relight ni crea otro Stage/ReSpark.

## Regla recuperada de Stages 26–36

La interfaz de divisiones vocales ya aprobada usa **`colorLegend`**, **`colorStanzas`** y las etiquetas semánticas de grupos de voces (`color-group`, puntitos simultáneos). El texto cantado se colorea, sin `(nombre)` antepuesto. Los nombres aparecen en la leyenda y en el atributo informativo `title`; para voces simultáneas el grupo se representa por varios puntos de sus colores, no alternando una letra por cada cantante.

**Única excepción:** los nueve **diálogos hablados de Ruteshi** sí llevan `(Nombre) Frase`, dentro del interludio que precede al estribillo final. El creador corrigió identidades (Valeria Osorio, Glaze Reyna, Doraimonuwu, CamininaVT) y omitió duplicar a Blaze en los créditos de invitados. Conservar como guion provisional su propio papel y el de Glaze donde se confirmó que «se supone».

No confundir *la lectura textual/DOM que usa un agente* con lo que realmente se dibuja en pantalla. Una división publicada como imagen, colores de texto, notas visuales o superposiciones puede existir aunque no sea extraíble en texto. Antes de declarar «no hay reparto» revisar wikis, blogs, subtítulos visuales, imágenes y referencias oficiales; constatar ausencia sólo en lo realmente inspeccionado. La auditoría Playwright captura las fichas y comprueba estilos efectivos.

## Fuentes y niveles de verificación

| Canción | División | Paleta | Qué NO afirmar |
|---|---|---|---|
| **Ruteshi Kisuki Shiteru** | [μ's パート分け](https://ameblo.jp/love-live-kasi/entry-11934034550.html) y [LYRUCA](https://lyruca.com/song/37487) como guías de aficionados; convertir a `colorStanzas`, con respuesta corregida Umi + Rin (no Hanayo) | [Love Live! Member Color Summary](https://ratius.github.io/LLS/color.html), colores muestreados de perfiles del proyecto | Que el blog/tabla sea distribución de voces publicada oficialmente |
| **Let's be ONE** | [Blog de distribución Liella!](https://ameblo.jp/lilla-part/entry-12870249699.html); las frases en español pueden condensar asignaciones más finas del japonés | [Moegirl: colores de Love Live!](https://moegirl.uk/Template:LoveLive!角色颜色/doc), extracción de muestras del sitio del proyecto para 11 integrantes | Que la distribución de blog sea un reparto oficial o que un hexadecimal sea un código normativo único |
| **Gimi Gimi** | [Música oficial Mayonaka Punch](https://mayopan.jp/music/) prueba cinco intérpretes; búsqueda adicional en letra y recursos visuales no reveló un reparto verificable de líneas individuales | [Ilustraciones oficiales Mayonaka Punch](https://mayopan.jp/character/), aproximación editorial de rosa Live, amarillo Ichiko, verde Fū, violeta Tokage y granate Yuki | Afirmar que estos cinco HEX son oficiales o asignar solos no comprobados |
| **Halloween Night (original)** | [Hololive music](https://hololive.hololivepro.com/music/%E4%BB%8A%E5%AE%B5%E3%81%AFhalloween-night/) identifica Mel, Shion, Choco y Rushia; sin prueba de todos los solos por línea | [Colores documentados por la comunidad Hololive](https://vtubernews.com/datalist-0009/): Mel `#FED62A`, Shion `#8466FE`, Choco `#FE739E`, Rushia `#19E8C9` | Presentar este registro de aficionados como el estándar de color oficial o decir que todas cantan cada línea |
| **Halloween Night (Padoru)** | Conservar fielmente `colorStanzas` y `colorLegend` del cover aportado, ocho voces, múltiples colores por superposición | Colores de colaboradores ya aprobados, **NO** sustituir por los colores de hololive original | Renombrar voces de Padoru como idols originales |

**Detalles de accesibilidad:** un azul o rojo oscuro de la fuente puede no tener contraste suficiente sobre el fondo oscuro. En tales casos, conservar **el color de origen en el punto/leyenda** y usar `textColor` ligeramente aclarado para leer la letra (Ren: `#0000A0` oficial-asociado, `#9CA9FF` visible), sin presentar el valor aclarado como HEX oficial.

## Restricciones para Gimi y Halloween original

No inventar atribuciones a individuos cuando únicamente se acredita el elenco. Se conserva la leyenda con los colores investigados, pero las líneas aún no atribuidas se renderizan en color neutro **sin afirmar que las cinco/cuatro personas cantan simultáneamente**. Si más adelante se identifica una fuente de división por línea verificable, trasladarla a las estructuras de colores, no a prefijos parentéticos.

El selector Halloween sigue funcionando sin recarga de pantalla, en ambos contextos (ficha individual y superposición navegable): **División Padoru / División original**. Cada opción tiene su propia leyenda y estilo; nunca mezclar reparto Padoru con el original.

## Pruebas de regresión

- Comparación exacta de todos los caracteres de texto adaptado antes/después del procesamiento de colores.
- **0 prefijos `line-attribution` dentro de las letras cantadas** de las cuatro canciones.
- **9 prefijos `line-attribution` únicamente en los diálogos de Ruteshi**, antes del último estribillo.
- Pares y tríos con puntos multicolor; leyenda con nombres y hexadecimales de su procedencia; contraste de color legible donde procede.
- Gimi Gimi Full y TV conservan textos independientes, sin falsos solos.
- Halloween Padoru conserva sus ocho colores y segmentos preaprobados; opción original muestra cuatro muestras de color de intérpretes documentadas y texto neutro donde no consta reparto.
- Auditoría visual real de todos los detalles ES/EN/JA × escritorio/móvil con capturas de las cuatro fichas.

**Sin cambios:** música, video, eventos de Azur Lane, `Planetarium` visible, `Let's be ONE` sin evento, álbumes privados, Terminal/D1/Cron y otros proyectos.
