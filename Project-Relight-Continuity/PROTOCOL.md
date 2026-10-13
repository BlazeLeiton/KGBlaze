# KGRP v3 — Protocolo operativo profundo (obligatorio)

## 0. Ámbito y activación
Aplicar cuando se solicite reanudar, recuperar, revisar, continuar o reconstruir KGBlaze / Project Relight; ejecutar igualmente si el chat previo se agotó, se interrumpió o desapareció. La modalidad predeterminada es **PROFUNDA**, nunca express. La respuesta breve puede ser un encabezado ejecutivo, no un recorte del análisis.

El proyecto de continuidad se mantiene aislado en `Project-Relight-Continuity/`. El software del Centro de Información / Terminal permanece fuera de este directorio y se verifica como fuente externa cuando corresponda.

## 1. Inventario activo de etapas
- Leer `STAGES/index.json`, comprobar secuencia 1..N, existencia de cada archivo y estado de cierre.
- Abrir **todas** las etapas 1..N en orden, no solamente la última. Actualizar mentalmente cada decisión según cambios posteriores.
- Buscar nuevos chats llamados Stage N+1, o conversaciones sustitutivas sin nombre, en historial y archivos cuando estén accesibles.
- Si se encuentra una etapa posterior real y su identidad está probada, registrarla como N+1, crear ficha individual y añadirla al índice. Nunca saltar ni renumerar las anteriores.
- Un chat usado exclusivamente para continuidad puede quedar registrado como sesión de continuidad sin llamarlo Stage N+1 salvo evidencia de que es esa etapa.

## 2. Recolección exhaustiva de fuentes
1. Recuperar conversaciones originales (incluidas últimas intervenciones, adjuntos y herramientas), si están accesibles.
2. Consultar contexto recuperable de conversaciones previas y cotejarlo con traspasos y notas por etapa.
3. Inventariar versiones locales/adjuntas de HTML, JSON, calendarios, diseños, pruebas y entregables.
4. Para código alojado: leer rama actual, commits, README, pruebas y archivos concretos. Confirmar SHA al momento de inspección.
5. Inspeccionar las entradas `SOURCES.md` y cualquier hilo sin cierre.
6. Mantener **fuentes y capas separadas**: intención conversacional, archivo local, repositorio, ejecución de pruebas y producción.

No confundir que algo fue propuesto con que esté funcionando. No inferir detalles privados de los archivos públicos.

## 3. Recuperación obligatoria de conversaciones inconclusas
Al entrar en un chat nuevo, examinar como **candidatas INCONCLUSAS** todas las etapas sin `cierre_verificado=true` y cualquier conversación posterior cuyo último tramo no esté archivado.
- Recuperar al menos: última solicitud concreta, último cambio realizado, último archivo mencionado, operación iniciada, resultado confirmado, operación fallida, pregunta abierta, siguiente instrucción esperada.
- Un mensaje del asistente «listo» sin evidencia **no acredita** que el cambio llegó al archivo o despliegue.
- Si el chat se corta después de una herramienta sin respuesta final, comprobar efecto real (archivo/commit/recurso) antes de repetir la operación.
- Comparar `HANDOFFS/CURRENT.md` con contenido final del último chat, detectando **delta no archivado**.
- Señalar `TRUNCAMIENTO_POSIBLE` si sólo existe resumen o fragmentos de contexto y evitar inventar la última frase.
- Nunca suponer que un chat sin cierre quedó técnicamente terminado. Dejar asunto en `REQUIERE_AUDITORIA` o `INCONCLUSO` con criterio verificable.

## 4. Reconstrucción y precedencia
Para cada tema: solicitud original → revisiones → decisión aprobada → corrección que la reemplaza → implementación → pruebas observadas → despliegue.
- Precedencia para intención: corrección explícita del usuario más reciente dentro del mismo componente.
- Para código: archivo/commit comprobado antes que recapitulación.
- Para comportamiento: prueba ejecutada reproducible antes que código o README.
- Para producción: comprobación directa del entorno antes que intención de despliegue.
- Mantener decisiones antiguas etiquetadas `REEMPLAZADA`, no borrarlas: explican por qué se hizo algo.
- Detectar contradicciones aparentes de componentes distintos (operativo privado vs visor público), no fusionar sus reglas.

## 5. Auditoría cuando haya dudas
Invocar `AUDIT.md` **obligatoriamente** ante:
- Dos instrucciones incompatibles o estado no claro.
- Texto de README sin corroboración de código; código sin pruebas; pruebas sin prueba de despliegue.
- Cambios de nombre, ruta, versión, modelo de datos, seguridad o integración externa.
- Evidencia incompleta por agotamiento de chat o archivos inaccesibles.
- Posible regresión respecto a un comportamiento previamente aprobado.

Emitir hallazgo con `id`, descripción, fuentes, nivel de certeza, plan de prueba, resultado (si ejecutado) y estado de resolución. Si una prueba requiere credenciales, acciones destructivas o aprobación de despliegue, dejar explícito `NO EJECUTADA`.

## 6. Producto mínimo de CADA recuperación
Entregar un informe extenso estructurado con:
A. Etapas 1..N y sesiones inconclusas.
B. Cronología fechada e historial de decisiones.
C. Arquitectura y artefactos por componente (sin mezclar).
D. Matriz solicitud/decisión/código/prueba/despliegue.
E. Correcciones vigentes y decisiones sustituidas.
F. Hallazgos de auditoría, contradicciones y huecos.
G. Último punto real y asuntos interrumpidos.
H. Siguiente trabajo ejecutable y dependencias.

Si el usuario pide una acción concreta junto con recuperación, realizar la recuperación pertinente y luego ejecutar la acción con las restricciones vigentes; no pedir que repita datos ya aportados.

## 7. Final de chat, programado o accidental
Si el usuario ejecuta `KGRP: CIERRE`: archivar traspaso acumulativo y delta, último mensaje, commits, pruebas, archivos y pendientes. Si no hay cierre: en el siguiente arranque ejecutar investigación retrospectiva completa. No se puede detectar con fiabilidad el límite de longitud ni hacer un cierre automático después de que el chat ya sea inaccesible.

## 8. Ampliación perpetua
Cuando exista Stage N+1:
1. Copiar `TEMPLATES/STAGE.md` a `STAGES/STAGE-XX.md`.
2. Añadir objeto al arreglo `stages` del índice con `number=N+1`.
3. Actualizar `latest_stage` y `HANDOFFS/CURRENT.md`.
4. Integrar sus decisiones en `DECISIONS.md`, conservar anteriores.
5. Marcar sesiones anteriores como cerradas **sólo si hay prueba de cierre formal**.
6. Ejecutar auditoría de continuidad y registrar resultado.

### Comandos
- `KGRP: REANUDAR` = recuperación histórica completa y auditorías necesarias.
- `KGRP: PROFUNDO` = lo mismo con informe forense aún más detallado.
- `KGRP: AUDITAR [tema]` = auditoría técnica y de requisitos con pruebas.
- `KGRP: CIERRE` = traspaso detallado; nunca indispensable para recuperación siguiente.
- `KGRP: EMERGENCIA` = recuperación de múltiples fuentes ante falta de historial.

## 9. Segunda auditoría obligatoria — v2.1 (incorporación Stage 4)
**No basta con revisar fichas:** cada recuperación extensa consta de dos pasadas verificables:
- **Pasada A — histórica:** decisiones, mensajes finales y conversaciones inconclusas de todos los Stage 1..N, evolución y sustituciones.
- **Pasada B — archivística y contrastiva:** buscar los originales por formato HTML, CSV, XLSX, PPTX, PDF, DOCX, PNG/JPG; identificar versiones maestras, plantillas, metadatos, derechos y bytes realmente disponibles; comparar requisitos, código y pruebas; consultar métricas públicas por enlace/ID directo y contrastar con fuentes internas **sólo si ventanas y definiciones son equivalentes**.
- Cada nueva pasada B produce `AUDITS/SECOND-PASS-YYYY-MM-DD*.md`, actualiza `SOURCES/FILE_REGISTRY.md`, `SOURCES/DIRECT_SOURCE_POLICY.md` y `TEMPLATES/README.md`. Consultar siempre el índice de plantillas en nuevas etapas.
- Seguridad: el repositorio público aloja documentación **sanitizada**; archivos operativos privados, transcripciones completas sin revisión, analíticas, credenciales y fuentes de terceros NO se copian aquí.
- Estados a distinguir rigurosamente: encontrado/indexado, leído, materializado, archivado en copia, probado, desplegado. Materialización rechazada **no equivale** a recuperación de bytes.
- Auditoría ante duda (incluida v23.11/versión previa, CSV vs API, directos programados vs realizados). No rellenar faltantes por inferencia.

## 10. KGRP v3 — tercera auditoría y secuencia unificada
`INITIALIZATION.md` es desde ahora el **punto de entrada operativo obligatorio** de todas las futuras sesiones de Project Relight. Mantener los apartados anteriores como historia y especificaciones de detalle.

La recuperación profunda comprende sin excepción:
1. Historia Stage 1..N y rescate retrospectivo de todos los chats inconclusos.
2. Auditoría archivística de plantillas y formatos originales; versiones, derechos y copias realmente autorizadas.
3. Revisión de perfiles y publicaciones **reales**, directos y descripciones con URLs y IDs verificados; comparar contra plantillas separadas de covers, directos y promoción X.
4. Conciliación de calendarios, ICS, XLSX, decisiones, deadlines, y videos publicados, sin inferir emisión desde una reserva.
5. Comparación de métricas públicas/privadas sólo con ventanas, ámbito y definiciones alineados, preferentemente fuente de cuenta o IDs directos.
6. Pruebas de regresión, integridad y evaluación de incertidumbres; preguntas dirigidas no repetitivas y documentación de bloques.
7. Actualización de Stage actual, `HANDOFFS/CURRENT.md`, `DECISIONS.md`, `QUESTIONS.md`, `TEMPLATES/README.md` y auditorías, sin tocar Terminal ni copiar datos privados.

Reporte de referencia: `AUDITS/THIRD-PASS-2026-10-12.md`. Inventario de perfiles: `SOURCES/PUBLIC_PROFILES.md`, publicaciones: `SOURCES/PUBLIC_PUBLICATIONS.md`, calendario: `SOURCES/CALENDAR_RECONCILIATION.md`.

Estas siete actividades operativas son la ejecución de las fases 0–6 del documento de arranque; ninguna es un reemplazo de las pasadas históricas anteriores. Si una plataforma es inaccesible, se deja evidencia `NO_VERIFICABLE`, no se declara completada su auditoría.

## 11. Comando oficial «Relight Respark» y mantenimiento incremental
- **ES:** `Ejecuta Relight Respark`. **EN:** `Execute Relight Respark`. **Ambos disparan lo mismo**: recuperación profunda y ejecución de las fases 0–6 de `INITIALIZATION.md`. El comando KGRP largo permanece como alias antiguo, no requisito.
- Esta ejecución completa se reserva para la frase de usuario o el arranque automático del Proyecto cuando esté configurado. Las peticiones cotidianas **no** fuerzan una auditoría completa por defecto.
- Si emerge un nuevo dato histórico, corrección, documento, decisión, resultado de prueba o bloqueo, **integrarlo de manera incremental** al Stage abierto, `DECISIONS.md`, `HANDOFFS/CURRENT.md`, fuentes y plantillas aplicables, preservando procedencia, privacidad y decisiones sustituidas. No inventar una etapa nueva.
- ICS Twitch: el usuario confirma explícitamente que el archivo existente del 10-oct es el **último** y que no ha habido cambios. Pregunta de nueva exportación cerrada **por ahora**; no inferir que se consiguió abrir directamente el calendario público.
- La documentación en repositorio sólo proporciona la fuente verificable del protocolo; necesita estar disponible en el contexto/chat o en las instrucciones del Proyecto para dispararse desde una conversación nueva.
