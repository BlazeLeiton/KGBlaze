# Project Relight — Stage 40 · CP08
## Home / banner Próximas salidas — luces, idiomas y prioridad de fuentes

**Fecha de referencia:** 18-nov-2026 (America/Mexico_City).
**Tipo:** checkpoint técnico y editorial de especificación; **NO** implementación del banner.
**Fuentes consultadas (main):** `public/index.html` (importador ICS, estado y traducciones nativas), `src/core.mjs`, `src/youtube-sync.mjs`, `experiments/youtube-matching/read-only-source.mjs`, `experiments/youtube-matching/trusted-sync.mjs`, `src/worker.mjs`, `src/dashboard-page.mjs`, `src/viewer-portal-ssr.mjs`.
**Fuente externa:** documentación oficial YouTube Data API v3, `videos.list`, `snippet.title` y `liveStreamingDetails` (https://developers.google.com/youtube/data/reference/rest/v3/videos/list).

### 1. Identidad y ubicación aprobadas

- Mantener Home y Chrome V1 (escritorio/móvil), sin tocar Rebel Mix ni el tablero/visor original de Terminal.
- Reemplazar/enriquecer la ficha azul de «Próximas salidas» por un banner dinámico aproximadamente 2/3 del ancho de la fila, junto a Rebel Mix 1/3, después de los reproductores; en móvil, banner azul y Rebel Mix debajo.
- Cabecera fija: «PRÓXIMAS SALIDAS». Pie fijo en los tres estados, todos los tamaños, con CTA a `/departures/`.
- Fases visuales: vacío, programado, directo verificado. No hacer pasar el ejemplo Azur Lane o la fecha de un prototipo por una emisión realmente programada.
- Copy actualizado solicitado por el creador: «Terminal en espera» / «No hay salidas programadas en este momento.»; EN estado vacío «Nothing scheduled yet», subtítulo «No departures scheduled at this time.» (sin `There are`).
- CTA solicitado ahora: «Revisa el programa completo»; propuesta natural EN «View the full schedule» y JA «配信予定をすべて見る»; confirmar visualmente longitud antes del despliegue.
- Separar explícitamente «agenda vacía» de «API no disponible». Nunca confundir estados `CANCELADO`, `DESCANSO`, `ESCALA`, `HIATUS`, `REPROGRAMADO`, `POR CONFIRMAR` con `A TIEMPO` o con ausencia de actividades.

### 2. Convención lumínica APROBADA PARA HOME (diferente de Terminal)

| Estado técnico | LED original de Terminal | LED propuesto y aprobado para el banner Home |
|---|---|---|
| `A TIEMPO` | Celeste `#67D9F7` | **Verde `#36D978`** |
| `EN VIVO` | Verde `#36D978` | **Magenta `#ED006F`** |
| `CANCELADO` | Magenta `#ED006F` | Nunca representar CANCELADO como EN VIVO; política de otros estados pendiente |
| Sin programación (UI, no estado editorial) | — | **Sin punto luminoso** |

Los colores coinciden con dos valores CANÓNICOS de `statusColor()` y `VIEWER_STATUS_LIGHT_GROUPS`, pero la **asignación de significado para Home es una convención intencionalmente distinta**, aprobada por el usuario. No modificar `statusColor()`, `leftSignal`, `VIEWER_STATUS_LIGHT_GROUPS`, el canvas exportable ni otras etiquetas de Terminal.

- Un punto delante de la etiqueta localizada del estado; halo estático, sin parpadeo, contraste suficiente sobre `#276EF1`.
- La etiqueta debe decir el estado en texto, por accesibilidad y para impedir que el color solo transmita el significado.
- Diferencia entre luminosidad/semántica del indicador y paleta de insignias `PALETTE`: no confundir el borde de una insignia con la luz.

### 3. Modelo actual: evidencia comprobada

Importador iCalendar Twitch en `public/index.html`, `parseICS()`:
- `DTSTART` -> `day` y `time`.
- `SUMMARY` -> `title` (fallback a categoría/descripcion).
- `CATEGORIES` -> `category`; cuando no existe, `DESCRIPTION` puede convertirse en `category`.
- `DESCRIPTION` -> `desc`, pero **`extra` es `title ? (cat || desc) : ''`**, por lo que `extra` frecuentemente repite la propia categoría, en vez de aportar el tema del directo.
- `origin:'tw'` (normalizado a `twitch` en `src/core.mjs`) permite identificar procedencia. Las fuentes editoriales pueden ser modificadas en el dashboard; no hay campo separado actualmente que bloquee automáticamente `category` a Twitch.
- `src/core.mjs` publica `id,origin,day,time,title,extra,category,platforms,status,videoId...`; `publicAgenda()` expone solo eventos dentro de una ventana de cinco semanas más observaciones `sync`. `category` puede caer en `title` durante normalización.
- El visor nativo `draw()` muestra `event.title` como nombre de vuelo; `category` se usa como clasificación/recursos, no como cabecera principal del tablero.
- El dashboard V25 permite editar `title`, `category` y `extra`: no afirmar que ya existe bloqueo «solo Twitch» de esos campos.

Integración verificada de YouTube:
- `readYouTubeKnownVideos()` y `readYouTubePreviewEvidence()` YA solicitan `videos.list?part=snippet,liveStreamingDetails` y reciben `snippet.title`.
- `buildTrustedYouTubeObservations()` verifica identidad de canal y match de evento, **pero el objeto `observation` persistido NO incluye `snippet.title`** (almacena ID, URL, estado, tiempos y evidencia). En consecuencia el visor público actual no recibe el título auténtico como `sync.youtube.videoTitle`.
- Existe un endpoint administrativo privado de solo lectura `/api/admin/youtube-video-audit` capaz de mostrar el título para un ID autorizado. **No** usarlo como fuente pública del browser, ni revelar credenciales.
- En una implementación posterior se puede añadir un campo controlado `videoTitle` a la observación verificada en servidor, sin cambiar `event.title` ni `event.category`, manteniendo `verified`, `matchConfirmed`, `editorialIdentity`, canal propio, ID correcto, y límites de texto. La existencia de las banderas operativas/credenciales en producción no está verificada por este documento.
- YouTube admite títulos localizados cuando el creador los haya publicado, pero no traducir por nuestra cuenta ni asumir que existen; preservar el título original por defecto.

### 4. Regla funcional propuesta para revisión de implementación

**Campo grande de actividad** (solo etiqueta breve de juego/actividad; ejemplo ficticio «Azur Lane»):
1. Usar `event.category` de la agenda importada desde Twitch si existe y es una categoría útil.
2. Si está ausente o es una descripción larga, fallback conservador `event.title` (sin inventar). Para evento manual, respetar la categoría editorial.
3. **Nunca** sustituir esta actividad con el título del video de YouTube durante la sincronización. Esto satisface la separación pedida por el creador sin bloquear destructivamente el dashboard.

**Subtítulo si hay próxima salida (A TIEMPO)**: fecha + hora local America/Mexico_City, formato localizado ES/EN/JA; el título real de YouTube no debe desplazar el horario en este estado.

**Subtítulo EN VIVO**:
1. Si hay evento YouTube, sala de canal propio y match verificado, preferir **`sync.youtube.videoTitle`** (campo aún por implementar).
2. De lo contrario `event.extra` cuando sea informativo, no esté vacío y no repita `category` ni `title`; si coincide o no sirve, probar `event.title` si aporta un texto diferente al encabezado.
3. Si ambos son iguales/vacíos, usar un mensaje de estado localizado neutral, sin inventar un título. No pasar a buscar Twitch automáticamente ni llamar al navegador a la API privada.
4. Cuando hay plataformas duales, mantener la prioridad de identidad YouTube ya usada en Terminal, sin que observaciones no verificadas cambien el indicador de EN VIVO.

**Selección de siguiente actividad:** escoger la salida relevante por fecha/hora y estado del feed público, sin convertir eventos pasados en «próximos», sin crear fechas si `time` falta. La política completa para los otros seis estados queda pendiente antes de código.

**Seguridad/operación:** lectura pública, protección del cron y D1, evitar N+1 llamadas por visitante, no exponer API key; soportar respuesta no disponible o vacía y cache cuando proceda.

### 5. Copys y japonés (romaji y significado obligatorio)

| Uso | Español | English | 日本語 | Romaji | Sentido literal / precisión |
|---|---|---|---|---|---|
| Encabezado | Próximas salidas | Upcoming Departures | 出発予定 | Shuppatsu yotei | Salidas previstas; metáfora de aeropuerto |
| Estado vacío | Sin programación | Nothing scheduled yet | 配信予定なし | Haishin yotei nashi | No hay transmisiones programadas; mantiene terminología del visor |
| Estado programado | A tiempo | On time | 定刻 | Teikoku | A la hora prevista; traducción exacta ya existente en el visor |
| Estado en vivo | En vivo | Live | 配信中 | Haishin-chū | Emisión/transmisión en curso; ya existente |
| Título vacío | Terminal en espera | Terminal on standby | ターミナル待機中 | Tāminaru taiki-chū | Terminal en estado de espera (rótulo compacto nuevo) |
| Descripción vacía | No hay salidas programadas en este momento. | No departures scheduled at this time. | 現在、出発予定はありません。 | Genzai, shuppatsu yotei wa arimasen. | Ahora no hay salidas previstas; alude a la metáfora del aeropuerto |
| CTA permanente | Revisa el programa completo | View the full schedule | 配信予定をすべて見る | Haishin yotei o subete miru | Ver todas las transmisiones programadas; natural en interfaz |
| Datos de usuario | Azur Lane, títulos de directos, etc. | Sin traducción automática | Sin traducción automática | — | Se conserva el dato editorial original de Twitch/YouTube |
| Fecha/hora | Fecha y hora CDMX | Localized date/time | Fecha y hora localizadas | — | Formatos por idioma, misma zona America/Mexico_City |

**Matiz japonés:** `配信` (*haishin*) = emisión/stream; `予定` (*yotei*) = plan/programación; `出発` (*shuppatsu*) = salida física/metafórica. El encabezado y mensaje principal conservan metáfora aeroportuaria, mientras el estado y CTA usan la nomenclatura real de emisión del visor. `定刻` y `配信中` son traducciones existentes en Terminal; el resto aquí son propuestas nuevas.

**Frase inglesa:** `View the full schedule` es una traducción idiomática de «Revisa el programa completo»; `Beautiful program` significa «programa hermoso» y no equivale a este CTA de navegación.

### 6. Estado y límites de aprobación

- **Aprobado por el usuario:** diseño de base del banner sin render generado, luz verde para A TIEMPO, luz magenta para EN VIVO, ninguna luz en vacío, separación de campos, EN «Nothing scheduled yet» y «No departures scheduled at this time.», frase ES «Revisa el programa completo».
- **Confirmado por código:** paleta original distinta de Terminal; mapeo ICS; YouTube `snippet.title` en evidencia pero no en observaciones persistidas; traducciones nativas `ON TIME/LIVE/定刻/配信中`.
- **Para validar antes de integrar:** forma y momento de persistir `videoTitle`, fallback y no-duplicación de `extra/title/category`, elección completa de otros estados, y textos japoneses nuevos si el usuario pide un ajuste de matiz.
- **No realizado:** cambios en `public/home.html`, Worker, API, cron, editor, D1, Terminal, visor exportable o web de producción.
