# Project Relight — Stage 42 CP07 · Corrección de Twitch OAuth en Cloudflare Workers

Fecha: 2026-11-19 (America/Mexico_City). Regresión inicial observada como código `TW-10` en el callback durante los intentos reales de autorizar Twitch.

## Causa confirmada

El código de `src/recognition-twitch-oauth.mjs` usaba `redirect: 'error'` en las solicitudes de intercambio OAuth (POST `/oauth2/token`) y validación (GET `/oauth2/validate`). `src/recognition-twitch-connection.mjs` también lo usaba en revocación (POST `/oauth2/revoke`).

**Cloudflare Workers no implementa `redirect: 'error'` y lanza un `TypeError` cuando construye la solicitud, antes de contactar a Twitch.** Node.js acepta esa modalidad, por eso las 488 pruebas de Node.js no detectaron el problema. Documentación oficial: https://developers.cloudflare.com/workers/runtime-apis/request/#constructor

El error ocurría dentro de `exchange()`, donde era atrapado y se clasificaba como `TW-10` (excepción de proveedor). No es evidencia de que ID, Client Secret, scope o conexión a red sean incorrectos. **Nunca se debe registrar el código, state o token para diagnosticarlo.**

## Corrección

- Cambiar las tres solicitudes a `redirect:'manual'`, que sí implementa Cloudflare Workers.
- Continuar rechazando respuestas de redirección: `response.ok` es falso en HTTP 3xx para exchange/validate; revocación solo informa `access_token_revoked` al recibir HTTP 200, cualquier 3xx permanece `unconfirmed`.
- Añadir al preflight fuente estática verificaciones de que no exista `redirect:'error'` en los módulos privados de Twitch y que las tres operaciones usen `manual`.
- Añadir pruebas de flujo de token y validación, bloqueo de 302 en ambos endpoints y revocación segura con 302.
- Sin alterar D1, variables de Cloudflare, OAuth Client ID, cifrado, inicio administrativo, protección CSRF, alcance de permisos o listas de suscriptores.

## Despliegue y prueba

1. Verificar CI, fusionar PR CP07, confirmar Cloudflare Workers Builds `success`.
2. Repetir smoke público anónimo en producción: Home, Terminal, health/D1, agenda y protección de endpoints (sin revelar credenciales).
3. **El propietario necesita iniciar nuevamente** el POST privado `/departures/api/admin/recognition/twitch/start` y aceptar autorización en Twitch; el estado/código de intentos anteriores no es reutilizable.
4. Comprobar `/departures/api/admin/recognition/twitch/status` mediante el mismo Bearer `ADMIN_TOKEN` en el equipo del propietario. Solo considerar conectado cuando `connected:true`; nunca exponer el token en chat.
5. Si surgiera otro código TW-XX, investigarlo sin suponer que se trata del mismo error; no cambiar secretos sin evidencia.

## Seguridad

En particular, nunca utilizar `redirect:'follow'` para solicitudes que llevan códigos de autorización, Client Secret o bearer tokens; ello podría reenviar datos sensibles a un destino redirigido. El modo `manual` y el rechazo explícito de HTTP 3xx evitan esa superficie.
