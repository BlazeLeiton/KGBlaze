# Project Relight — Stage 41 · CP05 — Reconocimiento a bordo (Home)

Fecha de trabajo: 19-nov-2026, zona America/Mexico_City.

## Decisión del creador
La franja de reconocimiento a miembros de YouTube, suscriptores de Twitch y otros apoyos mensuales va **al final del Hero, debajo de ambos reproductores** tanto en escritorio como en móvil. No sustituir ni reconfigurar las Terminales A y B; no añadir tarjetas promocionales, botones ni enlaces de acción. La distribución del futuro carrusel queda definida (selector vertical desktop, horizontal mobile), pero **mensajes, imágenes y promociones todavía NO están aprobados**. No publicarlos por anticipado.

## Integración CP05
Una única franja plana y compacta dentro del Hero, inmediatamente después de la cuadrícula de reproductores. Textos:
- ES: «Gracias por acompañar el viaje» / «Miembros de YouTube · Suscriptores de Twitch · Apoyos recurrentes».
- EN: «Thank you for being part of the journey» / «YouTube members · Twitch subscribers · Recurring supporters».
- JP: «一緒に旅してくれてありがとう» (*Issho ni tabi shite kurete arigatō*, «gracias por recorrer juntos el viaje»), «YouTubeメンバー · Twitchサブスクライバー · 継続サポーター» (*Yūchūbu menbā · Twitch sabusukuraibā · keizoku sapōtā*, miembros de YouTube / suscriptores de Twitch / apoyo recurrente). Conserva el sistema de idiomas compartido ya integrado.
Diseño sin ficha separada, fondo azul translúcido, línea divisoria tenue, icono de corazón, textos pequeños. La franja no rota con el carrusel ni empuja un bloque extra antes de las Terminales.

## Privacidad y contenido futuro
Esta primera entrega es una franja de agradecimiento **sin nombres reales, contadores ni equivalencias de pago**; no afirma haber obtenido datos de APIs, no expone identidades ni suscripciones. La futura consola y los registros requieren especificación independiente, alias aprobados y exclusión voluntaria/consentimiento antes de publicar nombres. Nunca inferir autorización pública sólo por pertenecer a una membresía. Reconocer suscripciones de regalo por separado de pagos recurrentes cuando aplique. Evitar anuncios engañosos de actividad.

## Pruebas de aceptación
Se amplía la prueba Chrome de geometría a escritorio y móvil: verificar posición después de la última terminal, altura compacta y ausencia de desbordamiento. También se comprueban el orden del DOM, los datos ES/EN/JA y que no se ha añadido una tarjeta promocional.
