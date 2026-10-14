# Stage 13+ · Panel luminoso y arte por categoría / título

Cambios únicamente en la capa pública del visor y API de lectura; **no** modifican el HTML operativo privado V.25, publicación ICS, revisión editorial, D1, sincronización YouTube, miniaturas de video, iframe ni secretos.

## Barra luminosa
El HTML original continúa creando `.flight-light` con el estado de la actividad. El CSS inyectado por el Worker había cambiado `.flight-row-top` a `align-items:start`, colapsando la barra sin altura propia. Se restaura `stretch` y una altura mínima, conservando su color y brillo originales.

## Selección de imagen de actividad
La ficha expandida usa este orden:
1. Imagen elegida **explícitamente para la actividad** (`upload` o `lib:...`), sin sobrescribir una selección editorial intencional.
2. Biblioteca editorial por la **categoría** publicada (`e.category`), incluidos nombres/alias.
3. Portada auténtica de Twitch para la **categoría** (Helix Get Games, incluso si la actividad es sólo de YouTube).
4. Biblioteca editorial por **título** (`e.title`).
5. Búsqueda prudente en Twitch desde el título: coincidencia exacta por Get Games o `Search Categories`, aceptando sólo nombres completos dentro del título y sin contradecir una categoría editorial específica.
6. Imagen editorial **general** registrada en biblioteca.
7. Texto de la categoría/título si todavía no existe una imagen general.

El ejemplo **categoría Azur Lane + título Collab Padoru** prioriza Azur Lane. La detección de `404_boxart` gris permanece activa y ninguna URL de imagen se obtiene del navegador con credenciales Twitch.

## Imágenes que añadirá el propietario
Usar la biblioteca de imágenes **del editor privado existente**; guardar y publicar la agenda por el flujo editorial habitual cuando corresponda, no por este PR.
- **Karaoke:** crear imagen con nombre `Karaoke` (agregar alias opcionales).
- **Collab Padoru:** crear imagen con nombre `Collab Padoru` (alias opcional `Padoru`).
- **Respaldo universal:** crear imagen con nombre exacto `KGBlaze General`, `KGBlaze Default`, `Imagen General` o `Arte General`; alternativamente identificador interno `kgblaze-default`. Sólo se usa cuando no hay portada fiable o imagen específica. Ningún archivo se genera sin el material del propietario.

La biblioteca viaja en `libraryCustom` y `libraryChanges` del JSON público y mantiene la política original de imágenes data URI. No se introduce almacenamiento nuevo ni endpoint de escritura.

## API
`GET /departures/api/public/twitch-box-art?eventId=<ID_PUBLICADO>` devuelve `{ok:true,artUrl,source}`, donde `source` puede ser `category`, `title` o `null`. Sólo permite IDs con plataforma `yt` o `tw` presentes en la agenda editorial. Conserva la forma anterior `?name=<CATEGORIA_PUBLICADA>` para diagnóstico. No expone credenciales, nombres arbitrarios de búsqueda ni acceso a /api/admin.

La búsqueda consulta la **categoría editorial publicada**, no infiere sin evidencia la taxonomía interna de YouTube. `Search Categories` usa un máximo de seis consultas con expresiones depuradas del título y exige coincidencia de frase, nunca selección por ranking arbitrario.
