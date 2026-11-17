# Project Relight — Stage 38 / Homologación de tres superficies, V7 de revisión
**Checkpoint:** RELIGHT-ST38-2026-11-17-CP04
**Estado:** implementación de revisión en rama separada; NO es una nueva aprobación visual ni equivale a despliegue Cloudflare.
**Precedencia:** instrucciones directas del creador del 17-nov-2026 > CP03 reconstruido > checkpoints previos de cada superficie.

## Fuentes y grado de aprobación recuperados
- **Home V5 — aprobada e implementada**: `docs/RELIGHT_HOME_V5_APPROVED_CP01_2026-11-17.md`; PR161. Hero, fichas YouTube/Twitch, cards, navegación escritorio/móvil, zona cromática, copy y barra social no se reconstruyen. CP02 posterior (PR162 y PR163) aprobó icono superior de aeronave+pista en blanco y **bimotor relleno blanco horizontal** en la card inferior, con ambos motores ligeramente adelantados y acercados.
- **Rebel Mix — V6 aprobada conceptualmente con ajustes**: jerarquía provisional `KGBlaze · Scripta Lyrica` → `Rebel Mix` → `Colección musical / Music Collection` → `Lista de canciones / Song list`. Su composición violeta y su contenido real prevalecen sobre cualquier reconstructo de cuatro tarjetas. No alterar letras, versión, derechos, créditos, portadas ni audio privado. Catálogo histórico PR160 = 115 obras, 127 versiones y 124 video IDs distintos.
- **Terminal — V6 exterior propuesta, no aprobada integralmente**: preservar sin modificaciones visor cuadrado 1080, fila real, señales, hit targets, estados, sincronización, APIs, cron, D1, dashboard V25. Encabezados `KGBlaze · Centro de información`, `Información de vuelo · Flight status`, `Sala de espera`; texto exacto de ayuda `Selecciona una salida para consultar sus detalles.`. Compartir/iframe/leyenda escritorio, **sin iframe en móvil** y con detalle real compacto. Discord fuera de panel, en pie.
- Los bytes de la última maqueta V6 original previa a la reconstrucción errónea no se recuperaron. El prototipo local V6 del CP03 no constituye aprobación ni prueba visual.
- **Motivo de franja exclusivamente magenta**: SÓLO Home. Rebel Mix usa violetas `#551E5F/#695FE6/#D7D2FF`, Terminal azules `#0B1761/#276EF1`, base común `#020C41`, Light Blue United `#A5EBFF`, Rosa Mexicano `#FA0073`. No copiar totéms/logos comerciales. Gráficos sólo SVG/HTML/Canvas de reconstrucción propia, sin generación de imágenes.

## Implementación contenida en esta rama
1. `public/home.html`: solo convertir la línea decorativa del hero en magenta sólido y la nota de la card Rebel Mix en audífonos SVG blancos de la misma familia visual. Conservar el **bimotor relleno** de `Próximas salidas` y la aeronave+pista del botón superior.
2. `src/music-page.mjs`: conservar 115 fichas/portadas, componentes, filtros, letras, roles, media y JS originales; añadir navegación accesible Inicio / Rebel Mix / Salidas; enlace KGBlaze al portal; jerarquía textual propuesta, etiqueta bilingüe de listado y líneas estructurales violeta. Mantener `/music/`, `/music/songs/`, ES/EN/JA. Nada de franja exclusiva magenta.
3. `src/viewer-enhancements.mjs`: adicionar **solamente capa de exterior CSS y JS en el host público**. Inyectar nav, encabezado de superficie, rótulo `Información de vuelo · Flight status` encima del visor existente, ayuda en `#waitingPanel`, botón de copiar URL y leyenda en escritorio; mover enlace Discord al pie. Ocultar herramientas iframe en móvil mediante CSS. Todo desactivado para `body.embedded`; no crear agendas ficticias ni reemplazar `#board` ni `#rowSelectors`.
4. Revisión de código: estructura SVG Home balanceada; `src/music-page.mjs` y el JS serializado de `src/viewer-enhancements.mjs` válidos sintácticamente; comprobación manual de anchor changes. Requiere pruebas visuales PC/móvil y CI/HTTP antes de publicación.

## Pendientes que NO deben confundirse con aprobado
- El rediseño exterior Terminal V7 y su composición fina requieren comparación visual real (desktop+mobile) antes de merge/publicación. No interpretar la aprobación de un texto como aprobación integral de Terminal.
- No se han extraído/revectorizado los cinco íconos sociales originales del visor en esta pasada; el icono de audífonos es SVG nuevo aprobado semánticamente, no una copia de Canva. No inventar logos.
- La portada conserva sus fondos actuales; no se ha introducido arte nuevo, fondos generados ni modelos inéditos.
- Un PR puede ejecutar CI pero no garantiza que haya staging público automático ni despliegue Cloudflare. No declarar la web publicada sin verificación.

## Contrato de seguridad
No cambios a `public/index.html` (visor base), D1, public API, Dashboard, `worker.mjs`, `portal-route.mjs`, música catalog, credits o lyrics. El review branch se puede fusionar sólo cuando se valide su presentación real.
