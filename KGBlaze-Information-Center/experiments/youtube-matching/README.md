# YouTube Matching — Dry Run (sin producción)

Código experimental independiente de Terminal. **No se importa desde `src/worker.mjs` ni desde el visor**. Sólo se evalúa mediante pruebas Node en `tests/youtube-matching.test.mjs`.

## Contrato
- Entrada: eventos editoriales `{id,day,time,title,status,platforms,videoId?}`, objetos tipo respuesta YouTube `videos.list` (`id`, `snippet.channelId/title/liveBroadcastContent`, `liveStreamingDetails.scheduledStartTime`) y `ownedChannelId` **configurado por una fuente independiente de los candidatos**.
- Salida: `{decision:'candidate'|'review'|'none'|'skipped',reason,videoId?}`. **Nunca** `verified`, `matchConfirmed` ni `status` de observación.
- Primero ID editorial explícito; incluso entonces exige propiedad del canal y recurso de transmisión; una reprogramación conserva identidad.
- Sin ID explícito exige título distintivo, horario en zona `America/Mexico_City`, canal correcto y sala de transmisión. Margen provisional ±90 minutos. Cambio de 91 minutos a 48 horas = revisión humana. Cambios mayores no se asignan.
- Descarta videos regulares, ajenos al canal, episodios numerados diferentes y colaboraciones no declaradas. Dos salas parecidas y un mismo video reclamado por dos eventos generan revisión, no confirmación.
- Si la agenda carece de hora, no basta el título. `publishedAt` de YouTube **no se usa** como hora de la emisión.
- `CANCELADO`, `DESCANSO`, `ESCALA`, `HIATUS` y eventos sin plataforma `yt` no reciben coincidencias propuestas.

## Importante
Este matcher trabaja **sólo en memoria**. No contiene claves, URL de cuenta, API, fetch, Cron, escritura D1, edición de calendario ni integración con el visor. Los datos de los tests son inventados. Un resultado `candidate` es una propuesta que todavía necesita verificación de proveedor y revisión de conflictos antes de cualquier futura integración.

Para ejecutar la suite desde `KGBlaze-Information-Center/`: `npm test`. La prueba se añade al total de CI en una rama y PR **borrador**; no debe fusionarse ni desplegarse sin autorización independiente.

Campos YouTube de referencia: https://developers.google.com/youtube/v3/docs/videos
