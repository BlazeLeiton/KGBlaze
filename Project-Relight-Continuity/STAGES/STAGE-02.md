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

## Tercera auditoría — evidencia de publicaciones (12-oct-2026)
YouTube mediante IDs exactos confirmó videos publicados de House Flipper, HoloCure, Civ VI × Azur, VRChat/Padorus, Azur Crosswave, celebración de cumpleaños, Among Us y Azur Capsule Rerun. No confundir fecha UTC de publicación con día CDMX, ni afirmar que el código de calendarios está sincronizado automáticamente.
Las descripciones publicadas muestran una plantilla de directos diferente de la de covers: premisa narrativa, enlaces KGBlaze, créditos generales y reglas completas de Seguridad a bordo. Archivo `../TEMPLATES/LIVE_STREAMS.md` creado como estructura recuperada, sin pretender reemplazar el texto íntegro maestro de los videos.
Los paneles Twitch siguen reportados como siete publicados en historial, pero el perfil de Twitch no permitió comprobación visual directa. Ver `../SOURCES/PUBLIC_PUBLICATIONS.md`.

## Recuperación complementaria — defaults YouTube unificados (13-oct-2026)
La etapa también incluía la **plantilla maestra única de descripción YouTube** y bloques de tags confirmados como precargados, recuperados junto con Stage 1 y Song Covers. La separación hecha el 12-oct al inspeccionar videos publicados era **solo variación de uso** de una plantilla modular, no dos masters diferentes. Para reproducción exacta usar [../TEMPLATES/YOUTUBE_MASTER_DEFAULTS.md](../TEMPLATES/YOUTUBE_MASTER_DEFAULTS.md). Para tags generales, Azur, Pokémon, covers y F1/otros módulos guardados: [../TEMPLATES/YOUTUBE_METADATA_TAGS.md](../TEMPLATES/YOUTUBE_METADATA_TAGS.md).

La fuente histórica más fuerte sobre **configuración de la cuenta** es la confirmación del usuario, mientras que la auditoría de descripciones públicas puede verificar cómo se usaron módulos en determinados videos, no qué tenía cargado Studio en defaults. Distinguir ambos planos.

## Confirmación de plantillas adyacentes (13-oct-2026)
El seguimiento Stage 2 no debía perder la fórmula de **metadatos de Twitch** (título, notificación, categoría y tags **6+4**), ya aprobada en Stage 1 y aplicada de manera editorial en primeras emisiones Octublaze. Ver [../TEMPLATES/TWITCH_METADATA.md](../TEMPLATES/TWITCH_METADATA.md).

El sistema X debe mantenerse separado del editor Terminal y de la promoción automatizada: **2 interacciones semanales + tercera opcional y replies**, con mensajes de anuncio de directos y covers **aparte**, siguiendo [../TEMPLATES/SOCIAL.md](../TEMPLATES/SOCIAL.md). No requiere integración técnica nueva ni publicación automática.

## Continuidad de metadatos recuperada — 13-oct-2026
La etapa conserva junto al calendario ICS la plantilla aprobada de metadatos Twitch: título, aviso de inicio, categoría y combinación de seis tags fijos más cuatro variables. Documento `../TEMPLATES/TWITCH_METADATA.md`. Las etiquetas complementarias YouTube (HoloCure, Civilization, VRChat, narrativa, eventos) se guardaron para reutilización y fueron recuperadas literalmente en `../TEMPLATES/YOUTUBE_METADATA_TAGS.md`. El sistema X diferencia interacción semanal de anuncios, según `../TEMPLATES/SOCIAL.md`. No implica posts efectivamente publicados ni inspección de presets actuales.

## Regla de metadatos en emisión dual (corrección 13-oct-2026)
El usuario confirmó que normalmente usa **el mismo título de Twitch y YouTube** cuando emite en ambas plataformas, con contadas excepciones. El ICS de Twitch puede incluir `SUMMARY` vacío y `DESCRIPTION` categorial, no el verdadero título compartido de emisión. No confundir el título editorial heredado del ICS con diferencia real entre plataformas. Los criterios de emparejamiento Terminal siguen siendo conservadores; usar `videoId` editorial para revisar una sala concreta sin elevar `matchConfirmed`. Ver [../SOURCES/NARRATIVE_GAME_PUBLICATIONS.md](../SOURCES/NARRATIVE_GAME_PUBLICATIONS.md).
