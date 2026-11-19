# Stage 41 · CP06 — Preparación inactiva del carrusel Hero

**Fecha:** 19-nov-2026 (America/Mexico_City). **No activar ni publicar promociones por anticipado.** El creador aprobó la DISTRIBUCIÓN, no las diapositivas, mensajes, imágenes o destinos.

## Diseño aprobado
- Home conserva siempre **Terminal A — YouTube** y **Terminal B — Twitch**; ni recargar ni reemplazar sus iframes por cambios de diapositiva.
- Rotan solamente la imagen de fondo y el único bloque de titular principal: encabezado breve opcional, título obligatorio y subtítulo opcional. El destino puede ser un enlace integrado en el subtítulo cuando exista un contenido real; no añadir placas, tarjetas ni botones de promoción.
- Selector vertical en escritorio, horizontal debajo del titular en móvil; transición de fundido cruzado suave; soporte para movimiento reducido. Análoga a la distribución de Aeroméxico, no una reproducción de su material gráfico.
- La **franja de reconocimiento CP05** permanece fija **después de ambas terminales** y nunca rota con la promoción.
- La diapositiva de bienvenida y Rebel Mix fueron opciones EXPLORATORIAS, **no contenido aprobado**. No figuran en producción.

## Preparación técnica CP06
Se incorpora `public/assets/home-hero-carousel.mjs`, un componente independiente que:
1. Valida schema `kgblaze-home-hero-v1`, de **2 a 6** slides, IDs únicos y contenido editorial **ES, EN y JA** completo para cada campo presente; no inventa traducciones.
2. Exige fondos locales diferenciables para escritorio y móvil (JPG/PNG/WebP/AVIF), evitando recursos remotos no autorizados y enlaces externos no verificados.
3. Implementa selector vertical/horizontal mediante CSS propio, navegación manual, transición de imagen ~900ms y texto 250ms, pausa de autoadvance con hover/foco/visibilidad, y respeta `prefers-reduced-motion`.
4. Sólo se monta cuando existen dos o más slides válidas y el Hero existente incluye ambos reproductores; comprueba carga de la primera imagen antes de modificar el DOM.
5. No altera la cuadrícula de reproductores, los iframes, el banner de Próximas salidas, la tarjeta Rebel Mix, la barra de miembros ni el encabezado compartido.
6. Se **mantiene sin importar ni conectar desde `public/home.html`** hasta la aprobación expresa de contenidos. El Hero publicado continúa con su fondo degradado y titular actuales.

La futura consola editorial podrá escribir objetos de este esquema, pero **esta PR no introduce consola, endpoints, claves, persistencia ni sincronización**. Primero se determinarán los mensajes de las diapositivas. Ningún contenido de prueba se publicará.
