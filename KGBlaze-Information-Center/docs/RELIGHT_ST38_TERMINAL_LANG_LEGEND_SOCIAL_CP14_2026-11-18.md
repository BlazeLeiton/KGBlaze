# Project Relight — Stage 38 · CP14 (precisiones de producción)
Fecha: 2026-11-17 America/Mexico_City (~22:06). Estado: checkpoint ANTES de código de la nueva corrección, basada en cuatro capturas reales del usuario (20261118-035703, -035745, -035753, -035838).
Autoridad: correcciones explícitas del usuario > V6 aprobada CP08/10/12/13, producción PR167. No recrear ni tocar datos de catálogo/Terminal.

## Observaciones y requisitos
- Home V6 mejoró; **el icono de audífonos del tile Rebel Mix desapareció** visualmente aunque el SVG existía inline en `public/home.html`. Recuperar icono como asset SVG vectorial blanco visible (arco de diadema casi completo; 2 copas; NINGÚN micrófono), del panel Twitch original aprobado, dentro del tile morado; no generar imagen ni duplicar fondo.
- El rail social de los tres sitios: el usuario **no requiere nombres debajo de los logotipos**; suprimir rótulos visibles, conservar links y `aria-label`. Fondo algo **más oscuro** que azul principal (p. ej. `#010627`) para separar iconos sin cambiar los fondos editoriales de las tres superficies; mismo diseño en desktop y móvil. No añadir redes extra.
- Home: el panel lateral parece «forzado», por lo que suavizar su contraste, evitar nombres y verificar que no invada main; terminar footer derecha como acordado, no rediseñar Home ni sustituir YouTube/Twitch.
- Terminal: cambiar heading **«Cómo leer el tablero» → «Leyenda»** en ES; equivalentes EN/JA. Enumerar los **nueve estados reales** de `public/index.html` agrupados según **cinco luces de statusColor()**, NO según el PALETTE decorativo de las etiquetas:
  * `#67D9F7` azul cian: A TIEMPO.
  * `#F5BF47` amarillo: POR CONFIRMAR / REPROGRAMADO.
  * `#36D978` verde: EN VIVO.
  * `#ED006F` magenta: CANCELADO.
  * `#62739D` gris: DESPEGÓ / DESCANSO / ESCALA (etiqueta ES «EN TRÁNSITO») / HIATUS.
 Los textos EN/JA deben provenir de equivalencias originales `STATUS_EN/STATUS_JA`; agrupar de verdad por luminaria, no generar estados ni colores.
- Terminal: los tres botones de idioma del nuevo header **no funcionan**. El visor original conserva los botones funcionales en `.viewer-header .top-langs button[data-lang]`, pero su header antiguo está oculto. **Mover los propios nodos originales, con listeners originales, a `.kg-site-langs`**; no crear segunda implementación de `setLang` ni editar el HTML/base JS del visor. Preservar controles de idioma internos del board. Probar ES→EN→JA→ES en Chrome con título y tableros reales.
- Terminal: el kicker del panel encima de «Sala de espera» sigue incorrecto en screenshot (**«KGBLAZE / CENTRO DE INFORMACIÓN»**). Debe ser **«Información de vuelo» / «Flight Information» / «配信情報»** según idioma. Causa: original `syncChrome()` lo vuelve a escribir después del SSR. Añadir re-sincronización robusta no destructiva y fallback visual, sin alterar `public/index.html`.
- Preservar `?embed=1` sin chrome externo, tablero original SHA `d936c47763ac063597f29bec2532e6c725a65dd5`, selection/scroll/«Cerrar ✕», 115 canciones, portadas, filtros, canción individual, álbumes futura landing oculta y redirección temporal 307.

## Puerta de salida
PR pequeña desde main actual, pruebas terminal Worker->HTMLRewriter->Chrome en desktop/mobile/embed incluyendo idioma real/click, SVG cargado, 9 estados agrupados, social-only visual y accesibilidad, y 2 suites CI. Sólo fusionar con 0 regresiones, distinguir GitHub merge de Cloudflare HTTP.
