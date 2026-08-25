import type { Game, GameProvider } from "./types";

const BASE = "https://api.rawg.io/api";
const PAGE_SIZE = 12;

function key(): string {
  const k = process.env.RAWG_API_KEY;
  if (!k) {
    throw new Error("RAWG_API_KEY no definida. Configurala en .env");
  }
  return k;
}

interface RawgListItem {
  id: number;
  name: string;
  slug: string;
  released?: string | null;
  background_image?: string | null;
  genres?: { name: string }[];
  platforms?: { platform: { name: string } }[];
}

interface RawgDetail extends RawgListItem {
  description_raw?: string | null;
  website?: string | null;
}

function mapList(raw: RawgListItem): Game {
  return {
    provider: "rawg",
    providerGameId: String(raw.id),
    name: raw.name,
    slug: raw.slug,
    coverUrl: raw.background_image ?? undefined,
    releasedAt: raw.released ? new Date(raw.released) : undefined,
    genres: raw.genres?.map((g) => g.name),
    platforms: raw.platforms?.map((p) => p.platform.name),
  };
}

function mapDetail(raw: RawgDetail): Game {
  return {
    ...mapList(raw),
    backgroundUrl: raw.background_image ?? undefined,
    description: raw.description_raw ?? undefined,
    websiteUrl: raw.website ?? undefined,
  };
}

export class RAWGGameProvider implements GameProvider {
  async searchGames(query: string): Promise<Game[]> {
    const url = new URL(`${BASE}/games`);
    url.searchParams.set("key", key());
    url.searchParams.set("search", query);
    url.searchParams.set("page_size", String(PAGE_SIZE));

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`RAWG search failed (${res.status})`);
    }
    const data = (await res.json()) as { results: RawgListItem[] };
    return (data.results ?? []).map(mapList);
  }

  async getGame(id: string): Promise<Game | null> {
    const url = new URL(`${BASE}/games/${id}`);
    url.searchParams.set("key", key());

    const res = await fetch(url.toString());
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`RAWG get failed (${res.status})`);
    }
    const raw = (await res.json()) as RawgDetail;
    return mapDetail(raw);
  }
}

export const rawgProvider = new RAWGGameProvider();
