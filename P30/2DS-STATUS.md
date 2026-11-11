# P30 — Nintendo 2DS | Estado de continuidad

**Fecha de corte:** 2026-11-11 · **Base:** confirmaciones del usuario en conversación.  
**Este documento registra hechos observados; NO presupone que algo no probado funciona.**

## Hardware

- Nintendo **2DS original (Old 2DS)**, firmware oficial **11.17.0-50U**.
- SD **64 GB FAT32**; 3DSident indicó aproximadamente **55,9 GB libres**.
- **boot9strap + Luma3DS 13.4** instalados; MSET9 usado y retirado.
- GodMode9 2.2.3; finalizing setup completado.
- Respaldos de `Nintendo 3DS` y tres archivos de `gm9/backups` realizados y almacenados fuera del repositorio. **No subirlos aquí**; el respaldo NAND fue posterior a CFW, no una imagen de fábrica previa.
- Luma: **Enable loading external FIRMs and modules** y **Enable game patching** activados para preparar Nimbus/Pretendo.
- Durante una salida, se observó ~10 % de batería; fue una condición temporal. **No asumir ausencia permanente de PC, cargador o Wi-Fi.**

## Confirmado como instalado o probado

| Herramienta | Estado verificable |
|---|---|
| FBI, Universal-Updater 3.4.1, Homebrew Launcher | Instalados; Homebrew Launcher recibió descarga de actualización del `boot.3dsx` |
| Checkpoint | Abre y reconoce Pokémon X; no repetir prueba sin motivo |
| **PKSM** | La descarga de assets se completó con Wi-Fi el 11-nov; **abre y reconoce Pokémon X**, sin nueva partida/guardado todavía |
| **Nimbus** | CIA instalado, START ejecutó reinicio solicitado, muestra **Nintendo** y **Pretendo**; seleccionar Nintendo devuelve al HOME. **No se ha probado acceso efectivo a Pretendo** |
| **WifiManager** | CIA instalado, aparece en HOME; **sin manipular perfiles de red** |
| TWiLight Menu++ | Instalado, abre y muestra interfaz tipo DSi; región/idiomas configurados |
| TWLSaveTool, NDSForwarder | Descargados/instalados como herramientas; **uso con cartuchos no probado** |
| Anemone3DS | **Ya instalada**; se puede diseñar tema/splash posteriormente |
| 3DS-FileBrowser, 3DShell, ftpd 3.2.1 | Instalados |
| 3DSLink, LocalSend3DS | Instalados; transferencias entre Android y 2DS por probar |
| 3DS Soundboard, Ollama3DS, NetPass | Instalados; Ollama3DS reservado para Project Identity / TB |
| 3DSident | Funcionó; registró espacio/batería |
| Comet | Abre; no se ha probado todavía con una captura real de Rosalina |
| Cloudpoint | Instalado; sincronización no configurada |

## Pendientes y reservas, sin reinstalar lo ya instalado

| Elemento | Próximo paso / condición |
|---|---|
| **ChirunoMod + ChLoad / ChLoad_HIMEM**, Chokistream en PC | Investigación e instalación para captura inalámbrica 3DS; **rendimiento y compatibilidad con `.3gx` no probados** |
| **PokéLink bridge** | Desarrollo experimental, **X primero → Platino/SoulSilver/Negro/Negro 2** |
| Pretendo | Nimbus presenta menú; **cuenta, parches efectivos y conectividad no confirmados**. Mantener Nintendo como selección actual hasta decisión distinta |
| WifiManager | Pruebas posteriores de respaldar/intercambiar perfiles; nunca sobrescribir redes sin copia |
| Shizuku Android → perfiles WifiManager | Experimento hipotético **pospuesto**, usuario no desea configurarlo ahora |
| Canary3DS, 3DSDL, SCR2JPG | Reserva; no prioridad de Pokémon Journeys |
| open_agb_firm | **No prioritario**: juegos anteriores en PC por compatibilidad mGBA/PokéLink |
| Anemone tema / splash | Futura fase creativa para **interfaz de la consola**, no rediseño de overlays |
| Tráiler + «¿Quién es ese Pokémon?» | Pendientes de la serie; el segundo requiere integración OBS/Discord |

## Juegos y fuente de datos

- **Pokémon X**: digital redescargado, abre; todavía no existe un nuevo save. PKSM lo detecta.
- **Demo ORAS**: presente.
- **Rubí Omega**: cartucho original perdido. No hay partida antigua recuperable con el material actual; búsqueda histórica **cerrada a solicitud del usuario**.
- **Platino, SoulSilver, Negro y Negro 2**: potencial préstamo de cartuchos alrededor del 22-nov, **no confirmado**.
- **Sol/Luna y Ultra**: no disponibles actualmente; etapa posterior; progreso visual por cristales Z.

## Reglas de trabajo

1. No tratar las instalaciones completas como pendientes.
2. No confundir limitación temporal de viaje con requisito técnico permanente.
3. No reabrir recuperación de partidas históricas cerrada.
4. Distinguir soporte de juego en hardware real de la simple compatibilidad de emuladores con PokéLink.
5. No hacer pruebas de RAM, partidas o parcheo durante directos sin una fase controlada y respaldo.
6. Todo lo mencionado es **documentación de continuidad**, no prueba de una nueva instalación ni de una transmisión estable.

**Origen:** decisiones y comprobaciones verbalizadas por el usuario en conversaciones de Project Relight / Dex Design y Nintendo 2DS, hasta 11-nov-2026.

## Novedad comunicada sobre la segunda DS — 11-nov-2026 (sin inspección)

El usuario recibió información **indirecta** de que una segunda consola Nintendo DS de **modelo todavía desconocido** tendría cargadas las nueve entregas principales de esa era: **Diamante, Perla, Platino, HeartGold, SoulSilver, Negro, Blanco, Negro 2 y Blanco 2**. Esto amplía la disponibilidad **reportada**, no demuestra aún existencia de archivos accesibles, cartuchos, funcionamiento, procedencia autorizada ni guardados. La foto previa solo mostraba una entrada identificable como *Pokémon White Version*.

**Decisión vigente:** esperar a la **evaluación física de la consola** para determinar hardware, medios de almacenamiento/launcher, juegos que abren y presencia de saves antes de decidir transferencia. No asumir que las nueve versiones son utilizables ni volver a reducir el informe de disponibilidad reportada a cuatro juegos; el prototipo de telemetría continúa con **Pokémon X primero** y, después, con los cuatro DS prioritarios del plan original.
