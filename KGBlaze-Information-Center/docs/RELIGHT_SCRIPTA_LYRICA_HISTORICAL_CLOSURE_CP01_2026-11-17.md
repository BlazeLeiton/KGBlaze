# Project Relight — Scripta Lyrica
## Norma canónica de nuevas integraciones y checkpoint de cierre de recuperación histórica
**ID operativo:** RELIGHT-SCRIPTA-LYRICA-HISTORICAL-CLOSURE-2026-11-17-CP01  
**Fecha:** 17 de noviembre de 2026 · zona editorial \`America/Mexico_City\`  
**Repositorio:** \`BlazeLeiton/KGBlaze\` · \`KGBlaze-Information-Center/\` · rama \`main\`  
**Estado:** **recuperación histórica e ingesta editorial inicial CERRADAS**. Nuevos registros: flujo regular de nuevas incorporaciones con autorización y pruebas.  
**Precedencia:** decisiones explícitas posteriores de la persona creadora > esta norma para el caso afectado; esta norma es el contrato general vigente. No invalida ni renumera R8-FINAL, protocolo nuclear v4, Stage 25 Musical Script ni checkpoints originales. Stages 26–37 se agotaron por capacidad conversacional; su agotamiento no prueba cierre de Project Relight en su conjunto.

### 0. Alcance exacto del cierre

Este checkpoint declara que el **catálogo musical histórico recuperado** ya fue incorporado, reconciliado y auditado como corpus de referencia. No declara que: (a) todos los videos externos estén disponibles, (b) todas las adaptaciones se deban volver a revisar por significado, (c) los álbumes estén publicados, (d) las grabaciones privadas se hayan subido, (e) todo el proyecto web haya concluido ni (f) se hayan aprobado decisiones técnicas/estéticas futuras.

**Inventario de base, antes de añadir obras nuevas:** 115 obras (\`songs\`); **127 registros de versión**; **124 ID de video distintos**, incluido uno histórico marcado \`public:false\` de *High Free Spirits*; **123 registros con ID no privados** (no confundir con disponibilidad real); **3 audios reservados y no públicos** (*Dokimeki Diary — album-studio*; *La vaguelette — es-audio y fr-audio*). 11 álbumes o agrupaciones **internas**, no publicadas; **8** campos de evento aprobados. Portadas preservadas **115/115**, sin pendientes de snapshot en la auditoría de CI de cierre. La cifra correcta no es 126 versiones / 123 ID totales: ese recuento omitía la edición histórica no pública de *High Free Spirits*. Recalcular y actualizar el baseline intencionalmente para cada nuevo alta aprobada.

**Jerarquía de fuentes:** texto/decisión directa de la persona creadora > documento original aportado (DOCX, captura, letra propia) > pruebas y registro público ya aprobado > fuentes oficiales externas para datos de obra de origen > fuentes secundarias etiquetadas como tales. La ausencia de evidencia **no** autoriza completar con conjeturas.

## 1. Identidad, dominio y ámbito

- Nombre: **Rebel Mix — Scripta Lyrica**, la colección musical interpretada/adaptada del creador; **no** mezclar con la playlist **AniMusic**, que archiva música de terceros.
- ES: **Colección musical**; EN: **Music Collection**; JP visible: **楽曲選集**. Códigos internos: \`es\`, \`en\`, **\`ja\`** (no \`jp\` en claves locales); \`JP\` es una etiqueta pública de origen, no código de interfaz.
- Rutas canónicas existentes: \`/music/\` (entrada), \`/music/songs/\` (catálogo), \`/music/songs/<slug>/\` (ficha). Mantener redirecciones 308 heredadas y enlaces internos. \`/music/albums/\` y las páginas de álbum **siguen reservadas/no publicadas**.
- Los datos de la Terminal \`/departures/\`, visor, Dashboard V25 y estado D1 se mantienen independientes. No cambiar rutas ni controles de acceso de la Terminal al integrar una canción. Diseño/eficiencia/estética son una **etapa posterior**.

## 2. Modelo de contenido: obra, versiones, variantes y registro histórico

- **Una obra musical = una ficha estable** con \`slug\` único en \`src/music-catalog.mjs\`. No crear una obra adicional por resubidas, versiones lingüísticas, edición TV/Full, instrumentales, duetos, arreglos o grabación destinada a álbum. Cada una es \`versions[]\` con \`id\` distinto y metadatos específicos.
- Cada nueva entrada requiere **nombre de obra**, artista original correctamente identificado, obra/serie de procedencia según su lanzamiento original, y por lo menos una versión real documentada. Añadir año y fecha únicamente si se conocen con precisión defendible. \`date\` es la fecha de versión interpretada; \`videoPublishedDate\` es la fecha de subida actual cuando difiere; \`firstDocumented\`, \`datePrecision\`, \`dateEvidence\` y \`historicalPublications\` explican incertidumbres sin falsearlas.
- \`videoId\` es la identidad histórica de un video, **no** prueba de que esté visible. \`currentVideoId:null\`, \`videoStatus:'blocked'\`, \`reuploadPending:true\` impiden ofrecer reproductor disponible para videos bloqueados. No borrar la historia de reclamaciones/reenvíos; tampoco publicar enlaces de videos sin acceso. Un ID histórico puede coexistir con \`public:false\` si la grabación fue reemplazada. **No duplicar un ID** en registros diferentes sin una razón documentada y protección explícita.
- Audios no publicados usan \`medium:'audio'\`, \`availability:'pending'\`, \`public:false\`, \`videoId:null\` y sin fecha inventada. Los tres actuales quedan preservados. **No activar reproductores, MEGA, descargas, audios privados ni versiones inéditas** sin autorización específica.
- Las *alternativas* son versiones de la misma obra y pueden usar \`lyricVersion\` y \`lyricAliases\`. \`lyricScope:'version'\` cuando Full/TV, solos/duetos o variantes tienen texto propio. La versión elegida en la ficha debe seleccionar letras, créditos y grabación correctos; no reciclar otra versión silenciosamente salvo alias declarado y comprobado.
- Estados externos legítimos: bloqueos de *Please, please!*, *twilight little star* y *THERE IS A REASON*, ediciones históricas reemplazadas y videos reclamados. Un bloqueo no es una obra ausente. No alterar estado por inferencia.

## 3. Nombres, idioma y presentación de ficha

- La ficha mantiene la **obra original** identificable, con \`title\`, \`romanized\` para título japonés cuando procede, \`localizedTitle\` cuando haya título aprobado en otro idioma, y \`alternativeTitles\` / alias de búsqueda sin duplicar fichas.
- Títulos originalmente en **inglés con adaptación española localizada**: en vista ES título español principal e inglés secundario; en vistas EN/JA título original inglés principal y español secundario cuando la correspondencia esté aprobada. **Japonés**: conservar grafía japonesa + romaji pertinente, sin inventar subtítulos ni duplicar el título. *Leon no sabe que existo* conserva esa identidad como título original de la parodia.
- Los datos visibles se localizan en ES/EN/JA mediante el mismo sistema de etiquetas, rutas y estado. \`langs\` en versión registra **lenguas realmente cantadas**, no idiomas disponibles de la interfaz ni idioma de la serie. No declarar "Multilingüe" a una versión monolingüe.
- Mostrar datos relevantes y verificables de \`theme\`, \`season\`, \`sourceEdition\` (japonés/internacional), \`sourceJapanese\`, contexto de obra en su lugar correcto, afiliaciones y eventos. Los números de temporada de Pokémon corresponden a la **primera temporada internacional** de aparición; arco japonés/edición de origen se modela aparte. No añadir filas redundantes de **Contexto**, **Localización** o **Versión de referencia** a fichas donde se decidió simplificar; usar los campos de obra/edición/tema ya homologados.
- \`event\` **sólo** para acontecimientos originales explícitos y verificados. Los ocho eventos aprobados son: *Under the Party Lights*, *Ougon Kouro*, *Blue Spirit*, *Feelin' It All*, *Signal*, *Ain't Backing Down*, *Tempesta's Claim*, *What You're Made Of*. *Let's be ONE* **no** tiene evento público. *Planetarium* conserva como procedencia \`holo*27 Originals Vol.1\`, **no** como evento arbitrario.
- Franquicias y filtros: original-release context de hololive (JP/EN/ID, unidades/generaciones) y Love Live! (grupos/crossover) sin atribuir por defecto la generación posterior del intérprete a la obra original. Grupos de Sword Art Online / Ordinal Scale / GGO bajo su familia de filtro, preservando título específico en ficha. Pokémon mantiene etiquetas de bloque correctas.

## 4. Créditos: original, cover, adaptación y ajustes

- **Artista original** y **personajes/voces originales** pertenecen a la obra fuente. **Interpretación** corresponde a Blaze Leiton y colaboradores reales de la grabación propia. **Adaptación**, **Adecuaciones** y otros créditos textuales son categorías diferentes. Nunca copiar el reparto del anime como intérpretes del cover ni inversamente.
- Fuente estructurada de intérpretes originales: \`src/music-performers.mjs\`. Conservar nombre del personaje/voz/CV cuando se verifique; evitar repetir la fila de "Voces originales" si sólo replica un solista ya identificado como artista original. Mantener desgloses de grupo cuando aporten identidad real.
- Acreditar adaptaciones aportadas por terceros con el **nombre aprobado**. \`adjustmentCredit:'Blaze Leiton'\` / fila pública **«Adecuaciones: Blaze Leiton»** cuando sólo corrigió, masculinizó o amplió texto de otro adaptador; no reclamar la adaptación entera. No exponer detalles técnicos/privados de ampliaciones en los créditos compactos.
- Decisiones protegidas: *Otome-domo yo* usa adaptación de **Marutah**, Blaze sólo cambios pertinentes; *Ryuusei* adaptación de **SINAY PAOHLA**, con adecuaciones Blaze; *Brave Shine* referencia **Call Me Bury (Bury Singer)** sin inventar autoría no verificada; Pokémon Theme distingue **Jason Paige** (interpretación española de **Óscar Roa**), **Adolfo Aguirre Gamboa** y adecuaciones Blaze; *XY&Z* acredita **Itani** + adecuaciones Blaze.
- *Ruteshi Kisuki Shiteru* muestra **«Interpretación: Blaze Leiton feat. V.A.F.M.O.»** sin fila duplicada; el registro documental de **nueve intervenciones habladas** no significa que nueve participantes canten. *Kirameki Rider* conserva reparto **hololive** en la leyenda vocal y **Team Padoru** en interpretación propia.
- Los nombres/alias de colaboradores deben ser correctos y, cuando exista, conservar evidencia de canal. No expandir o modificar nombres artísticos sin autorización.

## 5. Letras, revisión editorial y divisiones vocales

- Fuente única para texto aportado por la persona creadora: \`src/music-lyrics.mjs\`; \`lyricsBySong[slug][version]\`, \`lyricOrder\`, \`lyricAliases\`. Preservar **texto, signos, acentos aprobados, ortografía, estrofas, orden y variantes**: no volver a adaptar por juicio semántico. Las letras japonesas originales de terceros **no se importan desde páginas externas como letra propia**; las capturas/archivos proporcionados pueden servir de referencia crítica en revisión privada.
- Formato del sitio: \`colorRole\`, \`colorLegend\`, \`sharedLabel\` (ES/EN/JA), \`sharedColor\`, \`colorStanzas\`, \`colorStanzasJa\` si existen, \`duetStanzas\`, \`secondary\` / \`overlap\` y \`lineAttributions\` son **los mecanismos homologados**. No construir un segundo sistema de UI, no insertar nombres de cantantes en los versos, no pintar toda una frase a un solo color si cambian las voces.
- Cada parte \`{text,voice}\` **debe contener texto no vacío**; la concatenación ordenada de las partes de cada línea y de todas las estrofas debe ser **idéntica** al \`text\` almacenado. Los espacios reales pueden ser fragmentos cuando preservan el texto; un fragmento \`text:''\` no tiene función y debe eliminarse.
- Individual: color del intérprete reconocible y contraste según paleta existente. Grupos simultáneos con \`+\` y puntos de color; \`shared\` como coro, etiqueta local adecuada (Todas/Todos/Ambas/Ambos según reparto). Relevos vocales se dividen en partes sucesivas. Utilizar la leyenda aprobada/colores oficiales o ampliamente reconocidos; \`textColor\` puede mejorar contraste sin falsear la identidad. El usuario aprueba los **cortes**; una traducción de significado más literal no debe reabrir la letra.
- Si la asignación original es de aficionados, describirla como **referencia no oficial**, aunque los cortes españoles estén aprobados por la persona creadora. Si hay una voz no atribuida, conservar neutralidad; no completar por conjetura.
- Excepciones vigentes: *Halloween Night* tiene **dos repartos independientes** (hololive original y ocho voces Padoru). *Suki! Yuki! Maji Magic* excluye los encabezados especulativos «Trío Muérdago/Galletita/Caramelo»; mantener las nueve voces y partes autorizadas. *Gimi Gimi* conserva Full/TV y las correcciones Tokage→Fu→Ichiko; pasajes originales no identificados siguen neutros. *Let's be ONE*: **11 integrantes de Liella!**, 11 estrofas / 41 versos y cortes españoles aprobados en PR #159; no evento. *Pokémon Johto*: quitar sólo el segmento vacío final de «Un lugar mejor con una nueva actitud», preservar Blaze / espacio compartido / Kotoko. *RVR*: invitado variable en nota discreta y secundaria, sin fingir nombre fijo.

## 6. Material gráfico y procedencia

- \`src/music-artwork.mjs\` + snapshots WebP en \`public/music-artwork/\` (y manifest de preservación) registran **arte de la publicación original** o referencia contextual verificada; **no** confundir la portada del cover de Blaze con la edición oficial del material fuente.
- Preferir jacket digital/CD oficial, ilustración autorizada y edición exacta, con \`sourceImage\`, \`source\`, \`release\`, \`kind\`, \`fit\`, versión de imagen. Cuando sólo exista arte promocional/contextual, clasificarlo honradamente; **no generar sustitutos inventados**, no quitar franjas de ediciones comerciales ni cortar ilustraciones aprobadas sólo por uniformar cuadrados.
- No tocar portadas aprobadas sin revisión individual. Ejemplos protegidos: *Ruteshi* v2 LACM-14260; *Gimi Gimi* conservada; *Karakuri Pierrot*, *Ougon Kouro*, *Under the Party Lights*, *Shukufuku*, *U—BELLE* aprobadas; *spektro* primera imagen del episodio con respaldo de single. Comparaciones visuales futuras siguen fuera de este cierre editorial.
- Antes de fusionar: registrar procedencia, preservar arte histórico y ejecutar auditoría WebP/manifest; fallback transparente cuando el recurso externo deje de responder, sin mentir sobre fuente ni usar imágenes generadas para taparlo.

## 7. Álbumes: registro privado, sin activar audios

- \`src/music-albums.mjs\` contiene **11 agrupaciones internas**: las históricas 1–9; 10 *Ensamble Alternativo* y 11 *Más Allá del Mundo* **planeadas/no publicadas**. El álbum es vínculo editorial de canciones existentes, **no** una obra nueva por pista; listas y fechas de lanzamiento de álbum NO se infieren del orden de publicación de versiones.
- **Horizontes de Aventura (histórico 06)**: \`tracks:[]\`, \`tracklistStatus:'pending-confirmation'\`, \`ordered:false\`, \`releaseDate:null\`; conservar \`candidateTracks\` como **orden PROVISIONAL aprobado para gestión interna**, no tracklist definitivo. Orden del 17-nov:
  1. *Dokimeki Diary* — \`album-studio\` (primero por decisión de autor, sin fecha inventada).
  2. *LEVEL* — ES (2022-06-17).
  3. *Koko Kara, Koko Kara* — ES (2022-06-25).
  4. *Kono Tate ni, Kakuremasu* — ES (2023-04-23).
  5. *Ano ne.* — ES (2023-06-29).
  6. *Ano ne.* — Loved Ones (2023-07-01).
  7. *Zutto* — ES (2023-07-08).
  8. *RVR ~Rising Volt Tacklers Rap~* — ES (último por decisión de autor, aunque 2023-06-09).
  Así se mantienen ocho **versiones** correspondientes a siete **obras**. Evaluación definitiva del orden, selección y audios: **fase de álbumes**, no deuda de integración del catálogo.
- Las entradas de \`relatedVersions\` no inflan el número de obras; preservar las reservas sin publicar fuentes inéditas.

## 8. Correcciones finales del cierre (17-nov-2026)

1. *Pokémon Johto* (estrofa 10, línea 3): se eliminó \`{text:'',voice:'shared'}\` al final; permanece \`Un lugar mejor\` (Blaze) + espacio compartido + \`con una nueva actitud\` (Kotoko), sin cambiar carácter alguno del texto.
2. *Horizontes*: candidatos reordenados según §7, con \`candidateOrderStatus:'creator-provisional-2026-11-17'\`; álbum NO publicado.
3. *THERE IS A REASON*: fecha de **primera publicación declarada por el creador: 2023-12-16**; el aviso de Content ID del 16-dic demuestra que la subida existía ese día, no prueba independientemente la hora de puesta en público. Conservar **todas** las resubidas/reclamaciones de 2023–2024, bloqueo y \`currentVideoId:null\`. No atribuir a la grabación original el ID de resubida \`spxnKeBQpo8\`.
4. *Halloween Night* y *Suki! Yuki! Maji Magic*: antiguo campo \`status:'publication-link-recovered; cast-confirmed; integration-pending'\` sustituido por \`publication-link-recovered; cast-confirmed; integrated-in-public-catalog; archive-reference-only\`. La fuente de trabajo se **archiva** en \`src/music-block05-collaborations.archived.json\`; se elimina el nombre engañoso \`.pending.json\`. Es testimonio histórico, no fuente autorizada para reimportar borradores de voces o sobrescribir fichas ya aprobadas.

## 9. Contrato obligatorio para una nueva integración posterior al cierre

**Entrada de cada incorporación:** prueba de pertenencia al repertorio/interpretación; slug y título fuente; versiones exactas con ID/canal/fecha/visibilidad; artistas originales, intérpretes del cover, adaptador(es) y adecuadores; obra/edición/arco, fuente de créditos, idiomas reales; texto aportado por creador o autorización pertinente; estrofas y atribuciones con grado de certeza; fuente de imagen y variante; relación con álbum si procede.

**Implementación:** añadir una sola obra a \`music-catalog\`; \`lyricsBySong\` y alias/variantes; \`releaseArtwork\` con snapshot reproducible; \`music-performers\` / \`works\` / \`franchises\` / \`pokemon-tags\` según corresponda; \`music-line-attributions\` sólo para atribuciones justificadas; \`music-albums\` sólo si hay membresía aprobada. Mantener rutas, objetos localizados ES/EN/JA y selección de versión coherentes. No crear campos visuales redundantes ni publicar borradores.

**Validación antes de merge:** inventario esperado + delta explícito; unicidad de slug/versión/video ID; ninguna ficha sin letra o recurso de imagen resuelto; texto reconstruido exactamente desde \`colorStanzas\` / \`duetStanzas\`; sin segmentos vacíos; créditos sin falsas atribuciones; variables de tiempo/procedencia conservadas; álbum/versión apuntan a entradas reales; contratos de eventos e idiomas; \`npm test\` + CI de continuidad y catálogo; pruebas de páginas ES/EN/JA y escritorio/móvil. **Después**: verificar \`main\`, comprobar HTTP público con el conteo actualizado y ficha(s) nuevas, distinguir HTTP y despliegue real de ejecución local. No dar CI como equivalente a verificación auditiva del cover o a corroboración histórica de toda fuente externa.

**Control de cambios:** PR acotada, revisión editorial explícita para corrección creativa; cambios de diseño, rendimiento y reproductor se abren como fase separada. No renumerar Stages agotados ni cerrar Stage 25 Musical Script por esta decisión. El baseline anterior queda inmóvil como checkpoint; futuros registros incrementan la cuenta con una justificación por versión y un test actualizado. Mantener historiales de PR/checkpoints disponibles para trazabilidad, pero **no volver a reabrir su recuperación histórica por cada alta nueva**.

## 10. Estado de cierre y excepciones legítimas

**Concluido:** reconstrucción y conciliación de las 115 obras, sus 127 versiones, referencias de letras y portadas; estructura pública de fichas, créditos, eventos, agrupaciones y distribuciones; reparación de discrepancias terminales de §8; consolidación normativa y prueba automatizada; confirmación de producción postmerge según ejecución de CI vinculada (añadir enlace/commit en PR).

**Fuera del alcance y abiertos sólo como trabajo futuro separado:** audios privados; publicación y orden definitivo de álbumes; disponibilidad de videos bloqueados; precisión técnica, visual y de experiencia; auditoría exhaustiva a oído; mejoras pendientes del visor/agenda y Studio/Terminal; nuevas obras. Una excepción conservada **no** es un incumplimiento del hito histórico.

**Condición de cierre efectivo:** PR de este checkpoint fusionada en \`main\`, suite de regresión y auditoría completa sin fallos y verificación HTTP de producción confirmada. Si algún chequeo falla, documentar el fallo y no afirmar certificación completa hasta corregirlo. 
