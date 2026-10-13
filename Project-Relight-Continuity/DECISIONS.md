# Registro acumulativo de decisiones (KGRP v2)
Este registro conserva decisiones **históricas y vigentes**. Es un mapa de evidencia, no la transcripción original.

| ID | Etapa | Decisión o corrección | Estado / alcance | Comprobación pendiente |
|---|---|---|---|---|
| REL-001 | 1 | Separar auditoría externa e interna; auditar histórico YouTube y Twitch | Historia: auditoría externa reportada como completada | Validar informes originales |
| REL-002 | 1 | Identidad: IP puerta, Blaze hogar; YouTube producto/Twitch directo/X conversación | Estrategia recuperada | Verificar reglas posteriores |
| REL-003 | 1-2 | Referencia visual aeroportuaria con diseño original, conservar versiones aprobadas | Requisito histórico | Auditar exportaciones finales |
| REL-004 | 2 | Editor privado separado de visor público de solo lectura | VIGENTE | Comparar rutas/archivos |
| REL-005 | 2 | JSON arrastrable, limpieza de campo sin cancelar, limpiar semana ≠ HIATUS | VIGENTE COMO REQUISITO | Probar HTML local |
| REL-006 | 2-3 | ES/EN/JA, iconos con enlaces, agenda con origen Twitch y verificación YouTube | VIGENTE COMO PROPÓSITO | Revisar visor desplegado |
| REL-007 | 2-3 | Actualización visual POR CONFIRMAR → A TIEMPO ante coincidencia confiable | EN DISPUTA DE ALCANCE | Obtener mensajes exactos y auditar |
| REL-008 | 3 | «Terminal» sin sufijos de letra | VIGENTE; sustituye etiquetas de nombres anteriores | Revisar restos antiguos |
| REL-009 | 3 | Revisión de publicación 409; bloqueos 423; backend público y editor privado | IMPLEMENTADO EN CÓDIGO | Ejecutar tests y comprobar servicio |
| REL-010 | 3 | No desplegar infraestructura antes de aprobación expresa | VIGENTE | Verificar autorización puntual |
| REL-011 | Continuidad | Cada recuperación debe ser exhaustiva, profunda y por todas las etapas | VIGENTE | Auditar índice 1..N |
| REL-012 | Continuidad | Recuperar último tramo de todo chat sin cierre confirmado | VIGENTE | Guardar gaps explícitos |
| REL-013 | Continuidad | Extender Stage N+1 sin perder N y auditar cuando haya dudas | VIGENTE | Comprobar registry e informes |
| REL-014 | Continuidad | Mantener KGRP fuera de software `kgblaze-terminal` | VIGENTE | Verificar rutas publicadas |

## Registro de cambio futuro
`ID | fecha local | etapa | fuente (mensaje, archivo, commit) | texto original | alcance | motivación | sustituye | solicitud | aprobación | implementación | prueba | despliegue | certeza | dudas`.

Nunca reducir toda la historia a sólo el estado más reciente; guardar reemplazos, alternativas y razones.

## Decisiones fijadas en apertura Stage 4 — 2026-10-12
| ID | Etapa | Decisión | Estado | Evidencia |
|---|---|---|---|---|
| REL-015 | 4 | Esta conversación se registra formalmente como **Stage 4** | CONFIRMADO_USUARIO | Instrucción explícita en chat actual |
| REL-016 | 4 | Cualquier recuperación futura incluye **Stage 1–4 y nuevas etapas**, sin reducir la profundidad | VIGENTE | Reiteración actual de protocolo KGRP |
| REL-017 | 2–3 | Póster semanal estático y visor público dinámico son componentes distintos; no unificar sus reglas | ACLARADO POR ALCANCE | Secuencia contextual recuperada |
| REL-018 | 2–3 | YouTube puede cambiar POR CONFIRMAR→A TIEMPO sólo en la presentación del visor con match fiable; operativo editorial no se modifica | CONFIRMADO_USUARIO; SIN VERIFICAR EN PRODUCCIÓN | Contexto de instrucciones 12-oct |
| REL-019 | 1 | Auditoría histórica YouTube/Twitch reportada completada, aunque faltan transcripciones del chat original | HISTÓRICO RECUPERADO | Corrección del usuario 30-sep |

| REL-020 | 1–2 | Siete paneles reportados publicados; el séptimo pasó de opcional a incorporado | HISTÓRICO; verificación en vivo pendiente | Recuperación contextual con referencia a capturas |
| REL-021 | 1–4 | Orden estratégico posterior: métricas internas YouTube/Twitch → estrategia X → Pokémon Journey noviembre | VIGENTE COMO PLAN HISTÓRICO, sujeto a revisiones | Conversaciones previas |
| REL-022 | 1–4 | Stage 1 cerró como trabajo/auditoría; el cierre textual del chat sigue sin acreditarse | ACLARACIÓN DE ESTADOS | Evidencia contextual previa |

## Segunda revisión Stage 4 — decisiones que siguen vigentes
| ID | Etapa | Decisión | Estado |
|---|---|---|---|
| REL-023 | 4+ | Todas las recuperaciones futuras incorporan segunda pasada de auditoría archivística de originales, formatos, versiones, plantillas y métricas | OBLIGATORIA |
| REL-024 | 4+ | Contrastar métricas con fuente pública directa por URL/canal ID/video ID y periodos/definiciones compatibles; no sustituir con búsquedas indexadas | OBLIGATORIA |
| REL-025 | 3–4 | v23.11 es candidata técnica posterior con `X-Terminal-Week` y migración local, pero aún no release E2E probado | VERIFICADO CÓDIGO, PRUEBA PENDIENTE |
| REL-026 | 4+ | La custodia de originales sensibles permanece fuera de repo público; documentación y plantillas reconstruidas pueden alojarse saneadas | OBLIGATORIA |
| REL-027 | 4+ | Conservar catálogo de plantillas y recuperar fuentes maestras en nuevas etapas | IMPLEMENTADO, MASTERS EN BIBLIOTECA |

## Tercera revisión — decisiones confirmadas y criterios (Stage 4)
| ID | Etapa | Decisión | Estado |
|---|---|---|---|
| REL-028 | 4+ | Arranque de cada chat Project Relight ejecuta fases 0–6 de `INITIALIZATION.md`, historia+archivo+perfiles/publicaciones+agenda+pruebas+preguntas | PROTOCOLO PUBLICADO; requiere configurar instrucciones en ChatGPT Project |
| REL-029 | 1–4 | No reabrir perfiles externos declarados cerrados sólo por comprobar consistencia; corrección si nueva instrucción o revisión lore | VIGENTE |
| REL-030 | 2–4 | Las **descripciones publicadas** de covers y directos usan módulos diferentes y los créditos exactos de Connect y mumei siguen lo publicado. La inferencia histórica de **dos plantillas maestras** queda **SUSTITUIDA** por REL-079 (plantilla maestra única precargada) | PUBLICACIONES CONTRASTADAS; INTERPRETACIÓN DE DEFAULTS CORREGIDA 13-oct |
| REL-031 | 2–4 | X: posts interactivos + replies ≠ promoción de directos/covers; no tratar ausencia de acceso X como inactividad | VIGENTE, post real no verificado |
| REL-032 | 1–4 | Publicado/emitido ≠ programado/reservado; hasta tener prueba pública para eventos nuevos no elevar su estado | OBLIGATORIA |
| REL-033 | 4 | Discrepancia histórica de reserva Azur 21/22 **resuelta**: ambas fechas permanecen RESERVADAS, sin hora ni confirmación de directo; instrucción usuario Stage 4, 12-oct | RESUELTO Q-01; CONFIRMADO_USUARIO |
| REL-034 | 4+ | Fuente oficial accesible primero, proveedor por ID si hay bloqueo; agregadores son contexto y pueden estar desactualizados | OBLIGATORIA |

## Aclaraciones de calendario confirmadas — 2026-10-12 · confirmación explícita del usuario (Stage 4)
| ID | Etapa | Decisión puntual | Estado | Efecto delimitado |
|---|---|---|---|---|
| REL-035 | 4 | Mantener reservas de **Azur Lane 21-oct y 22-oct**, ambas sin hora | CONFIRMADO_USUARIO | Se corrige la discrepancia entre calendarios; no son eventos en vivo ni confirmación editorial de emisión |
| REL-036 | 4 | La **demo vocal de Cake Song del 12-oct** continúa pendiente | CONFIRMADO_USUARIO | Tarea abierta; no registrar grabación ni envío; plazo 31-oct sin modificación |

**Alcance negativo expreso:** ninguna otra actividad fue confirmada, cancelada, reprogramada o dada por terminada; ninguna modificación al editor ni a Terminal.

## Cuarta auditoría — fuentes directas y procedimiento (12-oct-2026)
| ID | Etapa | Decisión/hecho | Estado |
|---|---|---|---|
| REL-037 | 4 | Carrd canónico: `https://blazeleiton.carrd.co/`; ya no es URL desconocida | CONFIRMADO_USUARIO Y WEB |
| REL-038 | 4+ | Twitch `/about`, `/schedule` y `/videos` se intentan antes de declarar acceso insuficiente; la falta de HTML legible no prueba inactividad | PRUEBA EJECUTADA / ACCESO BLOQUEADO |
| REL-039 | 4+ | Lecturas divergentes de Carrd no justifican editar un perfil cerrado; guardar ambos snapshots y preguntar versión actual sólo si importa | CAUTELA VIGENTE |
| REL-040 | 4+ | Para comparar directos usar inicio/fin reales cuando la cuenta autorizada los devuelve, diferenciando `publishedAt` del VOD y programación; proteger videos privados | VERIFICADO EN DATOS |
| REL-041 | 4+ | En vigilancia existente: auditoría de estado por lectura; no duplicar automatizaciones ni activar avisos deshabilitados por defecto | OBSERVADO / SIN CAMBIOS |
| REL-042 | 4+ | Para Steam cruzar bibliotecas personales/familiares, wishlist, historial y precios MXN antes de comprar o recomendar stream | CRITERIO HISTÓRICO RECUPERADO |

## Stage 4 — respuestas registradas (2026-10-12)
| ID | Decisión | Estado |
|---|---|---|
| REL-043 | El usuario observa en Carrd «Acercando a México y al mundo», con Instagram | Q-09 RESUELTA |
| REL-044 | El calendario Twitch mediante ICS/enlace nuevo se revisará después; no se confirma agenda actual | Q-06 POSPUESTA |

No se autoriza modificar perfiles, Terminal ni los estados editoriales.

## Quinta actualización de continuidad (12-oct-2026): comando y fuente
| ID | Etapa | Decisión explícita del usuario | Estado / alcance |
|---|---|---|---|
| REL-045 | 4 | `Ejecuta Relight Respark` / `Execute Relight Respark` como **únicos comandos cortos canónicos**, equivalentes para ejecutar el KGRP profundo completo | CONFIRMADO_USUARIO; ALIAS PREPARADO EN PROTOCOLO |
| REL-046 | 4 | El último ICS Twitch ya recuperado es el **más reciente y no hay cambios posteriores**; no pedir una nueva exportación sin motivo | CONFIRMADO_USUARIO; Q-06 CERRADA POR AHORA |
| REL-047 | 4+ | Cualquier descubrimiento relevante durante la conversación se incorpora de forma **incremental** a continuidad y protocolo; evitar auditoría integral repetitiva hasta nuevo comando | CONFIRMADO_USUARIO; REGLA VIGENTE |

La confirmación del ICS no demuestra acceso web directo a Twitch ni convierte programación en emisiones; las decisiones previas (Azur 21/22 reservados sin hora y Cake Song demo pendiente) siguen vigentes. El registro de comandos en GitHub no modifica automáticamente las instrucciones personalizadas de ChatGPT Project.


## Continuación del cierre de Stage 3 — corrección de alcance en Stage 4 (12-oct-2026)
| ID | Etapa | Corrección o evidencia | Estado |
|---|---|---|---|
| REL-048 | 3–4 | **Terminal** (sin B) designa el producto/editor/visor, API, tablas nuevas y textos técnicos; `kgblaze-terminal` queda como nombre físico D1. `kgblaze_terminalb_board_v3_202610` sólo sobrevive como **clave LEGACY de migración**, no branding. | CONFIRMADO_USUARIO y VERIFICADO_CODIGO |
| REL-049 | 4 | **Terminales A y B** sigue siendo el nombre de las instalaciones en el encabezado público del aeropuerto, NO el nombre del software. Restaurar históricos ES `AEROPUERTO INTERNACIONAL DE LA KGBLAZE · TERMINALES A Y B`, EN `KGBLAZE INTERNATIONAL AIRPORT · TERMINALS A & B`, JA `KGBLAZE国際空港 · ターミナルA・B`. | CONFIRMADO_USUARIO; VERIFICADO_FUENTE_HISTORICA |
| REL-050 | 4 | Restauración de títulos en DOM, traducciones y cabecera canvas del visor `KGBlaze-Information-Center/public/index.html`; código fuente modificado y comprobado en GitHub, **sin despliegue**. Editor privado v23.11 corregido en artefacto separado, fuente original de Biblioteca sin sobrescribir. | VERIFICADO_GITHUB / PROBADO_SINTAXIS; OPERATIVO_ARCHIVO_DERIVADO |

**Fuente recuperada Stage 3:** últimos mensajes: 1) nombre `kgblaze-terminal`; 2) identificación D1 aportada por usuario; 3) prohibición de usar `terminalb`/«Terminal B» para el SOFTWARE. El texto de las respuestas históricas está reconstruido parcialmente, no disponible literalmente completo. Stage 4 aclaró el alcance público. Nunca propagar la prohibición técnica a la denominación del aeropuerto.

## Corrección de encabezado público de Terminal — Stage 4 (12-oct-2026)
| ID | Etapa | Decisión verificada | Estado |
|---|---|---|---|
| REL-048 | 3–4 | Nombre técnico del software, editor, visor, API y tablas: **Terminal**; `terminalb` sólo se conserva como clave de migración local histórica | CONFIRMADO_USUARIO; código verificado |
| REL-049 | 2–4 | **Identidad pública aeroportuaria** mantiene «**Terminales A y B**», y sus versiones ES `AEROPUERTO INTERNACIONAL DE LA KGBLAZE · TERMINALES A Y B`, EN `KGBLAZE INTERNATIONAL AIRPORT · TERMINALS A & B`, JA `KGBLAZE国際空港 · ターミナルA・B` | CONFIRMADO_USUARIO; visor GitHub y HTML corregido verificados |
| REL-050 | 4 | Usar HTML operativo v23.11 con encabezado corregido, sin publicarlo en GitHub; visor principal ya posee traducciones y tests de regresión | VERIFICADO_ARCHIVO y VERIFICADO_CODIGO; sin despliegue |

La instrucción «Terminal» NUNCA implica eliminar los nombres de las terminales aeroportuarias A y B. Auditoría y límites: `AUDITS/STAGE3-TERMINAL-HEADER-2026-10-12.md`.

## Stage 4 — mitigación de saturación de conversaciones (12-oct-2026)
| ID | Etapa | Decisión / acción | Estado |
|---|---|---|---|
| REL-051 | 4 | Ejecutar Relight Respark incluyendo **Stage 4** y conservar evidencia Stage 1..4 sin crear Stage 5 por abrir otro chat | RES­PARK EJECUTADO / STAGE 4 ABIERTA |
| REL-052 | 4+ | Documentar una estrategia de continuidad por capas: archivo histórico íntegro, `HANDOFFS/BOOTSTRAP.md` breve, `HANDOFFS/CURRENT.md` acumulativo, deltas tras hitos y fuentes/código de verdad | MEDIDA DOCUMENTAL IMPLEMENTADA; eficacia práctica futura no medida |
| REL-053 | 4+ | Explicar límites con prudencia: no se dispone de contador fiable de contexto ni prueba de una reducción de límite de mensajes; no asumir que memoria reproduce todas las intervenciones | DIAGNÓSTICO Y CAUTELA VIGENTES |

Ver [`CONTEXT-CONTINUITY.md`](CONTEXT-CONTINUITY.md) y [`AUDITS/RESPARK-2026-10-12-CONTEXT.md`](AUDITS/RESPARK-2026-10-12-CONTEXT.md). Los cambios afectan **sólo continuidad documental**; no se ejecutaron cambios de Terminal, D1, agendas ni perfiles.

## Stage 4 — cierre de auditoría de interrupción técnica (12-oct-2026)
| ID | Estado | Evidencia nueva |
|---|---|---|
| REL-054 | VERIFICADO_CI | Revisión Respark Stage 1–4: registro válido, última Stage=4; GitHub Actions run 38337375637 PASS y suite de Terminal 18/18 PASS. |
| REL-055 | VERIFICADO_TEXTO_PRIVADO / NO_E2E_NUEVO | Operativo derivado `Terminal_Operativo_v23_11_encabezado_corregido.html`: textos ES/EN/JA y `LEGACY_STORE` sólo para migración. Extracción de bytes de Biblioteca rechazada; no afirmar prueba navegador nueva. |
| REL-056 | CONSERVAR_ALCANCE | No renombrar nuevamente encabezado público ni tocar Worker, D1 o el editor privado durante auditoría; software `Terminal`, aeropuerto `Terminales A y B`. |

Reporte: `AUDITS/RESUME-STAGE04-TERMINAL-2026-10-12.md`. Ningún Stage nuevo creado.

## Stage 5 — continuidad del hilo técnico y Respark (12-oct-2026 CDMX)
| ID | Etapa | Evidencia y decisión | Estado |
|---|---|---|---|
| REL-057 | 5 | La conversación denominada «Stage 5» existe en historial reciente y se incorpora al índice 1..5; Stage 4 queda abierta en cierre conversacional, no se renumera. | RECONOCIDA; CIERRE_NO_VERIFICADO |
| REL-058 | 4–5 | PR #1 (`2ff5af0`) normaliza orígenes ICS `tw/twitch` y compatibilidad legacy de lectura sin cambiar D1/revisión 1. | INTEGRADO_MAIN, CI 21/21, BUILD_PRODUCCIÓN_REPORTADO |
| REL-059 | 5 | PR #2 es sólo simulación de estados con `resolveDisplayStatus`, 31/31 tests PASS, `draft` sin merge. | PROBADO_CI; NO_DESPLEGADO |
| REL-060 | 5 | Antes del matcher confirmar GET público con revisión 1/6 Twitch/4 manuales; sin republicación. | PENDIENTE_GET_NAVEGADOR |
| REL-061 | 5 | Matching YouTube primero conservador y aislado: fixtures públicos, ambigüedad sin match, sin credenciales, D1, cron ni cambios editoriales. | SIGUIENTE_TAREA; NO_ACTIVADO |

Fuente prioritaria: `STAGES/STAGE-05.md` y `AUDITS/RESPARK-2026-10-12-STAGE-05.md`. No interpretar CI del PR #2 como despliegue.

## Stage 5 — experimento de emparejamiento sin producción
| ID | Etapa | Hecho / decisión | Estado |
|---|---|---|---|
| REL-062 | 5 | PR #3 `test/terminal-youtube-match-dry-run`, sólo matcher experimental y tests, sin integrar en Worker ni visor. `candidate` nunca se convierte en observación verificada. | CÓDIGO_EN_RAMA_DRAFT / NO_DESPLEGADO |
| REL-063 | 5 | Regla de matcher: validar canal propio, ID explícito, título distintivo y horas CDMX; duplicados, colaboraciones, reprogramaciones y conflictos se señalan para revisión. | PROTOTIPO_SIN_APROBACIÓN_DE_PRODUCCIÓN |
| REL-064 | 5 | GitHub Actions run `38349473729` (PR #3) **48/48**: 21 tests base + 27 de matcher; PR #2 independientemente 31/31 sin merge. | PRUEBA_CI_VERIFICADA |

## Confirmación de clasificación tras reparación de ICS (Stage 5 — 12-oct-2026)
| ID | Etapa | Decisión o hallazgo | Estado |
|---|---|---|---|
| REL-065 | 5 | El usuario confirma lectura real del endpoint: 6 Twitch + 4 manuales, revisión 1 sin nueva publicación. | CONFIRMADO_USUARIO_EN_NAVEGADOR; GET_ASISTENTE_NO_DISPONIBLE |
| REL-066 | 5 | JSON original muestra 4 manuales: 12-oct y 18-oct DESCANSO, 17-oct Collab Padoru POR CONFIRMAR y 1-nov F1 GP Ciudad de México 14:00 A TIEMPO. La colaboración explica el cuarto manual no mencionado por usuario. | VERIFICADO_ARCHIVO / CLASIFICACIÓN_ACTUAL; SIN CAMBIO EDITORIAL |
| REL-067 | 5 | Origen `manual` distingue creación del evento; estado `DESCANSO` es diferente. No transformar Padoru, GP ni descansos sin nueva autorización. | CAUTELA VIGENTE |

## Aclaración final de Padoru — Stage 5
| ID | Etapa | Decisión explícita | Estado |
|---|---|---|---|
| REL-068 | 5 | El usuario confirma que **Collab Padoru del 17-oct sí fue creado manualmente**; su ausencia de la primera enumeración verbal fue una confusión, no un error del sistema. Conservar origen `manual`, estado `POR CONFIRMAR` y resto de datos publicados sin reinterpretarlos. | CONFIRMADO_USUARIO; Q-12 RESUELTA; NO CAMBIOS EN PRODUCCIÓN |

## Stage 5 — integración read-only propuesta
| ID | Etapa | Implementación o decisión | Estado |
|---|---|---|---|
| REL-069 | 5 | El usuario autoriza avanzar en integración técnica después de PR #2/#3; PR #4 integra sus pruebas y matcher sin fusionar ni desplegar. | IMPLEMENTADO_EN_RAMA_DRAFT |
| REL-070 | 5 | Adaptador lectura manual de YouTube + preflight con cabecera, ADMIN_TOKEN, feature flag OFF y sin observaciones verificadas ni escrituras; la activación real exige decisión posterior. | CI_VERIFICADA; PRODUCCIÓN_DESACTIVADA |
| REL-071 | 5 | PR #4 GitHub Actions run `38350968478` 84/84 PASS, frente a 31/31 de PR #2 y 48/48 PR #3 de manera independiente. | CI_VERIFICADA; NO_PRODUCCIÓN |
| REL-072 | 5 | `videos.list` no proporciona `liveBroadcasts.status.lifeCycleStatus`; nunca deducir `DESPEGÓ` de un video terminado sin fuente de verificación adecuada. Incompletitud de `search.list` y costo API deben bloquear activación sin presupuesto de cuota/rate limiting. | RESTRICCIÓN_VIGENTE |

## Stage 5 — identidad y cuotas verificadas para primer preflight
| ID | Etapa | Hallazgo / regla | Estado |
|---|---|---|---|
| REL-073 | 5 | El ID canónico de YouTube `UCRd_uwPjrsf6Z3CRXwNehEQ` y la API key ya creada por el usuario se recuperaron del trabajo Stage 1. La clave no fue compartida ni instalada. | IDENTIDAD_HISTÓRICA_VERIFICADA; CLAVE_NO_ACCESIBLE |
| REL-074 | 5 | Cambio documental YouTube 2026: `search.list` = 1 unidad del cupo dedicado 100 consultas/día (2 consultas por preflight), no 100 unidades del cupo general por consulta. | FUENTE_OFICIAL_CONFIRMADA |
| REL-075 | 5 | PR #4 requiere canal exacto y `YOUTUBE_PREVIEW_LIMITER` presente. Cualquier desajuste, falta de binding, denegación o fallo del limitador impide llamar a Google. CI 88/88 PASS. | IMPLEMENTADO_EN_PR_DRAFT / NO_DESPLEGADO |
| REL-076 | 5 | No se ejecutó consulta real YouTube: TubeAlfred sin créditos y sin acceso a valor de API key ni panel Cloudflare. No crear evidencia falsa de API ni instalar secretos en repositorio. | BLOQUEADO_POR_ACCESO; SIN_CAMBIO_PRODUCCIÓN |

## Stage 5 — continuidad de configuración Cloudflare
| ID | Etapa | Hecho y estado | Estado |
|---|---|---|---|
| REL-077 | 5 | Usuario confirmó guardar el Rate Limiter `YOUTUBE_PREVIEW_LIMITER` en Dashboard de Cloudflare; Namespace 1001, límite 1/60 s según configuración guiada. | GUARDADO_REPORTADO_USUARIO; DEPLOY_NO_COMPROBADO |
| REL-078 | 5 | PR #4 sincroniza binding en `wrangler.toml` sin exponer secretos. CI run `38356151146` 90/90 PASS; PR Draft no merged. El flag de lectura sigue desactivado. | CODIGO_EN_DRAFT; PRUEBAS_PASADAS; NO_ACTIVADO |

## Recuperación Stage 1/2 + Song Covers — defaults de YouTube (13-oct-2026)
| ID | Etapa | Decisión / dato recuperado | Estado / evidencia |
|---|---|---|---|
| REL-079 | 1–2 / Song Covers / 5 | **Plantilla maestra única y modular** de YouTube Studio, válida para directos y covers, aceptada y reportada **precargada en los upload defaults**. Conservar orden, enlaces, Copyright Notice inglés, créditos, seis reglas completas y hashtags; quitar solo los módulos no aplicables al video. Desautoriza la inferencia de dos masters de REL-030. | VIGENTE; CONFIRMADO_HISTÓRICAMENTE_POR_USUARIO; texto íntegro nuevamente aportado el 13-oct; [maestra](TEMPLATES/YOUTUBE_MASTER_DEFAULTS.md) |
| REL-080 | 1–2 / Song Covers / 5 | **Tags ya precargados:** identidad base + Azur Lane + covers/música + Pokémon. El usuario no debe rehacer la validación por defecto. Distinguir tags metadata de hashtags de descripción. | VIGENTE; CONFIRMADO_HISTÓRICAMENTE_POR_USUARIO; [catálogo](TEMPLATES/YOUTUBE_METADATA_TAGS.md) |
| REL-081 | 1–2 / Song Covers / 5 | **Módulos opcionales guardados aparte:** Formula 1 (no en defaults), HoloCure/Hololive, Civilization, VRChat/collabs, narrativa/manga y eventos especiales. No inventar el texto literal de bloques aún no recuperados. | VIGENTE; recuperado historial 30-sep/01-oct; [catálogo](TEMPLATES/YOUTUBE_METADATA_TAGS.md) |
| REL-082 | 5 | Los archivos documentales `COVERS.md` y `LIVE_STREAMS.md` derivan de **videos publicados específicos**; no prevalecen sobre la confirmación del usuario sobre defaults maestros. | ACLARACIÓN DE PROCEDENCIA; evita reabrir trabajo cerrado |
