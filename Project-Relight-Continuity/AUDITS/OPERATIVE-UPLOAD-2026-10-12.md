# Stage 4 — verificación del HTML operativo entregado y regreso a consola D1
**Fecha:** 2026-10-12 CDMX (sesión de recuperación tras interrupción) · **Stage 4 sigue ABIERTA**.
**Fuente:** HTML adjunto por el usuario llamado `Terminal_Operativo_v23_11_encabezado_corregido(1).html`; se inspeccionó en contenedor privado, **no se subió el HTML a GitHub**.
**Tamaño:** 4,576,035 bytes. **SHA-256:** `d1e5673defadd9d319f1cfe51e41d40d1f77ef54d2adad5202573feb59c5467e`.

## Resultados verificados directamente
- `node --check`: pasa. HTML con único script; título documento `KGBlaze · Terminal · Tablero de salidas v23.11`.
- Búsqueda exacta: público ES `AEROPUERTO INTERNACIONAL DE LA KGBLAZE · TERMINALES A Y B` (DOM y canvas); EN `KGBLAZE INTERNATIONAL AIRPORT · TERMINALS A & B`; JA `KGBLAZE国際空港 · ターミナルA・B`. Cero `Terminal B` visible y un `terminalb` exclusivamente en la declaración `LEGACY_STORE`.
- `STORE='kgblaze_terminal_board_v3_202610'`; `LEGACY_STORE='kgblaze_terminalb_board_v3_202610'`. Prueba aislada Chromium con almacenamiento simulado: `restore()` recuperó preferencia EN desde legado y `save()` escribió la nueva clave, conservando la histórica. El paso de copia ocurre al guardar, no de forma automática inmediatamente después de leer.
- Chromium real con `page.set_content` y todas las conexiones externas bloqueadas: cargó sin errores JavaScript, canvas 1080×1080, encabezados ES/EN/JA cambiaron al seleccionar idioma, produjo imagen PNG de canvas. El entorno bloqueó `file://` (ERR_BLOCKED_BY_ADMINISTRATOR) y se probó el contenido íntegro con carga aislada equivalente; no afirmar prueba `file://` en el navegador del usuario.
- Formulario: al activar `Limpiar campos` se limpiaron nombre y hora en prueba de interacción DOM.
- Protocolo público: `publicSnapshot().schema='relight-public-v1'`; prueba de `Consultar` y `Publicar` con `fetch` **falso/interceptado**, sin red, produjo `GET /api/admin/snapshot`, `POST /api/admin/publish`, `baseRevision:0`, evento simulado y JSON sin token privado en body; sin errores. El objeto `sync` adjunto por editor no es evidencia confiable; Worker lo descarta en `normalizeEditorial` según código GitHub.
- Se contrastó `wrangler.toml` y `schema.sql` en el repositorio: binding `DB`, base **`kgblaze-terminal`**, tablas `terminal_state`, `terminal_audit`, `terminal_preview`; secret `ADMIN_TOKEN`, cabecera `X-Terminal-Week`. Worker se configura en Wrangler con nombre técnico de servicio `kgblaze-centro-informacion`, sin que eso cambie el nombre público del software `Terminal`.
- Nota cosmética: texto descriptivo aún dice «v23.7» aunque el documento ya declara `v23.11`. No modificar el artefacto aprobado sólo por este texto sin solicitud; no bloquea D1.
- La copia ICS incluida se identifica como ejemplo en `state.source`; su publicación está impedida hasta importar el ICS actualizado. No confundir backend publicado con sincronización real de Twitch/YouTube.

## Pruebas/acciones NO realizadas
- No se usó servicio Cloudflare/D1 remoto; no se desplegó Worker ni se configuró `ADMIN_TOKEN`.
- No se subió el HTML privado ni sus fuentes incrustadas, credenciales o respaldos al repo público.
- No se consideró completada la integración con APIs externas: cron/YouTube/Twitch siguen documentados pendientes.
- `file://` y `localStorage` persistente real en Windows no se probaron por bloqueo del entorno; se usó almacenamiento simulado para verificar código de migración.

## Próxima operación — consola, nomenclatura Terminal
1. En consola **D1** de Cloudflare abrir la base ya existente `kgblaze-terminal`. **Inspeccionar** previamente `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;`, sin cambios destructivos.
2. Si faltan tablas, aplicar **únicamente** el archivo `KGBlaze-Information-Center/schema.sql` (tres `CREATE TABLE IF NOT EXISTS terminal_*`) mediante `npx wrangler d1 execute kgblaze-terminal --remote --file ./schema.sql` desde la carpeta técnica local, o equivalente pegando el SQL en consola D1. **Requiere acción/confirmación explícita para modificar D1 remota.**
3. Comprobar que existen las tres tablas y preservar cualquier tabla histórica distinta, sin `DROP`. Después continuar secret `ADMIN_TOKEN` y despliegue sólo por autorización separada.
4. No renombrar D1 ni cambiar `database_id`; no revivir tablas `terminalb_*`. Nomenclatura pública «Terminales A y B» permanece.
