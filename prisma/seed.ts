// Seeder de lanzamiento: RESETEA el board y siembra 2 juegos "comprados" reales
// (Half-Life 2 €6, GTA V €5) para que la web se vea viva en produccion.
// Precios bajos para que cualquiera pueda robar el puesto con poco (viral).
// Ambos en Steam: la portada sale del header de la CDN, sin necesidad de RAWG.
// Se ejecuta con: npm run db:seed
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const games = [
  {
    key: "store.steampowered.com/app/220/half-life_2",
    name: "Half-Life 2",
    url: "https://store.steampowered.com/app/220/Half-Life_2/",
    coverUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/220/header.jpg",
    description: "The FPS that redefined physics, storytelling and level design.",
    bidCents: 600,
    clicks: 214,
  },
  {
    key: "store.steampowered.com/app/2715900/grand_theft_auto_v",
    name: "Grand Theft Auto V",
    url: "https://store.steampowered.com/app/2715900/Grand_Theft_Auto_V/",
    coverUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2715900/header.jpg",
    description: "Los Santos is waiting. The open-world crime sandbox of a decade.",
    bidCents: 500,
    clicks: 156,
  },
];

async function main() {
  // Borra todo el board (deleteMany cascade a payments) y siembra los 2 juegos.
  const deleted = await prisma.game.deleteMany();
  const wins = await Promise.all(
    games.map((g) =>
      prisma.game.create({
        data: g,
      }),
    ),
  );
  console.log(`Seed ok: borrados ${deleted.count} juegos, insertados ${wins.length}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());