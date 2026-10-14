# Stage 13+ · Panel luminoso y arte por categoría / título

Cambios únicamente en la capa pública del visor y API de lectura; **no** modifican el HTML operativo privado V.25, publicación ICS, revisión editorial, D1, sincronización YouTube, miniaturas de video, iframe ni secretos.

## Barra luminosa
El HTML original continúa creando `.flight-light` con el estado de la actividad. El CSS inyectado por el Worker había cambiado `.flight-row-top` a `align-items:start`, colapsando la barra sin altura propia. Se restaura `stretch` y una altura mínima, conservando su color y brillo originales.

## Selección de imagen — Stage 19 (decisión vigente del usuario, 14-oct-2026)

**Exclusivamente ficha desplegable; NO es una regla de calendario.** La imagen
`logoChoice:upload` o `lib:` continúa vigente en el calendario editorial
1080×1080, pero **no sustituye** la portada de categoría dentro de la ficha.

1. **Categoría concreta (juego o actividad):** solicitar primero su portada
   oficial Twitch Get Games. En una emisión sólo de YouTube, interpretar
   primero la categoría publicada (nombre exacto o coincidencia completa
   y prudente en la búsqueda Twitch); nunca elegir por ranking ambiguo.
2. Si la portada oficial no existe, está rota o corresponde al control gris,
   utilizar la imagen de biblioteca cuyo nombre/alias coincida con la
   **categoría concreta**.
3. **Categorías generales `Just Chatting`, `Entertainment`,
   `Entretenimiento`:** todas se resuelven como **Just Chatting** (portada
   oficial primero, biblioteca de Just Chatting después). Únicamente
   un **Karaoke** o **Collab Padoru** identificable mediante nombre/alias
   de biblioteca en el título puede ir por delante del Just Chatting.
   Si ese arte falta o no carga, se vuelve a Just Chatting.
4. **YouTube-only con categoría vaga o no indicada** (p. ej. `Gaming`):
   si no hay categoría Twitch evidente en el campo categoría, buscar de
   manera conservadora una categoría de Twitch que aparezca claramente en
   el **título**. Si se verifica, mostrar su portada antes de imágenes
   genéricas de biblioteca; en ausencia de portada, usar una coincidencia
   editorial fiable. `Gaming` no obtiene la excepción Karaoke/Padoru.
5. Finalmente, **imagen general** previamente registrada en biblioteca.
   Si aún no está añadida, texto de categoría/título como respaldo.

**Regla invariable:** Azur Lane, Fortnite, Dead by Daylight u otra
categoría concreta nunca pierden frente a `Karaoke` o `Collab Padoru`
mencionados sólo en el título. Una imagen de calendario subida para
Killer Chat! no puede desplazar la portada oficial de Killer Chat! en
la ficha. El origen Twitch se consulta mediante el Worker con ID
publicado y sin credenciales Twitch en el navegador.

El filtro del `404_boxart` gris sigue activo. La biblioteca editorial
se usa sólo cuando existe una asociación fiable, sin extrapolar
equivalencias de videojuegos mediante coincidencias vagas.

**Límite de alcance:** el calendario/editor privado mantiene imágenes
editoriales, biblioteca y selecciones explícitas en su superficie 1080×1080.
No modificar miniatura YouTube, LED, agenda, D1, Cron, estados,
enlaces, editor V.25 ni visor iframe.

## Imágenes que añadirá el propietario
Usar la biblioteca de imágenes **del editor privado existente**; guardar y publicar la agenda por el flujo editorial habitual cuando corresponda, no por este PR.
- **Karaoke:** crear imagen con nombre `Karaoke` (agregar alias opcionales).
- **Collab Padoru:** crear imagen con nombre `Collab Padoru` (alias opcional `Padoru`).
- **Respaldo universal:** crear imagen con nombre exacto `KGBlaze General`, `KGBlaze Default`, `Imagen General` o `Arte General`; alternativamente identificador interno `kgblaze-default`. Sólo se usa cuando no hay portada fiable o imagen específica. Ningún archivo se genera sin el material del propietario.

La biblioteca viaja en `libraryCustom` y `libraryChanges` del JSON público y mantiene la política original de imágenes data URI. No se introduce almacenamiento nuevo ni endpoint de escritura.

## API
`GET /departures/api/public/twitch-box-art?eventId=<ID_PUBLICADO>` devuelve `{ok:true,artUrl,source}`, donde `source` puede ser `category`, `title` o `null`. Sólo permite IDs con plataforma `yt` o `tw` presentes en la agenda editorial. Conserva la forma anterior `?name=<CATEGORIA_PUBLICADA>` para diagnóstico. No expone credenciales, nombres arbitrarios de búsqueda ni acceso a /api/admin.

La búsqueda consulta la **categoría editorial publicada**, no infiere sin evidencia la taxonomía interna de YouTube. `Search Categories` usa un máximo de seis consultas con expresiones depuradas del título y exige coincidencia de frase, nunca selección por ranking arbitrario.

## Corrección de visibilidad del panel desplegable (posterior a PR #26)
El panel recupera explícitamente la tercera columna para el arte de categoría, carga inmediatamente (sin `loading=lazy`) las imágenes agregadas al abrir el panel y puede volver a adjuntar el nodo `img` si una búsqueda asíncrona recupera una fuente después de un fallo. La luz conserva la altura recuperada. No se altera el lienzo/calendario 1080×1080 ni las prioridades editoriales.
