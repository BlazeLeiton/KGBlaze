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
