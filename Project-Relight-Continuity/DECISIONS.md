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
