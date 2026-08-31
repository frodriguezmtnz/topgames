// Seeder de desarrollo: RESETEA la DB y siembra juegos de ejemplo (proveedor 'rawg')
// con algunos votos, para ver el ranking y las fichas funcionando en local.
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
    provider: "rawg",
    providerGameId: "3328",
    name: "The Witcher 3: Wild Hunt",
    slug: "the-witcher-3-wild-hunt",
    coverUrl:
      "https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg",
    description:
      "Geralt of Rivia hunts monsters and searches for his adopted daughter across a vast open world.",
    websiteUrl: "https://thewitcher.com/en/witcher3",
    releasedAt: new Date("2015-05-19"),
  },
  {
    provider: "rawg",
    providerGameId: "3498",
    name: "Grand Theft Auto V",
    slug: "grand-theft-auto-v",
    coverUrl:
      "https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg",
    description: "An open-world crime sandbox set in Los Santos.",
    websiteUrl: "https://www.rockstargames.com/gta-v",
    releasedAt: new Date("2013-09-17"),
  },
  {
    provider: "rawg",
    providerGameId: "13537",
    name: "Half-Life 2",
    slug: "half-life-2",
    coverUrl:
      "https://media.rawg.io/media/games/b8c/b8c243eaa0fbac8115e0cdccac3f91dc.jpg",
    description: "The FPS that redefined physics, storytelling and level design.",
    websiteUrl: "https://www.half-life.com",
    releasedAt: new Date("2004-11-16"),
  },
];

async function main() {
  const deleted = await prisma.game.deleteMany();
  const wins = await Promise.all(
    games.map((g) =>
      prisma.game.create({
        data: g,
      }),
    ),
  );
  console.log(
    `Seed ok: borrados ${deleted.count} juegos, insertados ${wins.length}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
