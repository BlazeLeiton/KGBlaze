# Project Relight — Stage 38 · CP10: paso a producción V6 aprobada
**Fecha base:** 2026-11-17 · America/Mexico_City. **Naturaleza:** checkpoint PREVIO A LA EDICIÓN de código de producción.
**Fuentes de aprobación:** capturas V6 de Stage 38 aportadas por usuario (183529/33/38, 183544/46/51/53); maqueta 6 vistas aprobada; imagen adjunta de audífonos blancos con diadema completa, sin micrófono; cotejo CP08 corregido; CP09 (PR165) fusionado a main.
**Precedencia:** correcciones explícitas del usuario y esta CP10 > CP09/CP08 corregido > CP07/CP06 > maquetas anteriores. La PR164 permanece borrador incorrecto, **NO fusionar tal cual**.

## Aprobaciones
- Rebel Mix: diseño V6 aprobado para producción. Directo a `/music/songs/` tras PR165; la landing intermedia de álbumes/listado se mantiene fuera de producción con redirección temporal 307 desde `/music/`, disponible para nuevo diseño después.
- Terminal / Salidas: diseño exterior V6 aprobado para producción; preservar 100 % del **tablero canvas original**, controles, overlays, selección, estado, actualizaciones, locales, opciones embed y editor.
- Home / Main Site: composición general aprobada, pero faltan banners audiovisuales definitivos. Usuario autoriza posponer Home si conviene; en esta publicación priorizar Rebel Mix y Terminal. No mostrar placeholders editoriales.

## Reglas de implementación
**Chrome global desktop:** logo KGBlaze arriba izquierda, enlaces Sobre Blaze / Música ▾ / Comunidad ▾ / Salidas y ES/EN/JP arriba derecha; barra social vertical izquierda arriba con cinco logos gráficos originales de la Terminal YT/TW/IG/X/Discord. **Móvil:** logo e idiomas arriba, control de múltiples líneas magenta del hero en extremo derecho abre drawer, cinco logos en franja inferior fija, margen inferior accesible.
**Tipografía:** Garnett desde fuentes web propias ya servidas, sin distribuir archivos font. **Footer:** «KGBlaze · Project Relight», solo en esquina inferior derecha de escritorio; nada de nota de trabajo.
**Rebel Mix:** kicker `KGBlaze · Scripta Lyrica` provisional, Rebel Mix y Colección musical / Music Collection / 楽曲選集. Debajo **Lista de canciones / Song list / 楽曲一覧**, filtros reales intactos, Portadas/Lista, tres columnas escritorio / dos móvil. Preservar fichas/lyrics/versiones/metadatos/artwork, modo overlay, filtros especiales y rutas.
**Terminal desktop:** kicker exterior `KGBlaze · Centro de información`; título `Aeropuerto Internacional de la KGBlaze` moderado; subtítulo `Tablero de salidas · Calendario semanal`. El original canvas ya muestra Terminales A y B; NO añadir rótulo directo al board, ni suplantar su cabecera/canvas. Página debe caber en altura viewport normal, sin vertical scroll, cuadrado completo; panel derecho Sala de espera.
**Terminal panel:** ÚNICO kicker por idioma `Información de vuelo` (ES), `Flight Information` (EN), `配信情報` (JA, según equivalencia existente) — NO mezclarlos en una frase. Título original `Sala de espera` / `Departure lounge` / `搭乗待合室`; texto exacto ES `Selecciona una salida para consultar sus detalles.`. Bajo divisor: **leyenda de estados**; bajo otro divisor: **compartir visor iframe** (escritorio sólo). Quitar botón Discord independiente, está en rail social. Móvil: panel compacto solo consulta, sin leyenda ni iframe. **No reemplazar** selección/scroll móvil al detalle y control real `Cerrar ✕`.
**Embedded:** `?embed=1` no lleva chrome externo (header, sidebar, social, footer) ni cambia dimensiones/funciones. Los trabajadores OG/social-preview tampoco han de contaminarse.
**Home si se toca:** títulos literales `Información de viaje`, `Vuela con nosotros`, `Métodos de apoyo disponibles` (esta última es adaptación intencional de «Métodos de pago disponibles» Aeroméxico). No acortar. Mantener acento sólo magenta, avión superior original con pista, bimotor relleno horizontal en tile, audífonos arco semicircular completo sin micrófono, medias tarjetas de YouTube con fondo móvil; fondo de iframe/videos real no falsificado. EN «Terminals A & B».
**No arrastrar maquetas:** «Área reservada», «Controles de semana del visor original», «Semana de muestra», «Portada existente», «Salida de ejemplo» y las notas de desarrollo no se publican.
**Protecciones:** no editar `public/index.html` de Terminal ni editor/admin, D1, API o scheduler ni archivos de catálogo, letras, créditos o arte. Cambios exterior inyectados en Worker fuera de embed. No eliminar redirección temporal de PR165. No poner links a canciones inventadas.

## Secuencia de despliegue
1. Guardar este checkpoint antes de código (hecho).
2. Implementar cambios precisos en rama sobre main ya con PR165.
3. CI de catálogo y Terminal, verificación real de 115 fichas, idiomas, GET/HEAD/307, sidebar/drawer y barra fija, panel derecho, zoom/viewport sin clipping, control Cerrar/scroll, `?embed=1` intacto.
4. Fusionar sólo si los checks pasan. Merge GitHub ≠ confirmación de despliegue Cloudflare. Verificación HTTP pública aparte; si inaccesible, informar con precisión.
5. No cerrar Stage 38 ni cambiar sus aprobaciones por trabajos pendientes de contenido Home.
