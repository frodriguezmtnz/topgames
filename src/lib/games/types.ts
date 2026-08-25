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
}

export interface GameProvider {
  searchGames(query: string): Promise<Game[]>;
  getGame(id: string): Promise<Game | null>;
}
