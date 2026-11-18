# Project Relight — Stage 40 (etapa actual) · respaldo histórico Stage 39 / CP07
## Respaldo integral: Home, Rebel Mix y Terminal (18-nov-2026)

**Tipo:** checkpoint de continuidad y copia restaurable de código, preparado dentro de **Stage 40**, que es la conversación/etapa vigente por confirmación expresa del usuario. **Todos los Stages 1–39 están agotados por capacidad de conversación**, sin que ello indique cierre por cumplimiento, cancelación o conclusión de Project Relight. Este CP07 respalda el trabajo acumulado hasta Stage 39 y conserva íntegramente sus decisiones. No es un rediseño ni una nueva implementación visual.  
**Fecha / zona:** 2026-11-18 · America/Mexico_City.  
**Repositorio:** [BlazeLeiton/KGBlaze](https://github.com/BlazeLeiton/KGBlaze).  
**Commit aprobado y restaurable:** `86522a919ac45fa8bba52abac77a5d050e22e6d0` (PR #176, ya fusionada).  
**Rama de respaldo reservada:** `backup/relight-st39-cp07-mobile-desktop-approved-20261118`, creada **directamente desde ese commit**. No desarrollar sobre ella ni fusionarla hacia main.  
**Rama de documentación CP07 original:** `relight/st39-cp07-checkpoint-20261118`. El respaldo se documentó en la etapa actual **Stage 40**, aunque mantiene el nombre histórico Stage 39 / CP07 para enlazar con las decisiones previas. El documento es posterior a la captura del respaldo y **no modifica sus archivos visuales**.


> **Regla de continuidad automática (corrección expresa del usuario, 18-nov-2026):** Cuando el usuario indique que un Stage se ha **agotado por capacidad de conversación**, se asignará **automáticamente el siguiente Stage consecutivo**, sin pedir una segunda autorización ni mantener la numeración anterior. El agotamiento cierra la capacidad de ese hilo, **no concluye las tareas ni Project Relight**: se conservan checkpoints, decisiones, pendientes y trazabilidad. Si se agotan varios Stages, la siguiente conversación toma el primer número libre. Actualmente **todos los Stages 1–39 están agotados y esta conversación es Stage 40**. Cuando se indique que Stage 40 también se agotó, la continuidad será **Stage 41 automáticamente**, y así sucesivamente. La antigua indicación de CP03 «No crear automáticamente Stage 40» queda **revocada**, no sólo superada en este caso. Las numeraciones ReSpark, Reburst y checkpoints no sustituyen las de Stages.

### 1. Estado editorial y aprobación del usuario

El usuario confirma que las tres superficies ya funcionan correctamente en móvil después de los ajustes de PR #175, y solicita el punto de guardado después de la homologación de los rótulos del hero de PR #176. En escritorio, los tres encabezados y barras sociales se habían aprobado expresamente en PR #172; los audífonos de Rebel Mix en Home también quedaron aprobados **de manera definitiva**. Conservar esas decisiones. El contenido editorial del Home aún puede ser parcialmente provisional; eso **no** significa que el sitio no esté en producción.

Tres superficies oficiales del mismo sitio:
- Home: https://kgblaze.dpdns.org/ — contenido y hero propios, reproductores YouTube/Twitch, acceso a salidas y Rebel Mix.
- Rebel Mix: https://kgblaze.dpdns.org/music/songs/ — catálogo real Scripta Lyrica, filtros y páginas de canciones/versiones, sin reescribirlo.
- Terminal: https://kgblaze.dpdns.org/departures/ — visor de salidas, cuadrícula/cuadro original exportable y lógica operativa conservada.

**Precedencia:** la aprobación visual del usuario, respaldada por el código y las capturas, tiene prioridad frente a una sugerencia genérica de simplificar CSS o imponer la misma geometría al contenido interno.

### 2. Chrome V1, contrato común de escritorio (NO reemplazar)

Heredado de [Stage 39 CP03](RELIGHT_ST39_CHROME_BASELINE_CP03_2026-11-18.md) y `src/site-chrome-contract.mjs`:
- Escritorio desde 761 px CSS. Cabecera 58 px de alto, padding horizontal 24 px, agrupaciones 15 px.
- Marca KGBlaze Garnett 24 px / peso 750 / tracking -0.045 em.
- Navegación Garnett 12 px / peso 700 / gap `clamp(11px,1.5vw,21px)`; triángulos `▾` Música y Comunidad.
- Botón Salidas 96 × 35 px, avión 21 px, radio 7 px. Zona de idiomas 76 px total; ES / EN / JP, posición 20 px, tipografía 11 px peso 750; idioma activo blanco subrayado magenta `#FA0073`, otros azul claro `#A5EBFF`.
- Barra social izquierda fija: ancho 50 px, empieza bajo cabecera a y=58 px, padding `34px 2px 16px`, gap 14 px; hitboxes 44 × 30 px e iconos 28 px.
- Orden/iconos originales: YouTube, Twitch, Instagram, X, Discord (PNG originales; no sustituir por glifos ni recreaciones).
- **Excepciones:** los tres contenedores centrales, sus alturas y su scroll **no** se igualan. Terminal de escritorio ajusta el tablero a viewport, mientras Home y Rebel Mix permiten scroll vertical.

Fuente del contrato: `KGBlaze-Information-Center/src/site-chrome-contract.mjs`. Copia histórica de escritorio: `backup/relight-chrome-v1-approved-20261118` en commit `56b07befd09e2cbcc91ef3ec82e80b520c8b4357`.

### 3. Base móvil incorporada tras las grabaciones

- En móvil la cabecera exterior utiliza 56 px de alto y marca KGBlaze de 23 px. Los cinco iconos oficiales van en **barra horizontal inferior fija de 60 px**, con tratamiento de safe area y contenido/pie de página que permanece legible sin quedar tapado.
- Home: eliminado el desbordamiento horizontal mediante columnas `minmax(0,1fr)`, mínimos flex y dimensiones responsivas; los accesos principales se mantienen; se preservan sus colores, hero y paneles.
- Twitch: reproductor oficial de `blazeleiton` integrado **dentro** de su propia tarjeta tanto en escritorio como en móvil, con `parent=location.hostname` y `autoplay=false`. En teléfonos estrechos el iframe tiene área CSS interna de **400 × 300 px** y se escala visualmente para encajar en su tarjeta, evitando scroll lateral. **No** usar modal ni convertirlo de nuevo a apertura bajo demanda o a un placeholder por debajo de 480 px sin autorización. El enlace «Ver en Twitch» permanece.
- Menú lateral móvil aprobado, usando Home como patrón: botón **«← Volver»** (localizado), tres enlaces **Sobre Blaze, Música, Comunidad**, y botón principal azul **Salidas**; mismo ancho y disposición. Aplicado a Rebel Mix y Terminal en PR #175.
- Terminal dispone de controlador **de respaldo** del menú móvil, independiente del inicializador complementario, que sólo se enlaza cuando el menú aún no estaba enlazado. Se evita duplicar escuchas/eventos.
- Idioma compartido: ES/EN/JA persistidos con `kgblaze.locale.v1` y cookie `kgblaze_lang`. Home, Rebel Mix y Terminal se sincronizan. Terminal debe seguir llamando a su **`setLang()->render()` original**: cambia el cuadro/tablero exportable 1080×1080, además de las etiquetas externas.

### 4. Homologación de los rótulos de presentación (PR #176)

Referencia aprobada: **«KGBlaze · Scripta Lyrica»** en Rebel Mix.

Los rótulos de Home **«BLAZE LEITON — VTUBER · VSINGER»** y Terminal **«KGBlaze · Centro de información»** se homologaron **sólo tipográficamente** al de Rebel Mix:
- Garnett, 11 px, peso 400, mayúsculas, color `#A5EBFF`.
- Tracking de escritorio 0.12 em; tracking móvil 0.09 em.
- No igualar la posición ni el tamaño del título principal de cada hero. Mantener traducciones/variantes originales y saltos propios.

La prueba `tests/st39-hero-eyebrow-parity.test.mjs` protege estas reglas. **415/415 pruebas** de continuidad aprobaron antes del merge; la corrida posterior a PR #176 [44353640428](https://github.com/BlazeLeiton/KGBlaze/actions/runs/44353640428) también terminó en **SUCCESS**.

### 5. Secuencia comprobable de cambios y verificaciones

| PR | Commit de merge | Alcance |
|---|---|---|
| [#170](https://github.com/BlazeLeiton/KGBlaze/pull/170) | `e9f0f54427e23f8b8b9fcfe482c7c81d8175a41a` | Home, marco exterior, audífonos y hero con reproductores grandes |
| [#171](https://github.com/BlazeLeiton/KGBlaze/pull/171) | `b51fddf67f7d09506078dc79060fac52b288bac3` | Idiomas compartidos, chrome, Twitch incrustado |
| [#172](https://github.com/BlazeLeiton/KGBlaze/pull/172) | `56b07befd09e2cbcc91ef3ec82e80b520c8b4357` | Marco de escritorio y audífonos definitivos |
| [#173](https://github.com/BlazeLeiton/KGBlaze/pull/173) | `ca0f96e2e50130f208b78e925a4c5c15e0c57195` | CP03, contrato Chrome V1 y respaldo histórico |
| [#174](https://github.com/BlazeLeiton/KGBlaze/pull/174) | `f42f06c3af28b5999fed10a5c330ca4442ae9363` | Desbordamiento, pie/barra inferior y Twitch móvil |
| [#175](https://github.com/BlazeLeiton/KGBlaze/pull/175) | `be2d4331074f8ac428f68c47f825a603a1ce6826` | Menús móviles equivalentes, Terminal funcional, Twitch escalado |
| [#176](https://github.com/BlazeLeiton/KGBlaze/pull/176) | `86522a919ac45fa8bba52abac77a5d050e22e6d0` | Rótulos Home/Terminal como Scripta Lyrica |

CI verificable: [continuidad PR #176 postmerge](https://github.com/BlazeLeiton/KGBlaze/actions/runs/44353640428) **SUCCESS**; [auditoría musical tras #175](https://github.com/BlazeLeiton/KGBlaze/actions/runs/44350005080) **SUCCESS**. Un merge de GitHub no certifica por sí mismo propagación de Cloudflare; el usuario verificó visualmente la operación móvil antes del último retoque tipográfico.

### 6. Inventario de integridad en la captura CP07

SHA de blob Git de archivos importantes en el commit aprobado. **No son SHA de commit**:

| Archivo relativo a `KGBlaze-Information-Center/` | Blob SHA |
|---|---|
| `public/home.html` | `d5b16f43bab9f472402e81d945b1a338f119053b` |
| `src/music-page.mjs` | `78ce27ed3ef69b39362a319f4110f31d73bd4030` |
| `src/music-navigation.mjs` | `c4abea4bba55ce533be7e92fbdf0f6a21b89d9a5` |
| `src/viewer-portal-chrome.mjs` | `850b80e85ea4655f4e29bd758f0dc0e67cf808fd` |
| `src/viewer-portal-ssr.mjs` | `80342cbdff2b1ca565de62f15736a7a278173686` |
| `src/worker.mjs` | `3c67adbbb598c2a41f8c69837cee961edffea7f9` |
| `public/index.html` (visor nativo) | `d936c47763ac063597f29bec2532e6c725a65dd5` |
| `public/assets/icons/kgblaze-headphones-white.svg` | `d58d23681dc675e3a3679ad065b95bf847d7bf65` |
| `src/site-chrome-contract.mjs` | `c4bec09505276ab33b0bbba6cc11d197da280229` |

Los audífonos ya están **aprobados**. No volver a generar el SVG. El archivo original de Terminal `public/index.html` permanece sin modificación en esta serie de retoques de chrome.

### 7. Restricciones de continuidad y restauración

1. **Regla de producción:** restaurar el estado completo de CP07 mediante el commit `86522a919ac45fa8bba52abac77a5d050e22e6d0` o la rama `backup/relight-st39-cp07-mobile-desktop-approved-20261118`. La rama de respaldo no se usa como rama de desarrollo.
2. **Pruebas obligatorias antes de nuevas homologaciones:** `tests/st39-chrome-baseline.test.mjs`, `tests/st39-home-mobile-video-regression.test.mjs`, `tests/st39-mobile-drawer-parity.test.mjs`, `tests/viewer-portal-ssr-browser.test.mjs`, `tests/st39-hero-eyebrow-parity.test.mjs`, suite de continuidad y auditoría musical cuando Rebel Mix cambie.
3. Mantener integración YouTube/Twitch, tamaño/escalado móvil, SVG exacto aprobado, barra inferior, pie y ausencia de scroll lateral. Conservar el borde magenta propio **de Home**, sin trasladarlo por error a Rebel Mix.
4. Mantener Rebel Mix (catálogo real Scripta Lyrica, filtros/letras/portadas/versiones) y Terminal (visor cuadrado, exportable, `?embed=1`, JSON/ICS, cron, D1, editor V25). No introducir segundo controlador de idiomas ni alterar el canvas.
5. El antiguo [PR #164](https://github.com/BlazeLeiton/KGBlaze/pull/164) con la rama V7 equivocada permanece **draft y sin fusionar** conforme a decisiones anteriores. No confundirlo con la implementación V6 legítima.
6. Para sitios futuros, usar **Chrome V1** como base de encabezado/barra y el **menú móvil Home** como patrón. Adaptar sólo el interior según necesidades. Las diferencias técnicas entre renderizadores son intencionales.
7. **Numeración automática obligatoria al agotarse un Stage.** Stage 40 es la conversación actual porque los Stages 1–39 se agotaron por capacidad. **Si el usuario avisa que Stage 40 está agotado, asignar inmediatamente Stage 41**, sin solicitar confirmación adicional. Repetir la regla para los agotamientos sucesivos y llevar todas las decisiones y pendientes al nuevo Stage. No confundir agotamiento del hilo con finalización del proyecto. ReSpark, Reburst y checkpoints mantienen numeraciones independientes.

### 8. Alcance del checkpoint

Este CP07 registra un **punto de guardado global del estado de los tres sitios**, posterior a la última homologación tipográfica. El documento fue elaborado **durante Stage 40** y conserva el identificador histórico Stage 39 / CP07 únicamente por trazabilidad del trabajo respaldado. No requiere ni autoriza nuevas modificaciones visuales. Su registro en `main` no mueve el puntero de la rama de respaldo; cualquier continuidad de **Stage 40** parte del commit respaldado y de estas decisiones. **Todo Stage anterior, del 1 al 39, está agotado por capacidad, no concluido como proyecto.**
