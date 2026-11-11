# P30 — Consola complementaria, transferencia DS e instrumentación

**Actualizado:** 2026-11-11 · **Estado:** investigación hasta disponer de la consola física.  
**Importante:** No hay todavía prueba de qué juegos/partidas existen en el almacenamiento; no publicar la foto ni datos privados.

## Evidencia de la foto recibida

- Hardware **parece Nintendo DSi XL**, aún sin confirmar mediante placa/modelo.
- El menú inferior señala explícitamente **«Pokémon White Version»**, con varios iconos de Poké Ball.
- Apariencia compatible con interfaz temática **Nintendo DSi de TWiLight Menu++**, pero NO queda demostrado el programa exacto.
- **Conclusión limitada:** existe al menos una entrada visual para Pokémon White y otras entradas; la captura no permite asegurar que sean juegos operativos, qué otras versiones hay, ni si existen guardados `.sav` en la SD.
- Documentación para identificar TWiLight: <https://manual.ds-homebrew.com/es/theme1-dsi>; descripción del menú DSi original: <https://en-americas-support.nintendo.com/app/answers/detail/a_id/4010/>.

**Cuando tengamos físicamente esa consola:** identificar modelo, si hay tarjeta SD principal y/o flashcart Slot-1 con microSD, launcher utilizado, carpetas `.nds` y `.sav`, y registrar nombre+edición+idioma+si abre el juego. Copiar archivos con respaldo, sin tocar ni formatear las unidades originales.

## Tres rutas legítimas según procedencia

1. **Archivos `.nds` con partidas `.sav` en SD o flashcart:** si son copias autorizadas de títulos que se poseen, copiar juegos y guardados conservando nombres/rutas y original. En nuestra 2DS, TWiLight ya instalado los ejecuta mediante `nds-bootstrap` en **modo DS/DSi nativo**, no emulación PC.
2. **Cartuchos DS físicos:** colocar cartucho directamente para ejecutar sin TWiLight; extracción propia autorizada con GodMode9i en DSi/GodMode9 en 3DS. Respaldar partida antes de transferir cualquier cosa.
3. **DSiWare u otro título instalado/bloqueado:** no asumir que copiar carpeta de sistema funciona; inspeccionar formato y permisos concretos.

**Atajos HOME:** NDSForwarder crea accesos para ficheros `.nds`, pero **no elimina la dependencia de nds-bootstrap**; solo evita entrar al menú TWiLight. Referencia: <https://wiki.ds-homebrew.com/es-ES/ds-index/forwarders>.

## Instrumentación para DS: segunda etapa de P30

El usuario ordenó **X primero y, después, los cuatro DS Platino, SoulSilver, Negro, Negro 2**. El soporte de estos cuatro se investiga en paralelo a ORAS/SM/USUM, pero no cambia la prioridad de ejecución.

### Investigación de memoria ya documentada

- Gen IV (fuente técnica secundaria): <https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_data_structure_(Generation_IV)>
  - Platino: puntero candidato `0x02101D2C`, desplazamiento del equipo `0xD094`.
  - HeartGold/SoulSilver: puntero candidato `0x0211186C`, desplazamiento del equipo `0xD088`.
  - Los valores deben validarse por versión/región/idioma y para estructuras de equipo **no bastan por sí solos para HP/estado/medallas**.
- Gen V: <https://github.com/Brian0255/NDS-Ironmon-Tracker> documenta lectura en BizHawk para BW y B2W2, pero sus rutinas de emulador **no se ejecutan directamente en una DS real**. Otra implementación de Black 2/White 2 US usa la battle-struct sin cifrar en BizHawk, pero no es solución nativa de 2DS: <https://github.com/JoshuaMootoo/Pkmn-Nuzlocke-Tracker-Emulator-Tool>.
- Formatos de datos PK4/PK5 son distintos; no copiar offsets ni descifrado de Gen IV a Gen V.

### nds-bootstrap: base posible, no solución lista

Referencia de controles: <https://wiki.ds-homebrew.com/es-ES/nds-bootstrap/controls>.

- En juego, `L + Down + SELECT` abre menú con **RAM Viewer**.
- `L + R + Down + A` (2 s) genera `sd:/_nds/nds-bootstrap/ramDump.bin`, salvo ciertas modalidades limitadas.
- Permite **confirmar lectura puntual RAM**, pero sacar el dump necesita acceder a SD después y **no implica transmisión continua en directo a la PC**.
- Requiere ejecutar título mediante nds-bootstrap (TWiLight o forwarder), **no** cartucho lanzado sin su loader.

### Problema de transmisión continua

La consola en **modo DS/TWL** no conserva sin más los servicios de sockets de plugins 3GX del modo 3DS, y parte del Wi-Fi de juegos DS usa estándares obsoletos. **NO recomendar cambiar el router a WEP ni crear red abierta** para este experimento.

Dos alternativas de I+D:
1. **Inyectar instrumentación mínima en la capa nds-bootstrap** (requiere entender timing/ARM9/ARM7 y espacio libre); emitir eventos sin modificar guardados. La salida por red aún NO demostrada.
2. **Capturar snapshots puntuales** o un archivo de telemetría en SD para comprobar decodificación fuera de juego. Esto no es streaming live, pero permite prototipar lectura sin tocar PokéLink hasta estar validada.

**No confundir capturar video de modo DS con leer datos del equipo.** ChirunoMod cubre captura 3DS, no constituye solución automática para vídeo DS/TWL.

## Riesgos a probar

- Sobrecarga de CPU/RAM/bus de SD o Wi-Fi por el juego y el sistema de captura.
- Juegos ejecutados en flashcart vs SD de DSi vs SD de 2DS tienen loader, memoria y permisos distintos.
- IDs, offsets y estructuras del equipo pueden cambiar por región, idioma, versión o hack.
- El problema de *telemetría en vivo* es distinto de detectar cambios en un dump de RAM.
- Mantener controles **manuales de PokéLink existentes** como alternativa ya preparada; no recrearlos ni hacer del bridge un requisito de estreno.

## Siguiente sesión con la otra consola

Comprobar: ¿es DSi XL, con TWiLight, YSMenu u otro sistema? ¿Los iconos son juegos `.nds` en SD o flashcart? ¿Están Platino, SoulSilver, Negro y Negro 2, además de White mostrado? ¿Hay `.sav`? Con esa evidencia fijar la ruta de transferencia y el primer juego DS real para depurar.

## Información posterior a la fotografía — 11-nov-2026 (REPORTE, no verificación)

El usuario recibió información verbal de que la segunda consola (modelo **todavía desconocido**) contiene prácticamente toda la era Pokémon DS: **Diamond/Pearl/Platinum, HeartGold/SoulSilver, Black/White y Black 2/White 2**. Son nueve juegos **reportados**, no nueve ficheros o cartuchos inspeccionados. Este dato amplía el catálogo a revisar, pero todavía no acredita arranque, partidas, formatos, hardware exacto o posibilidad de copiar legalmente datos.

Al disponer físicamente de ella, identificar primero modelo, menú/launcher y si el contenido reside en SD, microSD de flashcart o cartuchos; después verificar los nueve títulos y buscar archivos de guardado mediante comprobaciones no destructivas. **No efectuar transferencias ni modificaciones antes de la revisión física.** Mantener **X → Platino/SoulSilver/Negro/Negro 2** como orden experimental del bridge; la disponibilidad reportada de Diamante/Perla/HeartGold/Blanco/Blanco 2 no es un cambio automático de prioridades.
