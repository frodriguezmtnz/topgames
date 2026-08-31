# topgames — topvideogames.lol

Ranking global de videojuegos gratuito y comunitario donde **la comunidad decide** con
votos (1 usuario = 1 voto por juego). Sin cobrar por posiciones, sin boosts, sin venta
de votos. La monetizacion llega por **afiliacion** (enlaces a tiendas), separada de la
integridad del ranking.

## Stack

- **Next.js 16** (App Router) + React 19 + Tailwind CSS 4
- **Prisma 7** + **PostgreSQL** (Neon) — schema en `prisma/schema.prisma`
- **RAWG** como catalogo (GameProvider): se cachea en la DB local, no se consulta en
  cada page view
- **Upstash Redis** para rate-limit (fallback a memoria en local)
- **Resend** para emails de verificacion/reset (en dev se muestran por consola)
- **Vercel** para deploy, dominio `topvideogames.lol`, sitemap y robots
- **Vitest** para tests (`src/**/*.test.ts`)

> El codigo del modelo anterior (puja pagada + Lemon Squeezy + leaderboard por bid) se
> movio a `src/legacy/` y **no se compila ni se ejecuta**. Esta excluido de tsconfig,
> eslint y vitest.

## Arquitectura

```
RAWG → GameProvider → DB local → Ranking
```

- `GET /api/games/search?q=` consulta la DB local primero; si no hay resultados, va a RAWG
  y devuelve resultados **sin persistir**. El juego se importa (con sus tiendas) solo al
  abrir su ficha: `/games/:slug?rawg=<id>`. Así el catalogo no se llena de basura por
  busquedas.
- El ranking se calcula por `vote_count` (no se almacena posicion). Empates: mas votos →
  primero que lo alcanzo → ID interno.
- El conteo de votos se incrementa **server-side** en la misma transaccion que crea el
  `Vote`, con `UNIQUE(user_id, game_id)`: 1 voto por usuario y juego, sin duplicados.

```
src/
├── app/
│   ├── page.tsx               # ranking mundial
│   ├── games/[slug]           # ficha de juego (SEO, votos, where to buy, relacionados)
│   ├── out/[provider]/[slug]  # redirect de salida con tracking (afiliados)
│   ├── login register verify-email forgot-password reset-password
│   ├── api/
│   │   ├── auth/              # register, login, verify-email, forgot/reset, logout, me
│   │   ├── games/search       # busqueda + import desde RAWG
│   │   └── games/[id]/vote    # votar (server-side, rate-limited)
│   └── sitemap.ts robots.ts   # SEO
├── components/                # VoteButton, AuthForm, LogoutButton, ThemeToggle
└── lib/
    ├── auth/                  # password (scrypt), session, mail, validation
    ├── games/                 # GameProvider + RAWG, tipos
    ├── affiliate/             # providers, url (tag de afiliado), marketing (tracking)
    ├── votes/                 # servicio de voto (transaccion + constraint unico)
    ├── ratelimit.ts           # rate-limit por IP (Upstash / memoria)
    ├── db.ts                  # PrismaClient
    └── config.ts              # APP_URL
```

## Puesta en marcha local

Requisitos: Node 20+, una DB Postgres (local via Docker o Neon) y una API key de RAWG.

```bash
npm install
cp .env.example .env            # rellena DATABASE_URL, RAWG_API_KEY, APP_URL
npx prisma migrate dev          # aplica migraciones
npm run db:seed                 # siembra juegos de ejemplo
npm run dev                     # http://localhost:3000
```

Los emails de verificacion/reset se muestran por consola (`[Mail:dev]`) hasta que
configures `RESEND_API_KEY`. Para votar necesitas una cuenta con email verificado.

### Tests

```bash
npm test                        # vitest (password, affiliate, ...)
```

## Variables de entorno

| Variable            | Descripcion                                                     |
| ------------------- | --------------------------------------------------------------- |
| `DATABASE_URL`      | Postgres con pooler (Neon). `sslmode=verify-full` recomendado.  |
| `RAWG_API_KEY`      | API key de RAWG (catalogo).                                     |
| `APP_URL`           | URL publica (sitemap, OG, redirects, emails).                   |
| `RESEND_API_KEY`    | Envio de emails reales (opcional; sin ella, consola en dev).    |
| `MAIL_FROM`         | Remitente de los emails.                                        |
| `AFFILIATE_TAG_*`   | Tag de afiliado por proveedor (humble/amazon/xbox-store/...). Ver docs/. |
| `KV_REST_API_URL`   | Upstash Redis (rate-limit; opcional en local).                  |
| `KV_REST_API_TOKEN` | Token de Upstash Redis.                                         |

## Deploy en Vercel

1. Importa el repo y conecta el dominio `topvideogames.lol`.
2. En **Settings > Env Vars** define `DATABASE_URL`, `RAWG_API_KEY` y `APP_URL`.
3. Aplica las migraciones: `npm run db:deploy`.
4. Opcional: conecta upstash (rate-limit distribuido) y `RESEND_API_KEY` para emails.

## Scripts

| Script         | Descripcion                                     |
| -------------- | ----------------------------------------------- |
| `npm run dev`  | servidor de desarrollo                          |
| `npm run build`| build de produccion                             |
| `npm run start`| sirve el build                                  |
| `npm run lint` | eslint                                          |
| `npm test`     | vitest                                          |
| `db:migrate`   | crea/aplica migraciones en dev                  |
| `db:deploy`    | aplica migraciones en produccion                |
| `db:seed`      | resetea y siembra datos de ejemplo              |
| `db:studio`    | Prisma Studio                                   |