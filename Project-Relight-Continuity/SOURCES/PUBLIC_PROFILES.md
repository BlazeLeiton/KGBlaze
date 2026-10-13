# Registros de perfil públicos — snapshots y disponibilidad
Fecha de corte: 12 octubre 2026. NO significa que el sitio permita auditoría directa permanente.

| Plataforma | Enlace canónico | Acceso en auditoría | Notas |
|---|---|---|---|
| YouTube | https://www.youtube.com/channel/UCRd_uwPjrsf6Z3CRXwNehEQ | proveedor por ID exacto | Videos/live/shorts, metadatos y conteos recuperables |
| Twitch | https://www.twitch.tv/blazeleiton | enlace comprobado, contenido directo bloqueado | directorios pueden estar obsoletos |
| X | https://x.com/BlazeLeiton | página directa 403 | verificación de posts no disponible |
| Instagram | https://www.instagram.com/blazeleiton/ | proveedor por handle exacto | bio de Cambiasueños, 177 seguidores/306 siguiendo/57 posts snapshot |
| Ko-fi | https://ko-fi.com/blazeleiton | página original consultada | biografía y bienvenida verificadas |
| Discord | https://discord.gg/n8HFKxhynt | link presente en publicaciones; invitación inaccesible | NO marcar como rota sin prueba |
| HoloList | https://hololist.net/blaze-leiton/ | ficha de tercero directa | lore, etiquetas, links, cachés posibles |
| vTubie | https://vtubie.com/blaze-leiton/ | ficha de tercero directa | no inferir hora de última actualización |
| Bācharu | https://bacharu.io/vtuber/blaze-leiton | ficha de tercero directa | algunos indicadores y horarios claramente antiguos; sólo contexto |

## Reglas
1. Identidad siempre por link conocido o exacto handle/ID; **nunca** vincular perfiles de otros «Blaze» por semejanza.
2. Diferenciar enlaces usados en descripciones de **enlaces comprobados funcionales**: el Discord/Instagram/X pueden estar repetidos sin haber abierto sus páginas.
3. Las diferencias de oshi mark, hashtags y lore entre agregadores externos y perfiles propios se registran como `REVISAR`, no se editan automáticamente.
4. Perfiles de HoloList, vTubie y Carrd se cerraron en fase previa; revisar ahora **no autoriza rehacerlos** hasta decisión de lore / solicitud del usuario.
5. Si X/IG/Twitch no permiten abrir posts o horarios, registrar `ACCESO_BLOQUEADO`, sugerir enlace directo específico o exportación autorizada; no sustituir por un resultado indexado genérico.
6. Capturar `fecha_consulta`, `fuente`, `alcance`, `estado`, `ultimo_contenido_verificado`, `huecos`.

## Verificación adicional de directorios — 12-oct-2026
- HoloList **sí muestra actualmente** Oshi Mark `🧡✨` y fanbase `KGBlaze`; la descripción de Cambiasueños incluye gaming, storytelling, voz y música. Twitch figura con 281 seguidores en su captura, no es lectura directa de Twitch.
- vTubie muestra igualmente descripción moderna de Dreamshifter, etiquetas Pokémon/Azur/F1, idiomas EN/FR/PT/ES y enlaces a redes. No debe confundirse con fichas antiguas en caché.
- Bācharu refleja aproximadamente 334 seguidores en X y 281 en Twitch, pero detalles de horario/lista de directos pueden contener cachés históricos. Una cifra del agregador no certifica la plataforma original.
- Instagram en proveedor directo refleja enlaces del bio a YouTube y `#Llamarte`, `#Reynarte`; no derivar que todos los hashtags usados por terceros siguen siendo campañas vigentes.
- No hay contradicción crítica de identidad: **no reabrir** HoloList, vTubie, Carrd y bio por iniciativa del auditor.

## Cuarta auditoría — Carrd CONFIRMADO y rutas exactas Twitch (12-oct-2026)
- **Carrd real:** https://blazeleiton.carrd.co/ — proporcionado directamente por usuario y **abierto** sin búsqueda indexada. Q-04 sobre URL canónica queda resuelta.
- La consulta obtuvo **dos snapshots contradictorios** del mismo Carrd: `Conectando desde México para el mundo`, enlaces sin Instagram visibles y Ko-fi a `/commissions`; otra respuesta `Acercando a México y al mundo`, **Instagram presente**, Ko-fi a página principal. No concluir omisión persistente, error editorial ni cambio intencional: **DIVERGENCIA_CACHÉ**, corroboración de versión actual pendiente.
- Carrd enlaza a YouTube, Twitch, X, Discord, Ko-fi y Tellonym, además de Instagram en uno de los snapshots. Tellonym redirige al perfil correcto, pero pide JavaScript; Discord redirige a invite, cuyo contenido no fue legible.
- **Twitch directo:** se intentaron https://www.twitch.tv/blazeleiton/about , https://www.twitch.tv/blazeleiton/schedule , https://www.twitch.tv/blazeleiton/videos , variante m.twitch y embed; la base del canal devolvió HTML sin contenido interpretable. Sitios terceros TwitchTracker, SullyGnome, StreamsCharts inaccesibles: **no hay evidencia de calendario actual**.
- Documentar siempre URL efectiva y estado `ABIERTO`, `CONTENIDO_NO_LEGIBLE`, `BLOQUEADO`, `FUENTE_TERCERO` o `CACHÉ_DISCORDANTE`, sin trasladar supuestas faltas de un caché a una tarea de edición de perfiles ya cerrados.
