# KGBlaze - Centro de Información · Cloudflare (borrador de despliegue)

**Estado:** fuentes de despliegue en GitHub; el usuario ha creado la base D1 `kgblaze-terminal`. API básica de publicación y conciliación. **NO desplegado en Cloudflare.** Sin lectura real de YouTube/Twitch aún: no hay credenciales ni tareas periódicas habilitadas. El código del editor privado queda **fuera** de la carpeta `public/` y debe mantenerse fuera de repositorios públicos.

## Arquitectura actual

- `public/index.html`: visor público v3.1 con metadatos `KGBlaze - Centro de Información`, sin la agenda de muestra anterior. El editor bloquea también la publicación accidental del archivo .ics de ejemplo incorporado; primero importa un calendario real actualizado. Conserva diseño e idiomas ES/EN/JA y limita la vista a la semana vigente de México y cuatro adicionales. Lee `/api/public` cada 90 s cuando está alojado.
- `src/worker.mjs`: API Cloudflare Worker, publicación autenticada y acceso a agenda en D1; también gestiona imagen social manual 1080 × 1080.
- `src/core.mjs`: validación, límite de cinco semanas, control de revisiones, prioridad de bloqueos.
- `schema.sql`: tablas D1 para agenda, revisiones y vista previa social.
- `wrangler.toml`: configuración de Worker y activos estáticos; **sin ID D1** hasta configurarlo. El Cron está expresamente deshabilitado.
- `tests/`: pruebas unitarias y simulaciones de los endpoints, sin consumir APIs externas.
- **Archivo separado**: `TerminalB_Operativo_v23_10_sinc_local.html` — permanece local, nunca subir a `public` o un repositorio público.

## Protocolo entre operativo y público

1. El editor envía una agenda `relight-public-v1` con las próximas cinco semanas, sin sus respaldos administrativos ni credenciales.
2. El servicio conserva una revisión numérica. El editor debe consultar `GET /api/admin/snapshot` para conocer la revisión actual antes de intentar publicar.
3. `POST /api/admin/publish` exige `{baseRevision, agenda}`. Si otra modificación incrementó la revisión, retorna HTTP 409 y **no** sobrescribe el servidor.
4. Una emisión ya finalizada definitivamente conforme a comprobaciones de la plataforma (YouTube `lifeCycleStatus=complete`; Twitch tras 15 min de gracia) no admite modificaciones editoriales; respuesta HTTP 423.
5. Sólo el backend puede rellenar datos en `sync`: los objetos `verified` incluidos en el JSON subido por el editor se descartan. **Todavía falta conectar las APIs reales para producir verificaciones desde el servidor**.
6. El visor lee `GET /api/public` o `/agenda_publica.json`; si no hay agenda publicada muestra semana vacía y no inventa transmisiones.
7. La imagen social se publica manualmente con `POST /api/admin/preview` (PNG 1080 × 1080). El Worker sólo la devuelve mientras corresponde a la semana actual de CDMX; así no se promocionan imágenes obsoletas. La tarjeta de enlace es **imagen estática**, no iframe interactivo.

## Comprobación local del código

```bash
npm install
npm test
```

`npm test` usa Node y simulaciones; no requieren conexión con Cloudflare. Para probar la API con una base D1 local hace falta instalar Wrangler, crear la base en el archivo de configuración y ejecutar `npx wrangler d1 execute kgblaze-terminal --local --file schema.sql`, luego `npx wrangler dev`.

## Pasos para preparar el despliegue (no ejecutados)

1. El proyecto ya está alojado en el monorepositorio público **`BlazeLeiton/KGBlaze`**, dentro de **`KGBlaze-Information-Center/`**. Para integrarlo con Cloudflare Workers Builds, conecta el repositorio, establece esa carpeta como **directorio raíz del proyecto** y mantén el operativo privado fuera de GitHub. La escritura directa desde ChatGPT ya ha sido comprobada con la creación del `.gitignore`.
2. Instalar Wrangler y autorizar la cuenta para el despliegue mediante el panel de Cloudflare o `npx wrangler login`.
3. **Base D1 creada por el usuario en Cloudflare Dashboard:** `kgblaze-terminal`. Falta consultar el Database ID/UUID para terminar el enlace con el Worker.
4. Añadir al `wrangler.toml` la sección `[[d1_databases]]` con `binding = "DB"`, `database_name = "kgblaze-terminal"` y el **ID real** devuelto. Nunca inventar el ID.
5. Aplicar tablas: `npx wrangler d1 execute kgblaze-terminal --remote --file schema.sql`.
6. Guardar un secreto privado robusto: `npx wrangler secret put ADMIN_TOKEN`. No agregar el valor al código, a `wrangler.toml` ni a mensajes compartidos. La contraseña no se guarda en el navegador local.
7. Desplegar **sólo después de tu aprobación**: `npx wrangler deploy` o crear un flujo de Workers Builds conectado al repositorio.
8. Anotar la URL HTTPS definitiva del Worker, abrir el HTML operativo local, completar `https://…workers.dev` y el token de publicación, pulsar **Consultar**, revisar la agenda, **Publicar cambios** y opcionalmente **Publicar vista previa 1080 × 1080**.
9. Comprobar `/api/health`, `/api/public` y la visualización móvil/escritorio. El servicio no mostrará eventos hasta que tú publiques la primera agenda desde el editor.

## Claves API y vigilancia: fase aún pendiente

- **YouTube:** API Data v3 para encontrar salas del canal `UCRd_uwPjrsf6Z3CRXwNehEQ`. Para confirmar de manera segura el cierre irreversible de una sala se requiere comprobar el `lifeCycleStatus = complete` con `liveBroadcasts.list`, que necesita OAuth del propietario del canal. Un fallo de red, corte temporal o `actualEndTime` no verificado por sí solo **no bloqueará** la sala.
- **Twitch:** una aplicación de Twitch con `Client ID` y `Client Secret` para consultar `Get Streams`. Si ya se verificó una emisión activa y termina, debe esperarse **15 minutos** de desconexión confirmada antes del estado DESPEGÓ definitivo. Los errores de API no inician el temporizador.
- **Coincidencias:** prioridad de ID de video vinculado y, a falta de él, categoría/juego + título + fecha/hora con protección contra duplicados. YouTube tiene prioridad sobre Twitch en modo dual; Twitch prevalece cuando no hay sala de YouTube asociada de forma fiable. Las plataformas dependen de lo configurado en cada evento.
- **Limitación actual:** la API construida aquí todavía no hace esas consultas ni programó el Cron. **Nunca se debe anunciar este paquete como sincronización de transmisiones ya activa.**

## Notas de seguridad

- No incluir el editor privado, un respaldo JSON administrativo, tokens, `wrangler login` credentials ni respuestas privadas en un repositorio público o en `public/`.
- Endpoints de administración requieren `Authorization: Bearer <ADMIN_TOKEN>` y controles de CORS. El HTML local tiene un campo de contraseña temporal.
- No publicar una actualización cuando el servidor responde HTTP 409/423: primero recargar el estado y resolver el conflicto, sin «forzar» el envío.
- El uso de `file://` depende del navegador; en algunos sistemas habrá que ejecutar el editor desde un servidor local `http://localhost` sin exponerlo públicamente.
- Conservar respaldos locales. Este sistema no proporciona todavía recuperación ante fallos ni reversión de cambios.
