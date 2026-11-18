# Project Relight — Stage 39 · CP03
## Punto de respaldo: KGBlaze Chrome V1 (18 de noviembre de 2026)

**Estado:** congelación del diseño de escritorio aprobado por el usuario. **No es cierre de Project Relight ni reapertura de Stage 38/39** (ambas conversaciones quedaron agotadas por capacidad). Este checkpoint conserva y protege la homologación ya publicada de Home, Rebel Mix y Terminal.

**Commit de origen:** `56b07befd09e2cbcc91ef3ec82e80b520c8b4357` (PR #172 merged).  
**Validación original:** continuidad y Terminal `44336104047` = SUCCESS; auditoría completa de Rebel Mix `44336104205` = SUCCESS.  
**Estado visual:** usuario confirma explícitamente que los tres encabezados y barras sociales de **escritorio** ya están correctos; también la **silueta de audífonos** de Home. No volver a redibujar el icono.  
**URLs:** Home `/`; Rebel Mix `/music/songs/`; Terminal `/departures/`.

### 1. Contrato visual de escritorio — aprobar como BASE para sitios futuros

| Parámetro | Valor aprobado |
|---|---|
| Umbral escritorio | 761 px de ancho CSS en adelante |
| Encabezado exterior | 58 px de alto; 24 px de padding horizontal; 15 px entre agrupaciones |
| Marca KGBlaze | Garnett, 24 px, peso 750, tracking `-.045em` |
| Enlaces superiores | Garnett 12 px peso 700; separación `clamp(11px,1.5vw,21px)` |
| Idiomas/caret | Navegación `Música ▾` y `Comunidad ▾` en ES/EN/JA; mismo tratamiento tipográfico |
| Botón Salidas | **96 × 35 px**, radio 7 px; icono avión+pista 21 px |
| Grupo ES/EN/JP | **76 px** de ancho, 3 posiciones de 20 px; letras 11 px peso 750; posición mínima 30 px |
| Selección activa | Blanco `#FFFFFF` con subrayado magenta `#FA0073` |
| Idiomas inactivos | Azul claro `#A5EBFF` (no invertir en Rebel Mix) |
| Lado derecho | Gap de 15 px entre botón Salidas y grupo de idiomas; misma alineación horizontal |
| Barra social izquierda | 50 px ancho, inicia bajo encabezado a y=58 px; padding `34px 2px 16px`; separación 14 px |
| Hitboxes sociales | 44 × 30 px, visual 28 × 28 px, sin compresión ni nombres |
| Fondo del rail | `#010627`, borde `#213363` |
| Orden logotipos | YouTube, Twitch, Instagram, X, Discord, **PNG originales**, sin generar sustitutos |

La geometría compartida incluye encabezado, espacios, botones, fuentes y la barra lateral. **No incluye** igualar el ancho, alto o desplazamiento del contenido interior de Home, Rebel Mix y Terminal.

### 2. Excepciones técnicas OBLIGATORIAS

**Home (`public/home.html`)**: HTML/CSS estático, hero propio con título «Explora nuestros destinos» y reproductores YouTube/Twitch lado a lado en escritorio grande; Home puede desplazarse verticalmente. Recuerda el idioma compartido `kgblaze.locale.v1` y cookie `kgblaze_lang`. Su franja *exclusivamente magenta* pertenece sólo al hero Home. No alterar módulos audiovisuales para homologar el marco.

**Rebel Mix (`src/music-page.mjs`, `src/music-navigation.mjs`)**: HTML/CSS generado por el Worker y navegación musical con filtros, letras, versiones y portadas reales. Sus enlaces de idioma son `<a>` con `aria-current` porque se requiere navegación/estado de catálogo; no sustituir por botones de Terminal. Conserva diseño violeta y scroll vertical.

**Terminal (`src/viewer-portal-chrome.mjs`, `src/viewer-portal-ssr.mjs`)**: envoltura exterior no incrustada sobre el visor público original. Los controles nativos `data-lang` enlazan al `setLang()->render()` del tablero 1080×1080 exportable. No reemplazarlos por un segundo controlador ni alterar `public/index.html`, `?embed=1`, D1, API, cron, dashboard o cálculos de vuelo. Su tablero cuadrado mantiene ajuste a la altura de viewport **sin scroll vertical del documento en escritorio**.

**Móvil**: se conocen 56 px de header, marca 23 px, barra social inferior fija 60 px, logos 25 px. No dar por homologados los interiores móviles sólo por esta aprobación de escritorio; preservar los flujos móviles existentes y auditarlos por separado antes de cambios.

### 3. Archivos auditados y material protegido

Origen de `main` tras PR #172:

- Home `KGBlaze-Information-Center/public/home.html`, blob Git `1dfda10e46037dd02fea6c18a2c9dd404dfb630f`
- Rebel Mix `KGBlaze-Information-Center/src/music-page.mjs`, blob `239a64fa5ffb78d3547ab99bbe8d75b546deb584`
- Terminal exterior `KGBlaze-Information-Center/src/viewer-portal-chrome.mjs`, blob `35f348516c634692259c2f05356a313ec4203db7`
- Terminal SSR `KGBlaze-Information-Center/src/viewer-portal-ssr.mjs`, blob `a97cfdcaf63103a17f967f76ac6472ddaadd7ffb`
- Logotipos PNG originales `KGBlaze-Information-Center/src/music-social-icons.mjs`: sus cinco `data:image/png` son **byte por byte** los mismos usados en Home; los otros dos sitios ya utilizan esa fuente.
- **Audífonos aprobados** `KGBlaze-Information-Center/public/assets/icons/kgblaze-headphones-white.svg`: blob `d58d23681dc675e3a3679ad065b95bf847d7bf65`; **UNA silueta blanca continua**, no tres piezas, sin micrófono. Tratamiento Home escritorio 46 px / móvil 42 px. No volver a intervenir sin solicitud expresa.

### 4. Código homologado sin romper los sitios existentes

El código contiene bloques históricos de CSS acumulados por Stage 38 y 39. La apariencia computada de escritorio está aprobada; una eliminación masiva de esas reglas `!important` y bloques superpuestos sería una migración visual de riesgo. **Por esta razón no se reescriben hoy los renderizadores**, ni se intenta imponer un único HTML a sus estructuras técnicas distintas.

Se crea `src/site-chrome-contract.mjs` como **fuente común de valores para sitios futuros** (constantes congeladas + etiquetas de navegación ES/EN/JA). Se crea `tests/st39-chrome-baseline.test.mjs` que comprueba:

1. Contrato numérico y colorimétrico aprobado.
2. Logotipos sociales originales idénticos en Home y fuente compartida.
3. SHA del icono SVG: evita futuras alteraciones accidentales.
4. Independencia de renderizadores, sincronización de idioma y tratamiento especial de Terminal.
5. Métricas reales de header, marca, botones, idiomas y barra en Chrome sobre Home, Music y envoltura Terminal.

**Para nuevas superficies**: consumir `KG_CHROME_V1` y `KG_CHROME_LABELS_V1`, tomar los cinco recursos del módulo de logos común, reutilizar el sistema de preferencia lingüística, y generar un adaptador exterior según la tecnología de la superficie. Añadir esa página al test de geometría común. Si un proyecto necesita excepciones, documentarlas sin modificar el contrato base; una revisión de Chrome V1 requerirá nuevo acuerdo explícito, nuevo checkpoint y pruebas.

### 5. Matriz de no regresiones

- Home: hero/players intactos, contenido y navegaciones intactos, icono de audífonos **intocable**.
- Rebel Mix: catálogo, filtro, letras, versiones, portadas, navegación/SPA intactos.
- Terminal: canvas, idioma nativo/exportable, viewport de escritorio, `?embed=1` y API intactos.
- Todos: tipografía/contrastes, tamaños, rail y PNG originales idénticos al estado aprobado.

### 6. Alcance del respaldo

Este punto de respaldo es **documental y de contrato de código con pruebas**, no un nuevo diseño ni una autorización de cambios visuales. La fuente restaurable del estado aprobado es el commit `56b07befd09e2cbcc91ef3ec82e80b520c8b4357`. Los cambios de este CP03 deberán limitarse a agregar documentación/constantes/tests, sin modificar las seis fuentes de producción anteriores ni los assets aprobados.

No crear automáticamente Stage 40; esta etapa se decide en la continuidad editorial de Project Relight.
