# Auditoría de calendario y decisiones — tercera pasada Stage 4

## Jerarquía de evidencia
1. Corrección explícita del usuario con fecha y alcance.
2. Prueba de publicación/directo realmente efectuado por ID o confirmación específica del usuario.
3. Programación vigente de plataforma **con fecha de consulta** (Twitch/YouTube), fuente de planes y no prueba de emisión.
4. Archivo conciliado más reciente *por su contenido y fuente*, no simplemente por número de versión.
5. Archivo operativo antiguo / borradores / propuestas. No activar como agenda vigente si una fuente posterior lo sustituye.

Cualquier contradicción se registra con ambas afirmaciones, fuentes y pregunta; no se resuelve por intuición.

## Cortes comparados
- `Blaze_Calendario_Operativo_Oct-Dic_2026_v12.xlsx` — plan con valores de anteproyecto; incluye ventana Pokémon en octubre que fue corregida después.
- `Project_Relight_Calendario_Conciliado_2026-10-11.xlsx` — registro de hechos 1–11 oct y programas futuros 13–23.
- Un archivo posterior de calendario extendido (18 hojas, seguimiento de eventos), que añade reservas y compromisos contextuales; por privacidad **no se copia su agenda personal** al repositorio público.
- La hoja extendida no reflejaba uniformemente ambas reservas de Azur (21/22). **RESUELTO mediante confirmación explícita del usuario de 12-oct (Stage 4): mantener las dos reservas, ambas SIN HORA y SIN confirmación editorial de directo.**
- Los contenidos House Flipper, HoloCure, Civ VI, VRChat, Crosswave, cumpleaños, Among Us y Azur Capsule Rerun tienen video recuperable de YouTube. Es evidencia de publicación, no siempre coincidencia horaria exacta con Twitch.

## Aclaración posterior vinculante (2026-10-12 · confirmación explícita del usuario (Stage 4))
- Azur Lane 21-oct y 22-oct: **mantener ambas reservas sin horario**; no programar horas, no elevar estados a A TIEMPO, EN VIVO o anunciados.
- Cake Song: demo vocal prevista para 12-oct sigue **pendiente**; ni grabación ni envío confirmados.
- Solo cambia el estado de estos tres registros. Todas las demás actividades y prioridades permanecen como estaban.

## Estado editorial reconstruido al 12-oct-2026
| Fecha CDMX | Tema | Estado | Fuente y condición |
|---|---|---|---|
| 1–6 oct | Octublaze primera fase | realizado/reportado y videos YouTube hallados | No reabrir como pendientes |
| 8 oct | Among Us colaborativo | realizado con video YouTube | Confirmado por VOD y conciliación |
| 9 oct | Azur Capsule Rerun | realizado con video YouTube | Confirmado por VOD y conciliación |
| 10–11 oct | Malfoid Dating Sim | NO realizado | Sigue sin fecha de reposición |
| 12 oct | Cake Song — demo vocal | **PENDIENTE** (sin grabación ni envío confirmados) | Usuario 12-oct, Stage 4; se conserva deadline 31-oct; siguiente acción: grabar demo guía |
| 13 oct 22:00 | Killer Chat #1 | programado Twitch archivado | No se verificó actualización de Twitch ni emisión |
| 14 oct 22:00 | Azur | POR CONFIRMAR editorialmente, aunque reservado Twitch | No anunciar firme; verificar capacidad |
| 15 oct 13:00 | Galaxies Showcase | confirmado/programado según historial | No marcar emitido antes de prueba |
| 16 oct 22:00 | Azur | reservado/programado; tema no confirmado | No inventar Tempesta como confirmado |
| 20 oct 22:00 | MiSide #1 | provisional | Requiere confirmación editorial |
| 21 oct | Azur Lane | **RESERVA MANTENIDA — SIN HORA** | Confirmación explícita usuario 12-oct Stage 4; NO es directo confirmado ni anunciado |
| 22 oct | Azur Lane | **RESERVA MANTENIDA — SIN HORA** | Confirmación explícita usuario 12-oct Stage 4; NO es directo confirmado ni anunciado |
| 23 oct 22:00 | MiSide #2 | programado según historial | No marcar emitido antes de tiempo |
| 31 oct | Cake Song | deadline duro de producción | Bloquea compromisos opcionales |
| 1 nov | posible GP México watchalong | idea pendiente de decisión y revisión derechos | NO anunciar ni transmitir señales ajenas |
| noviembre | Pokémon Journey | futura ventana, NO fecha publicada | Teaser/assets + nueva decisión |

**Importante:** no publicar eventos personales u otros compromisos privados contenidos en XLSX, ni hacerlos aparecer en el visor público, salvo consentimiento y objetivo explícito.

## Huecos aún abiertos
- Confirmación editorial de Azur 14, MiSide 20, tema 16 y reprogramación Malfoid. **Las reservas Azur 21 y 22 ya fueron confirmadas como RESERVAS sin hora, pero no como transmisiones.**
- Cake Song: demo vocal confirmada **PENDIENTE** al 12-oct; no marcar grabación ni envío hasta nueva evidencia. Trabajo externo ya reportado entregado/aprobado no se reabre.
- En directo en vivo/programado: Twitch página no accesible; se requiere URL/VOD/captura pública/ICS nuevo para actualizar estados.
- X calendario experimental antiguo aún incluía Pokémon octubre; corregir ancla de conversación a preparación y proceso mientras no comience el gameplay noviembre.
- Todos los pendientes llevan fecha de último registro y próxima prueba; si no existen nuevos datos, permanecer como `SIN_CONFIRMACION_NUEVA`.

## Cuarta revisión — evidencia de directos emitidos y fuentes de reservas
- Cuenta de YouTube autorizada confirmó `actualStartTime` y `actualEndTime` de ocho directos Octublaze anteriores y contenido público de VOD. La existencia de inicio/fin real es evidencia adicional de transmisión **en YouTube**, no de estado de Twitch.
- Al cotejar un vídeo, `publishedAt` posterior NO equivale al inicio real; priorizar `actualStartTime` en ISO UTC convertido a `America/Mexico_City`.
- Twitch `/schedule` no pudo leerse desde herramientas. El último ICS recuperado sigue siendo del 10-oct y NO demuestra que reservas futuras continúen intactas. No modificar fechas ni estados por falta de lectura.
- Confirmaciones vinculantes **se mantienen sin alteración**: Azur 21 y 22 ambas reservas sin horario; Cake Song demo pendiente; 14 Azur POR CONFIRMAR editorialmente; Galaxies 15/Killer Chat 13 programados según historial, no emitidos de antemano.
- El calendario extendido incorpora seguimientos Steam/Azur/Mahouka/F1, además de contenidos privados que NUNCA deben pasar a agenda pública. Distinguir `evento externo confirmado`, `asistencia personal`, `idea de contenido`, `evento publicado`, `stream completado`.

## Aclaración más reciente sobre la fuente ICS (12-oct-2026)
El usuario indica que **el último ICS de Twitch archivado es el más reciente y no se han realizado cambios** desde que se obtuvo. Por tanto, no falta solicitar una exportación actualizada para continuar la planificación; usarlo como la **mejor fuente programática disponible**, combinándolo con las correcciones editoriales explícitas posteriores de Stage 4.

Distinguir siempre: `ICS_MAS_RECIENTE_CONFIRMADO_USUARIO` (vigencia editorial) de `TWITCH_WEB_EN_VIVO_NO_CONSULTABLE` (la página `/schedule` no se pudo inspeccionar directamente). No promover reservas a directos confirmados/emitidos por esta aclaración. Azur 21 y 22 quedan reservas sin hora, Cake Song demo pendiente y los demás estados sin cambios.

## Actualización de fuente y significado editorial — 13-oct-2026 (sustituye notas de vigencia 12-oct)

Nuevo archivo **ICS de Twitch con 7 eventos**, suministrado por usuario; la entrada WATCHALONG México GP **01-nov-2026 14:00–18:00 CDMX** tiene UID `b6a53416-0265-4643-8899-871d64bad5fa`, y el usuario eliminó la entrada manual previa equivalente. El ICS de seis eventos ya **NO** es la fuente reciente. Killer Chat! permanece **13-oct 22:00 CDMX**, UID `306ddb27-c0d3-4030-bd9f-f7689b529582`.

**Semántica preservada:** nombre del vuelo/actividad = **juego/categoría Twitch al planificar**, NO título de la sala. `SUMMARY` vacío y `DESCRIPTION` con `Killer Chat!: Original Edition.` son coherentes con el proceso de programar **actividad primero y metadata después**. Títulos de emisión dual normalmente iguales en Twitch/YouTube, sin obligación de coincidir con el nombre del vuelo. Este último debe permanecer comprensible para usuarios del calendario.

**Prueba local:** HTML v24.2.1 conserva la URL YouTube añadida al evento Killer Chat tras reimportar el ICS: secuencia usuario completada/validada; sincronización futura, propiedad YouTube y D1 no comprobadas. Ver `CHANNEL_CONTENT_TAXONOMY_2026-10-13.md`.

