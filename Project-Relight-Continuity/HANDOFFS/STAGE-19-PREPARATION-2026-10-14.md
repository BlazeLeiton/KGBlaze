# Preparación de Stage 19 — Relight Respark / Portada de categoría en ficha desplegable

**Corte:** 2026-10-14 (America/Mexico_City). **Estado:** PREPARADO, NO INICIADO como conversación independiente; sin PR correctivo de Stage 19 ni modificación visual nueva.
**Origen:** usuario pidió continuar el trabajo del defecto visual de Stage 18 en una conversación nueva llamada Stage 19 *si se acerca el límite del chat*, después de un Relight Respark profundo. No existe medidor fiable del límite de chat ni capacidad de abrir chats automáticamente; la conversación nueva la inicia el usuario.

## Recuperación de contexto imprescindible

- Stage 16 corrigió reconstrucción de portada; PR #28 fusionado `2d7d2982ace559135d2b62b571ef64eeb7422d51`.
- Stage 17 reforzó pruebas de geometría sin cambios visuales; PR #29 fusionado `6534dae115fed863e43c4b59b06a050479bf526d`.
- Stage 18 identificó `ReferenceError: __name is not defined` en `artworkCandidates()`; PR #30 fusionado `64f5e59671df4790f4760e5c9df477f3bbeb32d8`, GitHub Actions push run 38520479726 SUCCESS.
- Captura **posterior** al PR #30 (del usuario, 14-oct-2026): ficha Killer Chat! Original Edition abierta, **barra luminosa verde visible** a la izquierda del título, caja de imagen vertical con arte de Killer Chat! a la derecha, miniatura YouTube grande debajo, estado EN VIVO. La consola ya no muestra `__name`; sólo `ERR_BLOCKED_BY_CLIENT` y favicon 404 (no atribuir la selección de imagen a ellos).
- El usuario afirmó «Sí, pero no sale como debería». La respuesta previa del asistente interpretó que el arte superior derecho era una imagen incorrecta; esto **aún no está confirmado de manera independiente** como expectativa final de origen, tamaño o encuadre. No atribuir a CSS ni asumir que una imagen concreta es incorrecta por sí sola.
- En un registro previo de la actividad Killer Chat! consta `logoChoice:"upload"`; confirmar contra la agenda pública actual antes de darlo por hecho en producción.

## Hallazgo verificado en código (baseline PR #30)

`KGBlaze-Information-Center/src/viewer-enhancements.mjs`:
- `const explicit=choice==='upload'||choice.startsWith('lib:')?effectiveEventLogo(e):null`
- `const categoryArt=explicit||editorial.category`
- Si `categoryArt` existe, `showSources([categoryArt,titleArt,general])` **retorna sin consultar** `/departures/api/public/twitch-box-art`.
- `editorial.titleBeforeGenericCategory` sólo permite titulo/alias vencer categoría genérica Just Chatting/Entertainment; selección explicita sigue primero.
- Por tanto, una portada subida explícitamente puede inhibir la portada oficial Twitch, conforme a la norma documentada `ACTIVITY-ARTWORK-PRIORITY.md`. **Modificar esta prioridad sin nueva decisión explícita sobre la ficha sería una regresión respecto al criterio vigente.**

`src/twitch-box-art.mjs`: intenta categoría exacta Twitch Get Games y rechaza el box art genérico gris; si no, búsqueda desde título con coincidencias prudentes. `src/activity-art-match.mjs`: alias de biblioteca, categoría específica antes de título y excepción de genéricos. La imagen editorial del calendario 1080×1080 permanece separada.

## Plan de Stage 19 (después de ejecutar Relight Respark 1–18)

1. Recuperar normas 13–18 y distinguir portada de **categoría** en ficha, arte explícito editorial y thumbnail YouTube; confirmar expectativa de imagen superior derecha sin inventarla.
2. Verificar `logoChoice`, `category`, `title`, biblioteca/alias y respuesta de `/departures/api/public/twitch-box-art?eventId=...` para Killer Chat!; comparar casos Azur Lane, Padoru, Karaoke y categoría genérica, con pruebas de seguridad y fallback.
3. Definir regla de prioridad para panel compatible con aprobación del usuario; si se requiere diferenciar la selección explícita de calendario y de ficha, tratarlo como decisión **nueva**, nunca cambio implícito global.
4. Preparar rama y PR de corrección mínima sólo después de determinar fuente/precedencia correcta; tests Node + Chrome post-empaquetado, coexistencia LED/arte, móvil, redibujado, fallback, sin afectar componentes excluidos.
5. Solicitar aprobación para merge; confirmar GitHub Actions, Workers Builds y navegador público antes de cerrar defecto.

**Exclusiones:** no modificar agenda editorial/revisión, publicación, consola privada V.25, D1, Cron, YouTube status, enlaces, thumbnail YouTube, iframe, ni imagen del calendario 1080×1080.

## Registro KGRP

El índice `Project-Relight-Continuity/STAGES/index.json` todavía sólo formaliza etapas 1–7; faltan fichas 8–17. Este archivo es **handoff de preparación**, no ficha formal ni declaración de Stage 19 ejecutada. No alterar `latest_stage` a 19 sin reconstrucción archivística verificable.
