# Project Relight — Stage 41 · CP04 · Notificación Epic como overlay

Fecha: 19-nov-2026 (America/Mexico_City). Corrección solicitada tras comparar dos capturas reales de Home: al copiar `PADORU`, el mini panel de confirmación provocaba que la ficha de Epic Games **se agrandara verticalmente** y todas las demás fichas se alargaran por el grid.

**Comportamiento aprobado:** la confirmación de copia aparece **superpuesta** sobre la zona de texto inferior ya existente de la tarjeta Epic Games, dentro del mismo borde redondeado, sin crecer de altura ni desplazar el resto de tarjetas, puntos del carrusel o secciones de Home. La tarjeta Epic usa `position:relative`; la notificación usa `position:absolute`, anclada al fondo y con 10px de margen horizontal, 9px inferior, `pointer-events:none` y fondo opaco para cubrir temporalmente el pie.

El mensaje sólo aparece después de la copia; persiste el resultado real (éxito o error), la temporización de 5 segundos, el portapapeles, las traducciones ES/EN/JP, accesibilidad `role=status`/`aria-live`, el logo original de Epic y el separador «·». **No modificar** ninguna otra tarjeta, sus enlaces, orden, cabecera, Terminal, Rebel Mix, D1 ni el banner de salidas.

**QA de aceptación:** prueba de navegador sobre 390px, 760px y 1440px: comparación de alturas de todas las fichas y del carrusel justo antes/después de copiar, notificación absolutamente posicionada y rectángulo completamente dentro de la tarjeta. Las restantes pruebas funcionales de Stage 41 CP03 siguen vigentes.
