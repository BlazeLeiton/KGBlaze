# Auditoría de continuidad KGRP

La auditoría es **obligatoria si aparece una duda**. Su ausencia de resultado no se disfraza de resultado positivo.

## Pruebas de registro — aplicar cada vez que haya nuevas etapas
- A01: `latest_stage` coincide con el máximo `number` de `stages`.
- A02: serie numérica sin huecos, exactamente Stage 1..N.
- A03: para cada etapa existe `STAGES/STAGE-XX.md` y no se sobreescribe el histórico al agregar una nueva.
- A04: todas las etapas sin `closure_verified: true` se incluyen explícitamente en recuperación de **conversaciones inconclusas**.
- A05: cada etapa tiene fuentes, estado de certeza, decisiones y pendientes.
- A06: referencias a implementación apuntan a rutas verificadas y no tratan un README como prueba de ejecución.
- A07: últimas solicitudes y acciones pendientes se cotejan con el último tramo accesible del chat, no sólo con `CURRENT.md`.
- A08: `DECISIONS.md` registra las correcciones vigentes y las reglas sustituidas con alcance.
- A09: los documentos públicos no contienen secretos, respaldos privados ni transcripciones sin revisar.
- A10: los cambios están **sólo** bajo `Project-Relight-Continuity/`, salvo modificación del índice raíz expresamente solicitada.
- A11: cuando surge Stage N+1, comprobar que se añade **sin perder** Stage 1..N, con registro de inicio, cierre y últimos mensajes.
- A12: cualquier `NO_COMPROBADO` permanece explícito hasta que la prueba se ejecute.

## Matriz de trazabilidad por función
| Campo | Valor |
|---|---|
| ID e historia | |
| Petición original + fuente exacta | |
| Correcciones y alcance | |
| Artefacto implementado + SHA | |
| Prueba planificada | |
| Prueba ejecutada, fecha y resultado | |
| Despliegue/versión de servicio | |
| Riesgo / regresión | |
| Estado: verificado, parcial, no comprobado | |

## Niveles de evidencia
- `CONFIRMADO_USUARIO`: intención/aceptación, no implementación.
- `HISTORICO_RECUPERADO`: memoria/resumen; no sustituye texto original.
- `VERIFICADO_ARCHIVO`: lectura real con ruta/versión.
- `VERIFICADO_CODIGO`: implementación inspeccionada en SHA.
- `VERIFICADO_PRUEBA`: test ejecutado y salida confirmada.
- `VERIFICADO_DESPLIEGUE`: respuesta viva del entorno remoto.
- `DOCUMENTADO`: afirmación del README, debe confrontarse.
- `NO_COMPROBADO`: no existe evidencia suficiente.

## Pruebas específicas recurrentes
- Editor: importación JSON arrastrando, vaciar/restaurar semana, HIATUS independiente, limpieza de campo sin cancelar, idioma, PNG/GIF, estado de evento, preservación de datos.
- Visor: estricta lectura pública, cinco semanas máximo cuando corresponda, sin inventar emisiones, matching fiable YouTube, cambios visuales, enlaces por plataforma.
- Backend: 409 revisión, 423 bloqueo, autenticación, respuesta de los endpoints, falsos positivos y nunca inferir finalización por interrupciones temporales.
- GitHub y despliegue: SHA actual, archivos realmente existentes, pruebas no asumidas, Cron real vs configurado, permiso antes de despliegue.

Las pruebas requieren acceso a sus artefactos. Si faltan, indicar `NO EJECUTADA: falta archivo/credencial/autorización` y conservar el caso.

## Bitácora de auditoría actual
- **A01/A02:** índice previsto 1..3, a comprobar después de crear archivos.
- **A03:** tres archivos de etapa previstos, a comprobar después del commit.
- **A04:** los tres Stage tienen cierre no acreditado y deben inspeccionarse como potencialmente inconclusos.
- **A09/A10:** política de segregación pública fijada; falta confirmar árbol tras el commit.
- **Auditoría de software:** no ejecutada como parte de este protocolo; sólo hay lectura documental y de archivos versionados del Worker.

## Auditoría de instalación — 2026-10-12

- **A01/A02:** PASS — se analizó `STAGES/index.json`: `latest_stage=3` y la secuencia es [1,2,3].
- **A03:** PASS — lectura remota de las tres fichas Stage y del índice en el repositorio.
- **A04:** PASS DE CONFIGURACIÓN — los tres campos `closure_verified=false`; recuperación obligatoria programada en el protocolo. **No** implica que se hayan recuperado los últimos mensajes textuales.
- **A09/A10:** PASS SOBRE EL CAMBIO VERSIONADO — documentos y herramientas colocados exclusivamente bajo `Project-Relight-Continuity/`. Revisión final de cambios del repo pendiente de cotejar contra el SHA previo a KGRP.
- **Prueba local de la herramienta:** PASS (4 escenarios): lectura índice 1..3, alta temporal Stage 4, rechazo de origen vacío y error ante ficha faltante. **Stage 4 no fue añadido al repositorio.**
- **A07 / auditoría histórica exhaustiva:** PARCIAL — fuentes de chat antiguas sólo accesibles de forma resumida, no se afirma recuperación literal íntegra.
- **Pruebas funcionales de Terminal, Cloudflare o plataformas:** NO EJECUTADAS EN ESTE PROTOCOLO. No se cambió el software.

## Auditoría de apertura Stage 4 — 2026-10-12
- Se reconstruyó la intención y parte de la secuencia histórica de las tres etapas; se obtuvo más detalle sobre las reglas de plataforma y la separación de componentes. Ver `AUDITS/RECOVERY-2026-10-12-STAGE-04.md`.
- A01–A04 y A11: índice **previsto** 1..4 y fichas acumuladas. Confirmar en GitHub tras commit.
- A07: PARCIAL, texto íntegro y último tramo de chats 1–3 sin disponibilidad completa.
- A08: aclaración de alcance de estados POR CONFIRMAR / A TIEMPO añadida, sin declarar prueba funcional.
- A09–A10: verificar que el diff registra sólo cambios en `Project-Relight-Continuity/`.
- A12: pruebas de editor privado, APIs y Cloudflare no realizadas; no confundir con verificación de código.

## Segunda auditoría de Stage 4
- [x] A13 — localización por formato y catálogo; imagen parcial por paginación.
- [x] A14 — contraste estático v23.9/v23.10/v23.11, cabecera y cierre; **pruebas en navegador no ejecutadas**.
- [x] A15 — índice de plantillas `TEMPLATES/README.md` creado.
- [x] A16 — recuperación pública por canal/video ID y comparación conceptual; cifras incompatibles se registran como no comparables.
- [x] A17 — separación de datos privados, archivos de terceros y documentación pública.
- [ ] A18 — repetir materialización de originales sólo cuando haya autorización; registrar hash y copia real.
- [ ] A19 — verificar integridad post-commit y no tocar `KGBlaze-Information-Center/`.

## Tercera auditoría Stage 4 (12-oct-2026)
- A20: fuentes originales por enlace/ID; YouTube e Instagram por proveedor, Ko-fi/HoloList/vTubie páginas directas, X/Twitch/Discord acceso bloqueado. Resultado PARCIAL.
- A21: descripción de Connect y mumei recuperada por IDs y créditos contrastados; PASA en alcance de videos concretos. X posts no contrastables.
- A22: 8 videos de streaming 1–9 oct localizados por ID; PASA como evidencia de publicación, no comprobación hora/estado Twitch.
- A23: `TEMPLATES/LIVE_STREAMS.md` creada; créditos generales de streams y reglas preservadas como secciones, no como texto íntegro copiado. PASA de estructura, reproducción literal NO PROBADA.
- A24: se compararon calendario v12, conciliado de 11-oct y agenda extendida, conservando conflicto Azur 21/22 y Cake Song demo no verificada. PASA identificación de discrepancias; resolución pendiente.
- A25: `INITIALIZATION.md` y reglas persistentes listas. **No se puede activar automáticamente sólo desde GitHub**: el propietario debe incorporar `PROJECT_STARTUP_INSTRUCTIONS.md` a las instrucciones del Proyecto.
- A26: verificar después de cada commit que ningún archivo ajeno a `Project-Relight-Continuity/` haya sido modificado.

## Auditoría puntual Q-01/Q-02 — 2026-10-12 · confirmación explícita del usuario (Stage 4)
- **Q-01: RESUELTA** por confirmación usuario: reservas Azur 21/22 sin hora, sin suponer anuncios ni emisión.
- **Q-02: RESPONDIDA** por confirmación usuario: demo Cake Song del 12-oct sigue pendiente; la tarea permanece ABIERTA y plazo 31-oct sin cambio.
- Matriz de impacto: `SOURCES/CALENDAR_RECONCILIATION.md`, `DECISIONS.md`, `QUESTIONS.md`, `STAGES/STAGE-04.md`, `HANDOFFS/CURRENT.md`, `TEMPLATES/CALENDAR.md`; otros calendarios y contenidos NO deben cambiarse.
- Verificar en GitHub tras publicar que sólo haya modificaciones documentales dentro de `Project-Relight-Continuity/`. **No se editó XLSX original de Biblioteca ni se probó el editor v23.11**.
