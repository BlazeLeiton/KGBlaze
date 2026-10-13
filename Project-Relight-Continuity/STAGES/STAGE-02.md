# Stage 2 — Paneles, editor privado y planificación

**Rango aproximado:** 7–11 octubre 2026; transferencias próximas al 12/10. **Cierre formal completo:** NO COMPROBADO. Fuentes: contexto recuperado y archivos referenciados; las variantes locales requieren inspección.

## Decisiones históricas
- Desarrollo de la identidad aeroportuaria en siete paneles/servicios Twitch; se pedía **conservar copia completa de la versión visual aprobada antes de iterar cada panel**.
- Sobre mí y Seguridad a bordo constan en el historial como aprobados/publicados; **no equivale a nueva auditoría web de su estado actual**.
- Calendarización editorial originada en Twitch; formato de tablero de salidas, importación de `.ics`, exportación PNG/GIF, ajustes de logos, idiomas `ES/EN/JA`.
- Se decidió separar **editor operativo privado/local** del visor público de solo lectura. El visor puede evolucionar sin alterar el editor maestro.
- Editor con importación y respaldo JSON, incluida entrega por arrastre; limpiar campos **sin cancelar edición** y limpiar semana **sin convertirla en HIATUS**.
- Estados de agenda y revisiones: `POR CONFIRMAR`, `A TIEMPO`, `REPROGRAMADO`, `CANCELADO`, `EN VIVO`, `DESPEGÓ`, `DESCANSO`, `ESCALA`, `HIATUS` aparecen en distintas iteraciones/componentes; no inferir automáticamente que cada versión, exportación y visor tiene idénticas opciones.
- Preferencia por formato trilingüe y enlaces desde iconos de plataformas a sus respectivos destinos.

## Versiones y conflictos de alcance
- El editor privado **v23.5** figura en conversaciones como maestro aprobado/intocable en ese momento; el README de infraestructura posterior alude a un editor privado **v23.11**. No asumir que ambas denominaciones representan archivos idénticos ni realizar una comparación sin tener ambos.
- Se consideró inicialmente el tablero como publicación semanal **no dinámica**, y posteriormente se propuso un **visor público** dinámico capaz de comprobar coincidencias con YouTube. Son decisiones para componentes/etapas distintos, no fusionar por omisión.
- Una actualización de estado `POR CONFIRMAR → A TIEMPO` **sólo visual** ante coincidencia YouTube fiable aparece acordada en un mensaje posterior, pero el historial también contiene una indicación que exige mantener `POR CONFIRMAR`. **AUDITORÍA OBLIGATORIA** del alcance y orden cronológico antes de materializarlo.
- Estado `EN VIVO`: concepto posterior de evolución; no afirmar que hay sincronización activa.

## Asuntos entre etapas
- Comparar comportamiento editor local aprobado con versión disponible para evitar regresiones.
- Auditoría de arrastre JSON, vaciado/restauración semanal, idiomas, enlaces, tratamiento de reprogramación y exportación.
- Identificar cuáles cambios quedaron en archivos de muestra, pruebas locales o visor publicado.
- Recuperar los mensajes finales de Stage 2 y acciones incompletas, si se dispone de fuente original.

## Criterio
La ausencia de transcript y del binario/HTML local correspondiente implica `NO_COMPROBADO` para funcionamiento real de esa versión.

## Ampliación recuperada al iniciar Stage 4 (2026-10-12)
- Hay constancia contextual de que se diseñó y exportó una serie de **siete paneles**: Check-in, Salidas, Conexiones, Sala de Espera, Servicios Adicionales, Seguridad y Entretenimiento. Otra recuperación histórica informó que capturas mostraron **los siete publicados**. Registrar como `PUBLICACIÓN_REPORTADA_EN_HISTORIAL`, no auditoría actual de Twitch.
- El séptimo panel se había considerado inicialmente opcional; la información posterior señala su incorporación. Evitar interpretar «opcional» como «nunca realizado».
- Exportaciones históricas reportadas: 14 PNG en dos tamaños (320×100 y 960×300), además de HTML y resumen; conservar copias visuales completas e individuales aprobadas.
- La versión v23.1 fue descrita como estable en una revisión de Stage 3/Stage 2. Posteriores v23.2/v23.3 añadieron REPROGRAMADO/DESPEGÓ y última actualización, y la base v23.5 añadió más controles. Orden de versiones indica evolución, pero no prueba que los archivos físicos funcionen idénticamente.
- El usuario reiteró que el tablero semanal **estático** no debía tener EN VIVO ni sincronización; esto no prohíbe un **visor público separado**, posterior, con sincronización conservadora.

## Segunda revisión de archivos — 12-oct-2026
Localizados en Biblioteca: `KGBlaze_Twitch_Paneles_Maestro_v1-1.html` (maestro de 7 paneles, primera parte leída); propuestas HTML del horario; `Blaze_Calendario_Operativo_Oct-Dic_2026_v12.xlsx`; `Project_Relight_Calendario_Conciliado_2026-10-11.xlsx`; editores privados v23.1–v23.9.

La conciliación del 11-oct declara prioridad de fuente **confirmación del usuario > ICS Twitch del 10-oct > operativo del 9-oct**, con distinción **realizado vs programado**. Seis primeros directos de Octublaze aparecen realizados; eventos futuros de Twitch permanecen PROGRAMADOS. Pokémon Journey se difirió a noviembre, con ventana sugerida y no fecha de estreno confirmada.

Paneles: el maestro HTML v1.1 identifica siete paneles completos (Check-in, Salidas, Conexiones, Sala de Espera, Servicios Adicionales, Seguridad, Entretenimiento). La denominación institucional visible ya es `Terminal`; algunos códigos legados TB se conservan en referencias internas. Plantilla indexada en `../TEMPLATES/PANELS.md`.
