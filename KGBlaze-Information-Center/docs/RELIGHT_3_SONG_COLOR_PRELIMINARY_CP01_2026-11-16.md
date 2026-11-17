# Relight — Coloreado preliminar: Let's be ONE, Gimi Gimi, Halloween Night

**Fecha de trabajo:** 16-nov-2026 (America/Mexico_City), continuidad posterior a PR #153.  
**Alcance:** tres canciones solicitadas: Let's be ONE, Gimi Gimi (Full y TV con texto actualmente idéntico) y Halloween Night, **sólo variante original**. **Ruteshi permanece sin cambio**; sus nueve diálogos coloreados, paréntesis y ausencia de subtítulo siguen aprobados. Este es un **borrador editorial**, no un reparto oficial por línea.

## Regla visual obligatoria

- `colorLegend` y `colorStanzas`; fragmentos de voces individuales o grupos simultáneos con puntos multicolor.
- **Jamás añadir nombres entre paréntesis antes de letras cantadas.**
- No mostrar textos de función, explicaciones o fuentes en la ficha.
- No cambiar la adaptación textual: concatenar `{text,voice}` de todos los fragmentos de cada renglón reproduce exactamente el texto del creador.
- Nombres en romaji en ES/EN; grafías japonesas en JA. Los colores de Gimi proceden de las franjas de las cinco capturas oficiales aportadas, muestreadas de JPG, no HEX certificadas por estudio.
- **Halloween**: preservar los ocho colores y fragmentos Padoru **bit a bit**; la distribución original se calcula en paralelo, con cuatro colores separados.

## 1. Let's be ONE — fuente de distribución Liella!

**Fuente visual aportada por el creador:** `Screenshot_20261116_211019.jpg`, página `https://ameblo.jp/lilla-part/entry-12870249699.html`. División fan; la imagen distingue cinco de primera generación, cuatro de segunda y dos de tercera.

La división previa coloreaba algunas frases españolas como un dúo/coro continuo aunque la fuente cambia de voz **sucesivamente**. Se añadió una lista de puntos de corte verificables (no se reescribe texto) y se asignaron las generaciones al final:

| Estrofa / línea base 0 | Roles en secuencia | Palabra/corte provisional elegido |
|---|---|---|
| 1/0 | Kinako → Sumire | después de «andando,» |
| 1/2 | Tomari → Tomari+Sumire+Kinako+Margarete | después de «amor» |
| 2/1 | Keke → Shiki → Keke+Shiki | después de «que» / «inquebrantable» |
| 3/0 | Mei → Natsumi | después de «haber,» |
| 4/1 | Keke+Shiki → Sumire+Kinako → las cuatro | después de «seguramente» / «conocido» |
| 4/2 | Todas → Ren+Mei | después de «seguir,» |
| 4/4 | Chisato+Natsumi → Kanon | después de «promesa» |
| 7/1 | Mei+Tomari → Ren+Natsumi → las cuatro | después de «sueño» / «compartimos» |
| 7/2 | Todas → Kanon+Chisato | después de «seguir,» |
| 9/2 | Kanon+Kinako → Kanon+Kinako+Margarete → Todas | después de «significa» / «verdad» |
| 10/0 | Kanon, sola | línea completa |
| 10/1 | 3.ª generación → 2.ª generación → 1.ª generación | después de «seguramente,» / «conocido,» |

**Precisiones por verificar antes de aprobación definitiva:** los puntos exactos dentro de los renglones 1/2, 2/1, 4/1, 4/4, 7/1, 9/2 y 10/1, porque la métrica española condensó distintas frases japonesas. Los nombres/grupos están respaldados por la captura, pero el corte silábico concreto es editorial. Especialmente el remate por generaciones de 10/1 requiere revisar el audio del cover.

## 2. Gimi Gimi — fuente: video color-coded aportado + franjas del sitio oficial

**MP4 de conversación:** `1000099175.mp4` (235 segundos); checkpoint PR #152. Los paneles resaltan el orden Yuki / Fu / Live / Ichiko / Tokage y distinguen solos, dúos y coro (algunos planos son instrumentales). El MP4 **no se copia al repositorio**.

**Paleta por franjas de las cinco capturas** (HEX aproximados de imágenes, no corporativos):
- Live `#ED788B` (rosa)
- Ichiko `#FFDC6A` (amarillo)
- Fu `#96D1B5` (menta)
- Tokage `#8378B5` (lila)
- Yuki `#B14262` (vino)

**Aplicación fuerte a estrofas españolas 0-based**:
- 0: conjunto (apertura).
- 1/0: Live → Ichiko; 1/1: Fu → Tokage; 1/4 Live+Ichiko; 1/5 Fu+Tokage; 1/6–7 Yuki.
- 2/5 Ichiko, 2/6 Live; interjecciones reiteradas mayormente de grupo.
- 4: Ichiko → Live → Fu → Tokage (cuatro líneas).
- 5/5 Yuki; 6/1 Yuki.
- 7: Yuki → Tokage → Fu → Ichiko → Live (cinco líneas).
- 9: Live.
- Gran parte de estribillos e introducciones muestra cinco paneles a color; marcar grupo sólo cuando la imagen efectivamente contiene letra. Dejar neutro lo que no se puede alinear inequívocamente.

**Precisión pendiente**: estrofa 2, intervenciones veloces 00:49–01:03; estrofa 3 últimas dos líneas, especialmente la secuencia Ichiko → Tokage → Fu+Ichiko+Tokage ~01:21–01:26; estrofa 5 línea 6, entre Yuki / Tokage; segundo estribillo (6), y tercera repetición (10) ~03:16–03:33. Los cortes elegidos en 3/7 y 10/4 son **provisionales** hasta cotejo de sílabas de la adaptación con las notas visuales. Evitar presentar como segura una asignación sólo porque cinco paneles están coloreados durante una pausa.

**Full y TV**: ambas versiones en `music-lyrics.mjs` contienen actualmente texto español idéntico; se preservan **sus entradas separadas** y el mismo mapeo preliminar, sin alterar el estado ni la versión de los videos.

## 3. Halloween Night — fuente: MV corto, asignaciones visuales parciales

**MP4 de conversación:** `1000099176.mp4`, duración aprox. 1:34, checkpoint PR #153. No hay leyenda de paneles activos como en Gimi; las escenas individuales y los colores de texto sólo proporcionan evidencia **preliminar** de quién interpreta respuestas. El MP4 **no se copia al repositorio**.

**Colores disponibles**: Mel `#FED62A`, Shion `#8466FE`, Choco `#FE739E`, Rushia `#19E8C9` (fuente de comunidad; no especificación HEX oficial).

**Aplicación al arreglo español** (5 estrofas):
- Estrofa 0: Rushia (renglones 0–1); Choco (2–3); Mel (4), Shion (respuesta 5), Mel (6), Rushia (respuesta 7), Shion (8–9).
- Estrofa 1 «Cariño no te ves muy bien» repetida: **neutra**, porque el montaje alternado 00:35–00:50 no demuestra reparto preciso de cada repetición.
- Estrofa 2: Choco en la llamada (0), «Aaaa-» neutro (1), Mel advertencia (2), Rushia «Halloween Night» (3), Shion «¿Los malos dónde estarán?» (4).
- Estrofa 3: grupo y Choco/Mel en las llamadas claramente destacadas, Shion en la salida del baile.
- Estrofa 4: Rushia inicio, luego grupo en respuestas, Shion en magia (3), Rushia en zombis (4), Mel → Rushia en «Está, a punto de empezar» (5), grupo en «Funny Halloween Night», Choco en «Crazy Night», grupo en remate.

**Precisión pendiente**: 0/4–7 (¿los cambios de llamada son realmente simultáneos o alternos?), 1/0–8 (el estribillo repetido está neutro), 2/1 («Aaaa-»), 3/3 (interjecciones y voz principal), 3/6 (Shion vs el grupo), 4/0–2 (partes de grupo/coro), 4/3–4 (respuestas entre paréntesis), 4/5 (el corte Mel→Rushia). El MV es **corto**, por lo que no debe imputarse división completa de una versión más larga por esta fuente.

## Entrega y pruebas esperadas

- Implementar sólo metadatos de color/partes en `src/music-line-attributions.mjs` y sus pruebas (no modificar `music-lyrics.mjs`).
- Comprobar igualdad exacta del texto entero por todas las estrofas y versiones; nombres romanizados/JA, leyenda de 11/5/4, 9 diálogos Ruteshi, conservación de las ocho voces Padoru, ausencia de etiquetas `(Nombre)` cantadas.
- CI Node, pruebas de portadas, auditoría visual ES/EN/JA y desktop/mobile, más comprobación HTTP después de integrar.
- Estado **preliminar**; las dudas exactas se devuelven al creador para revisión editorial, sin textos visibles en la página pública.
