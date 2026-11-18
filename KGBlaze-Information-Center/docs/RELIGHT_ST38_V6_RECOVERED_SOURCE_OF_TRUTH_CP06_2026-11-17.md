# Project Relight · Stage 38 — CP06 / Recuperación visual V6 auténtica
**Fecha:** 2026-11-17 · America/Mexico_City
**Estado:** referencias recuperadas y EVALUADAS. **NO** es autorización de implementar ni fusionar PR #164.
**Fuentes de primer orden:** mensaje de la conversación Stage 38 – Main Site que aportó el usuario, siete capturas del 17-nov-2026 (183529, 183533, 183538, 183544, 183546, 183551, 183553), y correcciones explícitas hechas en esta conversación.
**Precedencia:** correcciones explícitas más recientes > V6 capturada y su texto editorial (propuesta aprobada conceptualmente, no producción) > CP05 > Home CP01/CP02 > implementación provisional PR164.

## Hallazgo primordial
La maqueta más reciente creada en esta conversación **mezcló tres superficies**. El verdadero objetivo de la revisión interrumpida era homologar su envolvente global con Home V5, **sin reemplazar** el sistema interno de catálogo Scripta Lyrica ni el tablero operativo de Terminal. La V6 de capturas constituye referencia de **layout y jerarquía**, NO fuente de datos ni de portadas (se ilustraron con placeholders y salidas de ejemplo).

## Home V5 — preservar y corregir
- PR #161 original en main; PR #162 aeronave+línea de pista blanca en botón superior de Salidas; PR #163 bimotor horizontal **relleno blanco** en card inferior. Ícono Rebel Mix por audífonos blancos, según instrucción posterior. No renombrar ni reutilizar íconos en superficies ajenas.
- Corregir títulos reales de las tres secciones de Home; los títulos que se mostraron en la maqueta última («Información de viaje», «Vuela con nosotros», «Métodos de apoyo disponibles») **NO** corresponden a los títulos previamente aprobados. **No conocemos aún sus rótulos exactos desde las siete capturas**, que muestran sólo Music/Terminal; no fabricar sustitutos.
- Quitar **pestañas/indicadores magenta inclinados a la izquierda de los títulos**; son construcción indebida. **Conservar** el acento horizontal magenta exclusivamente en el contexto del hero de Home donde se aprobó: se trata de una especificación particular del acento, NO prohibición de que Rebel Mix o Terminal puedan tener líneas magenta en otra posición.
- Titulares, cuerpo y controles: familia **Garnett** de la identidad Aeroméxico referida por el usuario. Las capturas son reducidas y no permiten certificar la tipografía cargada; verificar CSS y licencia/autoridad de la fuente (no distribuir archivos font sin permiso).
- Móvil: el fondo azul de la parte superior termina visualmente **cerca de la mitad de la primera tarjeta YouTube**, no al principio ni al final del módulo; conservar el video sobre el fondo de transición. Menú de líneas: aprobado en la última maqueta Home, conservar comportamiento.

## Sistema exterior COMPARTIDO — confirmado por V6 y corregido
- Escritorio: encabezado completo con **KGBlaze | Sobre Blaze | Música ▾ | Comunidad ▾ | Salidas | ES/EN/JP**. **Barra social lateral IZQUIERDA** (YouTube, Twitch, Instagram, X, Discord). No sustituirla por un footer regular.
- Móvil: cabecera compacta **KGBlaze + ES/EN/JP**; motivo de líneas paralelas magenta (dos bloques asimétricos) junto al hero, al tocar abre **drawer lateral** superpuesto entre la cabecera y la barra inferior, cierre/volver accesible. No es un icono genérico de tres líneas ni otro menú distinto para cada producto.
- Móvil: **barra de redes FIJA en el borde inferior del viewport** en **ambas** páginas Rebel Mix y Terminal, a igual patrón de Home: YT/Twitch/Instagram/X/Discord, sin obstruir el final del contenido, zonas seguras y overlays. En escritorio barra vertical, no barra inferior. Los 5 logos deben reutilizar imágenes/recursos gráficos del visor REAL, no sustituir con Unicode/emoji simplificados. No es simplemente mover el enlace de Discord a un footer.
- ES/EN/JA preservados. La V6 mock tenía pictogramas y contenido ilustrativos; al implementar usar fuentes/logos reales existentes. No usar imagen generada.

## Rebel Mix V6 (capturas 183529,183533,183538)
- **Escritorio:** barra social izquierda; encabezado compartido; hero **KGBLAZE · SCRIPTA LYRICA** (el nombre Scripta Lyrica sigue editorialmente provisional), **Rebel Mix**, subtítulo **Colección musical**, separador fino; **Lista de canciones** inmediatamente después del hero; controles **Portadas | Lista**; filtros Buscar canción, Idioma, Año de estreno, Obra original; **3 portadas por fila** cuando hay espacio.
- **Móvil:** cabecera compacta con idiomas; hero Rebel Mix y control de líneas a la derecha; franja inferior fija; catálogo **directo** con Portadas/Lista y filtros apilados; **2 portadas por fila**; no hay pantalla intermedia ni mosaico «Explorar el repertorio / Álbumes».
- La V6 tiene línea magenta horizontal bajo hero; no confundir esto con la orden específica de 'franja exclusivamente magenta' de Home. Conservar identidad violeta, paneles púrpura y contraste.
- La maqueta V6 muestra **placeholders** de portadas y solo 3 ejemplos; la implementación REAL conserva 115 obras, 127 versiones, 124 IDs de YouTube y todos los filtros avanzados, letras, fichas y atribuciones. **No sustituir** portadas con bloques degradados o notas Unicode; usar assets reales.
- La nueva PR164 mantiene la tarjeta landing actual de Music y construye «Inicio / Rebel Mix / Salidas» en lugar del encabezado completo: **no reproduce la V6 recuperada**.

## Terminal V6 (capturas 183544,183546,183551,183553)
- **Escritorio:** header compartido, social rail izquierda; hero **KGBLAZE · TERMINAL INTERNACIONAL**, **Aeropuerto Internacional de la KGBlaze**, **Terminales A y B · Tablero de salidas · Calendario semanal**; separador fino; columna de tablero cuadrado 1080 (visual de la Terminal real, no tabla ficticia) a la izquierda, panel lateral a la derecha.
- Tablero etiquetado **Tablero de salidas / Programación semanal A·B** con navegación de semanas. A la derecha: **KGBlaze · Centro de información** / **Información de vuelo · Flight status** / título **Sala de espera** / texto literal **«Selecciona una salida para consultar sus detalles.»**. Con selección: mismo panel muestra los datos reales y controles de volver/cerrar. **Desktop:** utilidades iframe/copia y leyenda discreta si cabe.
- **Móvil:** cabecera compacta + hero con control de líneas + separador; tablero cuadrado en primer término; panel **Sala de espera** o detalle seleccionado debajo; **ocultar COMPLETAMENTE** herramientas de iframe, no simplemente contraerlas. Barra inferior de sociales **fija** con Discord incluido. El enlace Discord destacado independiente **desaparece de Sala de espera**; moverlo simplemente al footer normal NO satisface el objetivo.
- **Embed:** el modo ?embed=1 no debe renderizar global header, rail ni social bottom y mantiene dimensiones/canvas/controles. No cambiar D1, API, ICS, indicadores, sincronización, hitboxes, ni editor.
- La V6 usó **salidas de ejemplo**; no son emisiones reales ni estados actuales.
- La PR164 agrega un footer ordinario con Discord, no una barra social responsive en los dos sitios; utiliza encabezado global distinto del de la V6; se debe revisar y rehacer su capa externa, sin tocar el motor.

## Errores específicos que NO replicar de la última maqueta
1. Home: encabezados de sección inventados/no aprobados, barras magenta a su izquierda, tipografía distinta, corte móvil del fondo incorrecto.
2. Rebel Mix: transformar landing en dos tarjetas grandes antes de música; omitir menú líneas; omitir barra social móvil fija; usar iconos tipográficos como gráficos oficiales; nav global reducido a Inicio/Rebel Mix/Salidas.
3. Terminal: cambiar tablero real por retícula con filas de guiones, omitir el menú de líneas, trasladar Discord a footer normal sin barra social fija, presentar demo como estado real.
4. **No interpretar** comentario «la caja blanca es el que me está mejor, entre comillas» sin más referencia; puede referirse a otro elemento.
5. Tipografía Garantía: Garnett a verificar con recurso autorizado; no afirmarlo por una captura a escala reducida.

## Siguiente secuencia técnica, TODAVÍA NO AUTORIZADA
- Mantener PR164 **draft / no merge**; actualizar diseño según V6 y correcciones CP05/CP06 en una nueva revisión visual dentro del chat o staging real no descargable.
- Extraer **una sola componente** de navegación/social responsive reutilizable o equivalentes precisos en Home, Music y Terminal; asegurar que música y board tienen distinto contenido y modo embed queda aislado.
- Regenerar propuestas comparadas con las capturas escritas, respetando fuente Garnett sin distribuir font files.
- Verificar Desktop/Mobile y la ausencia de oclusión por social bar/drawer; auditar JS/HTML, los 115 registros y Terminal board real antes de merge.
- La aprobación conceptual de V6 **no es** permiso de cambiar producción.
