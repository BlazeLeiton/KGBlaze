# Project Relight · Stage 40 — Auditoría de referencia Aeroméxico / Brand Book 2024
## CP01 — Criterios tipográficos, leyendas, jerarquías y composición (18-nov-2026)

**Fuente exacta del usuario:** `AM Brand Book newlogo VERSION 6 (1) (1) Copiar.pdf`, **Aeroméxico Brand Book 2024**, 255 páginas. Este documento de referencia se inspeccionó por texto y por páginas visuales; no se incorpora ni redistribuye en el repositorio. Las páginas citadas son las **páginas PDF**, que coinciden con el número impreso en las secciones revisadas.

**Contexto:** Project Relight está en **Stage 40**, después de agotar por capacidad todos los Stages 1–39. La base restaurable aprobada permanece en `backup/relight-st39-cp07-mobile-desktop-approved-20261118` (commit `86522a919ac45fa8bba52abac77a5d050e22e6d0`). Los cambios posteriores en main se mantienen. No reabrir Stage 39, no modificar esa rama de respaldo y no crear una etapa adicional sin agotamiento del Stage actual.

**Alcance:** Home `/`, Rebel Mix `/music/songs/` y Terminal `/departures/`. Se audita el **código principal**; la comprobación HTTP de Cloudflare fue inaccesible desde las herramientas de esta sesión. No se afirma certificación oficial, autorización de marcas ni conformidad formal de Aeroméxico: **KGBlaze no es una submarca de Aeroméxico** y aplica principios de marca por referencia visual.

### 1. Reglas efectivamente documentadas

| Sección | Manual (página PDF) | Criterio de adaptación a web |
|---|---|---|
| Fuentes | 2.4 p.87 | Garnett **Regular** y **Semibold**. En entornos *web safe*, **Arial Medium y Bold**. Mantener fuentes disponibles legalmente y soporte japonés sin distribuir archivos tipográficos. |
| Títulos y texto | 2.4.1 p.88 | Corto **37/39 pt**, tracking **−20**, 3–4 palabras/línea; largo **33/36 pt**, −20; subtítulo **18/24 pt**, −10; texto **12/17 pt**, +10 (7–10 palabras/línea); notas **7/10 pt**, +20; microtítulo **7/10 pt**, +100. **Escalar proporciones**; no convertir directamente todas esas medidas editoriales en px para web. |
| Menú y campos | 2.4.2 p.89 | Menús **mayúsculas**, Regular **9/12 pt**, tracking +75; campos/etiquetas reducidas mayúsculas 9/21 pt, +75. |
| Fechas y vuelos | 2.4.2 pp.90–91 | Fechas y duración: mayúsculas **8/10 pt**, +75; títulos descriptivos de vuelos: mayúsculas **12/15 pt**, +75. |
| Microtítulos | 2.4.2 p.92 | Descriptivos de máximo ~4 palabras; **7/10 pt**, mayúsculas, +100. |
| Líneas (estela) | 3.1 pp.116–124 | Ritmo horizontal, 2 grosores **1 y 2 pt**, mismos intervalos/cantidad. El manual prohíbe usos como ocupar más del 20%, mezclar columnas separadas o utilizar la estela como borde superior, a la izquierda o de fondo. **No confundir toda línea decorativa de KGBlaze con la estela corporativa.** |
| Cajas y disposición | 3.2 pp.125–136 | Cuatro sistemas (imagen con caja, separación vertical, separación horizontal y cajas de información). En caso 2: columna/estela ~**1/20** del ancho de la caja, separación recomendada **6n** y alto alineado con el contenido; en caso 4 se ejemplifica una jerarquía **70/30**. Son reglas de esas composiciones, **no** márgenes universales de toda interfaz. |
| Marca y pie | 3.2.5 pp.138–145 | Firma del logotipo **Aeroméxico** abajo a la izquierda en comunicaciones que lo requieren. No trasladar su logo, endoso ni reglas de co-branding a KGBlaze. |
| Colores | 2.5 pp.94–112 | Azul Premium **#020C41**, blanco cálido **#F2F2F0**, Rosa Mexicano **#FA0073**, etc.; combos dependen de fondo. **Rosa Mexicano no se usa como fondo ni para texto corriente** (pp.110–111), salvo excepción de resalte numérico. Colores de helpers reservados a avisos (p.112). |
| Sitio web | 4.2 pp.191–199 | Ejemplos de composición; las fotografías son explícitamente **placeholders**, no materiales finales. No interpretar sus imágenes como una retícula CSS de medidas obligatorias. |

**Nota de implementación de tracking:** para CSS se usa la equivalencia tipográfica convencional +75 → `0.075em` y +100 → `0.1em` al escalar, como decisión técnica (no un ejemplo de código del manual).

### 2. Hallazgos por superficie (código)

**Home**
- Sólido: Garnett, título condensado con línea ~1.08 y rótulo superior en mayúsculas, jerarquía texto/medios y espacios que dejan los dos jugadores completos en escritorio; azul Premium y blanco cálido.
- Desviación de fácil resolución: descripciones secundarias de tarjetas a 13px sin entrelínea propia. **Aplicado:** `.card p{line-height:1.4}` (frente a relación editorial 17/12 ≈1.417); no altera títulos, logo, barra, Twitch, footer ni icono de audífonos aprobado.
- Decisión abierta: tracking del titular `-.04em` / `-.045em` frente a referencia −20 ≈ `-.02em`. No modificar, porque afecta saltos y geometría del hero ya aprobado.

**Rebel Mix**
- Sólido: página con 16px/1.5 de base, Garnett, rótulo micro en mayúsculas, título con interlineado propio, control de filtros y detalles legibles.
- Desviación de fácil resolución: `.filters label` ya estaba en mayúsculas pero tracking `0.06em`, sin línea propia. **Aplicado:** `0.075em`, `line-height:1.35` y Regular (400), conservando padding, valores, selección, 44px de controles, búsqueda y datos.
- Decisiones abiertas: paleta violeta del catálogo y título `letter-spacing:-.035em` en vez de −.02em; la paleta es identidad elegida de Rebel Mix, no un error técnico de distribución. No modificar sin elección.

**Terminal**
- Sólido: rótulo superior ya homologado, nombre del aeropuerto y tablero originales, leyendas de estados con semántica propia, firma de KGBlaze y visor exportable intacto. Los datos de estado usan luces que **no son equivalentes** a helpers de alerta del manual.
- Desviación de fácil resolución: encabezados pequeños `Leyenda` / `Compartir el visor` estaban en peso 700 y tracking 0.02em, aunque funcionan como microleyendas; **aplicado:** Regular 400, tracking `0.075em`, interlineado `1.35` y mayúsculas visuales. No altera las cadenas traducidas, estados, canvas ni `setLang()->render()`.
- Decisión abierta: es importante conservar la altura adaptativa del tablero. No aplicar porcentajes de caja 70/30 o estela 6n al visor de pantalla completa: estas reglas corresponden a composiciones del manual, no al tablero funcional.

### 3. Puntos en conflicto que requieren decisión explícita

**C1 — Navegación global en mayúsculas.** El manual (p.89) exige mayúsculas para menús; el diseño aprobado Chrome V1 presenta «Sobre Blaze», «Música ▾», «Comunidad ▾», «Salidas» y drawer móvil «← Volver». Convertir todos visualmente a MAYÚSCULAS puede ampliar las palabras y romper la geometría de 96×35 del botón y el patrón del drawer. **No aplicar hasta que el usuario elija** entre conservar la excepción KGBlaze o adaptar sólo ciertos menús con revalidación visual.

**C2 — Uso real de fuentes (hallazgo RESUELTO sin cambios).** Las cinco declaraciones `@font-face` del visor fuente (`public/index.html`) contienen Garnett Regular `400`, otra cara de Garnett mapeada a `600 900`, MuseoModerno y Noto Sans JP Project `400/600`. El Worker obtiene las caras Garnett y Noto desde esa fuente y cambia `font-display:block` a `swap`. Por lo tanto CSS `700/750` se resuelve a la cara **Semibold** del rango declarado, sin implicar una tercera variante Garnett. El canvas usa `weight>=600 ? 600 : 400` y conserva **MuseoModerno Medium intencionalmente para el nombre de marca**; esto es una excepción KGBlaze, no un error de peso de Garnett. Se preserva. No redistribuir archivos de fuente ni inferir derechos de licencia.

**C3 — Colores y plataformas.** El manual prescribe parejas corporativas; Rebel Mix usa deliberadamente violeta y Home los colores nativos YouTube/Twitch. Sustituirlos eliminaría decisiones de identidad y diferenciaría peor los servicios. **Recomendada excepción** de KGBlaze para superficies musicales y marcas ajenas. No sustituir sin autorización.

**C4 — Estelas, divisores y firma.** Las reglas del manual para la **estela de Aeroméxico** (pp.118–124 y 154) y el cierre de logotipo Aeroméxico a la izquierda (p.138) no son reglas generales de cualquier barra magenta, bordo de panel ni footer KGBlaze. Aplicarlas literalmente impondría cambios visuales fuertes en Home, Rebel Mix y Terminal. **Recomendado conservar los separadores de KGBlaze como recursos propios**; sólo adoptar las relaciones 1/20 y 6n en componentes futuros que se diseñen explícitamente como estela/caja de estilo Aeroméxico.

### 4. Cambios seguros en esta PR

1. `public/home.html`: interlineado `.card p` a `1.4`.
2. `src/music-page.mjs`: etiquetas `.filters label` Regular 400, tracking `.075em`, interlineado 1.35.
3. `src/viewer-portal-chrome.mjs`: `.kg-legend h3` y `.kg-share-heading` Regular 400, tracking `.075em`, interlineado 1.35, mayúsculas visuales.
4. Test específico para estos valores y no regresiones del Chrome V1/visor original.
5. **No se ha intervenido** `public/index.html`, `src/viewer-portal-ssr.mjs`, las APIs, el catálogo, la geometría del hero, los SVG de audífonos, los iframes, colores ni las ramas de respaldo.

### 5. Validación pendiente

- Ejecutar la suite de continuidad/Terminal, auditoría musical (revisiones visuales incluidas) y pruebas CSS de Brand Book.
- Verificar en Chrome los tres sitios en escritorio y móvil sin desbordamiento de labels ni pérdida de pie/visor.
- La producción Cloudflare requiere comprobación visual posterior: acceso HTTP directo no disponible en estas herramientas.
- **No afirmar cumplimiento formal total del Brand Book** mientras C1, C3 y C4 dependan de una decisión editorial. C2 se resolvió documentalmente comprobando las caras tipográficas realmente cargadas; no requiere modificación de peso.

**Estado:** Stage 40, auditoría de adaptación en curso. El punto de respaldo CP07 permanece intacto. La corrección segura puede fusionarse si CI confirma y el resto queda pendiente por decisión del usuario, sin crear automáticamente Stage 41 (se avanzará sólo cuando Stage 40 se agote).
