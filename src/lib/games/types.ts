export interface Game {
  provider: string;
  providerGameId: string;
  name: string;
  slug?: string;
  coverUrl?: string;
  backgroundUrl?: string;
  releasedAt?: Date;
  description?: string;
  websiteUrl?: string;
  genres?: string[];
  platforms?: string[];
  stores?: Array<{ provider: string; url: string }>;
}

export interface GameProvider {
  searchGames(query: string): Promise<Game[]>;
  getGame(id: string): Promise<Game | null>;
  // Tiendas donde comprar con URL real (endpoint dedicado /games/{id}/stores).
  getStores?(id: string): Promise<Array<{ provider: string; url: string }>>;
}
