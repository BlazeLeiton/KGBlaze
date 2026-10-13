# Registro recuperable de archivos y formatos
Biblioteca de ChatGPT; fuentes encontradas el 12-oct-2026. No contiene bytes originales ni IDs privados de cuenta.

| Categoría | Registros encontrados | Fuentes clave |
|---|---:|---|
| HTML | 49 | operativo privado v23.5, v23.9, v23.10, v23.11; visor v3.1; siete paneles |
| CSV | 8 | YouTube Studio, Twitch Analytics 2024–2026, Steam biblioteca/wishlist |
| XLSX | 21 | calendario octubre–diciembre v1–v12, conciliados 11-oct |
| PPTX | 4 (nombres repetidos) | presentaciones de referencia Aeroméxico |
| PDF | 3 (incluye duplicado) | Aeroméxico Brand Book; United Quick Guide |
| DOCX | 2 (duplicados) | hoja membretada |
| PNG/JPG/WebP | más de 100 | recursos de paneles, portadas, iconos, arte; paginación pendiente |

## Entradas clave ubicadas en Biblioteca
- `/Project Relight/Terminal_Operativo_v23_11_local.html`: **privado; NO subir a GitHub**.
- `/Project Relight/TerminalB_Operativo_v23_10_local.html`: referencia anterior.
- `/Project Relight/TerminalB_Tablero_Salidas_Funcional_v23_9_prioridad_y_cierre.html`: lógica de cierre.
- `/Project Relight/TerminalB_Tablero_Salidas_Funcional_v23_5_controles_semana_respaldo.html`: antiguo maestro aprobado.
- `/Project Relight/TerminalB_Visor_Publico_v3_1_reglas_5_semanas.html`: vista pública de referencia.
- `/Project Relight/KGBlaze_Twitch_Paneles_Maestro_v1-1.html`: 7 paneles.
- `/Project Relight/Blaze_Calendario_Operativo_Oct-Dic_2026_v12.xlsx`: calendario operativo.
- `/Project Relight/Project_Relight_Calendario_Conciliado_2026-10-11.xlsx`: conciliación histórica.
- `/Table data content.csv`: YouTube Studio (privado).
- `/Analytics and Revenue by day from Jun_14_2024 to Sept_30_2026.csv`: Twitch diario (privado).
- `press_NEWAM_24.pptx`, `press_AMNEW.pptx`, `AM Brand Book ...pdf`, `UA_Quick_Guide_122222.pdf`: terceros, sólo consulta/referencia.
- `hoja_membretada.docx`: plantilla documental, origen por verificar.

### Custodia
Biblioteca contiene los archivos originales, pero las herramientas de materialización rechazaron crear copia binaria de cinco HTML. `Localizado` ≠ `materializado` ≠ `archivado en copia`. Para futuras copias privadas: registrar checksum, tamaño, versión, fecha, fuente, permisos y relación con etapa; no incluir tokens, respaldos operativos o analíticas personales en un repositorio público.

## Cuarta revisión — procedencia del calendario extendido y Steam
- Biblioteca contiene `Project_Relight_Calendario_Operativo_23Nov_San_Luis_Potosi_Dia_Bloqueado.xlsx`, `Project_Relight_Calendario_Operativo_Actualizado_Viaje_2026-11-23.xlsx` y `Project_Relight_Calendario_Steam_CSV_Originales_2026-10-12.xlsx`: hojas derivadas de **18 pestañas**, en lugar de los 7 tabs del calendario v12. No difundir detalles de compromisos personales en la documentación pública ni en visor.
- También hay `Project_Relight_Calendario_Operativo_Rastreos_GP_2026-10-11.xlsx`: registro histórico de seguimiento combinado.
- Se confirmó por comparación documental y tarea existente la existencia de **seis CSV originales Steam**, con biblioteca personal, wishlist y cuatro bibliotecas familiares. `family sharing` indicado no garantiza derecho de juego vigente; propiedad/listado/wishlist son nociones distintas.
- La biblioteca contiene originales de `Terminal_Operativo_v23_11_local.html`, PDFs/PPTX de terceros y hojas de Analytics, pero todavía **no** hay exportación íntegra autorizada de sus bytes al repositorio documental. No marcar como almacenados aquí.


## Artefactos Terminal tras aclaración del encabezado público (Stage 4)
- **Original privado ubicado:** `Terminal_Operativo_v23_11_local.html` en Biblioteca (4575890 bytes indexados). No es un archivo del repositorio público y no se sobrescribió.
- **Extracción para trabajar:** 1216 líneas recuperadas por índice en dos rangos; se ensambló un HTML completo, pero no se obtuvo el archivo binario original autorizado byte por byte (diferencia de 2 bytes). Un derivado conserva todo el texto y scripts extraídos y restaura la cabecera pública ES/EN/JA. `node --check` PASS.
- **Visor canónico GitHub:** `KGBlaze-Information-Center/public/index.html` (el archivo masivo, no el visor de Biblioteca v3.1). Restauración aplicada mediante acción de GitHub a ese blob, con 5 transformaciones exactas; no se publicó servicio.
- **Traducido histórico:** versión de visor v3.1 de Biblioteca mantenía los términos `TERMINALES A Y B`, `TERMINALS A & B`, `ターミナルA・B`. Este testimonio prevalece sobre traducciones inventadas.
- El archivo corregido de editor se entrega como derivado privado descargable en la conversación, NO como commit público.
