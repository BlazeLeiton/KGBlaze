# Stage 4 — Cuarta revisión integral (auditoría final de este ciclo)
**Fecha de consulta:** 2026-10-12 (CDMX). **Etapa:** Stage 4 ABIERTA; ninguna emisión futura ni desarrollo Terminal se confirmó mediante esta revisión.

## 1. Verificación directa Carrd y Twitch
La persona usuaria proporcionó rutas exactas: `https://www.twitch.tv/blazeleiton/about`, `https://www.twitch.tv/blazeleiton/schedule` y `https://blazeleiton.carrd.co/`. Se abrieron individualmente, sin búsqueda indexada.
- **Carrd: URL CONFIRMADA**. Se pudo leer la página y seguir enlaces exactos del perfil. YouTube, Twitch, Twitter/X, Discord, Ko-fi y Tellonym aparecen; **una segunda lectura incluyó además Instagram**, y cambió la frase introductoria. Respuestas distintas: (a) `Conectando desde México para el mundo`, sin Instagram visible, enlace Ko-fi llevó a `/commissions`; (b) `Acercando a México y al mundo`, con Instagram visible, enlace Ko-fi llevó a página principal. Tratar como **DIVERGENCIA DE SNAPSHOTS/CACHÉ**; no declarar link faltante o error editorial definitivo, y no reabrir la edición del perfil por iniciativa propia.
- **Twitch /about /schedule /videos:** accesos directos inaccesibles en herramienta. La ruta general del canal devolvió HTML sin contenido legible. Alternativas m.twitch, embed, TwitchTracker, SullyGnome y StreamsCharts también bloqueadas. El canal existe como enlace, pero **no** se verificaron allí paneles, horario futuro, visualización de VOD ni seguidores. El bloqueo no demuestra ausencia de contenido.
- **Discord:** URL exacta redirige a discord.com/invite, sitio no legible por la herramienta; no afirmar link roto.
- **Tellonym:** enlace directo desde Carrd apunta al handle correcto, pero página exige JavaScript; no es auditoría del contenido.

## 2. YouTube desde cuenta autorizada: evidencia más fuerte
Se utilizaron IDs del canal `UCRd_uwPjrsf6Z3CRXwNehEQ` y herramientas autorizadas de biblioteca del propio canal, **no búsquedas indexadas**.
- Ocho transmisiones Octublaze anteriores tienen `actualStartTime` y `actualEndTime`, además de VOD público: House Flipper, HoloCure, Civilization VI × Azur, VRChat/Sora no Yume, Azur Crosswave, cumpleaños, Among Us y Azur Capsule Rerun. El atributo `publishedAt` es distinto del inicio real del directo, frecuentemente posterior.
- Ejemplo individual: House Flipper `9r9JhzTLE-0` inició `2026-10-02T04:31:37Z` y terminó `2026-10-02T07:40:01Z`; Among Us `wOcD4Zw8B4g` inició `2026-10-09T00:00:31Z` y terminó `2026-10-09T02:10:52Z`; Azur Capsule Rerun `SJGvMnXy9nM` inició `2026-10-10T04:01:16Z`, terminó `2026-10-10T07:24:15Z`. Al conciliar, convertir UTC a zona local del evento y separar inicio de emisión / hora de publicación.
- La consulta a biblioteca propia devolvió una copia privada del cover extendido Pokémon Diamante y Perla. **Privado, NO publicado**, por tanto coherente con su clasificación interna como listo/buffer; no publicar ID ni tratarlo como lanzamiento ya realizado.
- No se halló evidencia de emisiones futuras en resultados devueltos, pero la lista paginada no es inventario certificado de todos los programados: **NO** convertir ausencia de resultados en «no existe stream programado».

## 3. Comparación de YouTube Analytics (privada; resultados no se copian en este repo)
Reportes autenticados por `creatorContentType`, corte de septiembre completo (01–30 sep) y primeros 11 días de octubre. Las tasas diarias y diferencias se compararon **por longitud de ventana**; el cambio de definición de vistas de 2026-08-27 requiere precaución en comparaciones históricas más antiguas.
- Septiembre: VOD 1,005 views/791 engaged; Live 2,308/1,069; Shorts 1,276/184. Total 4,589 views/2,044 engaged; tiempo 12,102 minutos.
- Octubre 1–11: VOD 526 views/380 engaged; Live 1,251/546; Shorts 23/15. Total 1,800 views/941 engaged; tiempo 7,190 minutos. Estas cifras son para auditoría privada y se omiten del README público.
- October live concentra la mayor parte del tiempo de reproducción; `SUBSCRIBER` fue origen de muchas visitas, **no** significa más seguidores nuevos. La métrica views puede diferir de engagedViews. Ningún patrón de 11 días autoriza conclusión causal sobre toda la estrategia de largo plazo.
- Para contraste externo, preferir identificadores de videos y canales, y solo calcular diferencias cuando público/interno coinciden en universo, fecha, ventana y definición.

## 4. Archivos y análisis internos recuperados
Biblioteca consultada en vivo contiene:
- `Blaze_Calendario_Operativo_Oct-Dic_2026_v12.xlsx`, conciliado 11-oct 7 hojas y derivados posteriores **18 pestañas**, archivos Steam con datos cruzados, seguimiento de eventos y agenda contextual. Los derivados no deben fusionarse ciegamente sólo por nombre o tamaño; versiones preservan decisiones intermedias.
- La agenda extendida incorpora plan de videojuegos narrativos/terror, **seis CSV originales de Steam**: una biblioteca personal, una wishlist y cuatro bibliotecas familiares. Las marcas `family sharing` NO garantizan acceso actual; **tener wishlist no implica no poseer acceso familiar**. Algunas piezas terminadas no deben recomendarse como nuevas; `KinitoPET` ya fue emitido, pero no terminado. Precios de CSV sin divisa confirmada NO equivalen a MXN.
- `Killer Chat` figura como opción disponible familiar según auditoría; `MiSide` como propio. Mantener criterios de juegos ≤4 directos, y evitar compras duplicadas. No publicar cuentas Steam o filas privadas.
- La reconciliación editorial oficial de Stage 4 confirma ambas reservas Azur 21/22 sin hora y Cake Song demo pendiente; **NO** cambiar el estado de otros eventos.
- Las carpetas contienen HTML privado operativo v23.11, versiones previas, visor, CSV analíticos, PPTX/PDF de referencia, plantillas. El acceso indexado no equivale a exportación de bytes: los originales binarios siguen en Biblioteca, materialización denegada en la segunda pasada.

## 5. Vigilancia programada: auditoría de ESTADO, no creación
Se consultó el registro de tareas automatizadas en modo **lectura privada**, sin mostrar identificadores, sin actualizar tareas.
- Vigilancia combinada de Azur, Cadillac/Checo, Mahouka, Steam y GP México: **habilitada**, con horarios nominales 09:00 y 18:00 en America/Mexico_City; última ejecución constatada el 12-oct CDMX. `notifications_enabled=false`, `email_enabled=false` por preferencia existente.
- Otra tarea Steam anterior: **deshabilitada**, evita duplicación. La vigilancia combinada aplica filtrado a juegos de interés real y evita comprar juegos ya propios o con acceso familiar; el registro operativo completo contiene detalles privados.
- **No afirmar que el usuario recibió alertas**: las notificaciones y correos están desactivados. No activar, duplicar ni modificar sin instrucción explícita.

## 6. Pendientes y conclusiones (prioridad)
**Confirmado:** URL Carrd; ocho directos Octublaze con inicio/fin real de YouTube; ambas reservas Azur 21/22; demo Cake pendiente; vigilancia recurrente existente activa y silenciosa; identidad de redes consistente en canales accesibles.

**Parcial:** comparativa de métricas interna/pública; estado actual Twitch; texto exacto y destino de la variante vigente de Carrd por respuestas discordantes; publicaciones reales en X; estado vivo Cloudflare; pruebas v23.11.

**Preguntas pertinentes para cerrar huecos sin reabrir lo resuelto:**
1. ¿Se puede aportar exportación `.ics` reciente de Twitch /schedule (o enlace a evento individual) para confirmar actualizaciones posteriores al calendario del 10-oct? No exigir acceso personal/capturas si no existe.
2. ¿Qué versión de Carrd se ve actualmente en navegador del usuario: «Acercando a México y al mundo» con Instagram o «Conectando desde México para el mundo» sin Instagram? Solo para despejar discrepancia de caché; no se modificará el perfil.
Q-01 Azur 21/22 y Q-02 Cake quedaron ya respondidas; **no volver a preguntarlas**.

## 7. Verificaciones pendientes de capacidad, no decisiones
- `/about`, `/schedule` Twitch y paneles requieren lectura autentificada o .ics. No usar búsqueda indexada como sustituto de horarios reales.
- v23.11 requiere archivo ejecutable autorizado y pruebas de navegador, migración, exportación, 409/423 y despliegue real. Sin autorización no tocar Terminal/Cloudflare.
- Fichas de perfiles cerrados siguen cerradas salvo solicitud o evaluación de lore; divergencia de caché Carrd no activa rediseño.
- Redacciones públicas usan cifras/categorías agregadas y omiten registros privados, ingresos, calendarios personales y cuentas externas.

## Reglas añadidas al protocolo
1. Antes de declarar un perfil inaccesible, probar **rutas directas ofrecidas por usuario** y seguir enlaces internos; documentar resultado exacto y snapshot de variantes.
2. Diferenciar `publishedAt`, `scheduledStartTime`, `actualStartTime`, `actualEndTime` para YouTube en conciliación con Twitch.
3. Auditoría de automatizaciones en modo lectura únicamente cuando el estado operativo sea relevante; preservar configuración y no crear duplicados.
4. Auditoría Steam cruzando propiedad personal/familiar/wishlist, precio regional y historial de streams antes de recomendar adquisiciones.
5. Nuevas revisiones conservan este informe como historia y resumen de pendientes, sin confundir evidencia pública con datos privados.

## Addendum — respuestas del usuario posteriores a la auditoría (12-oct-2026)
**Prevalecen en el alcance aclarado sobre los apartados históricos anteriores:**
1. **Carrd Q-09 CERRADA como pregunta:** la versión que ve el usuario es «Acercando a México y al mundo», **con Instagram**. El snapshot distinto es artefacto de lectura/caché anterior; no obliga a actualizar redes ni a revisar de nuevo la identidad.
2. **Twitch Q-06 DIFERIDA:** entrega de `.ics` actualizado o links recientes será «**después**», sin fecha ni compromiso de entrega ahora. El acceso automatizado a `/schedule` sigue incompleto: ninguna emisión futura recibe nueva verificación.
3. No hay confirmación adicional de horarios, directos, publicaciones, cambios de estado editorial, configuración de vigilancia o trabajo de Terminal. Stage 4 permanece ABIERTA.
