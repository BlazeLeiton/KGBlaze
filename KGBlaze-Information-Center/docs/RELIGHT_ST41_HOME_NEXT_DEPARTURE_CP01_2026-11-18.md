# Project Relight — Stage 41 · CP01: Home «Próximas salidas»

Fecha: 2026-11-18 (America/Mexico_City). **Stage 41** continúa después del agotamiento por capacidad de Stage 40. No se reinicia la numeración ni se considera terminado el proyecto.

## Alcance
Implementación del banner compacto Home junto a Rebel Mix: 2/3 contra 1/3 en escritorio; apilados en móvil. Preservar iconos existentes, hero, reproductores YouTube/Twitch, Chrome V1, idioma compartido, Menú móvil, Salidas nativa, Rebel Mix y contenido inferior. No imágenes generadas. Conservar el mismo enlace público \`/departures/\` y el mismo fetch público \`/api/public\` que ya consumía Home; ningún segundo calendario ni solicitud YouTube por visitante.

## Paleta luminosa HOMe distinta de Terminal
- **A TIEMPO**: Home **verde #36D978**, Terminal **celeste #67D9F7**.
- **EN VIVO**: Home **magenta #ED006F**, Terminal **verde #36D978**.
- **POR CONFIRMAR / REPROGRAMADO**: **amarillo #F5BF47** en ambos.
- **CANCELADO**: magenta #ED006F en Terminal, jamás reinterpretar cancelación como transmisión en vivo en Home. El estado cancelado no es una salida próxima.
- Ausencia de programación: sin luz. Luces estáticas, sin parpadeo y siempre con texto junto al punto. **No tocar \`statusColor()\`, luces nativas ni el canvas exportable de 1080×1080.**

## Origen y prioridad de los datos
- \`src/core.mjs\` publica \`event.category\`, \`event.title\`, \`event.extra\`, \`day\`, \`time\`, \`status\`, \`platforms\` y sincronizaciones verificadas \`sync\`.
- Calendario Twitch ICS: \`CATEGORIES\` alimenta \`category\`; \`SUMMARY\` alimenta \`title\`; \`DESCRIPTION\` puede alimentar \`extra\` pero el importador da prioridad a \`CATEGORIES\` para ese extra, así que puede duplicar la categoría.
- Actividad grande: \`category\` cuando sea corta y útil, si no \`title\` editorial; no sustituirla por el título de YouTube.
- Programada: subtítulo = fecha/hora localizadas en CDMX, sin inventar hora cuando falte.
- EN VIVO: preferir \`sync.youtube.videoTitle\` **solamente** cuando fue observado por servidor desde \`snippet.title\` de una sala verificada en el canal propio y vinculada a la identidad editorial actual. Si falta o duplica la actividad, \`extra\` diferente de actividad, luego \`title\` diferente de actividad, finalmente «Transmisión en curso» localizada.
- Si no hay YouTube válido, Twitch live verificado puede activar un evento de Twitch, con subtítulo editorial. Un YouTube reconocido como upcoming conserva la prioridad nativa ante Twitch simultáneo. En Home no se presenta EN VIVO sin observación válida de plataforma.
- Fuente YouTube actual: \`experiments/youtube-matching/read-only-source.mjs\` ya pide \`videos.list(part:'snippet,liveStreamingDetails')\` para salas conocidas. \`trusted-sync.mjs\` ahora conserva \`videoTitle\` (≤160 caracteres) sólo en observaciones coincidentes con canal/ID/identidad, sin modificar campos editoriales. **Esta novedad depende de que YOUTUBE_SYNC_ENABLED y las credenciales del servidor estén realmente activadas; este cambio NO las activa.**
- Respetar la ventana de cinco semanas de \`publicAgenda()\`. No incluir vencidos como futuros, no falsificar estados ni fechas. API fallida ≠ agenda vacía. No automatizar traducciones de juegos, actividad, títulos creativos ni títulos YouTube.

## Terminología japonesa y correspondencia
| Español | English | Japonés | Romaji | Sentido |
|---|---|---|---|---|
| Próximas salidas | Upcoming Departures | 出発予定 | Shuppatsu yotei | Salidas previstas |
| A tiempo | On time | 定刻 | Teikoku | Hora puntual, ya en Terminal |
| En vivo | Live | 配信中 | Haishin-chū | Se está emitiendo, ya en Terminal |
| Por confirmar | Unconfirmed | 未確定 | Mikakutei | No determinado todavía, ya en Terminal |
| Reprogramado | Rescheduled | 日時変更 | Nichiji henkō | Cambio de día u hora, ya en Terminal |
| Sin programación | Nothing scheduled yet | 配信予定なし | Haishin yotei nashi | Sin emisiones previstas |
| Terminal en espera | Terminal on standby | ターミナル待機中 | Tāminaru taiki-chū | Terminal esperando |
| Sin salidas actualmente | No departures scheduled at this time. | 現在、出発予定はありません。 | Genzai, shuppatsu yotei wa arimasen. | Actualmente no hay salidas previstas |
| Revisa el programa completo | View the full schedule | 配信予定をすべて見る | Haishin yotei o subete miru | Ver toda la programación de emisiones |
| Sin datos | Data unavailable | 情報取得不可 | Jōhō shutoku fuka | No se pudieron recuperar datos |

El visor nativo \`STATUS_JA\` ya usa exactamente 定刻, 配信中, 未確定, 日時変更; por tanto **se preservan**. \`出発\` (*shuppatsu*) corresponde a la metáfora aeroportuaria; \`配信\` (*haishin*) expresa streaming; no transformar todo en \`運航\` (*unkō*, operaciones de vuelos reales).

Referencias oficiales contrastadas: [Haneda — フライト検索](https://tokyo-haneda.com/flight/int_search.html), [Narita — 出発フライト一覧](https://www.narita-airport.jp/ja/flight/dep-search/), [Kansai — 運航情報・時刻変更](https://www.kansai-airport.or.jp/faq/401), [ANA — 運航状況・発着案内](https://www.ana.co.jp/fs/dom/jp/). Narita usa 定刻 y 時刻変更 en vuelos; Terminal mantiene 日時変更 porque incluye cambios de día y/o hora.

## QA de aceptación
Pruebas de estado, variantes cromáticas, identidad YouTube, prioridad YT/TW, fallback sin duplicación, formatos ES/EN/JA, ausencia de datos, layout escritorio/móvil, continuidad de reproductores/menús/Terminal y no exposición de credenciales. El merge de GitHub no equivale a comprobación directa del despliegue Cloudflare.
