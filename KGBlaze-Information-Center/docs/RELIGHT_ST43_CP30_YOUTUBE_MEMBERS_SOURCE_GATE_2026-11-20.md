# Project Relight · Stage 43 CP30 — YouTube memberships: source/permissions gate
**Fecha:** 20-nov-2026. **Alcance:** segunda prueba de reconocimiento del Home para MIEMBROS DE PAGO de YouTube, sin afectar la prueba Twitch.

## Evidencia ya verificada en GitHub
- Canal público propietario en Terminal YouTube: `UCRd_uwPjrsf6Z3CRXwNehEQ` (src/youtube-sync.mjs y wrangler.toml).
- El YouTube API key del visor permite buscar videos y estados editoriales, **NO una lista de miembros que pagan**. No existe OAuth de creador con permisos de membresías validado en producción.
- src/recognition-youtube-private.mjs fue preparado en Stage42 CP01 pero continúa PRIVATE, UNMOUNTED. Su operación requiere YOUTUBE_MEMBERS_API_ACCESS_VERIFIED=true, canal propietario, token con scope específico y cuentas verificadas; no confundir preparación con acceso real.
- La banda pública original reconoce las categorías Miembros de YouTube, Suscriptores de Twitch, Apoyos recurrentes. Actualmente solo Twitch aporta identidades, con la simulación CP28 temporal; su cuenta de propietario permanece mientras duren las pruebas.

## Google / YouTube: límites de fuente (verificados el 20-nov-2026)
- API oficial `GET https://www.googleapis.com/youtube/v3/members?part=snippet&mode=all_current`: requiere scope `https://www.googleapis.com/auth/youtube.channel-memberships.creator` **Y acceso por allowlist especial del canal** a través de un representante o Partner Manager. Autorizar Google OAuth sin allowlist **NO** garantiza poder consultar miembros; puede responder 403. Referencia: https://developers.google.com/youtube/data/reference/rest/v3/members/list
- Google distingue en YouTube Studio **Total members** (incluye suscripciones canceladas aún con acceso a beneficios) y **Active members** (se descuentan las canceladas). No inventar que una fila de la exportación representa cobro activo; inspeccionar campos reales. Referencia: https://support.google.com/youtube/answer/7491256?hl=en
- Fuente manual oficial alternativa: YouTube Studio > Earn / Ingresos > Memberships / Membresías > ver miembros > Descargar CSV de miembros actuales. Google documenta la descarga pero **no** ofrece un esquema público de encabezados fijos para inferir columnas sin el archivo real.
- Chat en vivo ofrece indicadores y eventos de membresía, pero sus mensajes aislados no prueban que todas las personas sigan vigentes cuando no chatean. NO usar live chat para fabricar lista completa.
- Google cita a Streamlabs como integración de Super Chat / membresías y a otros terceros como overlays; esa mención **no acredita** que la configuración gratuita del creador ofrezca una lista exportable completa ni una API de estados. Referencia: https://support.google.com/youtube/answer/9315687?hl=en-GB

## Trabajo de código CP30
- src/recognition-youtube-studio-csv.mjs: parser **offline**, estricto para CSV/TSV, UTF-8 BOM, quoted fields y saltos de línea. Solo devuelve encabezados y número de filas; NO devuelve nombres, IDs, tiers o detalles monetarios. Mantiene `activeStatusVerified:false` y `publicNamesEnabled:false` aunque el archivo se pueda parsear.
- Tests de protección y parseo, incluyendo archivo sin columnas verificables, inconsistencias, BOM y CSV localizado.
- Deliberadamente sin nuevos endpoints HTTP, Worker import, D1, token, cron, permiso de Google, mensajes de chat ni activación de nombres en Home.

## Siguiente intervención indispensable
1. El propietario visita https://studio.youtube.com -> Ingresos / Earn -> Membresías / Memberships. Si el programa está habilitado, abre la lista de miembros y comprueba si aparece el control Descargar CSV.
2. Compartir el CSV real o, para limitar exposición de identidades durante la primera inspección, únicamente sus encabezados (primera fila). No entregar credenciales, cookies ni API keys.
3. Verificar el contenido real y la semántica de sus columnas (canal único/URL, estado vigente, nivel, nombre). NO adivinar si 'cancelado' tiene todavía acceso; acordar criterio de inclusión antes del import.
4. Construir por separado el normalizador validado para el CSV, una tabla D1 aislada de YouTube, validación de consentimientos unasked/approved/declined y publicación por bandera explícita con un piloto temporal y caducidad si el creador lo aprueba. **No reemplazar el roster de Twitch.**
5. Para sincronización diaria totalmente automática investigar autorización individual de Members API o un tercero con fuente fiable de vigencia; si no existe, un CSV nuevo será una verificación manual periódica, no un monitor automático.

## Lo que NO se ha hecho
No se han leído datos de YouTube Studio del creador. No se ha afirmado que haya miembros activos de YouTube ni que el programa esté habilitado, no se ha importado ningún nombre ni se ha publicado a ningún miembro de YouTube.