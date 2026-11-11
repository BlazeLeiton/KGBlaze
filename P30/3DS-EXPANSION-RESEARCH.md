# P30 — Extensión técnica 3DS: Pokémon X / ORAS / SM / USUM

**Corte:** 2026-11-11 · **Estatus:** evidencia de código público + diseño; SIN ejecución, compilación o pruebas de hardware.

## Prioridad funcional (orden no alterado)

1. **X:** primer prototipo.
2. **Platino, SoulSilver, Negro, Negro 2:** segunda fase, en paralelo de investigación.
3. **ORAS:** extensión 3DS después de DS.
4. **SM y USUM:** estudios preparados ahora, implementación futura cuando existan los juegos.

**El desarrollo documental de ORAS/SM/USUM comienza ahora; no cambia el orden de pruebas acordado.**

## Datos mínimos del bridge

Equipo de hasta seis (especie, forma, orden), HP actual/máximo, condiciones (quemadura, parálisis, envenenamiento, congelación, sueño, debilitamiento), y progreso: **medallas** para X/ORAS; **cristales Z poseídos** para Alola. Sin oponentes, ubicación, stats competitivas, IV/EV ni movimientos. Solo lectura y tráfico mínimo a PC.

## Hallazgo fuerte: PokeReader ya diferencia las cuatro familias

**Fuente comprobada:** <https://github.com/zaksabeast/PokeReader/blob/main/reader_core/src/gen6/reader.rs> y <https://github.com/zaksabeast/PokeReader/blob/main/reader_core/src/gen7/reader.rs>.

Ambas familias incluyen `party_pkm(slot)`, con paso entre slots de **484 bytes** y lectura de un `Pk6::STORED_SIZE` / `Pk7::STORED_SIZE`, respectivamente. **No asumir que los campos HP/estado están en el bloque almacenado**: investigar el resto de la estructura de equipo en RAM.

| Juego / lector | Dirección base RAM del equipo observada en el código | Rutina |
|---|---|---|
| X/Y `Gen6Reader::xy()` | `0x08CE1CF8` | `party_pkm` |
| OR/AS `Gen6Reader::oras()` | `0x08CFB26C` | `party_pkm` |
| S/M `Gen7Reader::sm()` | `0x34195E10` | `party_pkm` |
| US/UM `Gen7Reader::usum()` | `0x33F7FA44` | `party_pkm` |

Estas direcciones **no se han probado en la 2DS del usuario** y solo son candidatas para las versiones admitidas por PokeReader. No convertir offsets de software ajeno en garantías multi-región/idioma.

**Control estricto de versiones:** el `title.rs` de PokeReader <https://github.com/zaksabeast/PokeReader/blob/main/reader_core/src/title.rs> compara IDs de título y versión de actualización, y rechaza versiones no coincidentes. El código espera un valor de versión **5** para X/Y, **7** para OR/AS y **2** para S/M y US/UM. Son **códigos internos de actualización**, no declararlos automáticamente como la versión textual visible en HOME. Antes de las pruebas comprobar actualización de juego; no reabrir incidencias anteriores de copia de archivos.

## Cristales Z: fuente útil para Alola

PKSM-Core (FlagBrew) maneja explícitamente un bolsillo `Pouch::ZCrystals` en saves Gen7:

- <https://github.com/FlagBrew/PKSM-Core/blob/master/source/sav/Sav7.cpp> (método `pouches`: 30 slots SM, 35 slots USUM).
- <https://github.com/FlagBrew/PKSM-Core/blob/master/source/sav/SavSUMO.cpp> (`PouchZCrystals` con offset relativo `0xD68` en bloque de bolsa).
- <https://github.com/FlagBrew/PKSM-Core/blob/master/source/sav/SavUSUM.cpp> (`PouchZCrystals` con offset relativo `0xD70` en bloque de bolsa).

**Cautela crítica:** 30/35 es capacidad de registros o lista, NO cantidad de cristales ganados. El *save* y la RAM activa tienen estructuras/ubicaciones diferentes. Para progreso de Alola utilizaremos **conjunto de cristales distintos poseídos**, no número fijo de pruebas ni medallas; comprobar si el bolsillo contiene todo lo relevante y cuándo actualiza. No publicar ni transferir partidas.

## Compatibilidad con transmisión de video

- Fuente oficial ChirunoMod: <https://github.com/ChainSwordCS/ChirunoMod/blob/nightly-v4/README.md>.
- ChirunoMod es **proceso de fondo**, transmite video a Chokistream y usa loader CIA `ChLoad`, con `ChLoad_HIMEM` para **Old 3DS/2DS** en títulos de memoria extendida, menciona expresamente Pokémon Sol/Luna.
- PokeReader es un plugin **3GX**, con loader propio de Luma3DS; sus menús de RNG y dibujado por fotograma no son necesarios para P30.
- **No está verificada la coexistencia de ambos**, ni FPS, ni estabilidad con X/ORAS/SM/USUM. Debemos minimizar hooking, RAM y CPU, desactivar interfaz, y trabajar sólo sobre cambios de equipo/progreso.
- PokeReader requiere versión de juego actualizada según su propia guía: <https://www.pokemonrng.com/install-pokereader/>.
- GPL-3.0 PokeReader y ChirunoMod: antes de reutilizar código, revisar licencia, atribuciones y distribución de derivados.

## Plan de pruebas en orden

1. **PC únicamente:** simulador de eventos de equipo/PS/estado/progreso y conector PokéLink o fuente de navegador; validar contrato de escritura, no confundir Socket.IO lector con API escritora.
2. **X:** localizar y validar party, luego HP/estado/badges; medir con captura sola y con plugin, sin alterar partida.
3. **DS:** trabajo independiente documentado en [DS-TRANSFER-AND-RESEARCH.md](DS-TRANSFER-AND-RESEARCH.md).
4. **ORAS:** adaptar lector gen6 cambiando offsets validados y mapa de medallas; revisar capturabilidad.
5. **SM/USUM:** Gen7 y Z-cristales, memoria extendida en la Old 2DS; **prioridad de desempeño sobre automatización**.

### Resultado actual

**Lectura básica del equipo ya tiene precedente público para las cuatro familias**. Lectura de HP/estado/progreso y el transporte 2DS→PC bajo captura inalámbrica **siguen siendo hipótesis no probadas**. No instalar plugins de prueba indiscriminadamente en un hardware limitado.
