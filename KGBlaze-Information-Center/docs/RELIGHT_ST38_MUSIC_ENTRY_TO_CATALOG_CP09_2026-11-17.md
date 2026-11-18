# Project Relight — Stage 38 · CP09 · Entrada musical directa y selector futuro
**Fecha:** 2026-11-17 · America/Mexico_City.
**Tipo:** delta operativo posterior al cotejo CP08. **Autorización específica:** el usuario solicita sacar la pantalla intermedia de la ruta pública y servir directamente la lista, preservando la pantalla para la selección futura entre álbumes y repertorio completo.
**Estado al crear:** cambios en rama `relight/st38-music-catalog-direct-20261117`, pendientes de CI/merge. No mezclar con PR164 (draft, anterior a V6 recuperada).

## Contrato de rutas
- `/music` y `/music/` → **HTTP 307 temporal** a `/music/songs/`, manteniendo todos los parámetros `?lang=...` y filtros si se proporcionan.
- Portada KGBlaze: los cuatro enlaces (navegación escritorio, tile Rebel Mix, pie, menú móvil) apuntan directamente a `/music/songs/` para evitar un salto innecesario.
- `/music/songs/` sigue sirviendo la **lista real**; `/music/songs/:slug/` sigue sirviendo cada ficha original y sus opciones. Alias históricos de canciones siguen siendo redirigidos como antes.
- `/music/albums/` **NO se publica**; ningún álbum nuevo habilitado.
- El renderer `musicPage('/music/',query)` y los dos paneles selectores (canciones/álbumes) quedan **preservados como artefacto de desarrollo**, no eliminados y sin enlace público activo; será retomado cuando exista diseño de selector aprobado. La misma capa global homologada se aplica en código a esta vista, igual que al catálogo y fichas, pero el endpoint responde 307 y no entrega su HTML en producción.

## Homologación visual acotada
- Cabecera KGBlaze (Sobre Blaze, Música ▾, Comunidad ▾, Salidas con icono real de avión y pista, ES/EN/JP), mobile compacto con control de líneas/drawer.
- Rail social en escritorio y franja social **fija** en móvil. Cinco logos originales `yt/tw/ig/x/dc` tomados del objeto `LOGOS` de `public/index.html` sin cambios de imagen; servidos como data URI en `src/music-social-icons.mjs`. No se generan imágenes ni se distribuyen fuentes.
- Hero Rebel Mix: `KGBlaze · Scripta Lyrica` provisional, `Rebel Mix`, `Colección musical / Music Collection / 楽曲選集`.
- Catálogo real `Lista de canciones / Song list / 楽曲一覧`, con filtros, portadas y fichas originales.
- Footer público sin notas de trabajo: sólo `KGBlaze · Project Relight` alineado a la derecha.
- Cambio de idioma in-app actualiza también la cabecera y el panel lateral.

## Guardas del sistema
- NO cambiar `music-catalog.mjs`, `music-lyrics.mjs`, `music-artwork.mjs`, atributos de video/versión, releases, audio privado o metadatos musicales.
- NO cambiar `public/index.html`, Terminal canvas/selección, D1/Worker APIs, cron, Dashboard. La música depende del mismo worker para el route y el render HTML; sólo alterar el branch de rutas públicas musicales.
- `Cache-Control: no-store` y status 307 para evitar bloquear permanentemente el regreso futuro a la landing.
- No se han publicado álbumes y no se debe afirmar despliegue HTTP hasta comprobarlo. GitHub merge/CI son verificación distinta.

## QA requerido antes de cerrar
- Verificar GET/HEAD `/music` y `/music/` responden 307 a `/music/songs/` con parámetros preservados, sin loop.
- Verificar GET `/music/songs/` y fichas originales responden 200 con HTML de catálogo/ficha, no la landing.
- ES/EN/JA, CSS Garnett, drawer y social responsive; streaming de audio y detalles sin regresiones.
- Las pruebas de catálogo/Terminal y el despliegue Cloudflare se reportan por separado.
