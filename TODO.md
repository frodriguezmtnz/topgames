# TODOs — TopGames (clon de outbid.lol para videojuegos)

Pendientes por prioridad. Hecho hasta ahora en Fases 1-2: Next.js 16, Prisma (SQLite local),
motor de pujas y checkout/webhook con Lemon Squeezy (modo mock para local).

---

## 1. Pagos / cuenta (crítico, bloquea producción)

- [x] Decidir proveedor final: **Lemon Squeezy** (elegido).
- [x] Crear cuenta y dar de alta producto "Puja en TopGames" (producto con precio fijo €5,
      variant Default). Para pujas variables se usa `custom_price` por API.
- [ ] **Pendiente**: en el dashboard, cambiarlo a **"Pay what you want"** (precio min $5) si quieres
      que el checkout muestre el precio editable. Con `custom_price` por API funciona igual.
- [x] Configurar webhook (URL: `https://topvideogames.lol/api/webhooks/lemonsqueezy`) con secreto.
- [x] Rellenar env vars: `LEMON_API_KEY`, `LEMON_STORE_ID=457587`, `LEMON_VARIANT_ID=2046359`, `LEMON_WEBHOOK_SECRET`.
- [x] Probar creación de checkout real por `/api/bid` (devuelve URL de LS).
- [ ] **Pendiente**: pago real de $5 de principio a fin (probarlo contra producción o local con `PAYMENT_MOCK=0`).
- [ ] Si se elige Paddle al final: adaptar `src/lib/pay/lemonsqueezy.ts` (tabla `Payment.provider` lista).
- [ ] **Seguridad (hacer tras validar el flujo):** rotar `LEMON_API_KEY` en Lemon Squeezy (se pegó por
      chat en su día) y actualizarla en `.env` local + Vercel. Verificar que `.env.example` solo
      contiene placeholders/valores inventados (`Store/Variant ID` falsos) y que `.env` real está
      en `.gitignore`.

## 2. Fase 3 — Frontend del leaderboard

- [ ] Página principal: hero + formulario de puja (URL, nombre, importe, botón «Outbid»).
- [ ] Tarjetas del ranking: cover, nombre, enlace, puja, posición, botón "claim".
- [ ] Secciones "Trending ahora" y "Actividad reciente" (feed de payouts).
- [ ] Páginas **/about** y **/rules** (calca el tono del original).
- [ ] SWR (ya instalado) para refrescar el ranking por polling.
- [ ] Diseño oscuro minimalista, favicon, metatags SEO.

## 3. Fase 4 — Deploy + dominio

- [x] Crear DB Postgres (Neon) y apuntar `DATABASE_URL` (endpoint `-pooler`).
- [x] `prisma migrate deploy` contra Neon (tablas creadas) + `db:seed` (ranking demo).
- [x] Auto-descubrir Store/Variant ID por API (457587 / 2046359) y ponerlos en `.env`.
- [x] Crear checkout real por `/api/bid` validado contra LS.
- [x] Desplegar en Vercel (`https://topgames-pi.vercel.app`). Board/activity/home OK.
- [x] Añadir `try/catch` a `/api/bid` para que los fallos de LS devuelvan JSON claro (no 500 en blanco).
- [ ] **Pendiente**: pushear el fix del checkout (`daaa8dc` local → `origin/main`) para que Vercel
      use el formato correcto (`checkout_data` como objeto con `custom_price` a nivel superior).
- [ ] **Pendiente**: dominio `topvideogames.lol` al Vercel (DNS).
- [ ] **Pendiente**: pago real de $5 y verificar webhook sube el puesto.
- [ ] Comprobar `LICENSE_MOCK=0` y `APP_URL=https://topvideogames.lol` en Vercel (Production).

## 4. Robustez / seguridad (después del MVP)

- [ ] Reemplazar el rate-limit en memoria (`src/app/api/bid/route.ts`) por
      **Upstash Redis** (el de memoria no funciona bien en serverless).
- [ ] Click tracking real: crear `/api/redirect` que cuente `Game.clicks` y redirija.
- [ ] Validación extra de URLs (scrape ligero, prevenir SSRF).
- [ ] Tests unitarios (planBid, applyPaidOrder idempotencia).
- [ ] Limpiar el seed demo antes del lanzamiento (borrar los 7 juegos de prueba).
- [ ] Analytics propio (plaúsculo o tercero) para la página /about.

---
Estado: Fases 1-2 completas · siguiente: **Fase 3 (frontend)** y decidir proveedor de pago.