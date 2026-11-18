# Project Relight · Stage 38 · CP11 — Publicación GitHub y estado verificable
Fecha de cierre operativo: 2026-11-17 (America/Mexico_City); CI registrado en UTC el 2026-11-18.
Estado: **DOS SUPERFICIES INTEGRADAS A `main` EN GITHUB; DESPLIEGUE HTTP CLOUDFLARE AÚN NO VERIFICADO**.
Stage 38 NO se declara cerrado. El Main Site (Home) conserva V5 y su contenido aún necesita la revisión editorial de banners.

## Checkpoints y aprobaciones vinculantes
- CP06 = V6 de siete capturas y texto original; CP07 = ajustes finos; CP08 = cotejo, corrigiendo título «Métodos de apoyo disponibles»; CP09 = ruta de música; CP10 = checkpoint **guardado antes del código** de la integración final. No borrar estos registros.
- Maqueta aprobada: Reel/«Rebel Mix» con catálogo directo, tres portadas desktop / dos móvil y filtros reales; Terminal con panel externo y tablero cuadrado original; Footer desktop «KGBlaze · Project Relight» a la derecha. Fuentes Garnett; sin imágenes generadas.

## GitHub confirmado
1. **PR #165** fusionada previamente; merge squash `49bb9436d3aa634a4f9c700a37b5c8115102abfc`. Música: `/music/` redirige **307 temporal** a `/music/songs/`, query e idioma conservados. Home enlaza directamente a catálogo en sus cuatro accesos; pantalla intermedia Álbumes/Lista **permanece en código** para retomarse en una fase futura.
2. **PR #166** fusionada, merge squash `90d9e007629f9c64230a1666d8d2da4c42182a71`. Añade `src/viewer-portal-chrome.mjs` + inyección acotada en Worker del encabezado y hero KGBlaze, rail social desktop, barra social móvil fija, drawer de líneas, kicker KGBlaze · Centro de información, «Información de vuelo» y «Sala de espera» con consulta, leyenda antes de compartir visor/iframe (sólo escritorio), foot desktop compacto. El renderer original se conserva sin cambiar sus controles internos, selector de salidas, autoscroll móvil ni «Cerrar ✕».
3. `public/index.html` de Terminal **sin cambios**: blob SHA `d936c47763ac063597f29bec2532e6c725a65dd5`, 961471 caracteres.
4. `public/home.html` de Home **sin cambios en PR166**: blob SHA `ea3a6c91c49132e4649cb62ce92dac65bbae423f`. Home V5 sigue siendo portada y falta terminar sus bloques audiovisuales.
5. PR #164 permanece **borrador obsoleto, no fusionado**, para evitar duplicar o degradar la V6 aprobada.

## Pruebas confirmadas
- GitHub Actions `Project Relight — continuity and Terminal regression checks`, run **44226773311**, commit de cabecera PR166 `e2d0584834c6efedfe35c75ca292b5b47d6e2f10`: **385 pruebas aprobadas, 0 fallidas**.
- Pruebas de Chrome con **HTML real del visor `public/index.html`**, estilos/JS V6 e iconos reales: vista normal y `?embed=1` pasan sin añadir la envoltura al embed; preservado canvas.
- Smoke del visor/ilustración de categoría y Dashboard editorial Chrome también satisfactorios; pruebas de navegación musical/Terminal existentes no modifican catálogo.
- Verificación postmerge de `main`: Worker incluye el guard para `?embed=1`, music307 intacto, viewer original hash intacto.

## Advertencia importante
El acceso HTTP de `https://kgblaze.dpdns.org/`, `/music/songs/` y `/departures/` desde la herramienta de consulta devolvió **inaccesible**. Esto **NO prueba** que el sitio esté caído, ni que Cloudflare haya desplegado o fallado. No afirmar «producción pública verificada» hasta confirmación desde navegador/proveedor. GitHub merge y CI sí están verificados.

## Home — PENDIENTE para revisión sin perder decisiones
- Tratar Home V5 como actual, no como una maqueta aprobada para reemplazo automático sin revisar banners.
- Confirmar recursos audiovisuales YouTube/Twitch reales; no publicar placeholders de video/imagen ni recursos inventados.
- Tipografía Garnett; corregir el botón Rebel Mix con audífonos **arco continuo, dos almohadillas, sin micrófono**, igual a la referencia visual que adjuntó el usuario; reusar iconos de paneles Twitch cuando corresponda.
- Títulos exactos, sin recorte: «Información de viaje», «Vuela con nosotros», **«Métodos de apoyo disponibles»**, adaptación deliberada del encabezado de Aeroméxico.
- Conservar franja magenta pura, bimotor blanco relleno y aeronave+pista superior; corregir enlaces/legibilidad/identidad global y footer cuando Home se termine. En inglés usar **«Terminals A & B»**.
- Logo redes original desde Terminal y cinco esenciales móvil, rail escritorio arriba; menú de líneas tamaño aprobado, sin reajuste por error de perspectiva.
- La portada Home V5 **YA sirve la raíz**; no regresar a redirección automática a Terminal.

## Próxima verificación práctica
- Abrir `https://kgblaze.dpdns.org/music/songs/` y revisar catalog real ES/EN/JA, fichas y Portadas/Lista.
- Abrir `https://kgblaze.dpdns.org/departures/` en desktop: board cuadrado entero sin scroll en ventana normal, título/idiomas/barra social/leyenda/iframe en panel. En móvil: panel debajo, scroll al seleccionar, cerrar fichas, barra inferior fija, sin iframe.
- Abrir `https://kgblaze.dpdns.org/departures/?embed=1`: SOLO visor original sin chrome.
- Revisar que Home siga V5 con enlaces directos a catálogo. Cloudflare sync es un hecho separado de merge.
