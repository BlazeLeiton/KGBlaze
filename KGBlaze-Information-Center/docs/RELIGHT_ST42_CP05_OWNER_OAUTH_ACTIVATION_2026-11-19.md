# Project Relight — Stage 42 · CP05 · Activación de infraestructura OAuth del propietario

Fecha: 2026-11-19, America/Mexico_City.

## Precondiciones verificadas antes de activar
- La PR #197 quedó fusionada mediante squash en `main`: commit `dda9b670e193ec66306c0b55d15e7d8a4e4e4343`.
- Cloudflare Workers Builds confirmó `kgblaze-terminal` exitoso con versión `d99cb638-ac47-450e-a1d1-3e1903eb7fd7`.
- GitHub Actions en `main`: 483/483 pruebas aprobadas.
- Verificación pública desde GitHub Actions de Home, Terminal, health, agenda y rutas privadas aprobada (PR #198; workflow read-only).
- El propietario creó manualmente las dos tablas privadas D1: `recognition_twitch_oauth_states` y `recognition_twitch_oauth_credentials`; consultas de `sqlite_master` confirmadas y Bookmark Time Travel generado.
- Cloudflare Settings mostró `TWITCH_RECOGNITION_BROADCASTER_ID=70386764` y `RECOGNITION_TWITCH_TOKEN_KEY_B64` como Secret, Value encrypted. El valor secreto NO fue leído, copiado ni compartido.
- App original `KGBlaze Integrated Services`, Client ID y Client Secret ya vigentes, callback histórico `https://kgblaze.dpdns.org/twitch/oauth/callback`.

## Acción CP05
- Configurar `RECOGNITION_TWITCH_OAUTH_ENABLED = "true"` en `wrangler.toml` bajo `[vars]`. Se despliega por la integración de GitHub con Cloudflare **al fusionar**, no antes.
- Mantener rutas privadas tras `ADMIN_TOKEN`, callback con estado SHA-256 de un solo uso y tokens AES-256-GCM en D1.
- **No se obtiene automáticamente un token de usuario** y no se consulta ni publica ninguna lista de suscriptores.
- El endpoint callback sin `state` debe responder HTTP **400**, rechazando el intento antes de D1/Helix; el endpoint administrativo de estado sin bearer debe responder **401**, el alias administrativo de raíz **404**.
- El cambio conserva el cron de Terminal y los módulos de YouTube, Home y Rebel Mix sin ajustes.

## Puertas de aprobación
1. PR con preflight y tests aprobados y comparación sin conflictos; verificar check de Cloudflare Builds.
2. Smoke HTTP externo sin credenciales tras desplegar: Home, Terminal, health, agenda, callback 400, admin 401/404.
3. **Autorización Twitch real pendiente:** solo el propietario puede conceder el scope `channel:read:subscriptions` mediante la pantalla oficial de Twitch. El inicio debe ejecutarse a través de POST privado `/departures/api/admin/recognition/twitch/start` utilizando un ADMIN_TOKEN que no debe enviarse por chat, a GitHub o a la consola pública. La URL de autorización contiene un estado CSRF; tampoco se comparte.
4. Una vez autorizado, consultar solo el endpoint privado de estado; no leer suscriptores ni publicar alias antes de contar con consentimientos independientes.
5. Si falla, establecer flag `false` y desplegar para bloquear nuevas autorizaciones; si se habían almacenado credenciales, además usar endpoint privado `disconnect`.

## Límites
Esta etapa únicamente habilita la **infraestructura de consentimiento del propietario**. No constituye aprobación para capturar datos de espectadores, crear listas, mostrar nombres ni realizar automatizaciones. La propiedad del ID de Twitch se verifica mediante la validación oficial de OAuth y debe fallar cerrado si `user_id` no coincide con `70386764`.
