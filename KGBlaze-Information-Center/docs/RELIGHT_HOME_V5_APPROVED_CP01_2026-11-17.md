# KGBlaze — Home V5 · checkpoint de validación
**ID:** RELIGHT-HOME-V5-APPROVED-2026-11-17-CP01
**Fecha:** 17-nov-2026 · estado: **APROBADO PARA IMPLEMENTACIÓN EN RAMA DE PRUEBA**
**Rama:** `relight/kgblaze-home-v5-approved-20261117`.
**Prohibición:** no publicar/mergear automáticamente a main; conservar la Terminal de producción y sus endpoints.

## Identidad y jerarquía
- Marca única **KGBlaze** (sin logo aprobado todavía), enlace a inicio; un encabezado global.
- **Escritorio:** KGBlaze · Sobre Blaze · Música · Comunidad · **Salidas** destacado Medium Blue · ES EN JP **separados**. NO mostrar el icono de líneas en escritorio. Reservar Tienda futura pero no mostrar navegación vacía; Música podrá abrir Covers/Álbumes cuando esté publicado.
- **Móvil:** encabezado limpio KGBlaze + ES EN JP. Motivo de **dos columnas contiguas, mismo ancho, 1 pt izquierda + 2 pt derecha, filas regulares** situado a la derecha del título del hero, NO en el encabezado. Abre menú lateral sobrepuesto **únicamente sobre el área central**, entre encabezado superior y barra inferior social. Incluir Volver. No desplazar contenido al abrir; controlar foco, scroll y Escape.
- Barra social: **escritorio izquierda**, **móvil inferior fija**, con YouTube, Twitch, Instagram, X/Twitter y Discord, y Más sólo para enlaces oficiales adicionales verificados. No inventar direcciones.
- No presentar “Dreamshifter” como profesión. Copy exacto de portada: **BLAZE LEITON — VTUBER · VSINGER**; **Explora nuestros destinos**; **Terminales A y B**. Sin “Bienvenido a KGBlaze” ni “KGBlaze Terminal Internacional” inventado. Nombre KGBlaze siempre junto.
- Hero: fondo aeronáutico propio o autorizado por definir; **fichas YouTube izquierda y Twitch derecha sobrepuestas** al mismo fondo; móvil apiladas YT primero, fondo llega aproximadamente hasta **mitad de la ficha YouTube**, que cruza fondo oscuro y claro. No agregar imágenes generadas al entregable.
- **Debajo**, orden acordado: tarjetas Próximas salidas (Medium Blue **#276EF1**) + Rebel Mix (Dark Purple **#551E5F**), Información de viaje (Perfil, Modelos y formas), Vuela con nosotros (Referencias, Fanarts, Emotes), Métodos de apoyo disponibles, pie institucional.
- Colores: KGBlaze `#020C41`, `#0B1761`, `#276EF1`, `#A5EBFF`, `#FA0073`; Rebel Mix `#551E5F`, `#695FE6`, `#D7D2FF`. Blanco cálido `#F2F2F0`. Excepción visible botones YT cercano a rojo de la plataforma y TW `#9146FF`.
- ES/EN/JA: conservar terminología previa de Salidas en japonés: `出発` (Shuppatsu), `出発案内板` (Shuppatsu annaiban), `配信中` (Haishinchū). Nuevos propuestos: Explora nuestros destinos `旅先を探そう` (Tabisaki o sagasō, «busquemos destinos de viaje»), Información de viaje `旅行情報` (Ryokō jōhō), Vuela con nosotros `一緒に飛ぼう` (Issho ni tobō), Métodos de apoyo disponibles `応援方法` (Ōen hōhō). No cambiar traducciones existentes.
- YouTube tiene prioridad editorial y va primero. Si hay directo **verificado**, enlazar/embeber ID confirmado; una sala de espera confirmada sólo cerca de la emisión (15 min por defecto, 30 aún opcional sin autorizar automáticamente); en reposo, **cover más reciente o video destacado editorialmente**. Twitch mantiene ficha separada, en vivo sólo con prueba confirmada. No inventar directos ni IDs, no activar autoplay simultáneo.
- El reproductor propio, audios y descargas **EN PAUSA**; los álbumes **NO PUBLICADOS** permanecen reservados.
- Todos los accesos sin destino publicado deben estar explícitamente inactivos/pendientes, nunca conducir a 404 encubiertos.

## Implementación controlada
1. Rama de prueba, sin despliegue a producción ni fusión automática. En esta rama **GET /** sirve la nueva portada; se elimina sólo el redirect raíz hacia /departures/; `/departures/`, worker original y dashboard siguen intactos.
2. Conectar fuente pública `/api/public` en modo lectura, sin cambiar D1, cron, rutas o semánticas. Asegurar coincidencia plataforma+video ID+identidad antes de embeber; mostrar fallback editorial seguro.
3. Layout responsive y superposición reales; protección de accesibilidad, reduced motion, carga diferida y respeto de assets.
4. Pruebas de rutas, contenido, paletas, ES/EN/JA, estados de transmisión y regresión Terminal + Música.
5. Rediseños posteriores: aplicar encabezado compartido a Scripta Lyrica y preservar tipografía, voces y letras; preservar Terminal especializada pero armonizar exterior y vínculo de Salidas; desarrollar páginas Sobre Blaze/Comunidad sin inventar datos.

## Actualización de implementación — 17-nov-2026
- PR #161 **fusionada en `main`**, commit `9631cfd2224ff0611a6d8df3275f36934f708b2e`, por autorización expresa posterior del creador para probar en el sitio activo.
- Revisión de CI posterior al merge: [run 44182784505](https://github.com/BlazeLeiton/KGBlaze/actions/runs/44182784505), exitosa.
- El merge aplica la portada en `/` y conserva `/departures/`, rutas privadas y `/music/`. **No confundir merge/CI con verificación de despliegue Cloudflare**: esta última no pudo confirmarse desde el entorno disponible.
- Siguientes cambios de Rebel Mix y Terminal: sólo propuestas de rediseño, no implementados ni aprobados hasta su revisión.
