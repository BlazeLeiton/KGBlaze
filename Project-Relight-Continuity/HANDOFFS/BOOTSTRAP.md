# Bootstrap operativo — Project Relight / Stage 4
**Corte:** 2026-10-12 (America/Mexico_City) · **Stage vigente:** 4 (ABIERTA) · **No crear Stage 5 por cambiar de chat.**
**Uso:** entrada breve, NO sustituye recuperación profunda KGRP v3.2.

## Fuentes antes de actuar
1. `../INITIALIZATION.md` (fases 0–6) y `../CONTEXT-CONTINUITY.md` (mantener bajo control la longitud de chats).
2. `../STAGES/index.json` + las cuatro fichas `STAGES/STAGE-01..04.md` (la 4 última; todas sin cierre de chat formal acreditado).
3. `CURRENT.md`, `../DECISIONS.md`, `../QUESTIONS.md`, `../TEMPLATES/README.md`, informes `../AUDITS/`.
4. Para código, leer el estado actual y SHA de `KGBlaze-Information-Center/`. No publicar datos privados ni inferir despliegue.

## Contexto crucial en una pantalla
- **Stage 1:** auditoría externa de YouTube/Twitch reportada completada como trabajo; estrategia «IP puerta → Blaze hogar»; métricas internas → X → Pokémon Journey (aplazado a noviembre de 2026).
- **Stage 2:** siete paneles de Twitch reportados publicados; editor operativo privado, importación ICS/JSON, limpieza sin HIATUS, ES/EN/JA, exportaciones y visor público SEPARADO.
- **Stage 3:** código versionado de visor/Worker/D1 en `KGBlaze-Information-Center/`; base D1 `kgblaze-terminal` vinculada, esquema remoto/despliegue/polling externo NO verificados como activos.
- **Stage 4:** auditorías histórica, archivística, perfiles, agenda y métricas; Cake Song demo aún pendiente (deadline 31-oct), Azur Lane 21/22 **reservas sin hora**, Carrd oficial confirmado, ICS Twitch conservado sin cambios. Último ajuste de Stage 3: SOFTWARE **Terminal**; título público **Terminales A y B**, traducciones EN/JA históricas. Visor GitHub corregido y probado en local; editor v23.11 corregido sólo en archivo privado derivado. Ninguna prueba de producción.
- **Límite de chat:** no hay contador fiable de contexto ni memoria literal completa. Leer referencias de forma selectiva, registrar deltas al completar cada hito, no volcar HTML de megabytes ni transcribir todas las auditorías por turno.

## Precedencia y seguridad
Intención: última corrección explícita del usuario en el alcance afectado. Técnica: código/commit actual. Comportamiento: prueba reproducible. Producción: evidencia del servicio. Distinguir `SOLICITADO`, `IMPLEMENTADO`, `PROBADO`, `DESPLEGADO`. `kgblaze_terminalb_board_v3_202610` es sólo clave LEGACY de migración del editor, no marca pública.

## Siguiente tarea real (no elegir por cuenta propia)
El usuario seguirá indicando qué componente priorizar. No desplegar Terminal ni modificar editor, agenda, perfiles, D1 o automatizaciones por el mero comando Respark; no repetir preguntas ya respondidas. Al cambiar de tema, agregar **delta verificable** al Stage 4 y handoff. Cuando exista declaración explícita de Stage 5, crear su ficha conservando los cuatro previos.

## Última prueba real — recuperación de interrupción Stage 4 (12-oct-2026)
- GitHub Actions [run #38337375637](https://github.com/BlazeLeiton/KGBlaze/actions/runs/38337375637): `kgrp.py audit` PASS, `latest_stage=4`, verificador títulos ES/EN/JA PASS, `npm test` **18/18 PASS**. CI restringido a cambios de registro o código (y disparo manual), no cada anotación cotidiana.
- HTML `Terminal_Operativo_v23_11_encabezado_corregido.html` en Biblioteca: ES visible; ES/EN/JA canvas; `LEGACY_STORE` sólo lee configuración antigua. No se obtuvo copia autorizada de bytes para E2E nuevo.
- Último tramo Stage 4 y pruebas documentados en `../AUDITS/RESUME-STAGE04-TERMINAL-2026-10-12.md`. No hubo despliegue. Stage 4 sigue ABIERTA, nombre software Terminal ≠ título aeroportuario Terminales A y B.
