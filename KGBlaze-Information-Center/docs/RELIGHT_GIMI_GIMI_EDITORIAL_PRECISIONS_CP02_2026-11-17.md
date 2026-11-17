# Relight / Scripta Lyrica — Gimi Gimi: precisiones de voces confirmadas por el creador (CP02)

**Fecha:** 17 de noviembre de 2026, America/Mexico_City. **Estado:** checkpoint editorial; **sin modificar todavía la letra ni los colores públicos**. Conserva como fuente la grabación con subtítulos coloreados `1000099175.mp4` y la adaptación propia en `src/music-lyrics.mjs`. Precede la integración de cortes en Scripta Lyrica.

## Correcciones afirmadas expresamente por el creador

1. **Estrofa 3, línea 6**: `Hasta amanecer no acaba` = **Ichiko**; ` ¿Qué es lo que tú vas a hacer?` = **Tokage**. Son dos segmentos de **un solo renglón**, no trasvasar la pregunta a 3/7.
2. **Estrofa 6, línea 3**: `¿Será el estar tanto en este lugar?` = **Todas**, en color neutro del visor.
3. **Estrofa 10, línea 6**: la división de voces cae **DENTRO de la palabra «diversión»**, como el creador corrigió explícitamente:
   - **Tokage**: `Esta diver`
   - **Fu**: `sión no acaba`
   - **Ichiko**: ` ¿Qué es lo que tú vas a hacer?`
   - Renderizar en una sola línea, sin espacios ni guiones adicionales: `Esta diver` + `sión no acaba` + ` ¿Qué es lo que tú vas a hacer?` = `Esta diversión no acaba ¿Qué es lo que tú vas a hacer?`.
   - **Jamás** asignar «Esta diversión» completa a Tokage, ni dar «no acaba» a Fu separando *después* de diversión. El corte cromático está **entre «diver» y «sión»**.
4. **Estrofa 11, líneas 1 y 3**, frase `Miren nuestra fiesta a medianoche`: **«Midnight Party» suena con Todas**, pero en la primera repetición destaca **Ichiko** y en la segunda **Tokage**. Conservar la participación del conjunto en la frase final; los destacados no implican convertir el cierre en un solo completo. Revisar visualmente el lugar de entrada de cada destacada antes de partir el renglón.
5. **Estrofa 11, línea 6**: `¡Vamos, ven aquí!` lo interpreta **Live**. Atribución del resto del renglón ` Y dime ¿Qué es lo que tu quieres? Ven`: no fijada por esta precisión, cotejar el video antes de escoger Live o Todas.

## Paleta de Mayonaka Punch (muestras aproximadas de las franjas de capturas oficiales)

- Tokage `#8378B5`
- Fu `#96D1B5`
- Ichiko `#FFDC6A`
- Live `#ED788B`
- Yuki `#B14262`
- Todas = **neutro** Scripta Lyrica, sin sustituirlo por color de caption del video.

## Condiciones vinculantes para la futura integración

- Mantener íntegros el contenido y la puntuación del texto adaptado español; separar únicamente segmentos cromáticos mediante `{text,voice}`, incluyendo cortes **dentro de una palabra**.
- No insertar nombres de participantes entre paréntesis antes de versos cantados. Para duetos o coros simultáneos, conservar puntos multicolor; no confundir superposición con alternancia.
- Full y TV tienen actualmente texto idéntico pero registros independientes; no modificar su edición en esta intervención.
- **Halloween Night Padoru:** observación pendiente del creador: el final usa todavía el sistema de **Misao** y debe homologarse al sistema propio de **Todas**. **NO aplicar en esta operación**; el usuario pidió expresamente aguardar a la siguiente carga para integrar esa corrección.
- El video y las imágenes originales son adjuntos de conversación, no se copian como binarios al repositorio.
- Una integración posterior necesitará pruebas de equivalencia de texto, comparación de `colorStanzas`, navegador y CI.

**Esta nota registra decisiones del usuario; no declara que hayan sido ejecutadas en la ficha pública.**
