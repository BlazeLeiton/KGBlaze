# Terminal: URL pública /departures

**Destino:** https://kgblaze.dpdns.org/departures/

**Situación inicial:** DigitalPlat registró `kgblaze.dpdns.org`; el propietario confirmó que la zona de Cloudflare está activa. Esto NO significa que el dominio ya esté asociado al Worker.

## Arquitectura
- Reutilizamos el Worker `kgblaze-terminal`, D1 y Cron ya productivos.
- El dominio `kgblaze.dpdns.org` se añade como **Custom Domain del Worker completo**. Cloudflare Custom Domains no reciben sufijos de ruta.
- El Worker redirige `/` temporalmente a `/departures/`, sin sacrificar la futura posibilidad de un portal general en la raíz.
- `/departures` redirige permanentemente a `/departures/`.
- `/departures/` entrega el visor existente; `/departures/api/public` y `/departures/api/health` exponen lecturas públicas. Los recursos estáticos y la imagen social usan el mismo prefijo.
- **Alias público temporal:** el HTML vigente aún utiliza `fetch('/api/public')`; permitimos `/api/public` (y `/api/health`) desde el nuevo hostname sin exponer endpoints administrativos. La API canónica nueva queda en `/departures/api/public`. Retirar los alias sólo después de modificar y probar el HTML en una entrega posterior.
- `/api/admin/*` y `/departures/api/admin/*` son 404 en el nuevo hostname; el editor operativo privado mantiene la URL `workers.dev`.
- No se edita el HTML de 4,5 MB para esta migración y la URL anterior conserva todas sus rutas.

## Implementación y verificación
1. Ejecutar la suite `npm test` y los checks del PR. Inspeccionar los cambios antes de fusionar.
2. Integrar el commit de aplicación después de comprobar CI y que el despliegue GitHub→Cloudflare del Worker termine SUCCESS; mantener la revisión editorial y los 10 eventos sin cambios.
3. En Cloudflare abrir `Workers & Pages → kgblaze-terminal → Settings → Domains & Routes → Add → Custom Domain`; escribir exactamente **`kgblaze.dpdns.org`**. Cloudflare gestiona DNS y HTTPS; no crear registros falsos A/AAAA.
4. Probar sin credenciales: `https://kgblaze.dpdns.org/` redirige a `/departures/`; la página abre; `/departures/api/health` devuelve `ok:true,database:true`; `/departures/api/public` y `/api/public` devuelven `revision:2`, 10 salidas y observaciones verificadas. El endpoint `/departures/api/admin/snapshot` debe ser 404.
5. Probar ES/EN/JA, fichas de YouTube, vista móvil, consultas periódicas, enlaces, parámetros `?flight`, `?embed`, y la imagen social si está publicada. El editor privado no cambia de URL.
6. Compartir la dirección nueva sólo tras comprobar HTTPS y funcionalidad. La URL anterior `workers.dev` queda como acceso alternativo.

## Recuperación ante incidencias
- Si falla únicamente el dominio, desvincular el Custom Domain; conservar `workers.dev`, agenda, D1 y Cron.
- Si hay una regresión del propio Worker, comparar los Deployments y restaurar deliberadamente la última versión verificada.
- **Nunca** borrar la base, republicar una revisión editorial ni desactivar YouTube para comprobar el cambio de dirección.
- La solicitud `vlatam.eu.org` sigue separada y pendiente de aprobación.

Docs Cloudflare: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
