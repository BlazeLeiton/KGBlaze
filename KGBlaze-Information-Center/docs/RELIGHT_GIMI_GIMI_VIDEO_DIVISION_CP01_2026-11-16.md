# Project Relight / Scripta Lyrica — Gimi Gimi: video de división vocal recibido (CP01)

**Fecha de recepción:** 16-nov-2026, America/Mexico_City (conversación).  
**Archivo original del usuario:** `1000099175.mp4`, 1116 × 2480 px, 20 FPS, duración 235.24 s, 33 MB, grabación vertical de un video YouTube «[ESP/ENG/KAN/ROM] - Gimme Gimme» (HoeruDesu); **el MP4 permanece como adjunto de conversación y no se copia al repositorio**.  
**Naturaleza de evidencia:** reparto por colores realizado por fans; no atribuirlo como declaración oficial de elenco/solos.

## Clave visual confirmada

Cinco retratos en este orden, de izquierda a derecha: **Yuki, Fu, Live, Ichiko, Tokage**. Una integrante queda a color cuando canta su fragmento; los retratos atenuados no son la voz destacada. Se observan tanto paneles individuales como múltiples paneles a color. Los cinco paneles a color pueden indicar coro **o una pantalla sin letra durante un interludio**; no asignar coro sólo por ver todos iluminados.

Colores de **franjas verticales del sitio oficial enviados antes por el creador**, estimaciones muestreadas de captura (no paleta HEX publicada oficialmente):
- Yuki #B14262
- Fu #96D1B5
- Live #ED788B
- Ichiko #FFDC6A
- Tokage #8378B5

**No confundir** con la paleta editorial provisional anterior en `src/music-line-attributions.mjs` (Live #EF96C8, Ichiko #F5D45D, Fu #88D7B5, Tokage #A894E5, Yuki #B96582). Colores nuevos deben reconciliarse con la referencia oficial del usuario **antes** de modificar esa paleta.

## Transcripción visual de turnos (tiempo de grabación MP4, no timecode del video original)

Esta lista fue recuperada directamente al analizar cuadros del adjunto. Transiciones muy breves pueden requerir una nueva inspección cuadro a cuadro.

| Marca (aprox.) | Panel(es) destacados en el video | Ubicación musical de referencia |
|---|---|---|
| 00:11–00:26 | conjunto (cinco paneles) | apertura/refrán |
| 00:26–00:28 | Live | arranque del primer verso |
| 00:28–00:29 | Ichiko | respuesta del primer verso |
| 00:29–00:31 | Fu | verso inicial de bullicio urbano |
| 00:31–00:32 | Tokage | respuesta que completa ese verso |
| 00:32–00:38 | conjunto | estribillo/call compartido |
| 00:38–00:41 | Live + Ichiko | parte sobre la luz del día |
| 00:41–00:44 | Fu + Tokage | respuesta nocturna |
| 00:44–00:49 | Yuki | advertencia y sangre |
| 00:49–00:57 | conjunto con algunos cambios rápidos | sección repetitiva de interjecciones |
| 00:57–01:00 | Ichiko | línea sobre dormir |
| 01:00–01:03 | Live | invitación a jugar hasta medianoche |
| 01:03–01:10 | conjunto | primer estribillo |
| 01:10–01:11 | Live | intervención breve |
| 01:11–01:13 | Ichiko | intervención breve |
| 01:13–01:21 | conjunto | estribillo, motivo del espejo |
| 01:21–01:23 | Ichiko | frase corta |
| 01:23–01:25 | Tokage | frase corta |
| 01:25–01:26 | Fu + Ichiko + Tokage | remate conjunto de frase |
| 01:26–01:33 | conjunto | estribillo |
| 01:33–01:37 | Ichiko | frase del acelerador |
| 01:37–01:40 | Live | frase sobre la decisión/estacas |
| 01:40–01:42 | Fu | breve respuesta |
| 01:42–01:45 | Tokage | respuesta final |
| 01:45–01:53 | conjunto con cambios rápidos | sección repetitiva de interjecciones |
| 01:53–01:56 | Yuki | frase sobre oscuridad |
| 01:56–02:00 | conjunto con intervención de Tokage | subida de tensión nocturna |
| 02:00–02:15 | conjunto, con respuesta de Yuki ~02:06–02:09 | segundo estribillo |
| 02:15–02:19 | Yuki | puente: confianza en sí misma |
| 02:19–02:22 | Tokage | puente: dilema de estar sola |
| 02:22–02:25 | Fu | puente: soledad |
| 02:25–02:28 | Ichiko | puente: contradicciones |
| 02:28–02:35 | Live | puente: egoísmo / lo que se quiere |
| 02:35–02:52 | conjunto/pausa instrumental | no deducir voces con sólo paneles sin letra |
| 02:55–02:57 | Live | exclamación tras el interludio |
| 02:57–03:16 | conjunto | estribillo final |
| 03:16–03:17 | Tokage | pregunta breve |
| 03:17–03:18 | Fu | repetición/respuesta |
| 03:18–03:19 | Ichiko | repetición/respuesta |
| 03:19–03:25 | conjunto | remate del estribillo |
| 03:25–03:28 | Ichiko | interjección «Mira, mira» |
| 03:28–03:31 | conjunto | interjección del grupo |
| 03:31–03:33 | Tokage | interjección «Mira, mira» |
| 03:33–03:41 | conjunto | desenlace |
| 03:41–03:43 | Live | invitación final |
| 03:43–03:55 | conjunto | remate de cierre |

## Aplicación futura a la adaptación ES

- El registro actual `lyricsBySong['gimi-gimi']` tiene `full` y `tv`; preservar ambas y sus textos originales sin modificar las palabras.
- La división ES debe usar `colorStanzas` y `colorLegend` existentes: un mismo renglón puede incluir cambios de cantante secuenciales, por lo que un dúo sólo se declara si el video muestra ambas tarjetas a color **simultáneamente**, no simplemente si alternan en la línea original.
- Correspondencias evidentes de estrofas ES: apertura (0) coro; primera estrofa (1) Live→Ichiko, Fu→Tokage, coro, Live+Ichiko, Fu+Tokage, Yuki; puente más claro (7) Yuki→Tokage→Fu→Ichiko→Live; estrofa (9) Live; cierre con llamadas de Ichiko y Tokage. **Las demás estrofas deben cotejarse por texto con la traducción del video antes de partir sus sílabas españolas.**
- El video es evidencia suficiente para **un borrador de reparto**, no para afirmar que todos los renglones ya están conciliados con la métrica de la adaptación.
- Esta nota **no implica que el reparto haya sido aplicado a la ficha pública**. Mantener la canción sin etiquetas parentéticas en el canto.

## Estado

Video recibido e inspeccionado; distribución visual segmentada; checkpoint documental. No modificar código o fusionar alteraciones musicales hasta completar la conciliación línea a línea y superar pruebas de preservación textual, color y navegador en ES/EN/JA.
