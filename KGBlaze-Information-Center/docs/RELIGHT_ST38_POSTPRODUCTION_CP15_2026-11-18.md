# Project Relight — Stage 38 · CP15 · Audífonos y Terminal funcionales
Fecha base: 2026-11-17, America/Mexico_City (CI y commit registrados 2026-11-18 UTC).
Estado: **PR #168 fusionada a `main` de GitHub**. Stage 38 sigue abierto hasta inspección del dominio servido por Cloudflare; **no afirmar despliegue HTTP verificado**.

## Fundamento
Cuatro capturas de usuario del 18-nov (035703, 035745, 035753, 035838) y correcciones por voz: desaparecieron audífonos en Home; no se necesitan nombres bajo iconos de redes y conviene barra más oscura; Terminal requiere «Leyenda» agrupada según todos los colores/estados reales, sus botones de idioma originales funcionando en la nueva cabecera y el kicker «Información de vuelo» arriba de Sala de espera.

## Implementación confirmada en GitHub
- PR **#168** https://github.com/BlazeLeiton/KGBlaze/pull/168; merge squash commit **`b64b4a97846f974628640904730842440c901250`**.
- Home: `public/assets/icons/kgblaze-headphones-white.svg` es un asset vectorial blanco sin micrófono, diadema continua (dos copas); `public/home.html` lo muestra con un `<img>` real y dimensiones explícitas para evitar desaparición. CSS responsivo. Footer re-alineado a la derecha. No reemplaza módulos audiovisuales reales.
- Los 5 enlaces sociales globales de Home, Rebel Mix y Terminal muestran **sólo los iconos originales**, sin nombre visible; conservan `aria-label` para accesibilidad. Barra social `#010627` (algo más oscura), sin cambiar fondos del sitio. No se añaden redes.
- Terminal: la `VIEWER_PORTAL_LEGEND` usa el título «Leyenda», `Legend` y `凡例`. Se enumeran **nueve estados reales en cinco luces** que corresponden a `statusColor()/leftSignal` de `public/index.html`, NO a los bordes de la paleta de etiquetas:
  1. azul cian `#67D9F7` — A TIEMPO
  2. amarillo `#F5BF47` — POR CONFIRMAR / REPROGRAMADO
  3. verde `#36D978` — EN VIVO
  4. magenta `#ED006F` — CANCELADO
  5. gris `#62739D` — DESPEGÓ / DESCANSO / ESCALA (= EN TRÁNSITO) / HIATUS
  Cadenas EN/JA de equivalencias existentes, agrupadas del mismo modo.
- Los controles de idioma del encabezado exterior NO son clones: se trasladan desde los **nodos originales** `.viewer-header .top-langs button[data-lang]` a `.kg-site-langs` conservando los event listeners de `bind()` / `setLang()`. El tablero también conserva sus botones propios.
- El kicker de Sala de espera es «Información de vuelo» / «Flight Information» / «配信情報». La sincronización DOM lo actualiza después del `syncChrome()` del visor original; CSS de fallback permite evitar el encabezado anterior ante actualizaciones tardías.
- No se editó el original del visor `public/index.html` (blob GitHub `d936c47763ac063597f29bec2532e6c725a65dd5`). No se modificó canvas, APIs, editor, D1, selección, desplazamiento, `Cerrar ✕`, modo `?embed=1`, ni contenido, portadas y letras del catálogo. Landing futura de Álbumes conservada; `/music/` continúa 307 a `/music/songs/`.

## Pruebas confirmadas
- **Project Relight — continuity and Terminal regression checks**: run **44236811968**, commit head de PR168 `06e723d749188502d49c996d50b65aa4580180da`: **392 aprobadas, 0 fallidas, 0 omitidas**. Incluye nuevos invariantes de 9 estados reales/5 luces, copia de los controles originales y accesibilidad de las barras globales.
- **Chrome desde HTMLRewriter/Worker**: desktop 1440×900, 1024×768, 800×600; móvil 375×780; embed limpio, ciclo de idioma funcional ES→EN→JA→ES en el tablero y kicker. **Chrome Home**: SVG de audífonos cargó con ancho/alto visible en desktop y móvil.
- **Relight — complete music catalog audit**: run **44236811650**: **COMPLETED / SUCCESS**.
- Post-merge `main` confirmado: recurso SVG, nuevo encabezado idioma, grupos completos y barras sin texto; visor base SHA intacto.
- Consulta web pública del dominio `kgblaze.dpdns.org` no es accesible desde este entorno; sólo el navegador del usuario puede certificar sincronización real de Cloudflare y resultado visual final.

## Verificación pública requerida
1. `https://kgblaze.dpdns.org/`: audífonos visibles en tile Rebel Mix, sidebar sin nombres, tono de contraste y footer derecho en desktop y móvil.
2. `https://kgblaze.dpdns.org/music/songs/`: 115 obras y 5 logos sin nombre visible; preservación de filtros y fichas.
3. `https://kgblaze.dpdns.org/departures/`: pulsar ES/EN/JP en cabecera realmente cambia tablero, Sala de espera y Leyenda; «Información de vuelo» arriba de Sala, 5 grupos de 9 estados correctos; iframe sólo desktop.
4. `https://kgblaze.dpdns.org/departures/?embed=1`: sin chrome externo; función original intacta.
Si la validación pública muestra divergencia se corrige en otra PR focal, no por reconstrucción del visor ni por reactivar PR164 descartada.
