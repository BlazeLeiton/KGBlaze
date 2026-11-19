# Stage 41 CP02 — Botón Salidas/Departures del encabezado

Fecha de referencia: 18 noviembre 2026, America/Mexico_City.

## Capturas de producción

El creador mostró la portada, el visor Terminal y Rebel Mix con EN seleccionado. En Home y Rebel Mix, el avión del botón superior derecho sobresalía por el lado izquierdo; en Terminal no se veía. El botón conservaba el texto inglés «Departures».

## Diagnóstico

Chrome V1 Stage39 había congelado la pastilla en 96 px, insuficientes para icono SVG 21 px, espacio de 6 px, texto «Departures» y relleno de 8 px en cada extremo. El flex podía reducir o desbordar el SVG.

## Corrección

- Aumentar SOLO el ancho desktop del mismo botón a 124 px en Home, Rebel Mix y Terminal.
- Terminal: avión SVG con display:block, 21×21 px y flex:0 0 21px, sin que el texto lo reduzca.
- Mantener alto 35 px, radio 7 px, azul #276EF1, enlaces, idiomas, rail social y demás proporciones.
- Actualizar el contrato src/site-chrome-contract.mjs para registrar el override Stage41 respecto de la fotografía histórica de PR172 (sourceCommit sin alterar).
- Reforzar la prueba de Chrome real simulando el texto EN, midiendo icono y texto dentro del mismo botón. No aceptar únicamente la presencia del SVG en el HTML.

No alterar el tablero de Terminal, canvas exportable, juegos, API, cron, Reel Mix ni el banner de próxima salida Stage41 CP01.
