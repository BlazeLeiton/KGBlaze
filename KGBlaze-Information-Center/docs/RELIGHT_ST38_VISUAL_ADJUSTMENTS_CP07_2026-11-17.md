# Project Relight Stage 38 — CP07 · Ajustes tras la revisión V6 en chat
**Estado:** instrucciones del usuario registradas; preview de siguiente pasada en curso, **NO autoriza merge general PR164**.
**Precedencia:** CP07 > CP06 > CP05 > prototipos V7 erróneos; conservar PR161/162/163 fusionadas de Home y el catálogo real.

## Secuencia de revisión obligatoria
1. Home escritorio
2. Home móvil
3. Rebel Mix escritorio
4. Rebel Mix móvil
5. Terminal escritorio
6. Terminal móvil
No reabrir Rebel Mix globalmente: usuario declaró su composición actual como **aprobada para producción**, con sólo retoques de legibilidad y menú/título móvil.

## Home (portada)
- Recuperar contraste de todos los botones, especialmente módulos blancos inferiores y encabezados de YouTube/Twitch en tarjetas **blancas en móvil**: usar texto oscuro del azul base, no gris claro/púrpura insuficiente.
- Mostrar siempre **KGBlaze** a la izquierda del header, sin desaparición/ocultación por solape en maqueta desktop.
- Ícono de audífonos del acceso Rebel Mix: **diadema de arco casi completo que conecte ambos auriculares**, **sin micrófono lateral** ni apéndice de manos libres. El último SVG de prueba con micrófono es RECHAZADO; recuperar una forma simple de dos cápsulas + diadema continua.
- Faja del hero: **únicamente magenta**. Tarjeta Próximas salidas mantiene **bimotor horizontal relleno blanco**; botón superior de Salidas mantiene el avión y pista blancos.
- Los iconos sociales son los del visor (aun si fallan cargas en la previsualización), manteniendo social rail de escritorio **alineado arriba**; cinco esenciales en móvil; ampliaciones escritorio futuras no aprobadas por ahora.
- Móvil: el título largo **«Explora nuestros destinos»** domina demasiado sobre el pictograma de menú. Usar tipografía Garnett, tamaño editorial menor con wrapping balanceado y menú fijo ligeramente mayor; copiar la **posición del motivo de líneas de Rebel Mix**, manteniendo el control al extremo derecho y ancho independiente del texto.
- Versiones ES/EN/JA: en EN «Terminals A & B» (ampersand), no «Terminals A and B». Respetar traducciones preexistentes. El fondo azul superior termina cerca de mitad de la tarjeta YouTube (según Home V5 móvil aprobado).

## Rebel Mix
- **Diseño de la última maqueta V6 revisada aprobado explícitamente para producción** por el usuario; NO rediseñar hero, catálogo directo, color, filtros ni navegación. 
- Escritorio: conservar tres portadas por fila, barra social izquierda y encabezado global. Sólo vigilar contraste de controles (texto legible, botones sobre fondo correcto).
- Móvil: motivo de líneas en extremo derecho muy bien posicionado; **aumentarlo ligeramente** para legibilidad/tamaño táctil y replicar su dimensión/colocación en Home.
- Móvil: título «Lista de canciones» y botones «Portadas/Lista» provocan desbalance semejante al encabezado Home: aplicar distribución flex/grid con `minmax(0,1fr) auto`, wrapping legible, botón con dimensiones fijas, y tamaño de texto responsivo. No sacrificar el título ni moverlo a una landing.
- Nomenclatura: KGBLAZE · SCRIPTA LYRICA provisional, Rebel Mix, Colección musical / Music Collection / 楽曲選集, Lista de canciones / Song list / 楽曲一覧.

## Terminal
- **No tocar nada del cuadro interno**, ni sus botones de idioma internos por ahora, ni canvas, overlays de selección, estados, datos, API, sistemas de actividades o funciones de selección.
- Encabezado exterior: **KGBlaze · Centro de información** como kicker; título **Aeropuerto Internacional de la KGBlaze** con tamaño moderado; subtítulo **«Tablero de salidas · Calendario semanal»** (sin repetir «Terminales A y B», pues el tablero interno ya lo contiene). Todo antes de la línea/acento.
- **Escritorio: la página completa debe caber en la altura disponible de la ventana, sin desplazamiento vertical del documento.** El tablero cuadrado debe escalarse proporcionalmente al viewport, sin ser recortado; reducir/compactar header, hero y footer; panel a la derecha. Desplazamiento interno del panel sólo como último recurso cuando viewport muy pequeño; garantizar el board entero y sus botones.
- Quitar rótulo extra «Tablero de salidas» encima del cuadro si ya aparece en el subtítulo exterior. Idiomas ES/EN/JP en barra global superior; no modificar todavía el control de idiomas propio del board.
- Panel lateral: eliminar la línea **KGBlaze · Centro de información** porque ya aparece arriba como kicker de toda la página. **Su único encabezado funcional** se traduce por idioma: ES **«Información de vuelo»**, EN **«Flight Information»**, JA **«配信情報»** (referencia previa, conservar hasta nueva corrección); **no poner tres idiomas juntos ni slash simultáneo**. Título **«Sala de espera»** (EN «Departure lounge», JA «搭乗待合室»); ayuda literal **«Selecciona una salida para consultar sus detalles.»**.
- Escritorio: debajo de una línea divisoria en panel, **primero leyenda** de estados, luego **«Compartir el visor»** y controles del iframe; texto adicional sólo si cabe y no afecta tablero. Móvil: **ni leyenda ni iframe**, panel compacto de consulta solamente.
- Funciones de selección del visor NO se tocan; al seleccionar salida en móvil **ya existe scroll hacia abajo** al panel (`selectFlight` usa `scrollIntoView` en el visor actual). No agregar botón «Deseleccionar salida» ficticio; el control REAL es **«Cerrar ✕»** del propio panel y toggle al tocar actividad. Preservar HTML/JS existentes.
- Barra social en escritorio lateral arriba; móvil inferior **fija**. Quitar Discord destacado de Sala de espera; Discord sigue en barra global. Modo `?embed=1` SIN navegación global.
- Terminal no ha sido aprobada para producción integralmente; revisar de nuevo las seis vistas antes de merge. PR164 permanece **draft**.

## Descubrimientos verificados en source 2026-11-17
- `public/index.html` contiene `#closeFlight` con texto real `Cerrar ✕`; `selectFlight(id)` ya implementa `scrollIntoView({behavior:'smooth',block:'start'})` a `#informationPanel` en móvil, si no embedded. No sustituir.
- `public/home.html` actual tiene `--navy:#020C41`, las tarjetas blancas móviles, y usa placeholders tipográficos de iconos; heredar colores explícitos en la preview.
- `src/music-page.mjs` real usa Garnett, tres portadas desktop y filtros, pero también una landing adicional; la propuesta aprobada por el usuario muestra catálogo directo, que debe implementarse en una PR propia tras QA, no a través de un rediseño múltiple.
- En el mockup NO se deben cargar, compartir ni entregar archivos de fuente Garnett. Usar `font-family:Garnett` con fuente web autorizada, si está disponible.

## Estado
Checkpoint de instrucciones; previsualización no productiva, no merge del PR164. La aprobación de Rebel Mix es de **diseño**; integración real requiere preservar el backend/metadata/DOM y validaciones de catálogo.
