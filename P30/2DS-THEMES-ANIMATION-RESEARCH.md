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


## Referencias visuales originales para el tema — 11-nov-2026

El usuario proporcionó tres imágenes propias como **referencias de diseño**, no para publicación en GitHub:
- `Lumiose_City_Evolutions.png`: panorámica nocturna de Ciudad Luminalia/Torre Prisma iluminada.
- `Lumiose_City_PG.png`: vista más tranquila de la Torre Prisma bajo luna y cielo azul; deja espacio negativo para interfaz sutil.
- `BLAZE_4.png`: firma personal sobre degradado azul/lila/púrpura. **Es la referencia preferida para splash**, no sustituir por logo nuevo.
- Existe además un **GIF original del trazo de la firma** en poder del usuario, no adjunto aquí. No asumir accesible, ni descargar/publicar.

Referencias externas identificadas (enlazar; no copiar imágenes de terceros a este repositorio):
- Pokédex de Kalos, *Pokémon XY*, anime (Ash recibe la Pokédex del profesor Ciprés): <https://archives.bulbagarden.net/wiki/File:Ash_Kalos_Pok%C3%A9dex.png>. Distinción visual: carcasa roja con elementos circulares y franja central.
- Pokédex de Hoenn generación VI, *Omega Ruby / Alpha Sapphire*: <https://archives.bulbagarden.net/wiki/File:ORAS_Pok%C3%A9dex.png>. Carcasa naranja/negra, pantalla central y pequeños controles/indicadores.
- **PokéNav Plus** de ORAS (es un dispositivo distinto a la Pokédex; útil por interfaces tecnológicas): <https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9Nav_Plus>.
- **Holomisor / Holo Caster** del anime Kalos, referencia holográfica: <https://bulbapedia.bulbagarden.net/wiki/Holo_Caster>.
- **Operation Siren, Azur Lane**: mapa estratégico del Atlántico, contornos marítimos azulados, cuadrícula y nodos de navegación, como referencia para HUD discreto: <https://azurlaneecgc.com/farming>.

### Orientación artística sin diseño final aprobado

La preferencia del usuario es **enfoque Pokémon** con Luminalia como paisaje prioritario, mezclando con moderación Pokédex Kalos/ORAS y grillas/rutas tácticas de Operation Siren; la alternativa de mapa enteramente táctico se mantiene. Evitar recrear otra Terminal KGBlaze o cubrir el arte original con múltiples ventanas o paneles de información falsa.

### Limitación crucial de formatos HOME

El modo de pantalla superior con **imagen panorámica desplazable** (`draw type=3`, `frame type=0/3`) y el modo con **textura A8 de pequeños patrones móviles sobre color sólido** (`draw type=2`) son variantes distintas del tema base; **no prometer ambas capas simultáneas de forma nativa**. El *flipbook* de tres cuadros en la pantalla inferior depende del desplazamiento/puntero; no es reproducción autónoma continua.

Fuente: <https://3dbrew.org/wiki/Home_Menu/Themes>.

### Decisión sobre splash de la firma

**Luma 13.4 y Anemone3DS estándar muestran imágenes estáticas de arranque**, NO GIF, ni una animación de pocos fotogramas. BAX fue descartado para esta etapa por complejidad de arranque. Por tanto, mientras se mantenga la condición de no usar otro boot loader, un splash auténticamente animado NO es compatible: propuesta segura es **firma BLAZE estática, quizá tomada del último cuadro del GIF**, y duración breve (1 s) en Luma. No presentar desenfoque, brillo o estela dibujada como si fuera animación temporal real.

Referencias: <https://wiki.hacks.guide/wiki/3DS:Splash_screens>, <https://github.com/astronautlevel2/Anemone3DS/wiki/Usage>.

**No se ha renderizado ni instalado ningún tema o splash nuevo.**


## Comparativa de variantes HOME — aprobación conceptual para explorar (11-nov-2026)

**Usuario pide explorar ambas, NO escoger una final ni exportar todavía.** Mantener paisaje de Luminalia en pantalla superior, Pokédex/Holomisor/Hoenn Gen VI anime en inferior, y colores documentados de Aeroméxico/United. La ilustración original aportada por el usuario es la base para Canva; los previews de IA son solo bocetos, **no fuentes maestras**. El splash de la firma BLAZE queda EN PAUSA.

### Variante A — superior fija (composición cinematográfica)
- Imagen de Luminalia con Torre Prisma centrada, marco holográfico, radar y trazos alineados al lienzo estático.
- Tema superior tipo textura fija `FrameType 1`, textura de referencia `412×240` (área física visible ~400×240); superposición gráfica **aplanada** al `body_LZ.bin`.
- Alternativa de movimiento: animación real del **cursor y elementos propios de HOME** adaptados por personalización de colores/texturas; opcionalmente inferior `flipbook` de tres cuadros dependiente de la navegación. **No prometer que un patrón animado A8 se superpone a un PNG superior fijo**: otro modo de dibujo.

### Variante B — superior panorámica (exploración)
- Imagen superior `1008×240`, textura desplazable, preferentemente modo **scroll lento**.
- Mantener Torre Prisma cerca del centro del panorama y extender el resto de ciudad a ambos lados. Se deberá probar dónde queda el encuadre al iniciar y durante navegación; no asumir centrado automático.
- El marco con esquinas y radar de la composición original **se desplazaría con el fondo**; para conservar continuidad, sustituir por líneas finas longitudinales, microindicadores dispersos o módulos que no dependan de quedarse fijos.
- No crear dos capas nativas independientes (panorama móvil + HUD fijo) porque el tema HOME estándar no las admite.

### Inferior — tema adaptable a cuadrícula y reescalado
- El usuario utiliza **principalmente cuadrícula 5×3**, pero cambia tamaño/distribución a veces; hay muchas apps homebrew instaladas.
- **NO dibujar 15 casillas falsas**, flechas falsas, barra de iconos ficticia ni paneles laterales anchos: no siguen el zoom o paginación reales.
- Decoración tecnológica gen VI **solo en fondo y márgenes**: bordes sutiles, pequeños círculos, curvas y degradado oscuro; la zona central debe tolerar 5×3 y cambios de tamaño.
- Personalizar **marcos reales de iconos** (texturas para 48×48 y 24×24), cursor real, carpetas, botones y colores, que sí son elementos de HOME (detalles: <https://3dbrew.org/wiki/Home_Menu/Themes>).
- Ensayar en el dispositivo varias escalas, varias páginas y una carpeta abierta antes de cerrar posiciones decorativas.
- Estrategia inferior preferente: imagen fija `320×240` compartida por ambos conceptos; modo flipbook ligado a navegación solo como prueba opcional y sin comprometer legibilidad.

### Flujo de reconstrucción no generativa

1. En Canva, colocar **archivo original** de Luminalia y realizar recorte fijo o panorama extendido real; sin regeneración de ciudad por IA.
2. Montar sobre la imagen un **overlay PNG transparente** dibujado/reconstruido de forma separada, conservando brillo y gama cromática. Diseño por capas en edición, **imagen final aplanada** al exportar al formato Anemone.
3. Crear la composición inferior limpia, **sin representar iconos ni controles falsos**; dejar que HOME dibuje lo real.
4. Empaquetar dos temas instalables `Luminalia Fija` / `Luminalia Panorámica`, no ejecutar aún.
5. Verificar fondo con cuadrícula 5×3, iconos grandes/pequeños, scroll por páginas y carpetas. Registrar pruebas y decidir.
6. Splash de BLAZE: trabajo separado, sin BAX por ahora.

**Estado:** dos direcciones aprobadas para exploración; faltan análisis de imágenes originales y edición de elementos en Canva. No se ha probado ningún tema compilado en consola ni se ha aprobado composición final.


## Maqueta interactiva de comparación — 11-nov-2026

Se creó una prueba **HTML autocontenida** entregada en esta conversación con el nombre **P30_Luminalia_pruebas.html**. No se subió a GitHub porque contiene imágenes originales reducidas del usuario. No es aún un tema instalable ni una prueba física en la 2DS.

- Arriba **A fija**: recorte de Lumiose_City_Evolutions.png y marco vectorial de cian/violeta; encuadre original sin IA generativa.
- Arriba **B panorámica**: recorte extendido de la misma imagen y deslizador que simula la ventana visible del HOME al recorrer 1008 × 240 con ventana de 400 × 240. La decoración viaja junto con el panorama.
- Abajo: base de 320 × 240 compartida con tratamientos **Kalos, Hoenn y Holomisor**. El fondo NO contiene casillas para iconos.
- Controles de simulación: **5×3, 4×2 y 3×2**, y ocultar/mostrar iconos de muestra, que NO forman parte de la textura final.
- Gama: Azul Premium #020C41, celeste United #A5EBFF y púrpura #695FE6.
- Verificación funcional en Chromium con Playwright: se muestran 15 iconos en 5×3, 6 en 3×2, el desplazamiento panorámico llega al valor solicitado y se registraron **cero errores JavaScript**. Esta validación acredita la maqueta HTML, **no** el tema real ni el comportamiento del firmware HOME.
- Las dos variantes utilizan el mismo fondo inferior para aislar la evaluación del efecto superior. Splash sigue **EN PAUSA**.

**Siguiente paso:** evaluar qué combinación favorece la legibilidad en cada escala y producir recursos Canva manuales y archivos Anemone para pruebas físicas separadas. No incluir las imágenes originales en el repositorio público.


## Refinamiento de identidad Kalos/Hoenn y referencia Squishy (11-nov-2026)

**Decisión confirmada por el usuario:** pantalla superior **Luminalia FIJA**. En la inferior, probar dos alternativas realmente distintas y compatibles tanto con la cuadrícula 5×3 como con otros tamaños; sin casillas decorativas rígidas. Splash sigue pospuesto.

### Hoenn — referencia anime XY&Z (escaneo de Squishy); corrección de atribuciones
- **Corrección explícita del usuario (11-nov-2026):** la imagen de escaneo que el asistente mostró como ejemplo de Hoenn correspondía en realidad a la **Pokédex de Unova de Ash** al consultar Pokémon de **Alexa/Alexia**. **NO usar esa imagen ni sus rasgos específicos como prueba de la Pokédex Hoenn.** La atribución previa fue incorrecta.
- Las escenas narrativas son **distintas**: durante el arco de Unova/BW, Ash no consigue identificar Helioptile/Gogoat de Alexa con su Pokédex de Unova (https://bulbapedia.bulbagarden.net/wiki/Alexa_%28anime%29). En **XY094 «From A to Z!»** Ash y Serena examinan a Squishy y sus respectivas Pokédex indican que no existen datos (https://bulbapedia.bulbagarden.net/wiki/XY094). **Estas fuentes confirman situaciones narrativas, pero no identifican por sí solas los diseños del fotograma.**
- El usuario especificó que la referencia Hoenn correcta es **la Pokédex de Gen VI del anime XY&Z que aparece en ese episodio**, con el gran signo de interrogación. Se debe obtener/confirmar un fotograma auténtico antes de afirmar atributos visuales particulares de esa pantalla.
- El **trabajo visual previo del usuario** (29-sep-2026; ilustraciones de consola naranja con paneles azul-violeta y «?») conserva su utilidad como proyecto creativo anterior, **NO como captura verificada del anime**.
- Preferencia artística anterior que permanece: **Hoenn más cuadriculada, clara, colorida y tendiente al violeta; Kalos celeste/holográfica**. Adaptación propuesta al HOME **todavía no aprobada**: evocar módulos cuadrados con transparencia y borde de dispositivo, sin cubrir el área de aplicaciones 5×3 y sin usar un signo «?» gigante permanente.
  
### Kalos — ciudad visible tras cristal
- Pantalla superior fija: imagen aportada **Lumiose_City_Evolutions.png**, Torre Prisma protagonista, marco holográfico.
- Pantalla inferior: **fragmento complementario de ciudad nocturna**, preferentemente de la misma imagen original pero **sin Torre Prisma**, o una calle iluminada estilo Luminalia/París; dejar que la escena se vea a través de un tratamiento celeste transparente y líneas holográficas finas inspiradas en Pokédex de Kalos/Holocaster.
- «Transparencia» aquí significa un **composite gráfico en Canva** (paisaje + elementos PNG semitransparentes). El tema de HOME solo muestra el fondo aplanado, no una superposición de capas independientes sobre el sistema.
- **Kalos es continuo, claro, ligero y semitranslúcido**, no otro panel físico.

### Prueba de uso real — inferior de 320×240
- Diseñar sobre margen interno de seguridad con centro libre; probar **5×3** (principal) y otros tamaños, con cursor/íconos reales conceptualmente encima, no dibujados en el fondo final.
- Mantener variantes diferenciadas en estructura, no solo color: **Kalos paisaje + cristal**, **Hoenn escáner modular + bezel**.
- Revisión en la maqueta HTML antes de crear assets definitivos para Anemone.
- No subir imágenes originales, capturas de anime ni las imágenes generadas anteriores al repositorio público.


## Prioridad cromática inferior — decisión 11-nov-2026

**Decisión expresa del usuario:** **priorizar en la pantalla inferior los colores y la lógica gráfica de las Pokédex de Gen VI tal como se trabajaron a partir del anime, por ENCIMA de la paleta corporativa estática KGBlaze/United/Aeroméxico**. Esta última **ya está suficientemente representada en la pantalla superior fija** de Luminalia (marco holográfico y acentos). No imponerla de nuevo ni recolorear las referencias Pokémon arbitrariamente.

- **Kalos:** claro, celeste/azul hielo y blanco luminoso; cristal y transparencias gráficas sobre un segmento de Luminalia sin Torre Prisma o calle nocturna iluminada; preservar autenticidad visual frente a la referencia.
- **Hoenn Gen VI anime:** más modulada en cuadros, violeta y azules claros, bloques multicolor e interfaz de escáner/pantalla contenida. La imagen de la Pokédex **Unova** usada erróneamente antes para ilustrar a Hoenn **NO es referencia válida**; verificar la escena de Squishy.
- **Holomisor (tercera opción):** tecnología proyectada, cian/azules holográficos, sin carcasa opaca. Es alternativa con lenguaje visual propio, no una mera recoloración de Kalos.
- **Tema superior:** mantener Luminalia **fija**, ya preferida, con el marco que incorpora colores de identidad general. Es la conexión suficiente con la marca.
- **Zona central inferior:** permitir 5×3 y zoom a otros tamaños sin casillas dibujadas ni interferencia con iconos reales.
- **Splash:** pospuesto.

**Pendiente:** refinar comparativa visual de variantes inferiores según estas reglas ANTES de preparar PNG finales o empaquetar el tema.
