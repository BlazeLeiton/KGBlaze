# P30 — Pokémon Journeys | Project Relight

**Registro principal del proyecto Pokémon dentro de KGBlaze / Project Relight.**  
**Corte de continuidad:** 2026-11-11 · America/Mexico_City  
**Estado:** planificación técnica y producción; NO implica que exista un plugin funcional.

> **P30 es un apartado de proyecto, NO equivale a Stage 30 ni sustituye el índice histórico de Stages.** Este directorio está separado del software de `KGBlaze-Information-Center/` y no cambia Terminal, sus API, D1 ni los despliegues.

## Objetivo

Recorrer las generaciones I–VII de Pokémon Journeys en el canal de Blaze Leiton / KGBlaze, con enfoque narrativo, presentación visual regional y seguimiento del equipo mediante PokéLink cuando sea viable.

- **GBA/GB en computadora:** conservar el flujo existente con mGBA/PokéLink donde corresponda.
- **Nintendo DS y Nintendo 3DS:** preferir **Nintendo 2DS original física** para mantener controles y pantalla táctil. Capturar ambas pantallas en OBS; no sustituir automáticamente por emuladores en PC.
- **Overlays / Pokédex:** diseños regionales ya preparados. El overlay Johto DS ya tuvo ajustes en OBS; los recursos 3DS contemplan Rotom arriba y marco regional inferior. **No rediseñar por defecto.**
- **Controles manuales de PokéLink:** ya previstos/preparados por el usuario; NO son una tarea pendiente.
- **Entregables futuros:** tráiler y función interactiva «¿Quién es ese Pokémon?» para OBS/Discord.
- **Calendario:** el arranque se movió de octubre a noviembre; priorizar disponibilidad real, sin convertir las fechas originales en obligaciones vigentes.

## Orden técnico APROBADO (11-nov-2026)

1. **Pokémon X exclusivamente:** primer prototipo del puente de datos desde 2DS real.
2. **Todos los DS de la ruta:** Platino, SoulSilver, Negro y Negro 2, aunque requieren una arquitectura diferente al plugin `.3gx`.
3. **Rubí Omega / otras entregas 3DS:** extensión después de la fase DS.
4. **Sol/Luna y Ultra:** futuras entregas **no disponibles actualmente**; medir progreso con **cristales Z obtenidos**, no medallas.

### Datos estrictamente necesarios

- Equipo de hasta seis Pokémon (especie y forma cuando afecte al sprite).
- PS actuales y máximos, y estados como quemadura, parálisis, veneno, sueño, congelación, debilitado.
- Progreso de medallas para regiones con gimnasios; **cristales Z** para Alola.
- Apodos solo si aportan a los overlays.
- **Excluidos:** IV/EV, estadísticas competitivas, habilidades, movimientos, objetos, RNG, rivales, ubicación, historial y lectura extensa de memoria no imprescindible.

**Prioridad absoluta:** estabilidad de juego y captura de pantalla. Muestreo reducido, detección de cambios y procesamiento en PC. Nada de edición de partidas; lectura únicamente.

## Documentación

- [Estado confirmado de la 2DS, aplicaciones y pendientes](2DS-STATUS.md)
- [Investigación y arquitectura propuesta del puente 2DS → PokéLink](POKELINK-BRIDGE-RESEARCH.md)
- [Expansión 3DS: ORAS, SM, USUM y cristales Z](3DS-EXPANSION-RESEARCH.md)
- [Consola complementaria DSi XL, transferencias y RAM de DS](DS-TRANSFER-AND-RESEARCH.md)
- [Salida al overlay: servidor Socket.IO compatible con temas PokéLink](POKELINK-OUTPUT-RESEARCH.md)

## Criterios de evidencia

Cada aspecto debe distinguir **decidido**, **instalado**, **probado**, **investigado** o **hipótesis**. La compatibilidad con ChirunoMod y el rendimiento real en la 2DS NO están probados; tampoco está verificada una API pública estable de escritura hacia PokéLink.

## Privacidad y alcance

El repositorio es público: **NO** subir ROM, partidas, NAND, claves de Wi-Fi, NNID, archivos de usuario, credenciales, capturas privadas ni código de terceros copiado sin revisar licencia. Solo documentación técnica y enlaces públicos.

## Próximo paso

Investigar y prototipar primero la ruta de lectura/recepción para Pokémon X **sin modificar la consola**, después verificar rendimiento con captura separada y, en segunda fase, estudiar la instrumentación DS a partir de nds-bootstrap. Toda implementación requerirá pruebas por juego, versión y modelo.
