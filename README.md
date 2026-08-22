# topgames — topvideogames.lol

Leaderboard público de videojuegos donde el ranking lo decide tu puja: cada fila es
un juego y quien paga más se coloca más arriba. Sin anuncios, sin API keys, sin
revenue share. Clon de outbid.lol aplicado a videojuegos.

## Stack

- **Next.js 16** (App Router) + React 19 + Tailwind CSS 4
- **Prisma 7** + **PostgreSQL** (Neon, con pooler) — schema en `prisma/schema.prisma`
- **Lemon Squeezy** como merchant of record (checkout + webhook de pagos)
- **Upstash Redis** para rate-limit de `/api/bid` (fallback a memoria en local)
- **Vercel** para deploy, dominio `topvideogames.lol`, Analytics, sitemap y robots
- **Vitest** para tests unitarios (`src/**/*.test.ts`)

## Arquitectura

El ranking se calcula en tiempo real por el bid; nunca se almacena la posición. Los
montos se guardan en centimos (enteros) para evitar errores de floats.

```
src/
├── app/
│   ├── page.tsx            # leaderboard + formulario de puja
│   ├── rules/ about/       # páginas de contenido
│   ├── privacy/ terms/     # páginas legales
│   ├── api/
│   │   ├── bid/            # planifica la puja y crea el checkout LS
│   │   ├── board/          # JSON del ranking (SWR, refresh 10s)
│   │   ├── activity/       # feed de actividad reciente
│   │   ├── r/[key]/        # redirect de clicks (trackea visits)
│   │   └── webhooks/lemonsqueezy/  # aplica pagos confirmados
│   └── success/ canceled/  # resultado post-checkout
├── components/             # Leaderboard, BidForm, ActivityFeed, ThemeToggle
└── lib/
    ├── gaming/             # lógica de puja (planBid, urls, bloqueos)
    ├── pay/                # LemonSqueezy, aplicación de pagos, success token
    └── ratelimit.ts        # rate-limit por IP (Upstash / memoria)
```

## Puesta en marcha local

Requisitos: Node 20+, una DB Postgres (local via Docker o Neon).

```bash
npm install
cp .env.example .env        # y rellena los valores (ver seccion "Variables")
docker compose up -d db     # opcional: Postgres local (o usa Neon)
npm run db:seed             # siembra el board de ejemplo (borra lo que haya)
npm run dev                 # http://localhost:3000
```

Con `PAYMENT_MOCK=1` las pujas se aplican sin tarjeta (solo en local, nunca en
produccion). La DB y los pagos se configuran en `.env`.

### Tests

```bash
npm test                    # vitest (puja, urls/bloqueos, aplicacion de pagos)
```

## Variables de entorno

| Variable               | Descripcion                                                        |
| ---------------------- | ------------------------------------------------------------------ |
| `DATABASE_URL`         | Postgres con pooler (Neon). `sslmode=verify-full` recomendado.     |
| `LEMON_API_KEY`        | API key de Lemon Squeezy.                                          |
| `LEMON_STORE_ID`       | Store ID de Lemon Squeezy.                                         |
| `LEMON_VARIANT_ID`     | Variant ID del producto "Pay what you want" (min €5).              |
| `LEMON_WEBHOOK_SECRET` | Signing secret del webhook LS.                                     |
| `APP_URL`              | URL publica de la app (base de redirects y sitemap).               |
| `PAYMENT_MOCK`         | `1` = pagos simulados en local. En produccion siempre `0`.         |
| `KV_REST_API_URL`      | Upstash Redis (la integracion de Vercel la inyecta).               |
| `KV_REST_API_TOKEN`    | Token de Upstash Redis (idem).                                     |

## Deploy en Vercel

1. Importa el repo en Vercel y conecta el dominio `topvideogames.lol`.
2. En **Settings > Env Vars** (Production) define `DATABASE_URL`,
   `LEMON_API_KEY`, `LEMON_STORE_ID`, `LEMON_VARIANT_ID`, `LEMON_WEBHOOK_SECRET`,
   `APP_URL` y `PAYMENT_MOCK=0`. `PAYMENT_MOCK` nunca debe ser `1` en produccion.
3. Instala las integraciones **Neon**, **Upstash** y activa **Vercel Analytics**.
4. Aplica las migraciones a la DB de produccion:

   ```bash
   npm run db:deploy
   ```

5. En Lemon Squeezy registra el webhook hacia
   `https://topvideogames.lol/api/webhooks/lemonsqueezy` con su signing secret.
6. Verifica que el producto es "Pay what you want" con mínimo €5 (el código manda
   `custom_price` en cada checkout).

## Scripts

| Script           | Descripcion                                          |
| ---------------- | ---------------------------------------------------- |
| `npm run dev`    | servidor de desarrollo                               |
| `npm run build`  | build de produccion (`next build`)                   |
| `npm run start`  | sirve el build (`next start`)                        |
| `npm run lint`   | eslint                                               |
| `npm test`       | vitest                                               |
| `db:deploy`      | aplica migraciones a la DB (usar en produccion)      |
| `db:migrate`     | crea/aplica migraciones en dev                       |
| `db:seed`        | resetea el board con el seed de ejemplo              |
| `db:studio`      | Prisma Studio                                        |
