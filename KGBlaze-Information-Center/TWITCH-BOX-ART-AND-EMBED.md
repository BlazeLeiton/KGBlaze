# Stage 12 · Portada Twitch, iframe compacto y limpieza pública

Este cambio no toca la consola privada V.25, D1 editorial, miniaturas de YouTube ni sincronización de estados.

## Portada de la categoría
- La ficha pública busca `e.category` con `Twitch Helix Get Games`, a través del Worker (nunca navegador → Twitch con token).
- El nombre debe corresponder a una categoría de alguna actividad Twitch **ya publicada** en la agenda; la API pública no sirve como proxy de búsqueda de categorías arbitrarias.
- Se usa el `box_art_url` devuelto por Twitch, con tamaño 285 × 380.
- Antes de publicar esa URL al cliente, el Worker verifica la respuesta del CDN: fallo de carga, redirección al marcador `404_boxart` o coincidencia binaria con el marcador gris → **null**. La ficha entonces carga `effectiveEventLogo(e)` de la actividad editorial; si no hay imagen, muestra el nombre.
- La miniatura de YouTube no se toca.
- Ausencia de credenciales o caída del proveedor: respaldo editorial automático. No se alteran estados de eventos.
- La respuesta del endpoint se cachea 15 minutos en navegador y las comprobaciones por categoría por una hora dentro de cada instancia aislada del Worker.

## Configuración pendiente en Cloudflare
Registrar una app en https://dev.twitch.tv/console/apps .
En Workers & Pages → `kgblaze-terminal` → Settings → Variables and Secrets, añadir **secrets**, no variables públicas ni GitHub:
- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`

No enviar secretos por chat ni guardarlos en GitHub. No hacen falta permisos de usuario Twitch para `Get Games`: el Worker solicita un `app access token` con `client_credentials`. La falta de secretos sólo afecta portadas oficiales, no la agenda.

## Embed / limpieza
- Conservar la URL de modo compacto existente `/departures/?embed=1`: semana vigente, tablero de 1080, idiomas, enlaces sociales, «Ver completo» y sin navegación. **Hay que validar visualmente el modo renderizado en producción**; no debe confundirse con incrustar `/departures/` a secas.
- La capa del visor oculta solamente controles existentes cuyo texto indica «sin iframe» o «without iframe». No modifica el iframe auténtico ni metadatos OG / `og-semana.png`.
- No modificar el editor V.25 ni generar un V.25.1 a partir de esta tarea.

## Alcance
Rama preparatoria; la unión a `main` y el despliegue real deben verificarse mediante CI + pruebas públicas, sin forzar una nueva publicación editorial ni tocar la automatización YouTube.
