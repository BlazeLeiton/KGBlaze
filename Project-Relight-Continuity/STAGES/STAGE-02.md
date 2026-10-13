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
