# Política de contraste directo — métricas
**Preferir enlace exacto, canal ID, video ID o endpoint oficial**, no resultados de búsquedas indexadas.

Fuentes:
- Canal: https://www.youtube.com/channel/UCRd_uwPjrsf6Z3CRXwNehEQ
- Twitch: https://www.twitch.tv/blazeleiton
- Videos directos: https://www.youtube.com/watch?v=33t9Oepkgiw ; https://www.youtube.com/watch?v=BZ9ySgeoquU ; https://www.youtube.com/watch?v=8sAotUCAJH8 ; https://www.youtube.com/watch?v=q-VNe3pVXYU
- Connect: https://www.youtube.com/watch?v=KY678pt_GK0
- Miniaturas: `https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg` (puede no existir tamaño máximo).

## Registro necesario por métrica
`source URL/id | fuente primaria/tercero | captured_at | window_start/end | scope (public/private, videos/streams/shorts, ocultos o no) | definition | unit | value | filters | status`.

## Reconciliación
1. Conservar Studio/Analytics exportados como evidencia del periodo del archivo.
2. Obtener contador público por ID exacto o API oficial cuando haya acceso.
3. Comparar números **sólo si** fecha, ventana, alcance y unidad son realmente compatibles. Evitar llamar tendencia a un mero desacuerdo de contadores.
4. CTR e impresiones son internos; suscriptores netos ≠ suscriptores públicos redondeados; vistas de video ≠ vistas agregadas de canal.
5. Twitch: `Live Views` ≠ `Unique Viewers` ≠ viewers promedio; `Follows` no es el total de seguidores.
6. No publicar ingresos ni registros individuales de analíticas privadas en GitHub.

## Conectividad constatada 12-oct-2026
- Consulta directa por ID en vidIQ: FUNCIONÓ, snapshots públicos de canal y cinco videos.
- TubeAlfred: FALLÓ sin créditos; no retornó datos.
- Apertura web directa YouTube/Twitch: NO accesible en este entorno; conservar URL canónica, sin alegar acceso real.
- Fuentes públicas Twitch: ningún corte comprobable; no inventar números.
