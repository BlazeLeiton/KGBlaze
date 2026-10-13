# Stage 4 — Segunda auditoría archivística y contrastiva
Fecha: 12-oct-2026. Esta auditoría complementa, **no reemplaza**, la primera. Fuentes: archivos recuperables en Biblioteca, CSV originales, código local indexado y GitHub, conectores por ID.

## Hallazgos
- Biblioteca: **49 HTML, 8 CSV, 21 XLSX, 4 PPTX registrados (duplicados), 3 PDF (duplicado), 2 DOCX y 100+ imágenes**; imagenes pendientes de paginación.
- Encontrado el HTML privado `Terminal_Operativo_v23_11_local.html` (~4.58 MB), además de v23.10, v23.9, v23.5 y archivos más antiguos. Los bytes **no pudieron materializarse** fuera de Biblioteca por falta de ruta autorizada; texto interno sí fue consultado. No hay copia binaria en este repositorio.
- v23.11: usa `Terminal`, `X-Terminal-Week`, endpoint `/api/admin/preview`, `/api/admin/publish`, control de revisión y migración de `localStorage` desde `kgblaze_terminalb_board_v3_202610` hacia `kgblaze_terminal_board_v3_202610`. v23.10 utilizaba `X-TerminalB-Week`; incompatibilidad corregida en v23.11.
- v23.9 admitía evidencia alternativa para fin YouTube; v23.10/v23.11 exigen específicamente `lifeCycleStatus==='complete'` con verificación. Twitch mantiene 15 minutos de gracia.
- v23.11 conserva controles de vaciar semana (distinto de HIATUS), limpiar campos, biblioteca de imágenes, idiomas, JSON, PNG/GIF, consulta y publicación. **Se inspeccionó código, no se ejecutó E2E en navegador ni publicación real**.
- Riesgos: `todayLocalISO()` emplea zona del navegador, no forzosamente CDMX; revisar bloqueos heredados y proceso de migración antes de declararlo seguro.
- Calendario operativo v12 y conciliado 11-oct: diferencias entre emisiones históricas realizadas y otras programadas para días posteriores. Precedencia: confirmación explícita usuario > ICS actual > plan anterior; Pokémon Journey en noviembre, no como estreno confirmado.
- Se identificó maestro HTML de siete paneles y recursos de plantillas, así como presentaciones de marca externas que son **referencias y no autorizan redistribución**.
- CSV YouTube Studio privado: 501 registros por video + fila agregada; Twitch CSV diario: 839 observaciones (incluye días sin stream). Sus métricas internas tienen alcance diferente al dato público.
- Fuente directa por canal ID (vidIQ) recuperó corte público del canal para 12-oct-2026; consulta por IDs recuperó cifras de videos. Web directo YouTube/Twitch no fue accesible; TubeAlfred devolvió créditos insuficientes. Comparación sin mismas ventanas/definiciones = **NO COMPARABLE**.

## Auditoría y pruebas
| ID | Comprobación | Resultado |
|---|---|---|
| S4-R2-01 | Localización de documentos y versiones | REALIZADA, imágenes parciales |
| S4-R2-02 | Revisión estática de v23.11 frente a v23.10 y v23.9 | REALIZADA, E2E pendiente |
| S4-R2-03 | Bibliotecas CSV y XLSX revisadas por su contenido | REALIZADA, análisis completo posterior |
| S4-R2-04 | Contraste directo público por canal/video ID | PARCIAL, distinto alcance |
| S4-R2-05 | Exportación íntegra de archivos privados | BLOQUEADA por permisos del sistema |
| S4-R2-06 | Recuperación e índice de plantillas | DOCUMENTADA y versionada |

**Política permanente:** toda recuperación Stage 1..N constará de pasada histórica, **segunda auditoría de archivos/decisiones/versiones** y contraste público directo cuando haya métricas; nunca inferir publicación, copia de bytes, ni funcionamiento a partir de metadatos.
