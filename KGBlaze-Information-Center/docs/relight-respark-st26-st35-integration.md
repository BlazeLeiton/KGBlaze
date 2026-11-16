# ReSpark 26–35 — catálogo: reconciliación e integración
Actualización técnica 2026-11-16; no reemplaza R8-FINAL/Nuclear v4 ni Stage25 Musical Script.

## Estado consolidado
- Registro actual de `main`: 115 obras; 127 versiones y 124 IDs de video según los controles previos a esta intervención. Tres audios reservados siguen privados.
- PRs 130–137: Brave Shine, Kirameki Rider, Marutah (Otome-domo yo), SINAY PAOHLA (adaptación Ryuusei), y adecuaciones de Blaze ya fusionadas. No volver a fusionar ni duplicar.
- El formato contextual de El Nano y El mismo sol ya está implementado: etiquetas compactas del explorador independientes del encabezado detallado.
- Arte autorizado de Sagrada Reset, Asterisk, Classroom of the Elite, GG, Ame y portadas Pokémon ya integrado, sin reabrir originales.

## Ajustes del presente lote
- Homologación ortográfica conservadora, sin cambiar vocablos ni métrica: aun así, tú interrogativo, futuro iluminará, pasado logré y pronombre mí. Segmentos coloreados se actualizan junto a sus fuentes.
- Se reparan verificadores de producción que seguían contando 50 tarjetas y solicitaban un evento antiguo de Signal. Se usan las 115 entradas vigentes o el inventario importado en lugar de cifras históricas.
- Nueva auditoría CI activada por rutas de música y no por nombres históricos de ramas: suite `npm test`, comprobación estricta de arte preservado y navegador móvil/escritorio ES/EN/JA para todas las fichas. La auditoría nunca reescribe portadas.
- Reglas adicionales de regresión para inventario, fichas, créditos y contexto sin publicar álbumes planeados.

## Alcance y pendientes que requieren evidencia no disponible
- La suite de Node y auditoría visual verifican estructura, no que un video externo continúe disponible o que coincida al oído con la grabación.
- La producción pública `/music/` requiere inspección HTTP después del despliegue. Un merge no prueba que Cloudflare haya actualizado el sitio.
- La autoría de la adaptación de Brave Shine continúa **atribuida por el creador** a Call Me Bury; evidencia externa independiente pendiente. Marutah y SINAY PAOHLA ya se conservan como autoras españolas de referencia.
- Diseño musical de Stage25/R17, audios y álbumes planeados no se publican ni importan sin autorización. Proyectos DNA y Navidad siguen no publicados.
- Examen a oído del repertorio completo y contraste literal con DOCX originales no se da por concluido sin archivos fuente o transcripciones, aunque las pruebas de catálogo estén correctas.
