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
| REL-030 | 2–4 | Plantillas de covers y directos son distintas; créditos exactos de Connect y mumei siguen lo **publicado**, no un borrador genérico | VERIFICADO EN DESCRIPCIONES |
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
