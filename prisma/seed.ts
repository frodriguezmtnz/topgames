// Seeder: puebla el ranking con juegos demo para ver la web con "look" real.
// Se ejecuta con: npm run db:seed
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const demos = [
  {
    key: "store.steampowered.com/app/2358720",
    name: "The Last of Us Part I",
    url: "https://store.steampowered.com/app/2358720/",
    coverUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg",
    description: "Survival horror en un Estados Unidos post-pandemico.",
    bidCents: 14018 * 100,
    clicks: 7670,
  },
  {
    key: "balatrogame.com",
    name: "Balatro",
    url: "https://balatrogame.com",
    description: "El roguelike de poker que lo peta todo.",
    bidCents: 13005 * 100,
    clicks: 8864,
    coverUrl: undefined,
  },
  {
    key: "store.steampowered.com/app/1145350",
    name: "Hades II",
    url: "https://store.steampowered.com/app/1145350/Hades_II/",
    description: "Roguelike mitologico, ya en Early Access.",
    bidCents: 12716 * 100,
    clicks: 11688,
    coverUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145350/header.jpg",
  },
  {
    key: "celestegame.shop",
    name: "Celeste",
    url: "https://celestegame.shop",
    description: "Plataformas de precision y autoaceptacion.",
    bidCents: 2001 * 100,
    clicks: 1260,
    coverUrl: undefined,
  },
  {
    key: "stardewvalley.net",
    name: "Stardew Valley",
    url: "https://www.stardewvalley.net",
    description: "Tu granja, tus reglas.",
    bidCents: 2000 * 100,
    clicks: 2284,
    coverUrl: undefined,
  },
  {
    key: "minecraft.net",
    name: "Minecraft",
    url: "https://www.minecraft.net",
    description: "El sandbox mas vendido del mundo.",
    bidCents: 501 * 100,
    clicks: 1255,
    coverUrl: undefined,
  },
  {
    key: "crossyroad.com",
    name: "Crossy Road",
    url: "https://crossyroad.com",
    description: "Atraviesa. Cruzando. Te atropellan.",
    bidCents: 500 * 100,
    clicks: 42,
    coverUrl: undefined,
  },
];

async function main() {
  const wins = await Promise.all(
    demos.map((d) =>
      prisma.game.upsert({
        where: { key: d.key },
        update: {
          name: d.name,
          url: d.url,
          coverUrl: d.coverUrl,
          description: d.description,
          bidCents: d.bidCents,
        },
        create: d,
      }),
    ),
  );
  console.log(`Seed ok: ${wins.length} juegos en el ranking.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());