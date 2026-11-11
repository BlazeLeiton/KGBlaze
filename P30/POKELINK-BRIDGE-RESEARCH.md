# P30 — Pokémon Bridge: investigación y arquitectura

**Corte:** 2026-11-11 · **Estado:** INVESTIGACIÓN / DISEÑO; no se ha compilado ni probado un puente propio en 2DS.

## Decisión vigente

**Prioridad de desarrollo:**
1. **Pokémon X**, exclusivamente como primer prototipo.
2. **Pokémon Platino, SoulSilver, Negro y Negro 2** en modo Nintendo DS.
3. Rubí Omega y las demás entregas de Nintendo 3DS.
4. Alola (Sol/Luna y Ultra), futura y **sin juegos disponibles actualmente**. En esos juegos, medir **cristales Z obtenidos** como progreso, no medallas.

Los **controles manuales de PokéLink ya están preparados**. Automatizar es una mejora optativa, no un bloqueo para transmitir. Los overlays y Pokédex ya existen; no rediseñarlos por sistema.

### Datos necesarios

- Equipo de hasta seis: especie, forma, orden (apodo solo si se muestra).
- HP actual/máximo y estado alterado (quemado, paralizado, veneno, sueño, congelado, debilitado).
- Medallas individuales por región, o **cristales Z** para Alola.
- **No necesitamos** rivales, ubicación, RNG, IV/EV, movimientos, habilidades, objetos equipados ni estadísticas adicionales.

**Prioridad absoluta: no degradar el juego ni la captura de vídeo.** Leer poco, poco frecuentemente y transmitir solo cambios; calcular/procesar en la computadora. No escribir en memoria del juego ni modificar partidas.

## Primera fase: Pokémon X

PokeReader <https://github.com/zaksabeast/PokeReader> es una base de investigación para plugins `.3gx` en hardware 3DS. Revisado el código original:

- <https://github.com/zaksabeast/PokeReader/blob/main/reader_core/src/gen6/reader.rs>
- `Gen6Reader::xy()` dispone de tabla de direcciones XY y `party_pkm(slot)` obtiene los Pokémon del equipo desde la memoria.
- **Importante:** la función lee el bloque `Pk6::STORED_SIZE`; no demuestra que HP de combate y estados se recuperen allí. Hay que investigar los bytes adicionales del miembro activo de equipo.
- Las **medallas** tampoco están implementadas por ese lector; localizar sus banderas antes de comprometerse a su lectura.
- Validar región, versión y actualización de Pokémon X antes de reutilizar offsets.
- El repositorio PokeReader tiene licencia **GPL-3.0**; revisar obligaciones de atribución y derivados antes de copiar código.

### Arquitectura propuesta, aún sin validar

```text
Pokémon X en Nintendo 2DS real
  → lector ultraligero de memoria (.3gx, lectura exclusiva)
  → eventos compactos solo si equipo/PS/estados/medallas cambian
  → LAN → receptor KGBlaze Pokémon Bridge (PC)
  → conversión y sincronización con PokéLink
  → overlays existentes en OBS
```

La existencia de <https://github.com/pokelinkapp/Pokelink-Community-Plugin> y mensajes Socket.IO de sus temas **NO demuestra** una API estable que permita modificar desde fuera una sesión de PokéLink. Investigar ese contrato; alternativa: actualizar una fuente de navegador en OBS desde nuestro receptor sin rehacer los elementos visuales.

Parámetros tentativos para medir (NO confirmados): lectura de equipo/PS cada 2–5 s, medallas mucho menos, enviar paquetes pequeños únicamente ante cambios. No usar menús o dibujos del plugin en pantalla.

## Captura y rendimiento

- Equipo físico: **Nintendo 2DS original (Old 2DS)**.
- **ChirunoMod, ChLoad/ChLoad_HIMEM y Chokistream** se investigan para captura 3DS; aún **no instalados ni probados** en esta consola.
- **NO se ha probado coexistencia** entre ChirunoMod y un lector `.3gx`, ni FPS ni consumo de memoria propios.
- Las herramientas de captura de modo 3DS no resuelven necesariamente la captura de modo DS/TWL.
- Probar en este orden: juego sin herramientas → captura sola → lector solo → captura + lector. Medir FPS, latencia, audio, congelamientos, cambios de escena.
- Rechazar el experimento si impide jugar/transmitir con estabilidad.

## Segunda fase: todos los Pokémon DS

**No se puede asumir que un plugin `.3gx` de Luma funciona dentro de un juego DS en modo TWL.** Buscar una técnica distinta.

`nds-bootstrap` de <https://github.com/DS-Homebrew/nds-bootstrap> ya ofrece un **menú/visor de memoria RAM y posibilidad de volcado de memoria** para sesiones de diagnóstico: <https://manual.ds-homebrew.com/es/nds-bootstrap>. Eso es una base para investigar **lectura**, no prueba de **telemetría en vivo a una PC**.

Distinguir:
1. **Cartucho DS insertado directamente**: arranca nativamente, sin nds-bootstrap ni sus herramientas de lectura.
2. **Archivo .nds en SD con TWiLight Menu++**: nds-bootstrap carga el juego en modo DS nativo, con recursos de diagnóstico.
3. **Archivo .nds en SD con un forwarder de HOME**: acceso directo creado mediante NDSForwarder **también utiliza nds-bootstrap** (el usuario no necesita entrar al menú TWiLight). Guía oficial: <https://wiki.ds-homebrew.com/es-ES/ds-index/forwarders>.

Para programar después:
- Primero comprender RAM del equipo en **Platino** o **SoulSilver**, después **Negro** y **Negro 2**.
- Comprobar estructuras de especies/HP/estados/medallas por juego y versión; no asumir que los offsets de Gen IV funcionan en Gen V.
- **Modo DS y Wi-Fi:** estudiar si existe un canal de datos seguro/eficiente sin bloquear el juego. No suponer que sockets de plugins 3DS permanecen en TWL. No rebajar seguridad del router a WEP ni abrir redes inseguras para hacerlo.
- Un RAM dump permite validación puntual, pero **no equivale a actualización automática durante un stream**.
- Si el puente DS requiere demasiado CPU/RAM, conservar controles manuales de PokéLink sin sacrificar el rendimiento.

### Procedencia de los cuatro juegos DS

El usuario espera verificar una segunda consola donde quizá los juegos estén **almacenados en memoria**. Está pendiente conocer modelo y formato.

- **.nds en tarjeta SD/microSD de la otra consola:** potencialmente transferibles a la 2DS como archivos si se dispone de las copias legítimas, guardando también los `.sav` correspondientes; abrir con TWiLight o forwarders. No significa instalación de juegos DS como CIA ni ejecución en modo 3DS.
- **Cartuchos originales:** insertarlos directamente en 2DS (sin TWiLight); para la instrumentación DS mediante nds-bootstrap haría falta extraer legalmente una copia del cartucho propio o autorizado.
- **Títulos realmente instalados como DSiWare/otro formato:** no asumir copia directa entre consolas; la transferencia depende del formato y licencias. **No copiar sin más la carpeta Nintendo 3DS esperando que los títulos de otra consola aparezcan.**
- **No hay comprobación de qué modelo ni qué formato contiene esa segunda DS.** Pedir ese dato cuando esté disponible.

## Puertas de prueba

| ID | Prueba | Estado |
|---|---|---|
| X-0 | Receptor PC con datos de Pokémon simulados y prueba de escritura/control hacia PokéLink | Pendiente |
| X-1 | Lectura de equipo de X desde plugin mínimo, solo lectura | Pendiente |
| X-2 | Identificación/validación de HP, estado y medallas | Pendiente |
| X-3 | Captura inalámbrica 3DS sola y línea base de FPS | Pendiente |
| X-4 | Captura + lector simultáneamente, sin degradación notable | Pendiente |
| DS-0 | Localizar partidas/copia de los cuatro juegos; determinar soporte de nds-bootstrap | Pendiente |
| DS-1 | Inspección de RAM en Gen IV y V; confirmar estructuras | Pendiente |
| DS-2 | Estudiar transporte real de telemetría DS a PC y costo de ejecución | Pendiente |

## Licencias, seguridad y privacidad

Este directorio público contiene solo documentación saneada. No subir ROMs, BIOS, NAND, partidas, claves, NNID, información de cuentas ni código copiado sin licencias. No confundir diseño, prototipo, prueba de consola, despliegue y compatibilidad final.

**Siguiente prioridad:** verificar el contrato de plugins y datos de PokéLink y construir receptor simulado PC para Pokémon X; en paralelo localizar la documentación técnica de nds-bootstrap sobre instrumentación Gen IV/Gen V.
