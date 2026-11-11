# P30 — Nintendo 2DS: referencias cromáticas, temas y animaciones

**Revisión:** 2026-11-11 · **Estado:** INVESTIGACIÓN / REFERENCIA, no diseño aprobado ni instalación nueva.

## Paletas documentales recuperadas

Referencias revisadas en documentación anterior de Project Identity/Relight:
- `GUIA_VISUAL_GALACTIC_CONSOLE_R2_2026-10-16.md`
- Aeroméxico, *Brand Book* 2024 (págs. 94, 96, 98 según la ficha histórica)
- United, *Building the United Brand Quick Guide* (2022), pág. 6 según la ficha histórica

**Aeroméxico**
- **Azul Premium `#020C41`**, fondo oscuro preferente sobre Azul AM.
- **Azul AM `#0B1761`**, diferente de Premium, asociado al color de logotipo.
- Azul Contemporáneo `#0000E3`, Rosa Mexicano `#FA0073`.
- Blanco Cálido `#F2F2F0`; Gris Premium `#493D3A`; Gris Cálido `#8D807A`; Gris Suave `#DCCCC9`.

**United**
- Azul primario `#1414D2` **documentado, pero NO dominante** en KGBlaze.
- Azules complementarios: Dark Blue `#051464`, Medium Blue `#276EF1`, **Light Blue `#A5EBFF`**. Nota de exactitud: antes se escribió `#A5BEFF` en algunos resúmenes, pero el valor documentado es `#A5EBFF`.
- Púrpuras: `#551E5F`, `#695FE6`, `#D7D2FF`.
- Rojos: `#FF4B4B`, `#FFBEB9`, `#FFE6DC`.
- Borgoñas: `#7D283C`, `#D7AAAA`, `#FADCE1`.
- Amarillo/oliva: `#696E28` (oliva), `#FFDC8C`, `#FFF0D7`.
- Verdes: `#2D4637`, `#5AD28C`, `#DCFAE6`.

**Reglas:** tomar inspiración cromática para interfaz propia, **sin logos comerciales ni apariencia de afiliación**. Aún NO existe propuesta gráfica aprobada; el primer concepto aeroportuario generado en conversación fue rechazado. No reproducirlo.

## Capacidades de tema HOME: limitaciones confirmadas

- **Anemone3DS ya instalado**; es gestor de temas/splashes, no motor Live2D.
- Temas `body_LZ.bin` pueden alterar fondos, marcos de iconos, carpetas, colores, SFX y `bgm.bcstm`.
- Modos de fondo: imagen fija, **panorámica con scroll**, **patrón superior con movimiento** y **tres fotogramas en la pantalla inferior asociados al desplazamiento / flipbook**.
- **No existe soporte estándar para GIF/video como fondo HOME continuo**, ni Live2D interactivo de forma nativa. Modificar HOME o construir un launcher aparte sería otro proyecto de mucha complejidad y no está aprobado.
- Referencias técnicas: <https://3dbrew.org/wiki/Home_Menu/Themes>, editor <https://github.com/usagirei/3DS-Theme-Editor>, Nintendo <https://www.nintendo.co.jp/hardware/3dsseries/theme/about/index.html>.

## Splashes de Luma3DS y animación de arranque

**Splash normal:** imagen estática visible al iniciar la consola **antes de llegar a HOME**, **no** una transición al abrir/cerrar juegos ni un fondo continuo. Luma3DS admite `/luma/splash.bin` (superior **400 × 240**) y `/luma/splashbottom.bin` (inferior **320 × 240**); se configura Splash Off / Before / After y duración. Anemone puede instalar el paquete desde `/Splashes`. En la 2DS, Luma se configuró con splash **Off**: no está activado. Guías: <https://wiki.hacks.guide/wiki/3DS:Splash_screens>, <https://github.com/astronautlevel2/Anemone3DS/wiki/Usage>.

**Arranque animado real:** [BAX](https://wiki.hacks.guide/wiki/3DS:BAX) es otro programa capaz de reproducir animación antes de iniciar Luma3DS y HOME, compatible con la familia 3DS, pero **no es una función de Anemone**. Su instalación normal con boot9strap modifica la cadena de arranque / `boot.firm`, puede complicar actualizaciones y añade tiempo de inicio; tiene cautelas con guardados GBA al salir de AGB_FIRM. **No instalar ni cambiar boot.firm** sin analizar procedimiento, respaldos y riesgos concretos.

## Dirección por definir

A petición del usuario, **NO generar aún diseños** ni repetir el aeropuerto/pantalla de salidas.
1. Elegir entre tema fijo / panorama / patrón móvil / efecto de 3 cuadros para HOME.
2. Evaluar splash estático con Luma y, solo si realmente se desea, BAX animado más adelante.
3. Preparar composición primero en Android y empaquetar/pruebas después en PC/2DS.

**Este archivo es investigación, no implica que se haya instalado, validado o activado un nuevo tema.**
