# Project Relight · Stage 38 — CP08 / Cotejo antes de implementación de la V6 final
Fecha local: 2026-11-17 (America/Mexico_City).
Estado: **COTEJO PREVIO, SIN EDICIÓN DEL RUNTIME NI MERGE**. El usuario ha aprobado las composiciones visuales de las tres superficies, en particular **Rebel Mix y Terminal autorizadas a pasar a producción una vez integrados ajustes y superada QA**. La instrucción más reciente exige recibir primero este cotejo. No fusionar PR164 como está: es draft y anterior a la última maqueta aprobada.
Evidencia: última maqueta interactiva «KGBlaze · Stage 38 — Revisión de seis vistas», captura adjunta PNG `image(20261118-014748).png` como referencia gráfica de audífonos, instrucción del usuario (17-nov-2026), screenshots V6 previos 183529, 183533, 183538, 183544, 183546, 183551 y 183553, CP05–CP07.

## Estado exacto en GitHub (consultado antes del cotejo)
- `main` `public/home.html`: título sección 1 = «Información de viaje», sección 2 = «Vuela con nosotros», sección 3 = **«Métodos de apoyo disponibles»**; el texto **se conserva completo e intacto**. El usuario confirmó que se inspira deliberadamente en «Métodos de pago disponibles» de Aeroméxico; no eliminar «disponibles». Música continúa con `♫` en la card de Rebel Mix; avión bimotor relleno y avión+pista superior ya existen y deben preservarse. Home sigue usando `system-ui` no `Garnett`. Mantener la actualización de tipografía y legibilidad.
- `main` `src/music-page.mjs`: Garnett y catálogo/filtros reales ya existen, pero el índice tiene una landing intermedia `music-home` («Explorar el repertorio/Álbumes»). La V6 aprobada **elimina esta intermediación** a favor de `Lista de canciones` inmediatamente debajo del hero; requiere adaptación de navegación y plantilla sin tocar las 115 obras, letras, créditos, versiones ni portadas.
- `main` `src/viewer-enhancements.mjs`: no contiene `mountPortalChrome`, nav compartido o bar social; el visor base tiene sus propias funciones. El diseño V6 no está publicado ahí. **No tocar `public/index.html` (tablero original)** ni romper sus capacidades. El control actual de retorno de ficha es `Cerrar ✕`, y el scroll móvil a panel ya existe.
- PR164 permanece **open, draft, NOT merged** y su implementación V7 es anterior a la recuperación V6; la PR no sirve tal cual para publicar.

## Referencia exacta del audífono (adjunto del usuario)
- Adjunto es una **imagen PNG** morada redondeada con **icono blanco de audífonos**, no el código SVG original.
- Geometría: arco de diadema **casi completo y continuo**, baja hacia las dos orejeras simétricas de extremos inferiores; orejeras discretas, curvas, sin varilla, sin brazo de micrófono, sin cable. Grosor blanco consistente. **Rehacer sólo SVG equivalente a esa imagen**, sin imágenes generadas ni cambio de identidad. Agrandar proporcionalmente en tile, sin inventar características. No reutilizar icono anterior con micrófono ni una silueta genérica diferente.
- El usuario aprueba el resto de la maqueta, incluyendo tamaño actual del menú móvil (la percepción de diferencia era perspectiva); **no agrandar ni cambiar el menú ya aprobado**.

## Home / Portada
- Confirmación final de headings: **«Información de viaje»**, **«Vuela con nosotros»**, **«Métodos de apoyo disponibles»**. Retirar marcas magenta inclinadas a izquierda (no estaban aprobadas); conservar líneas magenta horizontales aprobadas y fondo móvil cortando a media tarjeta YouTube.
- Legibilidad cajas blancas y botones garantizada con texto oscuro; `Garnett` cuando el sitio pueda servir el recurso autorizado, sin distribuir fuente fuera de la aplicación.
- Encabezado KGBlaze visible, navegación global ES/EN/JA, social rail iconográfico lateral desktop arriba y franja social móvil fija. Copiar iconos sociales **reales** `LOGOS` embebidos de Terminal, **no nombres de redes como sustitución**; resolver cargas/bloqueos, comprobar. Cinco esenciales móvil; ampliaciones escritorio sólo idea futura.
- EN usar «Terminals A & B»; no modificar el icono superior avión+pista ni el inferior de bimotor relleno.
- El banner/medios de Home aún no definitivos; antes de publicar verificar que no se exhiben placeholders engañosos ni enlaces de ejemplo como recursos confirmados. La portada se considera **aprobada visualmente**, condicionada a estos ajustes y contenido multimedia existente/faltante, no a otra reinterpretación.

## Rebel Mix
- **APROBACIÓN VISUAL EXPLÍCITA PARA PASAR A PRODUCCIÓN** de la última maqueta. No rediseñar. Catálogo directo, filtros, Portadas/Lista, 3 columnas desktop/2 móvil, tonos violetas, hero `KGBlaze · Scripta Lyrica` **provisional**; subtítulo Colección musical / Music Collection / 楽曲選集; título Lista de canciones / Song list / 楽曲一覧; solucionar legibilidad/apilamiento móvil sólo según versión final aprobada.
- Menú de líneas en móvil: tamaño y posición actuales **aprobados**; conservar. Rail desktop superior y 5 redes en barra móvil inferior fija con logos existentes, no nombres solos.
- Homologar **header compartido de Home/Terminal**, no el encabezado reducido o improvisado de PR164.
- No infiltrar notas explicativas o temporales en la interfaz publicada ni mostrar placeholders de portadas en lugar de assets existentes.
- Preservar todos los registros/links/credits/lyrics/modes; QA real ES/EN/JA, responsive y rutas music. Nada de alteraciones a datos ni autorías.

## Terminal / Salidas
- **APROBACIÓN VISUAL EXPLÍCITA PARA PASAR A PRODUCCIÓN** una vez integrado al **visor auténtico** y validado sin regresiones. Cabecera exterior compartida: `KGBlaze · Centro de información`, `Aeropuerto Internacional de la KGBlaze`, `Tablero de salidas · Calendario semanal`; el board ya informa Terminales A y B dentro y **no se toca**.
- Desktop: **board cuadrado 1080 basado en canvas real completo** debe caber en altura disponible mediante CSS responsivo sin desplazamiento vertical de la página en tamaños normales. Panel Sala de espera al lado. Footer desktop compacto: solo `KGBlaze · Project Relight` alineado **abajo a la derecha**.
- Panel: únicamente encabezado por idioma `Información de vuelo` / `Flight Information` / `配信情報` (referencia previa japonesa sujeta a homologación de traducciones originales), después título `Sala de espera`, ayuda **«Selecciona una salida para consultar sus detalles.»**. Cuando seleccionan una salida se muestran los datos/autoscroll móvil y retorno **EXISTENTES**. No inventar botón «Deseleccionar salida».
- En desktop separador → leyenda de estado → separador → compartir el visor (iframe/copia); en móvil sin leyenda, sin iframe, sólo datos y consulta. Modo `?embed=1` debe conservar canvas sin chrome externo.
- No publicar textos de maqueta `Controles de semana del visor original`, `Área reservada para el tablero ...`, `Semana de muestra`, `Salida de ejemplo A/B`, otras notas explicativas. En producción tablero e interfaces reales; sin reescribir estados, cron, API, D1, dashboard ni controles.

## Footer común
- **Sólo escritorio**: pie discreto con `KGBlaze · Project Relight` **alineado a la esquina inferior derecha**, sin enlaces o textos duplicados salvo aprobación posterior. En móvil la barra fija de cinco redes sociales prevalece; footer no debe taparla.
- Cabecera global **homologada en las 3**: brand KGBlaze legible, Sobre Blaze, Música ▾, Comunidad ▾, Salidas, ES/EN/JA; móvil brand+idiomas, hero menú de múltiples líneas y drawer; no modificar el motivo por perspectiva.

## Puerta de publicación y orden
1. Presentar primero el cotejo de estas instrucciones y pedir confirmación **sin repetir toda la maqueta** (el usuario pidió cotejo ANTES de actuar).
2. Una vez validado, implementar por superficie con compartición de navegación/social, protegiendo backend, rutas, catalogue, visor real/embeds.
3. QA: tests unit/integración, pruebas visuales desktop/móvil ES/EN/JA, ancho/alto de ventana de Terminal, teclado, posición redes, portadas originales, botones/links, iframe sólo escritorio, cierre y scroll de selección reales.
4. No fusionar PR164 en su estado actual. Si hay impedimentos a la publicación, reportarlos; un merge GitHub no prueba despliegue Cloudflare.
5. Cierre con commits/PRs reales + estado deployment verificado, sin suponer éxito de deploy.
