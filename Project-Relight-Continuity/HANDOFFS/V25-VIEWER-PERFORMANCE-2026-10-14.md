# V.25 + Departures — rendimiento con imágenes compartidas (14-oct-2026)

## Cambio
- Migrados 25 PNG originales, sin recompresión ni escalado, desde los HTML monolíticos a \`public/assets/relight/art/\`. Son los mismos activos en ambos productos.
- Conservadas las selecciones editoriales para canvas 1080x1080, PNG/GIF HQ, y la selección independiente de portadas/LED en las fichas Departures.
- Cambio de \`fetch cache: no-store\` a \`no-cache\` **sólo** en GET públicos de agenda. ETag derivado del payload completo, incluidas observaciones YouTube/Twitch; 304 únicamente ante coincidencia total.
- Shell de V.25 sin datos privados: ETag con revalidación, conservando la CSP original. El fallback Stage21, las rutas administrativas y los tokens siguen sin caché persistente.
- Carga diferida de imágenes de biblioteca y agrupación de repintados al finalizar cargas mediante requestAnimationFrame.
- DOM, calendario, D1, bloqueos de finalización, cron, seguridad y contratos editoriales permanecen intactos.

## Pruebas y limitaciones
- Verificar consistencia y encabezado PNG de 25 archivos.
- Cotejar HTML y sintaxis JS, no sólo el peso.
- Probar GET 200/304 de agenda pública al cambiar sync_json y GET 304 de dashboard con CSP intacta.
- Ejecutar suite Node y Chrome con D1 aislada. No modificar D1 productiva ni secretos.
- Comparar con capturas reales antes/después; objetivos de ahorro, no promesa de latencia.
- CSP: no habilitar scripts externos para corregir recursos bloqueados no identificados.

## Distinción de imágenes
- El calendario 1080x1080 sigue usando imágenes editoriales, subidas y de biblioteca explícitas.
- La ficha pública usa categoría Twitch preferida, alias especiales sólo en excepciones acordadas y LED conservado.
