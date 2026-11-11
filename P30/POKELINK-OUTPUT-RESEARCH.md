# P30 — Entrega de datos a temas PokéLink: salida OBS viable sin API privada

**Fecha:** 2026-11-11 · **Estatus:** investigación documentada; no existe receptor P30 compilado.

## Hallazgo comprobado

**souldew** (GPL-3.0; https://github.com/souldewapp/souldew) implementa un puente que expone un **servidor local compatible con los temas de PokéLink**, incluso sin usar la aplicación PokéLink como intermediaria. Documentación pública: <https://github.com/souldewapp/souldew/blob/main/docs/STREAMING.md>.

- Protocolo: **Socket.IO cliente 2.x, Engine.IO 3**, puerto por defecto **127.0.0.1:3000**, configurable.
- Los temas de <https://github.com/pokelinkapp/pokelink-web-sources> se abren con parámetros similares a `?user=Robin&server=http://127.0.0.1&port=3000`.
- Eventos documentados:
  - `client:players:list` al conectarse (estado inicial: jugadores, party, trainer, badges)
  - `client:party:updated` cuando cambia el equipo
  - `player:trainer:updated` cuando cambian medallas/progreso
  - `player:party:death` solo si se usan reglas de Nuzlocke; **no se necesita** en Pokémon Journeys.
- Los objetos de Pokémon incluyen especie, nombre, nivel, HP actual/máximo, condiciones `psn/slp/par/frz/brn`, shiny y datos opcionales.

**Esto constituye un precedente real del lado de los overlays, no una prueba de lectura desde hardware DS/3DS.** No se ha comprobado aún qué formatos específicos esperan todas las fuentes de OBS configuradas por el usuario.

## Arquitectura P30 propuesta

```text
2DS real — plugin 3GX (X/ORAS/SM/USUM) O instrumentación TWL/nds-bootstrap (DS)
          |  equipo + HP + estado + progreso; mensajes compactos
          v
PC — receptor P30 (Python u otra implementación)
          |  validación / detección de cambios / traducción
          +----> Opción 1: integración con plugin/API de la app PokéLink (NO validada)
          |
          +----> Opción 2: servidor Socket.IO compatible con temas PokéLink
                         |  client:party:updated / player:trainer:updated
                         v
                     Fuentes de navegador OBS existentes
```

La opción 2 es la **ruta de menor incertidumbre** para alimentar *temas web de PokéLink*. Permite desarrollar y simular todo el lado PC sin encender la 2DS. No equivale a editar el estado interno del cliente PokéLink: el usuario podría seguir usando el programa manual por separado y seleccionar qué fuentes de OBS consumen el puente; comprobar colisiones de puerto. **No sobreescribir ni desactivar controles manuales existentes.**

## Prueba PC inicial (sin consola)

1. Revisar qué tema web existente usa el usuario y qué eventos escucha, sin cambiar el diseño.
2. Crear un servidor local de prueba compatible con Socket.IO 2.x/Engine.IO 3; enviar un paquete simulado de seis Pokémon.
3. Validar el estado inicial, cambios de orden/especie, HP, veneno/parálisis/quemadura/desmayo y medallas en OBS.
4. Para Alola, investigar si las fuentes de OBS ya admiten representación de cristales Z; si no, necesitaríamos adaptar únicamente el componente visual de progreso del tema, **sin rehacer la Pokédex**.
5. Medir carga del PC y conexión antes de recibir mensajes reales de hardware.

## Fuentes para implementar sin copiar código innecesariamente

- souldew, streaming: <https://github.com/souldewapp/souldew/blob/main/docs/STREAMING.md>
- API alternativa souldew (solo lectura / SSE, sirve como ejemplo de eventos): <https://github.com/souldewapp/souldew/blob/main/docs/STREAM_API.md>
- Tema oficial fuente: <https://github.com/pokelinkapp/pokelink-web-sources>
- Eventos del tema histórico: <https://github.com/Cysha/pokelink-web/blob/master/themes/template/readme.md>

## Riesgos y estado

- No se ha probado aún la app PokéLink en modo de entrada externo; no asumir una API escribible.
- Compatibilidad del servidor 2.x/3 frente a clientes 4.x requiere ensayo por versión de tema.
- No abrir el puerto a Internet; servidor `127.0.0.1` para fuentes OBS locales.
- Enlace 2DS→PC es independiente: **la fuente de datos en hardware sigue sin probar**.
- Si se reutiliza código, respetar licencias y atribución. La documentación del protocolo sirve de base para implementación original.

**Siguiente desarrollo:** prueba local simulada de Socket.IO con el tema web real antes de instalar cualquier plugin de lectura en la 2DS.
