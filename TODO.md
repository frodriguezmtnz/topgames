# TODOs — TopGames (clon de outbid.lol para videojuegos)

Pendientes por prioridad. Hecho hasta ahora en Fases 1-2: Next.js 16, Prisma (SQLite local),
motor de pujas y checkout/webhook con Lemon Squeezy (modo mock para local).

---

## 1. Pagos / cuenta (crítico, bloquea producción)

- [ ] Decidir proveedor final: **Lemon Squeezy** vs **Paddle** vs Stripe.
      Recomendación: LemonSqueezy o Paddle (merchant of record, alta sin papeleo).
- [ ] Crear cuenta y dar de alta producto "Puja en TopGames" con pricing
      **"Pay what you want"**, precio mínimo $5.
- [ ] Configurar webhooks (URL: `/api/webhooks/lemonsqueezy`) con secreto.
- [ ] Rellenar env vars: `LEMON_API_KEY`, `LEMON_STORE_ID`, `LEMON_VARIANT_ID`, `LEMON_WEBHOOK_SECRET`.
- [ ] Poner `PAYMENT_MOCK=0` y probar un pago real de $5.
- [ ] Si se elige Paddle: adaptar `src/lib/pay/lemonsqueezy.ts` (la tabla `Payment.provider`
      ya está preparada para múltiples proveedores).

## 2. Fase 3 — Frontend del leaderboard

- [ ] Página principal: hero + formulario de puja (URL, nombre, importe, botón «Outbid»).
- [ ] Tarjetas del ranking: cover, nombre, enlace, puja, posición, botón "claim".
- [ ] Secciones "Trending ahora" y "Actividad reciente" (feed de payouts).
- [ ] Páginas **/about** y **/rules** (calca el tono del original).
- [ ] SWR (ya instalado) para refrescar el ranking por polling.
- [ ] Diseño oscuro minimalista, favicon, metatags SEO.

## 3. Fase 4 — Deploy + dominio

- [ ] Crear DB Postgres (Neon o Vercel Postgres) y migrar el schema de SQLite → Postgres
      (con `prisma migrate`, adaptador `@prisma/adapter-pg`).
- [ ] Importar el repo en Vercel, setear env vars en producción.
- [ ] Comprar dominio (ej. `topgames.gg` / `.game` / `.lol`), configurar DNS + dominio en Vercel.
- [ ] KYC/datos bancarios si se cobra con Stripe (con MoR no hace falta).

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