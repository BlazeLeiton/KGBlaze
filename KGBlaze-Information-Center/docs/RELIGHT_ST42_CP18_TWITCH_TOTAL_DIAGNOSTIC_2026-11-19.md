# Project Relight · Stage 42 CP18 — Diagnosticación de `invalid_response_total` (sin exponer cuentas)

Fecha del incidente: 19 de noviembre de 2026, America/Mexico_City (madrugada del 20 de noviembre UTC).

## Confirmado por el propietario

Después de fusionar CP17 y comprobar 542/542 pruebas, el propietario ejecutó la **sincronización privada** con su `ADMIN_TOKEN`. La respuesta fue únicamente:

```text
Ok=False  Reason=invalid_response_total
```

Esto significa que **la consulta no se confirmó como un roster válido**. La rutina falla antes de invocar la transacción D1 cuando la respuesta no valida. No implica revocación OAuth ni justifica declarar inactiva ninguna suscripción.

## Qué significa el error antiguo

CP17 utilizaba un único código `invalid_response_total` en exactamente **dos** ramas:
1. `body.total` faltante, no entero seguro o negativo.
2. El número de IDs distintos validados superó `body.total` en el curso de la paginación.

El mensaje, por sí solo, **no permite demostrar cuál ocurrió**. El hecho de que el endpoint CP14 de resumen funcionara previamente leyendo `total` en una consulta separada tampoco prueba que la respuesta de roster fuera coherente en el nuevo intento.

La documentación oficial Twitch de `Get Broadcaster Subscriptions` indica que `total` es un entero que describe el número de suscriptores, que el campo se omite cuando se envía un filtro `user_id`, y que algunas suscripciones pueden no figurar en `data`, por ejemplo cuentas eliminadas. También advierte que un cursor puede existir incluso en la última página.

Fuente: https://dev.twitch.tv/docs/api/reference/subscriptions

## CP18: diagnóstico limitado

Dividimos los dos caminos anteriores en códigos estáticos de solo texto:

| Código seguro | Condición exacta |
|---|---|
| `provider_total_missing` | `total` ausente o nulo en respuesta sin filtro `user_id` |
| `provider_total_not_integer` | `total` no es un entero seguro de JavaScript |
| `provider_total_negative` | `total` es negativo |
| `provider_total_below_observed` | IDs válidos y distintos recibidos superan el total declarado |

Los demás controles siguen: validación de broadcaster ID y user ID, límites de páginas, protección contra cursor repetido/incompleto, token encriptado, no retener datos si falla la consulta, y D1 CAS transaccional. No añadimos `console.log`, datos del proveedor, números ni identidades a los códigos o a GitHub.

**No intentamos compensar una contradicción de Twitch inventando un recuento ni borrando IDs del cache.** Si se observa `provider_total_below_observed`, los registros vistos prueban actividad de esos usuarios pero el conjunto no es suficientemente fiable para una sustitución destructiva. Un diseño futuro podría consultar cuentas específicas y conservar resultados positivos sin asumir bajas; eso requiere contrato de estado de frescura independiente.

## Comprobaciones necesarias

CI completa del repositorio y prueba anónima de producción con rutas privadas inaccesibles. Tras su despliegue, repetir la misma lectura manual con credenciales locales del propietario. Compartir **solo `Ok`, `Refreshed`, `SnapshotVersion` o `Reason`**. Nunca compartir `ADMIN_TOKEN`, respuesta JSON de Twitch, IDs, alias, URL OAuth ni secreto.

Este checkpoint no añade nuevas tablas, permisos, Cron, EventSub, YouTube, Ko-fi, ni una lista pública de miembros.
